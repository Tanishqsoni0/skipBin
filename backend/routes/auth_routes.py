# routes/auth_routes.py
# Handles: /api/auth/register  POST
#          /api/auth/login      POST
#          /api/auth/me         GET  (protected — returns logged-in user profile)
#          /api/auth/logout     POST (client-side token drop, server just confirms)

import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
import bcrypt
from database.db import get_db

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ── helpers ──────────────────────────────────────────────────────────────────

def is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email))


def is_valid_mobile(mobile: str) -> bool:
    # Accepts formats like +61412345678 or 0412345678 (10-15 digits)
    return bool(re.match(r"^\+?[0-9]{10,15}$", mobile.replace(" ", "")))


def make_error(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status


def make_ok(data: dict, status: int = 200):
    return jsonify({"success": True, **data}), status


def safe_customer(row: dict) -> dict:
    """Strip sensitive fields before sending customer data to the frontend."""
    row.pop("password_hash", None)
    return row


# ── REGISTER ─────────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid JSON body")

    # ── required fields ──
    first_name   = (data.get("first_name") or "").strip()
    last_name    = (data.get("last_name") or "").strip()
    email        = (data.get("email") or "").strip().lower()
    mobile       = (data.get("mobile") or "").strip()
    password     = data.get("password") or ""
    account_type = data.get("account_type", "customer")   # 'customer' | 'business'
    business_name = (data.get("business_name") or "").strip() or None

    # ── validation ──
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

    # ── hash password ──
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)

        # Check email uniqueness
        cursor.execute("SELECT customer_id FROM customers WHERE email = %s", (email,))
        if cursor.fetchone():
            return make_error("An account with this email already exists", 409)

        # Check mobile uniqueness
        cursor.execute("SELECT customer_id FROM customers WHERE mobile = %s", (mobile,))
        if cursor.fetchone():
            return make_error("An account with this mobile number already exists", 409)

        # Insert new customer
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

        # Fetch the created row to return
        cursor.execute(
            "SELECT * FROM customers WHERE customer_id = %s", (new_id,)
        )
        customer = safe_customer(cursor.fetchone())

        # Issue tokens straight after registration so user is logged in immediately
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
        cursor.execute(
            "SELECT * FROM customers WHERE email = %s", (email,)
        )
        customer = cursor.fetchone()

        # Use constant-time comparison to prevent timing attacks
        if not customer:
            # Still run bcrypt to prevent timing-based email enumeration
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


# ── ME (get logged-in user's profile) ────────────────────────────────────────

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    customer_id = get_jwt_identity()

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT * FROM customers WHERE customer_id = %s", (customer_id,)
        )
        customer = cursor.fetchone()
        if not customer:
            return make_error("Customer not found", 404)

        # loyalty_progress: how many hires toward the next free bin (0-6)
        loyalty_progress = customer["loyalty_count"] % 7
        bins_until_free  = 7 - loyalty_progress if loyalty_progress > 0 else 7
        next_free_at     = customer["loyalty_count"] + bins_until_free

        return make_ok(
            {
                "customer": safe_customer(customer),
                "loyalty": {
                    "total_hires": customer["loyalty_count"],
                    "progress": loyalty_progress,       # e.g. 4 out of 7
                    "bins_until_free": bins_until_free, # e.g. 3 more
                    "next_free_at": next_free_at,       # hire number that is free
                },
            }
        )

    except Exception as e:
        return make_error(f"Could not fetch profile: {str(e)}", 500)
    finally:
        conn.close()


# ── LOGOUT ───────────────────────────────────────────────────────────────────
# JWT is stateless — the real logout happens on the frontend by deleting the token.
# This endpoint just gives the frontend a clean call to make.

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return make_ok({"message": "Logged out successfully"})