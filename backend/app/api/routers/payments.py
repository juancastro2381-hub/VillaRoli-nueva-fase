from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domain.models import BookingRequest
from app.api.routers.bookings import get_service
from app.services.booking_engine import BookingService
from app.core.payments import get_payment_gateway
from app.db.models import Payment, PaymentStatus, BookingStatus, PaymentProvider
from app.db.repository import BookingRepository
import json

router = APIRouter()

@router.post("/checkout")
def create_checkout_session(
    request: BookingRequest, 
    property_id: int = 1,
    provider: str = "DUMMY",
    db: Session = Depends(get_db)
):
    service_repo = BookingRepository(db)
    service = BookingService(repo=service_repo)
    
    # 1. Create Booking as PENDING
    # Note: create_booking already creates it as PENDING by default in current logic.
    # We might need to ensure it's PENDING.
    booking = service.create_booking(request, property_id)
    
    # 2. Initiate Payment Intent
    gateway = get_payment_gateway(provider)
    
    # Depending on provider, amount might be integer cents.
    # Let's assume a hardcoded base price for MVP testing: 100,000 COP per night.
    # IN REAL APP: Get price from `Property` or Pricing Engine.
    nights = (request.check_out - request.check_in).days
    total_amount = nights * 100000 
    
    payment_response = gateway.create_payment_intent(
        amount=total_amount,
        currency="COP",
        booking_id=booking.id,
        customer_email="customer@example.com" # Should come from request
    )
    
    # 3. Record Payment Attempt
    payment = Payment(
        booking_id=booking.id,
        provider=PaymentProvider.DUMMY if provider=="DUMMY" else PaymentProvider.STRIPE, # Simplify for now
        amount=total_amount,
        currency="COP",
        status=PaymentStatus.PENDING,
        transaction_id=payment_response.get("transaction_id")
    )
    db.add(payment)
    db.commit()
    
    return {"payment_url": payment_response["payment_url"], "booking_id": booking.id}

@router.post("/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    # 1. Get raw payload
    payload = await request.json()
    headers = request.headers
    
    # 2. Validate via Gateway Strategy
    # TODO: Determine provider from URL or headers. Assuming DUMMY for now.
    gateway = get_payment_gateway("DUMMY")
    event = gateway.validate_webhook(payload, headers)
    
    # 3. Process Event
    if event["status"] == "COMPLETED" or event["status"] == PaymentStatus.COMPLETED:
        # Update Payment Record
        # Find by transaction_id or booking_id depending on provider logic
        # Here we use booking_id from dummy payload
        booking_id = event["booking_id"]
        
        repo = BookingRepository(db)
        booking = repo.get_booking(booking_id)
        if not booking:
             raise HTTPException(status_code=404, detail="Booking not found")
             
        # Idempotency check: If already confirmed, ignore
        if booking.status == BookingStatus.CONFIRMED:
            return {"status": "ignored", "reason": "already_confirmed"}
            
        booking.status = BookingStatus.CONFIRMED
        
        # Update associated Payment record to COMPLETED too
        # In real world, find specific payment by txn_id
        
        db.commit()
        
        # Trigger Email Confirmation
        from app.services.email import EmailService
        email_service = EmailService()
        # TODO: Get real user email from booking or user relation
        email_service.send_confirmation_email("customer@example.com", booking.id)
        
        return {"status": "success", "booking_id": booking.id}
    
    return {"status": "ignored"}
