"""Appointment model."""

from sqlalchemy import Column, String, Integer, DateTime, Text, Enum as SQLEnum
from enum import Enum
from .base import BaseModel


class AppointmentStatusEnum(str, Enum):
    """Appointment status enumeration."""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class AppointmentTypeEnum(str, Enum):
    """Appointment type enumeration."""
    IN_PERSON = "in_person"
    TELEHEALTH = "telehealth"
    FOLLOW_UP = "follow_up"
    EMERGENCY = "emergency"


class Appointment(BaseModel):
    """Appointment model for scheduling medical appointments."""
    
    __tablename__ = "appointments"
    
    patient_id = Column(Integer, nullable=False, index=True)
    doctor_id = Column(Integer, nullable=False, index=True)
    nurse_id = Column(Integer, nullable=True, index=True)  # Optional nurse assignment
    
    # Appointment details
    title = Column(String(255), nullable=False)  # e.g., "Cardiology Checkup"
    description = Column(Text, nullable=True)
    appointment_type = Column(SQLEnum(AppointmentTypeEnum), default=AppointmentTypeEnum.IN_PERSON)
    status = Column(SQLEnum(AppointmentStatusEnum), default=AppointmentStatusEnum.SCHEDULED)
    
    # Scheduling
    scheduled_at = Column(DateTime, nullable=False)  # Appointment date/time
    duration_minutes = Column(Integer, default=30)  # Duration in minutes
    
    # Location/Meeting info
    location = Column(String(500), nullable=True)  # Physical location or meeting link
    meeting_link = Column(String(500), nullable=True)  # For telemedicine
    
    # Notes
    notes = Column(Text, nullable=True)  # Doctor's notes
    patient_notes = Column(Text, nullable=True)  # Patient's notes/reason
    cancellation_reason = Column(Text, nullable=True)
    
    # Tracking
    reminder_sent = Column(String(50), default="pending")  # pending, sent, not_needed
