import requests

BASE_URL = "http://localhost:3000"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    API_KEY_NAME: API_KEY_VALUE,
    "Content-Type": "application/json",
}

def test_reservation_completion_with_payment():
    # Step 1: Get a customer to be used in the reservation
    resp = requests.get(f"{BASE_URL}/customers", headers=HEADERS, timeout=30)
    resp.raise_for_status()
    customers = resp.json()
    assert customers and isinstance(customers, list) and len(customers) > 0, "No customers found"
    customer = customers[0]
    customer_id = customer.get("id")
    assert customer_id is not None, "Customer id missing"

    # Step 2: Get a designer to assign
    resp = requests.get(f"{BASE_URL}/designers", headers=HEADERS, timeout=30)
    resp.raise_for_status()
    designers = resp.json()
    assert designers and isinstance(designers, list) and len(designers) > 0, "No designers found"
    designer = designers[0]
    designer_id = designer.get("id")
    assert designer_id is not None, "Designer id missing"

    # Step 3: Get a menu for reservation
    resp = requests.get(f"{BASE_URL}/menus", headers=HEADERS, timeout=30)
    resp.raise_for_status()
    menus = resp.json()
    assert menus and isinstance(menus, list) and len(menus) > 0, "No menus found"
    menu = menus[0]
    menu_id = menu.get("id")
    assert menu_id is not None, "Menu id missing"

    reservation_id = None
    try:
        # Step 4: Create a reservation for completion test
        reservation_payload = {
            "customerId": customer_id,
            "designerId": designer_id,
            "menuId": menu_id,
            "datetime": "2025-12-31T10:00:00+09:00",
            "status": "confirmed"
        }
        resp = requests.post(f"{BASE_URL}/reservations", headers=HEADERS, json=reservation_payload, timeout=30)
        resp.raise_for_status()
        reservation = resp.json()
        reservation_id = reservation.get("id")
        assert reservation_id is not None, "Failed to create reservation for test"

        # Step 5: Complete the reservation with payment
        payment_data = {
            "paymentMethod": "credit_card",
            "amount": menu.get("price", 0),
            "paidAt": "2025-12-31T11:00:00+09:00"
        }
        resp = requests.post(f"{BASE_URL}/reservations/{reservation_id}/complete", headers=HEADERS, json=payment_data, timeout=30)
        resp.raise_for_status()
        completion_response = resp.json()

        # Validate the reservation status is updated to completed
        assert completion_response.get("status") == "completed", "Reservation status not updated to completed"

        # Validate payment details recorded correctly
        payment = completion_response.get("payment")
        assert payment is not None, "Payment info missing in completion response"
        assert payment.get("paymentMethod") == payment_data["paymentMethod"], "Payment method mismatch"
        assert payment.get("amount") == payment_data["amount"], "Payment amount mismatch"
    finally:
        # Clean up - delete the reservation if created
        if reservation_id:
            try:
                requests.delete(f"{BASE_URL}/reservations/{reservation_id}", headers=HEADERS, timeout=30)
            except Exception:
                pass

test_reservation_completion_with_payment()
