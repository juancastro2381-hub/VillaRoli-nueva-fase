from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum as SQLEnum, Date, DateTime, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.domain.models import BookingPolicy
import enum
from datetime import date, datetime

class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    BLOCKED = "BLOCKED"
    EXPIRED = "EXPIRED"
    COMPLETED = "COMPLETED"

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    max_guests = Column(Integer, default=2)
    
    bookings = relationship("Booking", back_populates="property")

class PaymentType(str, enum.Enum):
    FULL = "FULL"
    PARTIAL = "PARTIAL"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    
    check_in = Column(Date, nullable=False, index=True)
    check_out = Column(Date, nullable=False, index=True)
    status = Column(SQLEnum(BookingStatus), default=BookingStatus.PENDING, index=True)
    
    guest_count = Column(Integer, default=1)
    
    # Guest Details (Public Booking)
    guest_name = Column(String, nullable=True)
    guest_email = Column(String, nullable=True)
    guest_phone = Column(String, nullable=True) # WhatsApp
    guest_city = Column(String, nullable=True)
    
    policy_type = Column(SQLEnum(BookingPolicy), nullable=False)
    
    # Payment Info
    payment_type = Column(SQLEnum(PaymentType), default=PaymentType.FULL)
    expires_at = Column(DateTime, nullable=True) # For 60-min expiration
    
    # Phase 5: Admin Override & Audit
    is_override = Column(Boolean, default=False)
    override_reason = Column(String, nullable=True)
    rules_bypassed = Column(String, nullable=True) # Checkbox list or text
    created_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    override_created_at = Column(Date, nullable=True) # Timestamp of override
    manual_total_amount = Column(Float, nullable=True) # Override price
    
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

class PaymentMethod(str, enum.Enum):
    ONLINE_GATEWAY = "ONLINE_GATEWAY"
    BANK_TRANSFER = "BANK_TRANSFER"
    DIRECT_ADMIN_AGREEMENT = "DIRECT_ADMIN_AGREEMENT"

class PaymentStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"
    # Bank Transfer specific
    AWAITING_CONFIRMATION = "AWAITING_CONFIRMATION"
    # Direct Agreement specific
    PENDING_DIRECT_PAYMENT = "PENDING_DIRECT_PAYMENT"
    CONFIRMED_DIRECT_PAYMENT = "CONFIRMED_DIRECT_PAYMENT"

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    provider = Column(SQLEnum(PaymentProvider), nullable=False) # Keep provider for gateway info (STRIPE, WOMPI)
    payment_method = Column(SQLEnum(PaymentMethod), default=PaymentMethod.ONLINE_GATEWAY)
    
    transaction_id = Column(String, index=True, nullable=True) # Provider's ID or Bank Ref
    payment_reference = Column(String, nullable=True) # Manual reference code
    
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="COP")
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING_PAYMENT, index=True)
    payload = Column(String, nullable=True)
    
    created_at = Column(Date, default=date.today)
    confirmed_at = Column(Date, nullable=True)
    confirmed_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    booking = relationship("Booking", back_populates="payments")

# Update Booking to include Audit fields
# Note: modifying existing Booking class definitions requiring re-declaring it or using alter if this was a migration script.
# Since we are simple file replacement, we assume we can edit the Booking class above. 
# But wait, looking at the file structure, Booking is separate. I should edit the Booking class directly.



# Content Modules
class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    message = Column(String, nullable=False)
    status = Column(String, default="NEW") # NEW, RESPONDED, ARCHIVED
    created_at = Column(Date, default=date.today)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=True)
    rating = Column(Integer, default=5)
    comment = Column(String, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(Date, default=date.today)

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False) # Markdown or HTML
    cover_image = Column(String, nullable=True)
    status = Column(String, default="DRAFT") # DRAFT, PUBLISHED
    published_at = Column(Date, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    author = relationship("User")

Booking.payments = relationship("Payment", back_populates="booking")

class Holiday(Base):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)

