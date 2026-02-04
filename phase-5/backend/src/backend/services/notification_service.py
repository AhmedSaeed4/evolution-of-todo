"""Notification service - manages user notifications"""
from sqlmodel import Session, select
from datetime import datetime
from uuid import UUID
from typing import Optional, List

from ..models.notification import Notification


class NotificationService:
    """Service class for notification operations"""

    def __init__(self, session: Session):
        """Initialize with database session"""
        self.session = session

    def create_notification(
        self,
        user_id: str,
        message: str,
        task_id: Optional[UUID] = None
    ) -> Notification:
        """
        Create a new notification.

        Args:
            user_id: User ID to send notification to
            message: Notification message
            task_id: Optional associated task ID

        Returns:
            Notification: Created notification
        """
        notification = Notification(
            user_id=user_id,
            message=message,
            task_id=task_id,
            read=False,
            created_at=datetime.utcnow()
        )
        self.session.add(notification)
        # Note: caller must commit the session
        return notification

    def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Notification]:
        """
        Get notifications for a user.

        Args:
            user_id: User ID to get notifications for
            unread_only: If True, only return unread notifications
            limit: Maximum number of notifications to return

        Returns:
            List[Notification]: List of notifications
        """
        query = select(Notification).where(Notification.user_id == user_id)

        if unread_only:
            query = query.where(Notification.read == False)

        query = query.order_by(Notification.created_at.desc()).limit(limit)

        return list(self.session.exec(query).all())

    def mark_as_read(self, user_id: str, notification_id: UUID) -> Optional[Notification]:
        """
        Mark a notification as read.

        Args:
            user_id: User ID for scoping
            notification_id: Notification ID to mark as read

        Returns:
            Optional[Notification]: Updated notification if found, None otherwise
        """
        notification = self.session.get(Notification, notification_id)
        if not notification or notification.user_id != user_id:
            return None

        notification.read = True
        self.session.commit()
        self.session.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: str) -> int:
        """
        Mark all unread notifications for a user as read.

        Args:
            user_id: User ID to mark all notifications as read for

        Returns:
            int: Number of notifications marked as read
        """
        query = select(Notification).where(
            Notification.user_id == user_id,
            Notification.read == False
        )
        notifications = list(self.session.exec(query).all())

        count = len(notifications)
        for notification in notifications:
            notification.read = True

        self.session.commit()
        return count

    def get_unread_count(self, user_id: str) -> int:
        """
        Get count of unread notifications for a user.

        Args:
            user_id: User ID to get unread count for

        Returns:
            int: Number of unread notifications
        """
        query = select(Notification).where(
            Notification.user_id == user_id,
            Notification.read == False
        )
        return len(list(self.session.exec(query).all()))

    def delete_old_notifications(self, days: int = 90) -> int:
        """
        Delete notifications older than specified days.

        Args:
            days: Number of days to retain notifications

        Returns:
            int: Number of notifications deleted
        """
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        query = select(Notification).where(Notification.created_at < cutoff_date)
        notifications = list(self.session.exec(query).all())

        count = len(notifications)
        for notification in notifications:
            self.session.delete(notification)

        self.session.commit()
        return count

    def delete_notification(self, user_id: str, notification_id: UUID) -> bool:
        """
        Delete a specific notification for a user.

        Args:
            user_id: User ID for scoping
            notification_id: Notification ID to delete

        Returns:
            bool: True if deleted, False if not found
        """
        notification = self.session.get(Notification, notification_id)
        if not notification or notification.user_id != user_id:
            return False

        self.session.delete(notification)
        self.session.commit()
        return True
