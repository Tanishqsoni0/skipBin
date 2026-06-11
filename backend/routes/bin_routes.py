from flask import Blueprint, jsonify, request
import database.db as db
bin_bp = Blueprint("bin", __name__)

@bin_bp.route("/bins", methods=["GET"])
def get_bins():
    db.ensure_connection()
    db.cursor.execute("SELECT * FROM bin_types")
    bins = db.cursor.fetchall()

    return jsonify(bins)


@bin_bp.route("/bins", methods=["POST"])
def add_bin():
    db.ensure_connection()
    data = request.json

    db.cursor.execute(
        """
        INSERT INTO bin_types(size, base_price)
        VALUES(%s,%s)
        """,
        (
            data["size"],
            data["base_price"]
        )
    )

    db.conn.commit()

    return jsonify({
        "message":"Bin added"
    })


@bin_bp.route("/bins/<int:id>", methods=["PUT"])
def update_bin(id):
    db.ensure_connection()
    data = request.json

    db.cursor.execute(
        """
        UPDATE bin_types
        SET size=%s,
        base_price=%s
        WHERE bin_id=%s
        """,
        (
            data["size"],
            data["base_price"],
            id
        )
    )

    db.conn.commit()

    return jsonify({
        "message":"Bin updated"
    })


@bin_bp.route("/bins/<int:id>", methods=["DELETE"])
def delete_bin(id):
    db.ensure_connection()
    db.cursor.execute(
        """
        DELETE FROM bin_types
        WHERE bin_id=%s
        """,
        (id,)
    )

    db.conn.commit()

    return jsonify({
        "message":"Bin deleted"
    })