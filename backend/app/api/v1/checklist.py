from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.checklist import (
    ChecklistCategory, 
    ChecklistItem, 
    HouseChecklistStatus, 
    HouseCategoryStatus
)
from app.schemas.checklist import (
    ChecklistCategoryResponse,
    ChecklistItemCreate, 
    ChecklistItemUpdate, 
    ChecklistItemResponse,
    HouseChecklistStatusResponse,
    HouseCategoryStatusResponse,
    TaskCompletionRequest,
    CategoryCompletionRequest,
    HouseReadinessStatus,
    ChecklistProgress
)
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/categories", response_model=List[ChecklistCategoryResponse])
async def get_checklist_categories(
    db: Session = Depends(get_db)
):
    """
    Get all checklist categories.
    
    Returns:
        List of available checklist categories
    """
    categories = db.query(ChecklistCategory).order_by(ChecklistCategory.id).all()
    return [ChecklistCategoryResponse(id=cat.id, name=cat.name) for cat in categories]


@router.get("/items", response_model=List[ChecklistItemResponse])
async def get_checklist_items(
    houseId: Optional[str] = Query(None, alias="maison"),
    categorie: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get all checklist items with optional filtering.
    
    Args:
        houseId: Filter by house ID
        categorie: Filter by category name
        db: Database session
        
    Returns:
        List of checklist items in frontend format
    """
    query = db.query(ChecklistItem)
    
    if houseId:
        query = query.filter(ChecklistItem.house_id == houseId)
    
    if categorie:
        # Join with category to filter by name
        query = query.join(ChecklistCategory).filter(ChecklistCategory.name == categorie)
    
    items = query.order_by(ChecklistItem.step_number).all()
    
    # Convert to frontend format
    response_data = []
    for item in items:
        category_name = db.query(ChecklistCategory).filter(
            ChecklistCategory.id == item.category_id
        ).first().name if item.category_id else ""
        
        response_data.append(ChecklistItemResponse(
            id=item.id,
            maison=item.house_id,
            etape=item.step_number,
            categorie=category_name,
            description=item.description,
            produitAUtiliser=item.product_required or "",
            type=item.type
        ))
    
    return response_data


@router.get("/items/{item_id}", response_model=ChecklistItemResponse)
async def get_checklist_item(
    item_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get a specific checklist item by ID.
    
    Args:
        item_id: The checklist item ID
        db: Database session
        
    Returns:
        Checklist item details in frontend format
        
    Raises:
        HTTPException: If item not found
    """
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    category_name = db.query(ChecklistCategory).filter(
        ChecklistCategory.id == item.category_id
    ).first().name if item.category_id else ""
    
    return ChecklistItemResponse(
        id=item.id,
        maison=item.house_id,
        etape=item.step_number,
        categorie=category_name,
        description=item.description,
        produitAUtiliser=item.product_required or "",
        type=item.type
    )


@router.post("/items", response_model=ChecklistItemResponse)
async def create_checklist_item(
    item_data: ChecklistItemCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Create a new checklist item.
    
    Args:
        item_data: Checklist item creation data
        db: Database session
        
    Returns:
        Created checklist item in frontend format
        
    Raises:
        HTTPException: If validation fails or creation error occurs
    """
    try:
        # Find or create category
        category = db.query(ChecklistCategory).filter(
            ChecklistCategory.name == item_data.categorie
        ).first()
        
        if not category:
            # Create new category if it doesn't exist
            category = ChecklistCategory(name=item_data.categorie)
            db.add(category)
            db.commit()
            db.refresh(category)
        
        # Create checklist item
        item = ChecklistItem(
            house_id=item_data.maison,
            step_number=item_data.etape,
            category_id=category.id,
            description=item_data.description,
            product_required=item_data.produitAUtiliser,
            type=item_data.type
        )
        
        db.add(item)
        db.commit()
        db.refresh(item)
        
        return ChecklistItemResponse(
            id=item.id,
            maison=item.house_id,
            etape=item.step_number,
            categorie=category.name,
            description=item.description,
            produitAUtiliser=item.product_required or "",
            type=item.type
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating checklist item: {str(e)}")


@router.put("/items/{item_id}", response_model=ChecklistItemResponse)
async def update_checklist_item(
    item_id: str,
    item_data: ChecklistItemUpdate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Update an existing checklist item.
    
    Args:
        item_id: The checklist item ID to update
        item_data: Updated checklist item data
        db: Database session
        
    Returns:
        Updated checklist item in frontend format
        
    Raises:
        HTTPException: If item not found or update fails
    """
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    try:
        # Update fields if provided
        if item_data.maison is not None:
            item.house_id = item_data.maison
        if item_data.etape is not None:
            item.step_number = item_data.etape
        if item_data.categorie is not None:
            # Find or create category
            category = db.query(ChecklistCategory).filter(
                ChecklistCategory.name == item_data.categorie
            ).first()
            
            if not category:
                category = ChecklistCategory(name=item_data.categorie)
                db.add(category)
                db.commit()
                db.refresh(category)
            
            item.category_id = category.id
        if item_data.description is not None:
            item.description = item_data.description
        if item_data.produitAUtiliser is not None:
            item.product_required = item_data.produitAUtiliser
        if item_data.type is not None:
            item.type = item_data.type
        
        db.commit()
        db.refresh(item)
        
        category_name = db.query(ChecklistCategory).filter(
            ChecklistCategory.id == item.category_id
        ).first().name
        
        return ChecklistItemResponse(
            id=item.id,
            maison=item.house_id,
            etape=item.step_number,
            categorie=category_name,
            description=item.description,
            produitAUtiliser=item.product_required or "",
            type=item.type
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating checklist item: {str(e)}")


@router.delete("/items/{item_id}")
async def delete_checklist_item(
    item_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Delete a checklist item.
    
    Args:
        item_id: The checklist item ID to delete
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If item not found or deletion fails
    """
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    try:
        # Delete related status records
        db.query(HouseChecklistStatus).filter(
            HouseChecklistStatus.item_id == item_id
        ).delete()
        
        # Delete the item
        db.delete(item)
        db.commit()
        
        return {"message": "Checklist item deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting checklist item: {str(e)}")


@router.get("/status/{house_id}", response_model=List[HouseChecklistStatusResponse])
async def get_house_checklist_status(
    house_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get checklist completion status for a specific house.
    
    Args:
        house_id: The house ID
        db: Database session
        
    Returns:
        List of checklist item statuses for the house
    """
    statuses = db.query(HouseChecklistStatus).filter(
        HouseChecklistStatus.house_id == house_id
    ).all()
    
    return [HouseChecklistStatusResponse(
        id=status.id,
        maison=status.house_id,
        checklistItemId=status.item_id,
        completed=status.is_completed,
        completedAt=status.completed_at.strftime("%Y-%m-%dT%H:%M:%SZ") if status.completed_at else None,
        updatedBy=status.updated_by
    ) for status in statuses]


@router.post("/status/{house_id}/complete", response_model=HouseChecklistStatusResponse)
async def complete_checklist_task(
    house_id: str,
    task_data: TaskCompletionRequest,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Mark a checklist task as completed or uncompleted.
    
    Args:
        house_id: The house ID
        task_data: Task completion data
        db: Database session
        
    Returns:
        Updated task status
        
    Raises:
        HTTPException: If task not found or update fails
    """
    try:
        # Find existing status or create new one
        status = db.query(HouseChecklistStatus).filter(
            HouseChecklistStatus.house_id == house_id,
            HouseChecklistStatus.item_id == task_data.taskId
        ).first()
        
        if not status:
            status = HouseChecklistStatus(
                house_id=house_id,
                item_id=task_data.taskId,
                is_completed=task_data.completed,
                completed_at=datetime.utcnow() if task_data.completed else None,
                # updated_by=current_user.id  # Uncomment when auth is implemented
            )
            db.add(status)
        else:
            status.is_completed = task_data.completed
            status.completed_at = datetime.utcnow() if task_data.completed else None
            # status.updated_by = current_user.id  # Uncomment when auth is implemented
        
        db.commit()
        db.refresh(status)
        
        return HouseChecklistStatusResponse(
            id=status.id,
            maison=status.house_id,
            checklistItemId=status.item_id,
            completed=status.is_completed,
            completedAt=status.completed_at.strftime("%Y-%m-%dT%H:%M:%SZ") if status.completed_at else None,
            updatedBy=status.updated_by
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating task status: {str(e)}")


@router.get("/readiness/{house_id}", response_model=HouseReadinessStatus)
async def get_house_readiness_status(
    house_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get overall readiness status for a house.
    
    Args:
        house_id: The house ID
        db: Database session
        
    Returns:
        Complete house readiness status
    """
    # Get all checklist items for this house
    total_tasks = db.query(ChecklistItem).filter(
        ChecklistItem.house_id == house_id
    ).count()
    
    # Get all completed tasks for this house
    completed_tasks = db.query(HouseChecklistStatus).filter(
        HouseChecklistStatus.house_id == house_id,
        HouseChecklistStatus.is_completed == True
    ).count()
    
    # Get category status
    category_statuses = db.query(HouseCategoryStatus).filter(
        HouseCategoryStatus.house_id == house_id,
        HouseCategoryStatus.is_ready == True
    ).count()
    
    total_categories = db.query(ChecklistCategory).count()
    
    # House is ready if all categories are ready
    is_ready = category_statuses == total_categories
    
    # Get last updated time
    last_status = db.query(HouseChecklistStatus).filter(
        HouseChecklistStatus.house_id == house_id
    ).order_by(HouseChecklistStatus.completed_at.desc()).first()
    
    last_updated = None
    if last_status and last_status.completed_at:
        last_updated = last_status.completed_at.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    return HouseReadinessStatus(
        maison=house_id,
        isReady=is_ready,
        completedCategories=category_statuses,
        totalCategories=total_categories,
        completedTasks=completed_tasks,
        totalTasks=total_tasks,
        lastUpdated=last_updated
    )


@router.post("/categories/{house_id}/complete")
async def complete_category(
    house_id: str,
    category_data: CategoryCompletionRequest,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Mark a category as ready or not ready.
    
    Args:
        house_id: The house ID
        category_data: Category completion data
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If update fails
    """
    try:
        # Find existing status or create new one
        status = db.query(HouseCategoryStatus).filter(
            HouseCategoryStatus.house_id == house_id,
            HouseCategoryStatus.category_id == category_data.categoryId
        ).first()
        
        if not status:
            status = HouseCategoryStatus(
                house_id=house_id,
                category_id=category_data.categoryId,
                is_ready=category_data.completed,
                ready_at=datetime.utcnow() if category_data.completed else None
            )
            db.add(status)
        else:
            status.is_ready = category_data.completed
            status.ready_at = datetime.utcnow() if category_data.completed else None
        
        db.commit()
        
        return {"message": "Category status updated successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating category status: {str(e)}")


@router.get("/progress/{house_id}", response_model=List[ChecklistProgress])
async def get_checklist_progress(
    house_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get checklist progress by category for a house.
    
    Args:
        house_id: The house ID
        db: Database session
        
    Returns:
        List of progress data by category
    """
    categories = db.query(ChecklistCategory).all()
    progress_data = []
    
    for category in categories:
        # Count total tasks in this category for this house
        total_tasks = db.query(ChecklistItem).filter(
            ChecklistItem.house_id == house_id,
            ChecklistItem.category_id == category.id
        ).count()
        
        # Count completed tasks in this category for this house
        completed_tasks = db.query(HouseChecklistStatus).join(ChecklistItem).filter(
            ChecklistItem.house_id == house_id,
            ChecklistItem.category_id == category.id,
            HouseChecklistStatus.is_completed == True
        ).count()
        
        # Check if category is marked as ready
        category_status = db.query(HouseCategoryStatus).filter(
            HouseCategoryStatus.house_id == house_id,
            HouseCategoryStatus.category_id == category.id
        ).first()
        
        is_ready = category_status.is_ready if category_status else False
        progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        progress_data.append(ChecklistProgress(
            maison=house_id,
            categorie=category.name,
            completedTasks=completed_tasks,
            totalTasks=total_tasks,
            progressPercentage=progress_percentage,
            isReady=is_ready
        ))
    
    return progress_data