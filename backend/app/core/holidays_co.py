from datetime import date, timedelta
from typing import List, Dict
from functools import lru_cache

def get_easter(year: int) -> date:
    """
    Calculate Easter Sunday for a given year using the standard algorithm.
    """
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    
    month = (h + l - 7 * m + 114) // 31
    day = ((h + l - 7 * m + 114) % 31) + 1
    
    return date(year, month, day)

def move_to_next_monday(d: date) -> date:
    """
    Apply Ley Emiliani: If the holiday falls on Tue-Fri, move to next Monday.
    Actually, the law says:
    - If it falls on Sunday -> Stays Sunday? Or moves? 
      Wait, Ley Emiliani says if it falls on a weekend it stays? 
      Actually, most sources say: "If it falls on a weekend, it does NOT move." 
      BUT specific holidays ALWAYS move to the *following Monday* regardless of the day they fall on (e.g. Ascension).
      AND specific fixed-date holidays (like Jan 6) move to the following Monday unless they fall on a Monday?
      
      Let's clarify the rules:
      TYPE A: Fixed Date (Never moves). E.g. Jan 1, May 1.
      TYPE B: Fixed Date (Moves to Next Monday). E.g. Jan 6.
      TYPE C: Relative to Easter (Moves to Next Monday). E.g. Ascension.
      TYPE D: Relative to Easter (Fixed). E.g. Good Friday.
      
      For TYPE B and C: They are celebrated on the *following Monday*.
      Logic: Find the Monday *after* the date.
      Example: If date is Tuesday, +6 days. If Sunday, +1 day.
      Wait, if date IS Monday, does it move? No, it stays. 
    """
    weekday = d.weekday() # 0=Mon ... 6=Sun
    if weekday == 0:
        return d
    
    days_ahead = 7 - weekday
    return d + timedelta(days=days_ahead)

@lru_cache()
def get_colombian_holidays(year: int) -> List[Dict]:
    """
    Returns a list of holidays for the given year.
    Each item is {"date": date, "name": str}.
    Cached to avoid re-calculation.
    """
    holidays = []

    # --- TYPE A: Fixed Date (Inamovibles) ---
    fixed_dates = [
        (1, 1, "Año Nuevo"),
        (5, 1, "Día del Trabajo"),
        (7, 20, "Día de la Independencia"),
        (8, 7, "Batalla de Boyacá"),
        (12, 8, "Inmaculada Concepción"),
        (12, 25, "Navidad")
    ]
    for month, day, name in fixed_dates:
        holidays.append({"date": date(year, month, day), "name": name})

    # --- TYPE B: Fixed Date -> Moves to Next Monday (Ley Emiliani) ---
    emiliani_dates = [
        (1, 6, "Reyes Magos"),
        (3, 19, "San José"),
        (6, 29, "San Pedro y San Pablo"),
        (8, 15, "Asunción de la Virgen"),
        (10, 12, "Día de la Raza"),
        (11, 1, "Todos los Santos"),
        (11, 11, "Independencia de Cartagena")
    ]
    for month, day, name in emiliani_dates:
        base_date = date(year, month, day)
        final_date = move_to_next_monday(base_date)
        holidays.append({"date": final_date, "name": name})

    # --- EASTER CALCULATION ---
    easter = get_easter(year)
    
    # --- TYPE D: Easter Relative (Fixed) ---
    # Jueves Santo: -3 days
    holidays.append({"date": easter - timedelta(days=3), "name": "Jueves Santo"})
    # Viernes Santo: -2 days
    holidays.append({"date": easter - timedelta(days=2), "name": "Viernes Santo"})
    # Easter Sunday itself is usually not a "holiday" for banking purposes but is a religious day.
    # Usually treated as a holiday in context of tourism? No, standard Sun.
    
    # --- TYPE C: Easter Relative -> Moves to Next Monday ---
    # Ascensión del Señor: +39 days (40th day after Easter) -> Moved to Monday
    # Actually, Ascension is Thu. 40 days after Easter Sunday.
    ascension_base = easter + timedelta(days=39) # Thursday
    holidays.append({"date": move_to_next_monday(ascension_base), "name": "Ascensión del Señor"})
    
    # Corpus Christi: +60 days after Easter (Thu) -> Moved to Monday
    corpus_base = easter + timedelta(days=60) # Thursday
    holidays.append({"date": move_to_next_monday(corpus_base), "name": "Corpus Christi"})
    
    # Sagrado Corazón: +68 days after Easter (Fri) -> Moved to Monday
    # Actually, Sacred Heart is 19 days after Pentecost. Pentecost is +49. So +68.
    sacred_heart_base = easter + timedelta(days=68) # Friday
    holidays.append({"date": move_to_next_monday(sacred_heart_base), "name": "Sagrado Corazón"})

    return sorted(holidays, key=lambda x: x["date"])
