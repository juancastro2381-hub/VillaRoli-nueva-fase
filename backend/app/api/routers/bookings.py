from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.core.database import get_db
from app.domain.models import BookingRequest
from app.services.booking_engine import BookingService, OverbookingError
from app.db.repository import BookingRepository
from app.core.exceptions import RuleViolationError

router = APIRouter()

def get_service(db: Session = Depends(get_db)) -> BookingService:
    repo = BookingRepository(db)
    return BookingService(repo)

@router.post("/")
def create_booking(
    request: BookingRequest,
    property_id: int = 1, # Default to property 1 for single-property systems
    service: BookingService = Depends(get_service)
):
    try:
        # Service logic handles domain rules + DB availability
        booking = service.create_booking(request, property_id)
        return {"status": "confirmed", "booking_id": booking.id}
    except RuleViolationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except OverbookingError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/availability")
def check_availability(
    check_in: date,
    check_out: date,
    property_id: int = 1,
    db: Session = Depends(get_db)
):
    repo = BookingRepository(db)
    is_available = repo.check_availability(property_id, check_in, check_out)
    return {"property_id": property_id, "available": is_available}
