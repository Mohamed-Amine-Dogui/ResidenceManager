from sqlalchemy import Column, String, Date, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class FinancialOperation(Base):
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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    house = relationship("House", back_populates="financial_operations")
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