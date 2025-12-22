import requests

BASE_URL = "http://localhost:3000"
API_KEY = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    "salon": API_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_designers_management():
    # Step 1: List all designers (initial)
    try:
        resp = requests.get(f"{BASE_URL}/designers", headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        designers_initial = resp.json()
        assert isinstance(designers_initial, list)
    except Exception as e:
        assert False, f"Failed to list designers initially: {e}"

    # Step 2: Create a new designer
    new_designer_payload = {
        "name": "Test Designer",
        "status": "active"
    }
    designer_id = None

    try:
        resp = requests.post(f"{BASE_URL}/designers", headers=HEADERS, json=new_designer_payload, timeout=TIMEOUT)
        resp.raise_for_status()
        created_designer = resp.json()
        assert "id" in created_designer
        designer_id = created_designer["id"]
        # Validate returned fields
        assert created_designer.get("name") == new_designer_payload["name"]

        # Step 3: Update designer info including status change to inactive
        update_payload = {
            "name": "Updated Designer",
            "status": "inactive"
        }
        resp = requests.patch(f"{BASE_URL}/designers/{designer_id}", headers=HEADERS, json=update_payload, timeout=TIMEOUT)
        resp.raise_for_status()
        updated_designer = resp.json()
        assert updated_designer.get("id") == designer_id
        assert updated_designer.get("name") == update_payload["name"]
        assert updated_designer.get("status") == update_payload["status"]

        # Step 4: List designers again - the updated designer should be present with new data
        resp = requests.get(f"{BASE_URL}/designers", headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        designers_after_update = resp.json()
        found = False
        for d in designers_after_update:
            if d.get("id") == designer_id:
                assert d.get("name") == update_payload["name"]
                assert d.get("status") == update_payload["status"]
                found = True
                break
        assert found, "Updated designer not found in list"

        # Step 5: Verify status affects reservation creation
        # Try to create a reservation with this designer (should fail if inactive)
        reservation_payload = {
            "customerId": 1,  # dummy id, assuming exists
            "menuId": 1,      # dummy id, assuming exists
            "designerId": designer_id,
            "date": "2099-12-31",
            "time": "10:00"
        }
        resp = requests.post(f"{BASE_URL}/reservations", headers=HEADERS, json=reservation_payload, timeout=TIMEOUT)
        # For inactive designer, reservation creation should fail with client error (4xx)
        if update_payload["status"] == "inactive":
            assert 400 <= resp.status_code < 500
        else:
            resp.raise_for_status()
            new_reservation = resp.json()
            assert "id" in new_reservation
            # Clean up the created reservation
            res_id = new_reservation["id"]
            requests.delete(f"{BASE_URL}/reservations/{res_id}", headers=HEADERS, timeout=TIMEOUT)

    finally:
        # Cleanup: No DELETE for designer as API does not support it
        pass


test_designers_management()
