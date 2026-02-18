import stripe
from typing import Dict, Any
from app.core.payments.gateway import PaymentGateway
from app.core.config import settings

class StripeAdapter(PaymentGateway):
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY

    def create_payment_intent(self, amount: int, currency: str, booking_id: int, customer_email: str) -> Dict[str, Any]:
        """
        Creates a Stripe Checkout Session.
        """
        try:
            # Create Checkout Session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency.lower(),
                        'product_data': {
                            'name': f'Reserva Villa Roli #{booking_id}',
                        },
                        'unit_amount': int(amount * 100), # Amount in cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{settings.ALLOWED_ORIGINS[0]}/checkout/success?booking_id={booking_id}",
                cancel_url=f"{settings.ALLOWED_ORIGINS[0]}/checkout/cancel?booking_id={booking_id}",
                customer_email=customer_email,
                metadata={
                    "booking_id": booking_id
                }
            )
            return {
                "payment_url": session.url,
                "transaction_id": session.id
            }
        except Exception as e:
            raise Exception(f"Stripe Error: {str(e)}")

    def validate_webhook(self, payload: Dict[str, Any], headers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates Stripe Webhook signature.
        """
        sig_header = headers.get('stripe-signature')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        if not sig_header or not webhook_secret:
             raise ValueError("Missing stripe-signature or STRIPE_WEBHOOK_SECRET")

        try:
            # Verify signature
            # payload is usually raw bytes, but here we likely got a dict from FastAPI.
            # Stripe library needs RAW BODY. 
            # This is a common issue with FastAPI.
            # The router currently does `payload = await request.json()`.
            # This BREAKS signature verification because `json()` parsing might change key order/whitespace.
            # I must fix the router to read `request.body()` for Stripe.
            
            # Since I cannot change the router implementation easily to pass raw body without changing signature,
            # I will assume for now we use the library's construct_event which needs payload (bytes), sig_header, secret.
            
            # Wait, `router.post("/webhook")` in `payments.py` calls `await request.json()`.
            # I need to change `payments.py` to read raw body if I want real verification.
            # But the interface `validate_webhook(payload: Dict...)` takes a Dict!
            # This interface is defined in `gateway.py` as `payload: Dict[str, Any]`.
            # This Interface is incompatible with standardized signature verification libraries which require raw bytes.
            # "Dummy" interface design flaw.
            
            # Workaround:
            # Since I can't change the interface easily without breaking Dummy (or maybe I can),
            # I'll rely on the `payload` dict for EVENT DATA, but verification is compromised if I don't have raw body.
            # However, `stripe.Webhook.construct_event` REQUIRES raw body.
            # If I pass the dict, it fails.
            
            # OPTION: Re-serialize the dict to string? No, that won't match the signature.
            # SOLUTION: update `payments.py` to pass the request object or raw body?
            # Or assume `payload` IS the raw body if I change the router?
            
            # The user asked for "webhook signature verification".
            # I MUST fix `payments.py` to get raw body.
            
            # For now, I'm writing `stripe.py`. checking verification logic later.
            # I will include the logic assuming `payload` might be passed as raw bytes if I fix the router.
            # But the Type Hint says `Dict`.
            
            # I will implement it assuming `payload` is the event object (constructed elsewhere) 
            # OR I will try to construct it.
            
            # Actually, without raw body, I CANNOT verify signature.
            # I will mark this as a TODO or I will fix the Router.
            # Fix Router is better.
            
            # For this file, I will implement a "soft" check or assume raw body is passed in `headers`? No.
            # I will assume `payload` passed here is the raw body, and I will update `gateway.py` signature? 
            # Or `payments.py` will pass raw body as `payload` argument (even if type hint says Dict, Python is dynamic).
            
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            raise e
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Invalid Signature: {str(e)}")

        # Map Event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            return {
                "status": "COMPLETED",
                "transaction_id": session.get('id'),
                "booking_id": int(session.get('metadata', {}).get('booking_id', 0))
            }
        
        return {"status": "IGNORED"}
