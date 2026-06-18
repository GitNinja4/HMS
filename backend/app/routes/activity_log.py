"""Activity log routes."""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import ActivityLogService
from app.security.auth import get_current_user, require_role
from app.schemas import ActivityLogResponse, ActivityLogListResponse

router = APIRouter(prefix="/api/activity-logs", tags=["activity-logs"])


@router.get("", response_model=ActivityLogListResponse, status_code=status.HTTP_200_OK)
async def list_activity_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    page: int = Query(None, ge=1),  # Alternative pagination parameter
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List activity logs (accessible to all authenticated users).
    - Admins can see all logs
    - Other users can see their own logs
    
    - **skip** or **page**: Number of logs to skip (skip takes precedence)
    - **limit**: Max logs per page
    """
    # Handle both page/limit and skip/limit formats
    actual_skip = skip
    if page is not None and skip == 0:
        actual_skip = (page - 1) * limit
    
    # Admin can see all logs, others can see their own
    if current_user["role"] == "admin":
        total, logs = ActivityLogService.get_all_logs(db, actual_skip, limit)
    else:
        total, logs = ActivityLogService.get_user_logs(db, current_user["user_id"], actual_skip, limit)
    
    return {
        "total": total,
        "skip": actual_skip,
        "limit": limit,
        "logs": [ActivityLogResponse.from_orm(log) for log in logs]
    }


@router.get("/user/{user_id}", response_model=ActivityLogListResponse, status_code=status.HTTP_200_OK)
async def get_user_activity_logs(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get activity logs for specific user (admin or self only).
    
    - **user_id**: User ID to retrieve logs for
    - **skip**: Number of logs to skip
    - **limit**: Max logs per page
    """
    # Only admin or user themselves can view
    if current_user["role"] != "admin" and current_user["user_id"] != user_id:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot view other users' activity logs"
        )
    
    total, logs = ActivityLogService.get_user_logs(db, user_id, skip, limit)
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": [ActivityLogResponse.from_orm(log) for log in logs]
    }


@router.get("/endpoint/{endpoint_path}", response_model=ActivityLogListResponse, status_code=status.HTTP_200_OK)
async def get_endpoint_activity_logs(
    endpoint_path: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Get activity logs for specific endpoint (admin only).
    
    - **endpoint_path**: API endpoint path
    - **skip**: Number of logs to skip
    - **limit**: Max logs per page
    """
    total, logs = ActivityLogService.get_logs_by_endpoint(db, f"/api/{endpoint_path}", skip, limit)
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": [ActivityLogResponse.from_orm(log) for log in logs]
    }


@router.get("/{log_id}", response_model=ActivityLogResponse, status_code=status.HTTP_200_OK)
async def get_activity_log(
    log_id: int,
    current_user: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """
    Get specific activity log by ID (admin only).
    
    - **log_id**: Activity log ID
    """
    log = ActivityLogService.get_log_by_id(db, log_id)
    return ActivityLogResponse.from_orm(log)
