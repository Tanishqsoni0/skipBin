from flask import Blueprint, request, jsonify
from database.db import get_pool_connection

customer_bp = Blueprint("customer", __name__)


# ── GET ALL CUSTOMERS ─────────────────────────────────────────────────────────
@customer_bp.route("/customers", methods=["GET"])
def get_customers():
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            """
            SELECT
                c.customer_id,
                CONCAT(c.first_name, ' ', c.last_name) AS full_name,
                c.mobile, c.email, c.address, c.loyalty_count,
                c.loyalty_override,
                COUNT(b.booking_id) AS total_bookings,
                COALESCE(SUM(b.total_amount), 0) AS total_spend
            FROM customers c
            LEFT JOIN bookings b ON c.customer_id = b.customer_id
            GROUP BY c.customer_id
            ORDER BY c.customer_id DESC
            """
        )
        customers = cursor.fetchall()
        for c in customers:
            count = c["total_bookings"]
            progress = count % 7
            remaining = 6 - progress if progress > 0 else 6
            c["bins_until_reward"] = remaining
        return jsonify(customers)
    except Exception as e:
        print("ERROR:", repr(e))
        return jsonify({"message": "Error fetching customers"}), 500
    finally:
        cursor.close()
        conn.close()


# ── GET CUSTOMER BY ID ────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:id>", methods=["GET"])
def get_customer(id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "SELECT * FROM customers WHERE customer_id = %s", (id,)
        )
        customer = cursor.fetchone()
        if not customer:
            return jsonify({"message": "Customer not found"}), 404
        return jsonify(customer)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── ADD CUSTOMER ──────────────────────────────────────────────────────────────
@customer_bp.route("/customers", methods=["POST"])
def add_customer():
    data = request.json
    full_name = data.get("full_name", "").strip()
    parts = full_name.split()
    first_name = parts[0] if len(parts) > 0 else ""
    last_name  = " ".join(parts[1:]) if len(parts) > 1 else ""

    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            """
            INSERT INTO customers (first_name, last_name, mobile, email, password_hash)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (first_name, last_name, data["mobile"], data["email"], "temp123"),
        )
        conn.commit()
        return jsonify({"message": "Customer added"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── UPDATE CUSTOMER ───────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:id>", methods=["PUT"])
def update_customer(id):
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            """
            UPDATE customers
            SET first_name=%s, last_name=%s, mobile=%s, email=%s, address=%s
            WHERE customer_id=%s
            """,
            (
                data.get("first_name", ""),
                data.get("last_name", ""),
                data["mobile"],
                data["email"],
                data.get("address", ""),
                id,
            ),
        )
        conn.commit()
        return jsonify({"message": "Customer updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── DELETE CUSTOMER ───────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:id>", methods=["DELETE"])
def delete_customer(id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "DELETE FROM customers WHERE customer_id = %s", (id,)
        )
        conn.commit()
        return jsonify({"message": "Customer deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── SEARCH CUSTOMER ───────────────────────────────────────────────────────────
@customer_bp.route("/customers/search/<mobile>", methods=["GET"])
def search_customer(mobile):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "SELECT * FROM customers WHERE mobile LIKE %s",
            (f"%{mobile}%",)
        )
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── BOOKING HISTORY ───────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:id>/history")
def history(id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            """
            SELECT
                b.booking_id, bt.size, b.delivery_address,
                b.delivery_date, b.collection_date,
                b.status, b.total_amount
            FROM bookings b
            JOIN bin_types bt ON bt.bin_id = b.bin_id
            WHERE b.customer_id = %s
            ORDER BY b.booking_id DESC
            """,
            (id,)
        )
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── LOYALTY ───────────────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:customer_id>/loyalty")
def customer_loyalty(customer_id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "SELECT COUNT(booking_id) AS real_count FROM bookings WHERE customer_id = %s",
            (customer_id,)
        )
        result        = cursor.fetchone()
        real_count    = result["real_count"] if result else 0
        progress      = real_count % 7
        remaining     = 6 - progress if progress > 0 else 6
        return jsonify({
            "bins_hired": real_count,
            "progress":   progress,
            "remaining":  remaining,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── NOTES — GET ───────────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:id>/notes", methods=["GET"])
def get_notes(id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "SELECT * FROM customer_notes WHERE customer_id = %s ORDER BY note_id DESC",
            (id,)
        )
        return jsonify(cursor.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── NOTES — ADD ───────────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:id>/notes", methods=["POST"])
def add_note(id):
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "INSERT INTO customer_notes (customer_id, note) VALUES (%s, %s)",
            (id, data["note"])
        )
        conn.commit()
        return jsonify({"message": "Note added"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── NOTES — DELETE ────────────────────────────────────────────────────────────
@customer_bp.route("/notes/<int:id>", methods=["DELETE"])
def delete_note(id):
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "DELETE FROM customer_notes WHERE note_id = %s", (id,)
        )
        conn.commit()
        return jsonify({"message": "Deleted"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── NOTES — UPDATE ────────────────────────────────────────────────────────────
@customer_bp.route("/notes/<int:id>", methods=["PUT"])
def update_note(id):
    data = request.json
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "UPDATE customer_notes SET note = %s WHERE note_id = %s",
            (data["note"], id)
        )
        conn.commit()
        return jsonify({"message": "Note updated"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ── LOYALTY OVERRIDE ──────────────────────────────────────────────────────────
@customer_bp.route("/customers/<int:id>/loyalty-override", methods=["PUT"])
def set_loyalty_override(id):
    data     = request.json
    override = data.get("override", "none")
    if override not in ("none", "approved", "declined"):
        return jsonify({"error": "Invalid override value"}), 400
    conn, cursor = get_pool_connection()
    try:
        cursor.execute(
            "UPDATE customers SET loyalty_override = %s WHERE customer_id = %s",
            (override, id)
        )
        conn.commit()
        return jsonify({"message": f"Loyalty override set to {override}"})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()