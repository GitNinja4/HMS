from sqlalchemy import Column, String, Integer, Text
from .base import BaseModel


class ActivityLog(BaseModel):
    """Activity log model for audit trail."""
    
    __tablename__ = "activity_logs"
    
    user_id = Column(Integer, nullable=True, index=True)  # Nullable for unauthenticated requests
    endpoint = Column(String(500), nullable=False)  # e.g., "/api/auth/login"
    method = Column(String(10), nullable=False)  # GET, POST, PUT, DELETE, etc.
    status_code = Column(Integer, nullable=False)  # HTTP status code
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)  # Client user-agent
    request_body = Column(Text, nullable=True)  # Sanitized request payload (exclude passwords)
    response_status = Column(String(50), default="success")  # success, error, exception
    error_message = Column(Text, nullable=True)  # Error details if status is error/exception
    duration_ms = Column(Integer, nullable=True)  # Request duration in milliseconds
