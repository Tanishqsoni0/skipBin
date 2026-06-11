from flask import Blueprint
from flask import request
from flask import jsonify

from services.pricing_service import calculate_price
import database.db as db
pricing_bp = Blueprint(
    "pricing",
    __name__
)

@pricing_bp.route(
    "/calculate-price",
    methods=["POST"]
)
def calculate():

    data = request.json

    result = calculate_price(
        int(data["customer_id"]),
        int(data["bin_id"]),
        int(data["waste_id"]),
        int(data["hire_weeks"]),
        data.get("delivery_address", "")
    )

    return jsonify(result)


@pricing_bp.route(
    "/hire-pricing",
    methods=["GET"]
)
def get_hire_pricing():

    db.ensure_connection()
    db.cursor.execute(
        """
        SELECT extension_fee
        FROM hire_pricing
        LIMIT 1
        """
    )

    return jsonify(
        db.cursor.fetchone()
    )

@pricing_bp.route(
    "/hire-pricing",
    methods=["PUT"]
)
def update_hire_pricing():

    data=request.json
    db.ensure_connection()

    db.cursor.execute(
        """
        UPDATE hire_pricing
        SET extension_fee=%s
        WHERE id=1
        """,
        (
            data["extension_fee"],
        )
    )

    db.conn.commit()

    return jsonify({
        "message":
        "Extension Pricing Updated"
    })