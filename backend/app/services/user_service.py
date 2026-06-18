"""User management service."""

from sqlalchemy.orm import Session
from app.models import User, RoleEnum
from app.security import hash_password
from fastapi import HTTPException, status


class UserService:
    """Service for user CRUD operations."""
    
    @staticmethod
    def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> list:
        """
        Get paginated list of all users.
        
        Args:
            db: Database session
            skip: Number of users to skip
            limit: Max users to return
            
        Returns:
            List of User objects
        """
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """
        Get user by ID.
        
        Args:
            db: Database session
            user_id: User ID to fetch
            
        Returns:
            User object
            
        Raises:
            HTTPException: If user not found
        """
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    
    @staticmethod
    def update_user(db: Session, user_id: int, **kwargs) -> User:
        """
        Update user profile with given fields.
        
        Args:
            db: Database session
            user_id: User ID to update
            **kwargs: Fields to update (name, status, role, specialization, etc)
            
        Returns:
            Updated User object
            
        Raises:
            HTTPException: If user not found
        """
        user = UserService.get_user_by_id(db, user_id)
        
        # Update allowed fields
        allowed_fields = {
            'name', 'status', 'specialization', 'department', 
            'age', 'gender', 'blood_group', 'medical_history'
        }
        
        for key, value in kwargs.items():
            if key in allowed_fields and value is not None:
                setattr(user, key, value)
        
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """
        Soft delete user (mark as suspended).
        
        Args:
            db: Database session
            user_id: User ID to delete
            
        Returns:
            True if successful
            
        Raises:
            HTTPException: If user not found
        """
        user = UserService.get_user_by_id(db, user_id)
        user.status = "suspended"
        db.commit()
        return True
    
    @staticmethod
    def get_user_status(db: Session, user_id: int) -> dict:
        """
        Get user status and role.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dict with user_id, role, status, email, etc
            
        Raises:
            HTTPException: If user not found
        """
        user = UserService.get_user_by_id(db, user_id)
        
        return {
            "user_id": user.id,
            "role": user.role,
            "status": user.status,
            "email": user.email,
            "name": user.name,
            "email_verified": user.email_verified,
            "banned": user.banned
        }
    
    @staticmethod
    def change_user_status(db: Session, user_id: int, new_status: str) -> User:
        """
        Change user status.
        
        Args:
            db: Database session
            user_id: User ID
            new_status: New status value
            
        Returns:
            Updated User object
        """
        user = UserService.get_user_by_id(db, user_id)
        user.status = new_status
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def ban_user(db: Session, user_id: int, ban: bool = True) -> User:
        """
        Ban or unban a user.
        
        Args:
            db: Database session
            user_id: User ID
            ban: True to ban, False to unban
            
        Returns:
            Updated User object
        """
        user = UserService.get_user_by_id(db, user_id)
        user.banned = ban
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def assign_doctor_to_patient(db: Session, patient_id: int, doctor_id: int) -> User:
        """
        Assign a doctor to a patient.
        
        Args:
            db: Database session
            patient_id: Patient user ID
            doctor_id: Doctor user ID
            
        Returns:
            Updated patient User object
            
        Raises:
            HTTPException: If user not found or invalid role
        """
        patient = UserService.get_user_by_id(db, patient_id)
        doctor = UserService.get_user_by_id(db, doctor_id)
        
        # Verify patient is a patient
        if patient.role != RoleEnum.PATIENT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a patient"
            )
        
        # Verify doctor is a doctor
        if doctor.role != RoleEnum.DOCTOR:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a doctor"
            )
        
        patient.assigned_doctor_id = str(doctor.id)
        db.commit()
        db.refresh(patient)
        
        return patient
    
    @staticmethod
    def assign_nurse_to_patient(db: Session, patient_id: int, nurse_id: int) -> User:
        """
        Assign a nurse to a patient.
        
        Args:
            db: Database session
            patient_id: Patient user ID
            nurse_id: Nurse user ID
            
        Returns:
            Updated patient User object
            
        Raises:
            HTTPException: If user not found or invalid role
        """
        patient = UserService.get_user_by_id(db, patient_id)
        nurse = UserService.get_user_by_id(db, nurse_id)
        
        # Verify patient is a patient
        if patient.role != RoleEnum.PATIENT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a patient"
            )
        
        # Verify nurse is a nurse
        if nurse.role != RoleEnum.NURSE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is not a nurse"
            )
        
        patient.assigned_nurse_id = str(nurse.id)
        db.commit()
        db.refresh(patient)
        
        return patient
    
    @staticmethod
    def remove_doctor_from_patient(db: Session, patient_id: int) -> User:
        """
        Remove assigned doctor from patient.
        
        Args:
            db: Database session
            patient_id: Patient user ID
            
        Returns:
            Updated patient User object
            
        Raises:
            HTTPException: If user not found
        """
        patient = UserService.get_user_by_id(db, patient_id)
        patient.assigned_doctor_id = None
        db.commit()
        db.refresh(patient)
        return patient
    
    @staticmethod
    def remove_nurse_from_patient(db: Session, patient_id: int) -> User:
        """
        Remove assigned nurse from patient.
        
        Args:
            db: Database session
            patient_id: Patient user ID
            
        Returns:
            Updated patient User object
            
        Raises:
            HTTPException: If user not found
        """
        patient = UserService.get_user_by_id(db, patient_id)
        patient.assigned_nurse_id = None
        db.commit()
        db.refresh(patient)
        return patient
    
    @staticmethod
    def get_doctor_patients(db: Session, doctor_id: int, skip: int = 0, limit: int = 100) -> list:
        """
        Get all patients assigned to a specific doctor.
        
        Args:
            db: Database session
            doctor_id: Doctor user ID
            skip: Number to skip
            limit: Max to return
            
        Returns:
            List of Patient User objects
        """
        return db.query(User).filter(
            User.role == RoleEnum.PATIENT.value,
            User.assigned_doctor_id == str(doctor_id)
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_nurse_patients(db: Session, nurse_id: int, skip: int = 0, limit: int = 100) -> list:
        """
        Get all patients assigned to a specific nurse.
        
        Args:
            db: Database session
            nurse_id: Nurse user ID
            skip: Number to skip
            limit: Max to return
            
        Returns:
            List of Patient User objects
        """
        return db.query(User).filter(
            User.role == RoleEnum.PATIENT.value,
            User.assigned_nurse_id == str(nurse_id)
        ).offset(skip).limit(limit).all()
