from flask import Blueprint, jsonify
import database.db as db

dashboard_bp = Blueprint(
    "dashboard",
    __name__
)

@dashboard_bp.route("/dashboard")
def dashboard():
    db.ensure_connection()
    db.cursor.execute(
        "SELECT COUNT(*) AS total FROM customers"
    )
    customers = db.cursor.fetchone()["total"]

    db.cursor.execute(
        "SELECT COUNT(*) AS total FROM bookings"
    )
    row = db.cursor.fetchone()

    bookings = row["total"] if row else 0
    db.cursor.execute("""
        SELECT SUM(total_amount) AS revenue
        FROM bookings
    """)
    
    revenue = db.cursor.fetchone()["revenue"] or 0.0

    return jsonify({
        "customers": customers,
        "bookings": bookings,
        "revenue": revenue
    })

@dashboard_bp.route("/reports/top-customers")
def top_customers():
    db.ensure_connection()
    db.cursor.execute(
        """
        SELECT
        c.customer_id,
        CONCAT(
    c.first_name,
    ' ',
    c.last_name
) AS full_name,
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
        db.cursor.fetchall()
    )

@dashboard_bp.route("/reports/customer-value")
def customer_value():
    db.ensure_connection()
    db.cursor.execute(
        """
        SELECT

        CONCAT(
    c.first_name,
    ' ',
    c.last_name
) AS full_name,

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
        db.cursor.fetchall()
    )

@dashboard_bp.route("/reports/loyalty")

def loyalty_report():

    db.ensure_connection()

    db.cursor.execute(
        """
        SELECT
            SUM(loyalty_count)
            AS total_bins,
            COUNT(*)
            AS customers
        FROM customers
        """
    )

    summary =db.cursor.fetchone()

    db.cursor.execute(
        """
        SELECT
            customer_id,
            first_name,
            last_name,
            loyalty_count
        FROM customers
        ORDER BY loyalty_count DESC
        LIMIT 5
        """
    )

    top_customers = db.cursor.fetchall()

    db.cursor.execute("""
    SELECT
    COALESCE(
    SUM(FLOOR(loyalty_count/7)),
    0
    ) AS rewards_issued
    FROM customers
    """)

    rewards = db.cursor.fetchone()   
    return jsonify({

        "summary":
        summary,

        "top_customers":
        top_customers,

        "rewards_issued":
        rewards["rewards_issued"]

    })

@dashboard_bp.route(
"/reports/revenue-impact"
)
def revenue_impact():

    db.ensure_connection()

    db.cursor.execute(
        """
        SELECT

        COALESCE(
            SUM(discount_amount),
            0
        ) AS promotion_discount,

        COALESCE(
            SUM(loyalty_discount),
            0
        ) AS loyalty_discount

        FROM bookings
        """
    )

    data = db.cursor.fetchone()

    data["total_impact"] = (
        float(data["promotion_discount"])
        +
        float(data["loyalty_discount"])
    )

    return jsonify(data)

@dashboard_bp.route("/dashboard/new-bookings")
def new_bookings():
    db.ensure_connection()
    db.cursor.execute("""
    SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) customer_name,

        bt.size,

        b.created_at

    FROM bookings b

    JOIN customers c
    ON c.customer_id=b.customer_id

    JOIN bin_types bt
    ON bt.bin_id=b.bin_id

    WHERE b.status='NEW'

    ORDER BY b.booking_id DESC

    LIMIT 5
    """)

    return jsonify(
        db.cursor.fetchall()
    )

@dashboard_bp.route("/dashboard/upcoming-deliveries")
def upcoming_deliveries():
    db.ensure_connection()

    db.cursor.execute("""
    SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) customer_name,

        bt.size,

        b.delivery_date

    FROM bookings b

    JOIN customers c
    ON c.customer_id=b.customer_id

    JOIN bin_types bt
    ON bt.bin_id=b.bin_id

    WHERE b.delivery_date >= CURDATE()

    ORDER BY b.delivery_date

    LIMIT 5
    """)

    return jsonify(
        db.cursor.fetchall()
    )

@dashboard_bp.route("/dashboard/active-hires")
def active_hires():
    db.ensure_connection()
    db.cursor.execute("""
    SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) customer_name,

        bt.size,

        b.collection_date

    FROM bookings b

    JOIN customers c
    ON c.customer_id=b.customer_id

    JOIN bin_types bt
    ON bt.bin_id=b.bin_id

    WHERE b.status='ACTIVE'

    ORDER BY b.collection_date

    LIMIT 5
    """)

    return jsonify(
        db.cursor.fetchall()
    )


@dashboard_bp.route("/dashboard/upcoming-collections")
def upcoming_collections():
    db.ensure_connection()

    db.cursor.execute("""
    SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) customer_name,

        bt.size,

        b.collection_date

    FROM bookings b

    JOIN customers c
    ON c.customer_id=b.customer_id

    JOIN bin_types bt
    ON bt.bin_id=b.bin_id

    WHERE b.collection_date >= CURDATE()

    ORDER BY b.collection_date

    LIMIT 5
    """)

    return jsonify(
        db.cursor.fetchall()
    )


@dashboard_bp.route("/dashboard/completed-jobs")
def completed_jobs():
    db.ensure_connection()

    db.cursor.execute("""
    SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) customer_name,

        bt.size,

        b.total_amount

    FROM bookings b

    JOIN customers c
    ON c.customer_id=b.customer_id

    JOIN bin_types bt
    ON bt.bin_id=b.bin_id

    WHERE b.status='COMPLETED'

    ORDER BY b.booking_id DESC

    LIMIT 5
    """)

    return jsonify(
        db.cursor.fetchall()
    )


@dashboard_bp.route("/dashboard-data")
def dashboard_data():

    db.ensure_connection()

    # Stats
    db.cursor.execute(
        "SELECT COUNT(*) total FROM customers"
    )
    customers = db.cursor.fetchone()["total"]

    db.cursor.execute(
        "SELECT COUNT(*) total FROM bookings"
    )
    bookings = db.cursor.fetchone()["total"]

    db.cursor.execute(
        "SELECT COALESCE(SUM(total_amount),0) revenue FROM bookings"
    )
    revenue = db.cursor.fetchone()["revenue"]

    # New Bookings
    db.cursor.execute("""
    SELECT
        b.booking_id,
        CONCAT(c.first_name,' ',c.last_name) customer_name,
        bt.size
    FROM bookings b
    JOIN customers c
      ON c.customer_id=b.customer_id
    JOIN bin_types bt
      ON bt.bin_id=b.bin_id
    WHERE b.status='NEW'
    ORDER BY b.booking_id DESC
    LIMIT 5
    """)
    new_bookings = db.cursor.fetchall()

    # Deliveries
    db.cursor.execute("""
    SELECT
        b.booking_id,
        CONCAT(c.first_name,' ',c.last_name) customer_name,
        bt.size,
        b.delivery_date
    FROM bookings b
    JOIN customers c
      ON c.customer_id=b.customer_id
    JOIN bin_types bt
      ON bt.bin_id=b.bin_id
    WHERE b.delivery_date>=CURDATE()
    ORDER BY b.delivery_date
    LIMIT 5
    """)
    deliveries = db.cursor.fetchall()

    # Active
    db.cursor.execute("""
    SELECT
        b.booking_id,
        CONCAT(c.first_name,' ',c.last_name) customer_name,
        bt.size,
        b.collection_date
    FROM bookings b
    JOIN customers c
      ON c.customer_id=b.customer_id
    JOIN bin_types bt
      ON bt.bin_id=b.bin_id
    WHERE b.status='ACTIVE'
    LIMIT 5
    """)
    active_hires = db.cursor.fetchall()

    # Collections
    db.cursor.execute("""
    SELECT
        b.booking_id,
        CONCAT(c.first_name,' ',c.last_name) customer_name,
        bt.size,
        b.collection_date
    FROM bookings b
    JOIN customers c
      ON c.customer_id=b.customer_id
    JOIN bin_types bt
      ON bt.bin_id=b.bin_id
    WHERE b.collection_date>=CURDATE()
    LIMIT 5
    """)
    upcoming_collections = db.cursor.fetchall()

    # Completed
    db.cursor.execute("""
    SELECT
        b.booking_id,
        CONCAT(c.first_name,' ',c.last_name) customer_name,
        bt.size,
        b.total_amount
    FROM bookings b
    JOIN customers c
      ON c.customer_id=b.customer_id
    JOIN bin_types bt
      ON bt.bin_id=b.bin_id
    WHERE b.status='COMPLETED'
    ORDER BY b.booking_id DESC
    LIMIT 5
    """)
    completed_jobs = db.cursor.fetchall()

    #Collection Reminders
    db.cursor.execute("""
                      SELECT

        b.booking_id,

        CONCAT(
            c.first_name,
            ' ',
            c.last_name
        ) customer_name,

        bt.size,

        b.collection_date

    FROM bookings b

    JOIN customers c
    ON c.customer_id=b.customer_id

    JOIN bin_types bt
    ON bt.bin_id=b.bin_id

    WHERE
    b.collection_date=
    DATE_ADD(
        CURDATE(),
        INTERVAL 1 DAY
    )

    ORDER BY
    b.collection_date
    """)
    collection_reminders = db.cursor.fetchall()

    return jsonify({
        "stats":{
            "customers":customers,
            "bookings":bookings,
            "revenue":revenue
        },
        "newBookings":new_bookings,
        "deliveries":deliveries,
        "activeHires":active_hires,
        "upcomingCollections":upcoming_collections,
        "completedJobs":completed_jobs,
        "collectionReminders":collection_reminders
    })

@dashboard_bp.route(
"/reports/promotions-impact"
)
def promotions_impact():

    db.ensure_connection()

    db.cursor.execute(
        """
        SELECT
        COALESCE(
        SUM(discount_amount),
        0
        ) total_discount
        FROM bookings
        """
    )

    return jsonify(
        db.cursor.fetchone()
    )