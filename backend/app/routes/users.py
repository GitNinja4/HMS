"""User management routes with security validation."""

from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import UserService, VitalSignsService
from app.security.auth import get_current_user, require_role
from app.schemas import (
    UserStatusResponse, UserUpdateRequest, UserResponse, 
    UserListResponse, UserBanRequest, StatusChangeRequest,
    AssignDoctorRequest, AssignNurseRequest, VitalSignsCreateRequest,
    VitalSignsListResponse, VitalSignsResponse, HealthProfileResponse
)
from app.utils.validators import InputValidator
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=UserListResponse, status_code=status.HTTP_200_OK)
async def list_users(
    skip: int = Query(0, ge=0, le=10000),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    List all users (admin only, paginated).
    
    - **skip**: Number of users to skip (0-10000)
    - **limit**: Max users per page (1-1000, default 100)
    """
    # Validate pagination parameters
    skip, limit = InputValidator.validate_pagination(skip, limit, max_limit=1000)
    
    from app.models import User
    
    # Get total count
    total = db.query(User).count()
    
    # Get paginated users
    users = db.query(User).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "users": [UserResponse.from_orm(u) for u in users]
    }


@router.get("/profile/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user_profile(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user profile by ID (alias endpoint).
    
    - Users can only view their own profile, unless admin
    - **user_id**: User ID to fetch
    """
    # Validate user_id is positive
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Check authorization: user can see own profile or admin can see anyone
    if current_user["user_id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other users' profiles"
        )
    
    user = UserService.get_user_by_id(db, user_id)
    return UserResponse.from_orm(user)


@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user by ID.
    
    - Users can only view their own profile, unless admin
    - **user_id**: User ID to fetch
    """
    # Validate user_id is positive
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Check authorization: user can see own profile or admin can see anyone
    if current_user["user_id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other users' profiles"
        )
    
    user = UserService.get_user_by_id(db, user_id)
    return UserResponse.from_orm(user)


@router.put("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_user(
    user_id: int,
    request: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile with validation.
    
    - Users can only update their own profile, unless admin
    - **user_id**: User ID to update
    """
    # Validate user_id is positive
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Check authorization
    if current_user["user_id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other users' profiles"
        )
    
    # Validate update fields
    update_data = {}
    
    if request.name is not None:
        update_data["name"] = InputValidator.validate_name(request.name)
    
    if request.specialization is not None:
        update_data["specialization"] = InputValidator.sanitize_string(request.specialization, 255)
    
    if request.department is not None:
        update_data["department"] = InputValidator.sanitize_string(request.department, 255)
    
    if request.age is not None:
        try:
            age = int(request.age)
            if age < 0 or age > 150:
                raise ValueError()
            update_data["age"] = str(age)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid age (must be 0-150)"
            )
    
    if request.gender is not None:
        update_data["gender"] = InputValidator.validate_gender(request.gender)
    
    if request.blood_group is not None:
        update_data["blood_group"] = InputValidator.validate_blood_group(request.blood_group)
    
    if request.medical_history is not None:
        update_data["medical_history"] = InputValidator.sanitize_string(request.medical_history, 2000)
    
    if request.status is not None:
        update_data["status"] = InputValidator.validate_status(request.status)
    
    user = UserService.update_user(db, user_id, **update_data)
    
    return UserResponse.from_orm(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Soft delete user (admin only).
    
    Marks user as suspended instead of hard delete.
    - **user_id**: User ID to delete
    """
    # Validate user_id is positive
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    UserService.delete_user(db, user_id)
    return None


@router.get("/{user_id}/status", response_model=UserStatusResponse, status_code=status.HTTP_200_OK)
async def get_user_status(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user status (all roles can view any user's status).
    
    Returns role, status, email_verified, banned flags.
    - **user_id**: User ID to check
    """
    # Validate user_id is positive
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    status_info = UserService.get_user_status(db, user_id)
    return UserStatusResponse(**status_info)


@router.post("/{user_id}/ban", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def ban_user(
    user_id: int,
    request: UserBanRequest,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Ban or unban user (admin only).
    
    - **user_id**: User ID to ban/unban
    - **request.ban**: True to ban, False to unban
    """
    user = UserService.ban_user(db, user_id, ban=request.ban)
    return UserResponse.from_orm(user)


@router.patch("/{user_id}/status", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def change_user_status(
    user_id: int,
    request: StatusChangeRequest,
    current_user: dict = Depends(require_role("admin", "doctor", "nurse")),
    db: Session = Depends(get_db)
):
    """
    Change user status (admin, doctor, nurse only).
    
    - **user_id**: User ID to update
    - **request.status**: New status value
    """
    user = UserService.change_user_status(db, user_id, request.status)
    return UserResponse.from_orm(user)


@router.post("/{patient_id}/assign-doctor", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def assign_doctor_to_patient(
    patient_id: int,
    request: AssignDoctorRequest,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Assign a doctor to a patient (admin only).
    
    - **patient_id**: Patient user ID
    - **request.doctor_id**: Doctor user ID to assign
    """
    patient = UserService.assign_doctor_to_patient(db, patient_id, request.doctor_id)
    return UserResponse.from_orm(patient)


@router.post("/{patient_id}/assign-nurse", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def assign_nurse_to_patient(
    patient_id: int,
    request: AssignNurseRequest,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Assign a nurse to a patient (admin only).
    
    - **patient_id**: Patient user ID
    - **request.nurse_id**: Nurse user ID to assign
    """
    patient = UserService.assign_nurse_to_patient(db, patient_id, request.nurse_id)
    return UserResponse.from_orm(patient)


@router.delete("/{patient_id}/remove-doctor", status_code=status.HTTP_204_NO_CONTENT)
async def remove_doctor_from_patient(
    patient_id: int,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Remove assigned doctor from patient (admin only).
    
    - **patient_id**: Patient user ID
    """
    UserService.remove_doctor_from_patient(db, patient_id)
    return None


@router.delete("/{patient_id}/remove-nurse", status_code=status.HTTP_204_NO_CONTENT)
async def remove_nurse_from_patient(
    patient_id: int,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Remove assigned nurse from patient (admin only).
    
    - **patient_id**: Patient user ID
    """
    UserService.remove_nurse_from_patient(db, patient_id)
    return None


@router.get("/doctor/{doctor_id}/patients", response_model=UserListResponse, status_code=status.HTTP_200_OK)
async def get_doctor_patients(
    doctor_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all patients assigned to a doctor.
    
    - Doctor can only view their own patients, admin can view any doctor's patients
    - **doctor_id**: Doctor user ID
    """
    # Check authorization
    if current_user["role"] != "admin" and current_user["user_id"] != doctor_id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other doctors' patients"
        )
    
    patients = UserService.get_doctor_patients(db, doctor_id, skip, limit)
    total = len(patients)  # TODO: Get actual count from DB
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "users": [UserResponse.from_orm(p) for p in patients]
    }


@router.get("/nurse/{nurse_id}/patients", response_model=UserListResponse, status_code=status.HTTP_200_OK)
async def get_nurse_patients(
    nurse_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all patients assigned to a nurse.
    
    - Nurse can only view their own patients, admin can view any nurse's patients
    - **nurse_id**: Nurse user ID
    """
    # Check authorization
    if current_user["role"] != "admin" and current_user["user_id"] != nurse_id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other nurses' patients"
        )
    
    patients = UserService.get_nurse_patients(db, nurse_id, skip, limit)
    total = len(patients)  # TODO: Get actual count from DB
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "users": [UserResponse.from_orm(p) for p in patients]
    }


# ==================== VITAL SIGNS ENDPOINTS ====================

@router.post("/{patient_id}/vital-signs", response_model=VitalSignsResponse, status_code=status.HTTP_201_CREATED)
async def create_vital_signs(
    patient_id: int,
    request: VitalSignsCreateRequest,
    current_user: dict = Depends(require_role("admin", "doctor", "nurse")),
    db: Session = Depends(get_db)
):
    """
    Record vital signs for a patient.
    - Only doctors, nurses, and admins can record vital signs
    - **patient_id**: Patient ID
    """
    # Verify patient exists
    try:
        UserService.get_user_by_id(db, patient_id)
    except HTTPException:
        raise
    
    vital = VitalSignsService.create_vital_signs(
        db,
        patient_id=patient_id,
        temperature=request.temperature,
        blood_pressure_systolic=request.blood_pressure_systolic,
        blood_pressure_diastolic=request.blood_pressure_diastolic,
        heart_rate=request.heart_rate,
        respiratory_rate=request.respiratory_rate,
        oxygen_saturation=request.oxygen_saturation,
        weight=request.weight,
        height=request.height,
        recorded_by_id=current_user["user_id"],
        notes=request.notes
    )
    
    return VitalSignsResponse.from_orm(vital)


@router.get("/{patient_id}/vital-signs", response_model=VitalSignsListResponse)
async def get_patient_vital_signs(
    patient_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get vital signs for a patient.
    - Patients can only view their own vital signs
    - Doctors and nurses can view their assigned patients' vital signs
    - Admins can view any patient's vital signs
    - **patient_id**: Patient ID
    """
    # Verify patient exists
    try:
        patient = UserService.get_user_by_id(db, patient_id)
    except HTTPException:
        raise
    
    # Check authorization
    if current_user["role"] == "patient" and current_user["user_id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other patients' vital signs"
        )
    
    total, vitals = VitalSignsService.get_patient_vital_signs(
        db, patient_id, skip, limit
    )
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "data": [VitalSignsResponse.from_orm(v) for v in vitals]
    }


# ==================== HEALTH PROFILE ENDPOINTS ====================

@router.get("/{patient_id}/health-profile", response_model=HealthProfileResponse)
async def get_health_profile(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get patient's complete health profile.
    - Patients can only view their own profile
    - Doctors and nurses can view their assigned patients' profiles
    - Admins can view any patient's profile
    - **patient_id**: Patient ID
    """
    # Verify patient exists
    try:
        patient = UserService.get_user_by_id(db, patient_id)
    except HTTPException:
        raise
    
    # Check authorization
    if current_user["role"] == "patient" and current_user["user_id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other patients' health profiles"
        )
    
    # Get latest vital signs
    latest_vitals = VitalSignsService.get_latest_vital_signs(db, patient_id)
    
    return {
        "id": patient.id,
        "patient_id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "medical_history": patient.medical_history,
        "status": patient.status,
        "latest_vitals": VitalSignsResponse.from_orm(latest_vitals) if latest_vitals else None,
        "assigned_doctor_id": patient.assigned_doctor_id,
        "assigned_nurse_id": patient.assigned_nurse_id,
    }


@router.get("/{patient_id}/medical-conditions", response_model=list[str])
async def get_patient_medical_conditions(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a patient's medical conditions list."""
    patient = UserService.get_user_by_id(db, patient_id)

    if current_user["role"] == "patient" and current_user["user_id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other patients' medical conditions"
        )

    medical_history = patient.medical_history or ""
    return [item.strip() for item in medical_history.split(",") if item.strip()]


@router.get("/{patient_id}/allergies", response_model=list[str])
async def get_patient_allergies(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a patient's allergy list."""
    patient = UserService.get_user_by_id(db, patient_id)

    if current_user["role"] == "patient" and current_user["user_id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other patients' allergies"
        )

    medical_history = patient.medical_history or ""
    return [item.strip() for item in medical_history.split(",") if item.strip()]


@router.get("/{patient_id}/medical-history", response_model=list[str])
async def get_patient_medical_history(
    patient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a patient's medical history entries."""
    patient = UserService.get_user_by_id(db, patient_id)

    if current_user["role"] == "patient" and current_user["user_id"] != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other patients' medical history"
        )

    medical_history = patient.medical_history or ""
    return [item.strip() for item in medical_history.split(",") if item.strip()]


@router.put("/{patient_id}/health-profile", response_model=UserResponse)
async def update_health_profile(
    patient_id: int,
    request: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update patient's health profile.
    - Patients can only update their own profile
    - Admins can update any patient's profile
    - **patient_id**: Patient ID
    """
    # Verify patient exists
    try:
        patient = UserService.get_user_by_id(db, patient_id)
    except HTTPException:
        raise
    
    # Check authorization
    if current_user["user_id"] != patient_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot update other patients' health profiles"
        )
    
    # Validate update fields
    update_data = {}
    
    if request.blood_group is not None:
        update_data["blood_group"] = InputValidator.validate_blood_group(request.blood_group)
    
    if request.age is not None:
        try:
            age = int(request.age)
            if age < 0 or age > 150:
                raise ValueError()
            update_data["age"] = str(age)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid age (must be 0-150)"
            )
    
    if request.gender is not None:
        update_data["gender"] = InputValidator.validate_gender(request.gender)
    
    if request.medical_history is not None:
        update_data["medical_history"] = InputValidator.sanitize_string(request.medical_history, 2000)
    
    user = UserService.update_user(db, patient_id, **update_data)
    
    return UserResponse.from_orm(user)
