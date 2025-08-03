from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class FinancialOperationBase(BaseModel):
    date: str  # Frontend uses string format YYYY-MM-DD
    maison: str  # Frontend uses 'maison'
    type: str  # 'entree', 'sortie'
    motif: str
    montant: float
    origine: str  # 'reservation', 'maintenance', 'checkin', 'manuel'
    pieceJointe: Optional[str] = None  # Frontend uses 'pieceJointe'
    editable: bool = True


class FinancialOperationCreate(FinancialOperationBase):
    pass


class FinancialOperationUpdate(BaseModel):
    date: Optional[str] = None
    type: Optional[str] = None
    motif: Optional[str] = None
    montant: Optional[float] = None
    origine: Optional[str] = None
    pieceJointe: Optional[str] = None
    editable: Optional[bool] = None


class FinancialOperationResponse(FinancialOperationBase):
    id: str

    class Config:
        from_attributes = True