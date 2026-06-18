"""Prescription schemas."""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models import PrescriptionStatusEnum


class PrescriptionCreateRequest(BaseModel):
    """Request model for creating a prescription."""
    
    patient_id: int = Field(..., description="Patient ID")
    appointment_id: Optional[int] = Field(None, description="Associated appointment ID")
    medication_name: str = Field(..., description="Name of medication")
    dosage: str = Field(..., description="Dosage (e.g., '500mg', '2 tabs')")
    frequency: str = Field(..., description="Frequency (e.g., '3 times daily')")
    duration: str = Field(..., description="Duration (e.g., '7 days')")
    route: str = Field(default="oral", description="Route of administration")
    quantity: int = Field(..., description="Total quantity prescribed")
    instructions: Optional[str] = Field(None, description="Special instructions")
    warnings: Optional[str] = Field(None, description="Warnings and precautions")
    refills_allowed: int = Field(default=0, description="Number of refills permitted")
    expiry_date: Optional[datetime] = Field(None, description="Prescription expiry date")


class PrescriptionUpdateRequest(BaseModel):
    """Request model for updating a prescription."""
    
    medication_name: Optional[str] = Field(None, description="Name of medication")
    dosage: Optional[str] = Field(None, description="Dosage")
    frequency: Optional[str] = Field(None, description="Frequency")
    duration: Optional[str] = Field(None, description="Duration")
    route: Optional[str] = Field(None, description="Route of administration")
    quantity: Optional[int] = Field(None, description="Total quantity")
    instructions: Optional[str] = Field(None, description="Special instructions")
    warnings: Optional[str] = Field(None, description="Warnings")
    refills_allowed: Optional[int] = Field(None, description="Refills allowed")
    expiry_date: Optional[datetime] = Field(None, description="Expiry date")


class PrescriptionDispenseRequest(BaseModel):
    """Request model for dispensing a prescription."""
    
    quantity_dispensed: int = Field(..., description="Quantity being dispensed")
    
    @validator('quantity_dispensed')
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Quantity dispensed must be positive')
        return v


class PrescriptionCancelRequest(BaseModel):
    """Request model for cancelling a prescription."""
    
    cancellation_reason: str = Field(..., description="Reason for cancellation")


class PrescriptionResponse(BaseModel):
    """Response model for a prescription."""
    
    id: int
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int]
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    route: str
    quantity: int
    quantity_dispensed: int
    instructions: Optional[str]
    warnings: Optional[str]
    refills_allowed: int
    refills_used: int
    status: PrescriptionStatusEnum
    issued_date: datetime
    expiry_date: Optional[datetime]
    dispensed_date: Optional[datetime]
    dispensed_by_id: Optional[int]
    cancelled_date: Optional[datetime]
    cancellation_reason: Optional[str]
    cancelled_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PrescriptionListResponse(BaseModel):
    """Response model for listing prescriptions."""
    
    total: int = Field(..., description="Total count of prescriptions")
    count: int = Field(..., description="Count of prescriptions in this page")
    prescriptions: List[PrescriptionResponse] = Field(..., description="List of prescriptions")


class PrescriptionHistoryResponse(BaseModel):
    """Response model for prescription history."""
    
    id: int
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    route: str
    quantity: int
    quantity_dispensed: int
    status: PrescriptionStatusEnum
    issued_date: datetime
    dispensed_date: Optional[datetime]
    cancelled_date: Optional[datetime]
    refills_used: int
    refills_allowed: int
    
    class Config:
        from_attributes = True
