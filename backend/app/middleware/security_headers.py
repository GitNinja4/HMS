"""Security headers middleware for adding essential HTTP security headers."""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """Add security headers to response."""
        response = await call_next(request)
        
        # Check if this is a docs endpoint (exclude from restrictive CSP)
        is_docs_endpoint = request.url.path in ["/api/docs", "/api/redoc", "/api/openapi.json"]
        
        # For non-docs endpoints, apply security headers
        if not is_docs_endpoint:
            # Prevent MIME type sniffing
            response.headers["X-Content-Type-Options"] = settings.X_CONTENT_TYPE_OPTIONS
            
            # Prevent clickjacking attacks (Clickjack protection)
            response.headers["X-Frame-Options"] = settings.X_FRAME_OPTIONS
            
            # XSS Protection
            response.headers["X-XSS-Protection"] = settings.X_XSS_PROTECTION
            
            # HTTP Strict Transport Security (HSTS) - only in production
            if settings.APP_ENV == "production":
                response.headers["Strict-Transport-Security"] = settings.STRICT_TRANSPORT_SECURITY
            
            # Content Security Policy - restrictive by default
            response.headers["Content-Security-Policy"] = settings.CONTENT_SECURITY_POLICY
            
            # Referrer Policy
            response.headers["Referrer-Policy"] = settings.REFERRER_POLICY
            
            # Permissions Policy (formerly Feature Policy)
            response.headers["Permissions-Policy"] = settings.PERMISSIONS_POLICY
        else:
            # For docs endpoints, allow necessary resources for Swagger UI from CDN
            swagger_csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https://cdn.jsdelivr.net; connect-src 'self' https:"
            response.headers["Content-Security-Policy"] = swagger_csp
        
        # Remove server header to avoid leaking server information
        if "server" in response.headers:
            del response.headers["server"]
        
        # Prevent caching of sensitive responses
        if request.url.path.startswith("/api/auth") or request.url.path.startswith("/api/users"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        return response
