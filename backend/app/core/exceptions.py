class BookingException(Exception):
    """Base exception for booking errors"""
    pass

class RuleViolationError(BookingException):
    """Raised when a booking request violates a business rule"""
    def __init__(self, message: str, rule_name: str = "Unknown"):
        self.rule_name = rule_name
        super().__init__(f"Rule '{rule_name}' failed: {message}")

class OverbookingError(BookingException):
    """Raised when a booking request fails availability check"""
    def __init__(self, message: str):
        super().__init__(message)
