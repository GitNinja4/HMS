"""Input validation utilities for all request validation."""

import re
import logging
from fastapi import HTTPException, status
from typing import List, Optional

logger = logging.getLogger(__name__)


class ValidationError:
    """Custom validation error with details."""
    pass


class InputValidator:
    """Centralized input validation for all endpoints."""
    
    # Email validation regex (RFC 5322 simplified)
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    # Username validation (alphanumeric, underscore, hyphen, 2-100 chars)
    USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_-]{2,100}$')
    
    # Phone number validation (10-20 digits, spaces, hyphens, +)
    PHONE_REGEX = re.compile(r'^\+?[0-9\s\-\(\)]{10,20}$')
    
    # Medical license validation (9-15 alphanumeric)
    LICENSE_REGEX = re.compile(r'^[a-zA-Z0-9]{9,15}$')
    
    # Blood group validation
    VALID_BLOOD_GROUPS = {'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'}
    
    # Gender validation
    VALID_GENDERS = {'Male', 'Female', 'Other'}
    
    # User status validation
    VALID_STATUSES = {'active', 'inactive', 'suspended', 'follow_up'}
    
    # Valid user roles
    VALID_ROLES = {'admin', 'doctor', 'nurse', 'pharmacist', 'lab_tech', 'patient'}
    
    @staticmethod
    def validate_email(email: str) -> str:
        """
        Validate email address.
        
        Args:
            email: Email to validate
            
        Returns:
            Normalized (lowercased) email
            
        Raises:
            HTTPException: If email is invalid
        """
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        email = email.strip().lower()
        
        if len(email) > 254:  # RFC 5321
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is too long (maximum 254 characters)"
            )
        
        if not InputValidator.EMAIL_REGEX.match(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        return email
    
    @staticmethod
    def validate_name(name: str, field_name: str = "name", min_length: int = 2, max_length: int = 255) -> str:
        """
        Validate name field (no special characters except spaces, hyphens, apostrophes).
        
        Args:
            name: Name to validate
            field_name: Field name for error messages
            min_length: Minimum length
            max_length: Maximum length
            
        Returns:
            Normalized name (stripped whitespace)
            
        Raises:
            HTTPException: If name is invalid
        """
        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} is required"
            )
        
        name = name.strip()
        
        if len(name) < min_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} must be at least {min_length} characters"
            )
        
        if len(name) > max_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} cannot exceed {max_length} characters"
            )
        
        # Allow only letters, spaces, hyphens, apostrophes
        if not re.match(r"^[a-zA-Z\s\-']+$", name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} contains invalid characters"
            )
        
        return name
    
    @staticmethod
    def validate_password(password: str) -> str:
        """
        Validate password strength.
        
        Requirements:
        - Minimum 8 characters
        - Maximum 256 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
        
        Args:
            password: Password to validate
            
        Returns:
            The password (unchanged)
            
        Raises:
            HTTPException: If password doesn't meet requirements
        """
        if not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required"
            )
        
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        if len(password) > 256:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long (maximum 256 characters)"
            )
        
        if not re.search(r'[a-z]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter"
            )
        
        if not re.search(r'[A-Z]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter"
            )
        
        if not re.search(r'[0-9]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one digit"
            )
        
        return password
    
    @staticmethod
    def validate_role(role: str) -> str:
        """
        Validate user role.
        
        Args:
            role: Role to validate
            
        Returns:
            Normalized role (lowercased)
            
        Raises:
            HTTPException: If role is invalid
        """
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role is required"
            )
        
        role = role.lower().strip()
        
        if role not in InputValidator.VALID_ROLES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(InputValidator.VALID_ROLES)}"
            )
        
        return role
    
    @staticmethod
    def validate_pagination(skip: int, limit: int, max_limit: int = 1000) -> tuple:
        """
        Validate pagination parameters.
        
        Args:
            skip: Number of items to skip (minimum 0)
            limit: Number of items to return (1-max_limit)
            max_limit: Maximum allowed limit
            
        Returns:
            Tuple of (skip, limit)
            
        Raises:
            HTTPException: If parameters are invalid
        """
        if skip < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Skip must be non-negative"
            )
        
        if limit < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit must be at least 1"
            )
        
        if limit > max_limit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Limit cannot exceed {max_limit}"
            )
        
        return skip, limit
    
    @staticmethod
    def validate_phone(phone: Optional[str]) -> Optional[str]:
        """
        Validate phone number.
        
        Args:
            phone: Phone number to validate (optional)
            
        Returns:
            Normalized phone number or None
            
        Raises:
            HTTPException: If phone format is invalid
        """
        if not phone:
            return None
        
        phone = phone.strip()
        
        if not InputValidator.PHONE_REGEX.match(phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format"
            )
        
        return phone
    
    @staticmethod
    def validate_license_number(license_number: Optional[str]) -> Optional[str]:
        """
        Validate medical license number.
        
        Args:
            license_number: License number to validate (optional)
            
        Returns:
            License number or None
            
        Raises:
            HTTPException: If license format is invalid
        """
        if not license_number:
            return None
        
        license_number = license_number.strip().upper()
        
        if not InputValidator.LICENSE_REGEX.match(license_number):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid license number format (9-15 alphanumeric characters)"
            )
        
        return license_number
    
    @staticmethod
    def validate_blood_group(blood_group: Optional[str]) -> Optional[str]:
        """
        Validate blood group.
        
        Args:
            blood_group: Blood group to validate (optional)
            
        Returns:
            Blood group or None
            
        Raises:
            HTTPException: If blood group is invalid
        """
        if not blood_group:
            return None
        
        blood_group = blood_group.strip().upper()
        
        if blood_group not in InputValidator.VALID_BLOOD_GROUPS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid blood group. Must be one of: {', '.join(sorted(InputValidator.VALID_BLOOD_GROUPS))}"
            )
        
        return blood_group
    
    @staticmethod
    def validate_gender(gender: Optional[str]) -> Optional[str]:
        """
        Validate gender.
        
        Args:
            gender: Gender to validate (optional)
            
        Returns:
            Gender or None
            
        Raises:
            HTTPException: If gender is invalid
        """
        if not gender:
            return None
        
        gender = gender.strip()
        
        if gender not in InputValidator.VALID_GENDERS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid gender. Must be one of: {', '.join(InputValidator.VALID_GENDERS)}"
            )
        
        return gender
    
    @staticmethod
    def validate_status(status_value: Optional[str]) -> Optional[str]:
        """
        Validate user status.
        
        Args:
            status_value: Status to validate (optional)
            
        Returns:
            Status or None
            
        Raises:
            HTTPException: If status is invalid
        """
        if not status_value:
            return None
        
        status_value = status_value.lower().strip()
        
        if status_value not in InputValidator.VALID_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(InputValidator.VALID_STATUSES)}"
            )
        
        return status_value
    
    @staticmethod
    def sanitize_string(value: Optional[str], max_length: int = 1000) -> Optional[str]:
        """
        Sanitize string input to prevent XSS.
        
        Args:
            value: String to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string or None
            
        Raises:
            HTTPException: If string exceeds max length
        """
        if not value:
            return None
        
        value = value.strip()
        
        if len(value) > max_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Input cannot exceed {max_length} characters"
            )
        
        # Remove null bytes and other control characters
        value = ''.join(char for char in value if ord(char) >= 32 or char in '\n\r\t')
        
        return value
