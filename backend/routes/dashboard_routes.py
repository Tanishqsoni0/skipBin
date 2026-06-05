from flask import Blueprint, jsonify
from database.db import cursor

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)

@dashboard_bp.route("/dashboard")
def dashboard():

    cursor.execute(
        "SELECT COUNT(*) AS total FROM customers"
    )
    customers = cursor.fetchone()["total"]

    cursor.execute(
        "SELECT COUNT(*) AS total FROM bookings"
    )
    bookings = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT SUM(total_amount) AS revenue
        FROM bookings
    """)
    
    revenue = cursor.fetchone()["revenue"] or 0.0

    return jsonify({
        "customers": customers,
        "bookings": bookings,
        "revenue": revenue
    })

@dashboard_bp.route("/reports/top-customers")
def top_customers():

    cursor.execute(
        """
        SELECT
        c.customer_id,
        c.full_name,
        COUNT(*) total_bookings

        FROM bookings b

        JOIN customers c
        ON b.customer_id=c.customer_id

        GROUP BY c.customer_id

        ORDER BY total_bookings DESC
        LIMIT 10
        """
    )

    return jsonify(
        cursor.fetchall()
    )

@dashboard_bp.route("/reports/customer-value")
def customer_value():

    cursor.execute(
        """
        SELECT

        c.full_name,

        SUM(
        b.total_amount
        ) lifetime_value

        FROM bookings b

        JOIN customers c
        ON b.customer_id=c.customer_id

        GROUP BY c.customer_id

        ORDER BY lifetime_value DESC
        """
    )

    return jsonify(
        cursor.fetchall()
    )

@dashboard_bp.route("/reports/loyalty")
def loyalty_report():

    cursor.execute(
        """
        SELECT COUNT(*)
        total_rewards

        FROM loyalty_rewards
        """
    )

    return jsonify(
        cursor.fetchone()
    )