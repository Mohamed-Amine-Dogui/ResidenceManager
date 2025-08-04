import { api } from './api';
import type { CheckInData, CreateCheckIn, InventaireType } from '../types/api';

export const checkinService = {
  // Get check-in records with optional house filter
  getCheckins: async (houseId?: string): Promise<CheckInData[]> => {
    const endpoint = houseId 
      ? `/api/v1/checkins?maison=${houseId}` 
      : '/api/v1/checkins';
    return api.get<CheckInData[]>(endpoint);
  },

  // Get a specific check-in record
  getCheckin: async (id: string): Promise<CheckInData> => {
    return api.get<CheckInData>(`/api/v1/checkins/${id}`);
  },

  // Create a new check-in record
  createCheckin: async (checkin: CreateCheckIn): Promise<CheckInData> => {
    return api.post<CheckInData>('/api/v1/checkins', checkin);
  },

  // Update check-in record (for check-out process)
  updateCheckin: async (id: string, updates: Partial<CreateCheckIn>): Promise<CheckInData> => {
    return api.put<CheckInData>(`/api/v1/checkins/${id}`, updates);
  },

  // Process check-out (update inventory and remarks)
  processCheckout: async (id: string, inventory: InventaireType, remarks?: string): Promise<CheckInData> => {
    return api.put<CheckInData>(`/api/v1/checkins/${id}`, {
      inventaire: inventory,
      remarques: remarks
    });
  },

  // Delete check-in record
  deleteCheckin: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/v1/checkins/${id}`);
  },

  // Get current active check-ins for a house
  getActiveCheckinsForHouse: async (houseId: string): Promise<CheckInData[]> => {
    const checkins = await checkinService.getCheckins(houseId);
    const today = new Date().toISOString().split('T')[0];
    
    return checkins.filter(checkin => {
      const arrivalDate = new Date(checkin.dateArrivee);
      const departureDate = new Date(checkin.dateDepart);
      const todayDate = new Date(today);
      
      return arrivalDate <= todayDate && departureDate >= todayDate;
    });
  },

  // Check if house is currently occupied
  isHouseOccupied: async (houseId: string): Promise<boolean> => {
    const activeCheckins = await checkinService.getActiveCheckinsForHouse(houseId);
    return activeCheckins.length > 0;
  },

  // Get default inventory template for a house
  getDefaultInventory: (): InventaireType => {
    return {
      litsSimples: 0,
      litsDoubles: 0,
      matelasSupplementaires: 0,
      oreillers: 0,
      tables: 0,
      chaises: 0,
      drapsPropres: 0,
      drapsHousse: 0,
      couvertures: 0,
      television: false,
      telecommandeTv: false,
      climatiseur: false,
      telecommandeClimatiseur: false,
      recepteurTv: false,
      telecommandeRecepteur: false,
      assiettes: 0,
      verres: 0,
      couverts: 0,
      casseroles: 0,
      poeles: 0,
      refrigerateur: false,
      rideaux: false,
      lampes: false,
      balaiSerpilliere: false
    };
  },

  // Compare inventories and find differences
  compareInventories: (initial: InventaireType, final: InventaireType) => {
    const differences: Array<{
      item: string;
      initial: number | boolean;
      final: number | boolean;
      difference?: number;
    }> = [];

    Object.entries(initial).forEach(([key, initialValue]) => {
      const finalValue = final[key as keyof InventaireType];
      
      if (initialValue !== finalValue) {
        const diff: any = {
          item: key,
          initial: initialValue,
          final: finalValue
        };
        
        if (typeof initialValue === 'number' && typeof finalValue === 'number') {
          diff.difference = finalValue - initialValue;
        }
        
        differences.push(diff);
      }
    });

    return differences;
  }
};