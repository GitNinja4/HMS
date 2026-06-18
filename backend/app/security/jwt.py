from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from app.config import settings
import uuid
import logging

logger = logging.getLogger(__name__)


def create_access_token(user_id: int, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with enhanced security.
    
    Args:
        user_id: User ID to encode in token
        role: User role to encode in token
        expires_delta: Optional custom expiration time delta
        
    Returns:
        JWT access token string
        
    Token includes:
    - sub: user_id
    - role: user role
    - exp: expiration time
    - type: "access" (to distinguish from refresh tokens)
    - iat: issued at time
    - jti: JWT ID for token tracking/revocation
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    issued_at = datetime.now(timezone.utc)
    
    to_encode = {
        "sub": str(user_id),
        "role": role,
        "exp": expire,
        "iat": issued_at,
        "type": "access"
    }
    
    # Add JWT ID (jti) for token tracking and revocation
    if settings.JWT_USE_JTI:
        to_encode["jti"] = str(uuid.uuid4())
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT refresh token with enhanced security.
    
    Args:
        user_id: User ID to encode in token
        expires_delta: Optional custom expiration time delta
        
    Returns:
        JWT refresh token string
        
    Token includes:
    - sub: user_id
    - exp: expiration time
    - type: "refresh"
    - iat: issued at time
    - jti: JWT ID for token tracking/revocation
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    
    issued_at = datetime.now(timezone.utc)
    
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "iat": issued_at,
        "type": "refresh"
    }
    
    # Add JWT ID (jti) for token tracking and revocation
    if settings.JWT_USE_JTI:
        to_encode["jti"] = str(uuid.uuid4())
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Decode and validate a JWT token with comprehensive security checks.
    
    Args:
        token: JWT token string to decode
        token_type: Expected token type ("access" or "refresh")
        
    Returns:
        Decoded token payload or None if invalid
        
    Validates:
    - Token signature
    - Expiration time
    - Token type
    - Required claims
    """
    try:
        # Decode token with signature verification
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # Verify token type
        if payload.get("type") != token_type:
            logger.warning(f"Invalid token type: expected {token_type}, got {payload.get('type')}")
            return None
        
        # Verify required claims
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Token missing 'sub' claim")
            return None
        
        # Verify iat (issued at) claim exists
        if payload.get("iat") is None:
            logger.warning("Token missing 'iat' claim")
            return None
        
        return payload
    except JWTError as e:
        logger.debug(f"JWT decode error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error decoding JWT: {str(e)}")
        return None


def extract_user_id_from_token(token: str, token_type: str = None) -> Optional[int]:
    """
    Extract user ID from token.
    
    Args:
        token: JWT token string
        token_type: Optional token type ("access" or "refresh"), None to skip type validation
        
    Returns:
        User ID as integer, or None if invalid
    """
    try:
        if token_type:
            payload = decode_token(token, token_type=token_type)
        else:
            # Decode without type validation (for cases where we don't care about type)
            try:
                payload = jwt.decode(
                    token, 
                    settings.JWT_SECRET_KEY, 
                    algorithms=[settings.JWT_ALGORITHM]
                )
            except JWTError:
                return None
        
        if payload:
            try:
                return int(payload.get("sub"))
            except (ValueError, TypeError):
                return None
    except Exception as e:
        logger.debug(f"Error extracting user ID from token: {str(e)}")
    
    return None


def extract_role_from_token(token: str) -> Optional[str]:
    """
    Extract role from access token.
    
    Args:
        token: JWT access token string
        
    Returns:
        User role or None if token invalid
    """
    payload = decode_token(token, token_type="access")
    if payload:
        return payload.get("role")
    return None


def extract_jti_from_token(token: str) -> Optional[str]:
    """
    Extract JWT ID (jti) from token for revocation tracking.
    
    Args:
        token: JWT token string
        
    Returns:
        JWT ID or None if not present or token invalid
    """
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("jti")
    except JWTError:
        return None
