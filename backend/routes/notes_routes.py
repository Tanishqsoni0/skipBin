from flask import Blueprint
from flask import request
from flask import jsonify

import database.db as db

notes_bp = Blueprint(
    "notes",
    __name__
)

@notes_bp.route("/customers/<int:id>/notes",methods=["POST"])
def add_note(id):
    db.ensure_connection()
    data=request.json

    db.cursor.execute(
        """
        INSERT INTO customer_notes(
        customer_id,
        note
        )
        VALUES(%s,%s)
        """,
        (
            id,
            data["note"]
        )
    )

    db.conn.commit()

    return jsonify({
        "message":"Note added"
    })

