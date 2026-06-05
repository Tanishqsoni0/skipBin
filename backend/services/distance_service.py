from database.db import cursor

def get_delivery_charge(distance_km):

    cursor.execute("""
        SELECT charge
        FROM distance_charges
        WHERE %s BETWEEN min_km AND max_km
    """,(distance_km,))

    result = cursor.fetchone()

    if result:
        return float(result["charge"])

    return 0