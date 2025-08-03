from pydantic import BaseModel
from typing import Optional


class ChecklistItemBase(BaseModel):
    maison: str
    etape: int
    categorie: str
    description: str
    produitAUtiliser: str
    type: str  # 'nettoyage', 'vérification', 'entretien'


class ChecklistItemCreate(ChecklistItemBase):
    pass


class ChecklistItemUpdate(BaseModel):
    etape: Optional[int] = None
    categorie: Optional[str] = None
    description: Optional[str] = None
    produitAUtiliser: Optional[str] = None
    type: Optional[str] = None


class ChecklistItemResponse(ChecklistItemBase):
    id: str

    class Config:
        from_attributes = True


class HouseChecklistStatusResponse(BaseModel):
    id: str
    maison: str
    checklistItemId: str
    completed: bool
    completedAt: Optional[str] = None
    updatedBy: Optional[str] = None

    class Config:
        from_attributes = True


class HouseCategoryStatusResponse(BaseModel):
    id: str
    maison: str
    categoryId: int
    isReady: bool
    readyAt: Optional[str] = None

    class Config:
        from_attributes = True


class TaskCompletionRequest(BaseModel):
    taskId: str
    completed: bool


class CategoryCompletionRequest(BaseModel):
    categoryId: int
    completed: bool