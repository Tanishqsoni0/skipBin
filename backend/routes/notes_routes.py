from flask import Blueprint
from flask import request
from flask import jsonify

from database.db import (
    cursor,
    conn
)

notes_bp = Blueprint(
    "notes",
    __name__
)

@notes_bp.route("/customers/<int:id>/notes",methods=["POST"])
def add_note(id):

    data=request.json

    cursor.execute(
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

    conn.commit()

    return jsonify({
        "message":"Note added"
    })

