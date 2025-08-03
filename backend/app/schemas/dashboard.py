from pydantic import BaseModel
from typing import List


class DashboardMetrics(BaseModel):
    checkinToday: int
    checkoutToday: int
    maintenancesTodo: int
    housesReady: int
    paymentsCompleted: int
    paymentsOpen: int
    advancePayments: int


class OccupancyData(BaseModel):
    occupied: int
    free: int


class RevenueDataPoint(BaseModel):
    jour: str  # YYYY-MM-DD format
    revenus: float


class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    occupancy: OccupancyData
    revenue: List[RevenueDataPoint]