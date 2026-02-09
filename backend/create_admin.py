from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.db.models import User
from app.core.security import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def create_admin_user(email, password):
    db = SessionLocal()
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User {email} already exists.")
            return
        
        hashed = get_password_hash(password)
        admin = User(
            email=email,
            hashed_password=hashed,
            is_active=True,
            is_admin=True
        )
        db.add(admin)
        db.commit()
        print(f"Admin user {email} created successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user("admin@villaroli.com", "admin123")
