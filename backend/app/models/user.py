from enum import Enum
from sqlalchemy import Column, String, Boolean, Index
from .base import BaseModel


class RoleEnum(str, Enum):
    """User role enumeration."""
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    PHARMACIST = "pharmacist"
    LAB_TECH = "lab_tech"
    PATIENT = "patient"


class StaffStatusEnum(str, Enum):
    """Status for staff members (admin, doctor, nurse, pharmacist, lab_tech)."""
    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    SUSPENDED = "suspended"
    RESIGNED = "resigned"


class PatientStatusEnum(str, Enum):
    """Status for patients."""
    ADMITTED = "admitted"
    IN_TREATMENT = "in_treatment"
    OBSERVATION = "observation"
    DISCHARGED = "discharged"
    FOLLOW_UP = "follow_up"


class User(BaseModel):
    """User model for all roles."""
    
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="patient", nullable=False)
    
    # Status differs by role
    # For patients: PatientStatusEnum
    # For staff: StaffStatusEnum
    status = Column(String(50), default="active", nullable=False)
    
    email_verified = Column(Boolean, default=False)
    banned = Column(Boolean, default=False)
    
    # Healthcare fields (optional by role)
    age = Column(String(10), nullable=True)
    gender = Column(String(20), nullable=True)  # Male, Female, Other
    blood_group = Column(String(5), nullable=True)  # A+, A-, B+, B-, AB+, AB-, O+, O-
    
    # For doctors/staff
    specialization = Column(String(255), nullable=True)  # e.g., Cardiology, Neurology
    department = Column(String(255), nullable=True)
    license_number = Column(String(100), nullable=True)
    
    # For patients
    medical_history = Column(String(2000), nullable=True)
    admitted_at = Column(String(30), nullable=True)  # ISO datetime
    discharge_at = Column(String(30), nullable=True)  # ISO datetime
    
    # Relationships (stored as foreign keys)
    assigned_doctor_id = Column(String(50), nullable=True)
    assigned_nurse_id = Column(String(50), nullable=True)
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_user_role', 'role'),
        Index('idx_user_email', 'email'),
        Index('idx_user_status', 'status'),
    )
