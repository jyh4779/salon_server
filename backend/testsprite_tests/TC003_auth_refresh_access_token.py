import requests
import json

BASE_URL = "http://localhost:3000"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
TIMEOUT = 30

headers = {
    API_KEY_NAME: API_KEY_VALUE,
    "Content-Type": "application/json"
}

def test_auth_refresh_access_token():
    # First, login to get valid access and refresh tokens
    login_url = f"{BASE_URL}/auth/login"
    login_data = {
        "email": "valid@example.com",
        "password": "validpassword"
    }
    try:
        login_resp = requests.post(login_url, headers=headers, json=login_data, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status code {login_resp.status_code}"
        login_json = login_resp.json()
        assert "accessToken" in login_json and "refreshToken" in login_json, "Tokens missing in login response"
        valid_refresh_token = login_json["refreshToken"]
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    refresh_url = f"{BASE_URL}/auth/refresh"

    # Test refreshing token with valid refresh token
    valid_refresh_payload = {"refreshToken": valid_refresh_token}
    try:
        refresh_resp = requests.post(refresh_url, headers=headers, json=valid_refresh_payload, timeout=TIMEOUT)
        assert refresh_resp.status_code == 200, f"Refresh failed with valid token, status code {refresh_resp.status_code}"
        refresh_json = refresh_resp.json()
        assert "accessToken" in refresh_json, "Access token missing in refresh response with valid token"
    except requests.RequestException as e:
        assert False, f"Refresh request with valid token failed: {e}"

    # Test refreshing token with invalid refresh token
    invalid_refresh_payload = {"refreshToken": "invalid.token.value"}
    try:
        invalid_resp = requests.post(refresh_url, headers=headers, json=invalid_refresh_payload, timeout=TIMEOUT)
        assert invalid_resp.status_code in (400, 401), f"Expected error status for invalid token but got {invalid_resp.status_code}"
        try:
            error_json = invalid_resp.json()
            assert "error" in error_json or "message" in error_json, "No error message for invalid refresh token"
        except json.JSONDecodeError:
            pass
    except requests.RequestException as e:
        assert False, f"Refresh request with invalid token failed: {e}"

    # Test refreshing token with expired token (simulate by using a well-formed but invalid token)
    expired_refresh_payload = {"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.signature"}
    try:
        expired_resp = requests.post(refresh_url, headers=headers, json=expired_refresh_payload, timeout=TIMEOUT)
        assert expired_resp.status_code in (400, 401), f"Expected error status for expired token but got {expired_resp.status_code}"
        try:
            error_json = expired_resp.json()
            assert "error" in error_json or "message" in error_json, "No error message for expired refresh token"
        except json.JSONDecodeError:
            pass
    except requests.RequestException as e:
        assert False, f"Refresh request with expired token failed: {e}"

test_auth_refresh_access_token()
