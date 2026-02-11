import requests
import concurrent.futures
import time
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def create_booking_attempt(user_id, check_in, check_out):
    payload = {
        "check_in": check_in,
        "check_out": check_out,
        "guest_count": 10,
        "policy_type": "full_property_weekend",
        "guest_name": f"Stress User {user_id}",
        "guest_email": f"user{user_id}@test.com",
        "payment_method": "ONLINE_GATEWAY",
        "payment_type": "FULL"
    }
    
    start_time = time.time()
    try:
        response = requests.post(f"{BASE_URL}/payments/checkout", json=payload)
        elapsed = time.time() - start_time
        return {
            "user": user_id,
            "status": response.status_code,
            "body": response.text,
            "elapsed": elapsed
        }
    except Exception as e:
        return {"user": user_id, "status": "ERROR", "error": str(e)}

def stress_test_concurrency():
    # Target: Next available weekend in 2026 to ensure validity
    # May 29-31 2026 (Fri-Sun)
    start_date = "2026-05-29"
    end_date = "2026-05-31"
    
    print(f"🔥 Starting Stress Test: 5 Concurrent Users attacking {start_date} to {end_date}")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(create_booking_attempt, i, start_date, end_date) 
            for i in range(1, 6)
        ]
        
    results = [f.result() for f in futures]
    
    # Analyze Results
    successes = [r for r in results if r['status'] == 200]
    conflicts = [r for r in results if r['status'] == 409 or (r['status'] == 422 and "Overbooking" in r['body'])]
    others = [r for r in results if r['status'] not in [200, 409]]
    
    print("\n--- RESULTS ---")
    print(f"✅ Successes: {len(successes)}")
    print(f"🛑 Blocked (Overbooking): {len(conflicts)}")
    print(f"⚠️ Other Errors: {len(others)}")
    
    for r in results:
        status_icon = "✅" if r['status'] == 200 else "🛑"
        print(f"User {r['user']}: {status_icon} {r['status']} ({r['elapsed']:.2f}s)")
        if r['status'] not in [200, 409]:
            print(f"   Response: {r.get('body')}")
            
    if len(successes) == 1 and len(conflicts) >= 4:
        print("\n✅ PASSED: Race condition handled correctly.")
    elif len(successes) > 1:
        print("\n❌ FAILED: Multiple bookings created for same dates (Double Booking).")
    else:
        print("\n⚠️ INCONCLUSIVE: Check 'Other Errors'.")

if __name__ == "__main__":
    stress_test_concurrency()
