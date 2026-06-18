"""Prescription management routes."""

from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import PrescriptionService, UserService
from app.security.auth import get_current_user, require_role
from app.schemas import (
    PrescriptionCreateRequest, PrescriptionUpdateRequest, PrescriptionDispenseRequest,
    PrescriptionCancelRequest, PrescriptionResponse, PrescriptionListResponse,
    PrescriptionHistoryResponse
)

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


@router.post("", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_prescription(
    request: PrescriptionCreateRequest,
    current_user: dict = Depends(require_role("admin", "doctor")),
    db: Session = Depends(get_db)
):
    """
    Create a new prescription.
    - Only doctors and admins can create prescriptions
    - Doctor ID is set from current user
    """
    # Verify patient exists
    try:
        patient = UserService.get_user_by_id(db, request.patient_id)
    except HTTPException as e:
        raise e
    
    # Create prescription
    prescription = PrescriptionService.create_prescription(
        db,
        doctor_id=current_user["user_id"],
        patient_id=request.patient_id,
        appointment_id=request.appointment_id,
        medication_name=request.medication_name,
        dosage=request.dosage,
        frequency=request.frequency,
        duration=request.duration,
        route=request.route,
        quantity=request.quantity,
        instructions=request.instructions,
        warnings=request.warnings,
        refills_allowed=request.refills_allowed,
        expiry_date=request.expiry_date,
    )
    
    return PrescriptionResponse.from_orm(prescription)


@router.get("", response_model=PrescriptionListResponse)
async def list_prescriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    status_filter: str = Query(None, description="Filter by status"),
    medication_name: str = Query(None, description="Search by medication name"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List prescriptions accessible to current user.
    - Patients see their own prescriptions
    - Doctors see prescriptions they issued
    - Pharmacists see all active prescriptions (for dispensing)
    - Admins see all prescriptions
    """
    if current_user["role"] == "admin":
        # Admin sees all prescriptions
        total, prescriptions = PrescriptionService.search_prescriptions(
            db, skip=skip, limit=limit, status_filter=status_filter, 
            medication_name=medication_name
        )
    elif current_user["role"] == "doctor":
        # Doctor sees prescriptions they issued
        total, prescriptions = PrescriptionService.get_doctor_prescriptions(
            db, current_user["user_id"], skip, limit, status_filter
        )
    elif current_user["role"] == "pharmacist":
        # Pharmacist sees active/dispensed prescriptions
        total, prescriptions = PrescriptionService.search_prescriptions(
            db, skip=skip, limit=limit, status_filter=status_filter,
            medication_name=medication_name
        )
    else:  # Patient
        # Patient sees their own prescriptions
        total, prescriptions = PrescriptionService.get_patient_prescriptions(
            db, current_user["user_id"], skip, limit, status_filter
        )
    
    return {
        "total": total,
        "count": len(prescriptions),
        "prescriptions": [PrescriptionResponse.from_orm(p) for p in prescriptions]
    }


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(
    prescription_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get prescription details.
    - Patients can view their own prescriptions
    - Doctors can view their issued prescriptions
    - Pharmacists can view for dispensing
    - Admins can view any prescription
    """
    prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
    
    # Check authorization
    is_patient = prescription.patient_id == current_user["user_id"]
    is_doctor = prescription.doctor_id == current_user["user_id"]
    is_admin = current_user["role"] == "admin"
    is_pharmacist = current_user["role"] == "pharmacist"
    
    if not (is_patient or is_doctor or is_admin or is_pharmacist):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view this prescription"
        )
    
    return PrescriptionResponse.from_orm(prescription)


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
async def update_prescription(
    prescription_id: int,
    request: PrescriptionUpdateRequest,
    current_user: dict = Depends(require_role("admin", "doctor")),
    db: Session = Depends(get_db)
):
    """
    Update prescription details.
    - Only the issuing doctor can edit their prescription
    - Can only edit if prescription is still active and not yet dispensed
    """
    prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
    
    # Authorization check - only issuing doctor can edit
    if current_user["role"] != "admin" and prescription.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit this prescription"
        )
    
    update_data = request.model_dump(exclude_unset=True)
    prescription = PrescriptionService.update_prescription(
        db, prescription_id, current_user["user_id"], **update_data
    )
    
    return PrescriptionResponse.from_orm(prescription)


@router.patch("/{prescription_id}/cancel", response_model=PrescriptionResponse)
async def cancel_prescription(
    prescription_id: int,
    request: PrescriptionCancelRequest,
    current_user: dict = Depends(require_role("admin", "doctor")),
    db: Session = Depends(get_db)
):
    """
    Cancel a prescription.
    - Only the issuing doctor or admin can cancel
    - Provides reason for cancellation
    """
    prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
    
    # Authorization check
    if current_user["role"] != "admin" and prescription.doctor_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot cancel this prescription"
        )
    
    prescription = PrescriptionService.cancel_prescription(
        db, prescription_id, current_user["user_id"], request.cancellation_reason
    )
    
    return PrescriptionResponse.from_orm(prescription)


@router.patch("/{prescription_id}/dispense", response_model=PrescriptionResponse)
async def dispense_prescription(
    prescription_id: int,
    request: PrescriptionDispenseRequest,
    current_user: dict = Depends(require_role("admin", "pharmacist")),
    db: Session = Depends(get_db)
):
    """
    Dispense a prescription (pharmacist action).
    - Only pharmacists and admins can dispense
    - Tracks quantity dispensed and marks as dispensed when full quantity is given
    """
    prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)
    
    prescription = PrescriptionService.dispense_prescription(
        db, prescription_id, current_user["user_id"], request.quantity_dispensed
    )
    
    return PrescriptionResponse.from_orm(prescription)


@router.get("/patient/{patient_id}/history", response_model=PrescriptionListResponse)
async def get_prescription_history(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get prescription history for a patient.
    - Patients can view their own history
    - Doctors can view their patients' history
    - Pharmacists can view any history
    - Admins can view any history
    """
    # Authorization check
    if current_user["role"] not in ["admin", "pharmacist"] and current_user["user_id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view this patient's prescription history"
        )
    
    # Get all prescriptions (completed, dispensed, cancelled, expired)
    total, prescriptions = PrescriptionService.get_patient_prescriptions(
        db, patient_id, skip, limit
    )
    
    return {
        "total": total,
        "count": len(prescriptions),
        "prescriptions": [PrescriptionResponse.from_orm(p) for p in prescriptions]
    }


@router.get("/pharmacist/pending", response_model=PrescriptionListResponse)
async def get_pending_dispensing(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(require_role("admin", "pharmacist")),
    db: Session = Depends(get_db)
):
    """
    Get prescriptions pending dispensing (active status).
    - Only pharmacists and admins can access
    - Shows prescriptions waiting to be dispensed
    """
    total, prescriptions = PrescriptionService.get_pending_dispensing_prescriptions(
        db, skip, limit
    )
    
    return {
        "total": total,
        "count": len(prescriptions),
        "prescriptions": [PrescriptionResponse.from_orm(p) for p in prescriptions]
    }


@router.post("/{prescription_id}/refill-request", response_model=PrescriptionResponse)
async def request_prescription_refill(
    prescription_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Request a refill for a prescription.

    - Patients may request refills for their own prescriptions.
    """
    prescription = PrescriptionService.get_prescription_by_id(db, prescription_id)

    if current_user["role"] != "patient" or prescription.patient_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot request refill for this prescription"
        )

    prescription = PrescriptionService.request_refill(db, prescription_id, current_user["user_id"])
    return PrescriptionResponse.from_orm(prescription)


@router.get("/doctor/{doctor_id}/issued", response_model=PrescriptionListResponse)
async def get_doctor_issued_prescriptions(
    doctor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    status_filter: str = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all prescriptions issued by a doctor.
    - Doctors can view their own issued prescriptions
    - Admins can view any doctor's prescriptions
    """
    # Authorization check
    if current_user["role"] != "admin" and current_user["user_id"] != doctor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view this doctor's prescriptions"
        )
    
    total, prescriptions = PrescriptionService.get_doctor_prescriptions(
        db, doctor_id, skip, limit, status_filter
    )
    
    return {
        "total": total,
        "count": len(prescriptions),
        "prescriptions": [PrescriptionResponse.from_orm(p) for p in prescriptions]
    }
