import { api } from './api';
import type { FinancialOperation, CreateFinancialOperation } from '../types/api';

export const financeService = {
  // Get financial operations with optional filters
  getFinancialOperations: async (filters?: {
    houseId?: string;
    type?: 'entree' | 'sortie';
    origine?: string;
    month?: number;
    year?: number;
  }): Promise<FinancialOperation[]> => {
    let endpoint = '/financialOperations';
    const params = new URLSearchParams();
    
    if (filters?.houseId) params.append('maison', filters.houseId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.origine) params.append('origine', filters.origine);
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get<FinancialOperation[]>(endpoint);
  },

  // Get a specific financial operation
  getFinancialOperation: async (id: string): Promise<FinancialOperation> => {
    return api.get<FinancialOperation>(`/financialOperations/${id}`);
  },

  // Create a new financial operation
  createFinancialOperation: async (operation: CreateFinancialOperation): Promise<FinancialOperation> => {
    return api.post<FinancialOperation>('/financialOperations', operation);
  },

  // Update a financial operation (only if editable)
  updateFinancialOperation: async (id: string, updates: Partial<CreateFinancialOperation>): Promise<FinancialOperation> => {
    return api.put<FinancialOperation>(`/financialOperations/${id}`, updates);
  },

  // Delete a financial operation
  deleteFinancialOperation: async (id: string): Promise<void> => {
    return api.delete<void>(`/financialOperations/${id}`);
  },

  // Get financial summary for a house
  getFinancialSummary: async (houseId: string, month?: number, year?: number) => {
    const operations = await financeService.getFinancialOperations({
      houseId,
      month,
      year
    });

    const summary = operations.reduce(
      (acc, op) => {
        if (op.type === 'entree') {
          acc.totalEntrees += op.montant;
        } else {
          acc.totalSorties += op.montant;
        }
        return acc;
      },
      { totalEntrees: 0, totalSorties: 0 }
    );

    return {
      ...summary,
      balance: summary.totalEntrees - summary.totalSorties,
    };
  },

  // Get monthly revenue data for charts
  getMonthlyRevenue: async (year: number): Promise<{ month: string; revenue: number }[]> => {
    const operations = await financeService.getFinancialOperations({ year });
    
    const monthlyData = operations.reduce((acc, op) => {
      if (op.type === 'entree') {
        const month = op.date.substring(5, 7); // Extract MM from YYYY-MM-DD
        acc[month] = (acc[month] || 0) + op.montant;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }
};