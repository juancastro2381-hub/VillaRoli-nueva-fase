from abc import ABC, abstractmethod
from typing import Dict, Any

class PaymentGateway(ABC):
    @abstractmethod
    def create_payment_intent(self, amount: int, currency: str, booking_id: int, customer_email: str) -> Dict[str, Any]:
        """
        Creates a payment intent/order with the provider.
        Returns a dictionary containing the 'payment_url' or 'client_secret'.
        """
        pass

    @abstractmethod
    def validate_webhook(self, payload: Dict[str, Any], headers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates the webhook signature and returns the normalized event data.
        Return dict must contain:
        - status: PaymentStatus (COMPLETED, FAILED)
        - transaction_id: str
        - booking_id: int
        """
        pass
