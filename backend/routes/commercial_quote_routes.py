from flask import Blueprint,request,jsonify
import database.db as db

commercial_quote_bp = Blueprint(
    "commercial_quote",
    __name__
)

@commercial_quote_bp.route(
    "/commercial-quotes",
    methods=["POST"]
)
def create_quote():

    db.ensure_connection()

    data = request.json

    db.cursor.execute(
        """
        INSERT INTO commercial_quotes(

            company_name,
            contact_person,
            email,
            phone,
            project_location,
            bin_size,
            waste_type,
            requirements

        )
        VALUES(
            %s,%s,%s,%s,%s,%s,%s,%s
        )
        """,
        (
            data["company_name"],
            data["contact_person"],
            data["email"],
            data["phone"],
            data["project_location"],
            data["bin_size"],
            data["waste_type"],
            data["requirements"]
        )
    )

    db.conn.commit()

    return jsonify({
        "message":
        "Quote request submitted successfully"
    })


@commercial_quote_bp.route(
    "/admin/commercial",
    methods=["GET"]
)
def get_quotes():

    db.ensure_connection()

    db.cursor.execute(
        """
        SELECT *
        FROM commercial_quotes
        ORDER BY quote_id DESC
        """
    )

    quotes = db.cursor.fetchall()

    return jsonify(quotes)

@commercial_quote_bp.route(
    "/admin/commercial/<int:id>",
    methods=["PUT"]
)
def update_quote_status(id):

    data = request.get_json()

    status = data.get("status")

    db.ensure_connection()

    db.cursor.execute(
        """
        UPDATE commercial_quotes
        SET status=%s
        WHERE quote_id=%s
        """,
        (status,id)
    )

    db.conn.commit()

    return jsonify({
        "message":"Status updated"
    })