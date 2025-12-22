import requests

BASE_URL = "http://localhost:5173"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    API_KEY_NAME: API_KEY_VALUE,
    "Accept": "application/json"
}
TIMEOUT = 30

def test_get_all_menus_for_shop():
    # Step 1: Create a menu to ensure there is at least one menu for the shop
    menu_create_payload = {
        "name": "Test Menu TC004",
        "category": "Test Category",
        "price": 1000,
        "description": "Temporary menu for test case TC004"
    }
    create_response = requests.post(f"{BASE_URL}/menus", headers=HEADERS, json=menu_create_payload, timeout=TIMEOUT)
    assert create_response.status_code == 201, f"Menu creation failed with status {create_response.status_code}"
    created_menu = create_response.json()
    created_menu_id = created_menu.get("id")
    assert created_menu_id is not None, "Created menu response does not contain 'id'"

    try:
        # Step 2: GET all menus for the shop
        get_response = requests.get(f"{BASE_URL}/menus", headers=HEADERS, timeout=TIMEOUT)
        assert get_response.status_code == 200, f"GET /menus failed with status {get_response.status_code}"
        menus = get_response.json()
        assert isinstance(menus, list), "Response should be a list of menus"
        assert any(menu.get("id") == created_menu_id for menu in menus), "Created menu not found in menus list"

        # Step 3: Validate data structure of each menu item
        required_fields = {"id", "name", "category", "price", "description"}
        for menu in menus:
            assert isinstance(menu, dict), "Each menu should be a dict"
            missing_fields = required_fields - menu.keys()
            assert not missing_fields, f"Missing fields in menu: {missing_fields}"
            assert isinstance(menu["id"], int) or isinstance(menu["id"], str), "Menu 'id' should be int or str"
            assert isinstance(menu["name"], str) and menu["name"], "Menu 'name' should be a non-empty string"
            assert isinstance(menu["category"], str), "Menu 'category' should be a string"
            assert isinstance(menu["price"], (int, float)) and menu["price"] >= 0, "Menu 'price' should be non-negative number"
            assert isinstance(menu["description"], str), "Menu 'description' should be a string"
    finally:
        # Cleanup: Delete the created menu
        del_response = requests.delete(f"{BASE_URL}/menus/{created_menu_id}", headers=HEADERS, timeout=TIMEOUT)
        assert del_response.status_code == 204, f"Menu deletion failed with status {del_response.status_code}"

test_get_all_menus_for_shop()