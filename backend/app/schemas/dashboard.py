from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class DashboardMetrics(BaseModel):
    """
    Dashboard metrics schema matching frontend expectations.
    
    Provides real-time calculated metrics for the selected date.
    """
    checkinToday: int  # Count of check-ins for selected date
    checkoutToday: int  # Count of check-outs for selected date  
    maintenancesTodo: int  # Count of unresolved maintenance issues
    housesReady: int  # Count of houses ready for next guest
    paymentsCompleted: int  # Count of completed payments
    paymentsOpen: int  # Count of reservations without check-in
    advancePayments: int  # Count of advance payments


class OccupancyData(BaseModel):
    """
    Occupancy data schema for pie chart display.
    
    Shows current house occupancy status.
    """
    occupied: int  # Number of occupied houses
    free: int  # Number of available houses


class RevenueDataPoint(BaseModel):
    """
    Revenue data point for line chart display.
    
    Matches the exact format expected by the frontend charts.
    """
    jour: str  # YYYY-MM-DD format
    revenus: float  # Revenue amount for the day


class DashboardResponse(BaseModel):
    """
    Complete dashboard response schema.
    
    Combines all dashboard data for a single API call.
    """
    metrics: DashboardMetrics
    occupancy: OccupancyData
    revenue: List[RevenueDataPoint]


class DateFilter(BaseModel):
    """
    Schema for dashboard date filtering.
    
    Allows filtering dashboard data by specific date or date range.
    """
    date: Optional[str] = None  # YYYY-MM-DD format
    dateFrom: Optional[str] = None
    dateTo: Optional[str] = None


class HouseStats(BaseModel):
    """
    Schema for individual house statistics.
    
    Provides detailed stats for a specific house.
    """
    houseId: str
    name: str
    totalRevenue: float
    occupancyRate: float  # Percentage
    maintenanceIssues: int
    averageStayDuration: float  # Days
    lastCheckout: Optional[str] = None  # YYYY-MM-DD format


class PeriodStats(BaseModel):
    """
    Schema for period-based statistics.
    
    Provides aggregated stats for a specific time period.
    """
    period: str  # e.g., "2025-08" or "2025-Q1"
    totalRevenue: float
    totalExpenses: float
    netProfit: float
    occupancyRate: float
    guestCount: int
    averageStayValue: float