"""Audit microservice - logs all task events to database."""
import os
import sys
import logging
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from sqlmodel import Session
import uvicorn

from ..database import engine
from ..services.audit_service import AuditService
from ..utils.idempotency import check_and_mark_processed


# Configure detailed logging for audit service debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="Audit Service")


@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    return {"status": "healthy", "service": "audit-service"}


@app.get("/dapr/subscribe")
async def subscribe():
    """Dapr programmatic subscription - declares which topics this service subscribes to."""
    return [
        {"pubsubname": "pubsub", "topic": "task-created", "route": "/events/task-created"},
        {"pubsubname": "pubsub", "topic": "task-updated", "route": "/events/task-updated"},
        {"pubsubname": "pubsub", "topic": "task-completed", "route": "/events/task-completed"},
        {"pubsubname": "pubsub", "topic": "task-deleted", "route": "/events/task-deleted"}
    ]


@app.post("/events/{event_type}")
async def handle_task_event(event_type: str, event: Dict[str, Any]):
    """Handle any task event and log to audit database.

    Supports: task-created, task-updated, task-completed, task-deleted

    Args:
        event_type: The type of event (kebab-case from topic name)
        event: Event data from Dapr with event_id, user_id, and data
    """
    # ============================================================
    # DEBUG: Log full incoming request
    # ============================================================
    logger.info("=" * 60)
    logger.info(f"[AuditService] Received event: {event_type}")
    logger.info(f"[AuditService] Full event payload: {event}")
    logger.info(f"[AuditService] Event type: {type(event)}")
    logger.info(f"[AuditService] Event keys: {event.keys() if isinstance(event, dict) else 'N/A'}")
    print(f"[AuditService] DEBUG - Received event: {event_type}", file=sys.stderr)
    print(f"[AuditService] DEBUG - Full payload: {event}", file=sys.stderr)
    # ============================================================

    # Dapr CloudEvents format wraps the actual event in a "data" field
    # Check if this is a CloudEvents envelope
    if "data" in event and isinstance(event["data"], dict):
        # This might be CloudEvents format - unwrap it
        inner_data = event["data"]
        logger.info(f"[AuditService] Detected CloudEvents format, unwrapping 'data' field")
        logger.info(f"[AuditService] Inner data keys: {inner_data.keys()}")
        print(f"[AuditService] DEBUG - Unwrapping CloudEvents, inner keys: {inner_data.keys()}", file=sys.stderr)

        # Check for standard event fields in both outer and inner payload
        event_id = event.get("event_id") or inner_data.get("event_id")
        user_id = event.get("user_id") or inner_data.get("user_id")
        # The actual task data might be nested further
        data = inner_data.get("data", {}) if "data" in inner_data else inner_data
    else:
        # Standard format - event fields are at top level
        event_id = event.get("event_id")
        user_id = event.get("user_id")
        data = event.get("data", {})

    entity_id = data.get("task_id") if isinstance(data, dict) else None

    # ============================================================
    # DEBUG: Log extracted fields
    # ============================================================
    logger.info(f"[AuditService] Extracted - event_id: {event_id}")
    logger.info(f"[AuditService] Extracted - user_id: {user_id}")
    logger.info(f"[AuditService] Extracted - data: {data}")
    logger.info(f"[AuditService] Extracted - task_id (entity_id): {entity_id}")
    print(f"[AuditService] DEBUG - event_id={event_id}, user_id={user_id}, task_id={entity_id}", file=sys.stderr)
    # ============================================================

    if not event_id or not user_id:
        logger.error(f"[AuditService] Missing required fields - event_id: {event_id}, user_id: {user_id}")
        return {"status": "error", "reason": "missing event_id or user_id"}

    # Check idempotency - skip if already processed
    logger.info(f"[AuditService] Checking idempotency for event_id: {event_id}")
    already_processed = await check_and_mark_processed(event_id, "audit-service")
    if already_processed:
        logger.info(f"[AuditService] Event already processed, skipping: {event_id}")
        return {"status": "already_processed", "event_id": event_id}

    if not entity_id:
        logger.error(f"[AuditService] Missing task_id in event data. Full data: {data}")
        return {"status": "error", "reason": "missing task_id in event data"}

    try:
        logger.info(f"[AuditService] Creating database session...")
        with Session(engine) as session:
            audit_service = AuditService(session)

            # Convert event_type from kebab-case to camelCase (task-created -> created)
            clean_event_type = event_type.replace("-", "").replace("task", "")
            logger.info(f"[AuditService] Cleaned event type: {clean_event_type}")

            # Log the event
            logger.info(f"[AuditService] Calling audit_service.log_event...")
            audit_service.log_event(
                event_type=clean_event_type,
                entity_type="task",
                entity_id=entity_id,
                user_id=user_id,
                data=data
            )

            logger.info(f"[AuditService] Committing session...")
            session.commit()
            logger.info(f"[AuditService] Session committed successfully!")

        logger.info(f"[AuditService] Returning success response...")
        return {"status": "logged", "event_type": clean_event_type, "entity_id": str(entity_id)}

    except Exception as e:
        logger.exception(f"[AuditService] Exception occurred: {e}")
        print(f"[AuditService] ERROR - {type(e).__name__}: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"Failed to log event: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
