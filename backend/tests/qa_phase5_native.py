import urllib.request
import urllib.parse
import json
import sys
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"
ADMIN_USER = "admin@villaroli.com"
ADMIN_PASS = "admin123"

def print_result(name, passed, msg=""):
    icon = "OK" if passed else "FAIL"
    print(f"[{icon}] {name}")
    if not passed:
        print(f"   Details: {msg}")

def request(method, url, data=None, headers={}):
    try:
        req = urllib.request.Request(f"{BASE_URL}{url}", method=method)
        req.add_header('Content-Type', 'application/json')
        for k, v in headers.items():
            req.add_header(k, v)
        
        if data:
            json_data = json.dumps(data).encode('utf-8')
            req.data = json_data
            
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        print(f"Request Error [{method} {url}]: {e}")
        return 0, str(e)

def run_tests():
    # Login
    print("--- Login ---")
    data = urllib.parse.urlencode({"username": ADMIN_USER, "password": ADMIN_PASS}).encode()
    req = urllib.request.Request(f"{BASE_URL}/auth/token", data=data, method="POST")
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            token_data = json.loads(resp.read().decode())
            token = token_data["access_token"]
    except Exception as e:
        print(f"Login Failed: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Day Pass Overnight (Expect 422)
    t1 = (date.today() + timedelta(days=1)).isoformat()
    t2 = (date.today() + timedelta(days=2)).isoformat()
    payload = {
        "check_in": t1, "check_out": t2, "guest_count": 5,
        "policy_type": "day_pass", "property_id": 1, "payment_method": "ONLINE_GATEWAY"
    }
    status, body = request("POST", "/payments/checkout", payload, headers)
    print_result("Day Pass Overnight Rejected", status == 422, f"Status: {status}")

    # 2. Day Pass 0 Nights (Expect 200)
    payload["check_out"] = t1
    status, body = request("POST", "/payments/checkout", payload, headers)
    print_result("Day Pass 0 Nights Accepted", status == 200, f"Status: {status}")

    # 3. Full Prop Min People (Expect 422)
    payload = {
        "check_in": t1, "check_out": t2, "guest_count": 5,
        "policy_type": "full_property_weekday", "property_id": 1, "payment_method": "ONLINE_GATEWAY"
    }
    status, body = request("POST", "/payments/checkout", payload, headers)
    print_result("Full Prop Min People Rejected", status == 422, f"Status: {status}")

    # 4. Admin Override (Expect 200)
    payload = {
        "check_in": t1, "check_out": t2, "guest_count": 5,
        "policy_type": "full_property_weekday", "property_id": 1,
        "is_override": True, "override_reason": "Native Test"
    }
    status, body = request("POST", "/admin/bookings", payload, headers)
    passed = status == 200
    msg = ""
    if passed:
        resp_json = json.loads(body)
        if "rules_bypassed" in resp_json:
            msg = "Rules Bypassed recorded"
        else:
            passed = False
            msg = "Rules Bypassed missing"
    else:
         msg = f"Status: {status}"
    print_result("Admin Override Accepted", passed, msg)

    # 5. Availability (Expect 409)
    status, body = request("POST", "/admin/bookings", payload, headers)
    print_result("Availability Bypass Rejected", status == 409, f"Status: {status}")

    # 6. Reporting (Expect 200)
    # GET params need manual encoding in URL
    url = "/admin/reports/bookings?format=xlsx"
    try:
        req = urllib.request.Request(f"{BASE_URL}{url}", method="GET")
        for k, v in headers.items():
            req.add_header(k, v)
        with urllib.request.urlopen(req, timeout=10) as response:
            status = response.status
            content = response.read()
            passed = status == 200 and len(content) > 100
            print_result("XLSX Report Generated", passed, f"Size: {len(content)}")
    except Exception as e:
        print_result("XLSX Report Generated", False, str(e))

if __name__ == "__main__":
    run_tests()
