"""Prescription service."""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from app.models import Prescription, PrescriptionStatusEnum
from fastapi import HTTPException, status


class PrescriptionService:
    """Service for prescription operations."""
    
    @staticmethod
    def create_prescription(db: Session, doctor_id: int, **kwargs) -> Prescription:
        """
        Create a new prescription.
        
        Args:
            db: Database session
            doctor_id: ID of doctor creating prescription
            **kwargs: Prescription data
            
        Returns:
            Created Prescription object
        """
        prescription = Prescription(
            doctor_id=doctor_id,
            issued_date=datetime.utcnow(),
            **kwargs
        )
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        return prescription
    
    @staticmethod
    def get_prescription_by_id(db: Session, prescription_id: int) -> Prescription:
        """
        Get prescription by ID.
        
        Args:
            db: Database session
            prescription_id: Prescription ID
            
        Returns:
            Prescription object
            
        Raises:
            HTTPException: If not found
        """
        prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
        if not prescription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prescription not found"
            )
        return prescription
    
    @staticmethod
    def get_patient_prescriptions(
        db: Session, 
        patient_id: int, 
        skip: int = 0, 
        limit: int = 100, 
        status_filter: str = None
    ) -> tuple:
        """
        Get prescriptions for a patient.
        
        Args:
            db: Database session
            patient_id: Patient ID
            skip: Number to skip
            limit: Max to return
            status_filter: Optional status filter
            
        Returns:
            Tuple of (total_count, prescriptions)
        """
        query = db.query(Prescription).filter(Prescription.patient_id == patient_id)
        
        if status_filter:
            query = query.filter(Prescription.status == status_filter)
        
        total = query.count()
        prescriptions = query.order_by(Prescription.issued_date.desc()).offset(skip).limit(limit).all()
        
        return total, prescriptions
    
    @staticmethod
    def get_doctor_prescriptions(
        db: Session, 
        doctor_id: int, 
        skip: int = 0, 
        limit: int = 100, 
        status_filter: str = None
    ) -> tuple:
        """
        Get prescriptions issued by a doctor.
        
        Args:
            db: Database session
            doctor_id: Doctor ID
            skip: Number to skip
            limit: Max to return
            status_filter: Optional status filter
            
        Returns:
            Tuple of (total_count, prescriptions)
        """
        query = db.query(Prescription).filter(Prescription.doctor_id == doctor_id)
        
        if status_filter:
            query = query.filter(Prescription.status == status_filter)
        
        total = query.count()
        prescriptions = query.order_by(Prescription.issued_date.desc()).offset(skip).limit(limit).all()
        
        return total, prescriptions
    
    @staticmethod
    def get_pending_dispensing_prescriptions(
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> tuple:
        """
        Get prescriptions pending dispensing (active status).
        
        Args:
            db: Database session
            skip: Number to skip
            limit: Max to return
            
        Returns:
            Tuple of (total_count, prescriptions)
        """
        query = db.query(Prescription).filter(
            Prescription.status == PrescriptionStatusEnum.ACTIVE
        )
        
        total = query.count()
        prescriptions = query.order_by(Prescription.issued_date.asc()).offset(skip).limit(limit).all()
        
        return total, prescriptions
    
    @staticmethod
    def update_prescription(db: Session, prescription_id: int, current_user_id: int, **kwargs) -> Prescription:
        """
        Update a prescription (only by issuing doctor).
        
        Args:
            db: Database session
            prescription_id: Prescription ID
            current_user_id: ID of user updating (must be the doctor)
            **kwargs: Fields to update
            
        Returns:
            Updated Prescription object
            
        Raises:
            HTTPException: If not found or unauthorized
        """
        prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
        
        # Only doctor can edit their own prescription
        if prescription.doctor_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the prescribing doctor can edit this prescription"
            )
        
        # Can only edit if still active and not yet dispensed
        if prescription.status != PrescriptionStatusEnum.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot edit prescription with status {prescription.status}"
            )
        
        if prescription.quantity_dispensed > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot edit prescription that has already been partially or fully dispensed"
            )
        
        for key, value in kwargs.items():
            if hasattr(prescription, key) and value is not None:
                setattr(prescription, key, value)
        
        db.commit()
        db.refresh(prescription)
        return prescription
    
    @staticmethod
    def cancel_prescription(
        db: Session, 
        prescription_id: int, 
        current_user_id: int, 
        cancellation_reason: str
    ) -> Prescription:
        """
        Cancel a prescription.
        
        Args:
            db: Database session
            prescription_id: Prescription ID
            current_user_id: ID of user cancelling (doctor or admin)
            cancellation_reason: Reason for cancellation
            
        Returns:
            Cancelled Prescription object
            
        Raises:
            HTTPException: If not found, unauthorized, or invalid status
        """
        prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
        
        # Only doctor or admin can cancel
        if prescription.doctor_id != current_user_id:
            # Admin check would be done in the route
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the prescribing doctor can cancel this prescription"
            )
        
        # Can't cancel if already cancelled or completed
        if prescription.status in [PrescriptionStatusEnum.CANCELLED, PrescriptionStatusEnum.COMPLETED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel prescription with status {prescription.status}"
            )
        
        prescription.status = PrescriptionStatusEnum.CANCELLED
        prescription.cancelled_date = datetime.utcnow()
        prescription.cancellation_reason = cancellation_reason
        prescription.cancelled_by_id = current_user_id
        
        db.commit()
        db.refresh(prescription)
        return prescription
    
    @staticmethod
    def dispense_prescription(
        db: Session,
        prescription_id: int,
        pharmacist_id: int,
        quantity_dispensed: int
    ) -> Prescription:
        """
        Dispense a prescription (pharmacist action).
        
        Args:
            db: Database session
            prescription_id: Prescription ID
            pharmacist_id: ID of pharmacist dispensing
            quantity_dispensed: Quantity being dispensed
            
        Returns:
            Updated Prescription object
            
        Raises:
            HTTPException: If not found, invalid quantity, or invalid status
        """
        prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
        
        # Can only dispense if active
        if prescription.status != PrescriptionStatusEnum.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot dispense prescription with status {prescription.status}"
            )
        
        # Check if quantity is valid
        already_dispensed = prescription.quantity_dispensed
        remaining = prescription.quantity - already_dispensed
        
        if quantity_dispensed <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quantity dispensed must be greater than 0"
            )
        
        if quantity_dispensed > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot dispense {quantity_dispensed}. Only {remaining} units remaining"
            )
        
        # Update dispensing information
        prescription.quantity_dispensed += quantity_dispensed
        prescription.dispensed_by_id = pharmacist_id
        prescription.dispensed_date = datetime.utcnow()
        
        # If fully dispensed, mark as dispensed
        if prescription.quantity_dispensed >= prescription.quantity:
            prescription.status = PrescriptionStatusEnum.DISPENSED
        
        db.commit()
        db.refresh(prescription)
        return prescription
    
    @staticmethod
    def mark_prescription_completed(db: Session, prescription_id: int) -> Prescription:
        """
        Mark a prescription as completed.
        
        Args:
            db: Database session
            prescription_id: Prescription ID
            
        Returns:
            Updated Prescription object
        """
        prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
        
        if prescription.status not in [PrescriptionStatusEnum.DISPENSED, PrescriptionStatusEnum.ACTIVE]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete prescription with status {prescription.status}"
            )
        
        prescription.status = PrescriptionStatusEnum.COMPLETED
        db.commit()
        db.refresh(prescription)
        return prescription

    @staticmethod
    def request_refill(db: Session, prescription_id: int, patient_id: int) -> Prescription:
        """
        Request a refill for a prescription.

        Args:
            db: Database session
            prescription_id: Prescription ID
            patient_id: Patient requesting refill

        Returns:
            Updated Prescription object
        """
        prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)

        if prescription.patient_id != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot request refill for another patient's prescription"
            )

        if prescription.status in [PrescriptionStatusEnum.CANCELLED, PrescriptionStatusEnum.COMPLETED, PrescriptionStatusEnum.EXPIRED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot request refill for prescription with status {prescription.status}"
            )

        if prescription.refills_used >= prescription.refills_allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No remaining refills available"
            )

        prescription.status = PrescriptionStatusEnum.REFILL_REQUESTED
        db.commit()
        db.refresh(prescription)
        return prescription
    
    @staticmethod
    def get_expired_prescriptions(db: Session) -> list:
        """
        Get expired prescriptions (where expiry_date < now).
        
        Args:
            db: Database session
            
        Returns:
            List of expired prescriptions still marked as active
        """
        now = datetime.utcnow()
        prescriptions = db.query(Prescription).filter(
            and_(
                Prescription.expiry_date < now,
                Prescription.status == PrescriptionStatusEnum.ACTIVE
            )
        ).all()
        
        # Mark them as expired
        for prescription in prescriptions:
            prescription.status = PrescriptionStatusEnum.EXPIRED
        
        db.commit()
        return prescriptions
    
    @staticmethod
    def search_prescriptions(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        patient_id: int = None,
        doctor_id: int = None,
        status_filter: str = None,
        medication_name: str = None
    ) -> tuple:
        """
        Search prescriptions with multiple filters.
        
        Args:
            db: Database session
            skip: Number to skip
            limit: Max to return
            patient_id: Filter by patient
            doctor_id: Filter by doctor
            status_filter: Filter by status
            medication_name: Search by medication name
            
        Returns:
            Tuple of (total_count, prescriptions)
        """
        query = db.query(Prescription)
        
        if patient_id:
            query = query.filter(Prescription.patient_id == patient_id)
        
        if doctor_id:
            query = query.filter(Prescription.doctor_id == doctor_id)
        
        if status_filter:
            query = query.filter(Prescription.status == status_filter)
        
        if medication_name:
            query = query.filter(Prescription.medication_name.ilike(f"%{medication_name}%"))
        
        total = query.count()
        prescriptions = query.order_by(Prescription.issued_date.desc()).offset(skip).limit(limit).all()
        
        return total, prescriptions
