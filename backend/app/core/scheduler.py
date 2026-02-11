from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.db.models import Booking, BookingStatus
from datetime import datetime
import logging

# Configure Logger
logger = logging.getLogger("scheduler")
logger.setLevel(logging.INFO)

scheduler = AsyncIOScheduler()

def get_db_context():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def expire_stale_bookings():
    """
    Checks for bookings that are PENDING_PAYMENT and have passed their expires_at time.
    Updates them to EXPIRED status to release availability.
    """
    db = SessionLocal()
    try:
        now = datetime.now()
        
        # Query Stale Bookings
        stale_bookings = db.query(Booking).filter(
            Booking.status == BookingStatus.PENDING,
            Booking.expires_at < now
        ).all()
        
        if not stale_bookings:
            # logger.info("No stale bookings found.")
            return
            
        logger.info(f"Found {len(stale_bookings)} stale bookings. Expiring...")
        
        expired_count = 0
        for booking in stale_bookings:
            try:
                old_status = booking.status
                booking.status = BookingStatus.EXPIRED # inventory released logically by status check
                logger.info(f"Booking {booking.id} EXPIRED. (Was {old_status}, ExpiresAt: {booking.expires_at})")
                expired_count += 1
            except Exception as e:
                logger.error(f"Failed to expire booking {booking.id}: {e}")
        
        db.commit()
        if expired_count > 0:
            logger.info(f"Successfully expired {expired_count} bookings.")
            
    except Exception as e:
        logger.error(f"Scheduler Error: {e}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        # Run every 5 minutes
        trigger = IntervalTrigger(minutes=5)
        scheduler.add_job(expire_stale_bookings, trigger, id="expire_bookings", replace_existing=True)
        scheduler.start()
        logger.info("Scheduler started. Job 'expire_bookings' active (5 min interval).")
