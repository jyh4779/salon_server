import requests

BASE_URL = "http://localhost:3000"
API_KEY = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    "salon": API_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_reservations_update_and_deletion():
    reservation_id = None
    try:
        # Step 1: Create a new reservation to update and delete later
        # Fetch customers (get one)
        customers_resp = requests.get(f"{BASE_URL}/customers", headers=HEADERS, timeout=TIMEOUT)
        assert customers_resp.status_code == 200, f"Failed to fetch customers: {customers_resp.text}"
        customers_data = customers_resp.json()
        assert isinstance(customers_data, list) and len(customers_data) > 0, "No customers found"
        customer = customers_data[0]
        customer_id = customer.get("id") or customer.get("customerId") or customer.get("customer_id")
        assert customer_id, "Customer ID not found in response"

        # Fetch shops (get one) to obtain shop_id
        shops_resp = requests.get(f"{BASE_URL}/shops/1", headers=HEADERS, timeout=TIMEOUT)
        if shops_resp.status_code == 200:
            shop_data = shops_resp.json()
            shop_id = shop_data.get("id") or shop_data.get("shopId") or shop_data.get("shop_id")
        else:
            # Fallback: fetch all shops or default
            shops_list_resp = requests.get(f"{BASE_URL}/shops/1", headers=HEADERS, timeout=TIMEOUT)
            if shops_list_resp.status_code == 200:
                shop_data = shops_list_resp.json()
                shop_id = shop_data.get("id") or shop_data.get("shopId") or shop_data.get("shop_id")
            else:
                shop_id = None
        assert shop_id, "Shop ID not found or accessible"

        # Fetch menus (get one)
        menus_resp = requests.get(f"{BASE_URL}/menus", headers=HEADERS, timeout=TIMEOUT)
        assert menus_resp.status_code == 200, f"Failed to fetch menus: {menus_resp.text}"
        menus_data = menus_resp.json()
        assert isinstance(menus_data, list) and len(menus_data) > 0, "No menus found"
        menu = menus_data[0]
        menu_id = menu.get("id") or menu.get("menuId") or menu.get("menu_id")
        assert menu_id, "Menu ID not found in response"

        # Fetch designers (get one)
        designers_resp = requests.get(f"{BASE_URL}/designers", headers=HEADERS, timeout=TIMEOUT)
        assert designers_resp.status_code == 200, f"Failed to fetch designers: {designers_resp.text}"
        designers_data = designers_resp.json()
        assert isinstance(designers_data, list) and len(designers_data) > 0, "No designers found"
        designer = designers_data[0]
        designer_id = designer.get("id") or designer.get("designerId") or designer.get("designer_id")
        assert designer_id, "Designer ID not found in response"

        # Prepare ISO 8601 start_time and end_time
        import datetime
        now = datetime.datetime.utcnow().replace(microsecond=0)
        start_dt = now + datetime.timedelta(days=1, hours=10)  # next day at 10:00
        end_dt = start_dt + datetime.timedelta(hours=1)  # 1 hour duration

        start_time = start_dt.isoformat() + 'Z'
        end_time = end_dt.isoformat() + 'Z'

        # Create a reservation with valid data according to API specs
        create_payload = {
            "shop_id": shop_id,
            "customer_id": customer_id,
            "designer_id": designer_id,
            "menu_id": menu_id,
            "start_time": start_time,
            "end_time": end_time
        }

        create_resp = requests.post(f"{BASE_URL}/reservations", headers=HEADERS, json=create_payload, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Failed to create reservation: {create_resp.text}"
        reservation = create_resp.json()
        reservation_id = reservation.get("id") or reservation.get("reservationId") or reservation.get("reservation_id")
        assert reservation_id, "Created reservation does not have an ID"

        # Step 2: Update reservation details - change status and time
        update_start_dt = start_dt.replace(hour=11)
        update_end_dt = update_start_dt + datetime.timedelta(hours=1)
        update_start_time = update_start_dt.isoformat() + 'Z'
        update_end_time = update_end_dt.isoformat() + 'Z'

        update_payload = {
            "status": "confirmed",
            "start_time": update_start_time,
            "end_time": update_end_time
        }
        update_resp = requests.patch(f"{BASE_URL}/reservations/{reservation_id}", headers=HEADERS, json=update_payload, timeout=TIMEOUT)
        assert update_resp.status_code == 200, f"Failed to update reservation: {update_resp.text}"
        updated_reservation = update_resp.json()
        assert updated_reservation.get("status") == "confirmed", "Reservation status not updated correctly"
        assert updated_reservation.get("start_time") == update_start_time, "Reservation start_time not updated correctly"
        assert updated_reservation.get("end_time") == update_end_time, "Reservation end_time not updated correctly"

        # Step 3: Retrieve the updated reservation and verify changes
        get_resp = requests.get(f"{BASE_URL}/reservations/{reservation_id}", headers=HEADERS, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Failed to retrieve updated reservation: {get_resp.text}"
        get_reservation = get_resp.json()
        assert get_reservation.get("status") == "confirmed", "Retrieved reservation status mismatch"
        assert get_reservation.get("start_time") == update_start_time, "Retrieved reservation start_time mismatch"
        assert get_reservation.get("end_time") == update_end_time, "Retrieved reservation end_time mismatch"

    finally:
        # Step 4: Delete the reservation
        if reservation_id:
            delete_resp = requests.delete(f"{BASE_URL}/reservations/{reservation_id}", headers=HEADERS, timeout=TIMEOUT)
            assert delete_resp.status_code == 204, f"Failed to delete reservation: {delete_resp.text}"

            # Verify deletion by attempting to get the reservation (should return 404 or similar)
            check_resp = requests.get(f"{BASE_URL}/reservations/{reservation_id}", headers=HEADERS, timeout=TIMEOUT)
            assert check_resp.status_code == 404 or check_resp.status_code == 410, "Deleted reservation still accessible"


test_reservations_update_and_deletion()
