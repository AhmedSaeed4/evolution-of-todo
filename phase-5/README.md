# Phase V: Microservices Event-Driven Architecture with Dapr

> Production-ready microservices architecture with event-driven communication, Dapr sidecars, Redpanda message broker, and Kubernetes deployment using Minikube, Docker, and Helm.

**Status**: ✅ **COMPLETE** - All 5 user stories delivered with full microservices architecture

---

## 🎯 Phase Overview

**Phase V** transforms the monolithic Phase 4 application into a resilient, event-driven microservices architecture:

- **Event-Driven Communication**: Dapr Pub/Sub with Redpanda (Kafka-compatible)
- **5 Independent Microservices**: backend-api, websocket-service, notification-service, audit-service, recurring-service
- **Idempotency**: Dapr State Store (Redis) for duplicate event handling
- **Real-time Updates**: WebSocket with SSE fallback for stable tunnel connections
- **Shared Database**: Neon PostgreSQL with user isolation (shared database pattern)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                                     │
│                        LoadBalancer: 127.0.0.1:3000                                 │
│                   Dapr Sidecar: localhost:3500 (Service Invocation)                 │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           KUBERNETES SERVICES (Minikube)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   frontend   │  │   backend    │  │  websocket   │  │  recurring   │           │
│  │  :3000/Dapr  │  │  :8000/Dapr  │  │  :8001/Dapr  │  │  :8002/Dapr  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                             │
│  │ notification │  │    audit     │  │    REDPANDA  │                             │
│  │  :8003/Dapr  │  │  :8004/Dapr  │  │   (Kafka)    │                             │
│  └──────────────┘  └──────────────┘  └──────────────┘                             │
│                                                                                     │
│  Kafka Topics: task-created, task-updated, task-completed, task-deleted            │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
                    ┌──────────────────────────────────┐
                    │       NEON POSTGRESQL            │
                    │  (tasks, notifications, audit)  │
                    └──────────────────────────────────┘
```

### 5 Microservices Overview

| Service | Port | Purpose | Subscribes To | Publishes |
|---------|------|---------|---------------|-----------|
| **backend-api** | 8000 | Task CRUD operations | - | task-created, task-updated, task-completed, task-deleted |
| **websocket-service** | 8001 | Real-time updates (WS/SSE) | task-created, task-updated, task-completed, task-deleted | - |
| **notification-service** | 8002 | Reminder processing | Dapr Cron (@every 1m) | reminder-due (optional) |
| **audit-service** | 8004 | Complete audit trail | task-created, task-updated, task-completed, task-deleted | - |
| **recurring-service** | 8002 | Auto-generate recurring tasks | task-completed | task-created (new instances) |

### Event Flow Examples

**1. Creating a Task:**
```
User → Frontend → Dapr Invoke → backend-api
                                    ↓
                            Publish task-created to Kafka
                                    ↓
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   websocket-service      audit-service            (other services)
   (broadcast to clients)  (log to database)
```

**2. Completing a Recurring Task:**
```
User → Frontend → Dapr Invoke → backend-api
                                    ↓
                            Publish task-completed to Kafka
                                    ↓
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   recurring-service      websocket-service        audit-service
   (create next task)      (broadcast update)      (log event)
        ↓
Publish task-created (new instance)
```

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Orchestration** | Dapr 1.14+ | Microservices sidecar pattern, pub/sub, state management |
| **Message Broker** | Redpanda (Kafka-compatible) | Event streaming with persistence |
| **State Store** | Redis | Dapr state for idempotency checking |
| **Frontend** | Next.js 16.1.1 (App Router) | React framework with Server Components |
| **Language** | TypeScript 5.x | Type-safe frontend development |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with design tokens |
| **Animations** | Framer Motion v12.23.26 | Smooth UI transitions |
| **Icons** | Lucide React v0.562.0 | Technical iconography |
| **Toasts** | Sonner v2.0.7 | Toast notifications |
| **ChatKit** | @openai/chatkit-react | AI chat interface |
| **Backend** | FastAPI 0.128.0 | Async Python web framework |
| **Language** | Python 3.13+ | Backend services |
| **ORM** | SQLModel 0.0.31 | Pydantic + SQLAlchemy hybrid |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL (SSL required) |
| **Auth** | Better Auth v1.4.9 | Authentication framework |
| **Driver** | asyncpg | High-performance async DB driver |
| **JWT** | python-jose | Token generation/validation |
| **HTTP Client** | httpx | Async HTTP for Dapr communication |
| **Container** | Docker | Multi-stage builds |
| **Orchestration** | Kubernetes (Minikube) | Local cluster deployment |
| **Package Manager** | Helm | Kubernetes deployments |

### Dapr Components

**Pub/Sub Component** (`k8s-dapr/components/pubsub.yaml`):
- Type: Kafka (via Redpanda)
- Brokers: `redpanda.default.svc.cluster.local:9093`
- Consumer Group: `{appID}-v2` (auto-generated per service)
- Initial Offset: `newest` (start from newest messages)
- Redeliver Interval: 60s
- Processing Timeout: 15s
- Max Retries: 0 (disable retries to prevent stuck offsets)

**State Store Component** (`k8s-dapr/components/statestore.yaml`):
- Type: Redis
- Host: `redis:6379`
- Key Prefix: `none` (enable key-based access)
- Purpose: Idempotency checking for event processing
- Key Format: `processed-{event_id}-{service_name}`

**Cron Binding** (`k8s-dapr/bindings/cron-binding.yaml`):
- Type: Cron
- Schedule: `@every 1m`
- Direction: `input`
- Purpose: Trigger reminder checking in notification-service

**Programmatic Subscriptions** (via `/dapr/subscribe` endpoints):
- Each microservice declares which topics it subscribes to
- Dapr automatically routes events to matching endpoints

---

## 📁 Project Structure

```
phase-5/
├── backend/                              # FastAPI Backend Services
│   ├── Dockerfile                        # Multi-entrypoint Dockerfile
│   ├── pyproject.toml                    # Python dependencies (uv)
│   ├── .env.example                      # Environment variables template
│   ├── src/backend/
│   │   ├── main.py                       # Backend API entrypoint
│   │   ├── config.py                     # Configuration management
│   │   ├── database.py                   # Neon PostgreSQL connection
│   │   ├── agents.py                     # OpenAI Agents SDK setup
│   │   ├── routers/                      # API route handlers
│   │   │   ├── tasks.py                  # Task CRUD with event publishing
│   │   │   ├── notifications.py          # Notification endpoints
│   │   │   └── audit.py                  # Audit log endpoints
│   │   ├── services/                     # Business logic
│   │   │   ├── task_service.py           # Task operations (no direct calls)
│   │   │   ├── audit_service.py          # Audit logging (called by microservice)
│   │   │   ├── notification_service.py   # Notifications (called by microservice)
│   │   │   └── reminder_service.py       # Legacy reminder polling (replaced by cron)
│   │   ├── models/                       # Database models
│   │   │   ├── task.py                   # Task SQLModel
│   │   │   ├── notification.py           # Notification SQLModel
│   │   │   └── audit_log.py              # AuditLog SQLModel
│   │   ├── microservices/                # Microservice entrypoints
│   │   │   ├── __init__.py
│   │   │   ├── websocket_service.py      # Real-time updates (WS/SSE)
│   │   │   ├── recurring_service.py      # Recurring task generation
│   │   │   ├── notification_service.py   # Reminder processing
│   │   │   └── audit_service.py          # Event logging
│   │   ├── utils/                        # Utilities
│   │   │   ├── event_publisher.py        # Dapr event publishing helper
│   │   │   ├── dapr_state.py             # Dapr state store helper
│   │   │   └── idempotency.py            # Idempotency checking
│   │   └── api/                          # Additional API modules
│   │       └── chatkit.py                # ChatKit session management
│   └── migrations/                       # Database migrations
│       └── 003_dapr_state.sql            # Dapr state table
│
├── frontend/                             # Next.js Frontend
│   ├── Dockerfile                        # Multi-stage Docker build
│   ├── .env.local.example                # Environment variables template
│   ├── src/
│   │   ├── app/                          # App Router pages
│   │   │   ├── api/                      # API routes (Dapr proxy)
│   │   │   │   ├── tasks/                # Task CRUD proxy
│   │   │   │   │   ├── route.ts          # GET/POST → Dapr → backend-api
│   │   │   │   │   └── [id]/route.ts     # GET/PATCH/DELETE → Dapr
│   │   │   │   ├── notifications/        # Notification proxy
│   │   │   │   │   ├── route.ts          # GET → Dapr → notification-service
│   │   │   │   │   └── [id]/route.ts     # PATCH/DELETE → Dapr
│   │   │   │   ├── chatkit/              # ChatKit endpoint
│   │   │   │   │   └── route.ts
│   │   │   │   └── auth/                 # Better Auth routes
│   │   │   ├── (dashboard)/               # Protected pages
│   │   │   │   ├── tasks/                # Task management page
│   │   │   │   │   └── page.tsx          # Real-time updates via useTaskRealtimeUpdates
│   │   │   │   └── chatbot/              # AI chat interface
│   │   │   └── layout.tsx
│   │   ├── components/                   # React components
│   │   ├── hooks/                        # Custom React hooks
│   │   │   ├── useWebSocket.ts           # WebSocket/SSE hook with fallback
│   │   │   ├── useNotifications.ts       # Notification management
│   │   │   └── ...
│   │   ├── lib/                          # Utilities
│   │   │   ├── websocket.ts              # WebSocket manager
│   │   │   ├── auth-server.ts            # Better Auth client
│   │   │   └── ...
│   │   └── styles/                       # Global styles
│   └── package.json                      # Dependencies
│
├── helm-charts/                          # Kubernetes Helm Charts
│   ├── backend/                          # Backend API chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml                   # Dapr config, image, resources
│   │   └── templates/
│   │       ├── deployment.yaml           # Dapr pod annotations
│   │       ├── service.yaml              # ClusterIP
│   │       └── ...
│   ├── frontend/                         # Frontend chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   ├── websocket-service/                # WebSocket microservice chart
│   ├── notification-service/             # Notification microservice chart
│   ├── audit-service/                    # Audit microservice chart
│   └── recurring-service/                # Recurring microservice chart
│
├── k8s-dapr/                             # Dapr Infrastructure
│   ├── components/                       # Dapr components
│   │   ├── pubsub.yaml                   # Kafka Pub/Sub component
│   │   ├── statestore.yaml               # Redis State Store component
│   │   └── secrets.yaml                  # Kubernetes Secret Store
│   ├── bindings/                         # Dapr bindings
│   │   └── cron-binding.yaml             # Cron binding for reminders
│   ├── subscriptions/                    # Dapr subscriptions (declarative)
│   │   ├── websocket-service-subscription.yaml
│   │   ├── audit-service-subscription.yaml
│   │   └── recurring-service-subscription.yaml
│   ├── configurations/                   # Dapr configurations
│   │   └── no-statestore-config.yaml     # Config for services without state
│   └── redis-deployment.yaml             # Redis for state store
│
└── START.md                              # Deployment quickstart guide
```

---

## 🚀 Quick Start

### Prerequisites

- **Minikube** - Local Kubernetes cluster
- **kubectl** - Kubernetes CLI
- **helm** - Kubernetes package manager
- **docker** - Container building
- **uv** - Python package manager for backend
- **Dapr CLI** - Dapr management (optional, k8s mode only)

### 1. Start Minikube

```bash
# Start Minikube with adequate resources
minikube start --cpus=4 --memory=8192 --disk-size=50g

# Configure Docker to use Minikube's daemon
eval $(minikube docker-env)

# Verify (should show "minikube" as server name)
docker info | grep Server
```

### 2. Install Dapr

```bash
# Install Dapr in Kubernetes
dapr init -k

# Verify Dapr system pods are running
kubectl get pods -n dapr-system
```

### 3. Deploy Redpanda (Kafka)

```bash
# Add Redpanda Helm repository
helm repo add redpanda https://charts.redpanda.com
helm repo update

# Install Redpanda
helm install redpanda redpanda/redpanda \
  --set resources.cpu.cores=1 \
  --set resources.memory.container.max=1Gi

# Wait for Redpanda to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s

# Create Kafka topics
kubectl exec -it redpanda-0 -- rpk topic create \
  task-created task-completed task-updated task-deleted reminder-due task-updates

# Verify topics
kubectl exec -it redpanda-0 -- rpk topic list
```

### 4. Deploy Redis for State Store

```bash
kubectl apply -f phase-5/k8s-dapr/redis-deployment.yaml

# Verify Redis is running
kubectl get pods -l app=redis
kubectl get svc redis
```

### 5. Apply Dapr Components

```bash
# Apply Dapr components (pubsub, statestore, secrets)
kubectl apply -f phase-5/k8s-dapr/components/

# Apply Dapr bindings (cron)
kubectl apply -f phase-5/k8s-dapr/bindings/

# Verify components
kubectl get components
```

### 6. Create Kubernetes Secrets

```bash
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@host/database?sslmode=require" \
  --from-literal=BETTER_AUTH_SECRET="your-64-char-secret" \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  --from-literal=OPENAI_API_KEY="sk-your-openai-key" \
  --from-literal=XIAOMI_API_KEY="your-xiaomi-key"
```

### 7. Build Container Images

```bash
cd phase-5

# Build backend image (supports all microservices via SERVICE env var)
docker build -t phase5-backend:v1 -f backend/Dockerfile backend

# Build frontend image
docker build -t phase5-frontend:v1 \
  --build-arg NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000" \
  --build-arg NEXT_PUBLIC_AUTH_URL="http://127.0.0.1:3000" \
  --build-arg NEXT_PUBLIC_AUTH_BYPASS="false" \
  --build-arg NEXT_PUBLIC_CHATKIT_DOMAIN_KEY="local-dev" \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL="ws://127.0.0.1:8001" \
  --build-arg NEXT_PUBLIC_SSE_URL="http://127.0.0.1:8001/api/sse" \
  -f frontend/Dockerfile frontend
```

### 8. Deploy Microservices

```bash
# Deploy all services via Helm
helm upgrade --install backend helm-charts/backend --set image.tag=v1
helm upgrade --install frontend helm-charts/frontend --set image.tag=v1
helm upgrade --install websocket-service helm-charts/websocket-service
helm upgrade --install notification-service helm-charts/notification-service
helm upgrade --install audit-service helm-charts/audit-service
helm upgrade --install recurring-service helm-charts/recurring-service

# Verify all pods are running (should show 2/2 - app + Dapr sidecar)
kubectl get pods
```

### 9. Start Minikube Tunnel

```bash
# Run in separate terminal and keep running
minikube tunnel
```

### 10. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://127.0.0.1:3000 |
| **Backend API** | http://127.0.0.1:8000 |
| **Backend Docs** | http://127.0.0.1:8000/docs |
| **WebSocket Service** | http://127.0.0.1:8001/health |
| **WebSocket Endpoint** | ws://127.0.0.1:8001/ws?user_id={id} |
| **SSE Endpoint** | http://127.0.0.1:8001/api/sse/{user_id} |

---

## 🔧 Troubleshooting

### Issue: Pods stuck in `ImagePullBackOff` or `ErrImageNeverPull`

**Cause**: Image not found in Minikube's Docker daemon

**Solution**:
```bash
# Make sure you ran this before building
eval $(minikube docker-env)

# Rebuild the image
docker build -t phase5-backend:v1 -f backend/Dockerfile backend

# Redeploy
helm upgrade backend helm-charts/backend --set image.tag=v1
```

### Issue: Events not being consumed by microservices

**Cause**: Kafka consumer offset stuck or Dapr subscription not registered

**Solution**:
```bash
# Check Dapr subscriptions
kubectl get subscriptions

# Check pod logs for subscription errors
kubectl logs -l app=recurring-service -c recurring-service

# Restart consumer group by changing consumerGroup in pubsub.yaml
# Edit: k8s-dapr/components/pubsub.yaml
# Change: consumerGroup: "{appID}-v3"
# Then: kubectl apply -f k8s-dapr/components/pubsub.yaml
```

### Issue: Real-time updates not working in browser

**Cause**: WebSocket connection blocked by tunnel or SSE fallback not triggered

**Solution**:
```bash
# 1. Verify frontend was built with correct WebSocket URL
grep NEXT_PUBLIC_WEBSOCKET_URL .next/BUILD_ID  # Should show ws://127.0.0.1:8001

# 2. Verify WebSocket service is accessible
curl http://127.0.0.1:8001/health

# 3. Check browser console for [Realtime] logs
# Should see: "[Realtime] Switching to SSE after 2 WebSocket errors"

# 4. If wrong URL, rebuild frontend with correct build arg
docker build -t phase5-frontend:v1 \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL="ws://127.0.0.1:8001" \
  -f frontend/Dockerfile frontend
```

### Issue: Recurring tasks not auto-generating

**Cause**: Recurring service not consuming task-completed events

**Solution**:
```bash
# Check recurring-service logs for CloudEvents parsing errors
kubectl logs -l app=recurring-service --tail=50

# Verify task-completed topic has messages
kubectl exec -it redpanda-0 -- rpk topic consume task-completed --num 1

# Check event payload includes recurring_rule
# Expected: {"data": {"recurring_rule": "daily", ...}, "event_id": ..., ...}
```

### Issue: Idempotency not working (duplicate processing)

**Cause**: Redis state store not accessible or key format mismatch

**Solution**:
```bash
# Verify Redis is running
kubectl get pods -l app=redis

# Test Redis connection from a microservice pod
kubectl exec -it deployment/recurring-service -- \
  sh -c 'curl -v http://localhost:3500/v1.0/state/statestore/key'

# Check dapr_state.py logs for "DAPR_STATE_URL" value
# Should be: http://localhost:3500/v1.0/state/statestore
```

---

## 📊 Event Schema Reference

All events follow the CloudEvents format with the following structure:

```json
{
  "event_id": "uuid-v4",
  "event_type": "task-created",
  "timestamp": "2026-02-08T10:00:00Z",
  "user_id": "user-123",
  "correlation_id": "optional-correlation-id",
  "data": {
    "task_id": "uuid",
    "title": "Task title",
    "priority": "high",
    "category": "work",
    "status": "pending"
  }
}
```

### Event Types

| Event Type | Trigger | Published By | Subscribed By |
|------------|---------|--------------|---------------|
| `task-created` | New task created | backend-api | websocket-service, audit-service, recurring-service |
| `task-updated` | Task modified | backend-api | websocket-service, audit-service |
| `task-completed` | Task marked complete | backend-api | websocket-service, audit-service, recurring-service |
| `task-deleted` | Task removed | backend-api | websocket-service, audit-service |
| `reminder-due` | Reminder triggered (optional) | notification-service | (future: notification consumers) |

### Event Publishing Example

```python
# In backend-api routers
from backend.utils.event_publisher import publish_task_created

await publish_task_created(
    user_id=user_id,
    task_id=str(task.id),
    title=task.title,
    description=task.description,
    priority=task.priority,
    due_date=task.due_date.isoformat() if task.due_date else None,
    reminder_at=task.reminder_at.isoformat() if task.reminder_at else None,
    recurring_rule=task.recurring_rule,
    recurring_end_date=task.recurring_end_date.isoformat() if task.recurring_end_date else None,
    tags=task.tags or []
)
```

---

## 🎯 User Stories Delivered

### US1: Real-Time Task Updates Across Devices (P1) ✅

**Independent Test**: Open two browser tabs to the same user account, create a task in Tab A, verify it appears in Tab B within 2 seconds without manual refresh.

**Implementation**:
- `websocket-service.py` - WebSocket and SSE endpoints
- `useTaskRealtimeUpdates()` hook - WebSocket/SSE with automatic fallback
- Subscribes to: `task-created`, `task-updated`, `task-completed`, `task-deleted`

### US2: Automatic Recurring Task Generation (P1) ✅

**Independent Test**: Create a daily recurring task, mark it complete, verify a new task for tomorrow is created within 5 seconds.

**Implementation**:
- `recurring_service.py` - Consumes `task-completed` events
- Calls `TaskService._create_next_recurring_instance()` for recurring tasks
- Publishes `task-created` event for new instance

### US3: Timely Reminder Notifications (P2) ✅

**Independent Test**: Set a reminder for 1 minute in the future, verify notification appears at the correct time.

**Implementation**:
- `notification_service.py` - Cron binding triggered every 1 minute
- Queries tasks where `reminder_at <= NOW() - 1m` and `reminder_sent = False`
- Creates notifications via `NotificationService`

### US4: Complete Audit Trail (P2) ✅

**Independent Test**: Perform CRUD operations on tasks, verify all events are logged with timestamps and user IDs.

**Implementation**:
- `audit_service.py` - Consumes all task events
- Logs to `audit_logs` table via `AuditService.log_event()`
- Idempotency via Dapr State Store

### US5: Resilient Service Operation (P3) ✅

**Independent Test**: Stop the audit-service pod, verify task creation still works, restart service and verify events are processed.

**Implementation**:
- Idempotency checking via `idempotency.py` with Redis state store
- Resource limits on all microservices
- Health probes for self-healing

---

## 🔗 Related Documentation

- **Spec**: [../specs/013-microservices-dapr/spec.md](../specs/013-microservices-dapr/spec.md)
- **Plan**: [../specs/013-microservices-dapr/plan.md](../specs/013-microservices-dapr/plan.md)
- **Tasks**: [../specs/013-microservices-dapr/tasks.md](../specs/013-microservices-dapr/tasks.md)
- **Quickstart**: [START.md](START.md)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Dapr Docs**: https://docs.dapr.io/
- **Redpanda Docs**: https://docs.redpanda.com/

---

**Phase V Complete** ✅
*Microservices Event-Driven Architecture with Dapr*
