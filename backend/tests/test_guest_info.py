import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def test_guest_info():
    print("--- Testing Guest Info Persistence ---")
    
    # 1. Create Booking with Guest Info
    check_in = (date.today() + timedelta(days=30)).isoformat()
    check_out = (date.today() + timedelta(days=32)).isoformat()
    
    payload = {
        "check_in": check_in,
        "check_out": check_out,
        "guest_count": 10,
        "policy_type": "full_property_weekday",
        "payment_method": "ONLINE_GATEWAY",
        # New Fields
        "guest_name": "Test Guest",
        "guest_email": "test@guest.com",
        "guest_phone": "555-0101",
        "guest_city": "Test City"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload, timeout=5)
        if resp.status_code != 200:
            print(f"FAIL: Status {resp.status_code}")
            print(resp.text)
            return
            
        data = resp.json()
        booking_id = data["booking_id"]
        print(f"Booking Created: ID {booking_id}")
        
        # 2. Verify Data (Need Admin Token to inspect booking or check DB directly?)
        # Let's use the Admin API to fetch the booking and check fields
        # Login
        auth_resp = requests.post(f"{BASE_URL}/auth/token", data={"username": "admin@villaroli.com", "password": "admin123"})
        token = auth_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get Booking List (or specific booking if endpoint exists)
        # GET /admin/bookings returns list.
        list_resp = requests.get(f"{BASE_URL}/admin/bookings", headers=headers)
        bookings = list_resp.json()
        
        # Find our booking
        booking = next((b for b in bookings if b["id"] == booking_id), None)
        
        if not booking:
            print("FAIL: Booking not found in admin list")
        else:
            # Check fields
            # Note: Admin API response model needs to include these fields too!
            # If Admin API response schema wasn't updated, we won't see them here.
            # But the DB has them.
            print(f"Guest Name: {booking.get('guest_name')}")
            print(f"Guest Email: {booking.get('guest_email')}")
            
            if booking.get("guest_name") == "Test Guest":
                print("PASS: Guest Name persisted")
            else:
                 print("FAIL: Guest Name mismatch (Did you update Admin Response Schema?)")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_guest_info()
