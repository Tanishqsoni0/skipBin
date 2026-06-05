from database.db import cursor

def is_loyalty_eligible(customer_id):

    cursor.execute("""
        SELECT COUNT(*)
        AS total
        FROM bookings
        WHERE customer_id=%s
        AND status='COMPLETED'
    """,(customer_id,))

    result=cursor.fetchone()

    completed=result["total"]

    return completed>0 and completed%6==0