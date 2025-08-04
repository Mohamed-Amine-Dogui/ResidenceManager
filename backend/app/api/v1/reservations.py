from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.core.database import get_db
from app.models.reservation import Reservation
from app.models.finance import FinancialOperation
from app.schemas.reservation import (
    ReservationCreate, 
    ReservationUpdate, 
    ReservationResponse
)
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ReservationResponse])
async def get_reservations(
    house_id: Optional[str] = Query(None, alias="maison"),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get all reservations with optional filtering by house.
    
    Args:
        house_id: Optional house ID to filter reservations
        db: Database session
        
    Returns:
        List of reservations matching the frontend response format
    """
    query = db.query(Reservation)
    
    if house_id:
        query = query.filter(Reservation.house_id == house_id)
    
    reservations = query.order_by(Reservation.checkin_date.desc()).all()
    
    # Convert database objects to frontend response format
    response_data = []
    for reservation in reservations:
        response_data.append(ReservationResponse(
            id=reservation.id,
            maison=reservation.house_id,
            nom=reservation.guest_name,
            telephone=reservation.phone or "",
            email=reservation.email or "",
            checkin=reservation.checkin_date.strftime("%Y-%m-%d"),
            checkout=reservation.checkout_date.strftime("%Y-%m-%d"),
            montantAvance=reservation.advance_paid
        ))
    
    return response_data


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get a specific reservation by ID.
    
    Args:
        reservation_id: The reservation ID
        db: Database session
        
    Returns:
        Reservation details in frontend format
        
    Raises:
        HTTPException: If reservation not found
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return ReservationResponse(
        id=reservation.id,
        maison=reservation.house_id,
        nom=reservation.guest_name,
        telephone=reservation.phone or "",
        email=reservation.email or "",
        checkin=reservation.checkin_date.strftime("%Y-%m-%d"),
        checkout=reservation.checkout_date.strftime("%Y-%m-%d"),
        montantAvance=reservation.advance_paid
    )


@router.post("/", response_model=ReservationResponse)
async def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Create a new reservation.
    
    Automatically creates a corresponding financial transaction for the advance payment.
    
    Args:
        reservation_data: Reservation creation data
        db: Database session
        
    Returns:
        Created reservation in frontend format
        
    Raises:
        HTTPException: If validation fails or creation error occurs
    """
    try:
        # Parse dates
        checkin_date = datetime.strptime(reservation_data.checkin, "%Y-%m-%d").date()
        checkout_date = datetime.strptime(reservation_data.checkout, "%Y-%m-%d").date()
        
        # Validate dates
        if checkin_date >= checkout_date:
            raise HTTPException(
                status_code=400, 
                detail="Check-in date must be before check-out date"
            )
        
        if checkin_date < date.today():
            raise HTTPException(
                status_code=400, 
                detail="Check-in date cannot be in the past"
            )
        
        # Create reservation
        reservation = Reservation(
            house_id=reservation_data.maison,
            guest_name=reservation_data.nom,
            phone=reservation_data.telephone,
            email=reservation_data.email,
            checkin_date=checkin_date,
            checkout_date=checkout_date,
            advance_paid=reservation_data.montantAvance
        )
        
        db.add(reservation)
        db.commit()
        db.refresh(reservation)
        
        # Create financial transaction for advance payment if amount > 0
        if reservation_data.montantAvance > 0:
            financial_operation = FinancialOperation(
                date=checkin_date,
                house_id=reservation_data.maison,
                type="entree",
                motif=f"Avance réservation - {reservation_data.nom}",
                montant=reservation_data.montantAvance,
                origine="reservation",
                editable=False,
                reservation_id=reservation.id
            )
            
            db.add(financial_operation)
            db.commit()
        
        return ReservationResponse(
            id=reservation.id,
            maison=reservation.house_id,
            nom=reservation.guest_name,
            telephone=reservation.phone or "",
            email=reservation.email or "",
            checkin=reservation.checkin_date.strftime("%Y-%m-%d"),
            checkout=reservation.checkout_date.strftime("%Y-%m-%d"),
            montantAvance=reservation.advance_paid
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating reservation: {str(e)}")


@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(
    reservation_id: str,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Update an existing reservation.
    
    Also updates the corresponding financial transaction if advance amount changes.
    
    Args:
        reservation_id: The reservation ID to update
        reservation_data: Updated reservation data
        db: Database session
        
    Returns:
        Updated reservation in frontend format
        
    Raises:
        HTTPException: If reservation not found or update fails
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    try:
        # Update fields if provided
        if reservation_data.nom is not None:
            reservation.guest_name = reservation_data.nom
        if reservation_data.telephone is not None:
            reservation.phone = reservation_data.telephone
        if reservation_data.email is not None:
            reservation.email = reservation_data.email
        if reservation_data.checkin is not None:
            new_checkin = datetime.strptime(reservation_data.checkin, "%Y-%m-%d").date()
            if new_checkin < date.today():
                raise HTTPException(
                    status_code=400, 
                    detail="Check-in date cannot be in the past"
                )
            reservation.checkin_date = new_checkin
        if reservation_data.checkout is not None:
            new_checkout = datetime.strptime(reservation_data.checkout, "%Y-%m-%d").date()
            reservation.checkout_date = new_checkout
        if reservation_data.montantAvance is not None:
            old_amount = reservation.advance_paid
            reservation.advance_paid = reservation_data.montantAvance
            
            # Update corresponding financial transaction
            financial_op = db.query(FinancialOperation).filter(
                FinancialOperation.reservation_id == reservation_id,
                FinancialOperation.origine == "reservation"
            ).first()
            
            if financial_op:
                financial_op.montant = reservation_data.montantAvance
                financial_op.motif = f"Avance réservation - {reservation.guest_name}"
                financial_op.date = reservation.checkin_date
            elif reservation_data.montantAvance > 0:
                # Create new financial transaction if none exists
                financial_operation = FinancialOperation(
                    date=reservation.checkin_date,
                    house_id=reservation.house_id,
                    type="entree",
                    motif=f"Avance réservation - {reservation.guest_name}",
                    montant=reservation_data.montantAvance,
                    origine="reservation",
                    editable=False,
                    reservation_id=reservation.id
                )
                db.add(financial_operation)
        
        # Validate dates after all updates
        if reservation.checkin_date >= reservation.checkout_date:
            raise HTTPException(
                status_code=400, 
                detail="Check-in date must be before check-out date"
            )
        
        db.commit()
        db.refresh(reservation)
        
        return ReservationResponse(
            id=reservation.id,
            maison=reservation.house_id,
            nom=reservation.guest_name,
            telephone=reservation.phone or "",
            email=reservation.email or "",
            checkin=reservation.checkin_date.strftime("%Y-%m-%d"),
            checkout=reservation.checkout_date.strftime("%Y-%m-%d"),
            montantAvance=reservation.advance_paid
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating reservation: {str(e)}")


@router.delete("/{reservation_id}")
async def delete_reservation(
    reservation_id: str,
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Delete a reservation.
    
    Also deletes any corresponding financial transactions.
    
    Args:
        reservation_id: The reservation ID to delete
        db: Database session
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If reservation not found or deletion fails
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    try:
        # Delete corresponding financial transactions
        financial_ops = db.query(FinancialOperation).filter(
            FinancialOperation.reservation_id == reservation_id
        ).all()
        
        for op in financial_ops:
            db.delete(op)
        
        # Delete the reservation
        db.delete(reservation)
        db.commit()
        
        return {"message": "Reservation deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting reservation: {str(e)}")


@router.get("/{reservation_id}/availability")
async def check_availability(
    reservation_id: str,
    checkin: str = Query(...),
    checkout: str = Query(...),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Check if new dates are available for an existing reservation.
    
    Args:
        reservation_id: The reservation ID to exclude from availability check
        checkin: New check-in date (YYYY-MM-DD)
        checkout: New check-out date (YYYY-MM-DD)
        db: Database session
        
    Returns:
        Availability status
    """
    try:
        checkin_date = datetime.strptime(checkin, "%Y-%m-%d").date()
        checkout_date = datetime.strptime(checkout, "%Y-%m-%d").date()
        
        # Get the current reservation to know which house to check
        current_reservation = db.query(Reservation).filter(
            Reservation.id == reservation_id
        ).first()
        
        if not current_reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # Check for conflicts with other reservations for the same house
        conflicting_reservations = db.query(Reservation).filter(
            Reservation.house_id == current_reservation.house_id,
            Reservation.id != reservation_id,
            Reservation.checkin_date < checkout_date,
            Reservation.checkout_date > checkin_date
        ).count()
        
        is_available = conflicting_reservations == 0
        
        return {
            "available": is_available,
            "conflicts": conflicting_reservations
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")