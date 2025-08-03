from pydantic import BaseModel, EmailStr
from typing import Optional


class InventaireType(BaseModel):
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
    maison: str
    nom: str
    telephone: str
    email: EmailStr
    dateArrivee: str  # YYYY-MM-DD format
    dateDepart: str   # YYYY-MM-DD format
    montantPaye: float
    montantRestant: float
    montantTotal: float
    inventaire: InventaireType
    responsable: str
    remarques: Optional[str] = None


class CheckInCreate(CheckInBase):
    pass


class CheckInResponse(CheckInBase):
    id: str

    class Config:
        from_attributes = True


class CheckOutUpdate(BaseModel):
    inventaire: InventaireType
    remarques: Optional[str] = None