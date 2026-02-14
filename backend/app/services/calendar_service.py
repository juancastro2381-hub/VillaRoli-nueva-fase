from datetime import date, timedelta
from typing import Dict, Any, List, Set
from app.db.repository import BookingRepository
from app.core.holidays_co import get_colombian_holidays

class CalendarService:
    @staticmethod
    def get_holidays_in_range(repo: BookingRepository, start: date, end: date) -> List[date]:
        """
        Combines algorithmic holidays (Ley Emiliani) with Database overrides.
        """
        # 1. Get Algorithmic Holidays for relevant years
        algo_holidays = set()
        for year in range(start.year, end.year + 1):
            holidays = get_colombian_holidays(year)
            for h in holidays:
                h_date = h['date']
                if start <= h_date <= end:
                    algo_holidays.add(h_date)
        
        # 2. Get DB Holidays (Overrides/Additions)
        db_holidays = set(repo.get_holidays_in_range(start, end))
        
        # 3. Merge (Union)
        return sorted(list(algo_holidays | db_holidays))

    @staticmethod
    def check_holiday_window(repo: BookingRepository, check_in: date, check_out: date) -> Dict[str, Any]:
        """
        Determines if the requested dates fall within a "Holiday Window".
        Strategy:
        1. Identify the 'Anchor Sunday' for the check-in/check-out period.
           - If check-in is Fri/Sat/Sun, Anchor is that Sunday.
           - If check-in is Mon, Anchor is preceding Sunday? Or is Mon the holiday?
           - Let's use the logic: "Look for holidays in the expanded window [Thu-Mon] surrounding the stay."
        
        Refined Logic:
        - Window Start: Thursday before check-in (or check-in if it's Thu).
        - Window End: Monday after check-out.
        
        Actually, simplest robust logic for "Holiday Weekend":
        - Take all dates in booking range [check_in, check_out).
        - Find the Sunday associated with these dates.
          - If Check-in is Fri, Sat, Sun -> Sunday is obvious.
          - If Check-in is Mon (Holiday) -> Sunday is day before.
        - Once we have the "Anchor Sunday", the "Holiday Window" is Thu -> Mon.
        - We check if there is ANY holiday in that Thu->Mon window.
        """
        
        # Find Anchor Sunday
        # If check-in is <= Sunday, use coming Sunday.
        # If check-in is Mon, use yesterday.
        # This heuristic tries to group "Weekend" logic.
        
        anchor_sunday = None
        if check_in.weekday() == 6: # Sunday
            anchor_sunday = check_in
        elif check_in.weekday() == 0: # Monday
            anchor_sunday = check_in - timedelta(days=1)
        else:
            # Find next Sunday
            days_to_sunday = 6 - check_in.weekday()
            anchor_sunday = check_in + timedelta(days=days_to_sunday)
            
        # Define the window: Thursday before Sunday ... Monday after Sunday
        # Thu = Sunday - 3 days
        # Mon = Sunday + 1 day
        window_start = anchor_sunday - timedelta(days=3)
        window_end = anchor_sunday + timedelta(days=1)
        
        # 3. Check for holidays in this window (Algorithm + DB)
        holidays_in_window = CalendarService.get_holidays_in_range(repo, window_start, window_end)
        
        # 4. Check for holidays in the specific requested range
        holidays_in_range = CalendarService.get_holidays_in_range(repo, check_in, check_out)
        
        return {
            "has_holiday_in_window": len(holidays_in_window) > 0,
            "window_start": window_start,
            "window_end": window_end,
            "holidays_in_window": holidays_in_window,
            "holidays_in_range": holidays_in_range
        }
