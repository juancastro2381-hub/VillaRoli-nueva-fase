from .gateway import PaymentGateway
from .dummy import DummyPaymentAdapter

def get_payment_gateway(provider_name: str = "DUMMY") -> PaymentGateway:
    if provider_name == "DUMMY":
        return DummyPaymentAdapter()
    # elif provider_name == "STRIPE": return StripeAdapter()
    # elif provider_name == "PAYPAL": return PayPalAdapter()
    else:
        raise ValueError(f"Unknown payment provider: {provider_name}")
