"""User request and response schemas."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Generic, TypeVar, List
from datetime import datetime

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """Standardized pagination response for all list endpoints."""
    data: List[T]
    total: int
    skip: int
    limit: int


class UserStatusResponse(BaseModel):
    """Response for user status endpoint."""
    user_id: int
    role: str
    status: str
    email: str
    name: str
    email_verified: bool
    banned: bool


class UserUpdateRequest(BaseModel):
    """Request to update user profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    status: Optional[str] = Field(None, description="User status")
    
    # Staff fields
    specialization: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=255)
    
    # Patient fields
    age: Optional[str] = Field(None, max_length=10)
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=5)
    medical_history: Optional[str] = Field(None, max_length=2000)


class UserResponse(BaseModel):
    """User response model for GET endpoints."""
    id: int
    email: str
    name: str
    role: str
    status: str
    email_verified: bool
    banned: bool
    age: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    specialization: Optional[str] = None
    department: Optional[str] = None
    license_number: Optional[str] = None
    medical_history: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    @classmethod
    def from_orm(cls, obj):
        """Custom ORM conversion to handle enums and datetimes."""
        data = {
            'id': obj.id,
            'email': obj.email,
            'name': obj.name,
            'role': str(obj.role) if obj.role else None,
            'status': obj.status,
            'email_verified': obj.email_verified,
            'banned': obj.banned,
            'age': obj.age,
            'gender': obj.gender,
            'blood_group': obj.blood_group,
            'specialization': obj.specialization,
            'department': obj.department,
            'license_number': obj.license_number,
            'medical_history': obj.medical_history,
            'created_at': obj.created_at.isoformat() if isinstance(obj.created_at, datetime) else str(obj.created_at),
            'updated_at': obj.updated_at.isoformat() if isinstance(obj.updated_at, datetime) else str(obj.updated_at),
        }
        return cls(**data)


class UserListResponse(BaseModel):
    """Paginated user list response."""
    total: int
    skip: int
    limit: int
    users: list[UserResponse]


class UserBanRequest(BaseModel):
    """Request to ban/unban user."""
    ban: bool = Field(description="True to ban, False to unban")


class StatusChangeRequest(BaseModel):
    """Request to change user status."""
    status: str = Field(description="New status value")


class AssignDoctorRequest(BaseModel):
    """Request to assign doctor to patient."""
    doctor_id: int = Field(description="Doctor user ID")


class AssignNurseRequest(BaseModel):
    """Request to assign nurse to patient."""
    nurse_id: int = Field(description="Nurse user ID")
