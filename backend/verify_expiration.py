import requests
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.db.models import Booking, BookingStatus, PaymentMethod, PaymentType, BookingPolicy

def create_stale_booking():
    db = SessionLocal()
    try:
        # Create a booking that should be expired
        booking = Booking(
            property_id=1,
            check_in=datetime.now().date(),
            check_out=(datetime.now() + timedelta(days=1)).date(),
            guest_count=2,
            # total_price removed as it is not in Booking model
            status=BookingStatus.PENDING,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            # Set expires_at to 1 hour ago
            expires_at=datetime.now() - timedelta(hours=1)
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        print(f"✅ Created Stale Booking ID: {booking.id} (Status: {booking.status})")
        return booking.id
    finally:
        db.close()

def verify_expiration(booking_id):
    # Trigger Job
    print("⏳ Triggering Expiration Job via Admin API...")
    # Need admin token? The endpoint depends on get_current_admin.
    # For this test, valid admin credentials are required. 
    # Let's assume we can login or mock it? 
    # To simplify, I'll login first.
    
    # Login
    login_res = requests.post("http://localhost:8000/auth/token", data={"username": "admin@villaroli.com", "password": "admin123"})
    if login_res.status_code != 200:
        print("❌ Login Failed", login_res.text)
        return
        
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    res = requests.post("http://localhost:8000/admin/ops/expire-stale", headers=headers)
    if res.status_code == 200:
        print("✅ Job Triggered Successfully")
    else:
        print(f"❌ Job Trigger Failed: {res.status_code} {res.text}")
        return

    # Check DB
    db = SessionLocal()
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking.status == BookingStatus.EXPIRED:
        print(f"✅ SUCCESS: Booking {booking_id} is now EXPIRED.")
    else:
        print(f"❌ FAILURE: Booking {booking_id} status is {booking.status}")
    db.close()

if __name__ == "__main__":
    b_id = create_stale_booking()
    verify_expiration(b_id)
