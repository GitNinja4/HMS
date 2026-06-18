"""Appointment service."""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from app.models import Appointment, AppointmentStatusEnum
from fastapi import HTTPException, status


class AppointmentService:
    """Service for appointment operations."""
    
    @staticmethod
    def create_appointment(db: Session, **kwargs) -> Appointment:
        """
        Create a new appointment.
        
        Args:
            db: Database session
            **kwargs: Appointment data
            
        Returns:
            Created Appointment object
        """
        appointment = Appointment(**kwargs)
        db.add(appointment)
        db.commit()
        db.refresh(appointment)
        return appointment
    
    @staticmethod
    def get_appointment_by_id(db: Session, appointment_id: int) -> Appointment:
        """
        Get appointment by ID.
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            
        Returns:
            Appointment object
            
        Raises:
            HTTPException: If not found
        """
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appointment not found"
            )
        return appointment
    
    @staticmethod
    def get_patient_appointments(db: Session, patient_id: int, skip: int = 0, limit: int = 100, status_filter: str = None) -> tuple:
        """
        Get appointments for a patient.
        
        Args:
            db: Database session
            patient_id: Patient ID
            skip: Number to skip
            limit: Max to return
            status_filter: Optional status filter
            
        Returns:
            Tuple of (total_count, appointments)
        """
        query = db.query(Appointment).filter(Appointment.patient_id == patient_id)
        
        if status_filter:
            query = query.filter(Appointment.status == status_filter)
        
        total = query.count()
        appointments = query.order_by(Appointment.scheduled_at.desc()).offset(skip).limit(limit).all()
        
        return total, appointments
    
    @staticmethod
    def get_doctor_appointments(db: Session, doctor_id: int, skip: int = 0, limit: int = 100, status_filter: str = None) -> tuple:
        """
        Get appointments for a doctor.
        
        Args:
            db: Database session
            doctor_id: Doctor ID
            skip: Number to skip
            limit: Max to return
            status_filter: Optional status filter
            
        Returns:
            Tuple of (total_count, appointments)
        """
        query = db.query(Appointment).filter(Appointment.doctor_id == doctor_id)
        
        if status_filter:
            query = query.filter(Appointment.status == status_filter)
        
        total = query.count()
        appointments = query.order_by(Appointment.scheduled_at.desc()).offset(skip).limit(limit).all()
        
        return total, appointments
    
    @staticmethod
    def get_doctor_availability(db: Session, doctor_id: int, date: datetime) -> list:
        """
        Get available time slots for a doctor on a specific date.
        
        Args:
            db: Database session
            doctor_id: Doctor ID
            date: Date to check availability
            
        Returns:
            List of available appointment times
        """
        # Get all appointments for the doctor on that day
        day_start = datetime(date.year, date.month, date.day, 0, 0, 0)
        day_end = datetime(date.year, date.month, date.day, 23, 59, 59)
        
        appointments = db.query(Appointment).filter(
            and_(
                Appointment.doctor_id == doctor_id,
                Appointment.scheduled_at >= day_start,
                Appointment.scheduled_at <= day_end,
                Appointment.status != AppointmentStatusEnum.CANCELLED
            )
        ).all()
        
        # Calculate booked times
        booked_times = set()
        for apt in appointments:
            # Add 30-minute slots for each appointment
            for minute in range(0, apt.duration_minutes, 30):
                slot_time = apt.scheduled_at.replace(minute=(apt.scheduled_at.minute + minute) % 60, hour=(apt.scheduled_at.hour + (apt.scheduled_at.minute + minute) // 60))
                booked_times.add(slot_time)
        
        # Generate available slots (9 AM to 5 PM in 30-min increments)
        available_slots = []
        for hour in range(9, 17):  # 9 AM to 5 PM
            for minute in [0, 30]:
                slot_time = datetime(date.year, date.month, date.day, hour, minute)
                if slot_time not in booked_times and slot_time > datetime.now():
                    available_slots.append(slot_time.isoformat())
        
        return available_slots
    
    @staticmethod
    def update_appointment(db: Session, appointment_id: int, **kwargs) -> Appointment:
        """
        Update appointment.
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            **kwargs: Fields to update
            
        Returns:
            Updated Appointment object
        """
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        
        allowed_fields = {
            'title', 'description', 'appointment_type', 'scheduled_at',
            'duration_minutes', 'location', 'meeting_link', 'notes', 'patient_notes'
        }
        
        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(appointment, key, value)
        
        db.commit()
        db.refresh(appointment)
        return appointment
    
    @staticmethod
    def update_appointment_status(db: Session, appointment_id: int, status: str, cancellation_reason: str = None) -> Appointment:
        """
        Update appointment status.
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            status: New status
            cancellation_reason: Reason if cancelling
            
        Returns:
            Updated Appointment object
        """
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        appointment.status = status
        
        if status == AppointmentStatusEnum.CANCELLED:
            appointment.cancellation_reason = cancellation_reason
        
        db.commit()
        db.refresh(appointment)
        return appointment
    
    @staticmethod
    def cancel_appointment(db: Session, appointment_id: int, reason: str = None) -> Appointment:
        """
        Cancel an appointment.
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            reason: Cancellation reason
            
        Returns:
            Updated Appointment object
        """
        return AppointmentService.update_appointment_status(
            db, appointment_id, AppointmentStatusEnum.CANCELLED, reason
        )
    
    @staticmethod
    def accept_appointment(db: Session, appointment_id: int, notes: str = None) -> Appointment:
        """
        Accept an appointment (doctor only).
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            notes: Optional notes from doctor
            
        Returns:
            Updated Appointment object
        """
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        
        if appointment.status not in [AppointmentStatusEnum.SCHEDULED, AppointmentStatusEnum.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot accept appointment with status {appointment.status}"
            )
        
        appointment.status = AppointmentStatusEnum.CONFIRMED
        if notes:
            appointment.notes = notes
        
        db.commit()
        db.refresh(appointment)
        return appointment
    
    @staticmethod
    def reject_appointment(db: Session, appointment_id: int, reason: str = None) -> Appointment:
        """
        Reject an appointment (doctor only).
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            reason: Reason for rejection
            
        Returns:
            Updated Appointment object
        """
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        
        if appointment.status not in [AppointmentStatusEnum.SCHEDULED, AppointmentStatusEnum.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot reject appointment with status {appointment.status}"
            )
        
        appointment.status = AppointmentStatusEnum.CANCELLED
        if reason:
            appointment.cancellation_reason = reason
        
        db.commit()
        db.refresh(appointment)
        return appointment
    
    @staticmethod
    def reschedule_appointment(db: Session, appointment_id: int, new_scheduled_at: datetime, reason: str = None) -> Appointment:
        """
        Reschedule an appointment.
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            new_scheduled_at: New appointment datetime
            reason: Reason for rescheduling
            
        Returns:
            Updated Appointment object
        """
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        
        if appointment.status == AppointmentStatusEnum.CANCELLED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot reschedule cancelled appointment"
            )
        
        # Check if new time is available
        conflicting = db.query(Appointment).filter(
            and_(
                Appointment.doctor_id == appointment.doctor_id,
                Appointment.scheduled_at == new_scheduled_at,
                Appointment.status != AppointmentStatusEnum.CANCELLED,
                Appointment.id != appointment_id
            )
        ).first()
        
        if conflicting:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Doctor already has an appointment at this time"
            )
        
        appointment.scheduled_at = new_scheduled_at
        if reason:
            appointment.notes = f"{appointment.notes or ''}\nRescheduled: {reason}".strip()
        
        db.commit()
        db.refresh(appointment)
        return appointment
    
    @staticmethod
    def assign_nurse(db: Session, appointment_id: int, nurse_id: int) -> Appointment:
        """
        Assign a nurse to an appointment.
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            nurse_id: Nurse ID
            
        Returns:
            Updated Appointment object
        """
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        appointment.nurse_id = nurse_id
        
        db.commit()
        db.refresh(appointment)
        return appointment
    
    @staticmethod
    def get_appointments_for_nurse(db: Session, nurse_id: int, skip: int = 0, limit: int = 100) -> tuple:
        """
        Get appointments assigned to a nurse.
        
        Args:
            db: Database session
            nurse_id: Nurse ID
            skip: Number to skip
            limit: Max to return
            
        Returns:
            Tuple of (total_count, appointments)
        """
        query = db.query(Appointment).filter(
            and_(
                Appointment.nurse_id == nurse_id,
                Appointment.status != AppointmentStatusEnum.CANCELLED
            )
        )
        
        total = query.count()
        appointments = query.order_by(Appointment.scheduled_at.asc()).offset(skip).limit(limit).all()
        
        return total, appointments
    
    @staticmethod
    def mark_appointment_completed(db: Session, appointment_id: int) -> Appointment:
        """
        Mark an appointment as completed.
        
        Args:
            db: Database session
            appointment_id: Appointment ID
            
        Returns:
            Updated Appointment object
        """
        appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
        
        if appointment.status not in [AppointmentStatusEnum.IN_PROGRESS, AppointmentStatusEnum.CONFIRMED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot complete appointment with status {appointment.status}"
            )
        
        appointment.status = AppointmentStatusEnum.COMPLETED
        
        db.commit()
        db.refresh(appointment)
        return appointment
