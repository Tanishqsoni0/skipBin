from flask import Blueprint, jsonify, request
from database.db import get_pool_connection

promotion_bp = Blueprint("promotion", __name__)


@promotion_bp.route("/promotions", methods=["GET"])
def get_promotions():
    conn, cursor = get_pool_connection()
    try:
        cursor.execute("SELECT * FROM promotions ORDER BY promo_id DESC")
        return jsonify(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()


@promotion_bp.route("/promotions/active", methods=["GET"])
def get_active_promotions():
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            """
            SELECT promo_id, promo_name, discount_type, discount_value, start_date, end_date
            FROM promotions
            WHERE active = 1
            AND CURDATE() BETWEEN start_date AND end_date
            ORDER BY promo_id DESC
            """
        )
        return jsonify(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()


@promotion_bp.route("/promotions", methods=["POST"])
def add_promotion():
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            """
            INSERT INTO promotions
                (promo_name, discount_type, discount_value, start_date, end_date, active)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                data["promo_name"], data["discount_type"], data["discount_value"],
                data["start_date"], data["end_date"], data["active"],
            ),
        )
        conn.commit()
        return jsonify({"message": "Promotion Added"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@promotion_bp.route("/promotions/<int:promo_id>", methods=["PUT"])
def update_promotion(promo_id):
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            """
            UPDATE promotions
            SET promo_name=%s, discount_type=%s, discount_value=%s,
                start_date=%s, end_date=%s, active=%s
            WHERE promo_id=%s
            """,
            (
                data["promo_name"], data["discount_type"], data["discount_value"],
                data["start_date"], data["end_date"], data["active"], promo_id,
            ),
        )
        conn.commit()
        return jsonify({"message": "Promotion Updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@promotion_bp.route("/promotions/<int:promo_id>", methods=["DELETE"])
def delete_promotion(promo_id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute("DELETE FROM promotions WHERE promo_id=%s", (promo_id,))
        conn.commit()
        return jsonify({"message": "Promotion Deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()