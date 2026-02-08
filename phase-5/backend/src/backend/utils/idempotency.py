"""Idempotency utility using Dapr State Store."""
import sys
import logging
from datetime import datetime

from .dapr_state import dapr_get_state, dapr_save_state

logger = logging.getLogger(__name__)


async def check_and_mark_processed(event_id: str, service_name: str) -> bool:
    """
    Check if an event has already been processed and mark it as processed.

    Args:
        event_id: The event ID to check
        service_name: The name of the service processing the event

    Returns:
        True if already processed (skip), False if new (process)
    """
    key = f"processed-{event_id}-{service_name}"

    logger.info(f"[Idempotency] Checking event: {key}")
    print(f"[Idempotency] DEBUG - Checking key: {key}", file=sys.stderr)

    existing = await dapr_get_state(key)
    logger.info(f"[Idempotency] Existing state: {existing}")
    print(f"[Idempotency] DEBUG - Existing state: {existing}", file=sys.stderr)

    if existing:
        logger.info(f"[Idempotency] Event already processed: {event_id}")
        print(f"[Idempotency] DEBUG - Already processed, returning True", file=sys.stderr)
        return True  # Already processed, skip

    await dapr_save_state(key, {"processed_at": datetime.utcnow().isoformat()})
    logger.info(f"[Idempotency] Marked as processed: {key}")
    print(f"[Idempotency] DEBUG - Marked as processed", file=sys.stderr)
    return False  # Not processed, continue
