import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000"
ADMIN_USER = "admin@villaroli.com"
ADMIN_PASS = "admin123"

def get_admin_token():
    resp = requests.post(f"{BASE_URL}/auth/token", data={"username": ADMIN_USER, "password": ADMIN_PASS})
    if resp.status_code != 200:
        print("Failed to login as admin")
        return None
    return resp.json()["access_token"]

def test_content_modules():
    print("--- Testing Content Modules ---")
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Contact Form
    print("\n1. Testing Contact Form...")
    contact_pl = {"name": "Test User", "email": "test@example.com", "message": "Hello world"}
    resp = requests.post(f"{BASE_URL}/content/contacts", json=contact_pl)
    if resp.status_code == 200:
        print("PASS: Public Contact Submit")
    else:
        print(f"FAIL: Public Contact Submit {resp.status_code} {resp.text}")
        
    # Admin List Contacts
    resp = requests.get(f"{BASE_URL}/admin/content/contacts", headers=headers)
    if resp.status_code == 200 and len(resp.json()) > 0:
        print("PASS: Admin List Contacts")
        # Update status
        contact_id = resp.json()[0]["id"]
        requests.patch(f"{BASE_URL}/admin/content/contacts/{contact_id}", json={"status": "RESPONDED"}, headers=headers)
    else:
         print(f"FAIL: Admin List Contacts {resp.status_code} {resp.text}")

    # 2. Testimonials
    print("\n2. Testing Testimonials...")
    # Admin Create
    test_pl = {"name": "Reviewer", "comment": "Great!", "rating": 5, "city": "Bogota"}
    resp = requests.post(f"{BASE_URL}/admin/content/testimonials", json=test_pl, headers=headers) # Using Admin endpoint for creation for now
    if resp.status_code == 200:
        print("PASS: Admin Create Testimonial")
    else:
        print(f"FAIL: Admin Create Testimonial {resp.status_code} {resp.text}")
        
    # Public List
    resp = requests.get(f"{BASE_URL}/content/testimonials")
    if resp.status_code == 200:
        print(f"PASS: Public List Testimonials (Count: {len(resp.json())})")
    else:
        print(f"FAIL: Public List Testimonials {resp.status_code}")

    # 3. Blog
    print("\n3. Testing Blog...")
    # Admin Create
    blog_pl = {"slug": "welcome-post", "title": "Welcome", "content": "# Hello", "status": "PUBLISHED"}
    # Check if exists first to avoid unique constraint error
    # Actually just create with random slug if generic
    import random
    blog_pl["slug"] = f"post-{random.randint(1000,9999)}"
    
    resp = requests.post(f"{BASE_URL}/admin/content/blog", json=blog_pl, headers=headers)
    if resp.status_code == 200:
        print("PASS: Admin Create Blog Post")
    else:
        print(f"FAIL: Admin Create Blog Post {resp.status_code} {resp.text}")
        
    # Public List
    resp = requests.get(f"{BASE_URL}/content/blog")
    if resp.status_code == 200:
        print(f"PASS: Public List Blog (Count: {len(resp.json())})")
    else:
         print(f"FAIL: Public List Blog {resp.status_code}")

if __name__ == "__main__":
    test_content_modules()
