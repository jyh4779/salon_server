import requests

BASE_URL = "http://localhost:5173"
API_KEY = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
TIMEOUT = 30

def test_sales_get_daily_sales_report():
    url = f"{BASE_URL}/sales/daily"
    headers = {
        "salon": API_KEY
    }

    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = response.json()

        # Validate top-level keys presence
        assert isinstance(data, dict), "Response JSON should be a dictionary"
        assert "date" in data, "'date' key missing in response"
        assert "totalSales" in data, "'totalSales' key missing in response"
        assert "paymentMethodRatios" in data, "'paymentMethodRatios' key missing in response"

        # Validate date format: should be a non-empty string
        assert isinstance(data["date"], str) and data["date"], "'date' should be a non-empty string"

        # Validate totalSales: should be a number >= 0
        total_sales = data["totalSales"]
        assert isinstance(total_sales, (int, float)) and total_sales >= 0, "'totalSales' should be a non-negative number"

        # Validate paymentMethodRatios: dict with string keys and float values between 0 and 1
        payment_ratios = data["paymentMethodRatios"]
        assert isinstance(payment_ratios, dict), "'paymentMethodRatios' should be a dictionary"
        total_ratio = 0.0
        for method, ratio in payment_ratios.items():
            assert isinstance(method, str) and method, "Payment method keys must be non-empty strings"
            assert isinstance(ratio, (int, float)), f"Ratio for {method} must be a number"
            assert 0.0 <= ratio <= 1.0, f"Ratio for {method} must be between 0 and 1"
            total_ratio += ratio

        # The sum of all payment method ratios should be close to 1 (allowing small floating point errors)
        assert abs(total_ratio - 1.0) < 0.01, f"Sum of payment method ratios must be close to 1, got {total_ratio}"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    except ValueError:
        assert False, "Response is not a valid JSON"

test_sales_get_daily_sales_report()