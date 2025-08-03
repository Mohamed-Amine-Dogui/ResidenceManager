from sqlalchemy import Column, String, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class House(Base):
    __tablename__ = "houses"

    id = Column(String, primary_key=True)  # e.g., 'maison-1'
    name = Column(String, nullable=False)  # e.g., 'Mv1'

    # Relationships
    reservations = relationship("Reservation", back_populates="house")
    checklist_items = relationship("ChecklistItem", back_populates="house")
    checklist_status = relationship("HouseChecklistStatus", back_populates="house")
    category_status = relationship("HouseCategoryStatus", back_populates="house")
    task_logs = relationship("TaskCompletionLog", back_populates="house")
    daily_occupancy = relationship("HouseDailyOccupancy", back_populates="house")
    maintenance_issues = relationship("MaintenanceIssue", back_populates="house")
    financial_operations = relationship("FinancialOperation", back_populates="house")


class HouseDailyOccupancy(Base):
    __tablename__ = "house_daily_occupancy"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    date = Column(Date, nullable=False)
    is_occupied = Column(Boolean, nullable=False)
    source = Column(String, nullable=False)  # 'reservation', 'maintenance_block'
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    house = relationship("House", back_populates="daily_occupancy")