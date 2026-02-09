from datetime import date
from typing import Set

class Settings:
    # Hardcoding some 2026 holidays for demonstration purposes
    # In a real app, this might come from a DB or external API
    HOLIDAYS_2026: Set[date] = {
        date(2026, 1, 1),   # New Year
        date(2026, 3, 23),  # St Joseph (Approx)
        date(2026, 4, 2),   # Maundy Thursday
        date(2026, 4, 3),   # Good Friday
        date(2026, 5, 1),   # Labor Day
        date(2026, 7, 20),  # Independence Day
        date(2026, 8, 7),   # Battle of Boyaca
        date(2026, 12, 25), # Christmas
    }

settings = Settings()
