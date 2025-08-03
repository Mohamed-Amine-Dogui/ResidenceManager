// API Type Definitions - matches backend schemas

export interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  checkin: string; // YYYY-MM-DD format
  checkout: string; // YYYY-MM-DD format
  montantAvance: number;
  maison: string;
}

export interface FinancialOperation {
  id: string;
  date: string; // YYYY-MM-DD format
  maison: string;
  type: "entree" | "sortie";
  motif: string;
  montant: number;
  origine: "reservation" | "maintenance" | "checkin" | "manuel";
  pieceJointe?: string;
  editable: boolean;
}

export interface MaintenanceIssue {
  id: string;
  maison: string;
  typePanne: string;
  dateDeclaration: string; // YYYY-MM-DD format
  assigne: string;
  commentaire: string;
  statut: "resolue" | "non-resolue";
  photoPanne?: string;
  photoFacture?: string;
  prixMainOeuvre?: number;
}

export interface MaintenanceType {
  id: string;
  name: string;
}

export interface InventaireType {
  litsSimples: number;
  litsDoubles: number;
  matelasSupplementaires: number;
  oreillers: number;
  tables: number;
  chaises: number;
  drapsPropres: number;
  drapsHousse: number;
  couvertures: number;
  television: boolean;
  telecommandeTv: boolean;
  climatiseur: boolean;
  telecommandeClimatiseur: boolean;
  recepteurTv: boolean;
  telecommandeRecepteur: boolean;
  assiettes: number;
  verres: number;
  couverts: number;
  casseroles: number;
  poeles: number;
  refrigerateur: boolean;
  rideaux: boolean;
  lampes: boolean;
  balaiSerpilliere: boolean;
}

export interface CheckInData {
  id: string;
  maison: string;
  nom: string;
  telephone: string;
  email: string;
  dateArrivee: string; // YYYY-MM-DD format
  dateDepart: string; // YYYY-MM-DD format
  avancePaye: number;
  paiementCheckin: number;
  montantTotal: number;
  inventaire: InventaireType;
  responsable: string;
  remarques: string;
}

export interface ChecklistEntry {
  id: string;
  maison: string;
  etape: number;
  categorie: string;
  description: string;
  produitAUtiliser: string;
  type: string;
}

export interface ChecklistStatus {
  id: string;
  maison: string;
  checklistItemId: string;
  completed: boolean;
  completedAt?: string;
  updatedBy?: string;
}

export interface CategoryStatus {
  id: string;
  maison: string;
  categoryId: number;
  isReady: boolean;
  readyAt?: string;
}

export interface DashboardMetrics {
  checkinToday: number;
  checkoutToday: number;
  maintenancesTodo: number;
  housesReady: number;
  paymentsCompleted: number;
  paymentsOpen: number;
  advancePayments: number;
}

export interface OccupancyData {
  occupied: number;
  free: number;
}

export interface RevenueDataPoint {
  jour: string; // YYYY-MM-DD format
  revenus: number;
}

export interface House {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
}

// Form interfaces for creating/updating data
export interface CreateReservation {
  nom: string;
  telephone: string;
  email: string;
  checkin: string;
  checkout: string;
  montantAvance: number;
  maison: string;
}

export interface UpdateReservation {
  nom?: string;
  telephone?: string;
  email?: string;
  checkin?: string;
  checkout?: string;
  montantAvance?: number;
}

export interface CreateFinancialOperation {
  date: string;
  maison: string;
  type: "entree" | "sortie";
  motif: string;
  montant: number;
  origine: "reservation" | "maintenance" | "checkin" | "manuel";
  pieceJointe?: string;
  editable?: boolean;
}

export interface CreateMaintenanceIssue {
  maison: string;
  typePanne: string;
  dateDeclaration: string;
  assigne: string;
  commentaire: string;
  statut?: "resolue" | "non-resolue";
  photoPanne?: string;
  photoFacture?: string;
  prixMainOeuvre?: number;
}

export interface CreateCheckIn {
  maison: string;
  nom: string;
  telephone: string;
  email: string;
  dateArrivee: string;
  dateDepart: string;
  avancePaye: number;
  paiementCheckin: number;
  montantTotal: number;
  inventaire: InventaireType;
  responsable: string;
  remarques?: string;
}