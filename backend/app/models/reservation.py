from sqlalchemy import Column, String, Date, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    guest_name = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    checkin_date = Column(Date, nullable=False)
    checkout_date = Column(Date, nullable=False)
    advance_paid = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    house = relationship("House", back_populates="reservations")
    audit_logs = relationship("ReservationAuditLog", back_populates="reservation")


class ReservationAuditLog(Base):
    __tablename__ = "reservation_audit_log"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id = Column(String, ForeignKey("reservations.id"), nullable=False)
    action = Column(String, nullable=False)  # 'created', 'updated', 'deleted'
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Relationships
    reservation = relationship("Reservation", back_populates="audit_logs")
    user = relationship("User")