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

def validate_dates_common(request: BookingRequest):
    """
    Common validations for all booking requests.
    """
    # 1. Block Past Dates
    if request.check_in < date.today():
        raise RuleViolationError(
            "No puedes reservar fechas pasadas.",
            rule_name="PAST_DATE_NOT_ALLOWED"
        )
    
    # 2. Min Nights (Except Day Pass)
    if request.policy_type != BookingPolicy.DAY_PASS:
        if request.check_out <= request.check_in:
             raise RuleViolationError(
                "La fecha de salida debe ser posterior a la de llegada.",
                rule_name="MIN_NIGHTS_REQUIRED"
            )

def validate_day_pass(request: BookingRequest):
    """
    Day Pass: check_in == check_out (0 nights).
    """
    if request.check_in != request.check_out:
         raise RuleViolationError(
            "El plan Pasadía es de un solo día (Llegada = Salida).",
            rule_name="DAY_PASS_INVALID_RANGE"
        )

def validate_full_property_weekday(request: BookingRequest):
    """
    Mon-Thu only. No Holidays. Min 10 people.
    """
    if request.guest_count < 10:
        raise RuleViolationError(
            f"La Finca Completa requiere un mínimo de 10 personas para este plan.",
            rule_name="MIN_PEOPLE_NOT_MET"
        )
        
    nights = _get_date_range(request.check_in, request.check_out)
    for night in nights:
        if night.weekday() not in [0, 1, 2, 3]: # Mon=0, Thu=3
             raise RuleViolationError(
                "Este plan solo se puede reservar de lunes a jueves.",
                rule_name="INVALID_WEEKDAY_DATES"
            )
        if night in settings.HOLIDAYS_2026:
            raise RuleViolationError(
                "Este plan no está permitido en fechas festivas.",
                rule_name="PLAN_NOT_ALLOWED_ON_HOLIDAY"
            )

def validate_full_property_weekend(request: BookingRequest):
    """
    Fri-Sun (Standard Weekend). No Holidays. Min 10 people.
    Allowed nights: Friday night, Saturday night.
    """
    if request.guest_count < 10:
        raise RuleViolationError(
            "La Finca Completa requiere un mínimo de 10 personas para este plan.",
            rule_name="MIN_PEOPLE_NOT_MET"
        )
    
    # Check that all nights fall within Friday/Saturday
    nights = _get_date_range(request.check_in, request.check_out)
    for night in nights:
        if night.weekday() not in [4, 5]: 
             raise RuleViolationError(
                "Este plan requiere reservar fines de semana (viernes a domingo).",
                rule_name="INVALID_WEEKEND_DATES"
            )
        
    # Check for holidays
    holidays = _get_holidays_in_range(request.check_in, request.check_out)
    if holidays:
        raise RuleViolationError(
            "Este plan no está permitido en fechas festivas.", 
            rule_name="PLAN_NOT_ALLOWED_ON_HOLIDAY"
        )

def validate_full_property_holiday(request: BookingRequest):
    """
    Weekend with Holiday. Min 10 people.
    Must include a holiday or be attached to one.
    """
    if request.guest_count < 10:
        raise RuleViolationError(
            "La Finca Completa requiere un mínimo de 10 personas para este plan.",
            rule_name="MIN_PEOPLE_NOT_MET"
        )
    
    nights = _get_date_range(request.check_in, request.check_out)
    has_holiday_night = any(n in settings.HOLIDAYS_2026 for n in nights)
    checkout_is_monday_holiday = (request.check_out.weekday() == 0 and request.check_out in settings.HOLIDAYS_2026)
    
    is_valid_holiday_plan = has_holiday_night or checkout_is_monday_holiday
    
    if not is_valid_holiday_plan:
         raise RuleViolationError(
            "Este plan requiere un fin de semana con festivo.",
            rule_name="HOLIDAY_REQUIRED"
        )

def validate_family_plan(request: BookingRequest):
    """
    Max 5 People. Exactly 1 Night. No Holidays.
    """
    if request.guest_count > 5:
        raise RuleViolationError(
            "El Plan Familia es válido solo para máximo 5 personas.", 
            rule_name="FAMILY_PLAN_LIMIT_EXCEEDED"
        )
        
    duration = (request.check_out - request.check_in).days
    if duration != 1:
        raise RuleViolationError(
            "El Plan Familia es para exactamente 1 noche.", 
            rule_name="FAMILY_PLAN_ONE_NIGHT"
        )
        
    holidays = _get_holidays_in_range(request.check_in, request.check_out)
    if holidays:
        raise RuleViolationError(
            "El Plan Familia no aplica en festivos.", 
            rule_name="PLAN_NOT_ALLOWED_ON_HOLIDAY"
        )

