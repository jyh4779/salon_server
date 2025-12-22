import requests
import datetime

BASE_URL = "http://localhost:5173"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
TIMEOUT = 30

headers = {
    API_KEY_NAME: API_KEY_VALUE,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

def create_reservation():
    # Create a new reservation to test completion
    # Minimal required payload inferred by typical reservation data (approximation)
    now = datetime.datetime.utcnow()
    start_time = (now + datetime.timedelta(hours=1)).isoformat() + "Z"
    end_time = (now + datetime.timedelta(hours=2)).isoformat() + "Z"
    reservation_payload = {
        "customerId": 1,         # Assumed existing customer ID; replace if needed
        "designerId": 1,         # Assumed existing designer ID; replace if needed
        "menuIds": [1],          # Assumed existing menu IDs; replace if needed
        "startAt": start_time,
        "endAt": end_time,
        "status": "pending",
        "notes": "Test reservation for completion"
    }
    response = requests.post(f"{BASE_URL}/reservations", json=reservation_payload, headers=headers, timeout=TIMEOUT)
    response.raise_for_status()
    reservation = response.json()
    return reservation

def delete_reservation(reservation_id):
    resp = requests.delete(f"{BASE_URL}/reservations/{reservation_id}", headers=headers, timeout=TIMEOUT)
    if resp.status_code not in (200, 204):
        # Attempt to log or raise error
        resp.raise_for_status()

def test_reservations_complete_reservation_with_payment():
    reservation = None
    try:
        reservation = create_reservation()
        reservation_id = reservation.get("id")
        assert reservation_id is not None, "Created reservation must have an ID"

        # Prepare payment data assuming typical structure (e.g., paymentMethodId, amount, etc.)
        # Since no exact schema is provided, we infer a minimal example:
        payment_payload = {
            "paymentMethod": "credit_card",
            "amount": reservation.get("totalPrice", 100),  # Use totalPrice or fallback assumed amount
            "transactionId": "TXN1234567890"
        }

        complete_url = f"{BASE_URL}/reservations/{reservation_id}/complete"
        response = requests.post(complete_url, json=payment_payload, headers=headers, timeout=TIMEOUT)

        # Validate success
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        completed_reservation = response.json()

        # Verify reservation status updated to completed (assumed 'completed')
        status = completed_reservation.get("status")
        assert status == "completed", f"Expected status 'completed', got '{status}'"

        # Verify payment records exist and match input
        payment_info = completed_reservation.get("payment")
        assert payment_info is not None, "Payment info must be present after completion"
        assert payment_info.get("paymentMethod") == payment_payload["paymentMethod"]
        assert payment_info.get("amount") == payment_payload["amount"]
        assert payment_info.get("transactionId") == payment_payload["transactionId"]

    finally:
        if reservation:
            delete_reservation(reservation.get("id"))

test_reservations_complete_reservation_with_payment()