import requests

BASE_URL = "http://localhost:3000"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
TIMEOUT = 30

def test_auth_logout_functionality():
    login_url = f"{BASE_URL}/auth/login"
    logout_url = f"{BASE_URL}/auth/logout"

    headers = {
        "Content-Type": "application/json",
        API_KEY_NAME: API_KEY_VALUE
    }

    # Use valid login credentials for testing logout (must exist in system)
    # Since no user credentials are specified, we must assume some test user exists.
    # For demonstration, use example credentials
    login_payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }

    try:
        # Step 1: Login the user to get access token (and possibly refresh token)
        login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status code {login_resp.status_code}"
        login_data = login_resp.json()
        access_token = login_data.get("access_token")
        refresh_token = login_data.get("refresh_token")

        assert access_token is not None and isinstance(access_token, str) and access_token != "", "No access token returned"
        # refresh token may or may not be returned depending on API design, so just optional check
        assert refresh_token is not None and isinstance(refresh_token, str) and refresh_token != "", "No refresh token returned"

        # Step 2: Logout the user with the access token
        logout_headers = {
            API_KEY_NAME: API_KEY_VALUE,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        logout_resp = requests.post(logout_url, headers=logout_headers, timeout=TIMEOUT)
        # Expect successful logout status code, e.g., 200 or 204
        assert logout_resp.status_code in (200, 204), f"Logout failed with status code {logout_resp.status_code}"

        # Step 3: Verify tokens are invalidated by attempting a protected call with the same token
        # Try to call logout again with same token - should fail as token is invalidated or return 401
        repeated_logout_resp = requests.post(logout_url, headers=logout_headers, timeout=TIMEOUT)
        # Expect unauthorized or token invalidation error (401 or 403)
        assert repeated_logout_resp.status_code == 401 or repeated_logout_resp.status_code == 403, \
            f"Token was not invalidated after logout, status code {repeated_logout_resp.status_code}"

    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Test auth logout functionality failed: {e}")

test_auth_logout_functionality()