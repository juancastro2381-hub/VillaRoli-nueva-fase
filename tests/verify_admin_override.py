import requests
import sys
import os
from datetime import date, timedelta
import openpyxl
from io import BytesIO

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@villaroli.com" 
ADMIN_PASSWORD = "admin123"

def login():
    print(f"Logging in as {ADMIN_EMAIL}...")
    response = requests.post(f"{BASE_URL}/auth/token", data={
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("Login successful.")
        return token
    else:
        print(f"Login failed: {response.text}")
        sys.exit(1)

def test_create_override_booking(token):
    print("\n--- Testing Admin Override Booking ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try creating a booking in the PAST (Should fail without override)
    past_date = date.today() - timedelta(days=10)
    past_date_end = date.today() - timedelta(days=8)
    
    payload = {
        "property_id": 1,
        "check_in": str(past_date),
        "check_out": str(past_date_end),
        "guest_count": 2,
        "policy_type": "full_property_weekday",
        "is_override": False
    }
    
    print("1. Attempting booking in the past WITHOUT override (Expect Failure)...")
    res = requests.post(f"{BASE_URL}/admin/bookings", json=payload, headers=headers)
    if res.status_code == 400:
        print("   SUCCESS: Request failed as expected.")
    else:
        print(f"   FAILURE: Request returned {res.status_code}: {res.text}")

    # Now with Override
    payload["is_override"] = True
    payload["override_reason"] = "Testing Verification Script - Past Booking"
    
    print("2. Attempting booking in the past WITH override (Expect Failure - Strict Rule)...")
    res = requests.post(f"{BASE_URL}/admin/bookings", json=payload, headers=headers)
    
    if res.status_code == 400:
        print(f"   SUCCESS: Request failed as expected (Strict Rule enforced).")
    else:
        print(f"   FAILURE: Request returned {res.status_code} (Should satisfy strict rule).")
        return None

    # 3. Test Valid Future Booking WITH Override (e.g. Min Nights)
    future_date = date.today() + timedelta(days=30)
    future_date_end = date.today() + timedelta(days=30) # 0 nights (Invalid)
    
    payload["check_in"] = str(future_date)
    payload["check_out"] = str(future_date_end)
    payload["override_reason"] = "Testing Min Nights Override"
    
    print("3. Attempting Future Booking with 0 nights + Override (Expect Success)...")
    res = requests.post(f"{BASE_URL}/admin/bookings", json=payload, headers=headers)

    if res.status_code == 200:
        booking_id = res.json().get("booking_id")
        print(f"   SUCCESS: Booking created with ID {booking_id}")
        return booking_id
    else:
        print(f"   FAILURE: Request returned {res.status_code}: {res.text}")
        return None

def verify_report_columns(token):
    print("\n--- Verifying Excel Report Columns ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    res = requests.get(f"{BASE_URL}/admin/reports/bookings", params={"format": "xlsx"}, headers=headers)
    
    if res.status_code != 200:
        print(f"Failed to download report: {res.status_code}")
        return

    wb = openpyxl.load_workbook(BytesIO(res.content))
    ws = wb.active
    
    # Check headers (Row 1)
    headers_row = [cell.value for cell in ws[1]]
    print(f"Report Headers: {headers_row}")
    
    required_cols = ['Canal', 'Excepción', 'Motivo Excepción', 'Admin ID']
    missing = [col for col in required_cols if col not in headers_row]
    
    if not missing:
        print("   SUCCESS: All new columns found in Excel report.")
    else:
        print(f"   FAILURE: Missing columns: {missing}")

if __name__ == "__main__":
    token = login()
    booking_id = test_create_override_booking(token)
    if booking_id:
        verify_report_columns(token)
