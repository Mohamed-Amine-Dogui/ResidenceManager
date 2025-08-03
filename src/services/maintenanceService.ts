import { api } from './api';
import type { MaintenanceIssue, MaintenanceType, CreateMaintenanceIssue } from '../types/api';

export const maintenanceService = {
  // Get maintenance issues with optional filters
  getMaintenanceIssues: async (filters?: {
    houseId?: string;
    status?: 'resolue' | 'non-resolue';
  }): Promise<MaintenanceIssue[]> => {
    let endpoint = '/maintenanceIssues';
    const params = new URLSearchParams();
    
    if (filters?.houseId) params.append('maison', filters.houseId);
    if (filters?.status) params.append('statut', filters.status);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return api.get<MaintenanceIssue[]>(endpoint);
  },

  // Get a specific maintenance issue
  getMaintenanceIssue: async (id: string): Promise<MaintenanceIssue> => {
    return api.get<MaintenanceIssue>(`/maintenanceIssues/${id}`);
  },

  // Get all maintenance types
  getMaintenanceTypes: async (): Promise<MaintenanceType[]> => {
    return api.get<MaintenanceType[]>('/maintenanceTypes');
  },

  // Create a new maintenance issue
  createMaintenanceIssue: async (issue: CreateMaintenanceIssue): Promise<MaintenanceIssue> => {
    return api.post<MaintenanceIssue>('/maintenanceIssues', issue);
  },

  // Update a maintenance issue
  updateMaintenanceIssue: async (id: string, updates: Partial<CreateMaintenanceIssue>): Promise<MaintenanceIssue> => {
    return api.put<MaintenanceIssue>(`/maintenanceIssues/${id}`, updates);
  },

  // Delete a maintenance issue
  deleteMaintenanceIssue: async (id: string): Promise<void> => {
    return api.delete<void>(`/maintenanceIssues/${id}`);
  },

  // Mark issue as resolved
  resolveIssue: async (id: string, laborCost?: number, invoicePhoto?: string): Promise<MaintenanceIssue> => {
    const updates: Partial<CreateMaintenanceIssue> = {
      statut: 'resolue',
    };
    
    if (laborCost !== undefined) {
      updates.prixMainOeuvre = laborCost;
    }
    
    if (invoicePhoto) {
      updates.photoFacture = invoicePhoto;
    }
    
    return maintenanceService.updateMaintenanceIssue(id, updates);
  },

  // Get maintenance statistics
  getMaintenanceStats: async (houseId?: string) => {
    const issues = await maintenanceService.getMaintenanceIssues({ houseId });
    
    const stats = issues.reduce(
      (acc, issue) => {
        if (issue.statut === 'resolue') {
          acc.resolved++;
          if (issue.prixMainOeuvre) {
            acc.totalCost += issue.prixMainOeuvre;
          }
        } else {
          acc.pending++;
        }
        
        // Count by type
        acc.byType[issue.typePanne] = (acc.byType[issue.typePanne] || 0) + 1;
        
        return acc;
      },
      {
        total: issues.length,
        resolved: 0,
        pending: 0,
        totalCost: 0,
        byType: {} as Record<string, number>
      }
    );

    return stats;
  }
};