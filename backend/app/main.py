from fastapi import FastAPI
from app.api.routers import bookings, auth, admin, payments
from app.core.database import engine, Base

# Create tables on startup (for demo purposes)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Villa Roli Booking Engine")

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Booking Engine is running"}
