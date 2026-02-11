from datetime import date, timedelta
from typing import Dict, Any, List
from app.domain.models import BookingPolicy
from app.core.config import settings

class PricingService:
    # Constants ported from src/lib/pricing.ts
    DEPOSIT_AMOUNT = 200000
    CLEANING_FEE = 70000
    
    # Rates
    PASADIA_RATE = 25000
    WEEKDAY_RATE = 55000
    WEEKEND_RATE = 60000
    HOLIDAY_RATE = 70000
    FAMILY_PLAN_RATE = 420000
    
    # Min/Max
    MIN_PEOPLE_GROUP = 10
    MAX_PEOPLE_FAMILY = 5

    @staticmethod
    def get_nights(check_in: date, check_out: date) -> int:
        delta = (check_out - check_in).days
        return max(1, delta)

    @classmethod
    def calculate_total(cls, check_in: date, check_out: date, guests: int, policy_type: BookingPolicy) -> Dict[str, Any]:
        """
        Calculates the total price and breakdown based on the policy and dates.
        """
        subtotal = 0
        cleaning_fee = 0
        breakdown = []
        
        nights = cls.get_nights(check_in, check_out)
        
        if policy_type == BookingPolicy.DAY_PASS:
            # Pasadía: Flat rate per person
            # Frontend uses "entreSemana" price generally for simpler logic in this prototype
            rate = cls.PASADIA_RATE
            subtotal = rate * guests
            breakdown.append(f"{guests} personas x ${rate:,} (Pasadía)")
            
        elif policy_type == BookingPolicy.FAMILY_PLAN:
            # Plan Familia: Flat rate per night (max 5 people)
            if guests > cls.MAX_PEOPLE_FAMILY:
                # This should be caught by validation, but safeguard here
                pass 
            
            rate = cls.FAMILY_PLAN_RATE
            subtotal = rate * nights
            breakdown.append(f"Plan Familia x {nights} noche(s) (${rate:,}/noche)")
            # Cleaning included in Family Plan
            cleaning_fee = 0 
            
        else:
            # Full Property Plans (Weekday, Weekend, Holiday)
            # Default to provided policy logic, but we could enforce strict date checks here too.
            # For this Phase 7, we trust the policy_type matched the dates (validated in Step 1 of BookingService).
            
            rate = 0
            if policy_type == BookingPolicy.FULL_PROPERTY_WEEKDAY:
                rate = cls.WEEKDAY_RATE
            elif policy_type == BookingPolicy.FULL_PROPERTY_WEEKEND:
                rate = cls.WEEKEND_RATE
            elif policy_type == BookingPolicy.FULL_PROPERTY_HOLIDAY:
                rate = cls.HOLIDAY_RATE
                
            subtotal = rate * guests * nights
            breakdown.append(f"{guests} personas x {nights} noche(s) x ${rate:,}")
            
            # Add Cleaning Fee
            cleaning_fee = cls.CLEANING_FEE
            breakdown.append(f"Aseo: ${cleaning_fee:,}")

        total = subtotal + cleaning_fee
        
        return {
            "subtotal": subtotal,
            "cleaning_fee": cleaning_fee,
            "deposit": cls.DEPOSIT_AMOUNT,
            "total_amount": total,
            "currency": "COP",
            "breakdown": breakdown
        }
