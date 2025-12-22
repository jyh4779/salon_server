import requests

BASE_URL = "http://localhost:5173"
LOGIN_EMAIL = "test@example.com"
LOGIN_PASSWORD = "testpassword"


def get_auth_token():
    login_payload = {
        "email": LOGIN_EMAIL,
        "password": LOGIN_PASSWORD
    }
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=login_payload,
        timeout=30
    )
    assert response.status_code == 200, f"Login failed: {response.status_code} {response.text}"
    data = response.json()
    access_token = data.get("access_token") or data.get("accessToken")
    assert access_token is not None, "No access token received from login"
    return access_token


def test_tc007_menus_delete_menu():
    access_token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    menu_data = {
        "name": "Test Menu Delete",
        "price": 1000,
        "category": "Test Category"
    }
    created_menu_id = None

    try:
        # Step 1: Create a new menu to delete
        create_response = requests.post(
            f"{BASE_URL}/menus",
            headers=headers,
            json=menu_data,
            timeout=30
        )
        assert create_response.status_code == 201 or create_response.status_code == 200, \
            f"Menu creation failed: {create_response.status_code} {create_response.text}"
        created_menu = create_response.json()
        created_menu_id = created_menu.get("id")
        assert created_menu_id is not None, "Created menu ID is None"

        # Step 2: Delete the created menu
        delete_response = requests.delete(
            f"{BASE_URL}/menus/{created_menu_id}",
            headers=headers,
            timeout=30
        )
        assert delete_response.status_code == 200 or delete_response.status_code == 204, \
            f"Menu deletion failed: {delete_response.status_code} {delete_response.text}"

        # Step 3: Verify the menu no longer exists
        get_response = requests.get(
            f"{BASE_URL}/menus/{created_menu_id}",
            headers=headers,
            timeout=30
        )
        # Expecting 404 not found or similar error indicating deletion
        assert get_response.status_code == 404 or get_response.status_code == 400, \
            f"Deleted menu still accessible: {get_response.status_code} {get_response.text}"

    finally:
        # Cleanup: Ensure the menu is deleted if it still exists
        if created_menu_id is not None:
            try:
                requests.delete(
                    f"{BASE_URL}/menus/{created_menu_id}",
                    headers=headers,
                    timeout=30
                )
            except Exception:
                pass


test_tc007_menus_delete_menu()
