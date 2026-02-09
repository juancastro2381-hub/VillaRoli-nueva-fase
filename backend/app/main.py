from fastapi import FastAPI
from app.api.routers import bookings, auth, admin, payments
from app.core.database import engine, Base

# Create tables on startup (for demo purposes)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Villa Roli Booking Engine")

app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Booking Engine is running"}
