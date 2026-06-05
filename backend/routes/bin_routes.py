from flask import Blueprint, jsonify, request
from database.db import cursor, conn

bin_bp = Blueprint("bin", __name__)

@bin_bp.route("/bins", methods=["GET"])
def get_bins():

    cursor.execute("SELECT * FROM bin_types")
    bins = cursor.fetchall()

    return jsonify(bins)


@bin_bp.route("/bins", methods=["POST"])
def add_bin():

    data = request.json

    cursor.execute(
        """
        INSERT INTO bin_types(size, base_price)
        VALUES(%s,%s)
        """,
        (
            data["size"],
            data["base_price"]
        )
    )

    conn.commit()

    return jsonify({
        "message":"Bin added"
    })


@bin_bp.route("/bins/<int:id>", methods=["PUT"])
def update_bin(id):

    data = request.json

    cursor.execute(
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

    conn.commit()

    return jsonify({
        "message":"Bin updated"
    })


@bin_bp.route("/bins/<int:id>", methods=["DELETE"])
def delete_bin(id):

    cursor.execute(
        """
        DELETE FROM bin_types
        WHERE bin_id=%s
        """,
        (id,)
    )

    conn.commit()

    return jsonify({
        "message":"Bin deleted"
    })