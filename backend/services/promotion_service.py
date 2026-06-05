from database.db import cursor
from datetime import date

def get_discount(amount):

    today = date.today()

    cursor.execute("""
        SELECT *
        FROM promotions
        WHERE active=1
        AND %s BETWEEN start_date
        AND end_date
    """,(today,))

    promo = cursor.fetchone()

    if not promo:
        return 0

    if promo["discount_type"]=="PERCENTAGE":
        return amount * (
            promo["discount_value"]/100
        )

    return promo["discount_value"]