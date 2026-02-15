import requests
import sys

BASE_URL = "http://localhost:8000"

# Login function to get token
def login(username, password):
    data = {"username": username, "password": password}
    response = requests.post(f"{BASE_URL}/auth/token", data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.text}")
        sys.exit(1)

def test_exports(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing PDF Export...")
    res_pdf = requests.get(f"{BASE_URL}/admin/reports/bookings?format=pdf", headers=headers)
    if res_pdf.status_code == 200 and res_pdf.headers['content-type'] == 'application/pdf':
        print("PASS: PDF Export")
    else:
        print(f"FAIL: PDF Export ({res_pdf.status_code})")
        
    print("Testing Excel Export...")
    res_xlsx = requests.get(f"{BASE_URL}/admin/reports/bookings?format=xlsx", headers=headers)
    if res_xlsx.status_code == 200 and 'spreadsheetml' in res_xlsx.headers['content-type']:
        print("PASS: Excel Export")
    else:
        print(f"FAIL: Excel Export ({res_xlsx.status_code}) {res_xlsx.text}")

def test_status_actions(token):
    # This requires a valid booking ID. We'll list bookings first.
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/admin/bookings?limit=1", headers=headers)
    bookings = res.json()
    if not bookings:
        print("SKIP: No bookings to test actions on.")
        return

    b_id = bookings[0]['id']
    print(f"Testing actions on Booking {b_id}...")
    
    # Try Expire
    res_expire = requests.post(f"{BASE_URL}/admin/bookings/{b_id}/expire", headers=headers)
    if res_expire.status_code == 200 and res_expire.json()['status'] == 'expired':
        print("PASS: Expire Booking")
    else:
         print(f"FAIL: Expire Booking ({res_expire.status_code}) {res_expire.text}")
         
    # Try Complete
    res_complete = requests.post(f"{BASE_URL}/admin/bookings/{b_id}/complete", headers=headers)
    if res_complete.status_code == 200 and res_complete.json()['status'] == 'completed':
        print("PASS: Complete Booking")
    else:
         print(f"FAIL: Complete Booking ({res_complete.status_code}) {res_complete.text}")

if __name__ == "__main__":
    # Assuming default admin creds from earlier conversations or seed data
    # If not known, we might fail login. 
    # For now, I'll assume admin/admin123 or similar (Need to check db or logic?)
    # I'll try to find a way to get a token or skip if auth fails.
    print("Starting Verification...")
    token = login("admin@villaroli.com", "admin123")
    print(f"Logged in. Token: {token[:10]}...")
    
    test_exports(token)
    test_status_actions(token)
