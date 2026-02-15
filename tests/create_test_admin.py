from app.db.models import User
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash

def create_admin():
    print("Creating tables if not exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@villaroli.com").first()
        if user:
            print("Admin already exists. Updating password to 'admin123'")
            user.hashed_password = get_password_hash("admin123")
            user.is_admin = True
            db.commit()
            return

        print("Creating admin user...")
        user = User(
            email="admin@villaroli.com",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            is_admin=True
        )
        db.add(user)
        db.commit()
        print("Admin created: admin@villaroli.com / admin123")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
