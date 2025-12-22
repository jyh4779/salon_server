import requests

BASE_URL = "http://localhost:3000"
API_KEY_HEADER = {"salon": "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"}
TIMEOUT = 30


def test_auth_token_refresh_functionality():
    login_url = f"{BASE_URL}/auth/login"
    refresh_url = f"{BASE_URL}/auth/refresh"
    headers = {"x-api-key": API_KEY_HEADER["salon"], "Content-Type": "application/json"}

    # Step 1: Log in with valid credentials to get access and refresh tokens
    login_payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status code {login_resp.status_code}"
        login_data = login_resp.json()
        assert "accessToken" in login_data and isinstance(login_data["accessToken"], str), "No accessToken in login response"
        assert "refreshToken" in login_data and isinstance(login_data["refreshToken"], str), "No refreshToken in login response"
        valid_refresh_token = login_data["refreshToken"]
    except Exception as e:
        raise AssertionError(f"Login request failed: {e}")

    # Step 2: Use valid refresh token to get a new access token
    refresh_payload_valid = {"refreshToken": valid_refresh_token}
    try:
        refresh_resp_valid = requests.post(refresh_url, json=refresh_payload_valid, headers=headers, timeout=TIMEOUT)
        assert refresh_resp_valid.status_code == 200, f"Valid refresh token request failed with status {refresh_resp_valid.status_code}"
        refresh_data_valid = refresh_resp_valid.json()
        assert "accessToken" in refresh_data_valid and isinstance(refresh_data_valid["accessToken"], str), "No accessToken in refresh response"
        new_access_token = refresh_data_valid["accessToken"]
        assert new_access_token != login_data["accessToken"], "New access token should differ from old one"
    except Exception as e:
        raise AssertionError(f"Refresh with valid token failed: {e}")

    # Step 3: Use an invalid refresh token and expect failure
    invalid_refresh_token = "invalid_or_expired_token_xyz123"
    refresh_payload_invalid = {"refreshToken": invalid_refresh_token}
    try:
        refresh_resp_invalid = requests.post(refresh_url, json=refresh_payload_invalid, headers=headers, timeout=TIMEOUT)
        assert refresh_resp_invalid.status_code in [400, 401, 403], f"Invalid refresh token did not fail as expected, got status {refresh_resp_invalid.status_code}"
        # Expected error message or structure
        error_data = refresh_resp_invalid.json()
        assert "error" in error_data or "message" in error_data, "Error response lacks expected error or message field"
    except requests.exceptions.JSONDecodeError:
        # Some APIs return empty or non-JSON responses on error; accept non-JSON if status is correct
        pass
    except Exception as e:
        raise AssertionError(f"Refresh with invalid token failed in an unexpected way: {e}")


test_auth_token_refresh_functionality()