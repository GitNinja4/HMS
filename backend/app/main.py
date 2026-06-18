from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.routes import auth_router, users_router, activity_log_router, notifications_router, appointment_router, prescription_router, vital_signs_router
from app.middleware import ActivityLoggingMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware
from app.security.redis_client import get_redis_client, close_redis_client

# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events for FastAPI.
    """
    # Startup: Initialize database and Redis
    init_db()
    print("✅ Database initialized")
    
    # Initialize Redis
    get_redis_client()
    
    yield
    
    # Shutdown: Cleanup
    close_redis_client()
    print("🛑 Shutting down")


# Create FastAPI app with security settings
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Hospital Management System API",
    openapi_url=settings.OPENAPI_URL,  # Disabled in production
    docs_url=settings.DOCS_URL,  # Disabled in production
    redoc_url=settings.REDOC_URL,  # Disabled in production
    lifespan=lifespan,
)

# ==================== MIDDLEWARE REGISTRATION ====================
# Order matters: Security > CORS > Rate Limiting > Activity Logging

# Security Headers Middleware (must be first)
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware with strict configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],  # Explicit methods
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["Content-Length", "X-Request-ID"],
    max_age=settings.CORS_MAX_AGE,  # 10 minutes cache
)

# Rate Limiting Middleware
app.add_middleware(RateLimitMiddleware)

# Activity Logging Middleware (last)
app.add_middleware(ActivityLoggingMiddleware)

# ==================== ROUTES ====================
# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(activity_log_router)
app.include_router(notifications_router)
app.include_router(appointment_router)
app.include_router(prescription_router)
app.include_router(vital_signs_router)


@app.get("/", tags=["root"], include_in_schema=False)
async def root():
    """Root endpoint - API is running."""
    # Don't expose environment info
    return {"message": "HMS Backend API"}


@app.get("/health", tags=["health"], include_in_schema=False)
async def health_check():
    """Health check endpoint."""
    # Minimal response - don't expose internal details
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
