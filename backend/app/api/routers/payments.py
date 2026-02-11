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

from app.services.booking_engine import BookingService, OverbookingError
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.db.models import PaymentType

@router.post("/checkout")
def create_checkout_session(
    request: BookingRequest, 
    property_id: int = 1,
    provider: str = "DUMMY", # Only for Online
    db: Session = Depends(get_db)
):

    service_repo = BookingRepository(db)
    service = BookingService(repo=service_repo)
    
    # Valida payment method
    try:
        method_enum = PaymentMethod(request.payment_method)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payment method")
        
    try:
        type_enum = PaymentType(request.payment_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payment type")

    # 1. Create Booking
    try:
        # Update Service to handle payment_type save? Or update after?
        # Service.create_booking doesn't know about payment_type yet.
        # We can update it on the object returned.
        booking = service.create_booking(request, property_id)
        
        # Update extra fields
        booking.payment_type = type_enum
        
        # 60-Minute Expiration Logic
        # Applies if Partial Payment OR Bank Transfer
        if type_enum == PaymentType.PARTIAL or method_enum == PaymentMethod.BANK_TRANSFER:
            booking.expires_at = datetime.now() + timedelta(minutes=60)
            
        db.commit()
            
    except OverbookingError as e:
        return JSONResponse(
            status_code=409,
            content={
                "error_code": "OVERBOOKING_NOT_ALLOWED",
                "message": "Las fechas seleccionadas no están disponibles.",
                "details": str(e)
            }
        )
    
    # Calculate Amount using Centralized Pricing Engine
    from app.services.pricing import PricingService
    
    pricing_result = PricingService.calculate_total(
        check_in=request.check_in,
        check_out=request.check_out,
        guests=request.guest_count,
        policy_type=request.policy_type
    )
    
    total_amount = pricing_result["total_amount"]
    
    pay_amount = total_amount
    if type_enum == PaymentType.PARTIAL:
        pay_amount = total_amount * 0.5 # 50% Deposit
        
    payment_url = None
    transaction_id = None
    status = PaymentStatus.PENDING_PAYMENT
    
    # 2. Handle Payment Method Logic
    if method_enum == PaymentMethod.ONLINE_GATEWAY:
        # Initiate Payment Intent via Gateway
        gateway = get_payment_gateway(provider)
        payment_response = gateway.create_payment_intent(
            amount=pay_amount,
            currency="COP",
            booking_id=booking.id,
            customer_email=request.guest_email or "customer@example.com"
        )
        payment_url = payment_response["payment_url"]
        transaction_id = payment_response.get("transaction_id")
        # Status remains PENDING_PAYMENT
        
    elif method_enum == PaymentMethod.BANK_TRANSFER:
        status = PaymentStatus.AWAITING_CONFIRMATION
        payment_url = None # Frontend will show instructions
        
    elif method_enum == PaymentMethod.DIRECT_ADMIN_AGREEMENT:
        status = PaymentStatus.PENDING_DIRECT_PAYMENT
        payment_url = None
        
    # 3. Record Payment
    payment = Payment(
        booking_id=booking.id,
        provider=PaymentProvider.DUMMY if provider=="DUMMY" else PaymentProvider.STRIPE, # Default
        payment_method=method_enum,
        amount=pay_amount,
        currency="COP",
        status=status,
        transaction_id=transaction_id
    )
    db.add(payment)
    db.commit()
    
    return {
        "booking_id": booking.id, 
        "payment_id": payment.id,
        "payment_url": payment_url, 
        "status": status,
        "amount_due": pay_amount,
        "total_amount": total_amount,
        "pricing_breakdown": pricing_result["breakdown"],
        "expires_at": booking.expires_at.isoformat() if booking.expires_at else None,
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

from fastapi.responses import HTMLResponse

@router.get("/dummy-checkout", response_class=HTMLResponse)
def dummy_checkout_page(booking_id: int, amount: float):
    return f"""
    <html>
        <head>
            <title>Simulated Payment Gateway</title>
            <style>
                body {{ font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; }}
                .card {{ background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }}
                h1 {{ color: #333; }}
                p {{ color: #666; margin-bottom: 1.5rem; }}
                .amount {{ font-size: 2rem; font-weight: bold; color: #333; margin: 1rem 0; }}
                button {{ width: 100%; padding: 10px; margin: 5px 0; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }}
                .pay-btn {{ background: #28a745; color: white; }}
                .fail-btn {{ background: #dc3545; color: white; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Villa Roli Payment</h1>
                <p>Simulación de Pasarela de Pagos (QA)</p>
                <div class="amount">${amount:,.0f} COP</div>
                <p>Booking ID: #{booking_id}</p>
                
                <button class="pay-btn" onclick="processPayment('COMPLETED')">Pagar Exitosamente</button>
                <button class="fail-btn" onclick="processPayment('FAILED')">Simular Fallo</button>
            </div>

            <script>
                function processPayment(status) {{
                    fetch('/payments/webhook', {{
                        method: 'POST',
                        headers: {{ 'Content-Type': 'application/json' }},
                        body: JSON.stringify({{
                            status: status,
                            booking_id: {booking_id},
                            transaction_id: 'txn_' + Math.floor(Math.random() * 1000000)
                        }})
                    }}).then(res => {{
                        if (status === 'COMPLETED') {{
                            window.location.href = 'http://localhost:8080/checkout/success?booking_id={booking_id}';
                        }} else {{
                            alert('Pago fallido simulado');
                        }}
                    }});
                }}
            </script>
        </body>
    </html>
    """
