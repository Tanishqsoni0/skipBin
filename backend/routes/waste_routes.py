from flask import Blueprint, jsonify, request
from database.db import cursor, conn

waste_bp = Blueprint("waste", __name__)

@waste_bp.route("/waste-types", methods=["GET"])
def get_waste():

    cursor.execute(
        "SELECT * FROM waste_types"
    )

    waste = cursor.fetchall()

    return jsonify(waste)


@waste_bp.route("/waste-types", methods=["POST"])
def add_waste():

    data = request.json

    cursor.execute(
        """
        INSERT INTO waste_types(
        waste_name,
        extra_charge
        )
        VALUES(%s,%s)
        """,
        (
            data["waste_name"],
            data["extra_charge"]
        )
    )

    conn.commit()

    return jsonify({
        "message":"Waste type added"
    })