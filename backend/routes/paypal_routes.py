# routes/paypal_routes.py
# POST /api/payment/create   — creates PayPal order using existing pricing_service
# POST /api/payment/capture  — captures payment and saves booking to DB

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import get_db
from services.paypal_service import create_order, capture_order
from services.pricing_service import calculate_price
from services.date_service import calculate_collection_date
from services.loyalty_service import is_loyalty_eligible
import uuid

paypal_bp = Blueprint("paypal", __name__, url_prefix="/api/payment")


def make_error(message, status=400):
    return jsonify({"success": False, "error": message}), status

def make_ok(data, status=200):
    return jsonify({"success": True, **data}), status


# ── CREATE ORDER ──────────────────────────────────────────────────────────────
# Called when customer clicks "COMPLETE BOOKING"
# Uses your existing pricing_service (already calculates delivery from address)

@paypal_bp.route("/create", methods=["POST"])
@jwt_required()
def create_payment():
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid request")

    customer_id      = int(get_jwt_identity())
    bin_id           = data.get("bin_id")
    waste_id         = data.get("waste_id")
    hire_weeks       = int(data.get("hire_weeks", 1))
    delivery_address = data.get("delivery_address", "")
    delivery_date    = data.get("delivery_date", "")

    if not all([bin_id, waste_id, delivery_address, delivery_date]):
        return make_error("All booking fields are required")

    try:
        # ── Use your existing pricing_service (handles distance from address) ──
        pricing = calculate_price(
            int(bin_id),
            int(waste_id),
            hire_weeks,
            delivery_address
        )

        total_amount    = pricing["total"]
        delivery_charge = pricing["delivery_charge"]
        waste_charge    = pricing["waste_charge"]
        bin_price       = pricing["base_price"]
        extension_fee   = pricing["extension_fee"]

        # ── Apply loyalty discount if eligible ────────────────────────────────
        discount = 0
        if is_loyalty_eligible(customer_id):
            discount     = bin_price
            total_amount = total_amount - bin_price

        collection_date = calculate_collection_date(delivery_date, hire_weeks)
        booking_ref     = f"JB-{uuid.uuid4().hex[:8].upper()}"

        # ── Create PayPal order ───────────────────────────────────────────────
        order           = create_order(total_amount, booking_ref)
        paypal_order_id = order["id"]

        # ── Save pending booking (temporary until payment confirmed) ──────────
        conn = get_db()
        try:
            cursor = conn.cursor(dictionary=True)
            cursor.execute(
                """
                INSERT INTO pending_bookings (
                    paypal_order_id, booking_ref, customer_id,
                    bin_id, waste_id, delivery_address,
                    delivery_date, collection_date, hire_weeks,
                    bin_price, waste_charge, delivery_charge,
                    discount_amount, total_amount
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    paypal_order_id, booking_ref, customer_id,
                    bin_id, waste_id, delivery_address,
                    delivery_date, collection_date, hire_weeks,
                    bin_price, waste_charge, delivery_charge,
                    discount, total_amount,
                ),
            )
            conn.commit()
        finally:
            conn.close()

        return make_ok({
            "paypal_order_id": paypal_order_id,
            "booking_ref":     booking_ref,
            "total_amount":    total_amount,
            "collection_date": str(collection_date),
            "pricing":         pricing,
            "loyalty_discount": discount,
        })

    except Exception as e:
        return make_error(f"Could not create payment: {str(e)}", 500)


# ── CAPTURE PAYMENT + SAVE BOOKING ───────────────────────────────────────────
# Called after customer approves payment in PayPal window

@paypal_bp.route("/capture", methods=["POST"])
@jwt_required()
def capture_payment():
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid request")

    paypal_order_id = data.get("paypal_order_id")
    if not paypal_order_id:
        return make_error("paypal_order_id is required")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)

        # Get the pending booking
        cursor.execute(
            "SELECT * FROM pending_bookings WHERE paypal_order_id = %s",
            (paypal_order_id,)
        )
        pending = cursor.fetchone()
        if not pending:
            return make_error("Booking not found", 404)

        # Capture payment with PayPal
        capture_result = capture_order(paypal_order_id)
        if capture_result.get("status") != "COMPLETED":
            return make_error(f"Payment not completed: {capture_result.get('status')}", 402)

        # Save confirmed booking to main bookings table
        cursor.execute(
            """
            INSERT INTO bookings (
                customer_id, bin_id, waste_id, delivery_address,
                delivery_date, collection_date, hire_weeks,
                delivery_charge, waste_charge, discount_amount,
                total_amount, status
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'NEW')
            """,
            (
                pending["customer_id"], pending["bin_id"],
                pending["waste_id"],    pending["delivery_address"],
                pending["delivery_date"], pending["collection_date"],
                pending["hire_weeks"],  pending["delivery_charge"],
                pending["waste_charge"], pending["discount_amount"],
                pending["total_amount"],
            ),
        )
        booking_id = cursor.lastrowid

        # Increment loyalty count
        cursor.execute(
            "UPDATE customers SET loyalty_count = loyalty_count + 1 WHERE customer_id = %s",
            (pending["customer_id"],)
        )

        # Clean up pending booking
        cursor.execute(
            "DELETE FROM pending_bookings WHERE paypal_order_id = %s",
            (paypal_order_id,)
        )

        conn.commit()

        return make_ok({
            "message":         "Payment confirmed and booking saved!",
            "booking_id":      booking_id,
            "booking_ref":     pending["booking_ref"],
            "collection_date": str(pending["collection_date"]),
            "total_amount":    float(pending["total_amount"]),
        })

    except Exception as e:
        conn.rollback()
        return make_error(f"Capture failed: {str(e)}", 500)
    finally:
        conn.close()