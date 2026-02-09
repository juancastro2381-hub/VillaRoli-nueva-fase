from typing import List

class EmailService:
    def send_confirmation_email(self, to_email: str, booking_id: int):
        """
        Sends a booking confirmation email.
        Currently prints to console (Stub).
        """
        print(f"========================================")
        print(f"📧 SENDING EMAIL TO: {to_email}")
        print(f"Subject: Booking #{booking_id} Confirmed!")
        print(f"Body: Your booking at Villa Roli is confirmed.")
        print(f"========================================")
