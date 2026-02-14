import sys
import os
from datetime import date

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.db.repository import BookingRepository
from app.db.models import Holiday # Import to register with Base

def seed_holidays():
    print("Creating tables if not exist...")
    # Ensure tables exist (including new Holidays table)
    Base.metadata.create_all(bind=engine)
    
    session = SessionLocal()
    repo = BookingRepository(session)
    
    # 2026 Holidays Data
    holidays_2026 = [
        (date(2026, 1, 1), "Año Nuevo"),
        (date(2026, 1, 12), "Reyes Magos"),
        (date(2026, 3, 23), "San José"),
        (date(2026, 4, 2), "Jueves Santo"),
        (date(2026, 4, 3), "Viernes Santo"),
        (date(2026, 5, 1), "Día del Trabajo"),
        (date(2026, 5, 18), "Ascensión del Señor"),
        (date(2026, 6, 8), "Corpus Christi"),
        (date(2026, 6, 15), "Sagrado Corazón"),
        (date(2026, 6, 29), "San Pedro y San Pablo"),
        (date(2026, 7, 20), "Día de la Independencia"),
        (date(2026, 8, 7), "Batalla de Boyacá"),
        (date(2026, 8, 17), "Asunción de la Virgen"),
        (date(2026, 10, 12), "Día de la Raza"),
        (date(2026, 11, 2), "Todos los Santos"),
        (date(2026, 11, 16), "Independencia de Cartagena"),
        (date(2026, 12, 8), "Inmaculada Concepción"),
        (date(2026, 12, 25), "Navidad"),
    ]

    # 2027 Holidays Data
    holidays_2027 = [
        (date(2027, 1, 1), "Año Nuevo"),
        (date(2027, 1, 11), "Reyes Magos"),
        (date(2027, 3, 22), "San José"),
        (date(2027, 4, 1), "Jueves Santo"),
        (date(2027, 4, 2), "Viernes Santo"),
        (date(2027, 5, 1), "Día del Trabajo"),
        (date(2027, 5, 17), "Ascensión del Señor"),
        (date(2027, 6, 7), "Corpus Christi"),
        (date(2027, 6, 14), "Sagrado Corazón"),
        (date(2027, 7, 5), "San Pedro y San Pablo"),
        (date(2027, 7, 20), "Día de la Independencia"),
        (date(2027, 8, 7), "Batalla de Boyacá"),
        (date(2027, 8, 16), "Asunción de la Virgen"),
        (date(2027, 10, 18), "Día de la Raza"),
        (date(2027, 11, 1), "Todos los Santos"),
        (date(2027, 11, 15), "Independencia de Cartagena"),
        (date(2027, 12, 8), "Inmaculada Concepción"),
        (date(2027, 12, 25), "Navidad"),
    ]

    all_holidays = holidays_2026 + holidays_2027

    print(f"Seeding {len(all_holidays)} holidays for 2026-2027...")
    
    count = 0
    for h_date, h_name in all_holidays:
        repo.add_holiday(h_date, h_name)
        count += 1
        
    print(f"Successfully seeded {count} holidays.")
    session.close()

if __name__ == "__main__":
    seed_holidays()
