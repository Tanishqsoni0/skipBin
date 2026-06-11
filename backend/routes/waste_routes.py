from flask import Blueprint, jsonify, request
import database.db as db
waste_bp = Blueprint("waste", __name__)

@waste_bp.route("/waste-types", methods=["GET"])
def get_waste():
    db.ensure_connection()
    db.cursor.execute(
        "SELECT * FROM waste_types"
    )

    waste = db.cursor.fetchall()

    return jsonify(waste)


@waste_bp.route("/waste-types", methods=["POST"])
def add_waste():

    data = request.json

    db.cursor.execute(
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

    db.conn.commit()

    return jsonify({
        "message":"Waste type added"
    })
@waste_bp.route("/waste-types/<int:id>", methods=["PUT"])
def update_waste_type(id):
    db.ensure_connection()      
    data = request.json

    db.cursor.execute(
        """
        UPDATE waste_types
        SET
        waste_name=%s,
        extra_charge=%s
        WHERE waste_id=%s
        """,
        (
            data["waste_name"],
            data["extra_charge"],
            id
        )
    )

    db.conn.commit()

    return jsonify({
        "message":"Waste Type Updated"
    })

@waste_bp.route("/waste-types/<int:id>", methods=["DELETE"])
def delete_waste_type(id):
    db.ensure_connection()
    db.cursor.execute(
        """
        DELETE FROM waste_types
        WHERE waste_id=%s
        """,
        (id,)
    )

    db.conn.commit()

    return jsonify({
        "message":"Waste Type Deleted"
    })