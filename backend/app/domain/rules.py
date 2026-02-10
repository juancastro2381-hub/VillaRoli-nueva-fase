from datetime import timedelta, date
from typing import List, Set
from app.core.config import settings
from app.core.exceptions import RuleViolationError
from app.domain.models import BookingRequest, BookingPolicy

def _get_date_range(start: date, end: date) -> List[date]:
    """Yields dates between start (inclusive) and end (exclusive)."""
    delta = (end - start).days
    return [start + timedelta(days=i) for i in range(delta)]

def _get_holidays_in_range(start: date, end: date) -> Set[date]:
    nights = _get_date_range(start, end)
    return {d for d in nights if d in settings.HOLIDAYS_2026}

def validate_day_pass(request: BookingRequest):
    """
    Day Pass: check_in == check_out (0 nights).
    """
    if request.check_in != request.check_out:
         raise RuleViolationError(
            "Day Pass requires check-in and check-out on the same day (0 nights).",
            rule_name="DAY_PASS_INVALID_RANGE"
        )

def validate_full_property_weekday(request: BookingRequest):
    """
    Mon-Thu only. No Holidays. Min 10 people.
    """
    if request.guest_count < 10:
        raise RuleViolationError(
            f"Full Property requires at least 10 guests. Requested: {request.guest_count}",
            rule_name="MIN_PEOPLE_NOT_MET"
        )
        
    nights = _get_date_range(request.check_in, request.check_out)
    for night in nights:
        if night.weekday() not in [0, 1, 2, 3]: # Mon=0, Thu=3
             raise RuleViolationError(
                f"Date {night} is not a weekday (Mon-Thu).",
                rule_name="INVALID_DATE_RANGE"
            )
        if night in settings.HOLIDAYS_2026:
            raise RuleViolationError(
                f"Date {night} is a holiday. Not allowed in Weekday plan.",
                rule_name="PLAN_NOT_ALLOWED_ON_HOLIDAY"
            )

def validate_full_property_weekend(request: BookingRequest):
    """
    Fri-Sun (2 nights). No Holidays. Min 10 people.
    """
    if request.guest_count < 10:
        raise RuleViolationError(
            f"Full Property requires at least 10 guests. Requested: {request.guest_count}",
            rule_name="MIN_PEOPLE_NOT_MET"
        )
    
    # Strict range check: Fri -> Sun (2 nights)
    # Fri (4), Sat (5), Sun (6)
    if request.check_in.weekday() != 4: # Must start Friday
        raise RuleViolationError("Weekend plan must start on Friday.", rule_name="INVALID_DATE_RANGE")
        
    duration = (request.check_out - request.check_in).days
    if duration != 2:
        raise RuleViolationError(f"Weekend plan must be exactly 2 nights (Fri-Sun). Requested: {duration}", rule_name="INVALID_DATE_RANGE")
        
    # Check for holidays
    holidays = _get_holidays_in_range(request.check_in, request.check_out)
    if holidays:
        raise RuleViolationError("Weekend plan cannot include holidays. Use 'Weekend with Holiday' plan.", rule_name="PLAN_NOT_ALLOWED_ON_HOLIDAY")

def validate_full_property_weekend_holiday(request: BookingRequest):
    """
    Fri-Sun (Start Fri) IF Friday is Holiday.
    Sat-Mon (Start Sat) IF Monday is Holiday.
    Min 10 people.
    """
    if request.guest_count < 10:
        raise RuleViolationError(
            f"Full Property requires at least 10 guests. Requested: {request.guest_count}",
            rule_name="MIN_PEOPLE_NOT_MET"
        )
    
    duration = (request.check_out - request.check_in).days
    if duration != 2:
         raise RuleViolationError(f"Weekend Holiday plan must be exactly 2 nights. Requested: {duration}", rule_name="INVALID_DATE_RANGE")
    
    start_weekday = request.check_in.weekday()
    
    # Scenario A: Fri-Sun (Fri is Holiday)
    if start_weekday == 4: # Friday
        if request.check_in not in settings.HOLIDAYS_2026:
            raise RuleViolationError("Friday is not a holiday. Use standard Weekend plan.", rule_name="HOLIDAY_REQUIRED")
            
    # Scenario B: Sat-Mon (Mon is Holiday) - Checkout is Monday, so Stay is Sat & Sun nights
    elif start_weekday == 5: # Saturday
        monday = request.check_out # The checkout day is Monday
        # Check if Monday is holiday? Wait, 2 nights: Sat night, Sun night. Checkout Mon.
        # Yes, usually the 'Puente' is when Monday is holiday.
        # So we check if request.check_out (Monday) is a holiday? 
        # Or usually the logic is: "Sat-Mon" stay implies you leave Mon afternoon.
        if monday not in settings.HOLIDAYS_2026:
             raise RuleViolationError("Monday is not a holiday. Invalid range for Holiday plan.", rule_name="HOLIDAY_REQUIRED")
             
    else:
        raise RuleViolationError("Holiday Plan must start on Friday (if Fri is holiday) or Saturday (if Mon is holiday).", rule_name="INVALID_DATE_RANGE")

def validate_family_plan(request: BookingRequest):
    """
    Max 5 People. Exactly 1 Night. No Holidays.
    """
    if request.guest_count > 5:
        raise RuleViolationError(f"Family Plan limits to 5 guests. Requested: {request.guest_count}", rule_name="FAMILY_PLAN_LIMIT_EXCEEDED")
        
    duration = (request.check_out - request.check_in).days
    if duration != 1:
        raise RuleViolationError(f"Family Plan allows exactly 1 night. Requested: {duration} nights.", rule_name="INVALID_DATE_RANGE")
        
    # Check for holidays
    holidays = _get_holidays_in_range(request.check_in, request.check_out)
    if holidays:
        raise RuleViolationError("Family Plan not allowed on holidays.", rule_name="PLAN_NOT_ALLOWED_ON_HOLIDAY")

