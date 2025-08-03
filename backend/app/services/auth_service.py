from sqlalchemy.orm import Session
from app.models.user import User, LoginAttempt
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password
from typing import Optional
from datetime import datetime
import uuid


class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def create_user(self, user_data: UserCreate) -> User:
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            id=str(uuid.uuid4()),
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user
    
    def authenticate_user(self, email: str, password: str, ip_address: str = None) -> Optional[User]:
        user = self.get_user_by_email(email)
        
        # Log login attempt
        login_attempt = LoginAttempt(
            user_id=user.id if user else None,
            email=email,
            success=False,  # Will update if successful
            provider="email",
            ip_address=ip_address
        )
        
        if not user:
            self.db.add(login_attempt)
            self.db.commit()
            return None
            
        if not verify_password(password, user.password_hash):
            self.db.add(login_attempt)
            self.db.commit()
            return None
        
        # Update login attempt as successful
        login_attempt.success = True
        user.last_login = datetime.utcnow()
        
        self.db.add(login_attempt)
        self.db.commit()
        self.db.refresh(user)
        
        return user