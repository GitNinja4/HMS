"""Vital Signs model for tracking patient health metrics."""

from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime
from .base import BaseModel


class VitalSigns(BaseModel):
    """Vital signs tracking for patients."""
    
    __tablename__ = "vital_signs"
    
    patient_id = Column(Integer, nullable=False, index=True)
    
    # Vital measurements
    temperature = Column(Float, nullable=True)  # Celsius
    blood_pressure_systolic = Column(Integer, nullable=True)  # mmHg
    blood_pressure_diastolic = Column(Integer, nullable=True)  # mmHg
    heart_rate = Column(Integer, nullable=True)  # beats per minute
    respiratory_rate = Column(Integer, nullable=True)  # breaths per minute
    oxygen_saturation = Column(Float, nullable=True)  # percentage
    weight = Column(Float, nullable=True)  # kg
    height = Column(Float, nullable=True)  # cm
    
    # Additional fields
    recorded_by_id = Column(Integer, nullable=True)  # Doctor or Nurse who recorded
    notes = Column(String(500), nullable=True)
    recorded_at = Column(String(30), nullable=False, default=lambda: datetime.utcnow().isoformat())
