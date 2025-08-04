from sqlalchemy import Column, String, Date, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class FinancialOperation(Base):
    """
    Financial operations model tracking all income and expenses.
    
    This model records all financial transactions with foreign key references
    to enable automatic synchronization when related records are updated/deleted.
    """
    __tablename__ = "financial_operations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(Date, nullable=False)
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    type = Column(String, nullable=False)  # 'entree', 'sortie'
    motif = Column(String, nullable=False)
    montant = Column(Float, nullable=False)
    origine = Column(String, nullable=False)  # 'reservation', 'maintenance', 'checkin', 'manuel'
    piece_jointe = Column(String)
    editable = Column(Boolean, default=True)
    
    # Foreign key references for transaction synchronization
    reservation_id = Column(String, ForeignKey("reservations.id"), nullable=True)
    checkin_id = Column(String, ForeignKey("checkins.id"), nullable=True)
    maintenance_id = Column(String, ForeignKey("maintenance_issues.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    house = relationship("House", back_populates="financial_operations")
    reservation = relationship("Reservation", backref="financial_operations")
    checkin = relationship("CheckIn", backref="financial_operations")
    maintenance_issue = relationship("MaintenanceIssue", backref="financial_operations")
    file_attachments = relationship("FileAttachment", back_populates="operation")


class FileAttachment(Base):
    __tablename__ = "file_attachments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    operation_id = Column(String, ForeignKey("financial_operations.id"), nullable=False)
    filename = Column(String, nullable=False)
    mime_type = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    operation = relationship("FinancialOperation", back_populates="file_attachments")