from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class ChecklistCategory(Base):
    __tablename__ = "checklist_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)

    # Relationships
    checklist_items = relationship("ChecklistItem", back_populates="category")
    house_category_status = relationship("HouseCategoryStatus", back_populates="category")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    step_number = Column(Integer)
    category_id = Column(Integer, ForeignKey("checklist_categories.id"), nullable=False)
    description = Column(String, nullable=False)
    product_required = Column(String)
    type = Column(String, nullable=False)  # 'nettoyage', 'vérification', 'entretien'

    # Relationships
    house = relationship("House", back_populates="checklist_items")
    category = relationship("ChecklistCategory", back_populates="checklist_items")
    house_status = relationship("HouseChecklistStatus", back_populates="item")
    completion_logs = relationship("TaskCompletionLog", back_populates="item")


class HouseChecklistStatus(Base):
    __tablename__ = "house_checklist_status"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    item_id = Column(String, ForeignKey("checklist_items.id"), nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    updated_by = Column(String, ForeignKey("users.id"))

    # Relationships
    house = relationship("House", back_populates="checklist_status")
    item = relationship("ChecklistItem", back_populates="house_status")
    updated_by_user = relationship("User")


class HouseCategoryStatus(Base):
    __tablename__ = "house_category_status"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("checklist_categories.id"), nullable=False)
    is_ready = Column(Boolean, default=False)
    ready_at = Column(DateTime(timezone=True))

    # Relationships
    house = relationship("House", back_populates="category_status")
    category = relationship("ChecklistCategory", back_populates="house_category_status")


class TaskCompletionLog(Base):
    __tablename__ = "task_completion_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    item_id = Column(String, ForeignKey("checklist_items.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    completed = Column(Boolean, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    house = relationship("House", back_populates="task_logs")
    item = relationship("ChecklistItem", back_populates="completion_logs")
    user = relationship("User")