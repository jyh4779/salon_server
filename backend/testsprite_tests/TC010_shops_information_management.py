import requests

BASE_URL = "http://localhost:3000"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    API_KEY_NAME: API_KEY_VALUE,
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_shops_information_management():
    # Use a numeric string shop ID to satisfy the validation
    shop_id = "12345"

    # Step 1: Retrieve the shop info using GET /shops/{id}
    get_url = f"{BASE_URL}/shops/{shop_id}"
    get_resp = requests.get(get_url, headers=HEADERS, timeout=TIMEOUT)
    assert get_resp.status_code == 200, f"Failed to get shop info: {get_resp.text}"
    get_data = get_resp.json()

    # Step 2: Update the shop info using PATCH /shops/{id}
    update_payload = {
        "phone": "987-654-3210",
        "description": "Updated shop description for TC010"
    }
    patch_resp = requests.patch(get_url, json=update_payload, headers=HEADERS, timeout=TIMEOUT)
    assert patch_resp.status_code == 200, f"Shop update failed: {patch_resp.text}"
    patch_data = patch_resp.json()

    # Validate updated fields
    assert patch_data.get("phone") == update_payload["phone"], f"Phone not updated: expected {update_payload['phone']}, got {patch_data.get('phone')}"
    assert patch_data.get("description") == update_payload["description"], f"Description not updated: expected {update_payload['description']}, got {patch_data.get('description')}"

    # Step 3: Retrieve again to verify updates persisted
    get_resp_2 = requests.get(get_url, headers=HEADERS, timeout=TIMEOUT)
    assert get_resp_2.status_code == 200, f"Failed to get shop info after update: {get_resp_2.text}"
    get_data_2 = get_resp_2.json()
    assert get_data_2.get("phone") == update_payload["phone"], "Persisted phone update mismatch"
    assert get_data_2.get("description") == update_payload["description"], "Persisted description update mismatch"


test_shops_information_management()