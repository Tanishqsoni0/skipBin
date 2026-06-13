from flask import Blueprint, jsonify, request
from database.db import get_pool_connection

waste_bp = Blueprint("waste", __name__)


@waste_bp.route("/waste-types", methods=["GET"])
def get_waste():
    conn, cursor = get_pool_connection()
    try:
        cursor.execute("SELECT * FROM waste_types")
        return jsonify(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()


@waste_bp.route("/waste-types", methods=["POST"])
def add_waste():
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "INSERT INTO waste_types (waste_name, extra_charge) VALUES (%s, %s)",
            (data["waste_name"], data["extra_charge"]),
        )
        conn.commit()
        return jsonify({"message": "Waste type added"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@waste_bp.route("/waste-types/<int:id>", methods=["PUT"])
def update_waste_type(id):
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "UPDATE waste_types SET waste_name=%s, extra_charge=%s WHERE waste_id=%s",
            (data["waste_name"], data["extra_charge"], id),
        )
        conn.commit()
        return jsonify({"message": "Waste Type Updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@waste_bp.route("/waste-types/<int:id>", methods=["DELETE"])
def delete_waste_type(id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute("DELETE FROM waste_types WHERE waste_id=%s", (id,))
        conn.commit()
        return jsonify({"message": "Waste Type Deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()