# Import all schemas here
from .user import UserCreate, UserLogin, UserResponse, Token, TokenData
from .reservation import ReservationCreate, ReservationUpdate, ReservationResponse
from .maintenance import MaintenanceIssueCreate, MaintenanceIssueUpdate, MaintenanceIssueResponse
from .finance import FinancialOperationCreate, FinancialOperationUpdate, FinancialOperationResponse
from .checkin import CheckInCreate, CheckInResponse, CheckOutUpdate, InventaireType
from .checklist import (
    ChecklistItemCreate, ChecklistItemUpdate, ChecklistItemResponse,
    HouseChecklistStatusResponse, HouseCategoryStatusResponse,
    TaskCompletionRequest, CategoryCompletionRequest
)
from .dashboard import DashboardMetrics, OccupancyData, RevenueDataPoint, DashboardResponse

__all__ = [
    "UserCreate",
    "UserLogin", 
    "UserResponse",
    "Token",
    "TokenData",
    "ReservationCreate",
    "ReservationUpdate",
    "ReservationResponse",
    "MaintenanceIssueCreate",
    "MaintenanceIssueUpdate",
    "MaintenanceIssueResponse",
    "FinancialOperationCreate",
    "FinancialOperationUpdate",
    "FinancialOperationResponse",
    "CheckInCreate",
    "CheckInResponse",
    "CheckOutUpdate",
    "InventaireType",
    "ChecklistItemCreate",
    "ChecklistItemUpdate",
    "ChecklistItemResponse",
    "HouseChecklistStatusResponse",
    "HouseCategoryStatusResponse",
    "TaskCompletionRequest",
    "CategoryCompletionRequest",
    "DashboardMetrics",
    "OccupancyData",
    "RevenueDataPoint",
    "DashboardResponse",
]