from database.db import cursor

def calculate_price(
    bin_id,
    waste_id,
    hire_weeks
):

    cursor.execute(
        """
        SELECT base_price
        FROM bin_types
        WHERE bin_id=%s
        """,
        (bin_id,)
    )

    bin_data = cursor.fetchone()

    cursor.execute(
        """
        SELECT extra_charge
        FROM waste_types
        WHERE waste_id=%s
        """,
        (waste_id,)
    )

    waste_data = cursor.fetchone()

    base_price = float(
        bin_data["base_price"]
    )

    waste_charge = float(
        waste_data["extra_charge"]
    )

    extension_fee = max(
        0,
        (hire_weeks - 1) * 40
    )

    total = (
        base_price
        + waste_charge
        + extension_fee
    )

    return {

        "base_price":
        base_price,

        "waste_charge":
        waste_charge,

        "extension_fee":
        extension_fee,

        "total":
        total

    }