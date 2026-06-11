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

# ── Connection pool (used by auth + paypal routes via get_db()) ───────────────
db_pool = pooling.MySQLConnectionPool(
    pool_name="skipbins_pool",
    pool_size=10,
    **DB_CONFIG,
)

def get_db():
    """
    Get a pooled connection for auth/paypal routes.
    Always use in try/finally and call conn.close() to return to pool.
    """
    return db_pool.get_connection()


# ── Per-call isolated connection for pricing_service ─────────────────────────
def ensure_connection():
    """
    Returns a fresh (conn, cursor) from the pool.
    Used by pricing_service — caller must close both in a finally block.
    """
    conn   = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True, buffered=True)
    return conn, cursor


# ── Persistent connection for legacy routes ───────────────────────────────────
# bin_routes, waste_routes, customer_routes etc. use db.conn and db.cursor.
# We keep ONE persistent connection and fully reconnect when it drops.

_persistent_conn   = None
_persistent_cursor = None

def _make_persistent():
    """Create a brand new persistent connection and cursor."""
    global _persistent_conn, _persistent_cursor
    try:
        if _persistent_conn:
            try:
                _persistent_conn.close()
            except Exception:
                pass
    except Exception:
        pass
    _persistent_conn   = mysql.connector.connect(**DB_CONFIG)
    _persistent_cursor = _persistent_conn.cursor(
        dictionary=True,
        buffered=True,
    )

_make_persistent()

def _reconnect():
    """Force a full reconnect of the persistent connection."""
    global _persistent_conn, _persistent_cursor
    try:
        _make_persistent()
    except Exception as e:
        raise RuntimeError(f"Could not reconnect to MySQL: {e}")


class _ConnProxy:
    """Proxy for db.conn — routes call db.conn.commit() / db.conn.rollback()"""

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
    """
    Proxy for db.cursor.
    Catches 'Lost connection' and 'Commands out of sync' errors on execute(),
    reconnects the persistent connection, and retries the query once.
    """

    RETRY_ERRORS = (
        2006,   # MySQL server has gone away
        2013,   # Lost connection to MySQL server during query
        2014,   # Commands out of sync
        2055,   # Lost connection to MySQL server at reading initial
    )

    def _should_retry(self, err):
        code = getattr(err, "errno", None)
        return code in self.RETRY_ERRORS

    def execute(self, query, args=None):
        try:
            _persistent_cursor.execute(query, args)
        except (
            mysql.connector.errors.OperationalError,
            mysql.connector.errors.DatabaseError,
        ) as e:
            if self._should_retry(e):
                # Reconnect and retry once
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


# These are what legacy routes import — no changes needed in those files
conn   = _ConnProxy()
cursor = _CursorProxy()