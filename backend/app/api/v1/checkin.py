from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.core.database import get_db
from app.models.checkin import CheckIn, CheckOut
from app.models.finance import FinancialOperation
from app.models.reservation import Reservation
from app.schemas.checkin import (
    CheckInCreate, 
    CheckInUpdate, 
    CheckInResponse,
    CheckOutCreate,
    CheckOutResponse,
    InventaireType
)
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CheckInResponse])
async def get_checkins(
    houseId: Optional[str] = Query(None, alias="maison"),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get all check-ins with optional filtering by house.
    
    Args:
        houseId: Optional house ID to filter check-ins
        db: Database session
        
    Returns:
        List of check-ins in frontend format
    """
    query = db.query(CheckIn)
    
    if houseId:
        query = query.filter(CheckIn.house_id == houseId)
    
    checkins = query.order_by(CheckIn.arrival_date.desc()).all()
    
    # Convert to frontend format
    response_data = []
    for checkin in checkins:
        # Convert inventory JSON to InventaireType
        inventory = InventaireType(**checkin.inventory) if checkin.inventory else InventaireType()
        
        response_data.append(CheckInResponse(
            id=checkin.id,
            maison=checkin.house_id,
            nom=checkin.guest_name,
            telephone=checkin.phone or "",
            email=checkin.email or "",
            dateArrivee=checkin.arrival_date.strftime("%Y-%m-%d"),
            dateDepart=checkin.departure_date.strftime("%Y-%m-%d"),
            avancePaye=checkin.advance_paid,
            paiementCheckin=checkin.checkin_payment,
            montantTotal=checkin.total_amount,
            inventaire=inventory,
            responsable=checkin.manager,
            remarques=checkin.remarks or "",
            reservationId=checkin.reservation_id
        ))
    
    return response_data


@router.get("/{checkin_id}", response_model=CheckInResponse)
async def get_checkin(
    checkin_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get a specific check-in by ID.
    
    Args:
        checkin_id: The check-in ID
        db: Database session
        
    Returns:
        Check-in details in frontend format
        
    Raises:
        HTTPException: If check-in not found
    """
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    inventory = InventaireType(**checkin.inventory) if checkin.inventory else InventaireType()
    
    return CheckInResponse(
        id=checkin.id,
        maison=checkin.house_id,
        nom=checkin.guest_name,
        telephone=checkin.phone or "",
        email=checkin.email or "",
        dateArrivee=checkin.arrival_date.strftime("%Y-%m-%d"),
        dateDepart=checkin.departure_date.strftime("%Y-%m-%d"),
        avancePaye=checkin.advance_paid,
        paiementCheckin=checkin.checkin_payment,
        montantTotal=checkin.total_amount,
        inventaire=inventory,
        responsable=checkin.manager,
        remarques=checkin.remarks or "",
        reservationId=checkin.reservation_id
    )


@router.post("/", response_model=CheckInResponse)
async def create_checkin(
    checkin_data: CheckInCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Create a new check-in.
    
    Automatically creates a financial transaction for the accommodation payment.
    
    Args:
        checkin_data: Check-in creation data
        db: Database session
        
    Returns:
        Created check-in in frontend format
        
    Raises:
        HTTPException: If validation fails or creation error occurs
    """
    try:
        # Parse dates
        arrival_date = datetime.strptime(checkin_data.dateArrivee, "%Y-%m-%d").date()
        departure_date = datetime.strptime(checkin_data.dateDepart, "%Y-%m-%d").date()
        
        # Validate dates
        if arrival_date >= departure_date:
            raise HTTPException(
                status_code=400, 
                detail="Arrival date must be before departure date"
            )
        
        # Create check-in
        checkin = CheckIn(
            reservation_id=checkin_data.reservationId,
            house_id=checkin_data.maison,
            guest_name=checkin_data.nom,
            phone=checkin_data.telephone,
            email=checkin_data.email,
            arrival_date=arrival_date,
            departure_date=departure_date,
            advance_paid=checkin_data.avancePaye,
            checkin_payment=checkin_data.paiementCheckin,
            total_amount=checkin_data.montantTotal,
            inventory=checkin_data.inventaire.dict(),
            manager=checkin_data.responsable,
            remarks=checkin_data.remarques
        )
        
        db.add(checkin)
        db.commit()
        db.refresh(checkin)
        
        # Create financial transaction for accommodation payment if amount > 0
        if checkin_data.paiementCheckin > 0:
            financial_operation = FinancialOperation(
                date=arrival_date,
                house_id=checkin_data.maison,
                type="entree",
                motif=f"Paiement accommodation - {checkin_data.nom}",
                montant=checkin_data.paiementCheckin,
                origine="checkin",
                editable=False,
                checkin_id=checkin.id,
                reservation_id=checkin_data.reservationId
            )
            
            db.add(financial_operation)
            db.commit()
        
        inventory = InventaireType(**checkin.inventory) if checkin.inventory else InventaireType()
        
        return CheckInResponse(
            id=checkin.id,
            maison=checkin.house_id,
            nom=checkin.guest_name,
            telephone=checkin.phone or "",
            email=checkin.email or "",
            dateArrivee=checkin.arrival_date.strftime("%Y-%m-%d"),
            dateDepart=checkin.departure_date.strftime("%Y-%m-%d"),
            avancePaye=checkin.advance_paid,
            paiementCheckin=checkin.checkin_payment,
            montantTotal=checkin.total_amount,
            inventaire=inventory,
            responsable=checkin.manager,
            remarques=checkin.remarks or "",
            reservationId=checkin.reservation_id
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating check-in: {str(e)}")


@router.put("/{checkin_id}", response_model=CheckInResponse)
async def update_checkin(
    checkin_id: str,
    checkin_data: CheckInUpdate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Update an existing check-in.
    
    Args:
        checkin_id: The check-in ID to update
        checkin_data: Updated check-in data
        db: Database session
        
    Returns:
        Updated check-in in frontend format
        
    Raises:
        HTTPException: If check-in not found or update fails
    """
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    try:
        # Update fields if provided
        if checkin_data.nom is not None:
            checkin.guest_name = checkin_data.nom
        if checkin_data.telephone is not None:
            checkin.phone = checkin_data.telephone
        if checkin_data.email is not None:
            checkin.email = checkin_data.email
        if checkin_data.dateArrivee is not None:
            checkin.arrival_date = datetime.strptime(checkin_data.dateArrivee, "%Y-%m-%d").date()
        if checkin_data.dateDepart is not None:
            checkin.departure_date = datetime.strptime(checkin_data.dateDepart, "%Y-%m-%d").date()
        if checkin_data.avancePaye is not None:
            checkin.advance_paid = checkin_data.avancePaye
        if checkin_data.paiementCheckin is not None:
            old_payment = checkin.checkin_payment
            checkin.checkin_payment = checkin_data.paiementCheckin
            
            # Update corresponding financial transaction
            financial_op = db.query(FinancialOperation).filter(
                FinancialOperation.checkin_id == checkin_id,
                FinancialOperation.origine == "checkin"
            ).first()
            
            if financial_op:
                financial_op.montant = checkin_data.paiementCheckin
                financial_op.motif = f"Paiement accommodation - {checkin.guest_name}"
                financial_op.date = checkin.arrival_date
        if checkin_data.montantTotal is not None:
            checkin.total_amount = checkin_data.montantTotal
        if checkin_data.inventaire is not None:
            checkin.inventory = checkin_data.inventaire.dict()
        if checkin_data.responsable is not None:
            checkin.manager = checkin_data.responsable
        if checkin_data.remarques is not None:
            checkin.remarks = checkin_data.remarques
        
        # Validate dates after updates
        if checkin.arrival_date >= checkin.departure_date:
            raise HTTPException(
                status_code=400, 
                detail="Arrival date must be before departure date"
            )
        
        db.commit()
        db.refresh(checkin)
        
        inventory = InventaireType(**checkin.inventory) if checkin.inventory else InventaireType()
        
        return CheckInResponse(
            id=checkin.id,
            maison=checkin.house_id,
            nom=checkin.guest_name,
            telephone=checkin.phone or "",
            email=checkin.email or "",
            dateArrivee=checkin.arrival_date.strftime("%Y-%m-%d"),
            dateDepart=checkin.departure_date.strftime("%Y-%m-%d"),
            avancePaye=checkin.advance_paid,
            paiementCheckin=checkin.checkin_payment,
            montantTotal=checkin.total_amount,
            inventaire=inventory,
            responsable=checkin.manager,
            remarques=checkin.remarks or "",
            reservationId=checkin.reservation_id
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating check-in: {str(e)}")


@router.delete("/{checkin_id}")
async def delete_checkin(
    checkin_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Delete a check-in.
    
    Also deletes any corresponding financial transactions.
    
    Args:
        checkin_id: The check-in ID to delete
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If check-in not found or deletion fails
    """
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    try:
        # Delete corresponding financial transactions
        financial_ops = db.query(FinancialOperation).filter(
            FinancialOperation.checkin_id == checkin_id
        ).all()
        
        for op in financial_ops:
            db.delete(op)
        
        # Delete any checkout records
        checkouts = db.query(CheckOut).filter(CheckOut.checkin_id == checkin_id).all()
        for checkout in checkouts:
            db.delete(checkout)
        
        # Delete the check-in
        db.delete(checkin)
        db.commit()
        
        return {"message": "Check-in deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting check-in: {str(e)}")


# Checkout endpoints
@router.post("/{checkin_id}/checkout", response_model=CheckOutResponse)
async def create_checkout(
    checkin_id: str,
    checkout_data: CheckOutCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Create a checkout record for a check-in.
    
    Args:
        checkin_id: The check-in ID to checkout
        checkout_data: Checkout creation data
        db: Database session
        
    Returns:
        Created checkout in frontend format
        
    Raises:
        HTTPException: If check-in not found or checkout creation fails
    """
    checkin = db.query(CheckIn).filter(CheckIn.id == checkin_id).first()
    
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    try:
        checkout_date = datetime.strptime(checkout_data.dateDepart, "%Y-%m-%d").date()
        
        checkout = CheckOut(
            checkin_id=checkin_id,
            house_id=checkin.house_id,
            guest_name=checkout_data.nom,
            checkout_date=checkout_date,
            checkout_inventory=checkout_data.inventaireSortie.dict() if checkout_data.inventaireSortie else None,
            damages_notes=checkout_data.notesDommages,
            manager=checkout_data.responsable
        )
        
        db.add(checkout)
        db.commit()
        db.refresh(checkout)
        
        return CheckOutResponse(
            id=checkout.id,
            checkinId=checkout.checkin_id,
            maison=checkout.house_id,
            nom=checkout.guest_name,
            dateDepart=checkout.checkout_date.strftime("%Y-%m-%d"),
            inventaireSortie=InventaireType(**checkout.checkout_inventory) if checkout.checkout_inventory else None,
            notesDommages=checkout.damages_notes,
            responsable=checkout.manager
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating checkout: {str(e)}")


@router.get("/checkouts/", response_model=List[CheckOutResponse])
async def get_checkouts(
    houseId: Optional[str] = Query(None, alias="maison"),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get all checkouts with optional filtering by house.
    
    Args:
        houseId: Optional house ID to filter checkouts
        db: Database session
        
    Returns:
        List of checkouts in frontend format
    """
    query = db.query(CheckOut)
    
    if houseId:
        query = query.filter(CheckOut.house_id == houseId)
    
    checkouts = query.order_by(CheckOut.checkout_date.desc()).all()
    
    response_data = []
    for checkout in checkouts:
        response_data.append(CheckOutResponse(
            id=checkout.id,
            checkinId=checkout.checkin_id,
            maison=checkout.house_id,
            nom=checkout.guest_name,
            dateDepart=checkout.checkout_date.strftime("%Y-%m-%d"),
            inventaireSortie=InventaireType(**checkout.checkout_inventory) if checkout.checkout_inventory else None,
            notesDommages=checkout.damages_notes,
            responsable=checkout.manager
        ))
    
    return response_data