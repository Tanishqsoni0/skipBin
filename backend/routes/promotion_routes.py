from flask import Blueprint,jsonify,request
from database.db import cursor,conn

promotion_bp = Blueprint(
    "promotion",
    __name__
)

@promotion_bp.route("/promotions",methods=["GET"])
def get_promotions():

    cursor.execute(
        "SELECT * FROM promotions"
    )

    return jsonify(
        cursor.fetchall()
    )

@promotion_bp.route("/promotions",methods=["POST"])
def add_promotion():

    data=request.json

    cursor.execute(
        """
        INSERT INTO promotions(
        promo_name,
        discount_type,
        discount_value,
        start_date,
        end_date
        )
        VALUES(%s,%s,%s,%s,%s)
        """,
        (
            data["promo_name"],
            data["discount_type"],
            data["discount_value"],
            data["start_date"],
            data["end_date"]
        )
    )

    conn.commit()

    return jsonify({
        "message":"Promotion created"
    })