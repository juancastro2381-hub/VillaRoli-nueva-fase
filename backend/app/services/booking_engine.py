from app.domain.models import BookingRequest, BookingPolicy
from app.domain import rules
from app.db.repository import BookingRepository
from app.core.exceptions import RuleViolationError
from datetime import date

class OverbookingError(Exception):
    pass

class BookingService:
    def __init__(self, repo: BookingRepository = None):
        self.repo = repo

    def validate_request(self, request: BookingRequest) -> bool:
        """
        Validates the booking request against the selected policy rules (PURE DOMAIN LOGIC).
        """
        # Common Validation (Past dates, min nights)
        rules.validate_dates_common(request)

        if request.policy_type == BookingPolicy.FULL_PROPERTY_WEEKDAY:
            rules.validate_full_property_weekday(request)
            
        elif request.policy_type == BookingPolicy.FULL_PROPERTY_WEEKEND:
            rules.validate_full_property_weekend(request)
            
        elif request.policy_type == BookingPolicy.FULL_PROPERTY_HOLIDAY:
            rules.validate_full_property_holiday(request)
            
        elif request.policy_type == BookingPolicy.FAMILY_PLAN:
            rules.validate_family_plan(request)
            
        elif request.policy_type == BookingPolicy.DAY_PASS:
            rules.validate_day_pass(request)
        
        return True

    def create_booking(self, request: BookingRequest, property_id: int, 
                       is_override: bool = False, 
                       override_reason: str = None, 
                       admin_id: int = None):
        """
        Orchestrates booking creation with optional Admin Override.
        
        Args:
            request: The booking details.
            property_id: The property ID.
            is_override: If True, bypass commercial rules (but NOT availability).
            override_reason: Mandatory if is_override is True.
            admin_id: The ID of the admin creating the override.
        """
        rules_bypassed = []
        
        # 1. Domain Validation (Commercial Rules)
        try:
            self.validate_request(request)
        except RuleViolationError as e:
            if is_override:
                # If override is valid, Record the rule that WOULD have failed
                rules_bypassed.append(f"{e.rule_name}: {str(e)}")
            else:
                # If no override, raise the error normally
                raise e
        
        # Additional checks can be added here and appended to rules_bypassed if overridden
        
        if not self.repo:
            raise Exception("Repository not initialized")

        # 2. Lock Property to prevent Race Conditions (Double Booking)
        self.repo.lock_property(property_id)

        # 3. Availability Check (PHYSICAL CONSTRAINT - CANNOT BE OVERRIDDEN)
        is_available = self.repo.check_availability(property_id, request.check_in, request.check_out)
        
        if not is_available:
            raise OverbookingError(f"Property {property_id} is not available for the selected dates. Overbooking is NOT allowed.")
        
        # 3. Persist
        booking_data = request.model_dump()
        booking_data['property_id'] = property_id
        
        # Remove fields not in Booking table
        if 'payment_method' in booking_data:
            del booking_data['payment_method']
        
        # Add Override/Audit fields
        if is_override:
            booking_data['is_override'] = True
            booking_data['override_reason'] = override_reason
            booking_data['rules_bypassed'] = "; ".join(rules_bypassed) if rules_bypassed else "None"
            booking_data['created_by_admin_id'] = admin_id
            booking_data['override_created_at'] = date.today() # Or datetime.now() if column type allows
        
        return self.repo.create_booking(booking_data)
