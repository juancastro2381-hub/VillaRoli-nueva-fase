"""
Payment State Engine

Manages payment state transitions and booking status updates.
Ensures all state changes follow valid transition rules and maintains
consistency with the financial reporting system.
"""

from sqlalchemy.orm import Session
from app.db.models import Payment, Booking, PaymentStatus, BookingStatus
from datetime import date
import logging
import json

logger = logging.getLogger("payment_state_engine")


class InvalidStateTransitionError(Exception):
    """Raised when an invalid state transition is attempted"""
    pass


class PaymentStateEngine:
    """Manages payment state transitions and booking updates"""
    
    @staticmethod
    def confirm_bank_transfer(
        payment_id: int,
        admin_id: int,
        db: Session
    ) -> dict:
        """
        Confirm a bank transfer payment after reviewing evidence.
        
        State Transitions:
        - Payment: AWAITING_CONFIRMATION → PAID
        - Booking: PENDING → CONFIRMED
        
        Args:
            payment_id: ID of the payment to confirm
            admin_id: ID of the admin confirming the payment
            db: Database session
            
        Returns:
            dict: Confirmation result with payment_id, booking_id, status
            
        Raises:
            InvalidStateTransitionError: If payment is not in valid state
        """
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise InvalidStateTransitionError("Payment not found")
        
        # Validate state
        if payment.status != PaymentStatus.AWAITING_CONFIRMATION:
            raise InvalidStateTransitionError(
                f"Cannot confirm payment in state: {payment.status}. "
                f"Expected: AWAITING_CONFIRMATION"
            )
        
        # Validate evidence exists
        if not payment.evidence_url:
            raise InvalidStateTransitionError(
                "Evidence required for bank transfer confirmation"
            )
        
        # Get booking
        booking = payment.booking
        if not booking:
            raise InvalidStateTransitionError("Booking not found for payment")
        
        # Store old states for audit
        old_payment_status = payment.status
        old_booking_status = booking.status
        
        # Update payment
        payment.status = PaymentStatus.PAID
        payment.confirmed_at = date.today()
        payment.confirmed_by_admin_id = admin_id
        
        # Update booking if pending or expired (allow reactivation)
        if booking.status in [BookingStatus.PENDING, BookingStatus.EXPIRED]:
            booking.status = BookingStatus.CONFIRMED
        
        db.commit()
        
        # Audit log
        logger.info(json.dumps({
            "event": "bank_transfer_confirmed",
            "payment_id": payment_id,
            "booking_id": booking.id,
            "admin_id": admin_id,
            "amount": float(payment.amount),
            "old_payment_status": old_payment_status.value,
            "new_payment_status": "PAID",
            "old_booking_status": old_booking_status.value,
            "new_booking_status": booking.status.value,
            "evidence_url": payment.evidence_url
        }))
        
        return {
            "payment_id": payment_id,
            "booking_id": booking.id,
            "status": "confirmed",
            "amount": float(payment.amount)
        }
    
    @staticmethod
    def reject_payment(
        payment_id: int,
        admin_id: int,
        reason: str,
        db: Session
    ) -> dict:
        """
        Reject a payment.
        
        State Transitions:
        - Payment: AWAITING_CONFIRMATION/PENDING_DIRECT_PAYMENT → FAILED
        - Booking: Stays PENDING (user can retry)
        
        Args:
            payment_id: ID of the payment to reject
            admin_id: ID of the admin rejecting the payment
            reason: Reason for rejection
            db: Database session
            
        Returns:
            dict: Rejection result
            
        Raises:
            InvalidStateTransitionError: If payment is not in valid state
        """
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise InvalidStateTransitionError("Payment not found")
        
        # Validate state
        valid_states = [
            PaymentStatus.AWAITING_CONFIRMATION,
            PaymentStatus.PENDING_DIRECT_PAYMENT
        ]
        if payment.status not in valid_states:
            raise InvalidStateTransitionError(
                f"Cannot reject payment in state: {payment.status}. "
                f"Expected: {[s.value for s in valid_states]}"
            )
        
        # Get booking
        booking = payment.booking
        old_payment_status = payment.status
        
        # Update payment
        payment.status = PaymentStatus.FAILED
        # Store rejection reason in payload field
        rejection_data = {
            "rejected_by": admin_id,
            "rejected_at": date.today().isoformat(),
            "reason": reason
        }
        payment.payload = json.dumps(rejection_data)
        
        # Booking stays PENDING - user can retry with new payment
        
        db.commit()
        
        # Audit log
        logger.info(json.dumps({
            "event": "payment_rejected",
            "payment_id": payment_id,
            "booking_id": booking.id if booking else None,
            "admin_id": admin_id,
            "reason": reason,
            "old_payment_status": old_payment_status.value,
            "new_payment_status": "FAILED"
        }))
        
        return {
            "payment_id": payment_id,
            "booking_id": booking.id if booking else None,
            "status": "rejected",
            "reason": reason
        }
    
    @staticmethod
    def confirm_direct_payment(
        payment_id: int,
        admin_id: int,
        db: Session
    ) -> dict:
        """
        Confirm a direct admin agreement payment.
        
        State Transitions:
        - Payment: PENDING_DIRECT_PAYMENT → CONFIRMED_DIRECT_PAYMENT
        - Booking: PENDING → CONFIRMED
        
        Args:
            payment_id: ID of the payment to confirm
            admin_id: ID of the admin confirming the payment
            db: Database session
            
        Returns:
            dict: Confirmation result
            
        Raises:
            InvalidStateTransitionError: If payment is not in valid state
        """
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise InvalidStateTransitionError("Payment not found")
        
        # Validate state
        if payment.status != PaymentStatus.PENDING_DIRECT_PAYMENT:
            raise InvalidStateTransitionError(
                f"Cannot confirm direct payment in state: {payment.status}. "
                f"Expected: PENDING_DIRECT_PAYMENT"
            )
        
        # Get booking
        booking = payment.booking
        if not booking:
            raise InvalidStateTransitionError("Booking not found for payment")
        
        # Store old states for audit
        old_payment_status = payment.status
        old_booking_status = booking.status
        
        # Update payment
        payment.status = PaymentStatus.CONFIRMED_DIRECT_PAYMENT
        payment.confirmed_at = date.today()
        payment.confirmed_by_admin_id = admin_id
        
        # Update booking if pending or expired (allow reactivation)
        if booking.status in [BookingStatus.PENDING, BookingStatus.EXPIRED]:
            booking.status = BookingStatus.CONFIRMED
        
        db.commit()
        
        # Audit log
        logger.info(json.dumps({
            "event": "direct_payment_confirmed",
            "payment_id": payment_id,
            "booking_id": booking.id,
            "admin_id": admin_id,
            "amount": float(payment.amount),
            "old_payment_status": old_payment_status.value,
            "new_payment_status": "CONFIRMED_DIRECT_PAYMENT",
            "old_booking_status": old_booking_status.value,
            "new_booking_status": booking.status.value,
            "channel": "admin"
        }))
        
        return {
            "payment_id": payment_id,
            "booking_id": booking.id,
            "status": "confirmed",
            "amount": float(payment.amount),
            "channel": "admin"
        }
    
    @staticmethod
    def validate_state_transition(
        current_state: PaymentStatus,
        new_state: PaymentStatus
    ) -> bool:
        """
        Validate if a state transition is allowed.
        
        Args:
            current_state: Current payment status
            new_state: Target payment status
            
        Returns:
            bool: True if transition is valid
        """
        # Define valid transitions
        valid_transitions = {
            PaymentStatus.PENDING_PAYMENT: [
                PaymentStatus.PAID,
                PaymentStatus.FAILED,
                PaymentStatus.AWAITING_CONFIRMATION
            ],
            PaymentStatus.AWAITING_CONFIRMATION: [
                PaymentStatus.PAID,
                PaymentStatus.FAILED
            ],
            PaymentStatus.PENDING_DIRECT_PAYMENT: [
                PaymentStatus.CONFIRMED_DIRECT_PAYMENT,
                PaymentStatus.FAILED
            ],
            PaymentStatus.PAID: [
                PaymentStatus.REFUNDED
            ],
            PaymentStatus.CONFIRMED_DIRECT_PAYMENT: [
                PaymentStatus.REFUNDED
            ]
        }
        
        allowed = valid_transitions.get(current_state, [])
        return new_state in allowed
