#!/usr/bin/env python3
"""
Data Migration Script - Import db.json data to SQLite

This script migrates all data from the JSON server db.json file 
to the SQLite database using the FastAPI models.

Usage:
    python migrate_data.py

Requirements:
    - The FastAPI app must be properly configured
    - The db.json file must exist in the backend directory
    - All SQLAlchemy models must be properly defined
"""

import json
import sys
import os
from datetime import datetime, date
from typing import Dict, Any, List

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models import *  # Import all models
from app.core.config import settings

def load_json_data(file_path: str) -> Dict[str, Any]:
    """
    Load data from JSON file.
    
    Args:
        file_path: Path to the JSON file
        
    Returns:
        Dictionary containing all JSON data
        
    Raises:
        FileNotFoundError: If JSON file doesn't exist
        json.JSONDecodeError: If JSON is invalid
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"✅ Loaded JSON data from {file_path}")
        return data
    except FileNotFoundError:
        print(f"❌ JSON file not found: {file_path}")
        raise
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON format: {e}")
        raise


def create_database_and_tables(force_recreate=False):
    """
    Create database and all tables.
    
    Args:
        force_recreate: If True, drop and recreate all tables
    
    Returns:
        SQLAlchemy session
    """
    # Create engine
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False  # Set to True for SQL debugging
    )
    
    if force_recreate:
        # Drop all tables first
        Base.metadata.drop_all(bind=engine)
        print("🗑️  Dropped existing tables")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Created database tables")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()


def migrate_users(db, users_data: List[Dict]):
    """
    Migrate users data with conflict handling.
    
    Args:
        db: Database session
        users_data: List of user dictionaries
    """
    print("🔄 Migrating users...")
    
    migrated_count = 0
    for user_data in users_data:
        # Check if user already exists
        existing_user = db.query(User).filter(User.id == user_data["id"]).first()
        if existing_user:
            print(f"⚠️  User {user_data['email']} already exists, skipping")
            continue
            
        user = User(
            id=user_data["id"],
            email=user_data["email"],
            password_hash=user_data["password_hash"],
            role=user_data["role"],
            created_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")),
            last_login=datetime.fromisoformat(user_data["last_login"].replace("Z", "+00:00")) if user_data.get("last_login") else None
        )
        db.add(user)
        migrated_count += 1
    
    db.commit()
    print(f"✅ Migrated {migrated_count} users")


def migrate_houses(db, houses_data: List[Dict]):
    """
    Migrate houses data.
    
    Args:
        db: Database session
        houses_data: List of house dictionaries
    """
    print("🔄 Migrating houses...")
    
    for house_data in houses_data:
        house = House(
            id=house_data["id"],
            name=house_data["name"]
        )
        db.add(house)
    
    db.commit()
    print(f"✅ Migrated {len(houses_data)} houses")


def migrate_maintenance_types(db):
    """
    Migrate maintenance types (hardcoded as they're static).
    
    Args:
        db: Database session
    """
    print("🔄 Migrating maintenance types...")
    
    maintenance_types = [
        {"id": "electricite", "label": "Électricité"},
        {"id": "plomberie", "label": "Plomberie"},
        {"id": "electromenager", "label": "Électroménager"},
        {"id": "peinture", "label": "Peinture"},
        {"id": "autre", "label": "Autre"},
    ]
    
    for type_data in maintenance_types:
        maintenance_type = MaintenanceType(
            id=type_data["id"],
            label=type_data["label"]
        )
        db.add(maintenance_type)
    
    db.commit()
    print(f"✅ Migrated {len(maintenance_types)} maintenance types")


def migrate_checklist_categories(db, categories_data: List[Dict]):
    """
    Migrate checklist categories.
    
    Args:
        db: Database session
        categories_data: List of category dictionaries
    """
    print("🔄 Migrating checklist categories...")
    
    for cat_data in categories_data:
        category = ChecklistCategory(
            id=int(cat_data["id"]),
            name=cat_data["name"]
        )
        db.add(category)
    
    db.commit()
    print(f"✅ Migrated {len(categories_data)} checklist categories")


def migrate_reservations(db, reservations_data: List[Dict]):
    """
    Migrate reservations data.
    
    Args:
        db: Database session
        reservations_data: List of reservation dictionaries
    """
    print("🔄 Migrating reservations...")
    
    for res_data in reservations_data:
        reservation = Reservation(
            id=res_data["id"],
            house_id=res_data["maison"],
            guest_name=res_data["nom"],
            phone=res_data.get("telephone"),
            email=res_data.get("email"),
            checkin_date=datetime.strptime(res_data["checkin"], "%Y-%m-%d").date(),
            checkout_date=datetime.strptime(res_data["checkout"], "%Y-%m-%d").date(),
            advance_paid=res_data["montantAvance"]
        )
        db.add(reservation)
    
    db.commit()
    print(f"✅ Migrated {len(reservations_data)} reservations")


def migrate_checkins(db, checkins_data: List[Dict]):
    """
    Migrate checkins data.
    
    Args:
        db: Database session
        checkins_data: List of checkin dictionaries
    """
    print("🔄 Migrating checkins...")
    
    for checkin_data in checkins_data:
        checkin = CheckIn(
            id=checkin_data["id"],
            reservation_id=checkin_data.get("reservationId"),
            house_id=checkin_data["maison"],
            guest_name=checkin_data["nom"],
            phone=checkin_data.get("telephone"),
            email=checkin_data.get("email"),
            arrival_date=datetime.strptime(checkin_data["dateArrivee"], "%Y-%m-%d").date(),
            departure_date=datetime.strptime(checkin_data["dateDepart"], "%Y-%m-%d").date(),
            advance_paid=checkin_data["avancePaye"],
            checkin_payment=checkin_data["paiementCheckin"],
            total_amount=checkin_data["montantTotal"],
            inventory=checkin_data["inventaire"],
            manager=checkin_data["responsable"],
            remarks=checkin_data.get("remarques")
        )
        db.add(checkin)
    
    db.commit()
    print(f"✅ Migrated {len(checkins_data)} checkins")


def migrate_financial_operations(db, finance_data: List[Dict]):
    """
    Migrate financial operations data.
    
    Args:
        db: Database session
        finance_data: List of financial operation dictionaries
    """
    print("🔄 Migrating financial operations...")
    
    for fin_data in finance_data:
        operation = FinancialOperation(
            id=fin_data["id"],
            date=datetime.strptime(fin_data["date"], "%Y-%m-%d").date(),
            house_id=fin_data["maison"],
            type=fin_data["type"],
            motif=fin_data["motif"],
            montant=fin_data["montant"],
            origine=fin_data["origine"],
            piece_jointe=fin_data.get("pieceJointe"),
            editable=fin_data["editable"],
            reservation_id=fin_data.get("reservationId"),
            checkin_id=fin_data.get("checkinId"),
            maintenance_id=fin_data.get("maintenanceId")
        )
        db.add(operation)
    
    db.commit()
    print(f"✅ Migrated {len(finance_data)} financial operations")


def migrate_maintenance_issues(db, maintenance_data: List[Dict]):
    """
    Migrate maintenance issues data.
    
    Args:
        db: Database session
        maintenance_data: List of maintenance issue dictionaries
    """
    print("🔄 Migrating maintenance issues...")
    
    for maint_data in maintenance_data:
        issue = MaintenanceIssue(
            id=maint_data["id"],
            house_id=maint_data["maison"],
            issue_type=maint_data["typePanne"],
            reported_at=datetime.strptime(maint_data["dateDeclaration"], "%Y-%m-%d").date(),
            assigned_to=maint_data["assigne"],
            comment=maint_data.get("commentaire"),
            status=maint_data["statut"],
            photo_issue_url=maint_data.get("photoPanne"),
            photo_invoice_url=maint_data.get("photoFacture"),
            labor_cost=maint_data.get("prixMainOeuvre")
        )
        db.add(issue)
    
    db.commit()
    print(f"✅ Migrated {len(maintenance_data)} maintenance issues")


def migrate_checklist_items(db, checklist_data: List[Dict]):
    """
    Migrate checklist items data.
    
    Args:
        db: Database session
        checklist_data: List of checklist item dictionaries
    """
    print("🔄 Migrating checklist items...")
    
    # First, get category name to ID mapping
    categories = db.query(ChecklistCategory).all()
    category_map = {cat.name: cat.id for cat in categories}
    
    for item_data in checklist_data:
        # Find category ID by name
        category_id = category_map.get(item_data["categorie"])
        if not category_id:
            print(f"⚠️  Category not found: {item_data['categorie']}, skipping item")
            continue
        
        item = ChecklistItem(
            id=item_data["id"],
            house_id=item_data["maison"],
            step_number=item_data["etape"],
            category_id=category_id,
            description=item_data["description"],
            product_required=item_data["produitAUtiliser"],
            type=item_data["type"]
        )
        db.add(item)
    
    db.commit()
    print(f"✅ Migrated {len(checklist_data)} checklist items")


def migrate_house_checklist_status(db, status_data: List[Dict]):
    """
    Migrate house checklist status data.
    
    Args:
        db: Database session
        status_data: List of status dictionaries
    """
    print("🔄 Migrating house checklist status...")
    
    for status_item in status_data:
        status = HouseChecklistStatus(
            id=status_item["id"],
            house_id=status_item["maison"],
            item_id=status_item["checklistItemId"],
            is_completed=status_item["completed"],
            completed_at=datetime.fromisoformat(status_item["completedAt"].replace("Z", "+00:00")) if status_item.get("completedAt") else None,
            updated_by=status_item.get("updatedBy")
        )
        db.add(status)
    
    db.commit()
    print(f"✅ Migrated {len(status_data)} house checklist statuses")


def migrate_house_category_status(db, category_status_data: List[Dict]):
    """
    Migrate house category status data.
    
    Args:
        db: Database session
        category_status_data: List of category status dictionaries
    """
    print("🔄 Migrating house category status...")
    
    for status_item in category_status_data:
        status = HouseCategoryStatus(
            id=status_item["id"],
            house_id=status_item["maison"],
            category_id=status_item["categoryId"],
            is_ready=status_item["isReady"],
            ready_at=datetime.fromisoformat(status_item["readyAt"].replace("Z", "+00:00")) if status_item.get("readyAt") else None
        )
        db.add(status)
    
    db.commit()
    print(f"✅ Migrated {len(category_status_data)} house category statuses")


def main():
    """
    Main migration function.
    
    Orchestrates the entire data migration process.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="Migrate data from db.json to SQLite")
    parser.add_argument("--force", action="store_true", help="Force recreate database (drops existing data)")
    parser.add_argument("--skip-existing", action="store_true", help="Skip existing records instead of failing")
    args = parser.parse_args()
    
    print("🚀 Starting data migration from db.json to SQLite...")
    if args.force:
        print("⚠️  FORCE MODE: Will drop and recreate all tables!")
    print("=" * 60)
    
    try:
        # Load JSON data
        json_file_path = os.path.join(os.path.dirname(__file__), "db.json")
        data = load_json_data(json_file_path)
        
        # Create database and session
        db = create_database_and_tables(force_recreate=args.force)
        
        try:
            # Migrate data in dependency order
            migrate_users(db, data.get("users", []))
            migrate_houses(db, data.get("houses", []))
            migrate_maintenance_types(db)
            migrate_checklist_categories(db, data.get("checklistCategories", []))
            migrate_reservations(db, data.get("reservations", []))
            migrate_checkins(db, data.get("checkins", []))
            migrate_financial_operations(db, data.get("financialOperations", []))
            migrate_maintenance_issues(db, data.get("maintenanceIssues", []))
            migrate_checklist_items(db, data.get("checklistItems", []))
            migrate_house_checklist_status(db, data.get("houseChecklistStatus", []))
            migrate_house_category_status(db, data.get("houseCategoryStatus", []))
            
            print("=" * 60)
            print("✅ Data migration completed successfully!")
            print(f"📊 Database file: {settings.DATABASE_URL}")
            print("🎉 Your FastAPI backend is ready to use!")
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error during migration: {e}")
            raise
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()