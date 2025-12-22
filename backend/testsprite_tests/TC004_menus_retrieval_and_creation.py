import requests

BASE_URL = "http://localhost:3000"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    API_KEY_NAME: API_KEY_VALUE,
    "Content-Type": "application/json",
}

def test_menus_retrieval_and_creation():
    # Retrieve current menus
    try:
        resp_get = requests.get(f"{BASE_URL}/menus", headers=HEADERS, timeout=30)
        resp_get.raise_for_status()
        menus_before = resp_get.json()
        assert isinstance(menus_before, list), "Menus response should be a list"
    except requests.RequestException as e:
        assert False, f"Failed to retrieve menus: {e}"

    # Prepare new menu data with a category
    new_menu_data = {
        "name": "Relaxing Swedish Massage",
        "price": 8500,
        "category": "Massage",
        "description": "A one hour Swedish massage to relax muscles and mind.",
        "duration_minutes": 60
    }

    created_menu_id = None
    try:
        # Create new menu
        resp_post = requests.post(f"{BASE_URL}/menus", headers=HEADERS, json=new_menu_data, timeout=30)
        resp_post.raise_for_status()
        menu_created = resp_post.json()
        created_menu_id = menu_created.get("id")
        assert created_menu_id is not None, "Created menu should return an 'id'"
        # Validate created menu fields
        assert menu_created.get("name") == new_menu_data["name"]
        assert menu_created.get("price") == new_menu_data["price"]
        assert menu_created.get("category") == new_menu_data["category"]

        # Retrieve menus again to check if new menu is listed
        resp_get_after = requests.get(f"{BASE_URL}/menus", headers=HEADERS, timeout=30)
        resp_get_after.raise_for_status()
        menus_after = resp_get_after.json()
        assert any(menu.get("id") == created_menu_id for menu in menus_after), "Created menu should be in the menus list"
    except requests.RequestException as e:
        assert False, f"Failed during menu creation or verification: {e}"
    finally:
        # Clean up: delete the created menu if exists
        if created_menu_id is not None:
            try:
                resp_delete = requests.delete(f"{BASE_URL}/menus/{created_menu_id}", headers=HEADERS, timeout=30)
                if resp_delete.status_code not in (200, 204):
                    print(f"Warning: Failed to delete test menu with id {created_menu_id}. Status code: {resp_delete.status_code}")
            except requests.RequestException as cleanup_error:
                print(f"Warning: Exception during cleanup deleting menu: {cleanup_error}")

test_menus_retrieval_and_creation()
