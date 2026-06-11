from flask import Blueprint, request, jsonify

import database.db as db
contact_bp = Blueprint(
    "contact",
    __name__
)

@contact_bp.route(
    "/contact",
    methods=["POST"]
)
def send_message():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    try:

        db.ensure_connection()
        db.cursor.execute(
            """
            INSERT INTO contact_messages
            (
                name,
                email,
                message
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
            """,
            (
                name,
                email,
                message
            )
        )

        db.conn.commit()

        return jsonify({
            "message":
            "Message sent successfully"
        }), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500