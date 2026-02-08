"""Notification microservice - processes reminder-due events via Dapr cron binding."""
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from fastapi import FastAPI, BackgroundTasks, HTTPException
from sqlmodel import Session, select
import uvicorn

from ..database import engine
from ..models.task import Task
from ..services.notification_service import NotificationService


DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="Notification Service")


@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    return {"status": "healthy", "service": "notification-service"}


@app.post("/reminder-check-cron")
async def handle_reminder_check(background_tasks: BackgroundTasks):
    """Handle cron binding trigger for reminder checking.

    Triggered every minute by Dapr Cron Binding.

    Args:
        background_tasks: FastAPI background tasks (for async processing if needed)
    """
    try:
        with Session(engine) as session:
            now = datetime.now(timezone.utc)
            cutoff = now - timedelta(minutes=1)

            # Find tasks where reminder is due but not yet sent
            query = select(Task).where(
                Task.reminder_at <= cutoff,
                Task.reminder_sent == False
            )
            tasks = list(session.exec(query).all())

            if not tasks:
                return {"status": "processed", "count": 0}

            notification_service = NotificationService(session)
            processed_count = 0

            for task in tasks:
                # Skip if task is already completed
                if task.completed:
                    task.reminder_sent = True
                    continue

                # Create reminder message
                message = f"Reminder: {task.title}"
                if task.due_date:
                    due_str = task.due_date.strftime("%Y-%m-%d %H:%M")
                    message += f" (due {due_str})"

                # Create notification
                notification_service.create_notification(
                    user_id=task.user_id,
                    message=message,
                    task_id=task.id
                )

                # Mark reminder as sent
                task.reminder_sent = True
                processed_count += 1

            session.commit()

        return {"status": "processed", "count": processed_count}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process reminders: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
