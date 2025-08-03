from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # 'user', 'admin'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relationships
    user_providers = relationship("UserProvider", back_populates="user")
    login_attempts = relationship("LoginAttempt", back_populates="user")
    password_resets = relationship("PasswordResetRequest", back_populates="user")


class AuthProvider(Base):
    __tablename__ = "auth_providers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider_name = Column(String, unique=True, nullable=False)  # 'email', 'google', 'facebook'
    description = Column(String)

    # Relationships
    user_providers = relationship("UserProvider", back_populates="provider")


class UserProvider(Base):
    __tablename__ = "user_providers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    provider_id = Column(String, ForeignKey("auth_providers.id"), nullable=False)
    external_id = Column(String, nullable=False)
    linked_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="user_providers")
    provider = relationship("AuthProvider", back_populates="user_providers")


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    email = Column(String, nullable=False)
    success = Column(Boolean, nullable=False)
    provider = Column(String, nullable=False)
    ip_address = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="login_attempts")


class PasswordResetRequest(Base):
    __tablename__ = "password_reset_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    reset_token = Column(String, unique=True, nullable=False)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    used_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="password_resets")