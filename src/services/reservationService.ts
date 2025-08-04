import { api } from './api';
import type { Reservation, CreateReservation, UpdateReservation } from '../types/api';

export const reservationService = {
  // Get all reservations with optional house filter
  getReservations: async (houseId?: string): Promise<Reservation[]> => {
    const endpoint = houseId 
      ? `/api/v1/reservations?maison=${houseId}` 
      : '/api/v1/reservations';
    return api.get<Reservation[]>(endpoint);
  },

  // Get a specific reservation by ID
  getReservation: async (id: string): Promise<Reservation> => {
    return api.get<Reservation>(`/api/v1/reservations/${id}`);
  },

  // Create a new reservation
  createReservation: async (reservation: CreateReservation): Promise<Reservation> => {
    return api.post<Reservation>('/api/v1/reservations', reservation);
  },

  // Update an existing reservation
  updateReservation: async (id: string, updates: UpdateReservation): Promise<Reservation> => {
    return api.put<Reservation>(`/api/v1/reservations/${id}`, updates);
  },

  // Delete a reservation
  deleteReservation: async (id: string): Promise<void> => {
    return api.delete<void>(`/api/v1/reservations/${id}`);
  },

  // Check for date conflicts (useful for validation)
  checkDateConflicts: async (
    houseId: string, 
    checkin: string, 
    checkout: string, 
    excludeId?: string
  ): Promise<boolean> => {
    const reservations = await reservationService.getReservations(houseId);
    
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    
    return reservations.some(reservation => {
      if (excludeId && reservation.id === excludeId) return false;
      
      const existingCheckin = new Date(reservation.checkin);
      const existingCheckout = new Date(reservation.checkout);
      
      // Check if dates overlap
      return (
        (checkinDate >= existingCheckin && checkinDate < existingCheckout) ||
        (checkoutDate > existingCheckin && checkoutDate <= existingCheckout) ||
        (checkinDate <= existingCheckin && checkoutDate >= existingCheckout)
      );
    });
  },

  // Find reservation by client name, date, and house (for auto-fill during check-in)
  findReservationForCheckin: async (
    clientName: string,
    checkinDate: string,
    houseId: string
  ): Promise<Reservation | null> => {
    const reservations = await reservationService.getReservations(houseId);
    
    const found = reservations.find(reservation => 
      reservation.nom.toLowerCase().includes(clientName.toLowerCase()) &&
      reservation.checkin === checkinDate &&
      reservation.maison === houseId
    );
    
    return found || null;
  }
};