"""Notification service for creating and retrieving in-app alerts."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Notification


class NotificationService:
    """Service for notification operations."""

    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        type: str = "system",
        link: str = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            link=link,
            read=False,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50):
        total = db.query(Notification).filter(Notification.user_id == user_id).count()
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return total, notifications

    @staticmethod
    def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Notification:
        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        notification.read = True
        db.commit()
        db.refresh(notification)
        return notification
