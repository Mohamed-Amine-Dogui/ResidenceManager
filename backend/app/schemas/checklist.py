from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChecklistCategoryResponse(BaseModel):
    """
    Schema for checklist category responses.
    
    Represents categories like "Entrée", "Salle de Bain", etc.
    """
    id: int
    name: str

    class Config:
        from_attributes = True


class ChecklistItemBase(BaseModel):
    """
    Base checklist item schema matching frontend field names.
    
    All field names match exactly what the frontend sends/expects.
    """
    maison: str  # Frontend uses 'maison'
    etape: int  # Frontend uses 'etape' (step number)
    categorie: str  # Frontend uses 'categorie'
    description: str  # Frontend uses 'description'
    produitAUtiliser: str  # Frontend uses 'produitAUtiliser'
    type: str  # Frontend uses 'type' - 'nettoyage', 'vérification', 'entretien'


class ChecklistItemCreate(ChecklistItemBase):
    """
    Schema for creating a new checklist item.
    
    Validates required fields and ensures data integrity.
    """
    pass


class ChecklistItemUpdate(BaseModel):
    """
    Schema for updating checklist items.
    
    All fields are optional to allow partial updates.
    """
    maison: Optional[str] = None
    etape: Optional[int] = None
    categorie: Optional[str] = None
    description: Optional[str] = None
    produitAUtiliser: Optional[str] = None
    type: Optional[str] = None


class ChecklistItemResponse(ChecklistItemBase):
    """
    Schema for checklist item API responses.
    
    Includes the ID and maintains all frontend field names.
    """
    id: str

    class Config:
        from_attributes = True


class HouseChecklistStatusBase(BaseModel):
    """
    Base schema for house checklist status.
    
    Tracks completion status of individual checklist items per house.
    """
    maison: str
    checklistItemId: str
    completed: bool
    completedAt: Optional[str] = None
    updatedBy: Optional[str] = None


class HouseChecklistStatusResponse(HouseChecklistStatusBase):
    """
    Schema for house checklist status responses.
    """
    id: str

    class Config:
        from_attributes = True


class HouseCategoryStatusBase(BaseModel):
    """
    Base schema for house category status.
    
    Tracks readiness status of entire categories per house.
    """
    maison: str
    categoryId: int
    isReady: bool
    readyAt: Optional[str] = None


class HouseCategoryStatusResponse(HouseCategoryStatusBase):
    """
    Schema for house category status responses.
    """
    id: str

    class Config:
        from_attributes = True


class TaskCompletionRequest(BaseModel):
    """
    Schema for task completion requests.
    
    Used to mark individual checklist items as completed/uncompleted.
    """
    taskId: str
    completed: bool


class CategoryCompletionRequest(BaseModel):
    """
    Schema for category completion requests.
    
    Used to mark entire categories as ready/not ready.
    """
    categoryId: int
    completed: bool


class HouseReadinessStatus(BaseModel):
    """
    Schema for complete house readiness status.
    
    Provides overview of house readiness across all categories.
    """
    maison: str
    isReady: bool  # True if all categories are ready
    completedCategories: int
    totalCategories: int
    completedTasks: int
    totalTasks: int
    lastUpdated: Optional[str] = None


class ChecklistProgress(BaseModel):
    """
    Schema for checklist progress tracking.
    
    Used for progress indicators and analytics.
    """
    maison: str
    categorie: str
    completedTasks: int
    totalTasks: int
    progressPercentage: float
    isReady: bool


# Internal schemas for database operations
class ChecklistItemDB(BaseModel):
    """
    Internal schema for checklist item database operations.
    
    Maps frontend field names to database column names.
    """
    house_id: str
    step_number: int
    category_id: int  # Foreign key to categories table
    description: str
    product_required: str
    type: str