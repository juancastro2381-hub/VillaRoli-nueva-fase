import requests
import sys
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@villaroli.com"
ADMIN_PASS = "admin123"

def log(msg, success=True):
    icon = "✅" if success else "❌"
    print(f"{icon} {msg}")

def test_health():
    try:
        resp = requests.get(f"{BASE_URL}/")
        if resp.status_code == 200:
            log("Backend Health Check Passed")
            return True
        else:
            log(f"Backend Health Failed: {resp.status_code}", False)
            return False
    except Exception as e:
        log(f"Backend Connection Failed: {e}", False)
        return False

def test_auth():
    payload = {"username": ADMIN_EMAIL, "password": ADMIN_PASS}
    resp = requests.post(f"{BASE_URL}/auth/token", data=payload) # OAuth2 uses form data
    if resp.status_code == 200:
        token = resp.json().get("access_token")
        log("Authentication Passed")
        return token
    else:
        log(f"Authentication Failed: {resp.text}", False)
        return None

def test_booking_rules(token):
    # 1. Past Date
    past_date = (date.today() - timedelta(days=5)).isoformat()
    payload = {
        "check_in": past_date,
        "check_out": (date.today() - timedelta(days=4)).isoformat(),
        "guest_count": 10,
        "policy_type": "full_property_weekend",
        "guest_name": "QA Tester",
        "email": "qa@test.com",
        "payment_method": "ONLINE_GATEWAY",
        "payment_type": "FULL"
    }
    
    resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload)
    if resp.status_code == 422 and "PAST_DATE_NOT_ALLOWED" in resp.text:
        log("Rule: Past Date Blocked correctly")
    else:
        log(f"Rule: Past Date check Failed. Code: {resp.status_code}, Body: {resp.text}", False)

    # 2. Valid Booking (Next Month)
    # Fri-Sun in next month (ensure it's valid for weekend plan)
    # Let's just pick a safe date far in future. 
    # Use 2026 dates (as per Holidays config) or just far future.
    # App config uses HOLIDAYS_2026. 
    # Let's try to book a standard weekend in 2026.
    start_date = "2026-05-15" # Friday
    end_date = "2026-05-17"   # Sunday
    
    payload["check_in"] = start_date
    payload["check_out"] = end_date
    
    resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload)
    if resp.status_code == 200:
        log("Valid Booking & Payment Checkout Session Created")
        data = resp.json()
        log(f"  > Payment URL: {data.get('payment_url')}")
        log(f"  > Status: {data.get('status')}")
        return start_date, end_date
    else:
        log(f"Valid Booking Failed. Code: {resp.status_code}, Body: {resp.text}", False)
        return None, None

def test_overbooking(start, end):
    if not start: return
    
    payload = {
        "check_in": start,
        "check_out": end,
        "guest_count": 10,
        "policy_type": "full_property_weekend",
        "guest_name": "QA Tester 2",
        "email": "qa2@test.com",
        "payment_method": "ONLINE_GATEWAY",
         "payment_type": "FULL"
    }
    
    # Try to book same dates
    resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload)
    
    # Needs to fail with 409
    if resp.status_code == 409 or (resp.status_code == 422 and "OVERBOOKING" in resp.text):
         log("Rule: Overbooking Blocked correctly")
    else:
         log(f"Rule: Overbooking check Failed. Code: {resp.status_code}, Body: {resp.text}", False)

def main():
    if not test_health():
        sys.exit(1)
        
    token = test_auth()
    if not token:
        sys.exit(1)
        
    start, end = test_booking_rules(token)
    test_overbooking(start, end)

if __name__ == "__main__":
    main()
