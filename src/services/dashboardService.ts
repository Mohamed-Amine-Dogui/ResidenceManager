import { api } from './api';
import type { DashboardMetrics, OccupancyData, RevenueDataPoint } from '../types/api';

export const dashboardService = {
  // Get dashboard metrics for a specific date
  getDashboardMetrics: async (date?: string): Promise<DashboardMetrics> => {
    const endpoint = date 
      ? `/dashboardMetrics?date=${date}` 
      : '/dashboardMetrics';
    
    const metrics = await api.get<DashboardMetrics[]>(endpoint);
    // Return the first (and likely only) metrics object
    return metrics[0] || {
      checkinToday: 0,
      checkoutToday: 0,
      maintenancesTodo: 0,
      housesReady: 0,
      paymentsCompleted: 0,
      paymentsOpen: 0,
      advancePayments: 0
    };
  },

  // Get house occupancy data
  getOccupancyData: async (date?: string): Promise<OccupancyData> => {
    const endpoint = date 
      ? `/occupancyData?date=${date}` 
      : '/occupancyData';
    
    const occupancy = await api.get<OccupancyData[]>(endpoint);
    return occupancy[0] || { occupied: 0, free: 0 };
  },

  // Get revenue data for charts
  getRevenueData: async (month?: number, year?: number): Promise<RevenueDataPoint[]> => {
    let endpoint = '/revenueData';
    const params = new URLSearchParams();
    
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get<RevenueDataPoint[]>(endpoint);
  },

  // Get complete dashboard data
  getDashboardData: async (date?: string) => {
    try {
      const [metrics, occupancy, revenue] = await Promise.all([
        dashboardService.getDashboardMetrics(date),
        dashboardService.getOccupancyData(date),
        dashboardService.getRevenueData()
      ]);

      return {
        metrics,
        occupancy,
        revenue
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  // Calculate key performance indicators
  calculateKPIs: (metrics: DashboardMetrics, occupancy: OccupancyData) => {
    const totalHouses = occupancy.occupied + occupancy.free;
    const occupancyRate = totalHouses > 0 ? (occupancy.occupied / totalHouses) * 100 : 0;
    
    return {
      occupancyRate: Math.round(occupancyRate),
      maintenanceRatio: totalHouses > 0 ? (metrics.maintenancesTodo / totalHouses) * 100 : 0,
      paymentCompletionRate: metrics.paymentsCompleted + metrics.paymentsOpen > 0 
        ? (metrics.paymentsCompleted / (metrics.paymentsCompleted + metrics.paymentsOpen)) * 100 
        : 0
    };
  }
};