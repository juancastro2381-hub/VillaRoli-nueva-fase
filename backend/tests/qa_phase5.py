import requests
import sys
import time
from datetime import date, timedelta

BASE_URL = "http://localhost:8003"
ADMIN_USER = "admin@villaroli.com"
ADMIN_PASS = "admin123"

def print_result(name, passed, msg=""):
    icon = "OK" if passed else "FAIL"
    text = f"[{icon}] {name}"
    if not passed:
        text += f"\n   Details: {msg}"
    print(text)
    with open("qa_results.log", "a", encoding="utf-8") as f:
        f.write(text + "\n")

def get_admin_token():
    try:
        resp = requests.post(f"{BASE_URL}/auth/token", data={"username": ADMIN_USER, "password": ADMIN_PASS})
        if resp.status_code != 200:
            print(f"Login failed: {resp.text}")
            return None
        return resp.json()["access_token"]
    except Exception as e:
        print(f"Failed to login: {e}")
        return None

def test_strict_rules(token):
    print("\n--- 1. Testing Strict Rules ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Day Pass > 0 nights (Expect Error)
    t1 = date.today() + timedelta(days=1)
    t2 = t1 + timedelta(days=1)
    
    payload = {
        "check_in": str(t1),
        "check_out": str(t2),
        "guest_count": 5,
        "policy_type": "day_pass",
        "property_id": 1,
        "payment_method": "ONLINE_GATEWAY"
    }
    
    resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload, headers=headers)
    passed = resp.status_code == 422
    print_result("Day Pass with Overnight Rejected", passed, f"Status: {resp.status_code}")

    # 2. Day Pass 0 nights (Expect Success)
    payload["check_out"] = str(t1)
    resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload, headers=headers)
    passed = resp.status_code == 200
    print_result("Day Pass 0 Nights Accepted", passed, f"Status: {resp.status_code}")

    # 3. Full Property Min People (Expect Error)
    today = date.today()
    days_ahead = 0 - today.weekday()
    if days_ahead <= 0: days_ahead += 7
    next_monday = today + timedelta(days=days_ahead)
    next_tuesday = next_monday + timedelta(days=1)
    
    payload = {
        "check_in": str(next_monday),
        "check_out": str(next_tuesday),
        "guest_count": 5, # Too few
        "policy_type": "full_property_weekday",
        "property_id": 1,
        "payment_method": "ONLINE_GATEWAY"
    }
    resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload, headers=headers)
    passed = resp.status_code == 422
    print_result("Full Prop Min People Rejected", passed, f"Status: {resp.status_code}")

    return next_monday, next_tuesday # Return dates for override test

def test_admin_override(token, t1, t2):
    print("\n--- 2. Testing Admin Override ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "check_in": str(t1),
        "check_out": str(t2),
        "guest_count": 5, # Invalid
        "policy_type": "full_property_weekday",
        "property_id": 1,
        "is_override": True,
        "override_reason": "QA Test Override"
    }
    
    resp = requests.post(f"{BASE_URL}/admin/bookings", json=payload, headers=headers)
    passed = resp.status_code == 200
    msg = ""
    if passed:
        data = resp.json()
        if "rules_bypassed" in data:
            msg = "Rules Bypassed recorded"
        else:
            passed = False
            msg = "Rules Bypassed missing"
    else:
        msg = f"Status: {resp.status_code} {resp.text}"
        
    print_result("Admin Override Accepted", passed, msg)
    return payload

def test_availability_constraint(token, payload):
    print("\n--- 3. Testing Availability Constraint ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try same payload again (Override=True)
    resp = requests.post(f"{BASE_URL}/admin/bookings", json=payload, headers=headers)
    passed = resp.status_code == 409
    print_result("Availability Bypass Rejected", passed, f"Status: {resp.status_code}")

def test_payment_flows(token):
    print("\n--- 4. Testing Payment Flows ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Bank Transfer
    today = date.today()
    days_ahead = 4 - today.weekday() # Fri
    if days_ahead <= 0: days_ahead += 7
    next_fri = today + timedelta(days=days_ahead)
    next_sun = next_fri + timedelta(days=2)
    
    payload = {
        "check_in": str(next_fri),
        "check_out": str(next_sun),
        "guest_count": 12,
        "policy_type": "full_property_weekend",
        "property_id": 1,
        "payment_method": "BANK_TRANSFER"
    }
    
    resp = requests.post(f"{BASE_URL}/payments/checkout", json=payload, headers=headers)
    if resp.status_code != 200:
        print_result("Bank Transfer Created", False, f"Status: {resp.status_code}")
        return

    data = resp.json()
    booking_id = data.get("booking_id")
    print_result("Bank Transfer Created", True, f"ID: {booking_id}")
    
    # Needs Payment ID to confirm. 
    # Fetch report to find payment ID or just list bookings?
    # Actually, let's fetch reports!
    
def test_reporting(token):
    print("\n--- 5. Testing Reporting ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    resp = requests.get(f"{BASE_URL}/admin/reports/bookings?format=xlsx", headers=headers)
    passed = resp.status_code == 200 and len(resp.content) > 100
    print_result("XLSX Report Generated", passed, f"Size: {len(resp.content)} bytes")

def run_tests():
    token = get_admin_token()
    if not token: return
    
    t1, t2 = test_strict_rules(token)
    payload_used = test_admin_override(token, t1, t2)
    test_availability_constraint(token, payload_used)
    test_payment_flows(token)
    test_reporting(token)

if __name__ == "__main__":
    time.sleep(2)
    run_tests()
