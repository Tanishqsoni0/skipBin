from flask import Blueprint, request, jsonify
from database.db import conn, cursor

customer_bp = Blueprint("customer", __name__)

# Get all customers
@customer_bp.route("/customers", methods=["GET"])
def get_customers():
    cursor.execute("SELECT * FROM customers")
    customers = cursor.fetchall()
    return jsonify(customers)

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

    query = """
    INSERT INTO customers
    (full_name,mobile,email,address)
    VALUES(%s,%s,%s,%s)
    """

    values = (
        data["full_name"],
        data["mobile"],
        data["email"],
        data["address"]
    )

    cursor.execute(query, values)
    conn.commit()

    return jsonify({
        "message":"Customer created"
    }),201

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

@customer_bp.route("/customers/mobile/<mobile>")
def search_mobile(mobile):

    cursor.execute(
        """
        SELECT *
        FROM customers
        WHERE mobile=%s
        """,
        (mobile,)
    )

    customer = cursor.fetchone()

    if customer:
        return jsonify(customer)

    return jsonify({
        "message":"Customer not found"
    }),404


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