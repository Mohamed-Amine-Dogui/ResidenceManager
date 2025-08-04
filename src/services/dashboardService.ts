import { api } from './api';
import type { DashboardMetrics, OccupancyData, RevenueDataPoint } from '../types/api';

export const dashboardService = {
  // Get dashboard metrics for a specific date
  getDashboardMetrics: async (date?: string): Promise<DashboardMetrics> => {
    console.log('🔍 getDashboardMetrics called with date:', date);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const endpoint = `/api/v1/dashboard/metrics${params.toString() ? `?${params.toString()}` : ''}`;
    const metrics = await api.get<DashboardMetrics>(endpoint);
    
    console.log('🔍 Raw API response - metrics:', metrics);
    console.log('🔍 Returning dashboard metrics:', metrics);
    return metrics;
  },

  // Get house occupancy data
  getOccupancyData: async (date?: string): Promise<OccupancyData> => {
    console.log('🏠 getOccupancyData called with date:', date);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const endpoint = `/api/v1/dashboard/occupancy${params.toString() ? `?${params.toString()}` : ''}`;
    const occupancy = await api.get<OccupancyData>(endpoint);
    
    console.log('🏠 Raw API response - occupancy:', occupancy);
    console.log('🏠 Returning occupancy data:', occupancy);
    return occupancy;
  },

  // Get revenue data for charts
  getRevenueData: async (month?: number, year?: number): Promise<RevenueDataPoint[]> => {
    let endpoint = '/api/v1/dashboard/revenue';
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