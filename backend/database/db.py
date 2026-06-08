# db.py — MySQL connection for Flask (skipBins)
# Supports both:
#   - Legacy:  from database.db import conn, cursor   (used by existing routes)
#   - Pooled:  from database.db import get_db         (used by auth_routes)

import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv
load_dotenv()
# ── Connection pool (used by auth routes) ────────────────────────────────────
db_pool = pooling.MySQLConnectionPool(
    pool_name="skipbins_pool",
    pool_size=5,
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    charset="utf8mb4",
    collation="utf8mb4_unicode_ci",
    autocommit=False,
)

def get_db():
    """Get a connection from the pool. Always call conn.close() in a finally block."""
    return db_pool.get_connection()


# ── Legacy single connection (used by existing routes) ───────────────────────
# This keeps customer_routes, booking_routes, etc. working without any changes.

conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    charset="utf8mb4",
    collation="utf8mb4_unicode_ci",
    autocommit=False,
)

cursor = conn.cursor(
    dictionary=True,
    buffered=True
)

def ensure_connection():

    global conn
    global cursor

    try:

        if not conn.is_connected():

            conn.reconnect(
                attempts=3,
                delay=2
            )

        cursor = conn.cursor(
            dictionary=True,
            buffered=True
        )

    except Exception:

        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            charset="utf8mb4",
            collation="utf8mb4_unicode_ci",
            autocommit=False,
        )

        cursor = conn.cursor(
            dictionary=True,
            buffered=True
        )

    return conn, cursor