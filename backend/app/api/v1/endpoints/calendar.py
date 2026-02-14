from fastapi import APIRouter, Query, Depends
from datetime import date
from typing import List
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.calendar_service import CalendarService
from app.core.database import get_db
from app.db.repository import BookingRepository

router = APIRouter()

class HolidayResponse(BaseModel):
    has_holiday_in_window: bool
    holidays_in_window: List[date]
    holidays_in_range: List[date]
    window_start: date
    window_end: date

@router.get("/holidays", response_model=HolidayResponse)
def check_holidays(
    check_in: date = Query(..., description="Check-in date (YYYY-MM-DD)"),
    check_out: date = Query(..., description="Check-out date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Check if the user's selected dates fall within a 'Holiday Weekend' context.
    Returns the detection result using the central backend logic.
    """
    repo = BookingRepository(db)
    result = CalendarService.check_holiday_window(repo, check_in, check_out)
    return result
