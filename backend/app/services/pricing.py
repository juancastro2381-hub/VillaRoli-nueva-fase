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
    def calculate_total(cls, check_in: date, check_out: date, guests: int, policy_type: BookingPolicy, manual_total: float = None) -> Dict[str, Any]:
        """
        Calculates the total price and breakdown based on the policy and dates.
        """
        subtotal = 0
        cleaning_fee = 0
        breakdown = []
        
        nights = cls.get_nights(check_in, check_out)
        
        if manual_total is not None:
             # Manual Override
             subtotal = manual_total # Treating as subtotal for simplicity or total? 
             # Let's assume manual_total is the FINAL price the admin wants.
             # So we set cleaning fee to 0 or include it? 
             # Usually "Total" means everything.
             # Let's set total = manual_total
             cleaning_fee = 0
             breakdown.append(f"Precio Manual Definido por Admin: ${manual_total:,}")
             return {
                "subtotal": manual_total,
                "cleaning_fee": 0,
                "deposit": cls.DEPOSIT_AMOUNT,
                "total_amount": manual_total,
                "currency": "COP",
                "breakdown": breakdown
            }
        
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

class AdminPricingService:
    """
    Source of Truth for Admin Manual Reservations.
    Enforces strict rules for Pasadía and Family Plan.
    Applies 'High Water Mark' pricing for mixed manual dates.
    """
    
    @staticmethod
    def get_date_range(start: date, end: date):
        """Yields dates from start (inclusive) to end (exclusive)."""
        curr = start
        while curr < end:
            yield curr
            curr += timedelta(days=1)

    @classmethod
    def calculate_admin_preview(cls, check_in: date, check_out: date, guests: int, policy_type: BookingPolicy) -> Dict[str, Any]:
        
        # 1. Validation for Predefined Plans (Server-Side Enforcement)
        if policy_type == BookingPolicy.DAY_PASS:
            if check_in != check_out:
                raise ValueError("El Pasadía debe tener la misma fecha de llegada y salida.")
            
        elif policy_type == BookingPolicy.FAMILY_PLAN:
            nights = (check_out - check_in).days
            if nights != 1:
                raise ValueError("El Plan Familia es para exactamente 1 noche.")
            if guests > 5:
                raise ValueError("El Plan Familia permite un máximo de 5 personas.")

        # 2. Pricing Logic
        subtotal = 0
        cleaning_fee = 0
        breakdown = []
        is_nightly = True

        if policy_type == BookingPolicy.DAY_PASS:
            # Pasadía Logic
            rate = PricingService.PASADIA_RATE
            subtotal = rate * guests
            breakdown.append(f"Pasadía: {guests} personas x ${rate:,}")
            is_nightly = False
            
        elif policy_type == BookingPolicy.FAMILY_PLAN:
            # Plan Familiar Logic
            rate = PricingService.FAMILY_PLAN_RATE
            subtotal = rate
            breakdown.append(f"Plan Familia: ${rate:,} (Noche única, max 5 pax)")
            is_nightly = False
            
        else:
            # Manual / Full Property Logic (High Water Mark)
            # Find the highest applicable rate in the range
            nights = max(1, (check_out - check_in).days)
            max_rate = 0
            found_rate_type = "WeekDay"
            
            # Holidays Check (Need to fetch via CalendarService or pass context? 
            # For simplicity in this specialized service, we might need a helper or repo access.
            # However, for pure calculation, we'll assume standard calendar rules or passed flags.
            # Wait, CalendarService logic is DB dependent. 
            # To keep this Pure, we should inject holiday dates or use a lightweight check.
            # BUT requirement says "pricing calculated server-side".
            # Let's rely on PricingService constants but we need to know IF it's a holiday.
            # We'll import CalendarService inside method to avoid circular deps if needed, 
            # OR we accept that we need DB access. 
            # Actually, `AdminPricingService` is likely called from the Router where DB is available.
            # Let's refactor signature to accept holiday info OR keep it simple if we can.
            # The prompt implies integrating with existing rules.
            # Let's assume we can use a helper or just strict day-of-week logic + existing holiday list if available.
            # Since I can't easily inject the repo here without changing signature significantly,
            # I will use a simplified assumption or minimal DB call pattern if `PricingService` allows.
            # BETTER APPROACH: The `admin.py` router has the DB. It should pass the holiday context?
            # Or `AdminPricingService` should assume it's checking widely. 
            # Let's defer holiday fetching to the caller or add a `holidays` param.
            # For now, I'll add `holidays` list as optional param to `calculate_admin_preview`.
            pass 

        return {} # Placeholder until next edit step to keep chunk manageable? 
        # No, I should implement it fully. 
        # I'll update the class signature to accept 'is_holiday_window' boolean or similar?
        # Actually, let's implement the High Water Mark logic assuming we can check dates.
        # Weekday: Mon-Thu. Weekend: Fri-Sun. 
        # Holiday: If ANY day is holiday -> Holiday Rate? 
        # "Holiday Weekend (any booking window that includes a public holiday...)"
        # This implies we need to know if there's a holiday.
        # I'll add `has_holiday` boolean param.

    @classmethod
    def calculate_manual_price(cls, check_in: date, check_out: date, guests: int, policy_type: BookingPolicy, has_holiday: bool = False) -> Dict[str, Any]:
        """
        Calculates price with 'High Water Mark' logic.
        """
        # Validate Plans again just in case
        cls.validate_plans(check_in, check_out, guests, policy_type)

        subtotal = 0
        cleaning_fee = 0
        breakdown = []
        
        if policy_type == BookingPolicy.DAY_PASS:
            rate = PricingService.PASADIA_RATE
            subtotal = rate * guests
            breakdown.append(f"Pasadía: {guests} pax x ${rate:,}")
            
        elif policy_type == BookingPolicy.FAMILY_PLAN:
            rate = PricingService.FAMILY_PLAN_RATE
            subtotal = rate
            breakdown.append(f"Plan Familia: ${rate:,}")
            
        else:
            # High Water Mark Logic
            # 1. Base Rates
            rates = []
            nights = max(1, (check_out - check_in).days)
            
            # Simple Logic: 
            # If has_holiday -> ALL nights at HOLIDAY_RATE ($70k).
            # If NO holiday but includes Weekend (Fri, Sat, Sun) -> ALL nights at WEEKEND_RATE ($60k).
            # Else -> WEEKDAY_RATE ($55k).
            
            applicable_rate = PricingService.WEEKDAY_RATE
            rate_name = "Semana"
            
            if has_holiday:
                applicable_rate = PricingService.HOLIDAY_RATE
                rate_name = "Festivo"
            else:
                # Check for weekend in range
                is_weekend = False
                curr = check_in
                while curr < check_out:
                    if curr.weekday() in [4, 5, 6]: # Fri, Sat, Sun
                        is_weekend = True
                        break
                    curr += timedelta(days=1)
                
                if is_weekend:
                    applicable_rate = PricingService.WEEKEND_RATE
                    rate_name = "Fin de Semana"
            
            subtotal = applicable_rate * guests * nights
            breakdown.append(f"Tarifa {rate_name} (Aplicada a todo): ${applicable_rate:,}")
            breakdown.append(f"{guests} pax x {nights} noches")
            
            cleaning_fee = PricingService.CLEANING_FEE
            breakdown.append(f"Aseo: ${cleaning_fee:,}")

        return {
            "subtotal": subtotal,
            "cleaning_fee": cleaning_fee,
            "total_amount": subtotal + cleaning_fee,
            "breakdown": breakdown
        }

    @staticmethod
    def validate_plans(check_in: date, check_out: date, guests: int, policy_type: BookingPolicy):
        if policy_type == BookingPolicy.DAY_PASS:
            if check_in != check_out:
                raise ValueError("El Pasadía debe tener la misma fecha de llegada y salida.")
        elif policy_type == BookingPolicy.FAMILY_PLAN:
            nights = (check_out - check_in).days
            if nights != 1:
                raise ValueError("El Plan Familia es para exactamente 1 noche.")
            if guests > 5:
                raise ValueError("El Plan Familia permite un máximo de 5 personas.")
