"""Appointment request and response schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AppointmentCreateRequest(BaseModel):
    """Request to create new appointment."""
    patient_id: int
    doctor_id: int
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    appointment_type: str = Field(default="in_person")
    scheduled_at: datetime
    duration_minutes: int = Field(default=30, ge=15, le=480)
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    patient_notes: Optional[str] = None


class AppointmentUpdateRequest(BaseModel):
    """Request to update appointment."""
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    appointment_type: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=480)
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    patient_notes: Optional[str] = None


class AppointmentStatusUpdateRequest(BaseModel):
    """Request to update appointment status."""
    status: str = Field(description="New status")
    cancellation_reason: Optional[str] = None


class AppointmentResponse(BaseModel):
    """Response model for appointment."""
    id: int
    patient_id: int
    doctor_id: int
    nurse_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    appointment_type: str
    status: str
    scheduled_at: str
    duration_minutes: int
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = None
    patient_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None
    reminder_sent: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        """Custom ORM conversion."""
        return cls(
            id=obj.id,
            patient_id=obj.patient_id,
            doctor_id=obj.doctor_id,
            nurse_id=obj.nurse_id,
            title=obj.title,
            description=obj.description,
            appointment_type=obj.appointment_type.value if hasattr(obj.appointment_type, 'value') else str(obj.appointment_type),
            status=obj.status.value if hasattr(obj.status, 'value') else str(obj.status),
            scheduled_at=obj.scheduled_at.isoformat() if isinstance(obj.scheduled_at, datetime) else str(obj.scheduled_at),
            duration_minutes=obj.duration_minutes,
            location=obj.location,
            meeting_link=obj.meeting_link,
            notes=obj.notes,
            patient_notes=obj.patient_notes,
            cancellation_reason=obj.cancellation_reason,
            reminder_sent=obj.reminder_sent,
            created_at=obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
            updated_at=obj.updated_at.isoformat() if isinstance(obj.updated_at, datetime) else str(obj.updated_at),
        )


class AppointmentListResponse(BaseModel):
    """Paginated appointment list response."""
    total: int
    skip: int
    limit: int
    appointments: List[AppointmentResponse]
