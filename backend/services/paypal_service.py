# services/paypal_service.py

import os
import requests

PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID")
PAYPAL_SECRET    = os.environ.get("PAYPAL_SECRET")
PAYPAL_MODE      = os.environ.get("PAYPAL_MODE", "sandbox")

PAYPAL_BASE = (
    "https://api-m.sandbox.paypal.com"
    if PAYPAL_MODE == "sandbox"
    else "https://api-m.paypal.com"
)


def get_access_token():
    response = requests.post(
        f"{PAYPAL_BASE}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "client_credentials"},
    )
    response.raise_for_status()
    return response.json()["access_token"]


def create_order(amount: float, booking_ref: str) -> dict:
    token = get_access_token()
    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": booking_ref,
                "description": f"Jerry's Bins — Skip Bin Hire ({booking_ref})",
                "amount": {
                    "currency_code": "AUD",
                    "value": f"{amount:.2f}",
                },
            }
        ],
        "payment_source": {
            "paypal": {
                "experience_context": {
                    "brand_name": "Jerry's Bins",
                    "locale": "en-AU",
                    "user_action": "PAY_NOW",
                    "return_url": "http://localhost:3000/booking",
                    "cancel_url": "http://localhost:3000/booking",
                }
            }
        },
    }
    response = requests.post(
        f"{PAYPAL_BASE}/v2/checkout/orders",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        json=payload,
    )
    response.raise_for_status()
    return response.json()


def capture_order(order_id: str) -> dict:
    token = get_access_token()
    response = requests.post(
        f"{PAYPAL_BASE}/v2/checkout/orders/{order_id}/capture",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )
    response.raise_for_status()
    return response.json()