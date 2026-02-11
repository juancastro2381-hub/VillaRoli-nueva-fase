from typing import Dict, Any
from app.core.payments.gateway import PaymentGateway
from app.db.models import PaymentStatus

class DummyPaymentAdapter(PaymentGateway):
    def create_payment_intent(self, amount: int, currency: str, booking_id: int, customer_email: str) -> Dict[str, Any]:
        return {
            "payment_url": f"http://localhost:8000/payments/dummy-checkout?booking_id={booking_id}&amount={amount}",
            "transaction_id": f"dummy_txn_{booking_id}"
        }

    def validate_webhook(self, payload: Dict[str, Any], headers: Dict[str, Any]) -> Dict[str, Any]:
        # In a real provider, we would check signature here.
        # For dummy, we accept the payload as truth.
        return {
            "status": payload.get("status", PaymentStatus.COMPLETED),
            "transaction_id": payload.get("transaction_id"),
            "booking_id": payload.get("booking_id")
        }
