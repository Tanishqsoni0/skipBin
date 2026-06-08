from flask import Blueprint
from flask import request
from flask import jsonify

from services.pricing_service import calculate_price

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
        int(data["bin_id"]),
        int(data["waste_id"]),
        int(data["hire_weeks"])
    )

    return jsonify(result)