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
    DATABASE_URL: str = "sqlite:///./villa_roli.db"
    
    # Security / CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
    ]
    
    # Payments
    PAYMENT_WEBHOOK_SECRET: Optional[str] = None
    PENDING_TIMEOUT_MINUTES: int = 60
    
    # Business Logic
    HOLIDAYS_2026: Set[date] = {
        date(2026, 1, 1),   # Año Nuevo
        date(2026, 1, 12),  # Reyes Magos (Lun)
        date(2026, 3, 23),  # San José (Lun)
        date(2026, 4, 2),   # Jueves Santo
        date(2026, 4, 3),   # Viernes Santo
        date(2026, 5, 1),   # Día del Trabajo (Vie)
        date(2026, 5, 18),  # Ascensión del Señor (Lun)
        date(2026, 6, 8),   # Corpus Christi (Lun)
        date(2026, 6, 15),  # Sagrado Corazón (Lun)
        date(2026, 6, 29),  # San Pedro y San Pablo (Lun)
        date(2026, 7, 20),  # Día de la Independencia (Lun)
        date(2026, 8, 7),   # Batalla de Boyacá (Vie)
        date(2026, 8, 17),  # Asunción de la Virgen (Lun)
        date(2026, 10, 12), # Día de la Raza (Lun)
        date(2026, 11, 2),  # Todos los Santos (Lun)
        date(2026, 11, 16), # Independencia de Cartagena (Lun)
        date(2026, 12, 8),  # Inmaculada Concepción (Mar)
        date(2026, 12, 25), # Navidad (Vie)
    }

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # Ignore extra env vars
    )

settings = Settings()
