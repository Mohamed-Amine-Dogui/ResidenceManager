from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, PasswordResetRequest
from app.services.auth_service import AuthService
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    
    # Check if user already exists
    if auth_service.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = auth_service.create_user(user_data)
    return user

@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    
    # Get client IP
    client_ip = request.client.host if request.client else None
    
    user = auth_service.authenticate_user(
        email=form_data.username,  # OAuth2PasswordRequestForm uses 'username' field
        password=form_data.password,
        ip_address=client_ip
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login-json", response_model=Token)
def login_json(
    request: Request,
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    """Alternative login endpoint that accepts JSON instead of form data"""
    auth_service = AuthService(db)
    
    # Get client IP
    client_ip = request.client.host if request.client else None
    
    user = auth_service.authenticate_user(
        email=user_login.email,
        password=user_login.password,
        ip_address=client_ip
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(
    password_reset: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    # TODO: Implement password reset logic with email
    # For now, just return success message
    return {"message": "If this email exists, you will receive password reset instructions"}

@router.post("/guest-access", response_model=Token)
def guest_access():
    """Create a guest access token with limited permissions"""
    # Create a token for guest user (no database user needed)
    access_token = create_access_token(subject="guest")
    
    return {
        "access_token": access_token,
        "refresh_token": "",  # Guests don't get refresh tokens
        "token_type": "bearer"
    }