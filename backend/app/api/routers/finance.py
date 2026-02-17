"""
Finance API Router - Admin Panel Financial Reporting Endpoints

Provides comprehensive financial summaries and reports for admin users.
All endpoints are protected with admin authentication.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.db.models import User
from app.services.financial_service import FinancialService
from app.services.reporting import ReportingService

router = APIRouter()


# Response Models
class RevenueSummaryResponse(BaseModel):
    """
    Comprehensive revenue summary with breakdowns.
    
    Example Response:
    {
        "total_revenue": 1250000.00,
        "total_bookings_confirmed": 8,
        "currency": "COP",
        "revenue_by_plan": {
            "FULL_PROPERTY_WEEKDAY": 800000.00,
            "FULL_PROPERTY_WEEKEND": 450000.00
        },
        "revenue_by_payment_method": {
            "ONLINE_GATEWAY": 900000.00,
            "BANK_TRANSFER": 200000.00,
            "DIRECT_ADMIN_AGREEMENT": 150000.00
        },
        "revenue_by_channel": {
            "online": 900000.00,
            "admin": 350000.00
        },
        "date_range": {
            "from": "2026-02-01",
            "to": "2026-02-28"
        }
    }
    """
    total_revenue: float = Field(..., description="Total revenue in COP")
    total_bookings_confirmed: int = Field(..., description="Number of confirmed bookings contributing to revenue")
    currency: str = Field(default="COP", description="Currency code")
    revenue_by_plan: dict = Field(..., description="Revenue breakdown by booking plan")
    revenue_by_payment_method: dict = Field(..., description="Revenue breakdown by payment method")
    revenue_by_channel: dict = Field(..., description="Revenue breakdown by channel (online vs admin)")
    date_range: dict = Field(..., description="Date range filter applied")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_revenue": 1250000.00,
                "total_bookings_confirmed": 8,
                "currency": "COP",
                "revenue_by_plan": {
                    "FULL_PROPERTY_WEEKDAY": 800000.00,
                    "FULL_PROPERTY_WEEKEND": 450000.00
                },
                "revenue_by_payment_method": {
                    "ONLINE_GATEWAY": 900000.00,
                    "BANK_TRANSFER": 200000.00,
                    "DIRECT_ADMIN_AGREEMENT": 150000.00
                },
                "revenue_by_channel": {
                    "online": 900000.00,
                    "admin": 350000.00
                },
                "date_range": {
                    "from": "2026-02-01",
                    "to": "2026-02-28"
                }
            }
        }


@router.get("/summary", response_model=RevenueSummaryResponse)
def get_financial_summary(
    from_date: Optional[date] = Query(None, alias="from", description="Start date for revenue calculation (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, alias="to", description="End date for revenue calculation (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Get comprehensive financial summary with revenue breakdowns.
    
    **Authorization:** Admin only
    
    **Date Filtering:**
    - Uses `Payment.confirmed_at` for financial/accounting accuracy
    - Defaults to all-time if no dates provided
    - Both dates are inclusive
    
    **Revenue Rules:**
    - Only includes bookings with `status == CONFIRMED`
    - Only includes payments with `status IN (PAID, CONFIRMED_DIRECT_PAYMENT)`
    - Supports multiple payments per booking
    
    **Query Parameters:**
    - `from`: Start date (YYYY-MM-DD) - optional
    - `to`: End date (YYYY-MM-DD) - optional
    
    **Returns:**
    - Total revenue (normalized to 2 decimal places)
    - Count of confirmed bookings
    - Revenue breakdown by plan type
    - Revenue breakdown by payment method
    - Revenue breakdown by channel (online vs admin-created)
    """
    try:
        summary = FinancialService.calculate_revenue_summary(
            db=db,
            start_date=from_date,
            end_date=to_date
        )
        return RevenueSummaryResponse(**summary)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating financial summary: {str(e)}"
        )


@router.get("/report")
def download_financial_report(
    format: str = Query("pdf", pattern="^(pdf|xlsx)$", description="Report format: pdf or xlsx"),
    from_date: Optional[date] = Query(None, alias="from", description="Start date (YYYY-MM-DD)"),
    to_date: Optional[date] = Query(None, alias="to", description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """
    Download financial report in PDF or XLSX format.
    
    **Authorization:** Admin only
    
    **Important:**
    - Uses the SAME FinancialService logic as /summary endpoint
    - No duplicated queries - ensures consistency
    
    **Report Contents:**
    - Detailed booking list with amounts
    - Revenue summary footer
    - All monetary values normalized to 2 decimal places
    
    **Query Parameters:**
    - `format`: pdf or xlsx (default: pdf)
    - `from`: Start date (YYYY-MM-DD) - optional
    - `to`: End date (YYYY-MM-DD) - optional
    
    **Returns:**
    - PDF file (application/pdf) or
    - Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
    """
    try:
        # Get revenue summary using FinancialService (single source of truth)
        summary = FinancialService.calculate_revenue_summary(
            db=db,
            start_date=from_date,
            end_date=to_date
        )
        
        # Get detailed breakdown for report
        details = FinancialService.get_revenue_details(
            db=db,
            start_date=from_date,
            end_date=to_date
        )
        
        if format == "pdf":
            content = ReportingService.generate_financial_report_pdf(
                details=details,
                summary=summary
            )
            filename = f"financial_report_{date.today().isoformat()}.pdf"
            return Response(
                content=content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            content = ReportingService.generate_financial_report_xlsx(
                details=details,
                summary=summary
            )
            filename = f"financial_report_{date.today().isoformat()}.xlsx"
            return Response(
                content=content,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating financial report: {str(e)}"
        )
