from sqlalchemy import Column, String, Date, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class MaintenanceType(Base):
    __tablename__ = "maintenance_types"

    id = Column(String, primary_key=True)  # e.g., 'electricite'
    label = Column(String, nullable=False)

    # Relationships
    maintenance_issues = relationship("MaintenanceIssue", back_populates="maintenance_type")


class MaintenanceIssue(Base):
    __tablename__ = "maintenance_issues"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    issue_type = Column(String, ForeignKey("maintenance_types.id"), nullable=False)
    reported_at = Column(Date, nullable=False)
    assigned_to = Column(String)
    comment = Column(String)
    status = Column(String, default="non-resolue")  # 'resolue', 'non-resolue'
    photo_issue_url = Column(String)
    photo_invoice_url = Column(String)
    labor_cost = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    house = relationship("House", back_populates="maintenance_issues")
    maintenance_type = relationship("MaintenanceType", back_populates="maintenance_issues")
    status_logs = relationship("MaintenanceStatusLog", back_populates="issue")


class MaintenanceStatusLog(Base):
    __tablename__ = "maintenance_status_log"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    issue_id = Column(String, ForeignKey("maintenance_issues.id"), nullable=False)
    previous = Column(String)
    new = Column(String, nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    changed_by = Column(String, ForeignKey("users.id"))

    # Relationships
    issue = relationship("MaintenanceIssue", back_populates="status_logs")
    changed_by_user = relationship("User")