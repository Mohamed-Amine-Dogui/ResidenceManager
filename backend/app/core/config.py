from pydantic_settings import BaseSettings
from decouple import config
from typing import List


class Settings(BaseSettings):
    # Project settings
    PROJECT_NAME: str = "ResidenceManager API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = config("SECRET_KEY", default="your-super-secret-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    
    # Database (SQLite)
    DATABASE_URL: str = config("DATABASE_URL", default="sqlite:///./residence_manager.db")
    
    # Email settings (for password reset)
    MAIL_USERNAME: str = config("MAIL_USERNAME", default="")
    MAIL_PASSWORD: str = config("MAIL_PASSWORD", default="")
    MAIL_FROM: str = config("MAIL_FROM", default="noreply@residencemanager.com")
    MAIL_PORT: int = config("MAIL_PORT", default=587, cast=int)
    MAIL_SERVER: str = config("MAIL_SERVER", default="smtp.gmail.com")
    MAIL_STARTTLS: bool = config("MAIL_STARTTLS", default=True, cast=bool)
    MAIL_SSL_TLS: bool = config("MAIL_SSL_TLS", default=False, cast=bool)
    
    # File upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    class Config:
        case_sensitive = True


settings = Settings()