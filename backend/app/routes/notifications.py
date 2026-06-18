"""Notifications routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services import NotificationService
from app.security.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", status_code=status.HTTP_200_OK)
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for current user."""
    total, notifications = NotificationService.get_user_notifications(db, current_user["user_id"])
    unread_count = sum(1 for item in notifications if not item.read)

    return {
        "notifications": [
            {
                "_id": notif.id,
                "title": notif.title,
                "message": notif.message,
                "type": notif.type,
                "link": notif.link,
                "isRead": notif.read,
                "createdAt": notif.created_at.isoformat() if hasattr(notif.created_at, "isoformat") else str(notif.created_at),
            }
            for notif in notifications
        ],
        "unreadCount": unread_count,
    }


@router.post("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_notification_as_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read."""
    NotificationService.mark_notification_as_read(db, notification_id, current_user["user_id"])
    return {"status": "success", "message": "Notification marked as read"}
