"""Appointment management routes."""

from fastapi import APIRouter, Depends, status, Query, HTTPException, Body
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import AppointmentService
from app.security.auth import get_current_user, require_role
from app.schemas import (
    AppointmentCreateRequest, AppointmentUpdateRequest, 
    AppointmentStatusUpdateRequest, AppointmentResponse, AppointmentListResponse
)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    request: AppointmentCreateRequest,
    current_user: dict = Depends(require_role("admin", "doctor", "patient")),
    db: Session = Depends(get_db)
):
    """
    Create a new appointment.
    - Doctors and admins can create appointments
    - Patients can request appointments (may require approval)
    """
    # Verify doctor and patient exist
    from app.services import UserService
    try:
        doctor = UserService.get_user_by_id(db, request.doctor_id)
        patient = UserService.get_user_by_id(db, request.patient_id)
    except HTTPException as e:
        raise e
    
    appointment = AppointmentService.create_appointment(
        db,
        patient_id=request.patient_id,
        doctor_id=request.doctor_id,
        title=request.title,
        description=request.description,
        appointment_type=request.appointment_type,
        scheduled_at=request.scheduled_at,
        duration_minutes=request.duration_minutes,
        location=request.location,
        meeting_link=request.meeting_link,
        patient_notes=request.patient_notes,
    )
    
    return AppointmentResponse.from_orm(appointment)


@router.get("", response_model=AppointmentListResponse)
async def list_appointments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List appointments accessible to current user.
    - Patients see their own appointments
    - Doctors see their scheduled appointments
    - Admins see all appointments
    """
    from app.services import UserService
    
    if current_user["role"] == "admin":
        # Admin sees all appointments
        from app.models import Appointment
        total = db.query(Appointment).count()
        appointments = db.query(Appointment).offset(skip).limit(limit).all()
    elif current_user["role"] == "doctor":
        # Doctor sees their scheduled appointments
        total, appointments = AppointmentService.get_doctor_appointments(
            db, current_user["user_id"], skip, limit
        )
    else:  # Patient
        # Patient sees their appointments
        total, appointments = AppointmentService.get_patient_appointments(
            db, current_user["user_id"], skip, limit
        )
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "appointments": [AppointmentResponse.from_orm(apt) for apt in appointments]
    }


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get appointment details.
    - Users can only view their own appointments unless they're admin
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    is_involved = (
        appointment.patient_id == current_user["user_id"] or
        appointment.doctor_id == current_user["user_id"]
    )
    
    if current_user["role"] != "admin" and not is_involved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view this appointment"
        )
    
    return AppointmentResponse.from_orm(appointment)


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    request: AppointmentUpdateRequest,
    current_user: dict = Depends(require_role("admin", "doctor")),
    db: Session = Depends(get_db)
):
    """
    Update appointment details (admin or scheduling doctor only).
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    if current_user["role"] != "admin" and appointment.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update this appointment"
        )
    
    update_data = request.model_dump(exclude_unset=True)
    appointment = AppointmentService.update_appointment(db, appointment_id, **update_data)
    
    return AppointmentResponse.from_orm(appointment)


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
async def update_appointment_status(
    appointment_id: int,
    request: AppointmentStatusUpdateRequest,
    current_user: dict = Depends(require_role("admin", "doctor")),
    db: Session = Depends(get_db)
):
    """
    Update appointment status (admin or doctor only).
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    if current_user["role"] != "admin" and appointment.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update this appointment"
        )
    
    appointment = AppointmentService.update_appointment_status(
        db, appointment_id, request.status, request.cancellation_reason
    )
    
    return AppointmentResponse.from_orm(appointment)


@router.delete("/{appointment_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_appointment(
    appointment_id: int,
    reason: str = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel an appointment.
    - Patients can cancel their own appointments
    - Doctors can cancel their scheduled appointments
    - Admins can cancel any appointment
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    is_involved = (
        appointment.patient_id == current_user["user_id"] or
        appointment.doctor_id == current_user["user_id"]
    )
    
    if current_user["role"] != "admin" and not is_involved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot cancel this appointment"
        )
    
    appointment = AppointmentService.cancel_appointment(db, appointment_id, reason)
    
    return {
        "message": "Appointment cancelled successfully",
        "appointment": AppointmentResponse.from_orm(appointment)
    }


@router.get("/doctor/{doctor_id}/availability", response_model=dict)
async def get_doctor_availability(
    doctor_id: int,
    date: str = Query(..., description="Date in ISO format (YYYY-MM-DD)"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get available time slots for a doctor on a specific date.
    """
    from datetime import datetime
    
    try:
        appointment_date = datetime.fromisoformat(date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use ISO format (YYYY-MM-DD)"
        )
    
    available_slots = AppointmentService.get_doctor_availability(db, doctor_id, appointment_date)
    
    return {
        "doctor_id": doctor_id,
        "date": date,
        "available_slots": available_slots
    }


@router.get("/patient/{patient_id}/appointments", response_model=AppointmentListResponse)
async def get_patient_appointments(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    status: str = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all appointments for a patient.
    - Patients can view their own
    - Doctors can view their patients' appointments
    - Admins can view any patient's appointments
    """
    # Check authorization
    if (current_user["role"] != "admin" and 
        current_user["role"] != "doctor" and
        current_user["user_id"] != patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view this patient's appointments"
        )
    
    total, appointments = AppointmentService.get_patient_appointments(
        db, patient_id, skip, limit, status
    )
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "appointments": [AppointmentResponse.from_orm(apt) for apt in appointments]
    }


@router.get("/doctor/{doctor_id}/appointments", response_model=AppointmentListResponse)
async def get_doctor_appointments(
    doctor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    status: str = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all appointments for a doctor.
    - Doctors can view their own
    - Admins can view any doctor's appointments
    """
    # Check authorization
    if (current_user["role"] != "admin" and 
        current_user["user_id"] != doctor_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view this doctor's appointments"
        )
    
    total, appointments = AppointmentService.get_doctor_appointments(
        db, doctor_id, skip, limit, status
    )
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "appointments": [AppointmentResponse.from_orm(apt) for apt in appointments]
    }


@router.post("/{appointment_id}/accept", response_model=AppointmentResponse)
async def accept_appointment(
    appointment_id: int,
    notes: Optional[str] = Body(None),
    current_user: dict = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    """
    Accept an appointment (doctor or admin only).
    Changes status from scheduled to confirmed.
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization - doctor must be the one scheduled for appointment
    if current_user["role"] != "admin" and appointment.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot accept this appointment"
        )
    
    appointment = AppointmentService.accept_appointment(db, appointment_id, notes)
    return AppointmentResponse.from_orm(appointment)


@router.post("/{appointment_id}/reject", response_model=AppointmentResponse)
async def reject_appointment(
    appointment_id: int,
    reason: str = Query(None),
    current_user: dict = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    """
    Reject an appointment (doctor or admin only).
    Changes status to cancelled.
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    if current_user["role"] != "admin" and appointment.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot reject this appointment"
        )
    
    appointment = AppointmentService.reject_appointment(db, appointment_id, reason)
    return AppointmentResponse.from_orm(appointment)


@router.post("/{appointment_id}/reschedule", response_model=AppointmentResponse)
async def reschedule_appointment(
    appointment_id: int,
    new_scheduled_at: datetime = Query(..., description="New appointment datetime in ISO format"),
    reason: str = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reschedule an appointment.
    - Patients can reschedule their own
    - Doctors can reschedule their scheduled appointments
    - Admins can reschedule any appointment
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    is_involved = (
        appointment.patient_id == current_user["user_id"] or
        appointment.doctor_id == current_user["user_id"]
    )
    
    if current_user["role"] != "admin" and not is_involved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot reschedule this appointment"
        )
    
    appointment = AppointmentService.reschedule_appointment(
        db, appointment_id, new_scheduled_at, reason
    )
    return AppointmentResponse.from_orm(appointment)


@router.post("/{appointment_id}/assign-nurse", response_model=AppointmentResponse)
async def assign_nurse_to_appointment(
    appointment_id: int,
    nurse_id: int = Query(...),
    current_user: dict = Depends(require_role("admin", "doctor")),
    db: Session = Depends(get_db)
):
    """
    Assign a nurse to an appointment (admin or doctor only).
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    if current_user["role"] != "admin" and appointment.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot assign nurse to this appointment"
        )
    
    # Verify nurse exists
    from app.services import UserService
    try:
        nurse = UserService.get_user_by_id(db, nurse_id)
        if nurse.role != "nurse":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a nurse"
            )
    except HTTPException as e:
        raise e
    
    appointment = AppointmentService.assign_nurse(db, appointment_id, nurse_id)
    return AppointmentResponse.from_orm(appointment)


@router.get("/nurse/{nurse_id}/assignments", response_model=AppointmentListResponse)
async def get_nurse_appointments(
    nurse_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get appointments assigned to a nurse.
    - Nurses can view their own assignments
    - Admins can view any nurse's assignments
    """
    # Check authorization
    if (current_user["role"] != "admin" and 
        current_user["user_id"] != nurse_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view this nurse's assignments"
        )
    
    total, appointments = AppointmentService.get_appointments_for_nurse(
        db, nurse_id, skip, limit
    )
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "appointments": [AppointmentResponse.from_orm(apt) for apt in appointments]
    }


@router.post("/{appointment_id}/mark-completed", response_model=AppointmentResponse)
async def mark_appointment_completed(
    appointment_id: int,
    current_user: dict = Depends(require_role("doctor", "admin")),
    db: Session = Depends(get_db)
):
    """
    Mark an appointment as completed (doctor or admin only).
    """
    appointment = AppointmentService.get_appointment_by_id(db, appointment_id)
    
    # Check authorization
    if current_user["role"] != "admin" and appointment.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot mark this appointment as completed"
        )
    
    appointment = AppointmentService.mark_appointment_completed(db, appointment_id)
    return AppointmentResponse.from_orm(appointment)
