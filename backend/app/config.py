from pydantic_settings import BaseSettings
from pydantic import Field, computed_field, ConfigDict
from typing import Optional, List
from pathlib import Path
import os


class Settings(BaseSettings):
    """Application configuration from environment variables with secure defaults."""
    
    model_config = ConfigDict(
        extra='ignore',
        case_sensitive=True,
        env_file=Path(__file__).parent.parent / ".env",
        env_file_encoding="utf-8",
        arbitrary_types_allowed=True
    )
    
    # ==================== APPLICATION ====================
    APP_NAME: str = "HMS Backend"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"  # development, staging, production
    # DEBUG must be False in production
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 5000
    
    # ==================== DATABASE ====================
    # CRITICAL: Always use environment variable in production
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/hms_db"
    DATABASE_ECHO: bool = False
    
    # ==================== REDIS ====================
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # ==================== JWT SECURITY ====================
    # CRITICAL: Must be at least 32 characters and generated securely
    JWT_SECRET_KEY: str = Field(..., min_length=32, description="Must be at least 32 characters")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # Enable JWT jti (JWT ID) for token tracking and revocation
    JWT_USE_JTI: bool = True
    
    # ==================== CORS ====================
    FRONTEND_URL: str = "http://localhost:5174"
    # Parse ALLOWED_ORIGINS from comma-separated string
    ALLOWED_ORIGINS_STR: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174"
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_MAX_AGE: int = 600  # 10 minutes
    
    @computed_field
    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        """Parse ALLOWED_ORIGINS from environment variable."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS_STR.split(",") if origin.strip()]
    
    # ==================== API ====================
    API_V1_STR: str = "/api"
    API_VERSION: str = "v1"
    
    # ==================== SECURITY HEADERS ====================
    X_FRAME_OPTIONS: str = "DENY"  # Prevent clickjacking
    X_CONTENT_TYPE_OPTIONS: str = "nosniff"  # Prevent MIME sniffing
    X_XSS_PROTECTION: str = "1; mode=block"  # XSS protection
    STRICT_TRANSPORT_SECURITY: str = "max-age=31536000; includeSubDomains"  # HSTS
    CONTENT_SECURITY_POLICY: str = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
    REFERRER_POLICY: str = "strict-origin-when-cross-origin"
    PERMISSIONS_POLICY: str = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
    
    # ==================== SECURITY ====================
    BCRYPT_ROUNDS: int = 12
    PASSWORD_MIN_LENGTH: int = 8
    # Rate limiting enabled by default
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_SIGNUP_PER_HOUR: int = 5
    RATE_LIMIT_LOGIN_PER_15MIN: int = 10
    RATE_LIMIT_REQUEST_PER_MINUTE: int = 60
    RATE_LIMIT_WINDOW_SECONDS: int = 60
    
    # ==================== SMTP / EMAIL ====================
    SMTP_ENABLED: bool = True
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = "noreply@hms-system.com"
    SMTP_PASSWORD: str = "change-me"  # Must be set via environment variable
    SMTP_FROM_EMAIL: str = "noreply@hms-system.com"
    SMTP_FROM_NAME: str = "HMS Healthcare System"
    SMTP_USE_TLS: bool = True
    EMAIL_VERIFICATION_EXPIRE_MINUTES: int = 30
    
    # ==================== LOGGING ====================
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    LOG_MAX_BYTES: int = 10485760  # 10MB
    LOG_BACKUP_COUNT: int = 5
    # Disable verbose SQL logging in production
    SQL_ECHO: bool = False
    
    # ==================== API DOCUMENTATION ====================
    # Disable in production for security
    ENABLE_DOCS: bool = False
    DOCS_URL: Optional[str] = None
    REDOC_URL: Optional[str] = None
    OPENAPI_URL: Optional[str] = None
    
    def model_post_init(self, __context):
        """Initialize settings and set documentation URLs based on environment."""
        # Enable documentation only in development/staging
        if self.APP_ENV in ["development", "staging"]:
            self.ENABLE_DOCS = True
            self.DOCS_URL = f"{self.API_V1_STR}/docs"
            self.REDOC_URL = f"{self.API_V1_STR}/redoc"
            self.OPENAPI_URL = f"{self.API_V1_STR}/openapi.json"


# Create global settings instance
try:
    settings = Settings()
except Exception as e:
    print(f"Configuration Error: {e}")
    print("Please ensure JWT_SECRET_KEY is set in .env and is at least 32 characters long.")
    exit(1)
