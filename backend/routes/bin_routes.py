from flask import Blueprint, jsonify, request
from database.db import get_pool_connection

bin_bp = Blueprint("bin", __name__)


@bin_bp.route("/bins", methods=["GET"])
def get_bins():
    conn, cursor = get_pool_connection()
    try:
        cursor.execute("SELECT * FROM bin_types")
        return jsonify(cursor.fetchall())
    finally:
        cursor.close()
        conn.close()


@bin_bp.route("/bins", methods=["POST"])
def add_bin():
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "INSERT INTO bin_types (size, base_price) VALUES (%s, %s)",
            (data["size"], data["base_price"]),
        )
        conn.commit()
        return jsonify({"message": "Bin added"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bin_bp.route("/bins/<int:id>", methods=["PUT"])
def update_bin(id):
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "UPDATE bin_types SET size=%s, base_price=%s WHERE bin_id=%s",
            (data["size"], data["base_price"], id),
        )
        conn.commit()
        return jsonify({"message": "Bin updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@bin_bp.route("/bins/<int:id>", methods=["DELETE"])
def delete_bin(id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute("DELETE FROM bin_types WHERE bin_id=%s", (id,))
        conn.commit()
        return jsonify({"message": "Bin deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()