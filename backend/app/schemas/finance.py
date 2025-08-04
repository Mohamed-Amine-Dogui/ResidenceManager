from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class FinancialOperationBase(BaseModel):
    """
    Base financial operation schema matching frontend field names.
    
    All field names match exactly what the frontend sends/expects
    to ensure seamless integration.
    """
    date: str  # Frontend uses string format YYYY-MM-DD
    maison: str  # Frontend uses 'maison'
    type: str  # 'entree', 'sortie'
    motif: str
    montant: float
    origine: str  # 'reservation', 'maintenance', 'checkin', 'manuel'
    pieceJointe: Optional[str] = None  # Frontend uses 'pieceJointe'
    editable: bool = True


class FinancialOperationCreate(FinancialOperationBase):
    """
    Schema for creating a new financial operation.
    
    Includes optional foreign key references for synchronization.
    """
    # Foreign key references for transaction synchronization
    reservationId: Optional[str] = None
    checkinId: Optional[str] = None
    maintenanceId: Optional[str] = None


class FinancialOperationUpdate(BaseModel):
    """
    Schema for updating financial operations.
    
    All fields are optional to allow partial updates.
    Only editable operations can be updated.
    """
    date: Optional[str] = None
    maison: Optional[str] = None
    type: Optional[str] = None
    motif: Optional[str] = None
    montant: Optional[float] = None
    origine: Optional[str] = None
    pieceJointe: Optional[str] = None
    editable: Optional[bool] = None


class FinancialOperationResponse(FinancialOperationBase):
    """
    Schema for financial operation API responses.
    
    Includes the ID and foreign key references.
    """
    id: str
    # Foreign key references exposed for frontend synchronization
    reservationId: Optional[str] = None
    checkinId: Optional[str] = None
    maintenanceId: Optional[str] = None

    class Config:
        from_attributes = True


class FinancialSummary(BaseModel):
    """
    Schema for financial summaries and analytics.
    
    Provides aggregated financial data for reporting.
    """
    totalEntrees: float
    totalSorties: float
    balance: float
    operationCount: int
    period: Optional[str] = None  # e.g., "2025-08" for monthly


class FinancialFilters(BaseModel):
    """
    Schema for filtering financial operations.
    
    Supports filtering by house, type, origin, and date range.
    """
    houseId: Optional[str] = None
    type: Optional[str] = None  # 'entree', 'sortie'
    origine: Optional[str] = None
    month: Optional[int] = None
    year: Optional[int] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None


class MonthlyRevenue(BaseModel):
    """
    Schema for monthly revenue data.
    
    Used for dashboard charts and analytics.
    """
    month: str  # Format: "01", "02", etc.
    revenue: float


# Internal schemas for database operations
class FinancialOperationDB(BaseModel):
    """
    Internal schema for database operations.
    
    Maps frontend field names to database column names.
    """
    date: date
    house_id: str
    type: str
    motif: str
    montant: float
    origine: str
    piece_jointe: Optional[str] = None
    editable: bool = True
    reservation_id: Optional[str] = None
    checkin_id: Optional[str] = None
    maintenance_id: Optional[str] = None