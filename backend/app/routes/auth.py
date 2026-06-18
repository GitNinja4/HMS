from fastapi import APIRouter, Depends, status, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    LoginRequest, SignupRequest, TokenResponse, 
    RefreshTokenRequest, AccessTokenResponse,
    EmailVerificationRequest, ResendVerificationEmailRequest,
    EmailVerificationResponse
)
from app.services import AuthService, EmailService
from app.security.redis_client import add_token_to_blacklist
from app.security.auth import get_current_user_optional
from app.utils.validators import InputValidator
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user with secure validation.
    
    - **email**: Unique email address
    - **name**: User's full name (min 2 characters, letters/spaces/hyphens only)
    - **password**: Password (min 8 chars, uppercase, lowercase, digit required)
    - **role**: User role (default: "patient", options: admin, doctor, nurse, pharmacist, lab_tech, patient)
    
    Validates all inputs and returns JWT tokens on success.
    """
    try:
        # Validate inputs
        email = InputValidator.validate_email(request.email)
        name = InputValidator.validate_name(request.name, "name", 2, 255)
        password = InputValidator.validate_password(request.password)
        role = InputValidator.validate_role(request.role)
        
        user = AuthService.signup(db, request)
        
        # Send verification email (non-blocking - don't let email failures break signup)
        try:
            token = EmailService.create_verification_token(db, user.id)
            EmailService.send_verification_email(user.email, user.name, token)
        except Exception as e:
            logger.warning(f"Email sending failed (non-blocking): {str(e)}")
        
        # Generate tokens
        from app.schemas import LoginRequest
        login_request = LoginRequest(email=user.email, password=request.password)
        tokens = AuthService.login(db, login_request)
        
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user_id=tokens["user_id"],
            role=tokens["role"],
            token_type=tokens.get("token_type", "bearer")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT tokens.
    
    - **email**: User email
    - **password**: User password
    
    Returns access and refresh tokens on successful authentication.
    """
    try:
        # Validate inputs
        email = InputValidator.validate_email(request.email)
        
        tokens = AuthService.login(db, request)
        
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user_id=tokens["user_id"],
            role=tokens["role"],
            token_type=tokens.get("token_type", "bearer")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Get a new access token using a refresh token.
    
    - **refresh_token**: Valid refresh token
    
    Returns new access token with 15-minute expiration.
    """
    try:
        if not request.refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )
        
        result = AuthService.refresh_access_token(db, request.refresh_token)
        
        return AccessTokenResponse(
            access_token=result["access_token"],
            token_type=result.get("token_type", "bearer")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while refreshing token"
        )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(request: Request, db: Session = Depends(get_db)):
    """
    Logout user by blacklisting JWT token.
    
    Adds the current refresh token to Redis blacklist, preventing further use.
    Client should also delete JWT tokens from local storage.
    
    Note: If Redis is unavailable, logout still succeeds (client should delete token anyway).
    
    Returns: Success message with logout confirmation.
    """
    # Get token from Authorization header
    auth_header = request.headers.get("authorization", "").strip()
    
    if not auth_header or not auth_header.startswith("Bearer "):
        # Return 200 anyway for security (don't leak that user wasn't authenticated)
        return {"message": "Logout successful. Token has been revoked."}
    
    token = auth_header[7:].strip()
    
    if not token:
        return {"message": "Logout successful. Token has been revoked."}
    
    # Try to add token to blacklist (non-blocking if Redis unavailable)
    try:
        add_token_to_blacklist(token)
        logger.info("User logged out successfully")
    except Exception as e:
        logger.warning(f"Error adding token to blacklist: {str(e)}")
        # Don't fail logout if Redis is unavailable
    
    return {"message": "Logout successful. Token has been revoked."}


@router.get("/get-session")
async def get_session(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get current session information.
    
    Returns user session data if logged in, null if not authenticated.
    Useful for frontend to check authentication status on app load.
    """
    try:
        current_user = await get_current_user_optional(request)
        
        if not current_user:
            return None
        
        # Get full user details
        from app.models import User
        user = db.query(User).filter(User.id == current_user["user_id"]).first()
        
        if not user:
            return None
        
        return {
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "status": user.status,
            "email_verified": user.email_verified
        }
    except Exception as e:
        logger.error(f"Error getting session: {e}")
        return None


@router.get("/get-session")
async def get_session(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get current session information.
    
    Returns user session data if logged in, null if not authenticated.
    """
    current_user = await get_current_user_optional(request)
    
    if not current_user:
        return None
    
    # Get full user details
    from app.models import User
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    
    if not user:
        return None
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        },
        "expires": None
    }


# Email verification endpoints - Currently disabled
# TODO: Implement proper email verification flow
# @router.post("/verify-email", response_model=EmailVerificationResponse)
# async def verify_email(
#     request: EmailVerificationRequest,
#     db: Session = Depends(get_db)
# ):
#     """
#     Verify user email with verification token.
#     
#     - **token**: Email verification token sent to user's email
#     """
#     pass

# @router.post("/resend-verification")
# async def resend_verification_email(
#     request: ResendVerificationEmailRequest,
#     db: Session = Depends(get_db)
# ):
#     """
#     Resend verification email to user.
#     
#     - **email**: User's email address
#     """
#     pass
