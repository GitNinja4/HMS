"""Vital Signs Service for managing patient health metrics."""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models import VitalSigns
from fastapi import HTTPException, status
from datetime import datetime


class VitalSignsService:
    """Service for managing vital signs records."""
    
    @staticmethod
    def create_vital_signs(
        db: Session,
        patient_id: int,
        temperature: float = None,
        blood_pressure_systolic: int = None,
        blood_pressure_diastolic: int = None,
        heart_rate: int = None,
        respiratory_rate: int = None,
        oxygen_saturation: float = None,
        weight: float = None,
        height: float = None,
        recorded_by_id: int = None,
        notes: str = None
    ) -> VitalSigns:
        """Create a new vital signs record."""
        
        vital = VitalSigns(
            patient_id=patient_id,
            temperature=temperature,
            blood_pressure_systolic=blood_pressure_systolic,
            blood_pressure_diastolic=blood_pressure_diastolic,
            heart_rate=heart_rate,
            respiratory_rate=respiratory_rate,
            oxygen_saturation=oxygen_saturation,
            weight=weight,
            height=height,
            recorded_by_id=recorded_by_id,
            notes=notes,
            recorded_at=datetime.utcnow().isoformat()
        )
        
        db.add(vital)
        db.commit()
        db.refresh(vital)
        
        return vital
    
    @staticmethod
    def get_patient_vital_signs(
        db: Session,
        patient_id: int,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[int, list]:
        """Get vital signs for a patient, ordered by most recent."""
        
        total = db.query(VitalSigns).filter(
            VitalSigns.patient_id == patient_id
        ).count()
        
        vitals = db.query(VitalSigns).filter(
            VitalSigns.patient_id == patient_id
        ).order_by(desc(VitalSigns.recorded_at)).offset(skip).limit(limit).all()
        
        return total, vitals
    
    @staticmethod
    def get_latest_vital_signs(
        db: Session,
        patient_id: int
    ) -> VitalSigns:
        """Get the most recent vital signs for a patient."""
        
        vital = db.query(VitalSigns).filter(
            VitalSigns.patient_id == patient_id
        ).order_by(desc(VitalSigns.recorded_at)).first()
        
        return vital
    
    @staticmethod
    def get_vital_signs_by_id(db: Session, vital_id: int) -> VitalSigns:
        """Get vital signs record by ID."""
        
        vital = db.query(VitalSigns).filter(VitalSigns.id == vital_id).first()
        
        if not vital:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vital signs record not found"
            )
        
        return vital
    
    @staticmethod
    def update_vital_signs(
        db: Session,
        vital_id: int,
        **updates
    ) -> VitalSigns:
        """Update a vital signs record."""
        
        vital = VitalSignsService.get_vital_signs_by_id(db, vital_id)
        
        for key, value in updates.items():
            if value is not None and hasattr(vital, key):
                setattr(vital, key, value)
        
        db.commit()
        db.refresh(vital)
        
        return vital
    
    @staticmethod
    def delete_vital_signs(db: Session, vital_id: int) -> None:
        """Delete a vital signs record."""
        
        vital = VitalSignsService.get_vital_signs_by_id(db, vital_id)
        db.delete(vital)
        db.commit()
