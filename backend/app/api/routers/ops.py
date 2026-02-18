import logging
from fastapi import APIRouter, Depends, HTTPException, Header, status
from app.core.config import settings
from app.core.scheduler import expire_stale_bookings

router = APIRouter()

logger = logging.getLogger("ops")

async def verify_cron_secret(x_cron_secret: str = Header(None, alias="X-Cron-Secret")):
    """
    Verifies the request comes from an authorized Cron Job.
    """
    if not settings.CRON_SECRET:
        # If no secret configured, fail closed
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cron secret not configured"
        )
        
    if x_cron_secret != settings.CRON_SECRET:
        logger.warning(f"Unauthorized cron attempt. Header: {x_cron_secret}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Cron Secret"
        )
    return True

@router.post("/expire-stale")
def trigger_expiration_job(authorized: bool = Depends(verify_cron_secret)):
    """
    Trigger the stale booking expiration job.
    Secured by X-Cron-Secret header.
    """
    try:
        expire_stale_bookings()
        return {"status": "success", "message": "Expiration job executed"}
    except Exception as e:
        logger.error(f"Error in manual expiration job: {e}")
        raise HTTPException(status_code=500, detail=str(e))
