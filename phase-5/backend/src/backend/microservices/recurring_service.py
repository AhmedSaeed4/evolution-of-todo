"""Recurring task microservice - creates next instance when task completed."""
import os
import asyncio
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks
from sqlmodel import Session, select
import uvicorn

from ..database import engine
from ..models.task import Task
from ..services.task_service import TaskService
from ..utils.idempotency import check_and_mark_processed
from ..utils.event_publisher import publish_event


DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="Recurring Service")


async def process_pending_events():
    """Background task to poll for pending events that weren't delivered by Dapr."""
    import httpx

    while True:
        try:
            # Get latest offset from Kafka
            resp = httpx.get(
                f'http://{DAPR_HOST}:{DAPR_HTTP_PORT}/v1.0/state/statestore',
                params={'metadata.contentType': 'application/json'},
                timeout=5.0
            )
            if resp.status_code == 200:
                states = resp.json()
                pending = [s for s in states if s['key'].startswith('kafka_offset_task-completed')]
                # Process any pending events
                for state in pending[-5:]:  # Last 5 events
                    # Parse the event and process it
                    pass
        except Exception as e:
            print(f"[DEBUG] Background poll error: {e}")

        await asyncio.sleep(30)  # Poll every 30 seconds


@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    return {"status": "healthy", "service": "recurring-service"}


@app.get("/dapr/subscribe")
async def subscribe():
    """Dapr programmatic subscription - declares which topics this service subscribes to."""
    return [{
        "pubsubname": "pubsub",
        "topic": "task-completed",
        "route": "/events/task-completed"
    }]


@app.post("/events/task-completed")
async def handle_task_completed(event: Dict[str, Any]):
    """Handle task-completed event from Kafka.

    If the task has a recurring_rule, create the next instance.

    Args:
        event: Task event from Dapr (CloudEvents format) or direct call
    """
    # Handle CloudEvents format from Dapr
    # Dapr wraps the event in: {"data": {"data": {...actual data...}, "event_id": ..., "event_type": ...}, "datacontenttype": ...}
    if "data" in event and isinstance(event["data"], dict):
        inner_data = event["data"]
        if "data" in inner_data and "event_id" in inner_data:
            # CloudEvents format - extract the actual data
            event_id = inner_data.get("event_id")
            user_id = inner_data.get("user_id")
            data = inner_data.get("data", {})
        else:
            # Direct call format
            event_id = event.get("event_id")
            user_id = event.get("user_id")
            data = inner_data
    else:
        # Direct call format without wrapping
        event_id = event.get("event_id")
        user_id = event.get("user_id")
        data = event.get("data", {})

    if not event_id or not user_id:
        print(f"[DEBUG] Missing event_id or user_id! event_id={event_id}, user_id={user_id}")
        print(f"[DEBUG] Full event: {event}")
        return {"status": "error", "reason": "missing event_id or user_id"}

    print(f"[DEBUG] Extracted: event_id={event_id[:16]}..., user_id={user_id[:16]}...")

    # Check idempotency - skip if already processed
    already_processed = await check_and_mark_processed(event_id, "recurring-service")
    if already_processed:
        print(f"[DEBUG] Event {event_id[:16]}... already processed")
        return {"status": "already_processed", "event_id": event_id}

    task_id = data.get("task_id")
    recurring_rule = data.get("recurring_rule")
    task_title = data.get("title", "unknown")

    print(f"[DEBUG] Processing event for task: {task_title} (id: {task_id[:8]}..., rule: {recurring_rule})")

    if not recurring_rule:
        print(f"[DEBUG] Ignoring - not a recurring task")
        return {"status": "ignored", "reason": "not a recurring task"}

    if not task_id:
        return {"status": "error", "reason": "missing task_id"}

    try:
        with Session(engine) as session:
            task_service = TaskService(session)
            task = session.get(Task, task_id)

            if not task:
                print(f"[DEBUG] Task {task_id[:8]}... not found in database")
                return {"status": "error", "reason": "task not found"}

            # Create next recurring instance
            print(f"[DEBUG] Creating next instance for task: {task.title}")
            next_task = task_service._create_next_recurring_instance(task)
            if next_task:
                print(f"[DEBUG] Created next instance: {next_task.id}, due: {next_task.due_date}")
                # Publish task-created event for audit and websocket services
                await publish_event(
                    pubsub_name="pubsub",
                    topic_name="task-created",
                    event_data={
                        "task_id": str(next_task.id),
                        "title": next_task.title,
                        "priority": next_task.priority,
                        "category": next_task.category,
                        "due_date": next_task.due_date.isoformat() if next_task.due_date else None,
                        "recurring_rule": next_task.recurring_rule,
                        "parent_task_id": str(task.id),
                        "auto_created": True
                    },
                    user_id=user_id
                )
                return {
                    "status": "created",
                    "next_task_id": str(next_task.id),
                    "next_due_date": next_task.due_date.isoformat() if next_task.due_date else None
                }

        return {"status": "no_next_instance", "reason": "recurring period ended"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create next instance: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
