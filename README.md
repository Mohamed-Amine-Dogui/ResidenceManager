#  ResidenceManager

**ResidenceManager** is a comprehensive web application designed to manage a residential complex composed of multiple apartments. It offers complete functionality for booking, check-in/check-out, maintenance tracking, financial operations, and real-time dashboard analytics. The app supports both light and dark mode and is fully localized in French.

##  Features

- ** Reservation Management**: Complete booking system with calendar view and availability checking
- ** Check-in/Check-out System**: Guest management with inventory tracking and payment processing
- ** Maintenance Tracking**: Issue reporting, assignment, and resolution tracking
- ** Financial Operations**: Automated transaction recording and manual expense tracking
- ** Real-time Dashboard**: Date-based analytics with occupancy charts and revenue tracking
- ** Quality Control**: House readiness checklists and category-based status tracking
- ** Dark/Light Mode**: Full theme support throughout the application
- ** Responsive Design**: Mobile-first design with modern UI components

##  Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components with Tailwind CSS
- **State Management**: React hooks with optimistic UI updates
- **Routing**: React Router v6 with hash routing
- **Charts**: Recharts for dashboard analytics
- **Notifications**: Sonner for toast notifications
- **Date Handling**: date-fns with French localization

### Backend (JSON Server Mock / Future FastAPI)
- **Current**: JSON Server for rapid prototyping and frontend development
- **Future**: FastAPI with SQLite/PostgreSQL for production
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Data Validation**: TypeScript interfaces ensure type safety
- **File Handling**: Support for image uploads and attachments

##  Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResidenceManager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the mock backend**
   ```bash
   ./start-mock-server.sh
   ```
   This starts the JSON Server on `http://localhost:8000`

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   This starts Vite dev server on `http://localhost:3000`

5. **Open the application**
   Navigate to `http://localhost:3000` in your browser

## 📁 Project Structure

```
ResidenceManager/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ui/             # shadcn/ui components
│   ├── pages/              # Application pages/routes
│   │   ├── DashBoardPage.tsx    # Analytics and metrics
│   │   ├── ReservationPage.tsx  # Booking management
│   │   ├── CheckInOutPage.tsx   # Guest check-in/out
│   │   ├── MaintenancePage.tsx  # Issue tracking
│   │   ├── FinancePage.tsx      # Financial operations
│   │   ├── CheckListePage.tsx   # Quality standards
│   │   └── ControlPage.tsx      # House readiness
│   ├── services/           # API service layer
│   │   ├── api.ts          # Base API client
│   │   ├── dashboardService.ts  # Dashboard data
│   │   ├── reservationService.ts # Booking operations
│   │   ├── checkinService.ts    # Check-in/out operations
│   │   ├── maintenanceService.ts # Maintenance operations
│   │   ├── financeService.ts    # Financial operations
│   │   └── checklistService.ts  # Checklist operations
│   ├── types/              # TypeScript type definitions
│   │   └── api.ts          # API response types
│   └── lib/                # Utility functions
├── backend/
│   └── db.json             # Mock database for development
├── public/                 # Static assets
└── start-mock-server.sh    # Backend startup script
```

##  Database Schema & Relationships

### Core Tables

#### **Users & Authentication**
```typescript
interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: string;
  last_login: string;
}
```

#### **Houses**
```typescript
interface House {
  id: string; // e.g., 'maison-1'
  name: string; // e.g., 'Mv1'
}
```

#### **Business Logic Tables**

**1. Reservations → Check-ins → Financial Operations**
```typescript
// Step 1: Reservation created
interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  checkin: string; // YYYY-MM-DD
  checkout: string;
  montantAvance: number; // Advance payment
  maison: string; // Foreign key to houses
}

// Step 2: Guest arrives - Check-in created
interface CheckIn {
  id: string;
  reservationId: string; // FK to reservation
  maison: string;
  nom: string;
  dateArrivee: string;
  dateDepart: string;
  avancePaye: number; // From reservation
  paiementCheckin: number; // Remaining payment
  montantTotal: number; // avancePaye + paiementCheckin
  inventaire: InventoryType;
  responsable: string;
  remarques: string;
}

// Step 3: Automatic financial transactions
interface FinancialOperation {
  id: string;
  date: string;
  maison: string;
  type: 'entree' | 'sortie';
  motif: string;
  montant: number;
  origine: 'reservation' | 'checkin' | 'maintenance' | 'manuel';
  reservationId?: string; // FK for reservation transactions
  checkinId?: string; // FK for checkin transactions
  maintenanceId?: string; // FK for maintenance expenses
  pieceJointe?: string;
  editable: boolean;
}
```

**2. Maintenance System**
```typescript
interface MaintenanceIssue {
  id: string;
  maison: string;
  typePanne: 'electricite' | 'plomberie' | 'electromenager' | 'peinture' | 'autre';
  dateDeclaration: string;
  assigne: string;
  commentaire: string;
  statut: 'resolue' | 'non-resolue';
  photoPanne?: string;
  photoFacture?: string;
  prixMainOeuvre?: number; // Creates financial transaction when resolved
}
```

**3. Quality Control System**
```typescript
interface ChecklistItem {
  id: string;
  maison: string;
  etape: number;
  categorie: string;
  description: string;
  produitAUtiliser: string;
  type: 'nettoyage' | 'vérification' | 'entretien';
}

interface HouseChecklistStatus {
  id: string;
  maison: string;
  checklistItemId: string;
  completed: boolean;
  completedAt?: string;
  updatedBy?: string;
}
```

**4. Dashboard Analytics**
```typescript
// Pre-calculated metrics (future: calculated by FastAPI)
interface DashboardMetrics {
  date: string;
  checkinToday: number; // Count from checkins table
  checkoutToday: number; // Count from checkins table
  maintenancesTodo: number; // Count unresolved maintenance
  housesReady: number; // Count ready houses
  paymentsCompleted: number; // Count completed payments
  paymentsOpen: number; // Count pending payments
  advancePayments: number; // Count advance payments without checkin
}

interface OccupancyData {
  date: string;
  occupied: number; // Houses with active checkins
  free: number; // Available houses
}

interface RevenueDataPoint {
  jour: string; // YYYY-MM-DD
  revenus: number; // Sum of day's income transactions
}
```

## Business Logic Flow

### 1. **Reservation → Check-in → Payment Flow**
```
1. Guest makes reservation → Creates reservation record + advance payment transaction
2. Guest arrives → Creates checkin record + remaining payment transaction  
3. Guest departs → House status becomes "not ready"
4. Manager completes checklist → House status becomes "ready"
```

### 2. **Maintenance → Financial Impact**
```
1. Issue reported → Creates maintenance record (status: 'non-resolue')
2. Technician fixes → Updates status to 'resolue' + adds cost
3. Cost added → Automatically creates expense transaction
```

### 3. **Dashboard Metrics Logic**
```
- Check-ins Today: Count checkins where dateArrivee = selected_date
- Check-outs Today: Count checkins where dateDepart = selected_date  
- Maintenances: Count maintenance where statut = 'non-resolue'
- Payments Open: Count reservations without corresponding checkin
- Occupancy: Count houses with active checkins on selected_date
```

## 🛠️ Development Workflow

### API Integration Pattern
All pages follow a consistent pattern:
```typescript
// 1. API Service Layer
export const serviceMethod = async (): Promise<DataType> => {
  return api.get<DataType>('/endpoint');
};

// 2. Component Integration  
const [data, setData] = useState<DataType[]>([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  try {
    setLoading(true);
    const result = await serviceMethod();
    setData(result);
  } catch (error) {
    toast.error('Erreur de chargement');
  } finally {
    setLoading(false);
  }
};
```

### Automatic Transaction Generation
Financial transactions are automatically created for:
- **Reservations**: Advance payment transactions
- **Check-ins**: Remaining payment transactions  
- **Maintenance**: Expense transactions when resolved with cost

##  Future Enhancements

### FastAPI Backend Migration
When moving from JSON Server to FastAPI:

1. **Calculated Metrics**: Dashboard metrics will be calculated in real-time
```python
@app.get("/dashboard/metrics")
async def get_dashboard_metrics(date: str):
    checkins_today = count_checkins_by_date(date)
    checkouts_today = count_checkouts_by_date(date)
    # ... other calculations
    return DashboardMetrics(...)
```

2. **Database Relationships**: Proper foreign keys and joins
3. **Advanced Analytics**: Complex queries for reporting
4. **File Upload with AWS S3**: Secure cloud storage for maintenance photos/invoices
5. **Authentication**: JWT-based auth system
6. **WebSocket**: Real-time updates for dashboard metrics

### AWS S3 File Storage Implementation
When migrating to FastAPI backend, file uploads (maintenance photos and invoices) will be implemented using AWS S3:

#### Requirements:
- **AWS SDK**: Use `boto3` library for Python S3 integration
- **Environment Variables**: Store AWS credentials securely
  ```bash
  AWS_ACCESS_KEY_ID=your_access_key
  AWS_SECRET_ACCESS_KEY=your_secret_key
  AWS_REGION=your_region
  S3_BUCKET_NAME=residence-manager-files
  ```
- **Security**: Credentials must be stored in secure environment variables, never in code
- **File Organization**: 
  ```
  s3://residence-manager-files/
  ├── maintenance-photos/
  │   ├── {maintenance_id}/
  │   │   ├── photo_panne.jpg
  │   │   └── photo_facture.pdf
  └── other-uploads/
  ```

#### Implementation Notes:
- Current frontend already handles file selection and displays filenames
- Backend integration needed to actually upload files to S3 and store URLs in database
- Consider file size limits and supported formats (images: jpg, png; documents: pdf)
- Implement proper error handling for upload failures
- Add file deletion when maintenance records are deleted

### Additional Features
- **Email Notifications**: Automated guest communications
- **Calendar Integration**: Sync with external calendars
- **Mobile App**: React Native companion app
- **Advanced Reporting**: PDF generation for financial reports
- **Multi-language**: Support for additional languages

##  Current Data Examples

### Sample Realistic Data Flow (August 1, 2025):
```
1. Jean Dupont reservation (July 28) → €300 advance payment
2. Sophie Laurent reservation (July 30) → €200 advance payment  
3. August 1: Both guests check in → €400 + €300 remaining payments
4. August 4: Maintenance issue in Mv2 → €150 repair cost
5. Dashboard shows: 2 check-ins, €700 revenue, 2/12 houses occupied
```
