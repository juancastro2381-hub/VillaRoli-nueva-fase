from typing import Set, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from datetime import date

class Settings(BaseSettings):
    # App Config
    ENVIRONMENT: str = "DEV" # DEV, STAGING, PROD
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_SUPER_SECRET"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 300
    
    # Database
    # using absolute path to avoid CWD issues
    DATABASE_URL: str = "sqlite:///c:/Users/juanc/OneDrive/Documentos/Desarrollo proyectos/Villa Roli/Proyecto descargado/villa-roli-escape-main/backend/villa_roli.db"
    
    # Security / CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ]
    
    # Payments
    PAYMENT_PROVIDER: str = "DUMMY" # DUMMY, STRIPE
    PAYMENT_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    PENDING_TIMEOUT_MINUTES: int = 60
    
    # Operations
    ENABLE_INTERNAL_SCHEDULER: bool = True
    CRON_SECRET: str = "CHANGE_ME_CRON_SECRET"
    
    # Business Logic
    # Holidays are now managed by CalendarService

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # Ignore extra env vars
    )

settings = Settings()
