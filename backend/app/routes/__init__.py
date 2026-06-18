from .auth import router as auth_router
from .users import router as users_router
from .activity_log import router as activity_log_router
from .notifications import router as notifications_router
from .appointment import router as appointment_router
from .prescription import router as prescription_router
from .vital_signs import router as vital_signs_router

__all__ = [
    "auth_router", 
    "users_router", 
    "activity_log_router", 
    "notifications_router",
    "appointment_router",
    "prescription_router",
    "vital_signs_router"
]
