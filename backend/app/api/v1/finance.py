from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from typing import List, Optional
from datetime import datetime, date

from app.core.database import get_db
from app.models.finance import FinancialOperation
from app.schemas.finance import (
    FinancialOperationCreate, 
    FinancialOperationUpdate, 
    FinancialOperationResponse,
    FinancialSummary,
    FinancialFilters,
    MonthlyRevenue
)
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[FinancialOperationResponse])
async def get_financial_operations(
    houseId: Optional[str] = Query(None, alias="maison"),
    type: Optional[str] = Query(None),
    origine: Optional[str] = Query(None),
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get all financial operations with optional filtering.
    
    Args:
        houseId: Filter by house ID
        type: Filter by type ('entree', 'sortie')
        origine: Filter by origin ('reservation', 'maintenance', 'checkin', 'manuel')
        month: Filter by month (1-12)
        year: Filter by year
        db: Database session
        
    Returns:
        List of financial operations in frontend format
    """
    query = db.query(FinancialOperation)
    
    if houseId:
        query = query.filter(FinancialOperation.house_id == houseId)
    if type:
        query = query.filter(FinancialOperation.type == type)
    if origine:
        query = query.filter(FinancialOperation.origine == origine)
    if month:
        query = query.filter(extract('month', FinancialOperation.date) == month)
    if year:
        query = query.filter(extract('year', FinancialOperation.date) == year)
    
    operations = query.order_by(FinancialOperation.date.desc()).all()
    
    # Convert to frontend format
    response_data = []
    for op in operations:
        response_data.append(FinancialOperationResponse(
            id=op.id,
            date=op.date.strftime("%Y-%m-%d"),
            maison=op.house_id,
            type=op.type,
            motif=op.motif,
            montant=op.montant,
            origine=op.origine,
            pieceJointe=op.piece_jointe,
            editable=op.editable,
            reservationId=op.reservation_id,
            checkinId=op.checkin_id,
            maintenanceId=op.maintenance_id
        ))
    
    return response_data


@router.get("/{operation_id}", response_model=FinancialOperationResponse)
async def get_financial_operation(
    operation_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get a specific financial operation by ID.
    
    Args:
        operation_id: The financial operation ID
        db: Database session
        
    Returns:
        Financial operation details in frontend format
        
    Raises:
        HTTPException: If operation not found
    """
    operation = db.query(FinancialOperation).filter(FinancialOperation.id == operation_id).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Financial operation not found")
    
    return FinancialOperationResponse(
        id=operation.id,
        date=operation.date.strftime("%Y-%m-%d"),
        maison=operation.house_id,
        type=operation.type,
        motif=operation.motif,
        montant=operation.montant,
        origine=operation.origine,
        pieceJointe=operation.piece_jointe,
        editable=operation.editable,
        reservationId=operation.reservation_id,
        checkinId=operation.checkin_id,
        maintenanceId=operation.maintenance_id
    )


@router.post("/", response_model=FinancialOperationResponse)
async def create_financial_operation(
    operation_data: FinancialOperationCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Create a new financial operation.
    
    Args:
        operation_data: Financial operation creation data
        db: Database session
        
    Returns:
        Created financial operation in frontend format
        
    Raises:
        HTTPException: If validation fails or creation error occurs
    """
    try:
        # Parse date
        operation_date = datetime.strptime(operation_data.date, "%Y-%m-%d").date()
        
        # Create financial operation
        operation = FinancialOperation(
            date=operation_date,
            house_id=operation_data.maison,
            type=operation_data.type,
            motif=operation_data.motif,
            montant=operation_data.montant,
            origine=operation_data.origine,
            piece_jointe=operation_data.pieceJointe,
            editable=operation_data.editable,
            reservation_id=operation_data.reservationId,
            checkin_id=operation_data.checkinId,
            maintenance_id=operation_data.maintenanceId
        )
        
        db.add(operation)
        db.commit()
        db.refresh(operation)
        
        return FinancialOperationResponse(
            id=operation.id,
            date=operation.date.strftime("%Y-%m-%d"),
            maison=operation.house_id,
            type=operation.type,
            motif=operation.motif,
            montant=operation.montant,
            origine=operation.origine,
            pieceJointe=operation.piece_jointe,
            editable=operation.editable,
            reservationId=operation.reservation_id,
            checkinId=operation.checkin_id,
            maintenanceId=operation.maintenance_id
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating financial operation: {str(e)}")


@router.put("/{operation_id}", response_model=FinancialOperationResponse)
async def update_financial_operation(
    operation_id: str,
    operation_data: FinancialOperationUpdate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Update an existing financial operation.
    
    Only editable operations can be updated.
    
    Args:
        operation_id: The financial operation ID to update
        operation_data: Updated financial operation data
        db: Database session
        
    Returns:
        Updated financial operation in frontend format
        
    Raises:
        HTTPException: If operation not found, not editable, or update fails
    """
    operation = db.query(FinancialOperation).filter(FinancialOperation.id == operation_id).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Financial operation not found")
    
    if not operation.editable:
        raise HTTPException(status_code=403, detail="This financial operation cannot be edited")
    
    try:
        # Update fields if provided
        if operation_data.date is not None:
            operation.date = datetime.strptime(operation_data.date, "%Y-%m-%d").date()
        if operation_data.maison is not None:
            operation.house_id = operation_data.maison
        if operation_data.type is not None:
            operation.type = operation_data.type
        if operation_data.motif is not None:
            operation.motif = operation_data.motif
        if operation_data.montant is not None:
            operation.montant = operation_data.montant
        if operation_data.origine is not None:
            operation.origine = operation_data.origine
        if operation_data.pieceJointe is not None:
            operation.piece_jointe = operation_data.pieceJointe
        if operation_data.editable is not None:
            operation.editable = operation_data.editable
        
        db.commit()
        db.refresh(operation)
        
        return FinancialOperationResponse(
            id=operation.id,
            date=operation.date.strftime("%Y-%m-%d"),
            maison=operation.house_id,
            type=operation.type,
            motif=operation.motif,
            montant=operation.montant,
            origine=operation.origine,
            pieceJointe=operation.piece_jointe,
            editable=operation.editable,
            reservationId=operation.reservation_id,
            checkinId=operation.checkin_id,
            maintenanceId=operation.maintenance_id
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating financial operation: {str(e)}")


@router.delete("/{operation_id}")
async def delete_financial_operation(
    operation_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Delete a financial operation.
    
    Only editable operations can be deleted.
    
    Args:
        operation_id: The financial operation ID to delete
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If operation not found, not editable, or deletion fails
    """
    operation = db.query(FinancialOperation).filter(FinancialOperation.id == operation_id).first()
    
    if not operation:
        raise HTTPException(status_code=404, detail="Financial operation not found")
    
    if not operation.editable:
        raise HTTPException(status_code=403, detail="This financial operation cannot be deleted")
    
    try:
        db.delete(operation)
        db.commit()
        
        return {"message": "Financial operation deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting financial operation: {str(e)}")


@router.get("/summary/{house_id}", response_model=FinancialSummary)
async def get_financial_summary(
    house_id: str,
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get financial summary for a specific house.
    
    Args:
        house_id: The house ID
        month: Optional month filter (1-12)
        year: Optional year filter
        db: Database session
        
    Returns:
        Financial summary with totals and balance
    """
    query = db.query(FinancialOperation).filter(FinancialOperation.house_id == house_id)
    
    if month:
        query = query.filter(extract('month', FinancialOperation.date) == month)
    if year:
        query = query.filter(extract('year', FinancialOperation.date) == year)
    
    operations = query.all()
    
    total_entrees = sum([op.montant for op in operations if op.type == "entree"])
    total_sorties = sum([op.montant for op in operations if op.type == "sortie"])
    balance = total_entrees - total_sorties
    
    period = None
    if year and month:
        period = f"{year}-{month:02d}"
    elif year:
        period = str(year)
    
    return FinancialSummary(
        totalEntrees=total_entrees,
        totalSorties=total_sorties,
        balance=balance,
        operationCount=len(operations),
        period=period
    )


@router.get("/revenue/monthly", response_model=List[MonthlyRevenue])
async def get_monthly_revenue(
    year: int = Query(...),
    houseId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get monthly revenue data for charts and analytics.
    
    Args:
        year: The year to get data for
        houseId: Optional house ID filter
        db: Database session
        
    Returns:
        List of monthly revenue data points
    """
    query = db.query(
        extract('month', FinancialOperation.date).label('month'),
        func.sum(FinancialOperation.montant).label('revenue')
    ).filter(
        extract('year', FinancialOperation.date) == year,
        FinancialOperation.type == "entree"
    )
    
    if houseId:
        query = query.filter(FinancialOperation.house_id == houseId)
    
    monthly_data = query.group_by(extract('month', FinancialOperation.date)).all()
    
    # Create complete 12-month data (fill missing months with 0)
    revenue_by_month = {str(month).zfill(2): 0.0 for month in range(1, 13)}
    
    for month, revenue in monthly_data:
        revenue_by_month[str(int(month)).zfill(2)] = float(revenue or 0)
    
    return [MonthlyRevenue(month=month, revenue=revenue) 
            for month, revenue in revenue_by_month.items()]