from datetime import datetime, timedelta

def calculate_collection_date(
    delivery_date,
    hire_weeks
):

    d = datetime.strptime(
        delivery_date,
        "%Y-%m-%d"
    )

    collection = d + timedelta(
        weeks=hire_weeks
    )

    return collection.strftime(
        "%Y-%m-%d"
    )