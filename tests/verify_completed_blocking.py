import requests
from datetime import date, timedelta
import sys

BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "admin@villaroli.com"
ADMIN_PASS = "admin123"

def login():
    res = requests.post(f"{BASE_URL}/auth/token", data={
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASS
    })
    return res.json()["access_token"]

def verify_fix():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Create a dummy booking far in the future
    start = date.today() + timedelta(days=365)
    end = start + timedelta(days=2)
    
    print(f"1. Creating Dummy Booking {start} to {end}...")
    payload = {
        "property_id": 1,
        "check_in": str(start),
        "check_out": str(end),
        "guest_count": 2,
        "policy_type": "full_property_weekday",
        "is_override": True,
        "override_reason": "Fix Verification",
        "guest_name": "Fix Test",
        "guest_email": "fix@test.com",
        "guest_phone": "000"
    }
    
    res = requests.post(f"{BASE_URL}/admin/bookings", json=payload, headers=headers)
    if res.status_code != 200:
        print(f"   Failed to create base booking: {res.text}")
        return # Might be already booked, but let's assume we can use it or find it
        
    booking_id = res.json()['booking_id']
    print(f"   Created Booking {booking_id}.")
    
    # 2. Mark as COMPLETED
    print(f"2. Marking Booking {booking_id} as COMPLETED...")
    res_comp = requests.post(f"{BASE_URL}/admin/bookings/{booking_id}/complete", headers=headers)
    if res_comp.status_code != 200:
        print(f"   Failed to complete: {res_comp.text}")
        return

    # 3. Try to Overlap
    print(f"3. Attempting Overlap on COMPLETED booking...")
    res_ov = requests.post(f"{BASE_URL}/admin/bookings", json=payload, headers=headers)
    
    if res_ov.status_code == 409:
        print(f"   SUCCESS: Overlap blocked (409). Fix Verified!")
    elif res_ov.status_code == 200:
        print(f"   FAILURE: Overlap allowed! Fix NOT working.")
    else:
        print(f"   Unknown: {res_ov.status_code} - {res_ov.text}")

if __name__ == "__main__":
    verify_fix()
