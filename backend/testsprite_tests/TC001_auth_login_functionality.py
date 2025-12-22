import requests

BASE_URL = "http://localhost:3000"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    "Content-Type": "application/json",
    API_KEY_NAME: API_KEY_VALUE
}


def test_auth_login_functionality():
    login_url = f"{BASE_URL}/auth/login"

    # Valid credentials test
    valid_payload = {
        "email": "validuser@example.com",
        "password": "ValidPassword123!"
    }
    try:
        valid_response = requests.post(login_url, json=valid_payload, headers=HEADERS, timeout=30)
    except requests.RequestException as e:
        assert False, f"Valid credentials request failed with exception: {e}"

    assert valid_response.status_code == 200, f"Expected 200 OK for valid login, got {valid_response.status_code}"
    try:
        valid_json = valid_response.json()
    except ValueError:
        assert False, "Valid login response did not return valid JSON"
    assert "accessToken" in valid_json and isinstance(valid_json["accessToken"], str) and valid_json["accessToken"], "Access token missing or empty in valid login response"
    assert "refreshToken" in valid_json and isinstance(valid_json["refreshToken"], str) and valid_json["refreshToken"], "Refresh token missing or empty in valid login response"

    # Invalid credentials test
    invalid_payload = {
        "email": "invaliduser@example.com",
        "password": "WrongPassword!"
    }
    try:
        invalid_response = requests.post(login_url, json=invalid_payload, headers=HEADERS, timeout=30)
    except requests.RequestException as e:
        assert False, f"Invalid credentials request failed with exception: {e}"

    # Assuming invalid credentials return 401 Unauthorized or 400 Bad Request with an error message
    assert invalid_response.status_code in (400, 401), f"Expected 400 or 401 for invalid login, got {invalid_response.status_code}"
    try:
        invalid_json = invalid_response.json()
    except ValueError:
        assert False, "Invalid login response did not return valid JSON"
    assert "error" in invalid_json or "message" in invalid_json, "Expected error message in invalid login response"


test_auth_login_functionality()