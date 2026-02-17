"""
Financial Aggregation Service - Single Source of Truth for Revenue Calculations

This service centralizes all financial computations for the admin panel.
Revenue is calculated ONLY from bookings that meet BOTH criteria:
  - Booking.status == CONFIRMED
  - Payment.status IN (PAID, CONFIRMED_DIRECT_PAYMENT)

Date filtering uses Payment.confirmed_at (financial view, not operational check_in).
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import Optional, Dict, List, Any
from datetime import date, datetime, timezone
from decimal import Decimal, ROUND_HALF_UP

from app.db.models import Booking, Payment, BookingStatus, PaymentStatus
from app.services.pricing import PricingService


class FinancialService:
    """
    Centralized financial aggregation and revenue calculation service.
    
    All revenue computations across KPIs, reports, and exports MUST use this service
    to ensure consistency.
    """
    
    # Valid payment statuses for revenue recognition
    REVENUE_PAYMENT_STATUSES = [
        PaymentStatus.PAID,
        PaymentStatus.CONFIRMED_DIRECT_PAYMENT
    ]
    
    @staticmethod
    def _normalize_amount(amount: float) -> Decimal:
        """
        Normalize monetary amounts to Decimal with 2 decimal places.
        Ensures currency consistency across all outputs.
        """
        return Decimal(str(amount)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    @staticmethod
    def _get_booking_revenue(booking: Booking, db: Session) -> Decimal:
        """
        Calculate revenue for a single booking.
        Supports multiple payments per booking (sums all qualifying payments).
        
        Args:
            booking: Booking instance
            db: Database session
            
        Returns:
            Total revenue as Decimal (0.00 if no qualifying payments)
        """
        # Get all qualifying payments for this booking
        payments = db.query(Payment).filter(
            Payment.booking_id == booking.id,
            Payment.status.in_(FinancialService.REVENUE_PAYMENT_STATUSES)
        ).all()
        
        if not payments:
            return Decimal('0.00')
        
        # Sum all payment amounts (supports multiple payments)
        total = sum(payment.amount for payment in payments)
        return FinancialService._normalize_amount(total)
    
    @staticmethod
    def calculate_revenue_summary(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive revenue summary with breakdowns.
        
        Args:
            db: Database session
            start_date: Filter payments confirmed from this date (inclusive)
            end_date: Filter payments confirmed to this date (inclusive)
            
        Returns:
            Dictionary with:
            - total_revenue: Decimal
            - total_bookings_confirmed: int
            - currency: str
            - revenue_by_plan: Dict[plan, revenue]
            - revenue_by_payment_method: Dict[method, revenue]
            - revenue_by_channel: Dict[channel, revenue] (online vs admin)
            - date_range: Dict with from/to dates
        """
        # Base query: CONFIRMED bookings with qualifying payments
        query = db.query(Booking, Payment).join(
            Payment,
            Payment.booking_id == Booking.id
        ).filter(
            Booking.status == BookingStatus.CONFIRMED,
            Payment.status.in_(FinancialService.REVENUE_PAYMENT_STATUSES)
        )
        
        # Date filtering on Payment.confirmed_at (financial view)
        if start_date:
            query = query.filter(Payment.confirmed_at >= start_date)
        if end_date:
            query = query.filter(Payment.confirmed_at <= end_date)
        
        results = query.all()
        
        # Initialize aggregations
        total_revenue = Decimal('0.00')
        booking_ids = set()
        revenue_by_plan = {}
        revenue_by_payment_method = {}
        revenue_by_channel = {'online': Decimal('0.00'), 'admin': Decimal('0.00')}
        
        # Process results
        for booking, payment in results:
            # Track unique bookings
            booking_ids.add(booking.id)
            
            # Calculate payment amount
            amount = FinancialService._normalize_amount(payment.amount)
            total_revenue += amount
            
            # Breakdown by plan
            plan = booking.policy_type.value
            revenue_by_plan[plan] = revenue_by_plan.get(plan, Decimal('0.00')) + amount
            
            # Breakdown by payment method
            method = payment.payment_method.value
            revenue_by_payment_method[method] = revenue_by_payment_method.get(method, Decimal('0.00')) + amount
            
            # Breakdown by channel
            channel = 'admin' if booking.created_by_admin_id else 'online'
            revenue_by_channel[channel] += amount
        
        # Convert Decimal to float for JSON serialization
        return {
            'total_revenue': float(total_revenue),
            'total_bookings_confirmed': len(booking_ids),
            'currency': 'COP',
            'revenue_by_plan': {k: float(v) for k, v in revenue_by_plan.items()},
            'revenue_by_payment_method': {k: float(v) for k, v in revenue_by_payment_method.items()},
            'revenue_by_channel': {k: float(v) for k, v in revenue_by_channel.items()},
            'date_range': {
                'from': start_date.isoformat() if start_date else None,
                'to': end_date.isoformat() if end_date else None
            }
        }
    
    @staticmethod
    def get_revenue_details(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[Dict[str, Any]]:
        """
        Get detailed revenue breakdown by booking.
        Used for report generation.
        
        Returns:
            List of dictionaries with booking and payment details
        """
        query = db.query(Booking, Payment).join(
            Payment,
            Payment.booking_id == Booking.id
        ).filter(
            Booking.status == BookingStatus.CONFIRMED,
            Payment.status.in_(FinancialService.REVENUE_PAYMENT_STATUSES)
        )
        
        if start_date:
            query = query.filter(Payment.confirmed_at >= start_date)
        if end_date:
            query = query.filter(Payment.confirmed_at <= end_date)
        
        results = query.all()
        
        details = []
        for booking, payment in results:
            amount = FinancialService._normalize_amount(payment.amount)
            details.append({
                'booking_id': booking.id,
                'check_in': booking.check_in.isoformat(),
                'check_out': booking.check_out.isoformat(),
                'guest_name': booking.guest_name,
                'guest_email': booking.guest_email,
                'plan': booking.policy_type.value,
                'guest_count': booking.guest_count,
                'amount': float(amount),
                'payment_method': payment.payment_method.value,
                'payment_status': payment.status.value,
                'confirmed_at': payment.confirmed_at.isoformat() if payment.confirmed_at else None,
                'channel': 'admin' if booking.created_by_admin_id else 'online',
                'is_override': booking.is_override
            })
        
        return details
    
    @staticmethod
    def calculate_monthly_revenue(db: Session, target_date: Optional[date] = None) -> Decimal:
        """
        Calculate revenue for a specific month.
        Helper method for KPI dashboard.
        
        Args:
            db: Database session
            target_date: Date within the target month (defaults to today)
            
        Returns:
            Total revenue for the month as Decimal
        """
        if not target_date:
            target_date = date.today()
        
        # First day of month
        first_day = target_date.replace(day=1)
        
        # Last day of month (first day of next month - 1 day)
        if target_date.month == 12:
            last_day = date(target_date.year + 1, 1, 1)
        else:
            last_day = date(target_date.year, target_date.month + 1, 1)
        
        summary = FinancialService.calculate_revenue_summary(
            db=db,
            start_date=first_day,
            end_date=last_day
        )
        
        return Decimal(str(summary['total_revenue']))
