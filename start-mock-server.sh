#!/bin/bash
# Start JSON Server for mock backend testing
echo "Starting JSON Server mock backend on port 8000..."
echo "Frontend should connect to: http://localhost:8000"
echo "Available endpoints:"
echo "  GET    /reservations"
echo "  POST   /reservations" 
echo "  PUT    /reservations/:id"
echo "  DELETE /reservations/:id"
echo "  GET    /financialOperations"
echo "  GET    /maintenanceIssues"
echo "  GET    /checkins"
echo "  GET    /checklistItems"
echo "  GET    /dashboardMetrics"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd backend && json-server --watch db.json --port 8000 --host 0.0.0.0