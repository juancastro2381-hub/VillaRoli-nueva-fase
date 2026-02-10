from datetime import date
from enum import Enum
from pydantic import BaseModel, Field, field_validator

class BookingPolicy(str, Enum):
    FULL_PROPERTY_WEEKDAY = "full_property_weekday"
    FULL_PROPERTY_WEEKEND = "full_property_weekend"
    FULL_PROPERTY_HOLIDAY = "full_property_holiday"
    FAMILY_PLAN = "family_plan"
    DAY_PASS = "day_pass"

class BookingRequest(BaseModel):
    check_in: date
    check_out: date
    guest_count: int = Field(..., gt=0)
    policy_type: BookingPolicy
    
    # Guest Info
    guest_name: str | None = None
    guest_email: str | None = None
    guest_phone: str | None = None
    guest_city: str | None = None

    @field_validator('check_out')
    def validate_dates(cls, v, values):
        # Allow check-out == check-in (0 nights) for Day Pass support
        # We catch invalid 0-night stays in rules.py for other policies
        if 'check_in' in values.data and v < values.data['check_in']:
            raise ValueError('Check-out must be at or after check-in')
        return v
