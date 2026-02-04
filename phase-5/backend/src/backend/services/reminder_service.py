"""Reminder service - polls for due reminders and creates notifications"""
import asyncio
from sqlmodel import Session, select
from datetime import datetime, timedelta, timezone
from uuid import UUID
from typing import Optional
from logging import getLogger

from ..models.task import Task
from ..database import engine
from .notification_service import NotificationService


logger = getLogger(__name__)


class ReminderService:
    """Service for processing reminders - runs as async background task"""

    def __init__(self, interval_seconds: int = 60):
        """
        Initialize reminder service.

        Args:
            interval_seconds: Polling interval in seconds (default: 60)
        """
        self.interval_seconds = interval_seconds
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self):
        """Start the reminder polling service"""
        if self._running:
            logger.warning("Reminder service is already running")
            return

        self._running = True
        logger.info(f"Starting reminder service with {self.interval_seconds}s polling interval")
        self._task = asyncio.create_task(self._poll_reminders())

    async def stop(self):
        """Stop the reminder polling service"""
        if not self._running:
            return

        logger.info("Stopping reminder service")
        self._running = False

        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _poll_reminders(self):
        """Main polling loop - checks for due reminders"""
        while self._running:
            try:
                await self._process_due_reminders()
            except Exception as e:
                logger.error(f"Error processing reminders: {e}")

            # Wait for next poll
            await asyncio.sleep(self.interval_seconds)

    async def _process_due_reminders(self):
        """Process all reminders that are due"""
        with Session(engine) as session:
            # Find tasks where reminder_at has passed but reminder_sent is False
            now = datetime.now(timezone.utc)
            cutoff = now - timedelta(minutes=1)  # Look back 1 minute to catch any we missed

            query = select(Task).where(
                Task.reminder_at <= cutoff,
                Task.reminder_sent == False
            )
            tasks = list(session.exec(query).all())

            logger.info(f"Processing {len(tasks)} due reminders")

            notification_service = NotificationService(session)

            for task in tasks:
                try:
                    # Skip if task is already completed
                    if task.completed:
                        task.reminder_sent = True
                        continue

                    # Create notification
                    message = f"Reminder: {task.title}"
                    if task.due_date:
                        due_str = task.due_date.strftime("%Y-%m-%d %H:%M")
                        message += f" (due {due_str})"

                    notification_service.create_notification(
                        user_id=task.user_id,
                        message=message,
                        task_id=task.id
                    )

                    # Mark reminder as sent
                    task.reminder_sent = True

                    logger.info(f"Created reminder notification for task {task.id}")

                except Exception as e:
                    logger.error(f"Error processing reminder for task {task.id}: {e}")

            # Commit all changes
            session.commit()

    def check_reminders_sync(self):
        """
        Synchronous version for testing or manual trigger.
        Processes due reminders immediately.
        """
        with Session(engine) as session:
            now = datetime.now(timezone.utc)
            cutoff = now - timedelta(minutes=1)

            query = select(Task).where(
                Task.reminder_at <= cutoff,
                Task.reminder_sent == False
            )
            tasks = list(session.exec(query).all())

            notification_service = NotificationService(session)

            for task in tasks:
                if task.completed:
                    task.reminder_sent = True
                    continue

                message = f"Reminder: {task.title}"
                if task.due_date:
                    due_str = task.due_date.strftime("%Y-%m-%d %H:%M")
                    message += f" (due {due_str})"

                notification_service.create_notification(
                    user_id=task.user_id,
                    message=message,
                    task_id=task.id
                )

                task.reminder_sent = True

            session.commit()
            return len(tasks)
