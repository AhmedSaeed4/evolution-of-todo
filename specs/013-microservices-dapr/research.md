# Research: Microservices Event-Driven Architecture with Dapr

**Feature**: 013-microservices-dapr
**Date**: 2026-02-04
**Phase**: Phase 0 - Research & Discovery

## Overview

This document consolidates all research findings for transforming the monolithic Phase 5 todo application into an event-driven microservices architecture using Dapr and Redpanda.

---

## Direct Service Calls to Remove

### File: `phase-5/backend/src/backend/services/task_service.py`

| Lines | Direct Call | Replacement |
|-------|-------------|-------------|
| 10-11 | `from .audit_service import AuditService` | Remove import |
| 10-11 | `from .notification_service import NotificationService` | Remove import |
| 20-21 | `self.audit_service = AuditService(session)` | Remove initialization |
| 20-21 | `self.notification_service = NotificationService(session)` | Remove initialization |
| 122-137 | `self.audit_service.log_event(...)` in `create_task()` | Replace with `publish_event("task-created", ...)` |
| 189-199 | `self.audit_service.log_event(...)` in `update_task()` | Replace with `publish_event("task-updated", ...)` |
| 219-231 | `self.audit_service.log_event(...)` in `delete_task()` | Replace with `publish_event("task-deleted", ...)` |
| 266-288 | `self.audit_service.log_event(...)` in `toggle_complete()` | Replace with `publish_event("task-completed", ...)` |
| 368-383 | `self.audit_service.log_event(...)` in `_create_next_recurring_instance()` | Keep - this will be called by recurring-service microservice |

### File: `phase-5/backend/src/backend/services/reminder_service.py`

| Lines | Direct Call | Replacement |
|-------|-------------|-------------|
| 11 | `from .notification_service import NotificationService` | Remove - replaced by Dapr cron binding |
| 82, 97-101 | `notification_service.create_notification(...)` | Replaced by notification-service consuming `reminder-due` events |
| 129, 141-145 | Same as above | Same |

---

## Event Schema Design

### Event Format Standard

Following **Constitution IV.B: Event Schema Standards**:

```json
{
  "event_id": "uuid-v4",
  "timestamp": "2026-02-04T10:00:00Z",
  "event_type": "task-created",
  "user_id": "user-123",
  "correlation_id": "optional-correlation-id",
  "data": {
    "task_id": "uuid",
    "title": "Task title",
    "priority": "high",
    "status": "pending"
  }
}
```

### Event Schema Requirements

All events MUST include:
- `event_id` - UUID v4 for unique identification
- `timestamp` - ISO 8601 format with UTC timezone
- `event_type` - Format: `domain.entity.action.v{version}` (e.g., `task.created.v1`)
- `user_id` - For partitioning and multi-tenancy
- `correlation_id` - For distributed tracing (defaults to event_id)
- `data` - Event payload (varies by event type)

### 6 Kafka Topics

| Topic | Publisher | Subscribers | Purpose |
|-------|-----------|-------------|---------|
| `task-created` | backend-api | audit-service, websocket-service | New task created |
| `task-updated` | backend-api | audit-service, websocket-service | Task modified |
| `task-completed` | backend-api | audit-service, recurring-service, websocket-service | Task marked complete |
| `task-deleted` | backend-api | audit-service, websocket-service | Task removed |
| `reminder-due` | notification-service | websocket-service | Reminder triggered |
| `task-updates` | (aggregated) | websocket-service | All task updates for broadcasting |

---

## Dapr Component Specifications

### Pub/Sub Component

**File**: `k8s-dapr/components/pubsub.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "redpanda.default.svc.cluster.local:9093"
  - name: authRequired
    value: "false"
  - name: consumerID
    value: "{podName}"  # Auto-generated per pod
  - name: redeliverInterval
    value: "60s"
  - name: processingTimeout
    value: "15s"
  - name: queueDepth
    value: "100"
  - name: concurrency
    value: "10"
```

**Configuration Decisions**:
- **consumerID**: `{podName}` enables scale-out (each pod processes different partition)
- **redeliverInterval**: 60s balance between reliability and latency
- **processingTimeout**: 15s prevents hanging event handlers
- **queueDepth**: 100 messages buffered per consumer
- **concurrency**: 10 parallel event handlers per pod

### Cron Binding

**File**: `k8s-dapr/bindings/cron-binding.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: reminder-check-cron
  namespace: default
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 1m"
```

**Schedule Options**:
| Format | Example | Description |
|--------|---------|-------------|
| `@every <duration>` | `@every 1m` | Every 1 minute |
| `@hourly` | - | Every hour |
| `@daily` | - | Every day at midnight |
| CRON expression | `0 */5 * * * *` | Every 5 minutes |

### State Store Component (Optional)

**File**: `k8s-dapr/components/statestore.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.postgresql
  version: v1
  metadata:
  - name: connectionString
    secretKeyRef:
      name: app-secrets
      key: DATABASE_URL
  - name: tableName
    value: "dapr_state"
```

**Purpose**: Distributed state for idempotency tracking (alternative to database table)

### Secret Store Component

**File**: `k8s-dapr/components/secrets.yaml`

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
  namespace: default
spec:
  type: secretstores.kubernetes
  version: v1
  metadata:
  - name: kubeconfigPath
    value: ""
```

---

## Helm Chart Dapr Annotations Pattern

### Required Annotations (Minimum)

```yaml
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "backend-api"
        dapr.io/app-port: "8000"
```

### Recommended Annotations (Production)

```yaml
spec:
  template:
    metadata:
      annotations:
        # Required
        dapr.io/enabled: "true"
        dapr.io/app-id: "backend-api"
        dapr.io/app-port: "8000"
        dapr.io/app-protocol: "http"

        # Logging
        dapr.io/log-level: "info"
        dapr.io/enable-api-logging: "true"
        dapr.io/log-as-json: "false"

        # Health checks
        dapr.io/enable-app-health-check: "true"
        dapr.io/app-health-check-path: "/health"
        dapr.io/app-health-probe-interval: "5"
        dapr.io/app-health-probe-timeout: "500"
        dapr.io/app-health-threshold: "3"

        # Configuration
        dapr.io/config: "appconfig"

        # Resource limits (production)
        dapr.io/sidecar-cpu-limit: "500m"
        dapr.io/sidecar-memory-limit: "512Mi"
        dapr.io/sidecar-cpu-request: "250m"
        dapr.io/sidecar-memory-request: "256Mi"

        # Graceful shutdown
        dapr.io/graceful-shutdown-seconds: "5"
```

### Annotation Reference

| Annotation | Value | Description |
|------------|-------|-------------|
| `dapr.io/enabled` | `"true"` / `"false"` | Enable Dapr sidecar injection |
| `dapr.io/app-id` | string | Unique identifier for service discovery |
| `dapr.io/app-port` | number | Port application listens on |
| `dapr.io/app-protocol` | `http`, `grpc`, `https`, `grpcs` | Protocol for Dapr to use |
| `dapr.io/log-level` | `debug`, `info`, `warn`, `error` | Dapr sidecar log verbosity |
| `dapr.io/enable-app-health-check` | `"true"` / `"false"` | Enable Dapr to check app health |
| `dapr.io/app-health-check-path` | path | HTTP path for health checks |

---

## Environment Variables Required

### Shared by All Microservices

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | JWT token validation secret | Shared with frontend Better Auth |
| `ENVIRONMENT` | Deployment environment | `development`, `staging`, `production` |

### Dapr-Specific Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DAPR_HTTP_PORT` | `3500` | Dapr HTTP API port |
| `DAPR_GRPC_PORT` | `50001` | Dapr gRPC port |
| `DAPR_HOST` | `localhost` | Dapr sidecar hostname (for local dev) |

### Service-Specific Variables

| Service | Variables |
|---------|-----------|
| backend-api | `API_HOST`, `API_PORT`, `CORS_ORIGINS`, `BETTER_AUTH_URL` |
| notification-service | `REMINDER_CHECK_INTERVAL` |
| websocket-service | `WS_HEARTBEAT_INTERVAL` |

---

## Idempotency via Dapr State Store

**⚠️ IMPORTANT**: Do NOT create a `processed_events` SQL table. Idempotency uses Dapr State Store with a generic `state` table.

### Required Migration

**File**: `phase-5/backend/migrations/003_dapr_state.sql`

```sql
-- Dapr State Store requires this table to exist
CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);

-- Optional: Index for TTL cleanup (if using TTL feature)
CREATE INDEX IF NOT EXISTS idx_state_expiredate ON state(updatedate);
```

### Key Format for Idempotency

```
processed-{event_id}-{service_name}
```

**Example**: `processed-550e8400-e29b-41d4-a716-446655440000-audit-service`

### Dapr State Store Helper

**File**: `phase-5/backend/src/backend/utils/dapr_state.py`

```python
import os
import httpx

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_STATE_URL = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/state/statestore"

async def dapr_save_state(key: str, value: dict) -> None:
    async with httpx.AsyncClient() as client:
        await client.post(DAPR_STATE_URL, json=[{"key": key, "value": value}])

async def dapr_get_state(key: str) -> dict | None:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{DAPR_STATE_URL}/{key}")
        if response.status_code == 200 and response.content:
            return response.json()
        return None

async def dapr_delete_state(key: str) -> None:
    async with httpx.AsyncClient() as client:
        await client.delete(f"{DAPR_STATE_URL}/{key}")
```

### Idempotency Check Pattern

**File**: `phase-5/backend/src/backend/utils/idempotency.py`

```python
from .dapr_state import dapr_save_state, dapr_get_state
from datetime import datetime

async def check_and_mark_processed(event_id: str, service_name: str) -> bool:
    """Returns True if already processed (skip), False if new (process)."""
    key = f"processed-{event_id}-{service_name}"
    
    existing = await dapr_get_state(key)
    if existing:
        return True  # Already processed, skip
    
    await dapr_save_state(key, {"processed_at": datetime.utcnow().isoformat()})
    return False  # Not processed, continue
```

**Purpose**: Prevent duplicate event processing when Dapr redelivers messages (at-least-once delivery)

---

## Existing Codebase Analysis

### Current Helm Chart Structure

**Backend Chart** (`helm-charts/backend/`):
- `values.yaml`: Defines image, service, environment variables
- `templates/deployment.yaml`: Kubernetes Deployment (NO Dapr annotations yet)
- `templates/service.yaml`: ClusterIP service
- Service type: LoadBalancer (will change to ClusterIP)

**Frontend Chart** (`helm-charts/frontend/`):
- Similar structure to backend
- Service type: LoadBalancer (unchanged - external access)

### Current Dockerfile Patterns

**Backend Dockerfile**:
- Multi-stage build with `uv` package manager
- Python 3.13-slim base image
- Non-root user (`appuser:appgroup`)
- Health check on `/health` endpoint
- Default CMD: `uvicorn backend.main:app`

**Frontend Dockerfile**:
- Multi-stage Next.js build
- Node.js 20-alpine base
- Standalone output mode
- Non-root user (`nextjs:nodejs`)

### Current Environment Variables (from .env files)

**Backend**:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
API_HOST="0.0.0.0"
API_PORT="8000"
BETTER_AUTH_URL="http://localhost:3000"
DEBUG="false"
ENVIRONMENT="development"
```

**Frontend**:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_BYPASS=false
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
```

---

## Technology Choices & Trade-offs

### Decision: Redpanda vs Kafka vs Redis Pub/Sub

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Redpanda** | Kafka-compatible, lightweight, easy to run locally | Less mature than Kafka | **CHOSEN** |
| Kafka | Industry standard, battle-tested | Heavy resource requirements, complex setup | Rejected for local dev |
| Redis Pub/Sub | Lightweight, simple | No persistence, no partitioning | Rejected (need persistence) |

### Decision: Dapr vs Direct HTTP vs Message Queue SDK

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Dapr** | Framework-agnostic, mTLS, sidecar pattern | Learning curve, additional infra | **CHOSEN** |
| Direct HTTP | Simple, familiar | Tight coupling, no retries | Rejected (current monolith pattern) |
| Kafka SDK | Full control, native performance | Vendor lock-in, complex | Rejected |

### Decision: Shared Database vs Database-per-Service

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Shared Database** | Simple, cross-service queries, single migration | Data coupling, shared schema | **CHOSEN** (Neon limitation) |
| Database-per-Service | Clean boundaries, independent scaling | Cross-service queries complex, data duplication | Rejected (Neon single DB) |

---

## Best Practices & Patterns

### Event Publishing Pattern

```python
# Use fire-and-forget for non-critical events
async def publish_event(topic: str, data: dict):
    try:
        await dapr_client.publish_event(
            pubsub_name="pubsub",
            topic_name=topic,
            data=data
        )
    except Exception as e:
        logger.error(f"Failed to publish event: {e}")
        # Don't fail the request if event publishing fails
```

### Event Subscription Pattern

```python
# Dapr automatically delivers events to /events/{topic} endpoint
@app.post("/events/task-created")
async def handle_task_created(event: dict):
    # 1. Validate event schema
    # 2. Check idempotency
    # 3. Process event
    # 4. Return 200 (Dapr will mark as delivered)
    return {"status": "processed"}
```

### Error Handling Pattern

```python
# Return non-2xx for transient errors (Dapr will retry)
# Return 2xx for permanent errors (Dapr will NOT retry)
@app.post("/events/{topic}")
async def handle_event(event: dict):
    try:
        process_event(event)
        return {"status": "ok"}  # 200 - success, don't retry
    except TransientError as e:
        logger.error(f"Transient error: {e}")
        raise HTTPException(status_code=503)  # Dapr will retry
    except PermanentError as e:
        logger.error(f"Permanent error: {e}")
        return {"status": "error", "error": str(e)}  # 200 - don't retry
```

---

## References

- [Dapr Documentation](https://docs.dapr.io/)
- [Redpanda Documentation](https://docs.redpanda.com/)
- [Constitution IV.B: Event Schema Standards](../../.specify/memory/constitution.md)
- [Minikube Deployment Skill](../../.claude/skills/minikube-deployment/)
