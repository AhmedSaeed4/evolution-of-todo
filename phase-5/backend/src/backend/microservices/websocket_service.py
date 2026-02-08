"""WebSocket microservice - broadcasts task updates to connected clients."""
import asyncio
import json
import os
from collections import defaultdict
from datetime import datetime, timezone
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uvicorn


DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="WebSocket Service")

# CORS middleware for SSE endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",   # Frontend via Minikube tunnel
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections per user
active_connections: dict[str, Set[WebSocket]] = {}

# Store active SSE connections per user (using asyncio.Queue)
sse_connections: dict[str, Set[asyncio.Queue]] = defaultdict(set)


@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes."""
    ws_conn_count = sum(len(conns) for conns in active_connections.values())
    sse_conn_count = sum(len(conns) for conns in sse_connections.values())
    return {
        "status": "healthy",
        "service": "websocket-service",
        "websocket_connections": ws_conn_count,
        "sse_connections": sse_conn_count,
        "total_connections": ws_conn_count + sse_conn_count
    }


@app.get("/dapr/subscribe")
async def subscribe():
    """Dapr programmatic subscription - declares which topics this service subscribes to."""
    return [
        {"pubsubname": "pubsub", "topic": "task-created", "route": "/events/task-created"},
        {"pubsubname": "pubsub", "topic": "task-updated", "route": "/events/task-updated"},
        {"pubsubname": "pubsub", "topic": "task-completed", "route": "/events/task-completed"},
        {"pubsubname": "pubsub", "topic": "task-deleted", "route": "/events/task-deleted"}
    ]


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str = Query(...)):
    """WebSocket endpoint for real-time updates.

    Query Parameters:
        user_id: Required - The user ID for this connection

    Example:
        ws://localhost:8001/ws?user_id=user_123
    """
    if not user_id:
        await websocket.close(code=1008, reason="user_id query parameter required")
        return

    await websocket.accept()

    if user_id not in active_connections:
        active_connections[user_id] = set()
    active_connections[user_id].add(websocket)

    # Send welcome message
    await websocket.send_json({
        "type": "connected",
        "service": "websocket-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    try:
        while True:
            # Keep connection alive and handle incoming messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[user_id].discard(websocket)
        # Clean up empty sets
        if not active_connections[user_id]:
            del active_connections[user_id]


@app.get("/api/sse/{user_id}")
async def sse_endpoint(user_id: str):
    """Server-Sent Events endpoint for real-time task updates.

    More stable than WebSocket over tunnels/proxies like Minikube.
    Sends real-time updates for task events.

    Args:
        user_id: The user ID for this connection

    Example:
        http://localhost:8001/api/sse/user_123
    """
    # Create a queue for this SSE connection
    queue = asyncio.Queue()
    sse_connections[user_id].add(queue)

    async def event_stream():
        """Generator that yields SSE events."""
        try:
            while True:
                # Wait for events (with timeout for keep-alive)
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    # Format as SSE: "data: {json}\n\n"
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Send keep-alive comment every 15s to prevent proxy drops
                    yield ": keep-alive\n\n"
        except asyncio.CancelledError:
            # Client disconnected
            sse_connections[user_id].discard(queue)
            if not sse_connections[user_id]:
                del sse_connections[user_id]
        except Exception as e:
            sse_connections[user_id].discard(queue)
            if not sse_connections[user_id]:
                del sse_connections[user_id]

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


async def handle_task_update(event: dict, action: str):
    """Handle task update event and broadcast to user's connections.

    Args:
        event: Task event from Dapr with user_id and data
        action: The action that occurred (created, updated, completed, deleted)
    """
    # Dapr wraps our payload in the 'data' field (CloudEvents format)
    cloud_data = event.get("data", {})
    if not cloud_data:
        # If not wrapped, use event directly (for backward compatibility)
        cloud_data = event

    user_id = cloud_data.get("user_id")
    data = cloud_data.get("data", {})

    if not user_id:
        return {"status": "error", "reason": "missing user_id"}

    # Create message to broadcast
    message = {
        "type": "task_update",
        "action": action,
        "data": data,
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    ws_count = 0
    sse_count = 0

    # Broadcast to WebSocket connections
    if user_id in active_connections:
        dead_connections = set()
        for connection in active_connections[user_id]:
            try:
                await connection.send_json(message)
                ws_count += 1
            except Exception:
                dead_connections.add(connection)

        # Remove dead connections
        for connection in dead_connections:
            active_connections[user_id].discard(connection)

        # Clean up empty sets
        if not active_connections[user_id]:
            del active_connections[user_id]

    # Broadcast to SSE connections
    if user_id in sse_connections:
        dead_queues = set()
        for queue in sse_connections[user_id]:
            try:
                if not queue.full():
                    await queue.put(message)
                    sse_count += 1
                else:
                    dead_queues.add(queue)
            except Exception:
                dead_queues.add(queue)

        # Remove dead queues
        for queue in dead_queues:
            sse_connections[user_id].discard(queue)

        # Clean up empty sets
        if not sse_connections[user_id]:
            del sse_connections[user_id]

    total_connections = ws_count + sse_count
    if total_connections > 0:
        return {
            "status": "broadcast",
            "action": action,
            "websocket_connections": ws_count,
            "sse_connections": sse_count,
            "total_connections": total_connections
        }
    else:
        return {"status": "no_connections", "connections": 0}


@app.post("/events/task-created")
async def handle_task_created(event: dict):
    """Handle task-created event and broadcast to clients."""
    return await handle_task_update(event, "created")


@app.post("/events/task-updated")
async def handle_task_updated(event: dict):
    """Handle task-updated event and broadcast to clients."""
    return await handle_task_update(event, "updated")


@app.post("/events/task-completed")
async def handle_task_completed(event: dict):
    """Handle task-completed event and broadcast to clients."""
    return await handle_task_update(event, "completed")


@app.post("/events/task-deleted")
async def handle_task_deleted(event: dict):
    """Handle task-deleted event and broadcast to clients."""
    return await handle_task_update(event, "deleted")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
