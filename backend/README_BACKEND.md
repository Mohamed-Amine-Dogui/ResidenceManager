# ResidenceManager FastAPI Backend

**Complete FastAPI backend implementation for ResidenceManager**

This backend provides all the API endpoints needed by your React frontend, with automatic data migration from your existing JSON server data.

## Features

- **Complete API Coverage**: All endpoints match your frontend exactly
- **Automatic Data Migration**: Imports all your existing data from db.json
- **Field Name Compatibility**: Perfect match with your frontend (maison, nom, montantAvance, etc.)
- **Transaction Synchronization**: Automatic financial transaction generation and sync
- **Real-time Dashboard**: Calculated metrics instead of static data
- **Comprehensive Documentation**: Every endpoint and function documented
- **Type Safety**: Full TypeScript-style type checking with Pydantic
- **Performance Optimized**: Efficient database queries and minimal complexity

##  Architecture

### Database Schema
- **SQLite**: Lightweight database perfect for development and small deployments
- **SQLAlchemy ORM**: Type-safe database operations
- **Alembic**: Database migrations for schema changes

### API Endpoints

#### Reservations (`/api/v1/reservations`)
- `GET /` - List reservations with house filtering
- `GET /{id}` - Get specific reservation
- `POST /` - Create reservation + automatic finance transaction
- `PUT /{id}` - Update reservation + sync finance transaction
- `DELETE /{id}` - Delete reservation + cleanup transactions

#### Maintenance (`/api/v1/maintenance`)
- `GET /` - List maintenance issues with filtering
- `GET /types` - Get maintenance types
- `POST /` - Create maintenance issue
- `PUT /{id}` - Update issue + auto-generate expense if resolved
- `DELETE /{id}` - Delete issue + cleanup transactions

#### Finance (`/api/v1/finance`)
- `GET /` - List financial operations with filtering
- `POST /` - Create manual financial operation
- `PUT /{id}` - Update editable operations only
- `GET /summary/{house_id}` - Financial summary
- `GET /revenue/monthly` - Monthly revenue data for charts

#### Check-ins (`/api/v1/checkins`)
- `GET /` - List check-ins
- `POST /` - Create check-in + auto-generate accommodation payment
- `PUT /{id}` - Update check-in + sync payment
- `POST /{id}/checkout` - Process guest departure

#### Checklist (`/api/v1/checklist`)
- `GET /items` - Get checklist items by house/category
- `GET /status/{house_id}` - Get completion status
- `POST /status/{house_id}/complete` - Mark tasks complete
- `GET /readiness/{house_id}` - Overall house readiness

#### Dashboard (`/api/v1/dashboard`)
- `GET /metrics` - Real-time calculated metrics
- `GET /occupancy` - Current occupancy data
- `GET /revenue` - Revenue chart data
- `GET /` - Complete dashboard (all data in one call)

##  Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server (with automatic migration)
```bash
python start_server.py
```

This will:
-  Migrate all data from `db.json` to SQLite
-  Start FastAPI server on `http://localhost:8000`
-  Enable auto-reload for development

### 3. Alternative: Manual Setup
```bash
# Run migration only
python migrate_data.py

# Start server only
python start_server.py --skip-migration

# Custom port
python start_server.py --port 3001
```

### 4. API Documentation
Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

##  Data Migration

The migration script (`migrate_data.py`) handles:

###  Migrated Data
- **Users**: Admin accounts and authentication data
- **Houses**: All 12 houses (Mv1-Mv10, Bg, High)
- **Reservations**: All existing reservations with proper date parsing
- **Check-ins**: Guest arrivals with inventory data
- **Financial Operations**: All transactions with foreign key relationships
- **Maintenance Issues**: Current and resolved issues
- **Checklist Items**: All cleaning/verification tasks from your image
- **Status Tracking**: Completion status for tasks and categories

###  Automatic Relationships
- Reservations → Financial transactions (advance payments)
- Check-ins → Financial transactions (accommodation payments)
- Maintenance → Financial transactions (repair costs)
- Foreign keys for transaction synchronization

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```bash
# Database
DATABASE_URL=sqlite:///./residence_manager.db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production

# CORS (for frontend)
ALLOWED_HOSTS=["http://localhost:3000", "http://localhost:5173"]

# AWS S3 (for future file uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
S3_BUCKET_NAME=residence-manager-files
```

### Frontend Integration
Update your frontend's API base URL to:
```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';
```

##  Key Differences from JSON Server

###  Improvements
1. **Real-time Calculations**: Dashboard metrics calculated on-demand
2. **Data Validation**: Pydantic schemas ensure data integrity
3. **Transaction Safety**: Database transactions prevent data corruption
4. **Performance**: Optimized queries and proper indexing
5. **Documentation**: Auto-generated API docs
6. **Type Safety**: Full type checking on all endpoints

###  Compatibility
- **Field Names**: Exactly match frontend (no changes needed)
- **Date Formats**: Same YYYY-MM-DD string format
- **Response Structure**: Identical to JSON server responses
- **Error Handling**: Proper HTTP status codes and error messages

##  Testing

### Manual Testing
1. Start the server: `python start_server.py`
2. Test with curl:
```bash
# Get all reservations
curl http://localhost:8000/api/v1/reservations

# Get dashboard metrics
curl http://localhost:8000/api/v1/dashboard/metrics

# Create a reservation
curl -X POST http://localhost:8000/api/v1/reservations \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test User","maison":"maison-1","checkin":"2025-08-20","checkout":"2025-08-25","montantAvance":100,"telephone":"123456789"}'
```

### With Your Frontend
1. Start backend: `python start_server.py` (port 8000)
2. Update frontend API URL to `http://localhost:8000/api/v1`
3. Start frontend: `npm run dev` (port 3000)
4. Test all functionality!

##  Future Enhancements

### Ready for Production
- **Authentication**: JWT-based auth system already implemented
- **File Uploads**: AWS S3 integration ready (boto3 included)
- **Database**: Easy migration to PostgreSQL for production
- **Monitoring**: Built-in logging and error tracking
- **Caching**: Redis integration ready for performance

### AWS S3 File Upload
The backend is prepared for S3 file uploads:
```python
# Configuration ready in settings
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
S3_BUCKET_NAME = config("S3_BUCKET_NAME")
```

##  Troubleshooting

### Common Issues

**Port already in use**:
```bash
python start_server.py --port 3001
```

**Migration fails**:
```bash
# Check if db.json exists
ls -la db.json

# Run migration separately
python migrate_data.py
```

**CORS errors**:
- Check ALLOWED_HOSTS in config.py
- Ensure frontend URL is included

**Database errors**:
```bash
# Delete database and remigrate
rm residence_manager.db
python migrate_data.py
```

## ecreate the database cleanly 
```bash
python migrate_data.py --force 
python start_server.py --skip-migration
```


