# routes/paypal_routes.py
# Handles:
#   POST /api/payment/calculate   — calculates price preview before payment
#   POST /api/payment/create      — creates a PayPal order, returns order_id
#   POST /api/payment/capture     — captures payment, then saves booking to DB

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import get_db
from services.paypal_service import create_order, capture_order
from services.pricing_service import calculate_price
from services.distance_service import get_delivery_charge
from services.date_service import calculate_collection_date
from services.loyalty_service import is_loyalty_eligible
import uuid

paypal_bp = Blueprint("paypal", __name__, url_prefix="/api/payment")


def make_error(message, status=400):
    return jsonify({"success": False, "error": message}), status

def make_ok(data, status=200):
    return jsonify({"success": True, **data}), status


# ── CALCULATE (price preview before payment) ──────────────────────────────────
# Frontend calls this when user fills the form to show them the price breakdown
# before they hit "Proceed to Payment"

@paypal_bp.route("/calculate", methods=["POST"])
@jwt_required()
def calculate():
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid request")

    customer_id = get_jwt_identity()
    bin_id      = data.get("bin_id")
    waste_id    = data.get("waste_id")
    hire_weeks  = int(data.get("hire_weeks", 1))
    distance_km = float(data.get("distance_km", 0))

    if not bin_id or not waste_id:
        return make_error("bin_id and waste_id are required")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT base_price, size FROM bin_types WHERE bin_id = %s", (bin_id,))
        bin_data = cursor.fetchone()
        if not bin_data:
            return make_error("Bin not found")

        cursor.execute("SELECT extra_charge, waste_name FROM waste_types WHERE waste_id = %s", (waste_id,))
        waste_data = cursor.fetchone()
        if not waste_data:
            return make_error("Waste type not found")

        bin_price       = float(bin_data["base_price"])
        waste_charge    = float(waste_data["extra_charge"])
        delivery_charge = get_delivery_charge(distance_km)
        discount        = 0

        # Check loyalty — if eligible, bin hire is free
        loyalty_eligible = is_loyalty_eligible(int(customer_id))
        if loyalty_eligible:
            discount = bin_price

        pricing = calculate_price(bin_price, waste_charge, delivery_charge, hire_weeks, discount)

        return make_ok({
            "bin_size":         bin_data["size"],
            "waste_name":       waste_data["waste_name"],
            "bin_price":        bin_price,
            "waste_charge":     waste_charge,
            "delivery_charge":  delivery_charge,
            "extension_charge": pricing["extension_charge"],
            "discount":         discount,
            "loyalty_eligible": loyalty_eligible,
            "total_amount":     pricing["total_price"],
            "hire_weeks":       hire_weeks,
        })

    except Exception as e:
        return make_error(str(e), 500)
    finally:
        conn.close()


# ── CREATE PAYPAL ORDER ───────────────────────────────────────────────────────
# Frontend calls this when user clicks "Proceed to Payment"
# Returns a PayPal order_id which the frontend uses to open the PayPal window

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
    distance_km      = float(data.get("distance_km", 0))
    delivery_address = data.get("delivery_address", "")
    delivery_date    = data.get("delivery_date", "")

    if not all([bin_id, waste_id, delivery_address, delivery_date]):
        return make_error("All booking fields are required")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT base_price FROM bin_types WHERE bin_id = %s", (bin_id,))
        bin_data  = cursor.fetchone()
        bin_price = float(bin_data["base_price"])

        cursor.execute("SELECT extra_charge FROM waste_types WHERE waste_id = %s", (waste_id,))
        waste_data   = cursor.fetchone()
        waste_charge = float(waste_data["extra_charge"])

        delivery_charge  = get_delivery_charge(distance_km)
        discount         = bin_price if is_loyalty_eligible(customer_id) else 0
        pricing          = calculate_price(bin_price, waste_charge, delivery_charge, hire_weeks, discount)
        total_amount     = pricing["total_price"]
        collection_date  = calculate_collection_date(delivery_date, hire_weeks)

        # Generate a unique booking reference (used to match payment to booking)
        booking_ref = f"JB-{uuid.uuid4().hex[:8].upper()}"

        # Create PayPal order
        order = create_order(total_amount, booking_ref)
        paypal_order_id = order["id"]

        # Store pending booking details in DB so we can save it after payment
        cursor.execute(
            """
            INSERT INTO pending_bookings (
                paypal_order_id, booking_ref, customer_id, bin_id, waste_id,
                delivery_address, delivery_date, collection_date, hire_weeks,
                bin_price, waste_charge, delivery_charge, discount_amount, total_amount
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                paypal_order_id, booking_ref, customer_id, bin_id, waste_id,
                delivery_address, delivery_date, collection_date, hire_weeks,
                bin_price, waste_charge, delivery_charge, discount, total_amount,
            ),
        )
        conn.commit()

        return make_ok({
            "paypal_order_id": paypal_order_id,
            "booking_ref":     booking_ref,
            "total_amount":    total_amount,
            "collection_date": collection_date,
        })

    except Exception as e:
        conn.rollback()
        return make_error(f"Could not create payment: {str(e)}", 500)
    finally:
        conn.close()


# ── CAPTURE PAYMENT + SAVE BOOKING ───────────────────────────────────────────
# Frontend calls this after PayPal JS SDK confirms the customer approved payment
# This captures the money and saves the booking to the main bookings table

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

        # Get pending booking
        cursor.execute(
            "SELECT * FROM pending_bookings WHERE paypal_order_id = %s",
            (paypal_order_id,)
        )
        pending = cursor.fetchone()
        if not pending:
            return make_error("Booking not found", 404)

        # Capture the payment with PayPal
        capture_result = capture_order(paypal_order_id)
        capture_status = capture_result.get("status")

        if capture_status != "COMPLETED":
            return make_error(f"Payment not completed. Status: {capture_status}", 402)

        # Payment confirmed — save booking to main bookings table
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
                pending["customer_id"],
                pending["bin_id"],
                pending["waste_id"],
                pending["delivery_address"],
                pending["delivery_date"],
                pending["collection_date"],
                pending["hire_weeks"],
                pending["delivery_charge"],
                pending["waste_charge"],
                pending["discount_amount"],
                pending["total_amount"],
            ),
        )
        booking_id = cursor.lastrowid

        # Update loyalty count for customer
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
            "message":        "Payment confirmed and booking saved!",
            "booking_id":     booking_id,
            "booking_ref":    pending["booking_ref"],
            "collection_date": str(pending["collection_date"]),
            "total_amount":   float(pending["total_amount"]),
        })

    except Exception as e:
        conn.rollback()
        return make_error(f"Capture failed: {str(e)}", 500)
    finally:
        conn.close()
