from flask import Blueprint, request, jsonify
from database.db import conn, cursor, ensure_connection

customer_bp = Blueprint("customer", __name__)

# Get all customers
@customer_bp.route("/customers", methods=["GET"])
def get_customers():

    query = """
    SELECT

        c.customer_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) AS full_name,

        c.mobile,

        c.email,

        c.address,

        c.loyalty_count,

        COUNT(
            b.booking_id
        ) AS total_bookings,

        COALESCE(
            SUM(
                b.total_amount
            ),
            0
        ) AS total_spend

    FROM customers c

    LEFT JOIN bookings b
        ON c.customer_id = b.customer_id

    GROUP BY
        c.customer_id

    ORDER BY
        c.customer_id DESC
    """

    cursor.execute(query)

    return jsonify(
        cursor.fetchall()
    )

# Get customer by id
@customer_bp.route("/customers/<int:id>", methods=["GET"])
def get_customer(id):
    cursor.execute(
        "SELECT * FROM customers WHERE customer_id=%s",
        (id,)
    )

    customer = cursor.fetchone()

    if not customer:
        return jsonify({"message":"Customer not found"}),404

    return jsonify(customer)

# Add customer
@customer_bp.route("/customers", methods=["POST"])
def add_customer():

    data = request.json

    full_name = data.get(
        "full_name",
        ""
    ).strip()

    parts = full_name.split()

    first_name = (
        parts[0]
        if len(parts) > 0
        else ""
    )

    last_name = (
        " ".join(parts[1:])
        if len(parts) > 1
        else ""
    )

    query = """
    INSERT INTO customers(
        first_name,
        last_name,
        mobile,
        email,
        password_hash
    )
    VALUES(%s,%s,%s,%s,%s)
    """

    cursor.execute(
        query,
        (
            first_name,
            last_name,
            data["mobile"],
            data["email"],
            "temp123"
        )
    )

    conn.commit()

    return jsonify({
        "message":"Customer added"
    })

@customer_bp.route("/customers/<int:id>", methods=["PUT"])
def update_customer(id):

    data = request.json

    query = """
    UPDATE customers
    SET
    full_name=%s,
    mobile=%s,
    email=%s,
    address=%s
    WHERE customer_id=%s
    """

    values = (
        data["full_name"],
        data["mobile"],
        data["email"],
        data["address"],
        id
    )

    cursor.execute(query, values)
    conn.commit()

    return jsonify({
        "message":"Customer updated"
    })


@customer_bp.route("/customers/<int:id>", methods=["DELETE"])
def delete_customer(id):

    cursor.execute(
        "DELETE FROM customers WHERE customer_id=%s",
        (id,)
    )

    conn.commit()

    return jsonify({
        "message":"Customer deleted"
    })

@customer_bp.route(
    "/customers/search/<mobile>",
    methods=["GET"]
)
def search_customer(mobile):

    query = """
    SELECT *
    FROM customers
    WHERE mobile LIKE %s
    """

    cursor.execute(
        query,
        (f"%{mobile}%",)
    )

    return jsonify(
        cursor.fetchall()
    )

@customer_bp.route("/customers/<int:id>/history")
def history(id):

    cursor.execute(
        """
        SELECT *
        FROM bookings
        WHERE customer_id=%s
        ORDER BY booking_id DESC
        """,
        (id,)
    )

    return jsonify(
        cursor.fetchall()
    )

@customer_bp.route("/customers/<int:id>/loyalty")
def loyalty_progress(id):

    cursor.execute(
        """
        SELECT COUNT(*)
        total
        FROM bookings
        WHERE customer_id=%s
        AND status='COMPLETED'
        """,
        (id,)
    )

    total = cursor.fetchone()["total"]

    progress = total % 7

    return jsonify({
        "completed":total,
        "progress":progress,
        "target":7
    })

@customer_bp.route(
    "/customers/<int:id>/notes",
    methods=["GET"]
)
def get_notes(id):

    cursor.execute(
        """
        SELECT *
        FROM customer_notes
        WHERE customer_id=%s
        ORDER BY note_id DESC
        """,
        (id,)
    )

    return jsonify(
        cursor.fetchall()
    )

@customer_bp.route(
    "/customers/<int:id>/notes",
    methods=["POST"]
)
def add_note(id):

    data=request.json

    cursor.execute(
        """
        INSERT INTO
        customer_notes(
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

@customer_bp.route(
    "/notes/<int:id>",
    methods=["DELETE"]
)
def delete_note(id):

    cursor.execute(
        """
        DELETE FROM customer_notes
        WHERE note_id=%s
        """,
        (id,)
    )

    conn.commit()

    return jsonify({
        "message":"Deleted"
    })

@customer_bp.route(
    "/notes/<int:id>",
    methods=["PUT"]
)
def update_note(id):

    data = request.json

    cursor.execute(
        """
        UPDATE customer_notes
        SET note=%s
        WHERE note_id=%s
        """,
        (
            data["note"],
            id
        )
    )

    conn.commit()

    return jsonify({
        "message":"Note updated"
    })