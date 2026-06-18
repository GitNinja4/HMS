"""Activity log service."""

from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import ActivityLog
from fastapi import HTTPException, status


class ActivityLogService:
    """Service for activity log operations."""
    
    @staticmethod
    def get_all_logs(db: Session, skip: int = 0, limit: int = 100) -> tuple:
        """
        Get paginated list of all activity logs.
        
        Args:
            db: Database session
            skip: Number of logs to skip
            limit: Max logs to return
            
        Returns:
            Tuple of (total_count, logs)
        """
        total = db.query(ActivityLog).count()
        logs = db.query(ActivityLog).offset(skip).limit(limit).order_by(ActivityLog.created_at.desc()).all()
        return total, logs
    
    @staticmethod
    def get_user_logs(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> tuple:
        """
        Get paginated list of activity logs for specific user.
        
        Args:
            db: Database session
            user_id: User ID to filter
            skip: Number of logs to skip
            limit: Max logs to return
            
        Returns:
            Tuple of (total_count, logs)
        """
        total = db.query(ActivityLog).filter(ActivityLog.user_id == user_id).count()
        logs = db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id
        ).offset(skip).limit(limit).order_by(ActivityLog.created_at.desc()).all()
        return total, logs
    
    @staticmethod
    def filter_logs(db: Session, skip: int = 0, limit: int = 100, **filters) -> tuple:
        """
        Get filtered activity logs.
        
        Args:
            db: Database session
            skip: Number of logs to skip
            limit: Max logs to return
            **filters: Filter parameters (user_id, endpoint, method, status_code, response_status)
            
        Returns:
            Tuple of (total_count, logs)
        """
        query = db.query(ActivityLog)
        
        # Build WHERE clause from filters
        conditions = []
        if filters.get("user_id"):
            conditions.append(ActivityLog.user_id == filters["user_id"])
        if filters.get("endpoint"):
            conditions.append(ActivityLog.endpoint.ilike(f"%{filters['endpoint']}%"))
        if filters.get("method"):
            conditions.append(ActivityLog.method == filters["method"])
        if filters.get("status_code"):
            conditions.append(ActivityLog.status_code == filters["status_code"])
        if filters.get("response_status"):
            conditions.append(ActivityLog.response_status == filters["response_status"])
        
        if conditions:
            query = query.filter(and_(*conditions))
        
        total = query.count()
        logs = query.offset(skip).limit(limit).order_by(ActivityLog.created_at.desc()).all()
        
        return total, logs
    
    @staticmethod
    def get_log_by_id(db: Session, log_id: int) -> ActivityLog:
        """
        Get activity log by ID.
        
        Args:
            db: Database session
            log_id: Activity log ID
            
        Returns:
            ActivityLog object
            
        Raises:
            HTTPException: If log not found
        """
        log = db.query(ActivityLog).filter(ActivityLog.id == log_id).first()
        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity log not found"
            )
        return log
    
    @staticmethod
    def get_logs_by_endpoint(db: Session, endpoint: str, skip: int = 0, limit: int = 100) -> tuple:
        """
        Get activity logs for specific endpoint.
        
        Args:
            db: Database session
            endpoint: Endpoint path
            skip: Number of logs to skip
            limit: Max logs to return
            
        Returns:
            Tuple of (total_count, logs)
        """
        total = db.query(ActivityLog).filter(ActivityLog.endpoint == endpoint).count()
        logs = db.query(ActivityLog).filter(
            ActivityLog.endpoint == endpoint
        ).offset(skip).limit(limit).order_by(ActivityLog.created_at.desc()).all()
        return total, logs
