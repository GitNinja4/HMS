"""Vital signs routes for patient health metrics."""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import VitalSignsService, UserService
from app.security.auth import require_role
from app.schemas import VitalSignsCreateRequest, VitalSignsResponse

router = APIRouter(prefix="/api/vital-signs", tags=["vital-signs"])


@router.post("", response_model=VitalSignsResponse, status_code=status.HTTP_201_CREATED)
async def create_vital_signs(
    request: VitalSignsCreateRequest,
    current_user: dict = Depends(require_role("admin", "doctor", "nurse")),
    db: Session = Depends(get_db),
):
    """Record vital signs for a patient."""
    # Verify patient exists
    try:
        UserService.get_user_by_id(db, request.patient_id)
    except HTTPException:
        raise

    vital = VitalSignsService.create_vital_signs(
        db,
        patient_id=request.patient_id,
        temperature=request.temperature,
        blood_pressure_systolic=request.blood_pressure_systolic,
        blood_pressure_diastolic=request.blood_pressure_diastolic,
        heart_rate=request.heart_rate,
        respiratory_rate=request.respiratory_rate,
        oxygen_saturation=request.oxygen_saturation,
        weight=request.weight,
        height=request.height,
        recorded_by_id=current_user["user_id"],
        notes=request.notes,
    )

    return VitalSignsResponse.from_orm(vital)
