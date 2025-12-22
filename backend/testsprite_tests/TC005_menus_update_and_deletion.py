import requests
import uuid

BASE_URL = "http://localhost:3000"
API_KEY = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    "salon": API_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_menus_update_and_deletion():
    created_menu_id = None
    try:
        # 1. Create a new menu with empty payload as fields are not accepted
        create_payload = {}
        create_resp = requests.post(
            f"{BASE_URL}/menus", 
            headers=HEADERS, 
            json=create_payload, 
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Create menu failed: {create_resp.text}"
        created_menu = create_resp.json()
        created_menu_id = created_menu.get("id")
        assert created_menu_id is not None, "Created menu id missing"

        # 2. Update the created menu with empty payload (no changes)
        update_payload = {}
        update_resp = requests.patch(
            f"{BASE_URL}/menus/{created_menu_id}",
            headers=HEADERS,
            json=update_payload,
            timeout=TIMEOUT
        )
        assert update_resp.status_code == 200, f"Update menu failed: {update_resp.text}"
        updated_menu = update_resp.json()
        # Check id remains the same
        assert updated_menu.get("id") == created_menu_id, "Menu id changed after update"

        # 3. Get menus to verify menu exists
        get_resp = requests.get(
            f"{BASE_URL}/menus",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_resp.status_code == 200, f"Get menus failed: {get_resp.text}"
        menus = get_resp.json()
        matching_menu = next((m for m in menus if m.get("id") == created_menu_id), None)
        assert matching_menu is not None, "Updated menu not found in menus list"

        # 4. Delete the menu
        delete_resp = requests.delete(
            f"{BASE_URL}/menus/{created_menu_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert delete_resp.status_code == 204, f"Delete menu failed: {delete_resp.text}"

        # 5. Verify menu is deleted immediately
        get_resp_after_delete = requests.get(
            f"{BASE_URL}/menus",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_resp_after_delete.status_code == 200, f"Get menus after delete failed: {get_resp_after_delete.text}"
        menus_after_delete = get_resp_after_delete.json()
        deleted_menu = next((m for m in menus_after_delete if m.get("id") == created_menu_id), None)
        assert deleted_menu is None, "Deleted menu still found in menus list"

        # Mark that the menu is deleted so we don't try to delete again in finally
        created_menu_id = None

    finally:
        if created_menu_id:
            try:
                requests.delete(
                    f"{BASE_URL}/menus/{created_menu_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_menus_update_and_deletion()
