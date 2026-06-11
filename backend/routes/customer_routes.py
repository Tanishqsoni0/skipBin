from flask import Blueprint, request, jsonify
import database.db as db

customer_bp = Blueprint("customer", __name__)

# Get all customers
@customer_bp.route("/customers", methods=["GET"])
def get_customers():
    db.ensure_connection()

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

    db.cursor.execute(query)

    customers = db.cursor.fetchall()

    for c in customers:

        count = c["loyalty_count"]

        remaining = 6 - (count % 7)

        if remaining < 0:
            remaining = 6

        c["bins_until_reward"] = remaining

    return jsonify(customers)

# Get customer by id
@customer_bp.route("/customers/<int:id>", methods=["GET"])
def get_customer(id):
    db.ensure_connection()
    db.cursor.execute(
        "SELECT * FROM customers WHERE customer_id=%s",
        (id,)
    )

    customer = db.cursor.fetchone()

    if not customer:
        return jsonify({"message":"Customer not found"}),404

    return jsonify(customer)

# Add customer
@customer_bp.route("/customers", methods=["POST"])
def add_customer():
    db.ensure_connection()
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

    db.cursor.execute(
        query,
        (
            first_name,
            last_name,
            data["mobile"],
            data["email"],
            "temp123"
        )
    )

    db.conn.commit()

    return jsonify({
        "message":"Customer added"
    })

@customer_bp.route("/customers/<int:id>", methods=["PUT"])
def update_customer(id):
    db.ensure_connection()
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

    db.cursor.execute(query, values)
    db.conn.commit()

    return jsonify({
        "message":"Customer updated"
    })


@customer_bp.route("/customers/<int:id>", methods=["DELETE"])
def delete_customer(id):
    db.ensure_connection()
    db.cursor.execute(
        "DELETE FROM customers WHERE customer_id=%s",
        (id,)
    )

    db.conn.commit()

    return jsonify({
        "message":"Customer deleted"
    })

@customer_bp.route(
    "/customers/search/<mobile>",
    methods=["GET"]
)
def search_customer(mobile):
    db.ensure_connection()
    query = """
    SELECT *
    FROM customers
    WHERE mobile LIKE %s
    """

    db.cursor.execute(
        query,
        (f"%{mobile}%",)
    )

    return jsonify(
        db.cursor.fetchall()
    )

@customer_bp.route("/customers/<int:id>/history")
def history(id):
    db.ensure_connection()
    db.cursor.execute(
        """
        SELECT

        b.booking_id,

        bt.size,

        b.delivery_address,

        b.delivery_date,

        b.collection_date,

        b.status,

        b.total_amount

    FROM bookings b

    JOIN bin_types bt
    ON bt.bin_id = b.bin_id

    WHERE b.customer_id=%s

    ORDER BY b.booking_id DESC
        """,
        (id,)
    )

    return jsonify(
        db.cursor.fetchall()
    )

@customer_bp.route(
"/customers/<int:customer_id>/loyalty"
)
def customer_loyalty(customer_id):

    db.ensure_connection()

    db.cursor.execute(
        """
        SELECT
        loyalty_count
        FROM customers
        WHERE customer_id=%s
        """,
        (customer_id,)
    )

    customer = db.cursor.fetchone()

    loyalty_count = customer["loyalty_count"]

    progress = loyalty_count % 7

    remaining = 7 - progress

    if progress == 0 and loyalty_count > 0:
        remaining = 7

    return jsonify({

        "bins_hired":
        loyalty_count,

        "progress":
        progress,

        "remaining":
        remaining

    })

@customer_bp.route(
    "/customers/<int:id>/notes",
    methods=["GET"]
)
def get_notes(id):
    db.ensure_connection()
    db.cursor.execute(
        """
        SELECT *
        FROM customer_notes
        WHERE customer_id=%s
        ORDER BY note_id DESC
        """,
        (id,)
    )

    return jsonify(
        db.cursor.fetchall()
    )

@customer_bp.route(
    "/customers/<int:id>/notes",
    methods=["POST"]
)
def add_note(id):
    db.ensure_connection()
    data=request.json

    db.cursor.execute(
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

    db.conn.commit()

    return jsonify({
        "message":"Note added"
    })

@customer_bp.route(
    "/notes/<int:id>",
    methods=["DELETE"]
)
def delete_note(id):
    db.ensure_connection()
    db.cursor.execute(
        """
        DELETE FROM customer_notes
        WHERE note_id=%s
        """,
        (id,)
    )

    db.conn.commit()

    return jsonify({
        "message":"Deleted"
    })

@customer_bp.route(
    "/notes/<int:id>",
    methods=["PUT"]
)
def update_note(id):
    db.ensure_connection()
    data = request.json

    db.cursor.execute(
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

    db.conn.commit()

    return jsonify({
        "message":"Note updated"
    })