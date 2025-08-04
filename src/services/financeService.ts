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
    let endpoint = '/api/v1/finance';
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
    return api.get<FinancialOperation>(`/api/v1/finance/${id}`);
  },

  // Create a new financial operation
  createFinancialOperation: async (operation: CreateFinancialOperation): Promise<FinancialOperation> => {
    return api.post<FinancialOperation>('/api/v1/finance', operation);
  },

  // Update a financial operation (only if editable)
  updateFinancialOperation: async (id: string, updates: Partial<CreateFinancialOperation>): Promise<FinancialOperation> => {
    return api.put<FinancialOperation>(`/api/v1/finance/${id}`, updates);
  },

  // Delete a financial operation
  deleteFinancialOperation: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/v1/finance/${id}`);
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
  },

  // Auto-generate transaction from reservation (advance payment)
  createReservationTransaction: async (reservation: {
    id: string;
    nom: string;
    checkin: string;
    montantAvance: number;
    maison: string;
  }): Promise<FinancialOperation> => {
    const transaction: CreateFinancialOperation = {
      date: reservation.checkin,
      maison: reservation.maison,
      type: 'entree',
      motif: `Avance réservation - ${reservation.nom}`,
      montant: reservation.montantAvance,
      origine: 'reservation',
      reservationId: reservation.id, // Add foreign key reference
      editable: false
    };

    return financeService.createFinancialOperation(transaction);
  },

  // Auto-generate transaction from check-in (full accommodation payment)
  createCheckinTransaction: async (checkin: {
    id: string;
    nom: string;
    dateArrivee: string;
    montantTotal: number;
    maison: string;
  }): Promise<FinancialOperation> => {
    const transaction: CreateFinancialOperation = {
      date: checkin.dateArrivee,
      maison: checkin.maison,
      type: 'entree',
      motif: `Paiement accommodation - ${checkin.nom}`,
      montant: checkin.montantTotal,
      origine: 'checkin',
      checkinId: checkin.id, // Add foreign key reference
      editable: false
    };

    return financeService.createFinancialOperation(transaction);
  },

  // Auto-generate transaction from maintenance (expense)
  createMaintenanceTransaction: async (maintenance: {
    id: string;
    assigne: string;
    dateDeclaration: string;
    prixMainOeuvre: number;
    maison: string;
    typePanne: string;
    photoFacture?: string;
  }): Promise<FinancialOperation> => {
    const transaction: CreateFinancialOperation = {
      date: maintenance.dateDeclaration,
      maison: maintenance.maison,
      type: 'sortie',
      motif: `Réparation ${maintenance.typePanne} - ${maintenance.assigne}`,
      montant: maintenance.prixMainOeuvre,
      origine: 'maintenance',
      maintenanceId: maintenance.id, // Add foreign key reference
      pieceJointe: maintenance.photoFacture,
      editable: false
    };

    return financeService.createFinancialOperation(transaction);
  },

  // Check if transaction already exists to avoid duplicates
  checkTransactionExists: async (filters: {
    origine: string;
    motif: string;
    maison: string;
    date: string;
  }): Promise<boolean> => {
    const operations = await financeService.getFinancialOperations({
      houseId: filters.maison,
      origine: filters.origine
    });

    return operations.some(op => 
      op.motif === filters.motif && 
      op.date === filters.date
    );
  },

  // Update reservation transaction when reservation is modified
  updateReservationTransaction: async (reservation: {
    id: string;
    nom: string;
    checkin: string;
    montantAvance: number;
    maison: string;
  }): Promise<void> => {
    console.log('🟡 Updating financial transaction for reservation:', reservation.id);
    
    // Get all financial operations to find the one related to this reservation
    const allOperations = await financeService.getFinancialOperations();
    
    // Find the transaction with reservationId matching this reservation
    const existingTransaction = allOperations.find(op => 
      op.reservationId === reservation.id && op.origine === 'reservation'
    );
    
    if (existingTransaction) {
      console.log('🟡 Found existing transaction:', existingTransaction.id);
      
      // Update the transaction with new values
      const updatedTransaction = {
        date: reservation.checkin,
        maison: reservation.maison,
        motif: `Avance réservation - ${reservation.nom}`,
        montant: reservation.montantAvance,
      };
      
      await financeService.updateFinancialOperation(existingTransaction.id, updatedTransaction);
      console.log('✅ Updated financial transaction:', existingTransaction.id);
    } else {
      console.log('⚠️  No existing transaction found for reservation:', reservation.id);
      // If no transaction exists, create one
      await financeService.createReservationTransaction(reservation);
    }
  },

  // Delete reservation transaction when reservation is deleted
  deleteReservationTransaction: async (reservationId: string): Promise<void> => {
    console.log('🟡 Deleting financial transaction for reservation:', reservationId);
    
    // Get all financial operations to find the one related to this reservation
    const allOperations = await financeService.getFinancialOperations();
    
    // Find the transaction with reservationId matching this reservation
    const existingTransaction = allOperations.find(op => 
      op.reservationId === reservationId && op.origine === 'reservation'
    );
    
    if (existingTransaction) {
      console.log('🟡 Found transaction to delete:', existingTransaction.id);
      await financeService.deleteFinancialOperation(existingTransaction.id);
      console.log('✅ Deleted financial transaction:', existingTransaction.id);
    } else {
      console.log('⚠️  No transaction found to delete for reservation:', reservationId);
    }
  },

  // Delete checkin transaction when checkin is deleted  
  deleteCheckinTransaction: async (checkinId: string): Promise<void> => {
    console.log('🟡 Deleting financial transaction for checkin:', checkinId);
    
    const allOperations = await financeService.getFinancialOperations();
    const existingTransaction = allOperations.find(op => 
      op.checkinId === checkinId && op.origine === 'checkin'
    );
    
    if (existingTransaction) {
      console.log('🟡 Found checkin transaction to delete:', existingTransaction.id);
      await financeService.deleteFinancialOperation(existingTransaction.id);
      console.log('✅ Deleted checkin financial transaction:', existingTransaction.id);
    }
  },

  // Delete maintenance transaction when maintenance is deleted
  deleteMaintenanceTransaction: async (maintenanceId: string): Promise<void> => {
    console.log('🟡 Deleting financial transaction for maintenance:', maintenanceId);
    
    const allOperations = await financeService.getFinancialOperations();
    const existingTransaction = allOperations.find(op => 
      op.maintenanceId === maintenanceId && op.origine === 'maintenance'
    );
    
    if (existingTransaction) {
      console.log('🟡 Found maintenance transaction to delete:', existingTransaction.id);
      await financeService.deleteFinancialOperation(existingTransaction.id);
      console.log('✅ Deleted maintenance financial transaction:', existingTransaction.id);
    }
  }
};