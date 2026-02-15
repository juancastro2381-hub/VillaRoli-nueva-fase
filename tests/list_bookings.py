import requests
from datetime import date
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

def list_bookings():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    
    res = requests.get(f"{BASE_URL}/admin/bookings?limit=100&status=ALL", headers=headers)
    bookings = res.json()
    
    print(f"Found {len(bookings)} bookings.")
    for b in bookings:
        print(f"ID: {b['id']} | {b['check_in']} to {b['check_out']} | Status: {b['status']} | Type: {b.get('policy_type', 'N/A')}")

if __name__ == "__main__":
    list_bookings()
