from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginRequest(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str = Field(..., min_length=8)


class SignupRequest(BaseModel):
    """Schema for signup request."""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(
        ..., 
        min_length=8,
        description="Password must contain: uppercase, lowercase, digit, special character"
    )
    role: str = Field(default="patient", description="User role: admin, doctor, nurse, pharmacist, lab_tech, patient")


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    role: str


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class AccessTokenResponse(BaseModel):
    """Schema for access token response."""
    access_token: str
    token_type: str = "bearer"


class EmailVerificationRequest(BaseModel):
    """Schema for email verification request."""
    token: str = Field(..., description="Email verification token")


class ResendVerificationEmailRequest(BaseModel):
    """Schema for resending verification email."""
    email: EmailStr


class EmailVerificationResponse(BaseModel):
    """Schema for email verification response."""
    message: str
    user_id: int
    email_verified: bool
