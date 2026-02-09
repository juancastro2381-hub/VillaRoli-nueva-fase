from app.domain.models import BookingRequest, BookingPolicy
from app.domain import rules
from app.db.repository import BookingRepository
from app.core.exceptions import RuleViolationError

class OverbookingError(Exception):
    pass

class BookingService:
    def __init__(self, repo: BookingRepository = None):
        self.repo = repo

    def validate_request(self, request: BookingRequest) -> bool:
        """
        Validates the booking request against the selected policy rules (PURE DOMAIN LOGIC).
        """
        if request.policy_type == BookingPolicy.FULL_PROPERTY_WEEKDAY:
            rules.validate_full_property_weekday(request)
            
        elif request.policy_type == BookingPolicy.FULL_PROPERTY_WEEKEND:
            rules.validate_full_property_weekend(request)
            
        elif request.policy_type == BookingPolicy.FULL_PROPERTY_HOLIDAY:
            rules.validate_full_property_holiday(request)
            
        elif request.policy_type == BookingPolicy.FAMILY_PLAN:
            rules.validate_family_plan(request)
        
        return True

    def create_booking(self, request: BookingRequest, property_id: int):
        """
        Orchestrates:
        1. Domain Rule Validation
        2. DB Availability Check (Transactional)
        3. Persistence
        """
        # 1. Domain Validation
        self.validate_request(request)
        
        if not self.repo:
            raise Exception("Repository not initialized")

        # 2. Availability Check & Locking handled by Repository call inside router transaction scope
        # Note: In a real app, we might manage the transaction scope here or in the router/UoW.
        # Here we perform the check explicitly.
        
        is_available = self.repo.check_availability(property_id, request.check_in, request.check_out)
        
        if not is_available:
            raise OverbookingError(f"Property {property_id} is not available for the selected dates.")
        
        # 3. Persist
        booking_data = request.model_dump()
        booking_data['property_id'] = property_id
        # 'status' defaults to PENDING in DB model
        
        return self.repo.create_booking(booking_data)
