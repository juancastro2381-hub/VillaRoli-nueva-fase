import io
from typing import List
from datetime import date
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import openpyxl
from openpyxl import Workbook

from app.db.models import Booking

class ReportingService:
    @staticmethod
    def generate_bookings_pdf(bookings: List[Booking]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elements = []
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Reporte de Reservas - Villa Roli", styles['Title']))
        elements.append(Paragraph(f"Generado: {date.today()}", styles['Normal']))
        elements.append(Paragraph(" ", styles['Normal']))
        
        # Updated Headers
        data = [['ID', 'Entrada', 'Salida', 'Plan', 'Pax', 'Estado', 'Canal', 'Excepción']]
        
        # Rows
        for b in bookings:
            payment_status = b.payments[0].status if b.payments else "N/A"
            channel = "Admin" if b.created_by_admin_id else "Online"
            override = "SÍ" if b.is_override else "NO"
            
            data.append([
                str(b.id),
                str(b.check_in),
                str(b.check_out),
                b.policy_type.value[:10], # Truncate for PDF
                str(b.guest_count),
                b.status.value,
                channel,
                override
            ])
            
        # Table Style
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        
        elements.append(table)
        doc.build(elements)
        
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_bookings_xlsx(bookings: List[Booking]) -> bytes:
        wb = Workbook()
        ws = wb.active
        ws.title = "Reservas"
        
        # Headers
        # Headers
        headers = ['ID', 'Check-In', 'Check-Out', 'Plan', 'Huéspedes', 'Estado', 'Pago', 
                   'Método Pago', 'Canal', 'Excepción', 'Motivo Excepción', 'Admin ID']
        ws.append(headers)
        
        for b in bookings:
            payment = b.payments[0] if b.payments else None
            payment_status = payment.status if payment else "N/A"
            payment_method = payment.payment_method if payment else "N/A"
            channel = "Manual Admin" if b.created_by_admin_id else "Online"
            
            ws.append([
                b.id,
                b.check_in,
                b.check_out,
                b.policy_type.value,
                b.guest_count,
                b.status.value,
                payment_status,
                payment_method,
                channel,
                "SÍ" if b.is_override else "NO",
                b.override_reason or "",
                b.created_by_admin_id or ""
            ])
            
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()
