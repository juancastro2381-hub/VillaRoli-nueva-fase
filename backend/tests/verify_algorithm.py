import sys
import os
from datetime import date

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.holidays_co import get_colombian_holidays

def verify_year(year, expected_count):
    print(f"--- Verifying {year} ---")
    holidays = get_colombian_holidays(year)
    for h in holidays:
        print(f"{h['date']}: {h['name']}")
    
    if len(holidays) != expected_count:
        print(f"❌ Count Mismatch! Expected {expected_count}, Got {len(holidays)}")
    else:
        print(f"✅ Count Matches: {len(holidays)}")
        
    return holidays

def main():
    # 2026 Known Count: 18
    # 2027 Known Count: 18
    h26 = verify_year(2026, 18)
    h27 = verify_year(2027, 18)
    
    # Check specific moved date: Jan 6 2026 (Tue) -> Jan 12 (Mon)
    jan6_2026 = next((h for h in h26 if h["name"] == "Reyes Magos"), None)
    if jan6_2026 and jan6_2026["date"] == date(2026, 1, 12):
        print("✅ Ley Emiliani Logic (Jan 6 -> Jan 12) Passed")
    else:
        print(f"❌ Ley Emiliani Logic Failed. Got {jan6_2026}")

    # Check Easter 2026: Apr 5.
    # Thu Santo: Apr 2. Fri Santo: Apr 3.
    thu_santo = next((h for h in h26 if h["name"] == "Jueves Santo"), None)
    if thu_santo and thu_santo["date"] == date(2026, 4, 2):
        print("✅ Easter Logic (Thu Santo) Passed")
    else:
        print(f"❌ Easter Logic Failed. Got {thu_santo}")

if __name__ == "__main__":
    main()
