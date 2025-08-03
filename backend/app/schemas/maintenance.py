from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class MaintenanceIssueBase(BaseModel):
    maison: str  # Frontend uses 'maison'
    typePanne: str  # Frontend uses 'typePanne'
    dateDeclaration: str  # Frontend uses string format YYYY-MM-DD
    assigne: Optional[str] = None  # Frontend uses 'assigne'
    commentaire: Optional[str] = None  # Frontend uses 'commentaire'
    statut: str = "non-resolue"  # Frontend uses 'statut'
    photoPanne: Optional[str] = None  # Frontend uses 'photoPanne'
    photoFacture: Optional[str] = None  # Frontend uses 'photoFacture'
    prixMainOeuvre: Optional[float] = None  # Frontend uses 'prixMainOeuvre'


class MaintenanceIssueCreate(MaintenanceIssueBase):
    pass


class MaintenanceIssueUpdate(BaseModel):
    typePanne: Optional[str] = None
    dateDeclaration: Optional[str] = None
    assigne: Optional[str] = None
    commentaire: Optional[str] = None
    statut: Optional[str] = None
    photoPanne: Optional[str] = None
    photoFacture: Optional[str] = None
    prixMainOeuvre: Optional[float] = None


class MaintenanceIssueResponse(MaintenanceIssueBase):
    id: str

    class Config:
        from_attributes = True