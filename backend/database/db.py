# database/db.py
import mysql.connector
from mysql.connector import pooling
import os
from dotenv import load_dotenv
load_dotenv()

DB_CONFIG = {
    "host":       os.getenv("DB_HOST"),
    "user":       os.getenv("DB_USER"),
    "password":   os.getenv("DB_PASSWORD"),
    "database":   os.getenv("DB_NAME"),
    "charset":    "utf8mb4",
    "collation":  "utf8mb4_unicode_ci",
    "autocommit": False,
    "ssl_disabled": True,
}

# ── Connection pool (ONLY for get_db() and get_pool_connection()) ─────────────
db_pool = pooling.MySQLConnectionPool(
    pool_name="skipbins_pool",
    pool_size=20,
    pool_reset_session=True,
    **DB_CONFIG,
)

def get_db():
    """For auth/paypal routes. Always use in try/finally and call conn.close()."""
    return db_pool.get_connection()

def get_pool_connection():
    """For pricing_service. Always use in try/finally and call conn.close()."""
    pool_conn   = db_pool.get_connection()
    pool_cursor = pool_conn.cursor(dictionary=True, buffered=True)
    return pool_conn, pool_cursor


# ── Persistent connection for ALL legacy routes ───────────────────────────────
_persistent_conn   = None
_persistent_cursor = None

def _make_persistent():
    global _persistent_conn, _persistent_cursor
    if _persistent_conn:
        try:
            _persistent_conn.close()
        except Exception:
            pass
    _persistent_conn   = mysql.connector.connect(**DB_CONFIG)
    _persistent_cursor = _persistent_conn.cursor(dictionary=True, buffered=True)

_make_persistent()

def _reconnect():
    try:
        _make_persistent()
    except Exception as e:
        raise RuntimeError(f"Could not reconnect to MySQL: {e}")

def ensure_connection():
    """
    For legacy routes ONLY (customer_routes, dashboard_routes, etc.)
    Does NOT touch the pool — just keeps the persistent connection alive.
    """
    global _persistent_conn, _persistent_cursor
    try:
        if not _persistent_conn.is_connected():
            _reconnect()
    except Exception:
        _reconnect()


# ── Proxies ───────────────────────────────────────────────────────────────────
class _ConnProxy:
    def commit(self):
        try:
            _persistent_conn.commit()
        except mysql.connector.errors.OperationalError:
            _reconnect()
            _persistent_conn.commit()

    def rollback(self):
        try:
            _persistent_conn.rollback()
        except mysql.connector.errors.OperationalError:
            _reconnect()

    def cursor(self, **kwargs):
        return _persistent_conn.cursor(**kwargs)

    def is_connected(self):
        return _persistent_conn is not None and _persistent_conn.is_connected()


class _CursorProxy:
    RETRY_CODES = {2006, 2013, 2014, 2055}

    def execute(self, query, args=None):
        try:
            _persistent_cursor.execute(query, args)
        except (
            mysql.connector.errors.OperationalError,
            mysql.connector.errors.DatabaseError,
        ) as e:
            if getattr(e, "errno", None) in self.RETRY_CODES:
                _reconnect()
                _persistent_cursor.execute(query, args)
            else:
                raise

    def fetchone(self):
        return _persistent_cursor.fetchone()

    def fetchall(self):
        return _persistent_cursor.fetchall()

    @property
    def lastrowid(self):
        return _persistent_cursor.lastrowid

    @property
    def rowcount(self):
        return _persistent_cursor.rowcount


conn   = _ConnProxy()
cursor = _CursorProxy()