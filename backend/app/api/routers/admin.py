from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.db.models import Booking, User, BookingStatus, Property
from app.domain.models import BookingPolicy
from app.api.deps import get_current_admin
from app.services.booking_engine import BookingService
from app.db.repository import BookingRepository
from pydantic import BaseModel

router = APIRouter()

# Response Models
class BookingResponse(BaseModel):
    id: int
    property_id: int
    check_in: date
    check_out: date
    status: str
    guest_count: int
    
    class Config:
        from_attributes = True

class PropertyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    max_guests: int
    base_price_night: float

@router.get("/bookings", response_model=List[BookingResponse])
def list_bookings(
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    return query.limit(limit).all()

@router.post("/properties")
def create_property(
    prop: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    db_prop = Property(
        name=prop.name,
        description=prop.description,
        max_guests=prop.max_guests
        # base_price currently not in DB model, ignoring for now or adding later
    )
    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return {"status": "created", "property_id": db_prop.id}

class BlockDatesRequest(BaseModel):
    property_id: int
    check_in: date
    check_out: date

@router.post("/blocks")
def block_dates(
    block_req: BlockDatesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Manually block dates for maintenance.
    """
    repo = BookingRepository(db)
    
    if not repo.check_availability(block_req.property_id, block_req.check_in, block_req.check_out):
        raise HTTPException(status_code=409, detail="Dates already booked")
    
    # Create manual block
    block = Booking(
        property_id=block_req.property_id,
        check_in=block_req.check_in,
        check_out=block_req.check_out,
        status=BookingStatus.BLOCKED,
        guest_count=0,
        policy_type=BookingPolicy.FULL_PROPERTY_WEEKDAY # Dummy policy
    )
    
    db.add(block)
    db.commit()
    db.refresh(block)
    
    return {"status": "blocked", "id": block.id}
