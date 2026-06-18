"""Email verification token model."""

from sqlalchemy import Column, String, Integer, Boolean, DateTime
from datetime import datetime, timedelta
from .base import BaseModel


class EmailToken(BaseModel):
    """Email verification token model for user email verification."""
    
    __tablename__ = "email_tokens"
    
    user_id = Column(Integer, nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    
    @classmethod
    def create_token(cls, user_id: int, token: str):
        """Create a new email token."""
        return cls(
            user_id=user_id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=24),
            used=False
        )
