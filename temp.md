#  ResidenceManager

**ResidenceManager** is a comprehensive web application designed to manage residential properties with a booking.com-like experience. The platform serves two main user types: **Property Owners** who manage their apartments and **Guests** who can browse and book available accommodations. It offers complete functionality for property listing, booking, check-in/check-out, maintenance tracking, financial operations, and real-time analytics.

##  Features

### 🏠 **Property Management System (Booking.com-like)**
- **Public Property Listings**: Browse available apartments with photos, amenities, and pricing
- **Advanced Search & Filtering**: Filter by dates, price range, amenities, and location
- **Real-time Availability**: Dynamic calendar showing available/booked dates
- **Property Details**: Comprehensive apartment information with photo galleries
- **Guest Reviews & Ratings**: Review system for property feedback
- **Instant Booking**: Direct booking with secure payment processing

### 👥 **Multi-User System**
- **Guest Users**: Browse properties, make bookings, contact owners
- **Property Owners**: Manage their own apartments as admins
- **Super Admin**: Overall system management and oversight
- **Authentication**: Secure login with email/password, Google, and Facebook OAuth

### 📅 **Advanced Reservation Management**
- **Smart Calendar**: Visual availability calendar with booking conflicts prevention
- **Booking Workflow**: Reservation → Check-in → Payment → Check-out flow
- **Guest Communication**: Integrated messaging between guests and owners
- **Booking Modifications**: Easy date changes and cancellation management
- **Payment Tracking**: Advance payments and remaining balance management

### 🏨 **Property Owner Dashboard**
- **Property Portfolio**: Manage multiple apartments from one dashboard
- **Booking Management**: View, approve, and manage all bookings
- **Revenue Analytics**: Detailed financial reports and occupancy statistics
- **Guest Communication**: Direct messaging with guests
- **Property Settings**: Pricing, availability, and amenities management

### 🔧 **Operational Management**
- **Check-in/Check-out System**: Digital guest management with inventory tracking
- **Maintenance Tracking**: Issue reporting, assignment, and resolution tracking
- **Financial Operations**: Automated transaction recording and manual expense tracking
- **Quality Control**: House readiness checklists and category-based status tracking

### 📊 **Analytics & Reporting**
- **Real-time Dashboard**: Date-based analytics with occupancy charts and revenue tracking
- **Owner Analytics**: Property performance, booking trends, and revenue insights
- **Guest Analytics**: Booking history and preferences
- **Financial Reports**: Comprehensive income and expense tracking

### 🎨 **User Experience**
- **Dark/Light Mode**: Full theme support throughout the application
- **Responsive Design**: Mobile-first design optimized for all devices
- **Multi-language Support**: Currently French, expandable to other languages
- **Modern UI**: Clean, intuitive interface with smooth animations

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
  role: 'guest' | 'owner' | 'admin'; // Updated roles for booking.com-like system
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_picture?: string;
  created_at: string;
  last_login: string;
}

// OAuth providers for social login
interface AuthProvider {
  id: string;
  provider_name: 'email' | 'google' | 'facebook';
  description: string;
}

interface UserProvider {
  id: string;
  user_id: string;
  provider_id: string;
  external_id: string;
  linked_at: string;
}
```

#### **Properties & Ownership**
```typescript
interface House {
  id: string; // e.g., 'maison-1'
  name: string; // e.g., 'Mv1'
  owner_id: string; // FK to users table
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  base_price_per_night: number;
  cleaning_fee?: number;
  security_deposit?: number;
  amenities: string[]; // JSON array of amenities
  house_rules?: string;
  check_in_time?: string; // e.g., "15:00"
  check_out_time?: string; // e.g., "11:00"
  minimum_stay?: number; // minimum nights
  maximum_stay?: number; // maximum nights
  is_active: boolean; // Property is available for booking
  created_at: string;
  updated_at: string;
}

interface PropertyPhoto {
  id: string;
  house_id: string; // FK to houses
  photo_url: string;
  caption?: string;
  is_primary: boolean; // Main photo for listings
  order_index: number;
  uploaded_at: string;
}

interface PropertyAmenity {
  id: string;
  name: string; // e.g., "WiFi", "Air Conditioning", "Kitchen"
  icon?: string; // Icon name or URL
  category: 'basic' | 'safety' | 'entertainment' | 'kitchen' | 'outdoor';
}
```

#### **Pricing & Availability**
```typescript
interface PropertyPricing {
  id: string;
  house_id: string; // FK to houses
  date: string; // YYYY-MM-DD
  price_per_night: number;
  is_available: boolean;
  minimum_stay?: number; // Override property default
  created_at: string;
}

interface SeasonalPricing {
  id: string;
  house_id: string; // FK to houses
  name: string; // e.g., "Summer Season", "Holiday Period"
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  price_multiplier: number; // e.g., 1.5 for 50% increase
  created_at: string;
}
```

#### **Enhanced Booking System (Booking.com-like)**

**1. Enhanced Reservations → Check-ins → Financial Operations**
```typescript
// Step 1: Enhanced Reservation created (booking.com-like)
interface Reservation {
  id: string;
  house_id: string; // FK to houses
  guest_user_id?: string; // FK to users (if registered user)
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  checkin_date: string; // YYYY-MM-DD
  checkout_date: string; // YYYY-MM-DD
  number_of_guests: number;
  total_nights: number;
  base_price: number; // Price per night
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_amount: number; // All fees included
  advance_payment: number; // Amount paid upfront
  remaining_payment: number; // Amount due at check-in
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  special_requests?: string;
  cancellation_policy: 'flexible' | 'moderate' | 'strict';
  created_at: string;
  updated_at: string;
}

// Guest Reviews & Ratings System
interface PropertyReview {
  id: string;
  house_id: string; // FK to houses
  guest_user_id: string; // FK to users
  reservation_id: string; // FK to reservations
  overall_rating: number; // 1-5 stars
  cleanliness_rating: number;
  accuracy_rating: number;
  communication_rating: number;
  location_rating: number;
  value_rating: number;
  review_text?: string;
  pros?: string[];
  cons?: string[];
  would_recommend: boolean;
  created_at: string;
  updated_at: string;
}

interface ReviewResponse {
  id: string;
  review_id: string; // FK to property_reviews
  owner_user_id: string; // FK to users (property owner)
  response_text: string;
  created_at: string;
}

// Messaging System between Guests and Owners
interface Conversation {
  id: string;
  house_id: string; // FK to houses
  guest_user_id: string; // FK to users
  owner_user_id: string; // FK to users
  reservation_id?: string; // FK to reservations (if related to booking)
  subject?: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string; // FK to conversations
  sender_user_id: string; // FK to users
  message_text: string;
  message_type: 'text' | 'image' | 'document';
  attachment_url?: string;
  is_read: boolean;
  sent_at: string;
}

// Wishlist/Favorites System
interface UserWishlist {
  id: string;
  user_id: string; // FK to users
  house_id: string; // FK to houses
  added_at: string;
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

### 1. **Enhanced Booking.com-like Flow**
```
🏠 Property Listing Phase:
1. Owner registers → Creates user account with 'owner' role
2. Owner adds property → Creates house record with photos, amenities, pricing
3. Owner sets availability → Creates property_pricing records for available dates
4. Property goes live → Visible in public listings

👤 Guest Booking Phase:
1. Guest searches properties → Filters by dates, location, price, amenities
2. Guest views property details → Shows photos, reviews, amenities, pricing breakdown
3. Guest makes reservation → Creates reservation with booking_status='pending'
4. Payment processing → Updates payment_status and booking_status='confirmed'
5. Automatic confirmation email → Sent to both guest and owner

💬 Communication Phase:
1. Guest/Owner messaging → Creates conversation and messages
2. Special requests handling → Updates reservation.special_requests
3. Pre-arrival instructions → Automated messages with check-in details

🏨 Check-in/Check-out Phase:
1. Guest arrives → Creates checkin record + remaining payment transaction
2. Inventory check → Records property condition in checkin.inventaire
3. Guest departs → Creates checkout record + inventory comparison
4. Property status → House becomes "not ready" until cleaning completed

⭐ Post-Stay Phase:
1. Review invitation → Automated email to guest after checkout
2. Guest leaves review → Creates property_review record
3. Owner responds → Creates review_response record
4. Rating calculation → Updates property average rating
```

### 2. **Property Owner Dashboard Flow**
```
📊 Owner Analytics:
- Revenue tracking per property
- Booking calendar with occupancy rates
- Guest communication management
- Review management and responses
- Pricing optimization suggestions

🏠 Property Management:
- Multiple property portfolio view
- Individual property settings (pricing, availability, amenities)
- Photo gallery management
- Booking approval/rejection (if manual approval enabled)
- Maintenance issue tracking per property
```

### 3. **Guest User Experience Flow**
```
🔍 Discovery Phase:
- Browse properties without login (guest access)
- Advanced filtering (dates, price, location, amenities, ratings)
- Property comparison and wishlist functionality
- Map view with property locations

📅 Booking Phase:
- Real-time availability checking
- Dynamic pricing display (base price + fees + taxes)
- Secure payment processing
- Booking confirmation and receipt

👤 Account Management:
- Booking history and upcoming trips
- Saved properties (wishlist)
- Communication with property owners
- Review and rating submission
```

### 4. **Maintenance → Financial Impact**
```
1. Issue reported → Creates maintenance record (status: 'non-resolue')
2. Technician fixes → Updates status to 'resolue' + adds cost
3. Cost added → Automatically creates expense transaction
4. Owner notification → Email alert about maintenance completion and cost
```

### 5. **Dashboard Metrics Logic**
```
📊 System-wide Metrics (Admin View):
- Total active properties
- Total registered users (guests vs owners)
- Monthly booking volume and revenue
- Average property ratings
- Most popular amenities and locations

🏠 Owner-specific Metrics:
- Property occupancy rates
- Revenue per property
- Guest satisfaction scores
- Booking conversion rates
- Seasonal performance trends

👤 Guest Analytics:
- Booking history and preferences
- Favorite property types and locations
- Average booking value and frequency
- Review contribution score
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
