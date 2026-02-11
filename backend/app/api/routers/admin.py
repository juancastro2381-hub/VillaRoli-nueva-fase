from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.core.database import get_db
from app.db.models import Booking, User, BookingStatus, Property
from app.domain.models import BookingPolicy
from app.api.deps import get_current_admin
from app.services.booking_engine import BookingService
from app.db.repository import BookingRepository
from app.services.reporting import ReportingService
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
    
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_city: Optional[str] = None
    
    is_override: bool
    override_reason: Optional[str] = None
    rules_bypassed: Optional[str] = None
    
    # We need to fetch Payment info manually or via relationship
    # For now, let's assume we can get it from the ORM relationship 'payments'
    # But Booking model might need to be eager loaded
    
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

class ManualBookingRequest(BaseModel):
    property_id: int
    check_in: date
    check_out: date
    guest_count: int
    policy_type: BookingPolicy
    
    # Override fields
    is_override: bool = False
    override_reason: Optional[str] = None

@router.post("/bookings")
def create_manual_booking(
    booking_req: ManualBookingRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Creates a booking manually. 
    Allows Admin Override of commercial rules if is_override=True.
    """
    repo = BookingRepository(db)
    service = BookingService(repo)
    
    # Convert to Domain Request
    from app.domain.models import BookingRequest
    domain_req = BookingRequest(
        check_in=booking_req.check_in,
        check_out=booking_req.check_out,
        guest_count=booking_req.guest_count,
        policy_type=booking_req.policy_type
    )
    
    try:
        booking = service.create_booking(
            request=domain_req,
            property_id=booking_req.property_id,
            is_override=booking_req.is_override,
            override_reason=booking_req.override_reason,
            admin_id=current_admin.id
        )
        return {"status": "created", "booking_id": booking.id, "rules_bypassed": booking.rules_bypassed}
    except Exception as e:
        # Map domain errors to HTTP errors
        # In a real app we'd have a global exception handler, but here we do it explicitly for clarity
        if "Overbooking" in str(e):
             raise HTTPException(status_code=409, detail=str(e))
        if "Rule" in str(e) or "Value" in str(e):
             raise HTTPException(status_code=400, detail=str(e))
        raise e

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
    
    db.add(block)
    db.commit()
    db.refresh(block)
    
    return {"status": "blocked", "id": block.id}

from app.db.models import Payment, PaymentStatus
from datetime import date as dt_date

@router.post("/payments/{payment_id}/confirm")
def confirm_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Manually confirm a payment (Bank Transfer or Direct Agreement).
    Updates Payment Status -> PAID / CONFIRMED_DIRECT
    Updates Booking Status -> CONFIRMED
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
         raise HTTPException(status_code=404, detail="Payment not found")
         
    if payment.status in [PaymentStatus.PAID, PaymentStatus.CONFIRMED_DIRECT_PAYMENT]:
         return {"status": "already_confirmed"}
         
    # Logic based on method
    if payment.payment_method == "BANK_TRANSFER":
        payment.status = PaymentStatus.PAID
    elif payment.payment_method == "DIRECT_ADMIN_AGREEMENT":
        payment.status = PaymentStatus.CONFIRMED_DIRECT_PAYMENT
    else:
        # Fallback for manual override of Online?
        payment.status = PaymentStatus.PAID
        
    payment.confirmed_at = dt_date.today()
    payment.confirmed_by_admin_id = current_admin.id
    
    # Confirm Booking
    if payment.booking:
        payment.booking.status = BookingStatus.CONFIRMED
        
    db.commit()
    return {"status": "confirmed", "payment_status": payment.status}


@router.get("/reports/bookings")
def download_bookings_report(
    format: str = Query("pdf", regex="^(pdf|xlsx)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Download bookings report in PDF or XLSX format.
    """
    query = db.query(Booking)
    if start_date:
        query = query.filter(Booking.check_in >= start_date)
    if end_date:
        query = query.filter(Booking.check_in <= end_date)
        
    bookings = query.all()
    
    if format == "pdf":
        pdf_content = ReportingService.generate_bookings_pdf(bookings)
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=reservas.pdf"}
        )
    else:
        return Response(
            content=xlsx_content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=reservas.xlsx"}
        )

@router.post("/bookings/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = BookingStatus.CANCELLED
    db.commit()
    return {"status": "cancelled", "id": booking.id}

    booking.status = BookingStatus.CONFIRMED
    db.commit()
    return {"status": "confirmed", "id": booking.id}

from app.core.scheduler import expire_stale_bookings

@router.post("/ops/expire-stale")
def trigger_expiration_job(
    current_admin: User = Depends(get_current_admin)
):
    """
    Manually trigger the stale booking expiration job.
    """
    expire_stale_bookings()
    return {"status": "job_triggered", "message": "Stale bookings expiration logic executed."}
