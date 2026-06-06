# routes/admin_auth_routes.py
# Handles:
#   POST  /api/admin/login          — admin login
#   GET   /api/admin/me             — get logged-in admin profile (protected)
#   POST  /api/admin/create-staff   — super_admin creates a new staff account
#   GET   /api/admin/list           — super_admin lists all admin accounts
#   PATCH /api/admin/<id>/deactivate — super_admin deactivates a staff account

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt,
    get_jwt_identity,
)
import bcrypt
from database.db import get_db

admin_auth_bp = Blueprint("admin_auth", __name__, url_prefix="/api/admin")


# ── helpers ───────────────────────────────────────────────────────────────────

def make_error(message, status=400):
    return jsonify({"success": False, "error": message}), status

def make_ok(data, status=200):
    return jsonify({"success": True, **data}), status

def safe_admin(row):
    """Remove password_hash before sending to frontend."""
    row.pop("password_hash", None)
    return row

def require_super_admin():
    """Returns (admin_row, None) or (None, error_response)."""
    claims = get_jwt()
    if claims.get("admin_role") not in ("super_admin",):
        return None, make_error("Super admin access required", 403)
    return claims, None


# ── LOGIN ─────────────────────────────────────────────────────────────────────

@admin_auth_bp.route("/login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid JSON body")

    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not password:
        return make_error("Username and password are required")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admins WHERE username = %s", (username,))
        admin = cursor.fetchone()

        # Dummy check to prevent timing-based username enumeration
        if not admin:
            bcrypt.checkpw(b"dummy", bcrypt.hashpw(b"dummy", bcrypt.gensalt()))
            return make_error("Invalid username or password", 401)

        if not admin["is_active"]:
            return make_error("This admin account has been deactivated", 403)

        password_ok = bcrypt.checkpw(
            password.encode("utf-8"),
            admin["password_hash"].encode("utf-8"),
        )
        if not password_ok:
            return make_error("Invalid username or password", 401)

        # Include role in JWT claims so protected routes can check it
        additional_claims = {
            "user_type": "admin",
            "admin_role": admin["role"],   # 'super_admin' or 'staff'
            "admin_name": admin["name"],
        }
        access_token  = create_access_token(
            identity=str(admin["admin_id"]),
            additional_claims=additional_claims,
        )
        refresh_token = create_refresh_token(
            identity=str(admin["admin_id"]),
            additional_claims=additional_claims,
        )

        return make_ok({
            "message": "Admin login successful",
            "admin": safe_admin(admin),
            "access_token": access_token,
            "refresh_token": refresh_token,
        })

    except Exception as e:
        return make_error(f"Login failed: {str(e)}", 500)
    finally:
        conn.close()


# ── ME ────────────────────────────────────────────────────────────────────────

@admin_auth_bp.route("/me", methods=["GET"])
@jwt_required()
def admin_me():
    claims = get_jwt()
    if claims.get("user_type") != "admin":
        return make_error("Admin access required", 403)

    admin_id = get_jwt_identity()
    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admins WHERE admin_id = %s", (admin_id,))
        admin = cursor.fetchone()
        if not admin:
            return make_error("Admin not found", 404)
        return make_ok({"admin": safe_admin(admin)})
    except Exception as e:
        return make_error(str(e), 500)
    finally:
        conn.close()


# ── CREATE STAFF (super_admin only) ──────────────────────────────────────────

@admin_auth_bp.route("/create-staff", methods=["POST"])
@jwt_required()
def create_staff():
    claims = get_jwt()
    if claims.get("user_type") != "admin":
        return make_error("Admin access required", 403)
    if claims.get("admin_role") != "super_admin":
        return make_error("Only super admins can create staff accounts", 403)

    data = request.get_json(silent=True)
    if not data:
        return make_error("Invalid JSON body")

    name     = (data.get("name") or "").strip()
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""
    role     = data.get("role", "staff")

    if not name or not username or not password:
        return make_error("Name, username and password are required")
    if len(password) < 8:
        return make_error("Password must be at least 8 characters")
    if role not in ("super_admin", "staff"):
        role = "staff"

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT admin_id FROM admins WHERE username = %s", (username,))
        if cursor.fetchone():
            return make_error("An admin with this username already exists", 409)

        cursor.execute(
            """
            INSERT INTO admins (name, username, password_hash, role)
            VALUES (%s, %s, %s, %s)
            """,
            (name, username, password_hash, role),
        )
        conn.commit()
        new_id = cursor.lastrowid
        cursor.execute("SELECT * FROM admins WHERE admin_id = %s", (new_id,))
        new_admin = safe_admin(cursor.fetchone())
        return make_ok({"message": "Staff account created", "admin": new_admin}, 201)

    except Exception as e:
        conn.rollback()
        return make_error(f"Could not create staff: {str(e)}", 500)
    finally:
        conn.close()


# ── LIST ALL ADMINS (super_admin only) ────────────────────────────────────────

@admin_auth_bp.route("/list", methods=["GET"])
@jwt_required()
def list_admins():
    claims = get_jwt()
    if claims.get("user_type") != "admin" or claims.get("admin_role") != "super_admin":
        return make_error("Super admin access required", 403)

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "SELECT admin_id, name, username, role, is_active, created_at FROM admins ORDER BY created_at DESC"
        )
        admins = cursor.fetchall()
        return make_ok({"admins": admins})
    except Exception as e:
        return make_error(str(e), 500)
    finally:
        conn.close()


# ── DEACTIVATE STAFF (super_admin only) ───────────────────────────────────────

@admin_auth_bp.route("/<int:admin_id>/deactivate", methods=["PATCH"])
@jwt_required()
def deactivate_admin(admin_id):
    claims = get_jwt()
    if claims.get("user_type") != "admin" or claims.get("admin_role") != "super_admin":
        return make_error("Super admin access required", 403)

    # Prevent self-deactivation
    if str(admin_id) == get_jwt_identity():
        return make_error("You cannot deactivate your own account", 400)

    conn = get_db()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            "UPDATE admins SET is_active = 0 WHERE admin_id = %s", (admin_id,)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return make_error("Admin not found", 404)
        return make_ok({"message": "Admin account deactivated"})
    except Exception as e:
        conn.rollback()
        return make_error(str(e), 500)
    finally:
        conn.close()
