from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from typing import List, Optional
from datetime import datetime, date, timedelta

from app.core.database import get_db
from app.models.checkin import CheckIn
from app.models.reservation import Reservation
from app.models.maintenance import MaintenanceIssue
from app.models.finance import FinancialOperation
from app.models.house import House
from app.models.checklist import HouseCategoryStatus, ChecklistCategory
from app.schemas.dashboard import (
    DashboardMetrics,
    OccupancyData,
    RevenueDataPoint,
    DashboardResponse,
    DateFilter,
    HouseStats,
    PeriodStats
)
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get dashboard metrics for a specific date.
    
    Calculates real-time metrics based on database data.
    
    Args:
        date: Date filter in YYYY-MM-DD format (defaults to today)
        db: Database session
        
    Returns:
        Dashboard metrics for the specified date
    """
    try:
        # Parse date or use today
        if date:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        else:
            from datetime import date as date_module
            target_date = date_module.today()
        
        # Count check-ins for the target date
        checkins_today = db.query(CheckIn).filter(
            CheckIn.arrival_date == target_date
        ).count()
        
        # Count check-outs for the target date
        checkouts_today = db.query(CheckIn).filter(
            CheckIn.departure_date == target_date
        ).count()
        
        # Count unresolved maintenance issues
        maintenances_todo = db.query(MaintenanceIssue).filter(
            MaintenanceIssue.status == "non-resolue"
        ).count()
        
        # Count houses that are ready (all categories completed)
        total_houses = db.query(House).count()
        total_categories = db.query(ChecklistCategory).count()
        
        # Houses are ready if they have all categories marked as ready
        ready_houses = 0
        if total_categories > 0:
            houses = db.query(House).all()
            for house in houses:
                ready_categories = db.query(HouseCategoryStatus).filter(
                    HouseCategoryStatus.house_id == house.id,
                    HouseCategoryStatus.is_ready == True
                ).count()
                
                if ready_categories == total_categories:
                    ready_houses += 1
        
        # Count payments completed (reservations with corresponding check-ins)
        payments_completed = db.query(CheckIn).count()
        
        # Count payments open (reservations without check-ins)
        total_reservations = db.query(Reservation).count()
        payments_open = max(0, total_reservations - payments_completed)
        
        # Count advance payments (reservations with advance > 0)
        advance_payments = db.query(Reservation).filter(
            Reservation.advance_paid > 0
        ).count()
        
        return DashboardMetrics(
            checkinToday=checkins_today,
            checkoutToday=checkouts_today,
            maintenancesTodo=maintenances_todo,
            housesReady=ready_houses,
            paymentsCompleted=payments_completed,
            paymentsOpen=payments_open,
            advancePayments=advance_payments
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating metrics: {str(e)}")


@router.get("/occupancy", response_model=OccupancyData)
async def get_occupancy_data(
    date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get occupancy data for a specific date.
    
    Args:
        date: Date filter in YYYY-MM-DD format (defaults to today)
        db: Database session
        
    Returns:
        Occupancy data showing occupied vs free houses
    """
    try:
        # Parse date or use today
        if date:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        else:
            from datetime import date as date_module
            target_date = date_module.today()
        
        # Count total houses
        total_houses = db.query(House).count()
        
        # Count occupied houses (check-ins that span the target date)
        occupied_houses = db.query(CheckIn).filter(
            CheckIn.arrival_date <= target_date,
            CheckIn.departure_date > target_date
        ).count()
        
        free_houses = max(0, total_houses - occupied_houses)
        
        return OccupancyData(
            occupied=occupied_houses,
            free=free_houses
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating occupancy: {str(e)}")


@router.get("/revenue", response_model=List[RevenueDataPoint])
async def get_revenue_data(
    dateFrom: Optional[str] = Query(None),
    dateTo: Optional[str] = Query(None),
    days: Optional[int] = Query(15),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get revenue data for a date range.
    
    Args:
        dateFrom: Start date in YYYY-MM-DD format
        dateTo: End date in YYYY-MM-DD format
        days: Number of days to include (default 15, used if dateFrom/dateTo not provided)
        db: Database session
        
    Returns:
        List of daily revenue data points
    """
    try:
        # Determine date range
        if dateFrom and dateTo:
            start_date = datetime.strptime(dateFrom, "%Y-%m-%d").date()
            end_date = datetime.strptime(dateTo, "%Y-%m-%d").date()
        else:
            # Default to last 'days' days
            end_date = date.today()
            start_date = end_date - timedelta(days=days-1)
        
        # Get revenue data grouped by date
        revenue_data = db.query(
            FinancialOperation.date,
            func.sum(FinancialOperation.montant).label('total_revenue')
        ).filter(
            FinancialOperation.type == "entree",
            FinancialOperation.date >= start_date,
            FinancialOperation.date <= end_date
        ).group_by(FinancialOperation.date).all()
        
        # Create complete date range with 0 for missing dates
        revenue_dict = {item.date: float(item.total_revenue or 0) for item in revenue_data}
        
        result = []
        current_date = start_date
        while current_date <= end_date:
            revenue = revenue_dict.get(current_date, 0.0)
            result.append(RevenueDataPoint(
                jour=current_date.strftime("%Y-%m-%d"),
                revenus=revenue
            ))
            current_date += timedelta(days=1)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating revenue: {str(e)}")


@router.get("/", response_model=DashboardResponse)
async def get_complete_dashboard(
    date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get complete dashboard data in a single request.
    
    Combines metrics, occupancy, and revenue data for optimal performance.
    
    Args:
        date: Date filter in YYYY-MM-DD format (defaults to today)
        db: Database session
        
    Returns:
        Complete dashboard data
    """
    try:
        # Get all data components
        metrics = await get_dashboard_metrics(date, db)
        occupancy = await get_occupancy_data(date, db)
        revenue = await get_revenue_data(None, None, 15, db)  # Last 15 days
        
        return DashboardResponse(
            metrics=metrics,
            occupancy=occupancy,
            revenue=revenue
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting dashboard data: {str(e)}")


@router.get("/house-stats", response_model=List[HouseStats])
async def get_house_statistics(
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get detailed statistics for all houses.
    
    Args:
        db: Database session
        
    Returns:
        List of house statistics
    """
    houses = db.query(House).all()
    house_stats = []
    
    for house in houses:
        # Calculate total revenue
        total_revenue = db.query(func.sum(FinancialOperation.montant)).filter(
            FinancialOperation.house_id == house.id,
            FinancialOperation.type == "entree"
        ).scalar() or 0
        
        # Calculate maintenance issues
        maintenance_issues = db.query(MaintenanceIssue).filter(
            MaintenanceIssue.house_id == house.id,
            MaintenanceIssue.status == "non-resolue"
        ).count()
        
        # Calculate occupancy rate (simplified - last 30 days)
        thirty_days_ago = date.today() - timedelta(days=30)
        occupied_days = db.query(CheckIn).filter(
            CheckIn.house_id == house.id,
            CheckIn.arrival_date >= thirty_days_ago
        ).count()
        
        occupancy_rate = min(100.0, (occupied_days / 30) * 100)
        
        # Get last checkout
        last_checkin = db.query(CheckIn).filter(
            CheckIn.house_id == house.id
        ).order_by(CheckIn.departure_date.desc()).first()
        
        last_checkout = None
        if last_checkin:
            last_checkout = last_checkin.departure_date.strftime("%Y-%m-%d")
        
        # Calculate average stay duration
        checkins = db.query(CheckIn).filter(CheckIn.house_id == house.id).all()
        if checkins:
            total_days = sum([(c.departure_date - c.arrival_date).days for c in checkins])
            avg_stay = total_days / len(checkins)
        else:
            avg_stay = 0.0
        
        house_stats.append(HouseStats(
            houseId=house.id,
            name=house.name,
            totalRevenue=float(total_revenue),
            occupancyRate=occupancy_rate,
            maintenanceIssues=maintenance_issues,
            averageStayDuration=avg_stay,
            lastCheckout=last_checkout
        ))
    
    return house_stats


@router.get("/period-stats", response_model=PeriodStats)
async def get_period_statistics(
    year: int = Query(...),
    month: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    """
    Get statistics for a specific time period.
    
    Args:
        year: The year
        month: Optional month (1-12)
        db: Database session
        
    Returns:
        Period statistics
    """
    try:
        # Build query filters
        date_filters = [extract('year', FinancialOperation.date) == year]
        period = str(year)
        
        if month:
            date_filters.append(extract('month', FinancialOperation.date) == month)
            period = f"{year}-{month:02d}"
        
        # Calculate revenue and expenses
        revenue_query = db.query(func.sum(FinancialOperation.montant)).filter(
            and_(*date_filters),
            FinancialOperation.type == "entree"
        )
        
        expenses_query = db.query(func.sum(FinancialOperation.montant)).filter(
            and_(*date_filters),
            FinancialOperation.type == "sortie"
        )
        
        total_revenue = revenue_query.scalar() or 0
        total_expenses = expenses_query.scalar() or 0
        net_profit = total_revenue - total_expenses
        
        # Calculate guest count and average stay value
        checkin_filters = [extract('year', CheckIn.arrival_date) == year]
        if month:
            checkin_filters.append(extract('month', CheckIn.arrival_date) == month)
        
        guest_count = db.query(CheckIn).filter(and_(*checkin_filters)).count()
        
        avg_stay_value = (total_revenue / guest_count) if guest_count > 0 else 0
        
        # Calculate occupancy rate (simplified)
        if month:
            # Days in the specific month
            import calendar
            days_in_period = calendar.monthrange(year, month)[1]
        else:
            # Days in the year
            days_in_period = 366 if year % 4 == 0 else 365
        
        total_houses = db.query(House).count()
        max_possible_occupancy_days = total_houses * days_in_period
        
        actual_occupancy_days = db.query(func.sum(
            func.julianday(CheckIn.departure_date) - func.julianday(CheckIn.arrival_date)
        )).filter(and_(*checkin_filters)).scalar() or 0
        
        occupancy_rate = (actual_occupancy_days / max_possible_occupancy_days * 100) if max_possible_occupancy_days > 0 else 0
        
        return PeriodStats(
            period=period,
            totalRevenue=float(total_revenue),
            totalExpenses=float(total_expenses),
            netProfit=float(net_profit),
            occupancyRate=min(100.0, occupancy_rate),
            guestCount=guest_count,
            averageStayValue=float(avg_stay_value)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating period stats: {str(e)}")