from flask import Blueprint, request, jsonify
from database.db import conn, cursor
from datetime import date, timedelta
from services.date_service import (
    calculate_collection_date
)

from services.pricing_service import (
    calculate_price
)

from services.loyalty_service import (
    is_loyalty_eligible
)
booking_bp = Blueprint("booking", __name__)
@booking_bp.route("/bookings",methods=["GET"])
def get_bookings():

    query = """
    SELECT

    b.booking_id,
    c.full_name,
    bt.size,
    wt.waste_name,

    b.delivery_date,
    b.collection_date,

    b.total_amount,
    b.status

    FROM bookings b

    JOIN customers c
    ON b.customer_id=c.customer_id

    JOIN bin_types bt
    ON b.bin_id=bt.bin_id

    JOIN waste_types wt
    ON b.waste_id=wt.waste_id
    """

    cursor.execute(query)

    bookings = cursor.fetchall()

    return jsonify(bookings)

@booking_bp.route("/bookings",methods=["POST"])
def create_booking():

    data = request.json

    customer_id = data["customer_id"]
    bin_id = data["bin_id"]
    waste_id = data["waste_id"]

    delivery_address = data["delivery_address"]
    delivery_date = data["delivery_date"]
    hire_weeks = data["hire_weeks"]

    # Get bin price

    cursor.execute(
        """
        SELECT base_price
        FROM bin_types
        WHERE bin_id=%s
        """,
        (bin_id,)
    )

    bin_data = cursor.fetchone()

    bin_price = float(
        bin_data["base_price"]
    )

    # Get waste charge

    cursor.execute(
        """
        SELECT extra_charge
        FROM waste_types
        WHERE waste_id=%s
        """,
        (waste_id,)
    )

    waste_data = cursor.fetchone()

    waste_charge = float(
        waste_data["extra_charge"]
    )

    from services.distance_service import get_delivery_charge

    distance_km = data["distance_km"]

    delivery_charge = get_delivery_charge(
        distance_km
    )

    pricing = calculate_price(
        bin_price,
        waste_charge,
        delivery_charge,
        hire_weeks
    )

    total_amount = pricing[
        "total_price"
    ]

    collection_date = (
        calculate_collection_date(
            delivery_date,
            hire_weeks
        )
    )
    if is_loyalty_eligible(customer_id):
        total_amount = (
            total_amount - bin_price
        )

    query = """
    INSERT INTO bookings(
        customer_id,
        bin_id,
        waste_id,
        delivery_address,
        delivery_date,
        collection_date,
        hire_weeks,
        delivery_charge,
        waste_charge,
        total_amount
    )
    VALUES(
        %s,%s,%s,%s,%s,%s,%s,%s,%s,%s
    )
    """

    values = (
        customer_id,
        bin_id,
        waste_id,
        delivery_address,
        delivery_date,
        collection_date,
        hire_weeks,
        delivery_charge,
        waste_charge,
        total_amount
    )

    cursor.execute(
        query,
        values
    )

    conn.commit()

    return jsonify({
        "message":"Booking created",
        "collection_date":collection_date,
        "total_amount":total_amount
    })
@booking_bp.route("/bookings/<int:id>/status",methods=["PUT"])
def update_status(id):

    data = request.json

    cursor.execute(
        """
        UPDATE bookings
        SET status=%s
        WHERE booking_id=%s
        """,
        (
            data["status"],
            id
        )
    )

    conn.commit()

    return jsonify({
        "message":"Status updated"
    })

@booking_bp.route("/bookings/<int:id>",methods=["GET"])
def get_booking(id):

    cursor.execute(
        """
        SELECT *
        FROM bookings
        WHERE booking_id=%s
        """,
        (id,)
    )

    booking = cursor.fetchone()

    return jsonify(booking)

@booking_bp.route("/collections/tomorrow",methods=["GET"])
def collections_tomorrow():

    tomorrow = date.today() + timedelta(days=1)

    cursor.execute(
        """
        SELECT *
        FROM bookings
        WHERE collection_date=%s
        """,
        (tomorrow,)
    )

    return jsonify(
        cursor.fetchall()
    )

@booking_bp.route("/deliveries/upcoming")
def upcoming_deliveries():

    cursor.execute(
        """
        SELECT *
        FROM bookings
        WHERE status='CONFIRMED'
        ORDER BY delivery_date
        """
    )

    return jsonify(
        cursor.fetchall()
    )

@booking_bp.route("/hires/active")
def active_hires():

    cursor.execute(
        """
        SELECT *
        FROM bookings
        WHERE status='ACTIVE'
        """
    )

    return jsonify(
        cursor.fetchall()
    )