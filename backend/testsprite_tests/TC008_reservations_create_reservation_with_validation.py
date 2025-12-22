import requests
from datetime import datetime, timedelta
import uuid

BASE_URL = "http://localhost:5173"
API_KEY_NAME = "salon"
API_KEY_VALUE = "sk-user-Ll1YI7uDekFHbPB4tAvhMtuVCZKp3xdX8v_2DVxaMoMrSoRyVpVbZ7A0Gc9nWro8M8Qtq33YrZ1ovU6dNbbgWJUvHaxHUXxBMgNtnA734LEjWZ-wAjoLneipKwBY7Jwd9AI"
HEADERS = {
    API_KEY_NAME: API_KEY_VALUE,
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_create_reservation_with_validation():
    # Create a designer to assign reservation to
    designer_payload = {
        "name": f"TestDesigner-{uuid.uuid4().hex[:8]}",
        "working_hours": [
            {"day": "Monday", "start": "09:00", "end": "18:00"},
            {"day": "Tuesday", "start": "09:00", "end": "18:00"},
            {"day": "Wednesday", "start": "09:00", "end": "18:00"},
            {"day": "Thursday", "start": "09:00", "end": "18:00"},
            {"day": "Friday", "start": "09:00", "end": "18:00"}
        ]
    }
    designer_id = None
    reservation_id = None

    try:
        # Step 1: create a designer (required for reservation)
        resp = requests.post(
            f"{BASE_URL}/designers",
            headers=HEADERS,
            json=designer_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Failed to create designer: {resp.text}"
        designer_data = resp.json()
        designer_id = designer_data.get("id")
        assert designer_id, "Designer ID is missing in creation response"

        # Step 2: create a valid reservation within business hours, no overlap

        # Calculate a valid future datetime (next Monday 10 AM)
        today = datetime.utcnow()
        # Find next Monday
        days_ahead = (0 - today.weekday() + 7) % 7
        if days_ahead == 0:
            days_ahead = 7
        reservation_date = (today + timedelta(days=days_ahead)).replace(hour=10, minute=0, second=0, microsecond=0)

        reservation_payload = {
            "designerId": designer_id,
            "customerName": "John Doe",
            "service": "Haircut",
            "startTime": reservation_date.isoformat() + "Z",
            "endTime": (reservation_date + timedelta(hours=1)).isoformat() + "Z",
            "notes": "No special requests"
        }

        resp = requests.post(
            f"{BASE_URL}/reservations",
            headers=HEADERS,
            json=reservation_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 201, f"Valid reservation creation failed: {resp.text}"
        reservation_data = resp.json()
        reservation_id = reservation_data.get("id")
        assert reservation_id, "Reservation ID missing in creation response"

        # Step 3: attempt to create overlapping reservation - should fail validation
        overlapping_payload = dict(reservation_payload)
        # Overlapping by 30 minutes
        overlapping_start = reservation_date + timedelta(minutes=30)
        overlapping_payload["startTime"] = overlapping_start.isoformat() + "Z"
        overlapping_payload["endTime"] = (overlapping_start + timedelta(hours=1)).isoformat() + "Z"

        resp = requests.post(
            f"{BASE_URL}/reservations",
            headers=HEADERS,
            json=overlapping_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 400 or resp.status_code == 409, \
            f"Expected overlapping reservation to be rejected, but got {resp.status_code}: {resp.text}"

        # Step 4: attempt to create reservation outside of business hours - should fail validation
        outside_hours_payload = dict(reservation_payload)
        # Set reservation at 8:00 AM (before 9:00 AM start)
        outside_start = reservation_date.replace(hour=8)
        outside_hours_payload["startTime"] = outside_start.isoformat() + "Z"
        outside_hours_payload["endTime"] = (outside_start + timedelta(hours=1)).isoformat() + "Z"

        resp = requests.post(
            f"{BASE_URL}/reservations",
            headers=HEADERS,
            json=outside_hours_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 400, \
            f"Expected reservation outside business hours to be rejected, but got {resp.status_code}: {resp.text}"

        # Step 5: attempt to create reservation with invalid input (missing required field)
        invalid_payload = {
            # missing designerId
            "customerName": "Jane Doe",
            "service": "Haircut",
            "startTime": reservation_date.isoformat() + "Z",
            "endTime": (reservation_date + timedelta(hours=1)).isoformat() + "Z"
        }

        resp = requests.post(
            f"{BASE_URL}/reservations",
            headers=HEADERS,
            json=invalid_payload,
            timeout=TIMEOUT
        )
        assert resp.status_code == 400, \
            f"Expected reservation creation with missing fields to fail, but got {resp.status_code}: {resp.text}"

    finally:
        # Cleanup: delete created reservation if it exists
        if reservation_id:
            try:
                resp = requests.delete(
                    f"{BASE_URL}/reservations/{reservation_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                # 200, 204 or 404 acceptable (404 means already deleted)
                assert resp.status_code in (200, 204, 404)
            except Exception:
                pass

        # Cleanup: delete created designer if it exists
        if designer_id:
            try:
                resp = requests.patch(
                    f"{BASE_URL}/designers/{designer_id}",
                    headers=HEADERS,
                    json={"disabled": True},
                    timeout=TIMEOUT
                )
                # No delete endpoint specified, mark as disabled if possible.
                assert resp.status_code in (200, 204, 400, 404)
            except Exception:
                pass

test_create_reservation_with_validation()