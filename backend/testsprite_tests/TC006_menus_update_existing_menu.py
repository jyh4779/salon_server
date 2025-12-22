import requests

BASE_URL = "http://localhost:5173"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    API_KEY_NAME: API_KEY_VALUE,
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_menus_update_existing_menu():
    # Step 1: Create a menu to update
    create_payload = {
        "name": "Test Menu TC006",
        "category": "Cut",
        "price": 3000,
        "description": "Initial description"
    }
    menu_id = None
    try:
        create_resp = requests.post(
            f"{BASE_URL}/menus",
            headers=HEADERS,
            json=create_payload,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201, f"Menu creation failed with status {create_resp.status_code}"
        created_menu = create_resp.json()
        assert "id" in created_menu, "Response does not contain 'id'"
        menu_id = created_menu["id"]

        # Step 2: Update the menu with valid data using PATCH
        update_payload = {
            "name": "Updated Menu Name TC006",
            "price": 3500,
            "description": "Updated description"
        }
        update_resp = requests.patch(
            f"{BASE_URL}/menus/{menu_id}",
            headers=HEADERS,
            json=update_payload,
            timeout=TIMEOUT,
        )
        assert update_resp.status_code == 200, f"Valid update failed with status {update_resp.status_code}"
        updated_menu = update_resp.json()
        # Validate that updated fields are changed appropriately
        assert updated_menu.get("name") == update_payload["name"], "Name was not updated correctly"
        assert updated_menu.get("price") == update_payload["price"], "Price was not updated correctly"
        assert updated_menu.get("description") == update_payload["description"], "Description was not updated correctly"

        # Step 3: Attempt invalid updates and verify rejection (e.g. negative price)
        invalid_update_payload = {
            "price": -1000
        }
        invalid_resp = requests.patch(
            f"{BASE_URL}/menus/{menu_id}",
            headers=HEADERS,
            json=invalid_update_payload,
            timeout=TIMEOUT,
        )
        # Assuming the API returns 400 Bad Request for invalid input
        assert invalid_resp.status_code == 400, f"Invalid update did not return 400, got {invalid_resp.status_code}"

        # Step 4: Attempt invalid updates with invalid field type
        invalid_type_payload = {
            "price": "not_a_number"
        }
        invalid_type_resp = requests.patch(
            f"{BASE_URL}/menus/{menu_id}",
            headers=HEADERS,
            json=invalid_type_payload,
            timeout=TIMEOUT,
        )
        assert invalid_type_resp.status_code == 400, f"Invalid type update did not return 400, got {invalid_type_resp.status_code}"

    finally:
        # Cleanup: delete the created menu if it exists
        if menu_id:
            requests.delete(
                f"{BASE_URL}/menus/{menu_id}",
                headers=HEADERS,
                timeout=TIMEOUT,
            )


test_menus_update_existing_menu()