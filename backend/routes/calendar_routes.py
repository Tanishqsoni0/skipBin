from flask import Blueprint
from flask import jsonify

import database.db as db
calendar_bp = Blueprint(
    "calendar",
    __name__
)

@calendar_bp.route("/calendar")
def calendar_events():

    db.ensure_connection()
    db.cursor.execute("""
    SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) customer_name,

        bt.size,

        b.delivery_date,

        b.collection_date

    FROM bookings b

    JOIN customers c
    ON c.customer_id=b.customer_id

    JOIN bin_types bt
    ON bt.bin_id=b.bin_id

    ORDER BY b.delivery_date
    """)

    return jsonify(
        db.cursor.fetchall()
    )