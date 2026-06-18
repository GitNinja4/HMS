"""Activity log request and response schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ActivityLogResponse(BaseModel):
    """Response model for activity log."""
    id: int
    user_id: Optional[int] = None
    endpoint: str
    method: str
    status_code: int
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_body: Optional[str] = None
    response_status: str
    error_message: Optional[str] = None
    duration_ms: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        """Custom ORM conversion."""
        return cls(
            id=obj.id,
            user_id=obj.user_id,
            endpoint=obj.endpoint,
            method=obj.method,
            status_code=obj.status_code,
            ip_address=obj.ip_address,
            user_agent=obj.user_agent,
            request_body=obj.request_body,
            response_status=obj.response_status,
            error_message=obj.error_message,
            duration_ms=obj.duration_ms,
            created_at=obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
            updated_at=obj.updated_at.isoformat() if isinstance(obj.updated_at, datetime) else str(obj.updated_at),
        )


class ActivityLogListResponse(BaseModel):
    """Paginated activity log response."""
    total: int
    skip: int
    limit: int
    logs: List[ActivityLogResponse]


class ActivityLogFilterRequest(BaseModel):
    """Request to filter activity logs."""
    user_id: Optional[int] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    status_code: Optional[int] = None
    response_status: Optional[str] = None
