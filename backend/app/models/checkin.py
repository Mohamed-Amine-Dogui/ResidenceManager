from sqlalchemy import Column, String, Date, Float, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class CheckIn(Base):
    """
    Check-in model representing guest arrival and accommodation payment.
    
    This model tracks when guests arrive at a house, their payment details,
    and the inventory status at the time of check-in.
    """
    __tablename__ = "checkins"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    reservation_id = Column(String, ForeignKey("reservations.id"), nullable=False)
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    guest_name = Column(String, nullable=False)
    phone = Column(String)
    email = Column(String)
    arrival_date = Column(Date, nullable=False)
    departure_date = Column(Date, nullable=False)
    advance_paid = Column(Float, default=0.0)  # Amount paid during reservation
    checkin_payment = Column(Float, default=0.0)  # Remaining amount paid at checkin
    total_amount = Column(Float, nullable=False)  # advance_paid + checkin_payment
    inventory = Column(JSON)  # Store inventory as JSON
    manager = Column(String)  # Responsible manager
    remarks = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    reservation = relationship("Reservation", backref="checkins")
    house = relationship("House", backref="checkins")


class CheckOut(Base):
    """
    Check-out model representing guest departure and house status update.
    
    This model tracks when guests leave and triggers the house readiness process.
    """
    __tablename__ = "checkouts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    checkin_id = Column(String, ForeignKey("checkins.id"), nullable=False)
    house_id = Column(String, ForeignKey("houses.id"), nullable=False)
    guest_name = Column(String, nullable=False)
    checkout_date = Column(Date, nullable=False)
    checkout_inventory = Column(JSON)  # Inventory status at checkout
    damages_notes = Column(String)  # Any damages or issues noted
    manager = Column(String)  # Manager who processed checkout
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    checkin = relationship("CheckIn", backref="checkout")
    house = relationship("House", backref="checkouts")


class InventoryItem(Base):
    """
    Inventory items template for houses.
    
    This model defines the standard inventory items that should be checked
    during check-in and check-out processes.
    """
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)  # e.g., "litsSimples", "television"
    category = Column(String, nullable=False)  # e.g., "furniture", "electronics"
    is_countable = Column(String, default="quantity")  # "quantity", "boolean"
    default_quantity = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())