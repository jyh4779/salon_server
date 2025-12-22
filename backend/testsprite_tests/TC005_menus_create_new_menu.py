import requests
import uuid

BASE_URL = "http://localhost:5173"
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_menus_create_new_menu():
    # Generate unique menu name to avoid conflicts
    unique_suffix = uuid.uuid4().hex[:8]
    valid_menu_data = {
        "name": f"Test Menu {unique_suffix}",
        "category": "Cut",
        "price": 3000,
        "description": "A test menu for haircut services"
    }
    invalid_menu_datas = [
        {},  # Empty payload
        {"price": -100},  # Negative price
        {"name": ""},  # Empty name
        {"name": "Valid Name", "price": "not_a_number"},  # Invalid price type
        {"name": "Valid Name", "price": 1000, "category": 123},  # Invalid category type
    ]

    created_menu_id = None

    try:
        # Create new menu with valid data
        response = requests.post(f"{BASE_URL}/menus", headers=HEADERS, json=valid_menu_data, timeout=TIMEOUT)
        assert response.status_code == 201 or response.status_code == 200, f"Expected 201/200 status code, got {response.status_code}"
        json_resp = response.json()
        # Assuming the API returns created menu data including id
        assert "id" in json_resp, "Response JSON missing 'id'"
        created_menu_id = json_resp["id"]
        assert json_resp.get("name") == valid_menu_data["name"], "Menu name mismatch"
        assert json_resp.get("category") == valid_menu_data["category"], "Menu category mismatch"
        assert json_resp.get("price") == valid_menu_data["price"], "Menu price mismatch"

        # Verify persistence by fetching all menus and checking if created menu exists
        get_resp = requests.get(f"{BASE_URL}/menus", headers=HEADERS, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Expected 200 status code on GET menus, got {get_resp.status_code}"
        menus = get_resp.json()
        assert isinstance(menus, list), "GET /menus did not return a list"
        matching_menus = [m for m in menus if m.get("id") == created_menu_id]
        assert len(matching_menus) == 1, "Created menu not found in menus list"
        menu = matching_menus[0]
        assert menu.get("name") == valid_menu_data["name"], "Persisted menu name mismatch"
        assert menu.get("category") == valid_menu_data["category"], "Persisted menu category mismatch"
        assert menu.get("price") == valid_menu_data["price"], "Persisted menu price mismatch"

        # Test validation errors for invalid inputs
        for invalid_data in invalid_menu_datas:
            err_resp = requests.post(f"{BASE_URL}/menus", headers=HEADERS, json=invalid_data, timeout=TIMEOUT)
            # Expecting client error due to validation (400 or 422)
            assert err_resp.status_code in (400, 422), f"Expected 400/422 for invalid data {invalid_data}, got {err_resp.status_code}"
            # Optionally check error message presence
            err_json = err_resp.json()
            assert "error" in err_json or "message" in err_json, f"No error message in response for invalid data {invalid_data}"

    finally:
        # Clean up - delete created menu if exists
        if created_menu_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/menus/{created_menu_id}", headers=HEADERS, timeout=TIMEOUT)
                # Could be 200, 204 or 202 depending on API design
                assert del_resp.status_code in (200, 204, 202), f"Failed to delete menu with id {created_menu_id}"
            except Exception:
                pass

test_menus_create_new_menu()
