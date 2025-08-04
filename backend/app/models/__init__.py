# Import all models here to ensure they are registered with SQLAlchemy
from .user import User, AuthProvider, UserProvider, LoginAttempt, PasswordResetRequest
from .house import House, HouseDailyOccupancy
from .reservation import Reservation, ReservationAuditLog
from .checkin import CheckIn, CheckOut, InventoryItem
from .checklist import ChecklistCategory, ChecklistItem, HouseChecklistStatus, HouseCategoryStatus, TaskCompletionLog
from .maintenance import MaintenanceIssue, MaintenanceType, MaintenanceStatusLog
from .finance import FinancialOperation, FileAttachment

__all__ = [
    "User",
    "AuthProvider", 
    "UserProvider",
    "LoginAttempt",
    "PasswordResetRequest",
    "House",
    "HouseDailyOccupancy",
    "Reservation",
    "ReservationAuditLog",
    "CheckIn",
    "CheckOut",
    "InventoryItem",
    "ChecklistCategory",
    "ChecklistItem",
    "HouseChecklistStatus",
    "HouseCategoryStatus",
    "TaskCompletionLog",
    "MaintenanceIssue",
    "MaintenanceType",
    "MaintenanceStatusLog",
    "FinancialOperation",
    "FileAttachment",
]