"""
Unit Tests for FinancialService

Tests edge cases including:
- Mixed booking/payment states
- Cancelled/expired bookings
- Multiple payments per booking
- Date filtering on Payment.confirmed_at
- Currency normalization
"""

import pytest
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.db.models import (
    Booking, Payment, Property, User,
    BookingStatus, PaymentStatus, PaymentMethod, PaymentProvider
)
from app.domain.models import BookingPolicy
from app.services.financial_service import FinancialService


# Test Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_finance.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def setup_test_data(db_session):
    """Setup common test data"""
    # Create property
    prop = Property(id=1, name="Test Villa", max_guests=6)
    db_session.add(prop)
    
    # Create admin user
    admin = User(id=1, email="admin@test.com", hashed_password="xxx", is_admin=True)
    db_session.add(admin)
    
    db_session.commit()
    return db_session


class TestRevenueCalculation:
    """Test core revenue calculation logic"""
    
    def test_confirmed_booking_with_paid_payment(self, setup_test_data):
        """Revenue SHOULD include: CONFIRMED booking + PAID payment"""
        db = setup_test_data
        
        # Create CONFIRMED booking
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        # Create PAID payment
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        db.add(payment)
        db.commit()
        
        # Calculate revenue
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 100000.0
        assert summary['total_bookings_confirmed'] == 1
        assert summary['currency'] == 'COP'
    
    def test_confirmed_booking_with_confirmed_direct_payment(self, setup_test_data):
        """Revenue SHOULD include: CONFIRMED booking + CONFIRMED_DIRECT_PAYMENT"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=150000.0,
            created_by_admin_id=1
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.DIRECT_ADMIN_AGREEMENT,
            amount=150000,
            status=PaymentStatus.CONFIRMED_DIRECT_PAYMENT,
            confirmed_at=date.today()
        )
        db.add(payment)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 150000.0
        assert summary['revenue_by_channel']['admin'] == 150000.0
        assert summary['revenue_by_channel']['online'] == 0.0
    
    def test_pending_booking_excluded(self, setup_test_data):
        """Revenue SHOULD NOT include: PENDING booking (even with PAID payment)"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.PENDING,  # PENDING status
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,  # Payment is PAID
            confirmed_at=date.today()
        )
        db.add(payment)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 0.0
        assert summary['total_bookings_confirmed'] == 0
    
    def test_cancelled_booking_excluded(self, setup_test_data):
        """Revenue SHOULD NOT include: CANCELLED booking"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CANCELLED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        db.add(payment)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 0.0
    
    def test_expired_booking_excluded(self, setup_test_data):
        """Revenue SHOULD NOT include: EXPIRED booking"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.EXPIRED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        db.add(payment)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 0.0
    
    def test_confirmed_booking_with_pending_payment_excluded(self, setup_test_data):
        """Revenue SHOULD NOT include: CONFIRMED booking + PENDING_PAYMENT"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PENDING_PAYMENT,  # Not paid yet
            confirmed_at=None
        )
        db.add(payment)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 0.0


class TestMultiplePayments:
    """Test support for multiple payments per booking"""
    
    def test_multiple_payments_summed(self, setup_test_data):
        """Revenue SHOULD sum all qualifying payments for a booking"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=150000.0
        )
        db.add(booking)
        db.commit()
        
        # First payment: 50% deposit
        payment1 = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=75000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today() - timedelta(days=5)
        )
        db.add(payment1)
        
        # Second payment: remaining 50%
        payment2 = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.BANK_TRANSFER,
            amount=75000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        db.add(payment2)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 150000.0
        assert summary['total_bookings_confirmed'] == 1  # Still one booking
    
    def test_multiple_payments_partial_paid(self, setup_test_data):
        """Revenue SHOULD include only PAID payments, exclude PENDING"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=150000.0
        )
        db.add(booking)
        db.commit()
        
        # First payment: PAID
        payment1 = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=75000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        db.add(payment1)
        
        # Second payment: PENDING (not paid yet)
        payment2 = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.BANK_TRANSFER,
            amount=75000,
            status=PaymentStatus.PENDING_PAYMENT,
            confirmed_at=None
        )
        db.add(payment2)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        # Only the first payment should count
        assert summary['total_revenue'] == 75000.0


class TestDateFiltering:
    """Test date filtering on Payment.confirmed_at"""
    
    def test_date_filter_includes_range(self, setup_test_data):
        """Revenue should include payments confirmed within date range"""
        db = setup_test_data
        
        # Booking confirmed on Feb 10
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date(2026, 2, 15),
            check_out=date(2026, 2, 17),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,
            confirmed_at=date(2026, 2, 10)  # Confirmed on Feb 10
        )
        db.add(payment)
        db.commit()
        
        # Filter for February 2026
        summary = FinancialService.calculate_revenue_summary(
            db,
            start_date=date(2026, 2, 1),
            end_date=date(2026, 2, 28)
        )
        
        assert summary['total_revenue'] == 100000.0
    
    def test_date_filter_excludes_outside_range(self, setup_test_data):
        """Revenue should exclude payments confirmed outside date range"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date(2026, 3, 15),
            check_out=date(2026, 3, 17),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,
            confirmed_at=date(2026, 3, 5)  # Confirmed in March
        )
        db.add(payment)
        db.commit()
        
        # Filter for February only
        summary = FinancialService.calculate_revenue_summary(
            db,
            start_date=date(2026, 2, 1),
            end_date=date(2026, 2, 28)
        )
        
        assert summary['total_revenue'] == 0.0  # No revenue in February
    
    def test_date_filter_financial_view_not_operational(self, setup_test_data):
        """Date filter uses confirmed_at (financial), NOT check_in (operational)"""
        db = setup_test_data
        
        # Booking with check_in in March
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date(2026, 3, 20),  # Check-in in MARCH
            check_out=date(2026, 3, 22),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0
        )
        db.add(booking)
        db.commit()
        
        # But payment confirmed in February
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,
            confirmed_at=date(2026, 2, 28)  # Confirmed in FEBRUARY
        )
        db.add(payment)
        db.commit()
        
        # Filter for February
        summary = FinancialService.calculate_revenue_summary(
            db,
            start_date=date(2026, 2, 1),
            end_date=date(2026, 2, 28)
        )
        
        # Revenue SHOULD be included (confirmed_at is in February)
        assert summary['total_revenue'] == 100000.0


class TestRevenueBreakdowns:
    """Test revenue breakdown by plan, method, and channel"""
    
    def test_revenue_by_plan(self, setup_test_data):
        """Revenue breakdown by booking plan type"""
        db = setup_test_data
        
        # Weekday booking
        booking1 = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=80000.0
        )
        db.add(booking1)
        
        # Weekend booking
        booking2 = Booking(
            id=2,
            property_id=1,
            check_in=date.today() + timedelta(days=5),
            check_out=date.today() + timedelta(days=7),
            status=BookingStatus.CONFIRMED,
            guest_count=4,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKEND,
            manual_total_amount=120000.0
        )
        db.add(booking2)
        db.commit()
        
        # Payments
        payment1 = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=80000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        payment2 = Payment(
            booking_id=2,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=120000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        db.add_all([payment1, payment2])
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 200000.0
        assert summary['revenue_by_plan']['full_property_weekday'] == 80000.0
        assert summary['revenue_by_plan']['full_property_weekend'] == 120000.0
    
    def test_revenue_by_channel(self, setup_test_data):
        """Revenue breakdown by online vs admin channel"""
        db = setup_test_data
        
        # Online booking
        booking1 = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.0,
            created_by_admin_id=None  # Online
        )
        db.add(booking1)
        
        # Admin booking
        booking2 = Booking(
            id=2,
            property_id=1,
            check_in=date.today() + timedelta(days=5),
            check_out=date.today() + timedelta(days=7),
            status=BookingStatus.CONFIRMED,
            guest_count=4,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKEND,
            manual_total_amount=150000.0,
            created_by_admin_id=1  # Admin-created
        )
        db.add(booking2)
        db.commit()
        
        payment1 = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        payment2 = Payment(
            booking_id=2,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.DIRECT_ADMIN_AGREEMENT,
            amount=150000,
            status=PaymentStatus.CONFIRMED_DIRECT_PAYMENT,
            confirmed_at=date.today()
        )
        db.add_all([payment1, payment2])
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['revenue_by_channel']['online'] == 100000.0
        assert summary['revenue_by_channel']['admin'] == 150000.0


class TestCurrencyNormalization:
    """Test Decimal normalization and rounding"""
    
    def test_decimal_normalization(self, setup_test_data):
        """Amounts should be normalized to 2 decimal places"""
        db = setup_test_data
        
        booking = Booking(
            id=1,
            property_id=1,
            check_in=date.today(),
            check_out=date.today() + timedelta(days=2),
            status=BookingStatus.CONFIRMED,
            guest_count=2,
            policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY,
            manual_total_amount=100000.555  # Odd precision
        )
        db.add(booking)
        db.commit()
        
        payment = Payment(
            booking_id=1,
            provider=PaymentProvider.DUMMY,
            payment_method=PaymentMethod.ONLINE_GATEWAY,
            amount=100000.555,
            status=PaymentStatus.PAID,
            confirmed_at=date.today()
        )
        db.add(payment)
        db.commit()
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        # Should be rounded to 2 decimal places
        assert summary['total_revenue'] == 100000.56  # Rounded up
    
    def test_empty_result_returns_zero(self, setup_test_data):
        """Empty result set should return 0.00 revenue"""
        db = setup_test_data
        
        summary = FinancialService.calculate_revenue_summary(db)
        
        assert summary['total_revenue'] == 0.0
        assert summary['total_bookings_confirmed'] == 0
        assert summary['revenue_by_plan'] == {}
        assert summary['revenue_by_channel']['online'] == 0.0
        assert summary['revenue_by_channel']['admin'] == 0.0
