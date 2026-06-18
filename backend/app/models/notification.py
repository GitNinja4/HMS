from sqlalchemy import Column, String, Integer, Boolean, Index
from .base import BaseModel


class Notification(BaseModel):
    """Notification model for in-app alerts."""

    __tablename__ = "notifications"

    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    type = Column(String(50), nullable=False, default="system")
    link = Column(String(255), nullable=True)
    read = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        Index("ix_notification_user_read", "user_id", "read"),
    )
