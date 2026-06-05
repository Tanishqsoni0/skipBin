from flask import Blueprint, request, jsonify
from services.pricing_service import calculate_price

pricing_bp = Blueprint(
    "pricing",
    __name__
)

@pricing_bp.route("/calculate-price",methods=["POST"])
def calculate():

    data = request.json

    total = calculate_price(
        data["bin_price"],
        data["waste_charge"],
        data["delivery_charge"],
        data["extension_charge"],
        data["discount"]
    )

    return jsonify({
        "total_price": total
    })