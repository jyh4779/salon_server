import requests

BASE_URL = "http://localhost:5173"
API_KEY = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"

HEADERS = {
    "Content-Type": "application/json",
    "salon": API_KEY,
}

def test_auth_login_with_valid_and_invalid_credentials():
    url = f"{BASE_URL}/auth/login"
    
    # Valid credentials - these would normally be a known good user email/password combo
    valid_payload = {
        "email": "validuser@example.com",
        "password": "ValidPassword123!"
    }
    
    # Invalid credentials - invalid email and password
    invalid_payload = {
        "email": "invaliduser@example.com",
        "password": "WrongPassword"
    }
    
    # Test login with valid credentials
    try:
        response_valid = requests.post(url, json=valid_payload, headers=HEADERS, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed for valid credentials: {e}"
    assert response_valid.status_code == 200, f"Expected status 200, got {response_valid.status_code}"
    json_resp_valid = response_valid.json()
    assert "accessToken" in json_resp_valid, "Missing accessToken in successful login response"
    assert "refreshToken" in json_resp_valid, "Missing refreshToken in successful login response"
    assert isinstance(json_resp_valid["accessToken"], str) and len(json_resp_valid["accessToken"]) > 0, "Invalid accessToken value"
    assert isinstance(json_resp_valid["refreshToken"], str) and len(json_resp_valid["refreshToken"]) > 0, "Invalid refreshToken value"
    
    # Test login with invalid credentials
    try:
        response_invalid = requests.post(url, json=invalid_payload, headers=HEADERS, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed for invalid credentials: {e}"
    assert response_invalid.status_code in (400, 401), f"Expected status 400 or 401 for invalid credentials, got {response_invalid.status_code}"
    json_resp_invalid = response_invalid.json()
    # Expecting some error message or error key
    assert ("error" in json_resp_invalid) or ("message" in json_resp_invalid), "Expected error message for invalid login"

test_auth_login_with_valid_and_invalid_credentials()