from flask import Blueprint
from flask import request
from flask import jsonify

from datetime import datetime
from datetime import timedelta

import database.db as db

from services.pricing_service import calculate_price

booking_bp = Blueprint(
    "booking",
    __name__
)

@booking_bp.route(
    "/bookings",
    methods=["GET"]
)
def get_bookings():
    db.ensure_connection()
    query = """
    SELECT
        b.booking_id,
        CONCAT(
    c.first_name,
    ' ',
    c.last_name
) AS full_name,
        bt.size,
        wt.waste_name,
        b.delivery_date,
        b.collection_date,
        b.status,
        b.total_amount
    FROM bookings b
    JOIN customers c
        ON b.customer_id=c.customer_id
    JOIN bin_types bt
        ON b.bin_id=bt.bin_id
    JOIN waste_types wt
        ON b.waste_id=wt.waste_id
    ORDER BY b.booking_id DESC
    """

    db.cursor.execute(query)

    return jsonify(
        db.cursor.fetchall()
    )


@booking_bp.route(
    "/bookings",
    methods=["POST"]
)
def create_booking():
    db.ensure_connection()
    data = request.json

    customer_id = data["customer_id"]

    bin_id = data["bin_id"]

    waste_id = data["waste_id"]

    delivery_address = data["delivery_address"]

    hire_weeks = int(
        data["hire_weeks"]
    )

    delivery_date = datetime.strptime(
        data["delivery_date"],
        "%Y-%m-%d"
    ).date()

    pricing = calculate_price(
        bin_id,
        waste_id,
        hire_weeks
    )

    collection_date = (
        delivery_date +
        timedelta(weeks=hire_weeks)
    )

    query = """
    INSERT INTO bookings
    (
        customer_id,
        bin_id,
        waste_id,
        delivery_address,
        delivery_date,
        collection_date,
        hire_weeks,
        status,
        total_amount,
        delivery_charge,
        waste_charge,
        discount_amount
    )
    VALUES
    (
        %s,%s,%s,%s,%s,%s,%s,
        'NEW',
        %s,%s,%s,%s
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
        pricing["total"],
        0,
        pricing["waste_charge"],
        0
    )

    db.cursor.execute(
        query,
        values
    )

    db.conn.commit()

    return jsonify({
        "message": "Booking Created",
        "collection_date": collection_date.isoformat(),
        "total_amount": pricing["total"]
    })

@booking_bp.route("/calculate-price", methods=["POST"])
def get_price():
    db.ensure_connection()
    data=request.json

    result=calculate_price(
        int(data["bin_id"]),
        int(data["waste_id"]),
        int(data["hire_weeks"]),
        data.get("delivery_address","")
    )

    return jsonify(result)


@booking_bp.route(
    "/my-bookings/<int:customer_id>",
    methods=["GET"]
)
def my_bookings(customer_id):
    db.ensure_connection()
    query = """
    SELECT
        b.booking_id,
        bt.size,
        wt.waste_name,
        b.delivery_date,
        b.collection_date,
        b.status,
        b.total_amount
    FROM bookings b
    JOIN bin_types bt
      ON b.bin_id = bt.bin_id
    JOIN waste_types wt
      ON b.waste_id = wt.waste_id
    WHERE b.customer_id = %s
    ORDER BY b.booking_id DESC
    """

    db.cursor.execute(
        query,
        (customer_id,)
    )

    return jsonify(
        db.cursor.fetchall()
    )


@booking_bp.route(
    "/collections/tomorrow",
    methods=["GET"]
)
def collections_tomorrow():
    db.ensure_connection()
    tomorrow = (
        datetime.now().date()
        + timedelta(days=1)
    )

    query = """
    SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) AS customer_name,

        bt.size,

        b.collection_date

    FROM bookings b

    JOIN customers c
      ON b.customer_id=c.customer_id

    JOIN bin_types bt
      ON b.bin_id=bt.bin_id

    WHERE
      b.collection_date=%s

    ORDER BY
      b.collection_date
    """

    db.cursor.execute(
        query,
        (tomorrow,)
    )

    return jsonify(
        db.cursor.fetchall()
    )

@booking_bp.route(
    "/bookings/<int:id>/status",
    methods=["PUT"]
)
def update_booking_status(id):
    db.ensure_connection()
    data=request.json

    db.cursor.execute(
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

    db.conn.commit()

    return jsonify({
        "message":"Status Updated"
    })