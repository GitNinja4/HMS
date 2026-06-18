"""Middleware for activity logging."""

import time
import json
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.models import ActivityLog
from app.security.jwt import extract_user_id_from_token


class ActivityLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests to activity_logs table."""
    
    # Endpoints to skip logging (reduce noise)
    SKIP_ENDPOINTS = {"/health", "/", "/docs", "/redoc", "/openapi.json"}
    
    # Sensitive fields to exclude from request body logging
    SENSITIVE_FIELDS = {"password", "password_hash", "token", "refresh_token", "secret"}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request and response details."""
        
        # Skip logging for health checks and documentation
        if request.url.path in self.SKIP_ENDPOINTS:
            return await call_next(request)
        
        start_time = time.time()
        
        # Extract user info from token if available
        user_id = None
        try:
            auth_header = request.headers.get("authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]
                user_id = extract_user_id_from_token(token)
        except:
            pass
        
        # Get IP address (handle proxies)
        ip_address = request.client.host if request.client else "unknown"
        if x_forwarded_for := request.headers.get("x-forwarded-for"):
            ip_address = x_forwarded_for.split(",")[0].strip()
        
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Try to capture request body - DO NOT consume it for endpoints
        request_body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            # Just mark that a body is present, don't try to read it
            # Reading the body would prevent the endpoint from accessing it
            request_body = "<body>"
        
        # Call the next middleware/endpoint
        response = None
        status_code = 500
        response_status = "exception"
        error_message = None
        
        try:
            response = await call_next(request)
            status_code = response.status_code
            response_status = "success" if 200 <= status_code < 300 else "error"
        except Exception as e:
            response_status = "exception"
            error_message = str(e)[:200]
            # Return 500 error response
            from fastapi.responses import JSONResponse
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"}
            )
        
        # Log to database (don't block)
        duration_ms = int((time.time() - start_time) * 1000)
        try:
            from app.database import SessionLocal
            db = SessionLocal()
            log = ActivityLog(
                user_id=user_id,
                endpoint=str(request.url.path),
                method=request.method,
                status_code=status_code,
                ip_address=ip_address,
                user_agent=user_agent,
                request_body=request_body,
                response_status=response_status,
                error_message=error_message,
                duration_ms=duration_ms,
            )
            db.add(log)
            db.commit()
        except:
            pass  # Ignore logging failures
        finally:
            try:
                db.close()
            except:
                pass
        
        return response
    
    @staticmethod
    def _sanitize_body(data: dict) -> dict:
        """Remove sensitive fields from request body."""
        if not isinstance(data, dict):
            return data
        
        sanitized = {}
        for key, value in data.items():
            if key.lower() in ActivityLoggingMiddleware.SENSITIVE_FIELDS:
                sanitized[key] = "***REDACTED***"
            elif isinstance(value, dict):
                sanitized[key] = ActivityLoggingMiddleware._sanitize_body(value)
            else:
                sanitized[key] = value
        
        return sanitized
