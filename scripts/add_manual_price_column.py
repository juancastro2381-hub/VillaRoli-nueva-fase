from sqlalchemy import create_engine, text
from app.core.config import settings

def add_column():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        print("Checking if 'manual_total_amount' column exists in 'bookings' table...")
        try:
            # Check if column exists (SQLite specific pragmas or just try add)
            # Simplest for SQLite/Postgres hybrid is to try and catch error
            conn.execute(text("ALTER TABLE bookings ADD COLUMN manual_total_amount FLOAT"))
            conn.commit() # CRITICAL: Ensure change is committed
            print("Column 'manual_total_amount' added successfully.")
        except Exception as e:
            if "duplicate column" in str(e) or "already exists" in str(e):
                print("Column already exists. Skipping.")
            else:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    add_column()
