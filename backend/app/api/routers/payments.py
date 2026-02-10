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

from app.db.models import Payment, PaymentStatus, BookingStatus, PaymentProvider, PaymentMethod

@router.post("/checkout")
def create_checkout_session(
    request: BookingRequest, 
    property_id: int = 1,
    provider: str = "DUMMY", # Only for Online
    payment_method: str = "ONLINE_GATEWAY", # Accepts string matching Enum
    db: Session = Depends(get_db)
):
    service_repo = BookingRepository(db)
    service = BookingService(repo=service_repo)
    
    # Valida payment method
    try:
        method_enum = PaymentMethod(payment_method)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payment method")

    # 1. Create Booking
    # This runs validation rules
    booking = service.create_booking(request, property_id)
    
    # Calculate Amount (Mock)
    nights = (request.check_out - request.check_in).days
    total_amount = nights * 100000 
    
    payment_url = None
    transaction_id = None
    status = PaymentStatus.PENDING_PAYMENT
    
    # 2. Handle Payment Method Logic
    if method_enum == PaymentMethod.ONLINE_GATEWAY:
        # Initiate Payment Intent via Gateway
        gateway = get_payment_gateway(provider)
        payment_response = gateway.create_payment_intent(
            amount=total_amount,
            currency="COP",
            booking_id=booking.id,
            customer_email="customer@example.com"
        )
        payment_url = payment_response["payment_url"]
        transaction_id = payment_response.get("transaction_id")
        # Status remains PENDING_PAYMENT
        
    elif method_enum == PaymentMethod.BANK_TRANSFER:
        status = PaymentStatus.AWAITING_CONFIRMATION
        payment_url = None # Or URL to instructions
        # No gateway interaction
        
    elif method_enum == PaymentMethod.DIRECT_ADMIN_AGREEMENT:
        status = PaymentStatus.PENDING_DIRECT_PAYMENT
        payment_url = None
        
    # 3. Record Payment
    payment = Payment(
        booking_id=booking.id,
        provider=PaymentProvider.DUMMY if provider=="DUMMY" else PaymentProvider.STRIPE, # Default
        payment_method=method_enum,
        amount=total_amount,
        currency="COP",
        status=status,
        transaction_id=transaction_id
    )
    db.add(payment)
    db.commit()
    
    return {
        "booking_id": booking.id, 
        "payment_url": payment_url, 
        "status": status,
        "message": "Booking created. Proceed with payment."
    }

import logging

# Configure structured logger (simplified for demo)
logger = logging.getLogger("payments.webhook")
logger.setLevel(logging.INFO)

@router.post("/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    # 1. Get raw payload
    payload = await request.json()
    headers = request.headers
    
    log_context = {"event": "webhook_received", "provider": "DUMMY"}
    logger.info(json.dumps(log_context))
    
    # 2. Validate via Gateway Strategy
    # TODO: Determine provider from URL or headers. Assuming DUMMY for now.
    gateway = get_payment_gateway("DUMMY")
    try:
        event = gateway.validate_webhook(payload, headers)
    except Exception as e:
        logger.error(json.dumps({"event": "webhook_validation_failed", "error": str(e)}))
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    # 3. Process Event
    if event["status"] == "COMPLETED" or event["status"] == PaymentStatus.COMPLETED:
        booking_id = event["booking_id"]
        transaction_id = event.get("transaction_id")
        
        repo = BookingRepository(db)
        booking = repo.get_booking(booking_id)
        if not booking:
             logger.warning(json.dumps({"event": "booking_not_found", "booking_id": booking_id}))
             raise HTTPException(status_code=404, detail="Booking not found")
             
        # Idempotency check
        if booking.status == BookingStatus.CONFIRMED:
            logger.info(json.dumps({"event": "webhook_idempotency_skip", "booking_id": booking_id}))
            return {"status": "ignored", "reason": "already_confirmed"}
        
        # Update Booking
        booking.status = BookingStatus.CONFIRMED
        
        # Update Payment Record
        # Find payment by booking_id (assuming 1 payment per booking for now)
        # In prod: search by transaction_id if available
        payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
        if payment:
            payment.status = PaymentStatus.PAID
            payment.transaction_id = transaction_id or payment.transaction_id
            payment.confirmed_at = date.today()
        
        db.commit()
        
        logger.info(json.dumps({"event": "payment_confirmed", "booking_id": booking_id, "amount": payment.amount if payment else 0}))
        
        # Trigger Email Confirmation
        from app.services.email import EmailService
        email_service = EmailService()
        # Use guest email if available, else fallback
        recipient = booking.guest_email or "customer@example.com"
        email_service.send_confirmation_email(recipient, booking.id)
        
        return {"status": "success", "booking_id": booking.id}
    
    logger.info(json.dumps({"event": "webhook_ignored_status", "status": event["status"]}))
    return {"status": "ignored"}
