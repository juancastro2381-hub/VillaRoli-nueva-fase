from .gateway import PaymentGateway
from .dummy import DummyPaymentAdapter
from app.core.config import settings

def get_payment_gateway(provider_name: str = None) -> PaymentGateway:
    if provider_name is None:
        provider_name = settings.PAYMENT_PROVIDER

    if provider_name == "DUMMY":
        return DummyPaymentAdapter()
    elif provider_name == "STRIPE":
        from .stripe import StripeAdapter
        return StripeAdapter()
    else:
        raise ValueError(f"Unknown payment provider: {provider_name}")
