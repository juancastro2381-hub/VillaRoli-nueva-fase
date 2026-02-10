import requests
import sys

BASE_URL = "http://localhost:8002"

def print_result(name, passed, msg=""):
    icon = "✅" if passed else "❌"
    print(f"{icon} {name}: {msg}")
    if not passed:
        print(f"   Details: {msg}")

def get_admin_token():
    try:
        resp = requests.post(f"{BASE_URL}/auth/token", data={"username": "admin@villaroli.com", "password": "admin123"})
        return resp.json()["access_token"]
    except Exception as e:
        print(f"Failed to login: {e}")
        return None

def test_strict_rules(token):
    print("\n--- Testing Strict Rules ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Day Pass > 0 nights
    # Currently public bookings are at /payments/checkout or /bookings
    # Let's test via /payments/checkout which uses BookingRequest
    
    payload = {
        "check_in": "2026-08-01",
        "check_out": "2026-08-02", # 1 night
        "guest_count": 5,
        "policy_type": "day_pass" # Wait, BookingPolicy enum values? Need to check values.
    }
    # Values: full_property_weekday, etc. 
    # Can I send day_pass? I need to check enum. 
    # Ah, I see BookingPolicy in models.py: family_plan, full_property_...
    # Did I add DAY_PASS to enum?
    # Let me check valid enum values first in models.py.
    
    # Assuming DAY_PASS might NOT be in enum yet? Gap Analysis said "Day Pass (0 nights) ... Logic exists".
    # I should check models.py enum values.
    pass

def run_tests():
    # Helper to check enum
    # For now, let's assume we test what IS implemented.
    pass

if __name__ == "__main__":
    print("Please run this script after starting the server on port 8002.")
