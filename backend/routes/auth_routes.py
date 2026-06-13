# routes/auth_routes.py
# Handles: /api/auth/register           POST
#          /api/auth/login               POST
#          /api/auth/me                  GET   (protected)
#          /api/auth/change-password     PUT   (protected)
#          /api/auth/update-profile      PUT   (protected)
#          /api/auth/logout              POST  (protected)
#          /api/auth/forgot-password     POST  ← NEW
#          /api/auth/verify-otp          POST  ← NEW
#          /api/auth/reset-password      POST  ← NEW

import re
from datetime import datetime, timedelta
import random
import string

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from flask_mail import Message
import bcrypt
from database.db import get_db

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# ── In-memory OTP store: { email: { otp, expires_at, verified } } ─────────────
# Fine for single-process dev. For multi-worker prod, move this to Redis/DB.
_otp_store: dict = {}


# ── helpers ───────────────────────────────────────────────────────────────────

def is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def is_valid_mobile(mobile: str) -> bool:
    return bool(re.match(r"^\+?[0-9]{10,15}$", mobile.replace(" ", "")))


def make_error(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status


def make_ok(data: dict, status: int = 200):
    return jsonify({"success": True, **data}), status


def safe_customer(row: dict) -> dict:
    row.pop("password_hash", None)
    return row


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


# ── REGISTER ──────────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid JSON body")

    first_name    = (data.get("first_name") or "").strip()
    last_name     = (data.get("last_name") or "").strip()
    email         = (data.get("email") or "").strip().lower()
    mobile        = (data.get("mobile") or "").strip()
    password      = data.get("password") or ""
    account_type  = data.get("account_type", "customer")
    business_name = (data.get("business_name") or "").strip() or None

    if not first_name or not last_name:
        return make_error("First name and last name are required")
    if not is_valid_email(email):
        return make_error("A valid email address is required")
    if not is_valid_mobile(mobile):
        return make_error("A valid mobile number is required")
    if len(password) < 8:
        return make_error("Password must be at least 8 characters")
    if account_type not in ("customer", "business"):
        account_type = "customer"
    if account_type == "business" and not business_name:
        return make_error("Business name is required for business accounts")

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT customer_id FROM customers WHERE email = %s", (email,))
        if cursor.fetchone():
            return make_error("An account with this email already exists", 409)

        cursor.execute("SELECT customer_id FROM customers WHERE mobile = %s", (mobile,))
        if cursor.fetchone():
            return make_error("An account with this mobile number already exists", 409)

        cursor.execute(
            """
            INSERT INTO customers
                (first_name, last_name, email, mobile,
                 password_hash, account_type, business_name, loyalty_count)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 0)
            """,
            (first_name, last_name, email, mobile,
             password_hash, account_type, business_name),
        )
        conn.commit()
        new_id = cursor.lastrowid

        cursor.execute("SELECT * FROM customers WHERE customer_id = %s", (new_id,))
        customer = safe_customer(cursor.fetchone())

        access_token  = create_access_token(identity=str(new_id))
        refresh_token = create_refresh_token(identity=str(new_id))

        return make_ok(
            {
                "message": "Account created successfully",
                "customer": customer,
                "access_token": access_token,
                "refresh_token": refresh_token,
            },
            201,
        )

    except Exception as e:
        conn.rollback()
        return make_error(f"Registration failed: {str(e)}", 500)
    finally:
        conn.close()


# ── LOGIN ─────────────────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid JSON body")

    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return make_error("Email and password are required")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM customers WHERE email = %s", (email,))
        customer = cursor.fetchone()

        if not customer:
            bcrypt.checkpw(b"dummy", bcrypt.hashpw(b"dummy", bcrypt.gensalt()))
            return make_error("Invalid email or password", 401)

        password_ok = bcrypt.checkpw(
            password.encode("utf-8"),
            customer["password_hash"].encode("utf-8"),
        )
        if not password_ok:
            return make_error("Invalid email or password", 401)

        access_token  = create_access_token(identity=str(customer["customer_id"]))
        refresh_token = create_refresh_token(identity=str(customer["customer_id"]))

        return make_ok(
            {
                "message": "Login successful",
                "customer": safe_customer(customer),
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        )

    except Exception as e:
        return make_error(f"Login failed: {str(e)}", 500)
    finally:
        conn.close()


# ── ME ────────────────────────────────────────────────────────────────────────

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    customer_id = get_jwt_identity()

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT c.*,
                COUNT(b.booking_id) AS real_loyalty_count
            FROM customers c
            LEFT JOIN bookings b ON b.customer_id = c.customer_id
            WHERE c.customer_id = %s
            GROUP BY c.customer_id
            """,
            (customer_id,)
        )
        customer = cursor.fetchone()
        if not customer:
            return make_error("Customer not found", 404)

        real_count       = customer["real_loyalty_count"] or 0
        loyalty_progress = real_count % 7
        bins_until_free  = 7 - loyalty_progress if loyalty_progress > 0 else 7
        next_free_at     = real_count + bins_until_free

        return make_ok(
            {
                "customer": safe_customer(customer),
                "loyalty": {
                    "total_hires": real_count,
                    "progress": loyalty_progress,
                    "bins_until_free": bins_until_free,
                    "next_free_at": next_free_at,
                },
            }
        )

    except Exception as e:
        return make_error(f"Could not fetch profile: {str(e)}", 500)
    finally:
        conn.close()


# ── CHANGE PASSWORD ───────────────────────────────────────────────────────────

@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    customer_id = get_jwt_identity()
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid JSON body")

    current_password = data.get("current_password") or ""
    new_password     = data.get("new_password") or ""

    if not current_password or not new_password:
        return make_error("Current and new password are required")
    if len(new_password) < 8:
        return make_error("New password must be at least 8 characters")
    if current_password == new_password:
        return make_error("New password must be different from current password")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT password_hash FROM customers WHERE customer_id = %s", (customer_id,)
        )
        customer = cursor.fetchone()
        if not customer:
            return make_error("Customer not found", 404)

        password_ok = bcrypt.checkpw(
            current_password.encode("utf-8"),
            customer["password_hash"].encode("utf-8"),
        )
        if not password_ok:
            return make_error("Current password is incorrect", 401)

        new_hash = bcrypt.hashpw(
            new_password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
            "UPDATE customers SET password_hash = %s WHERE customer_id = %s",
            (new_hash, customer_id),
        )
        conn.commit()

        return make_ok({"message": "Password changed successfully"})

    except Exception as e:
        conn.rollback()
        return make_error(f"Could not change password: {str(e)}", 500)
    finally:
        conn.close()


# ── UPDATE PROFILE ────────────────────────────────────────────────────────────

@auth_bp.route("/update-profile", methods=["PUT"])
@jwt_required()
def update_profile():
    customer_id = get_jwt_identity()
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid JSON body")

    first_name = (data.get("first_name") or "").strip()
    last_name  = (data.get("last_name") or "").strip()
    email      = (data.get("email") or "").strip().lower()
    mobile     = (data.get("mobile") or "").strip()
    address    = (data.get("address") or "").strip()

    if not first_name or not last_name:
        return make_error("First name and last name are required")
    if not is_valid_email(email):
        return make_error("A valid email address is required")
    if not is_valid_mobile(mobile):
        return make_error("A valid mobile number is required")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT customer_id FROM customers WHERE email = %s AND customer_id != %s",
            (email, customer_id),
        )
        if cursor.fetchone():
            return make_error("This email is already in use", 409)

        cursor.execute(
            """
            UPDATE customers
            SET first_name=%s, last_name=%s, email=%s, mobile=%s, address=%s
            WHERE customer_id=%s
            """,
            (first_name, last_name, email, mobile, address, customer_id),
        )
        conn.commit()

        cursor.execute("SELECT * FROM customers WHERE customer_id = %s", (customer_id,))
        customer = safe_customer(cursor.fetchone())
        return make_ok({"message": "Profile updated", "customer": customer})

    except Exception as e:
        conn.rollback()
        return make_error(f"Could not update profile: {str(e)}", 500)
    finally:
        conn.close()


# ── LOGOUT ────────────────────────────────────────────────────────────────────

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return make_ok({"message": "Logged out successfully"})


# ── FORGOT PASSWORD — Step 1: Send OTP ───────────────────────────────────────

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data  = request.get_json(silent=True)
    email = ((data or {}).get("email") or "").strip().lower()

    if not email:
        return make_error("Email is required")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT customer_id FROM customers WHERE email = %s", (email,))
        user = cursor.fetchone()
    except Exception as e:
        return make_error(f"Database error: {str(e)}", 500)
    finally:
        conn.close()

    # Always return the same message so we don't leak which emails are registered
    if not user:
        return make_ok({"message": "If that email is registered, a reset code has been sent."})

    otp = _generate_otp()
    _otp_store[email] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=10),
        "verified": False,
    }

    try:
        mail = current_app.extensions["mail"]
        msg = Message(
            subject="Your Jerry's Bins password reset code",
            recipients=[email],
            body=(
                f"Your 6-digit verification code is: {otp}\n\n"
                "This code expires in 10 minutes.\n"
                "If you didn't request this, you can safely ignore this email."
            ),
        )
        mail.send(msg)
    except Exception as e:
        print(f"[Mail error] {e}")
        return make_error("Failed to send email. Please try again.", 500)

    return make_ok({"message": "If that email is registered, a reset code has been sent."})


# ── FORGOT PASSWORD — Step 2: Verify OTP ─────────────────────────────────────

@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data      = request.get_json(silent=True)
    email     = ((data or {}).get("email") or "").strip().lower()
    otp_input = ((data or {}).get("otp") or "").strip()

    if not email or not otp_input:
        return make_error("Email and OTP are required")

    record = _otp_store.get(email)

    if not record:
        return make_error("No reset code was requested for this email")

    if datetime.utcnow() > record["expires_at"]:
        _otp_store.pop(email, None)
        return make_error("Code has expired. Please request a new one.")

    if record["otp"] != otp_input:
        return make_error("Incorrect code. Please try again.")

    record["verified"] = True
    return make_ok({"message": "Code verified."})


# ── FORGOT PASSWORD — Step 3: Reset Password ─────────────────────────────────

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data         = request.get_json(silent=True)
    email        = ((data or {}).get("email") or "").strip().lower()
    new_password = (data or {}).get("password") or ""

    if not email or not new_password:
        return make_error("Email and new password are required")
    if len(new_password) < 8:
        return make_error("Password must be at least 8 characters")

    record = _otp_store.get(email)
    if not record or not record.get("verified"):
        return make_error("Please verify your reset code first.", 403)

    # Hash with plain bcrypt — same as the rest of this file
    new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE customers SET password_hash = %s WHERE email = %s",
            (new_hash, email),
        )
        conn.commit()
        rows_affected = cursor.rowcount
    except Exception as e:
        conn.rollback()
        return make_error(f"Database error: {str(e)}", 500)
    finally:
        conn.close()

    if rows_affected == 0:
        return make_error("No account found with that email.", 404)

    _otp_store.pop(email, None)
    return make_ok({"message": "Password reset successfully."})