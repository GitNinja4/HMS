from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.requests import Request
from typing import Optional, List
from app.security.jwt import decode_token, extract_user_id_from_token, extract_role_from_token
from app.security.redis_client import is_token_blacklisted
from app.models import RoleEnum

security = HTTPBearer()


async def get_current_user(credentials = Depends(security)) -> dict:
    """
    Get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer token from Authorization header
        
    Returns:
        Dict with user_id and role
        
    Raises:
        HTTPException: If token is invalid, expired, or blacklisted
    """
    token = credentials.credentials
    
    # Check if token is blacklisted (logout)
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token, token_type="access")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = extract_user_id_from_token(token)
    role = extract_role_from_token(token)
    
    if user_id is None or role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {"user_id": user_id, "role": role}


async def get_current_user_optional(request: Request = None) -> Optional[dict]:
    """
    Get current authenticated user from JWT token (optional).
    
    Args:
        request: Optional HTTP request
        
    Returns:
        Dict with user_id and role, or None if not authenticated
    """
    if request is None:
        return None
    
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header[7:]
    payload = decode_token(token, token_type="access")
    if payload is None:
        return None
    
    user_id = extract_user_id_from_token(token)
    role = extract_role_from_token(token)
    
    if user_id is None or role is None:
        return None
    
    return {"user_id": user_id, "role": role}


def require_role(*allowed_roles: str):
    """
    Decorator to require specific roles for an endpoint.
    
    Args:
        *allowed_roles: Allowed role strings (e.g., "admin", "doctor")
        
    Returns:
        Dependency function to check role
    """
    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker
