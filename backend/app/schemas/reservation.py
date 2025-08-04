from pydantic import BaseModel, validator
from typing import Optional
from datetime import date, datetime


class ReservationBase(BaseModel):
    maison: str  # Frontend uses 'maison' instead of 'house_id'
    nom: str     # Frontend uses 'nom' instead of 'guest_name'
    telephone: str = ""
    email: str = ""  # Always return empty string, never None
    checkin: str  # Frontend uses string format YYYY-MM-DD
    checkout: str # Frontend uses string format YYYY-MM-DD
    montantAvance: float  # Frontend uses 'montantAvance' instead of 'advance_paid'
    
    @validator('email', 'telephone', pre=True)
    def ensure_string_fields(cls, v):
        # Convert None to empty string to avoid React null value warnings
        if v is None:
            return ""
        return v or ""


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    nom: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    checkin: Optional[str] = None
    checkout: Optional[str] = None
    montantAvance: Optional[float] = None
    
    @validator('email', 'telephone', pre=True)
    def ensure_string_fields(cls, v):
        # Convert None to empty string to avoid React null value warnings  
        if v is None:
            return ""
        return v or ""


class ReservationResponse(ReservationBase):
    id: str

    class Config:
        from_attributes = True


# Internal schema for database operations (matches SQLAlchemy model)
class ReservationDB(BaseModel):
    house_id: str
    guest_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    checkin_date: date
    checkout_date: date
    advance_paid: float = 0.0