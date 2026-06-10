from flask import Blueprint,request,jsonify
from database.db import cursor,conn,ensure_connection

distance_bp = Blueprint(
    "distance_bp",
    __name__
)

@distance_bp.route(
    "/distance-charges",
    methods=["GET"]
)
def get_distance_charges():

    ensure_connection()
    cursor.execute("""
        SELECT *
        FROM distance_charges
        ORDER BY min_km
    """)

    return jsonify(
        cursor.fetchall()
    )

@distance_bp.route(
    "/distance-charges",
    methods=["POST"]
)
def add_distance_charge():

    ensure_connection()
    data = request.json

    cursor.execute(
        """
        INSERT INTO distance_charges
        (
            min_km,
            max_km,
            charge
        )
        VALUES
        (%s,%s,%s)
        """,
        (
            data["min_km"],
            data["max_km"],
            data["charge"]
        )
    )

    conn.commit()

    return jsonify({
        "message":"Added"
    })

@distance_bp.route(
    "/distance-charges/<int:id>",
    methods=["PUT"]
)
def update_distance_charge(id):

    ensure_connection()
    data = request.json

    cursor.execute(
        """
        UPDATE distance_charges
        SET
        min_km=%s,
        max_km=%s,
        charge=%s
        WHERE distance_id=%s
        """,
        (
            data["min_km"],
            data["max_km"],
            data["charge"],
            id
        )
    )

    conn.commit()

    return jsonify({
        "message":"Updated"
    })

@distance_bp.route(
    "/distance-charges/<int:id>",
    methods=["DELETE"]
)
def delete_distance_charge(id):

    ensure_connection()
    cursor.execute(
        """
        DELETE FROM distance_charges
        WHERE distance_id=%s
        """,
        (id,)
    )

    conn.commit()

    return jsonify({
        "message":"Deleted"
    })

