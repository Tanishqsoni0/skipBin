# services/pricing_service.py
import requests
from math import radians, sin, cos, sqrt, atan2
from database.db import get_pool_connection

WAREHOUSE_LAT = -33.8688
WAREHOUSE_LON = 151.2093


def get_coordinates(address):
    if not address or len(address.strip()) < 5:
        return None
    try:
        url = "https://nominatim.openstreetmap.org/search"
        response = requests.get(
            url,
            params={"q": address, "format": "json", "limit": 1},
            headers={"User-Agent": "SkipBinProject"},
            timeout=5,
        )
        if not response.ok or not response.text.strip():
            return None
        data = response.json()
        if not data:
            return None
        return (float(data[0]["lat"]), float(data[0]["lon"]))
    except Exception:
        return None


def calculate_distance(lat1, lon1, lat2, lon2):
    R    = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    return 2 * R * atan2(sqrt(a), sqrt(1 - a))


def calculate_price(
    customer_id,
    bin_id,
    waste_id,
    hire_weeks,
    delivery_address="",
):
    # ── Each call gets its own connection + cursor from the pool ─────────────
    conn, cursor = get_pool_connection()

    try:
        # Bin price
        cursor.execute(
            "SELECT base_price FROM bin_types WHERE bin_id = %s",
            (bin_id,)
        )
        bin_data = cursor.fetchone()

        # Waste charge
        cursor.execute(
            "SELECT extra_charge FROM waste_types WHERE waste_id = %s",
            (waste_id,)
        )
        waste_data = cursor.fetchone()

        # Extension fee
        cursor.execute("SELECT extension_fee FROM hire_pricing LIMIT 1")
        hire_row      = cursor.fetchone()
        extension_fee = float(hire_row["extension_fee"]) if hire_row else 0.0

        base_price   = float(bin_data["base_price"])
        waste_charge = float(waste_data["extra_charge"])

        # Loyalty check
        loyalty_count    = 0
        loyalty_override = "none"
        free_bin         = False
        loyalty_discount = 0

        if customer_id:
            cursor.execute(
                """
                SELECT COUNT(b.booking_id) AS real_count, c.loyalty_override
                FROM customers c
                LEFT JOIN bookings b ON b.customer_id = c.customer_id
                WHERE c.customer_id = %s
                GROUP BY c.customer_id
                """,
                (customer_id,)
            )
            result           = cursor.fetchone()
            loyalty_count    = result["real_count"] if result else 0
            loyalty_override = result["loyalty_override"] if result else "none"

        if loyalty_override == "approved":
            free_bin         = True
            loyalty_discount = base_price
            base_price       = 0
        elif loyalty_override == "declined":
            free_bin = False
        elif (loyalty_count + 1) % 7 == 0:
            free_bin         = True
            loyalty_discount = base_price
            base_price       = 0

        extension_fee = max(0, (hire_weeks - 1) * extension_fee)

        # Distance & delivery charge
        distance_km = 0
        coords      = get_coordinates(delivery_address)
        if coords:
            customer_lat, customer_lon = coords
            distance_km = calculate_distance(
                WAREHOUSE_LAT, WAREHOUSE_LON,
                customer_lat,  customer_lon,
            )

        cursor.execute(
            "SELECT charge FROM distance_charges WHERE %s BETWEEN min_km AND max_km",
            (distance_km,)
        )
        distance_row    = cursor.fetchone()
        delivery_charge = float(distance_row["charge"]) if distance_row else 0.0

        # Promotions
        discount = 0
        promo_id = None
        cursor.execute(
            """
            SELECT * FROM promotions
            WHERE active = 1
            AND CURDATE() BETWEEN start_date AND end_date
            LIMIT 1
            """
        )
        promotion = cursor.fetchone()

        subtotal = base_price + waste_charge + extension_fee + delivery_charge

        if promotion:
            promo_id = promotion["promo_id"]
            if promotion["discount_type"] == "PERCENTAGE":
                discount = subtotal * float(promotion["discount_value"]) / 100
            else:
                discount = float(promotion["discount_value"])

        total = max(0, subtotal - discount)

        return {
            "base_price":       round(base_price, 2),
            "waste_charge":     round(waste_charge, 2),
            "extension_fee":    round(extension_fee, 2),
            "delivery_charge":  round(delivery_charge, 2),
            "distance_km":      round(distance_km, 2),
            "subtotal":         round(subtotal, 2),
            "discount":         round(discount, 2),
            "promo_id":         promo_id,
            "free_bin":         free_bin,
            "loyalty_discount": round(loyalty_discount, 2),
            "total":            round(total, 2),
        }

    finally:
        cursor.close()
        conn.close()