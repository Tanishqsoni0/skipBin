# services/paypal_service.py
# Handles all PayPal API communication:
#   - get_access_token()   — gets a Bearer token from PayPal
#   - create_order()       — creates a PayPal order and returns the order ID
#   - capture_order()      — captures (completes) a payment after user approves

import os
import requests

# ── Config from .env ──────────────────────────────────────────────────────────
PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID")
PAYPAL_SECRET    = os.environ.get("PAYPAL_SECRET")
PAYPAL_MODE      = os.environ.get("PAYPAL_MODE", "sandbox")

PAYPAL_BASE = (
    "https://api-m.sandbox.paypal.com"
    if PAYPAL_MODE == "sandbox"
    else "https://api-m.paypal.com"
)


def get_access_token() -> str:
    """Exchange client credentials for a short-lived Bearer token."""
    response = requests.post(
        f"{PAYPAL_BASE}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={"grant_type": "client_credentials"},
    )
    response.raise_for_status()
    return response.json()["access_token"]


def create_order(amount: float, booking_reference: str) -> dict:
    """
    Create a PayPal order for the given amount.
    Returns the full PayPal order object including the order ID.
    """
    token = get_access_token()

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": booking_reference,
                "description": f"Jerry's Bins — Skip Bin Hire ({booking_reference})",
                "amount": {
                    "currency_code": "AUD",
                    "value": f"{amount:.2f}",
                },
            }
        ],
        "payment_source": {
            "paypal": {
                "experience_context": {
                    "payment_method_preference": "IMMEDIATE_PAYMENT_REQUIRED",
                    "brand_name": "Jerry's Bins",
                    "locale": "en-AU",
                    "landing_page": "LOGIN",
                    "user_action": "PAY_NOW",
                    # These are handled by the JS SDK — not redirect URLs
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
    """
    Capture a PayPal order after the customer has approved it.
    This actually moves the money. Returns the capture result.
    """
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
