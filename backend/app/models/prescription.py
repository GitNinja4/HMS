"""Prescription model."""

from sqlalchemy import Column, String, Integer, DateTime, Text, Enum as SQLEnum, Float, Index, ForeignKey
from sqlalchemy.orm import relationship
from enum import Enum
from .base import BaseModel


class PrescriptionStatusEnum(str, Enum):
    """Prescription status enumeration."""
    ACTIVE = "active"
    DISPENSED = "dispensed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    REFILL_REQUESTED = "refill_requested"
    REFILLING = "refilling"


class Prescription(BaseModel):
    """Prescription model for managing patient medications."""
    
    __tablename__ = "prescriptions"
    
    # Relationships
    patient_id = Column(Integer, nullable=False, index=True)
    doctor_id = Column(Integer, nullable=False, index=True)
    appointment_id = Column(Integer, nullable=True, index=True)  # Optional: associated appointment
    
    # Prescription details
    medication_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=False)  # e.g., "500mg", "2 tabs"
    frequency = Column(String(100), nullable=False)  # e.g., "3 times daily", "Once at night"
    duration = Column(String(100), nullable=False)  # e.g., "7 days", "4 weeks"
    route = Column(String(50), nullable=False, default="oral")  # oral, injection, topical, etc.
    
    # Dosage quantity tracking
    quantity = Column(Integer, nullable=False)  # Total tablets/units prescribed
    quantity_dispensed = Column(Integer, default=0)  # Quantity given by pharmacist
    
    # Additional information
    instructions = Column(Text, nullable=True)  # Special instructions
    warnings = Column(Text, nullable=True)  # Allergies, side effects, warnings
    refills_allowed = Column(Integer, default=0)  # Number of refills permitted
    refills_used = Column(Integer, default=0)  # Number of refills dispensed
    
    # Status and tracking
    status = Column(SQLEnum(PrescriptionStatusEnum), default=PrescriptionStatusEnum.ACTIVE)
    
    # Dates
    issued_date = Column(DateTime, nullable=False)  # When doctor issued it
    expiry_date = Column(DateTime, nullable=True)  # When prescription expires
    dispensed_date = Column(DateTime, nullable=True)  # When pharmacist dispensed it
    dispensed_by_id = Column(Integer, nullable=True, index=True)  # Pharmacist who dispensed
    
    # Cancellation details
    cancelled_date = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    cancelled_by_id = Column(Integer, nullable=True)  # Who cancelled (doctor or admin)
    
    # Indexing for common queries
    __table_args__ = (
        Index('ix_prescription_patient_status', 'patient_id', 'status'),
        Index('ix_prescription_doctor_status', 'doctor_id', 'status'),
        Index('ix_prescription_issued_date', 'issued_date'),
    )
