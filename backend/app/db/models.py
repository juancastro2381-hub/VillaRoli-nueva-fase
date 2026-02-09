from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.domain.models import BookingPolicy
import enum
from datetime import date

class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    BLOCKED = "BLOCKED"

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    max_guests = Column(Integer, default=2)
    
    bookings = relationship("Booking", back_populates="property")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    
    check_in = Column(Date, nullable=False, index=True)
    check_out = Column(Date, nullable=False, index=True)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING, index=True)
    
    guest_count = Column(Integer, default=1)
    policy_type = Column(SQLEnum(BookingPolicy), nullable=False)
    
    property = relationship("Property", back_populates="bookings")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

class PaymentProvider(str, enum.Enum):
    STRIPE = "STRIPE"
    PAYPAL = "PAYPAL"
    WOMPI = "WOMPI"
    MERCADOPAGO = "MERCADOPAGO"
    DUMMY = "DUMMY" # For testing

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    provider = Column(SQLEnum(PaymentProvider), nullable=False)
    transaction_id = Column(String, index=True, nullable=True) # Provider's ID
    amount = Column(Integer, nullable=False) # Store in cents/minor units to avoid float issues
    currency = Column(String, default="COP")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, index=True)
    payload = Column(String, nullable=True) # JSON payload for audit (store as string for compatibility)
    created_at = Column(Date, default=date.today) # Ideally timestamp
    
    booking = relationship("Booking", back_populates="payments")

Booking.payments = relationship("Payment", back_populates="booking")
