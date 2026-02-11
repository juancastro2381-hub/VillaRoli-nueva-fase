from fastapi import FastAPI
from app.api.routers import bookings, auth, admin, payments
from app.core.database import engine, Base

# Create tables on startup (for demo purposes)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Villa Roli Booking Engine")

from app.core.logging import setup_logging
from app.core.config import settings

# Initialize Logging
setup_logging()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex="https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])

from app.api.routers import content, admin_content
app.include_router(content.router, prefix="/content", tags=["content"])
app.include_router(admin_content.router, prefix="/admin/content", tags=["admin-content"])

from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.exceptions import RuleViolationError
import logging

@app.exception_handler(RuleViolationError)
async def rule_violation_handler(request: Request, exc: RuleViolationError):
    return JSONResponse(
        status_code=422,
        content={
            "error_code": exc.rule_name, # Mapped from rule_name
            "message": str(exc),
            "details": {"rule": exc.rule_name}
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Global Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "Error interno del servidor",
            "details": str(exc)
        },
    )

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Booking Engine is running"}

# Startup Events
from app.core.scheduler import start_scheduler

@app.on_event("startup")
async def startup_event():
    start_scheduler()
