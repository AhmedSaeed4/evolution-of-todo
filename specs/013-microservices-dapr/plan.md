# Implementation Plan: Microservices Event-Driven Architecture with Dapr

**Branch**: `013-microservices-dapr` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-microservices-dapr/spec.md`

## Summary

Transform the existing monolithic Phase 5 todo application into a resilient event-driven microservices architecture using **Dapr** and **Redpanda** (Kafka-compatible). The system will process task operations asynchronously via pub/sub events, enabling independent service deployment, resilience to failures, and real-time user experiences through WebSocket broadcasts.

**Primary Approach**:
1. Replace direct service-to-service calls with event publishing via Dapr Pub/Sub
2. Create 4 new microservices (recurring, notification, audit, websocket) that consume events independently
3. Use Redpanda as the message broker (Kafka-compatible for local Minikube deployment)
4. Enable Dapr sidecars on all pods via Helm chart annotations
5. Frontend routes API calls through Next.js server-side routes to Dapr sidecar (browsers cannot access Dapr directly)

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Dapr SDK, httpx
- Frontend: Next.js 16+, better-auth, openai-chatkit
- Infrastructure: Dapr 1.14+, Redpanda (Kafka), Helm, Minikube
**Storage**: Neon Serverless PostgreSQL (shared database pattern)
**Testing**: pytest (backend), Jest/Vitest (frontend)
**Target Platform**: Minikube (local), Oracle OKE (cloud - branch 014)
**Project Type**: Web application (frontend + microservices backend)
**Performance Goals**:
- Task creation: <500ms (async event processing)
- Real-time updates: <2 seconds to connected clients
- Recurring task creation: <5 seconds after completion
- Reminder processing: <60 seconds of due time
**Constraints**:
- Must use existing Neon PostgreSQL (shared database)
- Must maintain backward compatibility with existing frontend
- Must support local development (docker-compose) and Minikube deployment
- Event ordering guaranteed per user (partition by user_id)
**Scale/Scope**: 6 microservices total, 6 Kafka topics, 5 Dapr building blocks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: Business logic remains in service layer (task_service.py unchanged), only cross-service calls become events
- [x] **II. AI-Native Interoperability**: MCP tools in task_serves_mcp_tools.py remain unchanged, Dapr events don't affect AI integration
- [x] **III. Strict Statelessness**: No in-memory session storage added; all state persisted to Neon DB or Kafka events
- [x] **IV. Event-Driven Decoupling**: Core requirement - replacing direct HTTP calls with Dapr Pub/Sub events
- [x] **V. Zero-Trust Multi-Tenancy**: All services maintain user_id filtering at query level
- [x] **VI. Technology Stack**: Uses authorized stack (Python 3.13+, FastAPI, SQLModel, Dapr, Kafka)
- [x] **VII. Security**: JWT validation continues across all microservices, no hardcoded secrets
- [x] **VIII. Observability**: Structured logging, correlation IDs in events, audit trail preserved

**All gates passed.** No constitutional violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/013-microservices-dapr/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (RESEARCH PHASE below)
├── data-model.md        # Phase 1 output (existing models + event schemas)
├── quickstart.md        # Phase 1 output (deployment guide)
├── contracts/           # Phase 1 output (event contracts, OpenAPI)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-5/
├── backend/
│   ├── Dockerfile                    # MODIFY: Add multi-entrypoint support
│   ├── src/backend/
│   │   ├── main.py                   # MODIFY: Remove direct service calls, add event publishing
│   │   ├── routers/
│   │   │   └── tasks.py              # MODIFY: Remove audit_service imports, add dapr_publish
│   │   ├── services/
│   │   │   ├── task_service.py       # MODIFY: Remove AuditService/NotificationService imports
│   │   │   ├── audit_service.py      # KEEP: Will be called by audit-service microservice
│   │   │   ├── notification_service.py # KEEP: Will be called by notification-service microservice
│   │   │   └── reminder_service.py   # REMOVE: Replaced by Dapr cron binding
│   │   ├── utils/
│   │   │   └── event_publisher.py    # NEW: Helper to publish events via Dapr HTTP API
│   │   ├── microservices/            # NEW: Directory for microservice entry points
│   │   │   ├── __init__.py
│   │   │   ├── recurring_service.py  # NEW: Consumes task-completed, creates next instance
│   │   │   ├── notification_service.py # NEW: Consumes reminder-due, creates notifications
│   │   │   ├── audit_service.py      # NEW: Consumes all task events, logs to DB
│   │   │   └── websocket_service.py  # NEW: Consumes task-updates, broadcasts to clients
│   │   └── models/                    # KEEP: Existing Task, AuditLog, Notification models
│   └── database.py                   # KEEP: Existing database connection
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       └── api/
│   │           ├── tasks/            # NEW: Dapr proxy routes
│   │           │   ├── route.ts      # GET/POST → Dapr → backend-api
│   │           │   └── [id]/
│   │           │       └── route.ts  # GET/PATCH/DELETE → Dapr → backend-api
│   │           └── notifications/    # NEW: Dapr proxy routes
│   │               ├── route.ts      # GET → Dapr → notification-service
│   │               └── [id]/
│   │                   └── route.ts  # PATCH/DELETE → Dapr → notification-service
│   └── Dockerfile                    # KEEP: No changes needed
│
├── helm-charts/
│   ├── frontend/                     # MODIFY: Add Dapr annotations to deployment.yaml
│   │   ├── Chart.yaml
│   │   ├── values.yaml               # MODIFY: Add dapr.enabled, dapr.appId, dapr.appPort
│   │   └── templates/
│   │       └── deployment.yaml       # MODIFY: Add Dapr pod annotations
│   ├── backend/                      # MODIFY: Add Dapr annotations
│   │   ├── Chart.yaml
│   │   ├── values.yaml               # MODIFY: Add dapr config
│   │   └── templates/
│   │       └── deployment.yaml       # MODIFY: Add Dapr pod annotations
│   ├── recurring-service/            # NEW: Helm chart for recurring task microservice
│   ├── notification-service/         # NEW: Helm chart for notification microservice
│   ├── audit-service/                # NEW: Helm chart for audit logging microservice
│   └── websocket-service/            # NEW: Helm chart for WebSocket broadcast microservice
│
├── k8s-dapr/                         # NEW: Dapr components and bindings
│   ├── components/
│   │   ├── pubsub.yaml               # Dapr Pub/Sub component (Redpanda)
│   │   ├── statestore.yaml           # Dapr State Store (optional, for idempotency)
│   │   └── secrets.yaml              # Dapr Secret Store (Kubernetes secrets)
│   └── bindings/
│       └── cron-binding.yaml         # Dapr Cron binding for reminder checking
│
└── docker-compose.yml                # NEW: Local development with all microservices
```

**Structure Decision**: Web application pattern with frontend (Next.js) and backend (FastAPI microservices). All microservices share the same Docker image with different entrypoints (defined via Helm values or docker-compose command).

## Complexity Tracking

> **No violations requiring justification - all constitutional gates passed.**

---

# RESEARCH PHASE OUTPUT

## Research.md Content

### Direct Service Calls to Remove (from code analysis)

**File**: `phase-5/backend/src/backend/services/task_service.py`

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

**File**: `phase-5/backend/src/backend/services/reminder_service.py`

| Lines | Direct Call | Replacement |
|-------|-------------|-------------|
| 11 | `from .notification_service import NotificationService` | Remove - replaced by Dapr cron binding |
| 82, 97-101 | `notification_service.create_notification(...)` | Replaced by notification-service consuming `reminder-due` events |
| 129, 141-145 | Same as above | Same |

### Event Schema Design

**Event Format Standard** (following Constitution IV.B):

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

**6 Kafka Topics**:
1. `task-created` - Published by backend-api when task created
2. `task-updated` - Published by backend-api when task updated
3. `task-completed` - Published by backend-api when task completed
4. `task-deleted` - Published by backend-api when task deleted
5. `reminder-due` - Published by notification-service when reminder triggered
6. `task-updates` - Aggregated topic for websocket broadcasts

### Dapr Component Specifications

**Pub/Sub Component** (`k8s-dapr/components/pubsub.yaml`):
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "redpanda:9093"
  - name: authRequired
    value: "false"
  - name: consumerID
    value: "{podName}"  # Auto-generated per pod
  - name: redeliverInterval
    value: "60s"
```

**Cron Binding** (`k8s-dapr/bindings/cron-binding.yaml`):
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: reminder-check-cron
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 1m"
```

### Helm Chart Dapr Annotations Pattern

**Each deployment.yaml template needs**:
```yaml
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "{{ .Values.dapr.appId }}"
        dapr.io/app-port: "{{ .Values.dapr.appPort }}"
        dapr.io/app-protocol: "http"
        dapr.io/log-level: "info"
        dapr.io/enable-app-health-check: "true"
        dapr.io/app-health-check-path: "/health"
```

### Environment Variables Required

**Shared by all microservices**:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret for token validation (shared with frontend Better Auth)
- `ENVIRONMENT` - development/staging/production

**Service-specific**:
- `DAPR_HTTP_PORT` - Default 3500 (Dapr sidecar)
- `DAPR_GRPC_PORT` - Default 50001 (Dapr sidecar)

### Database Migration Required

**⚠️ Idempotency uses Dapr State Store, NOT a custom `processed_events` table.**

**Dapr State Table** (`migrations/003_dapr_state.sql`):
```sql
CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);
```

---

# PHASE 1: DESIGN & CONTRACTS

## Data Model (data-model.md)

### Existing Models (Unchanged)

**Task** (`tasks` table):
- Fields: id, title, description, priority, category, status, completed, due_date, created_at, updated_at, user_id
- Recurring: recurring_rule, recurring_end_date, parent_task_id
- Reminder: reminder_at, reminder_sent
- Tags: tags (PostgreSQL array)

**Notification** (`notifications` table):
- Fields: id, user_id, message, task_id, type, read, created_at

**AuditLog** (`audit_logs` table):
- Fields: id, event_type, entity_type, entity_id, user_id, data (JSONB), created_at

### Idempotency via Dapr State Store

**Dapr State Table** (`state` table):
- Key format: `processed-{event_id}-{service_name}`
- Value: `{"processed_at": "ISO timestamp"}`
- Purpose: Idempotency tracking for event processing

### Event Schemas

**TaskCreatedEvent**:
```python
class TaskCreatedEvent(BaseModel):
    event_id: str
    timestamp: datetime
    user_id: str
    data: TaskData
```

**TaskCompletedEvent** (for recurring service):
```python
class TaskCompletedEvent(BaseModel):
    event_id: str
    timestamp: datetime
    user_id: str
    data: TaskData with recurring_rule field
```

## API Contracts (contracts/)

### Backend API Routes (unchanged endpoints, new internal behavior)

| Method | Endpoint | Behavior | Event Published |
|--------|----------|----------|-----------------|
| GET | `/api/{user_id}/tasks` | List tasks | None |
| POST | `/api/{user_id}/tasks` | Create task | `task-created` |
| GET | `/api/{user_id}/tasks/{id}` | Get task | None |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | `task-updated` |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | `task-deleted` |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle complete | `task-completed` (if completing) |

### Frontend API Routes (NEW - Dapr Proxy Pattern)

| Method | Endpoint | Proxy To |
|--------|----------|----------|
| GET/POST | `/api/tasks` | Dapr → backend-api |
| GET/PATCH/DELETE | `/api/tasks/[id]` | Dapr → backend-api |
| GET | `/api/notifications` | Dapr → notification-service |
| PATCH/DELETE | `/api/notifications/[id]` | Dapr → notification-service |

**Note**: Frontend routes are server-side (Next.js API Routes) because browsers cannot access Dapr sidecar directly.

## Quickstart Guide (quickstart.md)

### Local Development (docker-compose)

```bash
# 1. Build and start all services
docker-compose up -d

# 2. Verify services are healthy
docker-compose ps

# 3. Test task creation
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Test Task"}'

# 4. Check logs for event flow
docker-compose logs backend-api
docker-compose logs audit-service
```

### Minikube Deployment

```bash
# 1. Start Minikube and configure Docker
minikube start
eval $(minikube docker-env)

# 2. Install Dapr
dapr init -k

# 3. Deploy Redpanda
helm repo add redpanda https://charts.redpanda.com
helm install redpanda redpanda/redpanda --set resources.cpu.cores=1

# 4. Create Kafka topics
kubectl exec -it redpanda-0 -- rpk topic create \
  task-created task-completed task-updated task-deleted reminder-due task-updates

# 5. Apply Dapr components
kubectl apply -f phase-5/k8s-dapr/components/
kubectl apply -f phase-5/k8s-dapr/bindings/

# 6. Build images
docker build -t phase5-backend:v1 phase-5/backend
docker build -t phase5-frontend:v1 phase-5/frontend

# 7. Deploy services via Helm
helm install backend phase-5/helm-charts/backend
helm install frontend phase-5/helm-charts/frontend
helm install recurring-service phase-5/helm-charts/recurring-service
helm install notification-service phase-5/helm-charts/notification-service
helm install audit-service phase-5/helm-charts/audit-service
helm install websocket-service phase-5/helm-charts/websocket-service

# 8. Verify deployment
kubectl get pods  # Should show 2/2 containers (app + Dapr sidecar)

# 9. Start tunnel for LoadBalancer
minikube tunnel
```

---

# IMPLEMENTATION PHASES (CORRECT ORDER)

## Phase 1: Infrastructure Setup

**Objective**: Set up Minikube, Dapr, and Redpanda message broker.

```bash
# 1.1 Start Minikube
minikube start

# 1.2 Configure Docker to use Minikube daemon
eval $(minikube docker-env)

# 1.3 Install Dapr CLI (if not installed)
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# 1.4 Initialize Dapr in Kubernetes
dapr init -k

# 1.5 Verify Dapr installation
kubectl get pods -n dapr-system

# 1.6 Deploy Redpanda (Kafka-compatible)
helm repo add redpanda https://charts.redpanda.com
helm repo update
helm install redpanda redpanda/redpanda \
  --set resources.cpu.cores=1 \
  --set resources.memory.container.max=1Gi

# 1.7 Wait for Redpanda to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s

# 1.8 Create Kafka topics
kubectl exec -it redpanda-0 -- rpk topic create \
  task-created \
  task-completed \
  task-updated \
  task-deleted \
  reminder-due \
  task-updates

# 1.9 Verify topics
kubectl exec -it redpanda-0 -- rpk topic list
```

**Validation**:
- [ ] `kubectl get pods -n dapr-system` shows dapr-sidecar-injector, dapr-sentry, dapr-placement, dapr-scheduler, dapr-dashboard
- [ ] `kubectl get pods` shows redpanda-0 running
- [ ] `kubectl exec -it redpanda-0 -- rpk topic list` shows all 6 topics

## Phase 2: Create Dapr Components

**Objective**: Create Dapr Pub/Sub component and Cron binding.

**Create `phase-5/k8s-dapr/components/pubsub.yaml`**:
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
    value: "{podName}"
  - name: redeliverInterval
    value: "60s"
  - name: processingTimeout
    value: "15s"
```

**Create `phase-5/k8s-dapr/bindings/cron-binding.yaml`**:
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

**Apply components**:
```bash
kubectl apply -f phase-5/k8s-dapr/components/
kubectl apply -f phase-5/k8s-dapr/bindings/
```

**Validation**:
- [ ] `kubectl get components` shows pubsub and reminder-check-cron
- [ ] `kubectl describe component pubsub` shows Kafka configuration

## Phase 3: Create Event Publisher Utility

**Objective**: Create helper function to publish events via Dapr HTTP API.

**Create `phase-5/backend/src/backend/utils/event_publisher.py`**:
```python
"""Event publisher utility for Dapr Pub/Sub"""
import httpx
import uuid
from datetime import datetime
from typing import Any, Dict
import os

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")
DAPR_BASE_URL = f"http://{DAPR_HOST}:{DAPR_HTTP_PORT}/v1.0"


async def publish_event(
    pubsub_name: str,
    topic_name: str,
    event_data: Dict[str, Any],
    user_id: str,
    correlation_id: str = None
) -> str:
    """
    Publish an event to Dapr Pub/Sub.

    Args:
        pubsub_name: Name of the pubsub component (default: "pubsub")
        topic_name: Kafka topic to publish to
        event_data: Event payload data
        user_id: User ID for partitioning
        correlation_id: Optional correlation ID for tracing

    Returns:
        str: The event ID that was published
    """
    event_id = str(uuid.uuid4())

    event = {
        "event_id": event_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": topic_name,
        "user_id": user_id,
        "correlation_id": correlation_id or event_id,
        "data": event_data
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{DAPR_BASE_URL}/publish/{pubsub_name}/{topic_name}",
            json=event,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

    return event_id
```

**Validation**:
- [ ] File exists at `phase-5/backend/src/backend/utils/event_publisher.py`
- [ ] Function signature matches usage in routers

## Phase 4: Create Microservices Entry Points

**Objective**: Create 4 new FastAPI apps as separate microservices.

### 4.1 Recurring Service

**Create `phase-5/backend/src/backend/microservices/recurring_service.py`**:
```python
"""Recurring task microservice - creates next instance when task completed"""
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from sqlmodel import Session, select
from contextlib import asynccontextmanager
import os
import httpx

from ..database import engine, get_session
from ..models.task import Task
from ..services.task_service import TaskService

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="Recurring Service")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/events/task-completed")
async def handle_task_completed(event: dict):
    """Handle task-completed event from Kafka"""
    user_id = event.get("user_id")
    data = event.get("data", {})
    task_id = data.get("task_id")
    recurring_rule = data.get("recurring_rule")

    if not recurring_rule:
        return {"status": "ignored", "reason": "not a recurring task"}

    with Session(engine) as session:
        task_service = TaskService(session)
        task = session.get(Task, task_id)

        if not task:
            return {"status": "error", "reason": "task not found"}

        # Create next recurring instance
        next_task = task_service._create_next_recurring_instance(task)
        if next_task:
            return {"status": "created", "next_task_id": str(next_task.id)}

    return {"status": "no_next_instance"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### 4.2 Notification Service

**Create `phase-5/backend/src/backend/microservices/notification_service.py`**:
```python
"""Notification microservice - processes reminder-due events"""
import uvicorn
from fastapi import FastAPI
from sqlmodel import Session, select
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager
import os

from ..database import engine
from ..models.task import Task
from ..services.notification_service import NotificationService

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="Notification Service")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/events/reminder-check")
async def handle_reminder_check(background_tasks):
    """Handle cron binding trigger for reminder checking"""
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

    return {"status": "processed", "count": len(tasks)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
```

### 4.3 Audit Service

**Create `phase-5/backend/src/backend/microservices/audit_service.py`**:
```python
"""Audit microservice - logs all task events"""
import uvicorn
from fastapi import FastAPI
from sqlmodel import Session
from contextlib import asynccontextmanager
import os

from ..database import engine
from ..services.audit_service import AuditService

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="Audit Service")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/events/{event_type}")
async def handle_task_event(event_type: str, event: dict):
    """Handle any task event and log to audit database"""
    user_id = event.get("user_id")
    data = event.get("data", {})
    entity_id = data.get("task_id")

    with Session(engine) as session:
        audit_service = AuditService(session)
        audit_service.log_event(
            event_type=event_type.replace("-", ""),  # task-created -> created
            entity_type="task",
            entity_id=entity_id,
            user_id=user_id,
            data=data
        )
        session.commit()

    return {"status": "logged"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
```

### 4.4 WebSocket Service

**Create `phase-5/backend/src/backend/microservices/websocket_service.py`**:
```python
"""WebSocket microservice - broadcasts task updates to connected clients"""
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Set
import os

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_HOST = os.getenv("DAPR_HOST", "localhost")

app = FastAPI(title="WebSocket Service")

# Store active WebSocket connections per user
active_connections: dict[str, Set[WebSocket]] = {}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()

    if user_id not in active_connections:
        active_connections[user_id] = set()
    active_connections[user_id].add(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections[user_id].discard(websocket)


@app.post("/events/task-updates")
async def handle_task_update(event: dict):
    """Handle task update event and broadcast to user's connections"""
    user_id = event.get("user_id")

    if user_id not in active_connections:
        return {"status": "no_connections"}

    # Broadcast to all connections for this user
    for connection in active_connections[user_id]:
        try:
            await connection.send_json(event)
        except Exception:
            # Remove dead connection
            active_connections[user_id].discard(connection)

    return {"status": "broadcast", "connections": len(active_connections.get(user_id, set()))}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
```

**Validation**:
- [ ] All 4 microservice files created
- [ ] Each has `/health` endpoint
- [ ] Each listens on unique port (8001-8004)

## Phase 5: Modify backend-api to Publish Events

**Objective**: Remove direct service calls from task_service.py and routers, add event publishing.

### 5.1 Modify task_service.py

**Edit `phase-5/backend/src/backend/services/task_service.py`**:

1. **Remove imports** (lines 10-11):
```python
# DELETE THESE LINES:
from .audit_service import AuditService
from .notification_service import NotificationService
```

2. **Remove service initialization** (lines 20-21):
```python
# DELETE THESE LINES:
self.audit_service = AuditService(session)
self.notification_service = NotificationService(session)
```

3. **Remove audit logging calls**:
```python
# DELETE these sections from create_task, update_task, delete_task, toggle_complete:
# self.audit_service.log_event(...)
```

**Note**: Keep `_create_next_recurring_instance` method intact - it will be called by recurring-service microservice.

### 5.2 Modify routers/tasks.py to publish events

**Edit `phase-5/backend/src/backend/routers/tasks.py`**:

1. **Add import**:
```python
from ..utils.event_publisher import publish_event
```

2. **Modify create_task endpoint** (after line 77):
```python
task = service.create_task(user_id, task_data)

# NEW: Publish event
await publish_event(
    pubsub_name="pubsub",
    topic_name="task-created",
    event_data={
        "task_id": str(task.id),
        "title": task.title,
        "priority": task.priority,
        "category": task.category,
        "status": task.status
    },
    user_id=user_id
)

return task
```

3. **Modify update_task endpoint** (after line 117):
```python
task = service.update_task(user_id, task_id, task_data)

# NEW: Publish event
if task:
    await publish_event(
        pubsub_name="pubsub",
        topic_name="task-updated",
        event_data={
            "task_id": str(task.id),
            "title": task.title,
            "changes": task_data.model_dump(exclude_unset=True)
        },
        user_id=user_id
    )

return task
```

4. **Modify delete_task endpoint** (after line 139):
```python
deleted = service.delete_task(user_id, task_id)

# NEW: Publish event
if deleted:
    await publish_event(
        pubsub_name="pubsub",
        topic_name="task-deleted",
        event_data={
            "task_id": str(task_id)
        },
        user_id=user_id
    )
```

5. **Modify toggle_complete endpoint** (after line 159):
```python
task = service.toggle_complete(user_id, task_id)

# NEW: Publish event
if task and task.completed:
    await publish_event(
        pubsub_name="pubsub",
        topic_name="task-completed",
        event_data={
            "task_id": str(task.id),
            "title": task.title,
            "recurring_rule": task.recurring_rule,
            "completed": True
        },
        user_id=user_id
    )

return task
```

**Validation**:
- [ ] No direct imports of AuditService or NotificationService remain
- [ ] All CRUD endpoints publish events after database operations
- [ ] Events are published asynchronously (doesn't block response)

## Phase 6: Modify Dockerfile for Multi-Entrypoint

**Objective**: Update Dockerfile to support multiple microservice entrypoints.

**Edit `phase-5/backend/Dockerfile`** - modify CMD section:
```dockerfile
# Add this before CMD:
# Support multiple entrypoints via ENV variable
ENV SERVICE="backend-api"

# Update CMD:
CMD ["sh", "-c", "if [ \"$SERVICE\" = \"recurring-service\" ]; then uvicorn backend.microservices.recurring_service:app --host 0.0.0.0 --port 8000; \
elif [ \"$SERVICE\" = \"notification-service\" ]; then uvicorn backend.microservices.notification_service:app --host 0.0.0.0 --port 8000; \
elif [ \"$SERVICE\" = \"audit-service\" ]; then uvicorn backend.microservices.audit_service:app --host 0.0.0.0 --port 8000; \
elif [ \"$SERVICE\" = \"websocket-service\" ]; then uvicorn backend.microservices.websocket_service:app --host 0.0.0.0 --port 8000; \
else uvicorn backend.main:app --host 0.0.0.0 --port 8000; fi"]
```

**Validation**:
- [ ] Dockerfile builds successfully
- [ ] Setting `SERVICE=recurring-service` env var starts correct service

## Phase 7: Create NEW Helm Charts

**Objective**: Create Helm charts for the 4 new microservices.

### 7.1 Recurring Service Chart

**Create directory**: `phase-5/helm-charts/recurring-service/`

**File: Chart.yaml**:
```yaml
apiVersion: v2
name: recurring-service
description: Recurring task microservice
type: application
version: 0.1.0
appVersion: "1.0"
```

**File: values.yaml**:
```yaml
replicaCount: 1

image:
  repository: phase5-backend
  pullPolicy: IfNotPresent
  tag: "v1"

dapr:
  enabled: true
  appId: "recurring-service"
  appPort: "8001"

service:
  type: ClusterIP
  port: 8001

env:
  SERVICE: "recurring-service"
  ENVIRONMENT: "development"

envFrom:
  - secretRef:
      name: app-secrets

livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 5
```

**File: templates/deployment.yaml** (add Dapr annotations):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "recurring-service.fullname" . }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ include "recurring-service.name" . }}
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "{{ .Values.dapr.appId }}"
        dapr.io/app-port: "{{ .Values.dapr.appPort }}"
        dapr.io/app-protocol: "http"
        dapr.io/log-level: "info"
        dapr.io/enable-app-health-check: "true"
        dapr.io/app-health-check-path: "/health"
      labels:
        app: {{ include "recurring-service.name" . }}
    spec:
      containers:
      - name: recurring-service
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.service.port }}
        env:
        - name: SERVICE
          value: {{ .Values.env.SERVICE }}
        envFrom:
        {{- toYaml .Values.envFrom | nindent 8 }}
```

### 7.2 Create Similar Charts for:

- `notification-service` (port 8002)
- `audit-service` (port 8003)
- `websocket-service` (port 8004)

**Validation**:
- [ ] All 4 Helm charts created
- [ ] Each has unique dapr.appId
- [ ] Each has correct port in dapr.appPort
- [ ] SERVICE environment variable matches service name

## Phase 8: UPDATE Existing Helm Charts

**Objective**: Add Dapr annotations to frontend and backend charts.

### 8.1 Update Backend Chart

**Edit `phase-5/helm-charts/backend/values.yaml`** - add dapr section:
```yaml
# Add after image section:
dapr:
  enabled: true
  appId: "backend-api"
  appPort: "8000"
```

**Edit `phase-5/helm-charts/backend/templates/deployment.yaml`** - add annotations:
```yaml
# In template.metadata.annotations section:
spec:
  template:
    metadata:
      annotations:
        {{- if .Values.dapr.enabled }}
        dapr.io/enabled: "true"
        dapr.io/app-id: "{{ .Values.dapr.appId }}"
        dapr.io/app-port: "{{ .Values.dapr.appPort }}"
        dapr.io/app-protocol: "http"
        dapr.io/log-level: "info"
        dapr.io/enable-app-health-check: "true"
        dapr.io/app-health-check-path: "/health"
        {{- end }}
```

### 8.2 Update Frontend Chart

**Edit `phase-5/helm-charts/frontend/values.yaml`** - add dapr section:
```yaml
dapr:
  enabled: true
  appId: "frontend"
  appPort: "3000"
```

**Edit `phase-5/helm-charts/frontend/templates/deployment.yaml`** - add annotations (same pattern as backend).

**Validation**:
- [ ] Backend deployment.yaml has Dapr annotations
- [ ] Frontend deployment.yaml has Dapr annotations
- [ ] dapr.enabled can be toggled via values.yaml

## Phase 9: Create docker-compose.yml

**Objective**: Create docker-compose for local development without Minikube.

**Create `phase-5/docker-compose.yml`**:
```yaml
version: '3.8'

services:
  redpanda:
    image: docker.redpanda.com/redpandadata/redpanda:v23.2.4
    command:
      - redpanda start
      - --overprovisioned
      - --smp 1
      - --memory 1G
      - --reserve-memory 0M
      - --node-id 0
      - --check=false
      - --kafka-addr 0.0.0.0:9092
      - --advertise-kafka-addr localhost:9092
    ports:
      - "9092:9092"
      - "9644:9644"

  backend-api:
    build: ./backend
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - DAPR_HTTP_PORT=3500
    ports:
      - "8000:8000"
    depends_on:
      - redpanda
      - dapr-backend

  dapr-backend:
    image: daprio/daprd:edge
    command: ["./daprd", "-app-id", "backend-api", "-app-port", "8000", "-dapr-http-port", "3500", "-placement-host-address", "dapr-placement"]
    volumes:
      - ./backend:/app
    network_mode: service:backend-api

  # Repeat pattern for other services...

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
    depends_on:
      - backend-api
```

**Validation**:
- [ ] `docker-compose up -d` starts all services
- [ ] All services are healthy
- [ ] Events flow from backend-api to microservices

## Phase 10: Create Frontend API Routes (Dapr Proxy)

**Objective**: Create Next.js API routes that proxy requests to Dapr sidecar.

### 10.1 Create Tasks API Routes

**Create `phase-5/frontend/src/app/api/tasks/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_PORT = process.env.DAPR_HTTP_PORT || '3500';
const DAPR_URL = `http://${DAPR_HOST}:${DAPR_PORT}/v1.0`;

// GET /api/tasks - List tasks (proxy to backend-api via Dapr)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id');

  const response = await fetch(
    `${DAPR_URL}/invoke/backend-api/method/api/${userId}/tasks?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}

// POST /api/tasks - Create task (proxy to backend-api via Dapr)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const userId = body.user_id;

  const response = await fetch(
    `${DAPR_URL}/invoke/backend-api/method/api/${userId}/tasks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
```

**Create `phase-5/frontend/src/app/api/tasks/[id]/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';

const DAPR_URL = `http://localhost:3500/v1.0`;

// GET /api/tasks/[id] - Get single task
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = request.nextUrl.searchParams.get('user_id');

  const response = await fetch(
    `${DAPR_URL}/invoke/backend-api/method/api/${userId}/tasks/${params.id}`,
    { method: 'GET' }
  );

  const data = await response.json();
  return NextResponse.json(data);
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const userId = body.user_id;

  const response = await fetch(
    `${DAPR_URL}/invoke/backend-api/method/api/${userId}/tasks/${params.id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = request.nextUrl.searchParams.get('user_id');

  const response = await fetch(
    `${DAPR_URL}/invoke/backend-api/method/api/${userId}/tasks/${params.id}`,
    { method: 'DELETE' }
  );

  return NextResponse.json({}, { status: response.status });
}
```

**Validation**:
- [ ] API routes created for tasks
- [ ] API routes created for notifications
- [ ] All routes proxy through Dapr sidecar
- [ ] JWT tokens forwarded correctly

## Phase 11: Database Migration

**Objective**: Create Dapr State table for idempotency.

**⚠️ IMPORTANT**: Use Dapr State Store, NOT a custom `processed_events` table.

**Create `phase-5/backend/migrations/003_dapr_state.sql`**:
```sql
-- Migration: Create Dapr State Store table for idempotency
CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);
```

**Run migration**:
```bash
psql $DATABASE_URL -f phase-5/backend/migrations/003_dapr_state.sql
```

**Validation**:
- [ ] State table created successfully
- [ ] Can insert/query key-value pairs
- [ ] Indexes created for query performance

## Phase 12: Deploy All Services

**Objective**: Deploy all microservices via Helm.

```bash
# 12.1 Build images (after eval $(minikube docker-env))
docker build -t phase5-backend:v1 phase-5/backend
docker build -t phase5-frontend:v1 phase-5/frontend

# 12.2 Deploy services
helm install backend phase-5/helm-charts/backend
helm install frontend phase-5/helm-charts/frontend
helm install recurring-service phase-5/helm-charts/recurring-service
helm install notification-service phase-5/helm-charts/notification-service
helm install audit-service phase-5/helm-charts/audit-service
helm install websocket-service phase-5/helm-charts/websocket-service

# 12.3 Verify pods (should show 2/2 containers)
kubectl get pods

# Expected output:
# NAME                                    READY   STATUS    RESTARTS   AGE
# backend-xxx-yyy                         2/2     Running   0          1m
# frontend-xxx-yyy                        2/2     Running   0          1m
# recurring-service-xxx-yyy               2/2     Running   0          1m
# notification-service-xxx-yyy            2/2     Running   0          1m
# audit-service-xxx-yyy                   2/2     Running   0          1m
# websocket-service-xxx-yyy               2/2     Running   0          1m

# 12.4 Start tunnel for LoadBalancer
minikube tunnel

# 12.5 Get frontend external IP
kubectl get svc frontend
# Access via: http://<EXTERNAL-IP>:3000
```

**Validation**:
- [ ] All 6 services deployed
- [ ] All pods show 2/2 containers (app + Dapr sidecar)
- [ ] `kubectl get pods` shows all pods Running
- [ ] `minikube tunnel` provides external IP

---

# TESTING SECTION

## Phase A: Local Docker Testing

```bash
# 1. Build all images
docker-compose build

# 2. Start all services
docker-compose up -d

# 3. Wait for services to be healthy
docker-compose ps

# 4. Test backend-api directly
curl http://localhost:8000/health
curl http://localhost:8000/api/tasks

# 5. Test frontend
curl http://localhost:3000

# 6. Check logs for errors
docker-compose logs backend-api
docker-compose logs recurring-service
docker-compose logs notification-service
docker-compose logs audit-service
docker-compose logs websocket-service

# 7. Cleanup
docker-compose down
```

## Phase B: Minikube Deployment Testing

```bash
# 1. Start Minikube
minikube start

# 2. CRITICAL: Configure Docker to use Minikube
eval $(minikube docker-env)

# 3. Build images in Minikube
docker build -t phase5-backend:v1 phase-5/backend
docker build -t phase5-frontend:v1 phase-5/frontend

# 4. Install Dapr
dapr init -k

# 5. Apply Dapr components
kubectl apply -f phase-5/k8s-dapr/components/
kubectl apply -f phase-5/k8s-dapr/bindings/

# 6. Deploy Redpanda (local Kafka)
helm repo add redpanda https://charts.redpanda.com
helm install redpanda redpanda/redpanda --set resources.cpu.cores=1

# 7. Create topics
kubectl exec -it redpanda-0 -- rpk topic create task-created task-completed task-updated task-deleted reminder-due task-updates

# 8. Deploy services via Helm
helm install backend phase-5/helm-charts/backend
helm install frontend phase-5/helm-charts/frontend
helm install recurring-service phase-5/helm-charts/recurring-service
helm install notification-service phase-5/helm-charts/notification-service
helm install audit-service phase-5/helm-charts/audit-service
helm install websocket-service phase-5/helm-charts/websocket-service

# 9. Verify pods are running
kubectl get pods
# All pods should show "Running" and "2/2" (app + Dapr sidecar)

# 10. Verify services
kubectl get services

# 11. Start tunnel for LoadBalancer access
minikube tunnel

# 12. Get frontend external IP
kubectl get svc frontend
# Access: http://<EXTERNAL-IP>:3000
```

## Phase C: End-to-End Event Flow Testing

```bash
# 1. Create a task via API
curl -X POST http://<frontend-ip>:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Test Task", "priority": "high"}'

# 2. Verify audit log received the event
kubectl logs -l app=audit-service --tail=50
# Should see: "Received task-created event"

# 3. Verify websocket service received the event
kubectl logs -l app=websocket-service --tail=50
# Should see: "Broadcasting task-created to clients"

# 4. Complete a recurring task
curl -X PATCH http://<frontend-ip>:3000/api/tasks/<task-id>/complete

# 5. Verify recurring service created next task
kubectl logs -l app=recurring-service --tail=50
# Should see: "Created next recurring task"

# 6. Check Redpanda topics have messages
kubectl exec -it redpanda-0 -- rpk topic consume task-created --num 1
```

## Phase D: Troubleshooting Commands

```bash
# Check pod details (for startup errors)
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c daprd  # Dapr sidecar logs

# Check Dapr components
kubectl get components

# Check Dapr subscriptions
kubectl get subscriptions

# Restart a deployment
kubectl rollout restart deployment/<service-name>

# Delete and reinstall a Helm release
helm uninstall <service-name>
helm install <service-name> phase-5/helm-charts/<service-name>

# Check service endpoints
kubectl get endpoints

# Port forward for debugging
kubectl port-forward svc/backend 8000:8000

# Dapr dashboard
dapr dashboard -k
```

### Expected Results

| Check | Expected |
|-------|----------|
| All pods running | 6 pods, each with 2/2 containers (app + Dapr) |
| Create task | Returns 201, audit log shows event |
| Complete recurring task | Next task created automatically |
| Reminder at due time | Notification created, websocket broadcasts |
| Frontend loads | Shows task list from backend |
| No direct service calls | backend-api only publishes events |

---

# ARCHITECTURAL DECISION RECORD SUGGESTIONS

Based on the research and planning phase, the following significant architectural decisions were made:

## 📋 Architectural Decision 1: Event-Driven Microservices with Dapr

**Significance**: High (long-term impact on system architecture, multiple alternatives considered)

**Decision**: Use Dapr Pub/Sub with Redpanda (Kafka-compatible) for event-driven communication between microservices instead of direct HTTP calls or message queues like Redis/RabbitMQ.

**Alternatives Considered**:
1. Direct HTTP calls (current monolith) - Rejected due to coupling and cascading failures
2. Redis Pub/Sub - Rejected due to lack of persistence and partitioning
3. RabbitMQ - Rejected due to operational complexity
4. Kafka - Rejected for local development (too heavy), but Redpanda chosen as Kafka-compatible alternative

**Trade-offs**:
- Pros: Decoupled services, resilience to failures, event replay, partitioning support
- Cons: Increased operational complexity, eventual consistency, debugging challenges

**Document?** Run `/sp.adr event-driven-microservices-dapr` to create ADR.

## 📋 Architectural Decision 2: Shared Database Pattern

**Significance**: High (affects data ownership and service boundaries)

**Decision**: All microservices share the same Neon PostgreSQL database instead of database-per-service pattern.

**Alternatives Considered**:
1. Database-per-service - Rejected due to Neon limitations (single database) and cross-service queries
2. CQRS with separate read/write DBs - Rejected as overkill for current scale

**Trade-offs**:
- Pros: Simpler deployment, cross-service queries possible, single migration path
- Cons: Tight coupling at data layer, potential for conflicting schema changes

**Document?** Run `/sp.adr shared-database-pattern` to create ADR.

## 📋 Architectural Decision 3: Dapr Cron Binding for Reminders

**Significance**: Medium (affects reminder processing architecture)

**Decision**: Use Dapr Cron Binding to trigger reminder checking every minute instead of asyncio polling in the main backend service.

**Alternatives Considered**:
1. Asyncio polling (current) - Rejected due to blocking nature in monolith
2. Celery/Redis Queue - Rejected to avoid additional infrastructure
3. Kubernetes CronJob - Rejected due to lack of event integration

**Trade-offs**:
- Pros: Infrastructure-as-code, event-driven, scalable
- Cons: 1-minute granularity limit, Dapr dependency

**Document?** Run `/sp.adr dapr-cron-reminder-binding` to create ADR.

---

# FOLLOW-UPS AND RISKS

## Follow-ups

1. **Frontend WebSocket Integration**: Current plan creates WebSocket service but doesn't modify frontend to connect to it. Follow-up task: Update frontend to establish WebSocket connection and handle real-time updates.

2. **Observability**: Plan doesn't include distributed tracing implementation. Follow-up task: Add OpenTelemetry integration for tracing across microservices.

3. **Idempotency Implementation**: Plan uses Dapr State Store (`state` table) for idempotency with key format `processed-{event_id}-{service_name}`. Add idempotency checks in all event handlers using `dapr_state.py` helper.

4. **Dead Letter Queue**: Plan doesn't implement DLQ for failed events. Follow-up task: Add DLQ handling for failed messages.

5. **Service Discovery**: Current plan uses Kubernetes DNS for service discovery. For OKE deployment (branch 014), consider Dapr service invocation for inter-service calls.

## Risks

1. **Dapr Learning Curve**: Team unfamiliar with Dapr may struggle with debugging event flows. Mitigation: Comprehensive documentation and troubleshooting guide.

2. **Event Ordering**: While partitioning by user_id helps guarantee ordering per user, cross-user event ordering is not guaranteed. Mitigation: Document this limitation and design services to be order-agnostic where possible.

3. **Network Partitions**: In Minikube/local development, network partitions may cause message delivery delays. Mitigation: Configure appropriate Dapr retry policies.

4. **Schema Evolution**: Event schemas may evolve, requiring backward compatibility. Mitigation: Follow Constitution IV.B for versioning and additive changes only.

5. **Resource Consumption**: Running 6 microservices with Dapr sidecars consumes significant memory. Mitigation: Set appropriate resource limits in Helm charts.

---

**End of Implementation Plan**

Next Steps:
1. Review this plan and approve or request changes
2. Run `/sp.tasks` to generate actionable tasks
3. Consider creating ADRs for the architectural decisions listed above
