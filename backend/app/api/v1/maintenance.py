from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.core.database import get_db
from app.models.maintenance import MaintenanceIssue, MaintenanceType
from app.models.finance import FinancialOperation
from app.schemas.maintenance import (
    MaintenanceIssueCreate, 
    MaintenanceIssueUpdate, 
    MaintenanceIssueResponse,
    MaintenanceTypeResponse,
    MaintenanceFilters,
    MaintenanceStats
)
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/types", response_model=List[MaintenanceTypeResponse])
async def get_maintenance_types(
    db: Session = Depends(get_db)
):
    """
    Get all maintenance types.
    
    Returns:
        List of available maintenance types (electricite, plomberie, etc.)
    """
    types = db.query(MaintenanceType).all()
    return [MaintenanceTypeResponse(id=t.id, name=t.label) for t in types]


@router.get("/", response_model=List[MaintenanceIssueResponse])
async def get_maintenance_issues(
    houseId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    assignedTo: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get all maintenance issues with optional filtering.
    
    Args:
        houseId: Filter by house ID
        status: Filter by status ('resolue', 'non-resolue')
        assignedTo: Filter by assigned person
        db: Database session
        
    Returns:
        List of maintenance issues in frontend format
    """
    query = db.query(MaintenanceIssue)
    
    if houseId:
        query = query.filter(MaintenanceIssue.house_id == houseId)
    if status:
        query = query.filter(MaintenanceIssue.status == status)
    if assignedTo:
        query = query.filter(MaintenanceIssue.assigned_to.ilike(f"%{assignedTo}%"))
    
    issues = query.order_by(MaintenanceIssue.reported_at.desc()).all()
    
    # Convert to frontend format
    response_data = []
    for issue in issues:
        response_data.append(MaintenanceIssueResponse(
            id=issue.id,
            maison=issue.house_id,
            typePanne=issue.issue_type,
            dateDeclaration=issue.reported_at.strftime("%Y-%m-%d"),
            assigne=issue.assigned_to,
            commentaire=issue.comment or "",
            statut=issue.status,
            photoPanne=issue.photo_issue_url,
            photoFacture=issue.photo_invoice_url,
            prixMainOeuvre=issue.labor_cost
        ))
    
    return response_data


@router.get("/{issue_id}", response_model=MaintenanceIssueResponse)
async def get_maintenance_issue(
    issue_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get a specific maintenance issue by ID.
    
    Args:
        issue_id: The maintenance issue ID
        db: Database session
        
    Returns:
        Maintenance issue details in frontend format
        
    Raises:
        HTTPException: If issue not found
    """
    issue = db.query(MaintenanceIssue).filter(MaintenanceIssue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(status_code=404, detail="Maintenance issue not found")
    
    return MaintenanceIssueResponse(
        id=issue.id,
        maison=issue.house_id,
        typePanne=issue.issue_type,
        dateDeclaration=issue.reported_at.strftime("%Y-%m-%d"),
        assigne=issue.assigned_to,
        commentaire=issue.comment or "",
        statut=issue.status,
        photoPanne=issue.photo_issue_url,
        photoFacture=issue.photo_invoice_url,
        prixMainOeuvre=issue.labor_cost
    )


@router.post("/", response_model=MaintenanceIssueResponse)
async def create_maintenance_issue(
    issue_data: MaintenanceIssueCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Create a new maintenance issue.
    
    Args:
        issue_data: Maintenance issue creation data
        db: Database session
        
    Returns:
        Created maintenance issue in frontend format
        
    Raises:
        HTTPException: If validation fails or creation error occurs
    """
    try:
        # Parse date
        reported_date = datetime.strptime(issue_data.dateDeclaration, "%Y-%m-%d").date()
        
        # Create maintenance issue
        issue = MaintenanceIssue(
            house_id=issue_data.maison,
            issue_type=issue_data.typePanne,
            reported_at=reported_date,
            assigned_to=issue_data.assigne,
            comment=issue_data.commentaire,
            status=issue_data.statut,
            photo_issue_url=issue_data.photoPanne,
            photo_invoice_url=issue_data.photoFacture,
            labor_cost=issue_data.prixMainOeuvre
        )
        
        db.add(issue)
        db.commit()
        db.refresh(issue)
        
        return MaintenanceIssueResponse(
            id=issue.id,
            maison=issue.house_id,
            typePanne=issue.issue_type,
            dateDeclaration=issue.reported_at.strftime("%Y-%m-%d"),
            assigne=issue.assigned_to,
            commentaire=issue.comment or "",
            statut=issue.status,
            photoPanne=issue.photo_issue_url,
            photoFacture=issue.photo_invoice_url,
            prixMainOeuvre=issue.labor_cost
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating maintenance issue: {str(e)}")


@router.put("/{issue_id}", response_model=MaintenanceIssueResponse)
async def update_maintenance_issue(
    issue_id: str,
    issue_data: MaintenanceIssueUpdate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Update an existing maintenance issue.
    
    Automatically creates a financial transaction if status changes to 'resolue' with cost.
    
    Args:
        issue_id: The maintenance issue ID to update
        issue_data: Updated maintenance issue data
        db: Database session
        
    Returns:
        Updated maintenance issue in frontend format
        
    Raises:
        HTTPException: If issue not found or update fails
    """
    issue = db.query(MaintenanceIssue).filter(MaintenanceIssue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(status_code=404, detail="Maintenance issue not found")
    
    try:
        old_status = issue.status
        
        # Update fields if provided
        if issue_data.maison is not None:
            issue.house_id = issue_data.maison
        if issue_data.typePanne is not None:
            issue.issue_type = issue_data.typePanne
        if issue_data.dateDeclaration is not None:
            issue.reported_at = datetime.strptime(issue_data.dateDeclaration, "%Y-%m-%d").date()
        if issue_data.assigne is not None:
            issue.assigned_to = issue_data.assigne
        if issue_data.commentaire is not None:
            issue.comment = issue_data.commentaire
        if issue_data.statut is not None:
            issue.status = issue_data.statut
        if issue_data.photoPanne is not None:
            issue.photo_issue_url = issue_data.photoPanne
        if issue_data.photoFacture is not None:
            issue.photo_invoice_url = issue_data.photoFacture
        if issue_data.prixMainOeuvre is not None:
            issue.labor_cost = issue_data.prixMainOeuvre
        
        # Create financial transaction if maintenance is resolved with cost
        if (issue.status == "resolue" and old_status != "resolue" and 
            issue.labor_cost and issue.labor_cost > 0):
            
            financial_operation = FinancialOperation(
                date=issue.reported_at,
                house_id=issue.house_id,
                type="sortie",
                motif=f"Réparation {issue.issue_type} - {issue.assigned_to}",
                montant=issue.labor_cost,
                origine="maintenance",
                piece_jointe=issue.photo_invoice_url,
                editable=False,
                maintenance_id=issue.id
            )
            
            db.add(financial_operation)
        
        db.commit()
        db.refresh(issue)
        
        return MaintenanceIssueResponse(
            id=issue.id,
            maison=issue.house_id,
            typePanne=issue.issue_type,
            dateDeclaration=issue.reported_at.strftime("%Y-%m-%d"),
            assigne=issue.assigned_to,
            commentaire=issue.comment or "",
            statut=issue.status,
            photoPanne=issue.photo_issue_url,
            photoFacture=issue.photo_invoice_url,
            prixMainOeuvre=issue.labor_cost
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating maintenance issue: {str(e)}")


@router.delete("/{issue_id}")
async def delete_maintenance_issue(
    issue_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Delete a maintenance issue.
    
    Also deletes any corresponding financial transactions.
    
    Args:
        issue_id: The maintenance issue ID to delete
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If issue not found or deletion fails
    """
    issue = db.query(MaintenanceIssue).filter(MaintenanceIssue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(status_code=404, detail="Maintenance issue not found")
    
    try:
        # Delete corresponding financial transactions
        financial_ops = db.query(FinancialOperation).filter(
            FinancialOperation.maintenance_id == issue_id
        ).all()
        
        for op in financial_ops:
            db.delete(op)
        
        # Delete the maintenance issue
        db.delete(issue)
        db.commit()
        
        return {"message": "Maintenance issue deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting maintenance issue: {str(e)}")


@router.get("/stats/summary", response_model=MaintenanceStats)
async def get_maintenance_stats(
    houseId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get maintenance statistics for dashboard analytics.
    
    Args:
        houseId: Optional house ID filter
        db: Database session
        
    Returns:
        Maintenance statistics summary
    """
    query = db.query(MaintenanceIssue)
    
    if houseId:
        query = query.filter(MaintenanceIssue.house_id == houseId)
    
    issues = query.all()
    
    total = len(issues)
    resolue = len([i for i in issues if i.status == "resolue"])
    non_resolue = total - resolue
    total_cost = sum([i.labor_cost or 0 for i in issues if i.status == "resolue"])
    
    return MaintenanceStats(
        total=total,
        resolue=resolue,
        non_resolue=non_resolue,
        total_cost=total_cost
    )