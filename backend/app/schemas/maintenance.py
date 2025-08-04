from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class MaintenanceTypeResponse(BaseModel):
    """
    Schema for maintenance type responses.
    
    Represents the types of maintenance issues that can occur.
    """
    id: str  # e.g., 'electricite'
    name: str  # e.g., 'Électricité'

    class Config:
        from_attributes = True


class MaintenanceIssueBase(BaseModel):
    """
    Base maintenance issue schema matching frontend field names.
    
    All field names match exactly what the frontend sends/expects.
    """
    maison: str  # Frontend uses 'maison'
    typePanne: str  # Frontend uses 'typePanne'
    dateDeclaration: str  # Frontend uses string format YYYY-MM-DD
    assigne: str  # Frontend uses 'assigne' - required field
    commentaire: Optional[str] = None  # Frontend uses 'commentaire'
    statut: str = "non-resolue"  # Frontend uses 'statut'
    photoPanne: Optional[str] = None  # Frontend uses 'photoPanne'
    photoFacture: Optional[str] = None  # Frontend uses 'photoFacture'
    prixMainOeuvre: Optional[float] = None  # Frontend uses 'prixMainOeuvre'


class MaintenanceIssueCreate(MaintenanceIssueBase):
    """
    Schema for creating a new maintenance issue.
    
    Validates required fields and ensures data integrity.
    """
    pass


class MaintenanceIssueUpdate(BaseModel):
    """
    Schema for updating maintenance issues.
    
    All fields are optional to allow partial updates.
    """
    maison: Optional[str] = None
    typePanne: Optional[str] = None
    dateDeclaration: Optional[str] = None
    assigne: Optional[str] = None
    commentaire: Optional[str] = None
    statut: Optional[str] = None
    photoPanne: Optional[str] = None
    photoFacture: Optional[str] = None
    prixMainOeuvre: Optional[float] = None


class MaintenanceIssueResponse(MaintenanceIssueBase):
    """
    Schema for maintenance issue API responses.
    
    Includes the ID and maintains all frontend field names.
    """
    id: str

    class Config:
        from_attributes = True


class MaintenanceFilters(BaseModel):
    """
    Schema for maintenance issue filtering.
    
    Supports filtering by house, status, and date range.
    """
    houseId: Optional[str] = None
    status: Optional[str] = None
    assignedTo: Optional[str] = None
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None


class MaintenanceStats(BaseModel):
    """
    Schema for maintenance statistics.
    
    Provides summary information for dashboard analytics.
    """
    total: int
    resolue: int
    non_resolue: int
    total_cost: float
    avg_resolution_time: Optional[float] = None  # in days


# Internal schemas for database operations
class MaintenanceIssueDB(BaseModel):
    """
    Internal schema for database operations.
    
    Maps frontend field names to database column names.
    """
    house_id: str
    issue_type: str
    reported_at: date
    assigned_to: str
    comment: Optional[str] = None
    status: str = "non-resolue"
    photo_issue_url: Optional[str] = None
    photo_invoice_url: Optional[str] = None
    labor_cost: Optional[float] = None