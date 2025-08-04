from pydantic import BaseModel, validator
from typing import Optional, Dict, Any
from datetime import date


class InventaireType(BaseModel):
    """
    Inventory schema matching frontend structure exactly.
    
    This matches the exact field names and types used by the frontend
    to ensure seamless integration.
    """
    litsSimples: int = 0
    litsDoubles: int = 0
    matelasSupplementaires: int = 0
    oreillers: int = 0
    tables: int = 0
    chaises: int = 0
    drapsPropres: int = 0
    drapsHousse: int = 0
    couvertures: int = 0
    television: bool = False
    telecommandeTv: bool = False
    climatiseur: bool = False
    telecommandeClimatiseur: bool = False
    recepteurTv: bool = False
    telecommandeRecepteur: bool = False
    assiettes: int = 0
    verres: int = 0
    couverts: int = 0
    casseroles: int = 0
    poeles: int = 0
    refrigerateur: bool = False
    rideaux: bool = False
    lampes: bool = False
    balaiSerpilliere: bool = False


class CheckInBase(BaseModel):
    """
    Base check-in schema with updated field names.
    
    Uses the updated field names: avancePaye and paiementCheckin
    instead of the old montantPaye and montantRestant.
    """
    maison: str
    nom: str
    telephone: str = ""
    email: str = ""
    dateArrivee: str  # YYYY-MM-DD format
    dateDepart: str   # YYYY-MM-DD format
    avancePaye: float = 0.0  # Updated field name
    paiementCheckin: float = 0.0  # Updated field name  
    montantTotal: float
    inventaire: InventaireType
    responsable: str
    remarques: str = ""
    
    @validator('email', 'telephone', 'remarques', pre=True)
    def ensure_string_fields(cls, v):
        # Convert None to empty string to avoid React null value warnings
        if v is None:
            return ""
        return v or ""


class CheckInCreate(CheckInBase):
    """
    Schema for creating a new check-in.
    
    Includes optional reservation_id to link to existing reservation.
    """
    reservationId: Optional[str] = None  # Link to reservation


class CheckInUpdate(BaseModel):
    """
    Schema for updating check-in details.
    
    All fields are optional to allow partial updates.
    """
    nom: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    dateArrivee: Optional[str] = None
    dateDepart: Optional[str] = None
    avancePaye: Optional[float] = None
    paiementCheckin: Optional[float] = None
    montantTotal: Optional[float] = None
    inventaire: Optional[InventaireType] = None
    responsable: Optional[str] = None
    remarques: Optional[str] = None
    
    @validator('email', 'telephone', 'remarques', pre=True)
    def ensure_string_fields(cls, v):
        # Convert None to empty string to avoid React null value warnings
        if v is None:
            return ""
        return v or ""


class CheckInResponse(CheckInBase):
    """
    Schema for check-in API responses.
    
    Includes the ID and maintains frontend field naming.
    """
    id: str
    reservationId: Optional[str] = None

    class Config:
        from_attributes = True


class CheckOutBase(BaseModel):
    """
    Base check-out schema.
    
    Captures departure details and final inventory status.
    """
    nom: str
    dateDepart: str  # YYYY-MM-DD format
    inventaireSortie: Optional[InventaireType] = None
    notesDommages: Optional[str] = None
    responsable: str


class CheckOutCreate(CheckOutBase):
    """
    Schema for creating a check-out record.
    """
    checkinId: str  # Must reference an existing check-in


class CheckOutUpdate(BaseModel):
    """
    Schema for updating checkout (legacy support).
    """
    inventaire: InventaireType
    remarques: Optional[str] = None


class CheckOutResponse(CheckOutBase):
    """
    Schema for check-out API responses.
    """
    id: str
    checkinId: str
    maison: str

    class Config:
        from_attributes = True


# Internal schemas for database operations
class CheckInDB(BaseModel):
    """
    Internal schema for database operations.
    
    Maps frontend field names to database column names.
    """
    house_id: str
    guest_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    arrival_date: date
    departure_date: date
    advance_paid: float = 0.0
    checkin_payment: float = 0.0
    total_amount: float
    inventory: Dict[str, Any]
    manager: str
    remarks: Optional[str] = None
    reservation_id: Optional[str] = None