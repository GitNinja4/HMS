"""Rate limiting middleware for preventing abuse and DDoS attacks."""

import time
from typing import Callable, Dict, Tuple
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.security.redis_client import get_redis_client
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to implement rate limiting using Redis."""
    
    # Endpoints with custom rate limits (requests per minute)
    ENDPOINT_LIMITS: Dict[str, int] = {
        "/api/auth/signup": 5,      # 5 signups per hour (special handling)
        "/api/auth/login": 10,      # 10 logins per 15 minutes (special handling)
        "/api/auth/refresh": 30,    # 30 refreshes per minute
        "/api/users": 60,           # 60 user list requests per minute
    }
    
    # Skip rate limiting for these endpoints
    SKIP_ENDPOINTS = {"/health", "/", "/docs", "/redoc", "/openapi.json"}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Check rate limits before processing request."""
        
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)
        
        # Skip rate limiting for whitelisted endpoints
        if request.url.path in self.SKIP_ENDPOINTS:
            return await call_next(request)
        
        # Get client identifier (IP address)
        client_id = self._get_client_identifier(request)
        endpoint = request.url.path
        
        # Check special rate limits for auth endpoints
        is_rate_limited = False
        
        try:
            redis_client = get_redis_client()
            
            if endpoint == "/api/auth/signup":
                # Special handling: 5 signups per hour
                is_rate_limited = self._check_signup_limit(redis_client, client_id)
            elif endpoint == "/api/auth/login":
                # Special handling: 10 logins per 15 minutes
                is_rate_limited = self._check_login_limit(redis_client, client_id)
            else:
                # General rate limiting: use endpoint-specific or default limit
                limit = self.ENDPOINT_LIMITS.get(endpoint, settings.RATE_LIMIT_REQUEST_PER_MINUTE)
                is_rate_limited = self._check_general_limit(redis_client, client_id, endpoint, limit)
        except Exception as e:
            logger.error(f"Rate limiting error: {str(e)}")
            # Fail open - don't block legitimate traffic if Redis is down
            pass
        
        if is_rate_limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
                headers={"Retry-After": "60"}
            )
        
        return await call_next(request)
    
    @staticmethod
    def _get_client_identifier(request: Request) -> str:
        """
        Get unique client identifier (IP address).
        Handles proxies and x-forwarded-for headers.
        """
        # Check for x-forwarded-for header (proxy)
        if x_forwarded_for := request.headers.get("x-forwarded-for"):
            return x_forwarded_for.split(",")[0].strip()
        
        # Fallback to client IP
        if request.client:
            return request.client.host
        
        return "unknown"
    
    @staticmethod
    def _check_signup_limit(redis_client, client_id: str) -> bool:
        """Check signup rate limit: 5 signups per hour per IP."""
        key = f"rate_limit:signup:{client_id}"
        try:
            current = redis_client.get(key)
            if current:
                current_count = int(current)
                if current_count >= settings.RATE_LIMIT_SIGNUP_PER_HOUR:
                    return True
                redis_client.incr(key)
            else:
                redis_client.setex(key, 3600, 1)  # 1 hour TTL
        except Exception as e:
            logger.error(f"Signup rate limit check failed: {str(e)}")
        
        return False
    
    @staticmethod
    def _check_login_limit(redis_client, client_id: str) -> bool:
        """Check login rate limit: 10 logins per 15 minutes per IP."""
        key = f"rate_limit:login:{client_id}"
        try:
            current = redis_client.get(key)
            if current:
                current_count = int(current)
                if current_count >= settings.RATE_LIMIT_LOGIN_PER_15MIN:
                    return True
                redis_client.incr(key)
            else:
                redis_client.setex(key, 900, 1)  # 15 minutes TTL
        except Exception as e:
            logger.error(f"Login rate limit check failed: {str(e)}")
        
        return False
    
    @staticmethod
    def _check_general_limit(redis_client, client_id: str, endpoint: str, limit: int) -> bool:
        """Check general rate limit: X requests per minute per IP per endpoint."""
        key = f"rate_limit:general:{client_id}:{endpoint}"
        try:
            current = redis_client.get(key)
            if current:
                current_count = int(current)
                if current_count >= limit:
                    return True
                redis_client.incr(key)
            else:
                redis_client.setex(key, settings.RATE_LIMIT_WINDOW_SECONDS, 1)  # 1 minute TTL
        except Exception as e:
            logger.error(f"General rate limit check failed: {str(e)}")
        
        return False
