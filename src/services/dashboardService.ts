import { api } from './api';
import type { DashboardMetrics, OccupancyData, RevenueDataPoint } from '../types/api';

export const dashboardService = {
  // Get dashboard metrics for a specific date
  getDashboardMetrics: async (date?: string): Promise<DashboardMetrics> => {
    console.log('🔍 getDashboardMetrics called with date:', date);
    const allMetrics = await api.get<Array<DashboardMetrics & { date: string }>>('/dashboardMetrics');
    
    console.log('🔍 Raw API response - all metrics:', allMetrics);
    console.log('🔍 Number of metrics returned:', allMetrics.length);
    
    // Filter by date if provided
    let targetMetric = null;
    if (date) {
      console.log('🔍 Filtering for date:', date);
      targetMetric = allMetrics.find(m => {
        console.log('🔍 Comparing:', m.date, '===', date, '?', m.date === date);
        return m.date === date;
      });
    } else {
      targetMetric = allMetrics[0];
    }
    
    console.log('🔍 Found target metric:', targetMetric);
    
    const result = targetMetric || {
      checkinToday: 0,
      checkoutToday: 0,
      maintenancesTodo: 0,
      housesReady: 0,
      paymentsCompleted: 0,
      paymentsOpen: 0,
      advancePayments: 0
    };
    
    console.log('🔍 Returning dashboard metrics:', result);
    return result;
  },

  // Get house occupancy data
  getOccupancyData: async (date?: string): Promise<OccupancyData> => {
    console.log('🏠 getOccupancyData called with date:', date);
    const allOccupancy = await api.get<Array<OccupancyData & { date: string }>>('/occupancyData');
    
    console.log('🏠 Raw API response - all occupancy:', allOccupancy);
    console.log('🏠 Number of occupancy records:', allOccupancy.length);
    
    // Filter by date if provided
    let targetOccupancy = null;
    if (date) {
      console.log('🏠 Filtering for date:', date);
      targetOccupancy = allOccupancy.find(o => {
        console.log('🏠 Comparing:', o.date, '===', date, '?', o.date === date);
        return o.date === date;
      });
    } else {
      targetOccupancy = allOccupancy[0];
    }
    
    console.log('🏠 Found target occupancy:', targetOccupancy);
    
    const result = targetOccupancy || { occupied: 0, free: 0 };
    console.log('🏠 Returning occupancy data:', result);
    return result;
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