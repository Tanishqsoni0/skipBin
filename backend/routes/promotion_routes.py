from flask import Blueprint,jsonify,request
import database.db as db
promotion_bp = Blueprint(
    "promotion",
    __name__
)

@promotion_bp.route("/promotions",methods=["GET"])
def get_promotions():
    db.ensure_connection()

    db.cursor.execute(
        """SELECT * FROM promotions
        ORDER BY promo_id DESC
        """
    )

    return jsonify(
        db.cursor.fetchall()
    )

@promotion_bp.route("/promotions", methods=["POST"])
def add_promotion():

    data=request.json

    db.ensure_connection()

    db.cursor.execute(
        """
        INSERT INTO promotions
        (
            promo_name,
            discount_type,
            discount_value,
            start_date,
            end_date,
            active
        )
        VALUES
        (
            %s,%s,%s,%s,%s,%s
        )
        """,
        (
            data["promo_name"],
            data["discount_type"],
            data["discount_value"],
            data["start_date"],
            data["end_date"],
            data["active"]
        )
    )

    db.conn.commit()

    return jsonify({
        "message":"Promotion Added"
    })


@promotion_bp.route(
    "/promotions/<int:promo_id>",
    methods=["PUT"]
)
def update_promotion(promo_id):

    data=request.json

    db.ensure_connection()

    db.cursor.execute(
        """
        UPDATE promotions
        SET
            promo_name=%s,
            discount_type=%s,
            discount_value=%s,
            start_date=%s,
            end_date=%s,
            active=%s
        WHERE promo_id=%s
        """,
        (
            data["promo_name"],
            data["discount_type"],
            data["discount_value"],
            data["start_date"],
            data["end_date"],
            data["active"],
            promo_id
        )
    )

    db.conn.commit()

    return jsonify({
        "message":"Promotion Updated"
    })

@promotion_bp.route(
    "/promotions/<int:promo_id>",
    methods=["DELETE"]
)
def delete_promotion(promo_id):

    db.ensure_connection()

    db.cursor.execute(
        """
        DELETE FROM promotions
        WHERE promo_id=%s
        """,
        (promo_id,)
    )

    db.conn.commit()

    return jsonify({
        "message":"Promotion Deleted"
    })