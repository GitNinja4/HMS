"""Vital Signs schemas for request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class VitalSignsBase(BaseModel):
    """Base vital signs schema."""
    
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    blood_pressure_systolic: Optional[int] = Field(None, description="Systolic BP in mmHg")
    blood_pressure_diastolic: Optional[int] = Field(None, description="Diastolic BP in mmHg")
    heart_rate: Optional[int] = Field(None, description="Heart rate in BPM")
    respiratory_rate: Optional[int] = Field(None, description="Respiratory rate in breaths/min")
    oxygen_saturation: Optional[float] = Field(None, description="O2 saturation percentage")
    weight: Optional[float] = Field(None, description="Weight in kg")
    height: Optional[float] = Field(None, description="Height in cm")
    notes: Optional[str] = Field(None, description="Additional notes")


class VitalSignsCreateRequest(VitalSignsBase):
    """Request to create vital signs."""
    
    patient_id: int = Field(..., description="Patient ID")


class VitalSignsUpdateRequest(VitalSignsBase):
    """Request to update vital signs."""
    
    pass


class VitalSignsResponse(VitalSignsBase):
    """Response model for vital signs."""
    
    id: int
    patient_id: int
    recorded_by_id: Optional[int]
    recorded_at: str
    
    class Config:
        from_attributes = True


class VitalSignsListResponse(BaseModel):
    """Paginated list response for vital signs."""
    
    total: int
    skip: int
    limit: int
    data: List[VitalSignsResponse]


class HealthProfileResponse(BaseModel):
    """Complete health profile for patient."""
    
    id: int
    patient_id: int
    name: str
    age: Optional[str]
    gender: Optional[str]
    blood_group: Optional[str]
    medical_history: Optional[str]
    status: str
    
    # Latest vital signs
    latest_vitals: Optional[VitalSignsResponse]
    
    # Relationships
    assigned_doctor_id: Optional[str]
    assigned_nurse_id: Optional[str]
    
    class Config:
        from_attributes = True
