from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date
from typing import Optional

from app.db.models import Booking, BookingStatus

class BookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def check_availability(self, property_id: int, start: date, end: date) -> bool:
        """
        Checks if the property is free for the given range.
        Uses 'FOR UPDATE' logic to lock rows during transaction (MySQL support).
        
        Logic:
        Overlap exists IF:
        (ExistingStart < RequestEnd) AND (ExistingEnd > RequestStart)
        """
        stmt = self.db.query(Booking).filter(
            Booking.property_id == property_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.BLOCKED, BookingStatus.PENDING]),
            Booking.check_in < end,
            Booking.check_out > start
        ).with_for_update() # Locks rows in MySQL/Postgres for concurrency safety
        
        count = stmt.count()
        return count == 0

    def create_booking(self, booking_data: dict) -> Booking:
        db_booking = Booking(**booking_data)
        self.db.add(db_booking)
        self.db.commit()
        self.db.refresh(db_booking)
        return db_booking
    
    def get_booking(self, booking_id: int) -> Optional[Booking]:
        return self.db.query(Booking).filter(Booking.id == booking_id).first()
