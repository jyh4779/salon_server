import requests
import datetime

BASE_URL = "http://localhost:3000"
API_KEY = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    "salon": API_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_reservations_listing_and_creation():
    # Helper to create a customer (actually a user) (needed to create a reservation)
    def create_customer():
        url = f"{BASE_URL}/users"
        customer_data = {
            "name": "Test Customer",
            "email": "test_customer@example.com"
        }
        resp = requests.post(url, headers=HEADERS, json=customer_data, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert isinstance(data, dict), "Create user response is not a dict"
        assert "id" in data, "Created user response missing 'id'"
        return data.get("id")

    # Helper to create a menu (needed to create a reservation)
    def create_menu():
        url = f"{BASE_URL}/menus"
        menu_data = {
            "name": "Test Menu Item",
            "price": 1000,
            "description": "Test menu description",
            "category": "Haircut"
        }
        resp = requests.post(url, headers=HEADERS, json=menu_data, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert isinstance(data, dict), "Create menu response is not a dict"
        assert "id" in data, "Created menu response missing 'id'"
        return data.get("id")

    # Helper to create a designer (needed to create a reservation)
    def create_designer():
        url = f"{BASE_URL}/designers"
        designer_data = {
            "name": "Test Designer",
            "status": "active"
        }
        resp = requests.post(url, headers=HEADERS, json=designer_data, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert isinstance(data, dict), "Create designer response is not a dict"
        assert "id" in data, "Created designer response missing 'id'"
        return data.get("id")

    # Create required resources
    customer_id = None
    menu_id = None
    designer_id = None
    reservation_id = None
    try:
        customer_id = create_customer()
        assert customer_id is not None, "Failed to create customer"

        menu_id = create_menu()
        assert menu_id is not None, "Failed to create menu"

        designer_id = create_designer()
        assert designer_id is not None, "Failed to create designer"

        # List reservations before creation with a filter (e.g., by customer_id)
        list_url = f"{BASE_URL}/reservations"
        params = {"customerId": customer_id}
        list_resp = requests.get(list_url, headers=HEADERS, params=params, timeout=TIMEOUT)
        assert list_resp.status_code == 200, f"Failed to list reservations, status code: {list_resp.status_code}"
        reservations_before = list_resp.json()
        assert isinstance(reservations_before, list), "Reservations listing response is not a list"

        # Create a reservation
        create_url = f"{BASE_URL}/reservations"
        # Use a future date and a valid time string
        dt = datetime.datetime.utcnow() + datetime.timedelta(days=1)
        date_str = dt.strftime("%Y-%m-%d")
        time_str = "14:00"

        reservation_data = {
            "customerId": customer_id,
            "menuId": menu_id,
            "designerId": designer_id,
            "date": date_str,
            "time": time_str
        }
        create_resp = requests.post(create_url, headers=HEADERS, json=reservation_data, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Failed to create reservation, status code: {create_resp.status_code}"
        reservation = create_resp.json()
        reservation_id = reservation.get("id")
        assert reservation_id is not None, "Created reservation missing id"

        # Validate the created reservation fields
        assert reservation.get("customerId") == customer_id
        assert reservation.get("menuId") == menu_id
        assert reservation.get("designerId") == designer_id
        assert reservation.get("date") == date_str
        assert reservation.get("time") == time_str

        # List reservations again and check the new reservation is included
        list_resp_after = requests.get(list_url, headers=HEADERS, params=params, timeout=TIMEOUT)
        assert list_resp_after.status_code == 200, f"Failed to list reservations after creation, status: {list_resp_after.status_code}"
        reservations_after = list_resp_after.json()
        assert any(r.get("id") == reservation_id for r in reservations_after), "New reservation not found in list"

    finally:
        # Cleanup: delete the created reservation
        if reservation_id:
            try:
                del_res_url = f"{BASE_URL}/reservations/{reservation_id}"
                del_resp = requests.delete(del_res_url, headers=HEADERS, timeout=TIMEOUT)
                assert del_resp.status_code in (200, 204), f"Failed to delete reservation id {reservation_id}"
            except Exception:
                pass

        # Delete created designer
        if designer_id:
            try:
                del_designer_url = f"{BASE_URL}/designers/{designer_id}"
                requests.delete(del_designer_url, headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

        # Delete created menu
        if menu_id:
            try:
                del_menu_url = f"{BASE_URL}/menus/{menu_id}"
                requests.delete(del_menu_url, headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

        # Delete created customer (use /users/{id} endpoint)
        if customer_id:
            try:
                del_customer_url = f"{BASE_URL}/users/{customer_id}"
                requests.delete(del_customer_url, headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass

test_reservations_listing_and_creation()
