"""Dapr State Store helper for distributed state and idempotency tracking."""
import os
import sys
import logging
from typing import Any, Dict

import httpx

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")
DAPR_STATE_URL = f"http://{DAPR_HOST}:{DAPR_HTTP_PORT}/v1.0/state/statestore"


async def dapr_save_state(key: str, value: Dict[str, Any]) -> None:
    """
    Save a state value to Dapr State Store.

    Args:
        key: State key
        value: State value (will be JSON serialized)
    """
    try:
        logger.info(f"[DaprState] Saving state - key: {key}, value: {value}")
        print(f"[DaprState] DEBUG - Saving key: {key}", file=sys.stderr)

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                DAPR_STATE_URL,
                json=[{"key": key, "value": value}]
            )
            logger.info(f"[DaprState] Save response - status: {response.status_code}, body: {response.text}")
            print(f"[DaprState] DEBUG - Save response: {response.status_code} - {response.text}", file=sys.stderr)
    except Exception as e:
        logger.error(f"[DaprState] Failed to save state for key {key}: {e}")
        print(f"[DaprState] ERROR - Failed to save {key}: {e}", file=sys.stderr)


async def dapr_get_state(key: str) -> Dict[str, Any] | None:
    """
    Get a state value from Dapr State Store.

    Args:
        key: State key

    Returns:
        State value as dict, or None if not found
    """
    try:
        logger.info(f"[DaprState] Getting state - key: {key}")
        print(f"[DaprState] DEBUG - Getting key: {key}", file=sys.stderr)

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{DAPR_STATE_URL}/{key}")
            logger.info(f"[DaprState] Get response - status: {response.status_code}, content: {response.content}")

            if response.status_code == 200 and response.content:
                result = response.json()
                logger.info(f"[DaprState] Get result: {result}")
                print(f"[DaprState] DEBUG - Get result: {result}", file=sys.stderr)
                return result
            logger.info(f"[DaprState] No existing state found (status: {response.status_code})")
            print(f"[DaprState] DEBUG - No existing state (status: {response.status_code})", file=sys.stderr)
            return None
    except Exception as e:
        logger.error(f"[DaprState] Failed to get state for key {key}: {e}")
        print(f"[DaprState] ERROR - Failed to get {key}: {e}", file=sys.stderr)
        return None


async def dapr_delete_state(key: str) -> None:
    """
    Delete a state value from Dapr State Store.

    Args:
        key: State key to delete
    """
    try:
        logger.info(f"[DaprState] Deleting state - key: {key}")
        print(f"[DaprState] DEBUG - Deleting key: {key}", file=sys.stderr)

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.delete(f"{DAPR_STATE_URL}/{key}")
            logger.info(f"[DaprState] Delete response - status: {response.status_code}")
            print(f"[DaprState] DEBUG - Delete response: {response.status_code}", file=sys.stderr)
    except Exception as e:
        logger.error(f"[DaprState] Failed to delete state for key {key}: {e}")
        print(f"[DaprState] ERROR - Failed to delete {key}: {e}", file=sys.stderr)
