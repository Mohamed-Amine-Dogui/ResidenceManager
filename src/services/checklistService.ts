import { api } from './api';
import type { ChecklistEntry, ChecklistStatus, CategoryStatus } from '../types/api';

export const checklistService = {
  // Get checklist items with optional house filter
  getChecklistItems: async (houseId?: string): Promise<ChecklistEntry[]> => {
    const endpoint = houseId 
      ? `/checklistItems?maison=${houseId}` 
      : '/checklistItems';
    return api.get<ChecklistEntry[]>(endpoint);
  },

  // Get a specific checklist item
  getChecklistItem: async (id: string): Promise<ChecklistEntry> => {
    return api.get<ChecklistEntry>(`/checklistItems/${id}`);
  },

  // Create a new checklist item
  createChecklistItem: async (item: Omit<ChecklistEntry, 'id'>): Promise<ChecklistEntry> => {
    return api.post<ChecklistEntry>('/checklistItems', item);
  },

  // Update a checklist item
  updateChecklistItem: async (id: string, updates: Partial<Omit<ChecklistEntry, 'id'>>): Promise<ChecklistEntry> => {
    return api.put<ChecklistEntry>(`/checklistItems/${id}`, updates);
  },

  // Delete a checklist item
  deleteChecklistItem: async (id: string): Promise<void> => {
    return api.delete<void>(`/checklistItems/${id}`);
  },

  // Get checklist status for a house
  getHouseChecklistStatus: async (houseId: string): Promise<ChecklistStatus[]> => {
    return api.get<ChecklistStatus[]>(`/houseChecklistStatus?maison=${houseId}`);
  },

  // Update task completion status
  updateTaskCompletion: async (taskId: string, completed: boolean): Promise<ChecklistStatus> => {
    // Find the status record for this task
    const statuses = await api.get<ChecklistStatus[]>(`/houseChecklistStatus?checklistItemId=${taskId}`);
    const status = statuses[0];
    
    if (status) {
      // Update existing status
      return api.put<ChecklistStatus>(`/houseChecklistStatus/${status.id}`, {
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
    } else {
      // Create new status record
      return api.post<ChecklistStatus>('/houseChecklistStatus', {
        checklistItemId: taskId,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      });
    }
  },

  // Get category status for a house
  getHouseCategoryStatus: async (houseId: string): Promise<CategoryStatus[]> => {
    return api.get<CategoryStatus[]>(`/houseCategoryStatus?maison=${houseId}`);
  },

  // Update category completion status
  updateCategoryCompletion: async (houseId: string, categoryId: number, isReady: boolean): Promise<CategoryStatus> => {
    // Find the status record for this category
    const statuses = await api.get<CategoryStatus[]>(`/houseCategoryStatus?maison=${houseId}&categoryId=${categoryId}`);
    const status = statuses[0];
    
    if (status) {
      // Update existing status
      return api.put<CategoryStatus>(`/houseCategoryStatus/${status.id}`, {
        isReady,
        readyAt: isReady ? new Date().toISOString() : null
      });
    } else {
      // Create new status record
      return api.post<CategoryStatus>('/houseCategoryStatus', {
        maison: houseId,
        categoryId,
        isReady,
        readyAt: isReady ? new Date().toISOString() : null
      });
    }
  },

  // Get checklist progress for a house
  getChecklistProgress: async (houseId: string) => {
    const [items, statuses] = await Promise.all([
      checklistService.getChecklistItems(houseId),
      checklistService.getHouseChecklistStatus(houseId)
    ]);

    const statusMap = new Map(statuses.map(s => [s.checklistItemId, s.completed]));
    
    const progress = items.map(item => ({
      ...item,
      completed: statusMap.get(item.id) || false
    }));

    // Group by category
    const byCategory = progress.reduce((acc, item) => {
      if (!acc[item.categorie]) {
        acc[item.categorie] = [];
      }
      acc[item.categorie].push(item);
      return acc;
    }, {} as Record<string, typeof progress>);

    // Calculate completion stats
    const totalTasks = progress.length;
    const completedTasks = progress.filter(item => item.completed).length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      items: progress,
      byCategory,
      stats: {
        total: totalTasks,
        completed: completedTasks,
        remaining: totalTasks - completedTasks,
        percentage: Math.round(completionPercentage)
      }
    };
  },

  // Get categories list
  getCategories: async (): Promise<Array<{ id: number; name: string }>> => {
    return api.get<Array<{ id: number; name: string }>>('/checklistCategories');
  },

  // Mark all tasks in a category as complete
  completeCategory: async (houseId: string, categoryName: string): Promise<void> => {
    const items = await checklistService.getChecklistItems(houseId);
    const categoryItems = items.filter(item => item.categorie === categoryName);
    
    // Mark all tasks in category as complete
    await Promise.all(categoryItems.map(item => 
      checklistService.updateTaskCompletion(item.id, true)
    ));
  }
};