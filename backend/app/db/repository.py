from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import date, datetime
from typing import Optional

from app.db.models import Booking, BookingStatus, Property

class BookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def lock_property(self, property_id: int):
        """
        Locks the property row for the duration of the transaction.
        Prevents race conditions (Double Booking) by serializing checks per property.
        """
        # with_for_update() locks the selected row(s)
        self.db.query(Property).filter(Property.id == property_id).with_for_update().first()

    def check_availability(self, property_id: int, start: date, end: date) -> bool:
        """
        Checks if the property is free for the given range.
        Handles Day Pass (start==end) and Nightly (start!=end) logic correctly.
        """
        # 1. Fetch potential conflicts (Inclusive Query)
        # We fetch anything that touches the dates [start, end]
        # Ignore PENDING bookings that are expired
        now = datetime.now()
        
        candidates = self.db.query(Booking).filter(
            Booking.property_id == property_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.BLOCKED, BookingStatus.PENDING]),
            Booking.check_in <= end,
            Booking.check_out >= start
        ).all()
        
        # Filter out Expired Pending Bookings in Python (easier than complex SQL with nullable)
        active_candidates = []
        for b in candidates:
            if b.status == BookingStatus.PENDING and b.expires_at and b.expires_at < now:
                continue # Expired, treat as free
            active_candidates.append(b)
            
        candidates = active_candidates

        is_request_day_pass = (start == end)

        for booking in candidates:
            is_existing_day_pass = (booking.check_in == booking.check_out)
            
            # Case A: Day Pass Involved (Strict Overlap)
            # If either is a Day Pass, they cannot touch at all on the same day.
            # Day Pass [D,D] occupies D fully (8am-5pm).
            # Night [D-1, D] occupies D fully (until 1pm). Overlap!
            # Night [D, D+1] occupies D fully (from 1pm). Overlap!
            if is_request_day_pass or is_existing_day_pass:
                # Any date intersection is a conflict
                # Range Logic: [A, B] overlaps [C, D] if A<=D and B>=C.
                # Since we queried exactly this, ANY candidate is a conflict?
                # Let's double check.
                # Req Day Pass [10,10]. Ex Night [9,10].
                # 10<=10 and 10>=9. Match. Conflict. Correct.
                # Req Day Pass [10,10]. Ex Night [10,11].
                # 10<=11 and 10>=10. Match. Conflict. Correct.
                # Yes, if Day Pass is involved, the inclusive query IS the conflict.
                return False

            # Case B: Night vs Night (Standard logic)
            # [10,11] vs [11,12]. 
            # 10<=12, 11>=11. Match in query.
            # But standard night-to-night allows touch points.
            # Conflict only if STRICT overlap (Start < End AND End > Start)
            if booking.check_in < end and booking.check_out > start:
                return False
                
        return True

    def create_booking(self, booking_data: dict) -> Booking:
        db_booking = Booking(**booking_data)
        self.db.add(db_booking)
        self.db.commit()
        self.db.refresh(db_booking)
        return db_booking
    
    def get_booking(self, booking_id: int) -> Optional[Booking]:
        return self.db.query(Booking).filter(Booking.id == booking_id).first()
