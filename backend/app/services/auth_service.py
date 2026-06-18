from sqlalchemy.orm import Session
from app.models import User, RoleEnum
from app.schemas import LoginRequest, SignupRequest
from app.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.security.jwt import extract_jti_from_token
from app.security.redis_client import add_token_to_blacklist
from app.services.email_service import EmailService
from app.utils.validators import InputValidator
from fastapi import HTTPException, status
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Service for authentication operations with enhanced security."""
    
    @staticmethod
    def signup(db: Session, request: SignupRequest) -> User:
        """
        Create a new user account with comprehensive validation.
        
        Args:
            db: Database session
            request: Signup request with email, name, password, role
            
        Returns:
            Created User object
            
        Raises:
            HTTPException: If email already exists, validation fails, or password invalid
        """
        # Validate all inputs
        email = InputValidator.validate_email(request.email)
        name = InputValidator.validate_name(request.name, "name", 2, 255)
        password = InputValidator.validate_password(request.password)
        role = InputValidator.validate_role(request.role)
        
        # Check if email already exists (case-insensitive)
        existing_user = db.query(User).filter(User.email.ilike(email)).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        password_hash = hash_password(password)
        
        # Create user with secure defaults
        new_user = User(
            email=email,
            name=name,
            password_hash=password_hash,
            role=role,
            status="active" if role != RoleEnum.PATIENT.value else "follow_up",
            email_verified=False,
            banned=False
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User created: {new_user.id} ({new_user.email}) with role {role}")
        
        return new_user
    
    @staticmethod
    def login(db: Session, request: LoginRequest) -> dict:
        """
        Authenticate user and return tokens with enhanced security.
        
        Args:
            db: Database session
            request: Login request with email and password
            
        Returns:
            Dict with access_token, refresh_token, user_id, role, token_type
            
        Raises:
            HTTPException: If credentials are invalid
        """
        # Validate inputs
        email = InputValidator.validate_email(request.email)
        # Don't validate password format here - just require it exists
        if not request.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Find user by email (case-insensitive)
        user = db.query(User).filter(User.email.ilike(email)).first()
        if not user:
            logger.warning(f"Login attempt with non-existent email: {email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(request.password, user.password_hash):
            logger.warning(f"Failed login attempt for user: {user.id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is banned
        if user.banned:
            logger.warning(f"Login attempt by banned user: {user.id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been suspended"
            )
        
        # Create tokens
        access_token = create_access_token(user.id, user.role)
        refresh_token = create_refresh_token(user.id)
        
        logger.info(f"User logged in: {user.id}")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": user.id,
            "role": user.role,
            "token_type": "bearer"
        }
    
    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> dict:
        """
        Generate new access token from refresh token with security checks.
        
        Args:
            db: Database session
            refresh_token: Refresh token string
            
        Returns:
            Dict with new access_token
            
        Raises:
            HTTPException: If refresh token is invalid
        """
        from app.security import decode_token, extract_user_id_from_token
        
        # Validate token format first
        if not refresh_token or not isinstance(refresh_token, str):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Decode refresh token
        payload = decode_token(refresh_token, token_type="refresh")
        if not payload:
            logger.warning("Invalid refresh token attempted")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        user_id = extract_user_id_from_token(refresh_token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"Refresh token for non-existent user: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Check if user is banned
        if user.banned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been suspended"
            )
        
        # Create new access token
        new_access_token = create_access_token(user.id, user.role)
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    
    @staticmethod
    def logout(refresh_token: str) -> dict:
        """
        Logout user by blacklisting tokens.
        
        Args:
            refresh_token: Refresh token to blacklist
            
        Returns:
            Success message
        """
        try:
            # Add refresh token to blacklist
            add_token_to_blacklist(refresh_token)
            logger.info("User logged out successfully")
        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            # Don't fail the request even if blacklist fails
        
        return {"message": "Logout successful"}
    
    @staticmethod
    def verify_email(db: Session, user_id: int, token: str) -> dict:
        """
        Verify user email with verification token.
        
        Args:
            db: Database session
            user_id: User ID
            token: Verification token
            
        Returns:
            Dict with message, user_id, email_verified
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        # Verify the token
        if not EmailService.verify_email_token(db, user_id, token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        # Mark user as email verified
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.email_verified = True
        db.commit()
        
        return {
            "message": "Email verified successfully",
            "user_id": user.id,
            "email_verified": True
        }
    
    @staticmethod
    def resend_verification_email(db: Session, email: str) -> dict:
        """
        Resend verification email to user.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            Dict with message and email
            
        Raises:
            HTTPException: If user not found or already verified
        """
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified"
            )
        
        # Create new verification token
        token = EmailService.create_verification_token(db, user.id)
        
        # Send email
        EmailService.send_verification_email(user.email, user.name, token)
        
        return {
            "message": "Verification email sent",
            "email": user.email
        }
    
    @staticmethod
    def get_current_user_for_email_verification(http_request: 'Request'):
        """Dependency to get current user for email verification."""
        # This is a special case - users can verify email with just their token
        # even before being fully authenticated
        # For now, this returns a dict with user_id extracted from token
        from app.security import extract_user_id_from_token
        
        auth_header = http_request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid Authorization header",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = auth_header[7:]
        user_id = extract_user_id_from_token(token)
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return {"user_id": user_id}
