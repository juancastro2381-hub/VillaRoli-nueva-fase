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
    if res.status_code != 200:
        print(f"Login failed: {res.text}")
        sys.exit(1)
    return res.json()["access_token"]

def create_booking(token, start, end, is_admin=False, override=False):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Domain payload usually inferred, but for Admin API manual booking we send specific structure
    payload = {
        "property_id": 1,
        "check_in": str(start),
        "check_out": str(end),
        "guest_count": 2,
        "policy_type": "full_property_weekday",
        "is_override": override,
        "override_reason": "Reproduction Test" if override else None,
        "guest_name": "Test User",
        "guest_email": "test@test.com",
        "guest_phone": "123456"
    }
    
    endpoint = "/admin/bookings" if is_admin else "/bookings" # Assuming we test admin endpoint
    res = requests.post(f"{BASE_URL}{endpoint}", json=payload, headers=headers)
    return res

def run_test():
    token = login()
    
    today = date.today()
    start_date = today + timedelta(days=40)
    end_date = today + timedelta(days=42) # 2 nights: [40, 41, 42(out)]
    
    print(f"--- Reproduction Test: Overbooking ---")
    print(f"Testing Range: {start_date} to {end_date}")
    
    # 1. Create Initial Booking (Standard) - Should Success
    print("\n1. creating Initial Booking (Booking A)...")
    res1 = create_booking(token, start_date, end_date, is_admin=True, override=True)
    if res1.status_code != 200:
        print(f"   FATAL: Could not create initial booking. {res1.text}")
        return
    print(f"   SUCCESS: Booking A created. ID: {res1.json().get('booking_id')}")
    
    # 2. Attempt Exact Overlap WITH Override (Booking B) - Should FAIL
    print("\n2. Attempting Exact Overlap WITH Override (Booking B)...")
    res2 = create_booking(token, start_date, end_date, is_admin=True, override=True)
    
    if res2.status_code == 409:
        print(f"   SUCCESS: Booking B blocked (409 Conflict). Overbooking prevent worked.")
    elif res2.status_code == 200:
        print(f"   FAILURE: Booking B created! ID: {res2.json().get('booking_id')}. OVERBOOKING BUG REPRODUCED.")
    else:
        print(f"   Unknown State: {res2.status_code} - {res2.text}")

    # 3. Attempt Partial Overlap WITH Override (Booking C) - Should FAIL
    # Shifted by 1 day: [11, 13] vs [10, 12] -> Overlap on night of 11th
    partial_start = start_date + timedelta(days=1)
    partial_end = end_date + timedelta(days=1)
    
    print(f"\n3. Attempting Partial Overlap {partial_start}-{partial_end} WITH Override (Booking C)...")
    res3 = create_booking(token, partial_start, partial_end, is_admin=True, override=True)
    
    if res3.status_code == 409:
        print(f"   SUCCESS: Booking C blocked (409 Conflict).")
    elif res3.status_code == 200:
        print(f"   FAILURE: Booking C created! ID: {res3.json().get('booking_id')}. OVERBOOKING BUG REPRODUCED.")
    else:
        print(f"   Unknown State: {res3.status_code} - {res3.text}")

    # 4. Test Day Pass Interaction
    # Day Pass on End Date of Nightly Booking
    # Nightly: [10, 12] (Out 12th)
    # Day Pass: [12, 12]
    # Repository logic says: If Day Pass involved, ANY intersection is conflict.
    # So this SHOULD Fail.
    
    dp_date = end_date
    print(f"\n4. Attempting Day Pass on Check-out Date {dp_date} WITH Override (Booking D)...")
    
    # Create manual payload for Day Pass
    # We restart validation flow to be clean or just hit endpoint
    token = login() 
    headers = {"Authorization": f"Bearer {token}"}
    payload_dp = {
        "property_id": 1,
        "check_in": str(dp_date),
        "check_out": str(dp_date),
        "guest_count": 2,
        "policy_type": "day_pass",
        "is_override": True,
        "override_reason": "Day Pass Test",
        "guest_name": "DP User",
        "guest_email": "dp@test.com",
        "guest_phone": "000"
    }
    
    res4 = requests.post(f"{BASE_URL}/admin/bookings", json=payload_dp, headers=headers)
    
    if res4.status_code == 409:
        print(f"   SUCCESS: Booking D blocked (409 Conflict).")
    elif res4.status_code == 200:
        print(f"   FAILURE: Booking D created! ID: {res4.json().get('booking_id')}. Day Pass logic might be loose.")
    else:
        print(f"   Unknown State: {res4.status_code} - {res4.text}")

    # 5. Test COMPLETED Status Vulnerability
    # Create Booking E, Mark as COMPLETED, Try to Overlap with Booking F
    print(f"\n5. Testing COMPLETED Status Vulnerability...")
    start_E = end_date + timedelta(days=5)
    end_E = end_date + timedelta(days=7)
    
    # Create E
    res_E = create_booking(token, start_E, end_E, is_admin=True, override=True)
    if res_E.status_code != 200:
        print(f"   FATAL: Could not create Booking E. {res_E.text}")
        return
        
    id_E = res_E.json()['booking_id']
    print(f"   Booking E created ({id_E}). Marking as COMPLETED...")
    
    # Mark E as COMPLETED
    res_comp = requests.post(f"{BASE_URL}/admin/bookings/{id_E}/complete", headers=headers)
    if res_comp.status_code != 200:
         print(f"   FATAL: Could not complete Booking E. {res_comp.text}")
         return
         
    # Try to overlap F
    print(f"   Attempting overlap on COMPLETED dates (Booking F)...")
    res_F = create_booking(token, start_E, end_E, is_admin=True, override=True)
    
    if res_F.status_code == 409:
        print(f"   SUCCESS: Booking F blocked (COMPLETED status is respected).")
    elif res_F.status_code == 200:
        print(f"   FAILURE: Booking F created! (COMPLETED bookings are ignored in availability check). BUG CONFIRMED.")
    else:
        print(f"   Unknown State: {res_F.status_code} - {res_F.text}")

if __name__ == "__main__":
    run_test()
