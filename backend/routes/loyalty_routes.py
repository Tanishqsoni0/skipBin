from flask import Blueprint, jsonify
from services.loyalty_service import is_loyalty_eligible

loyalty_bp = Blueprint(
    "loyalty",
    __name__
)

@loyalty_bp.route("/loyalty/<int:id>",methods=["GET"])
def loyalty(id):

    return jsonify({
        "eligible": is_loyalty_eligible(id)
    })