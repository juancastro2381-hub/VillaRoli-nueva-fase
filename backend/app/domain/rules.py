from datetime import timedelta, date
from typing import List
from app.core.config import settings
from app.core.exceptions import RuleViolationError
from app.domain.models import BookingRequest, BookingPolicy

def _get_date_range(start: date, end: date) -> List[date]:
    """Yields dates between start (inclusive) and end (exclusive - checkout day usually doesn't count for stay rules)"""
    # Note: Hotel logic usually counts 'nights'.
    # If check-in is Monday and check-out is Thursday, the nights are Mon, Tue, Wed.
    # So we iterate from check-in up to (but not including) check-out.
    delta = (end - start).days
    return [start + timedelta(days=i) for i in range(delta)]

def is_weekend_night(d: date) -> bool:
    # Friday (4), Saturday (5), Sunday (6)
    # Actually, usually 'weekend stay' means nights of Fri, Sat. Sunday night is often considered weekday unless it's a long weekend.
    # However, requirements say "allow bookings only from Friday to Sunday".
    # Let's interpret "Weekend" as nights of Fri, Sat, Sun.
    return d.weekday() in [4, 5, 6]

def is_weekday_night(d: date) -> bool:
    # Mon(0), Tue(1), Wed(2), Thu(3)
    return d.weekday() in [0, 1, 2, 3]

def validate_full_property_weekday(request: BookingRequest):
    """
    Rules: Allow bookings only from Monday to Thursday.
    """
    nights = _get_date_range(request.check_in, request.check_out)
    for night in nights:
        if not is_weekday_night(night):
            raise RuleViolationError(
                f"Date {night} ({night.strftime('%A')}) is not a weekday (Mon-Thu).",
                rule_name="Full Property - Weekdays"
            )

def validate_full_property_weekend(request: BookingRequest):
    """
    Rules: Allow bookings only from Friday to Sunday.
    """
    nights = _get_date_range(request.check_in, request.check_out)
    for night in nights:
        if not is_weekend_night(night):
            raise RuleViolationError(
                f"Date {night} ({night.strftime('%A')}) is not a weekend (Fri-Sun).",
                rule_name="Full Property - Weekends"
            )

def validate_full_property_holiday(request: BookingRequest):
    """
    Rules: Allow bookings only on public holidays.
    Interpretation: At least ONE prominent night must be a holiday? Or ALL nights?
    Usually "Holiday Plan" implies the stay is *during* the holiday.
    Let's enforce that AT LEAST ONE night matches a holiday or is adjacent to one (long weekend).
    Or strict: ALL nights must be holidays?
    
    Re-reading req: "allow bookings only on public holidays".
    Strict interpretation: Every night of the stay must be a holiday (or associated weekend).
    Let's assume "Holiday Period": Any date in the range must be a holiday OR be part of a bridge.
    
    For MVP simplicity/strictness: The check-in date MUST be a holiday or the day before one?
    Let's stick to the prompt: "allow bookings only on public holidays".
    We check if ANY of the nights is in the HOLIDAYS set.
    """
    nights = _get_date_range(request.check_in, request.check_out)
    has_holiday = False
    for night in nights:
        if night in settings.HOLIDAYS_2026:
            has_holiday = True
            break
    
    if not has_holiday:
        raise RuleViolationError(
            "Booking does not coincide with any known public holiday.",
            rule_name="Full Property - Holidays"
        )

def validate_family_plan(request: BookingRequest):
    """
    Rules: Allow booking for one night only. Block bookings longer than 1 night.
    """
    duration = (request.check_out - request.check_in).days
    if duration != 1:
        raise RuleViolationError(
            f"Family Plan allows exactly 1 night. Requested: {duration} nights.",
            rule_name="Family Plan"
        )
