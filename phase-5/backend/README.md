# Phase 5: Event-Driven Microservices Backend

> Production-ready event-driven microservices architecture using Dapr, Redpanda (Kafka), and Redis, built on top of the Phase 2-4 FastAPI backend with AI chatbot capabilities.

## 🎯 Overview

**Phase 5** transforms the monolithic backend into an event-driven microservices architecture:

### Phase 5 Microservices Features
- **5 Independent Microservices**: backend-api, websocket-service, notification-service, audit-service, recurring-service
- **Event-Driven Architecture**: Dapr Pub/Sub with Redpanda (Kafka) message broker
- **Dapr Integration**: Pub/Sub, State Store (Redis), Cron Binding, Secret Store
- **Idempotency**: Redis-based state store for reliable event processing
- **Real-time Updates**: WebSocket + SSE fallback for live task updates
- **Recurring Tasks**: Auto-generation of next instance on completion
- **Automated Reminders**: Dapr cron binding triggers every minute
- **Complete Audit Trail**: All task events logged with full context
- **Multi-Service Docker**: Single Dockerfile with SERVICE env var for entrypoint selection

### Phase 2-4 Backend Features (Inherited)
- **FastAPI Framework**: High-performance Python web framework
- **JWT Authentication**: Secure token-based authentication using Better Auth JWKS
- **PostgreSQL Database**: Neon Serverless PostgreSQL with connection pooling
- **SQLModel ORM**: Type-safe database models with Pydantic integration
- **Full CRUD Operations**: Create, Read, Update, Delete, and Toggle task completion
- **Advanced Filtering**: Filter by status, priority, category, tags, and search
- **Multi-tenancy**: Zero-trust security with user-scoped queries
- **Dual-Agent System**: Orchestrator + Urdu Specialist with Xiaomi mimo-v2-flash
- **MCP Integration**: 7 task management tools with user isolation
- **ChatKit Integration**: OpenAI ChatKit with persistent chat history (14-method store)

**Status**: ✅ **COMPLETE** (203/215 tasks - 94%, Docker Compose skipped per user request)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Orchestration** | Dapr 1.14+ | Distributed Application Runtime |
| **Message Broker** | Redpanda (Kafka) | Event streaming (6 topics) |
| **State Store** | Redis 7 | Idempotency tracking |
| **Cron Binding** | Dapr Cron | @every 1m reminder triggers |
| **Backend** | FastAPI 0.128.0 | Async Python web framework |
| **ORM** | SQLModel 0.0.31 | Pydantic + SQLAlchemy hybrid |
| **Database** | Neon PostgreSQL | Shared database pattern |
| **Auth** | JWT via Better Auth JWKS | User authentication |
| **AI Model** | Xiaomi mimo-v2-flash | Chatbot agent |
| **Agent SDK** | OpenAI Agents SDK | Agent orchestration |
| **MCP Server** | FastMCP | Tool integration |
| **Language** | Python 3.13+ | Core implementation |

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Dapr Sidecar                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Pub/Sub   │  │ State Store  │  │    Cron Binding          │  │
│  │  (Kafka)   │  │  (Redis)     │  │    (@every 1m)           │  │
│  └─────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ backend-api  │    │ websocket    │    │ notification │
│   (8000)     │    │   (8001)     │    │   (8002)     │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
   task-created        broadcast to         check reminders
   task-updated      connected clients      publish reminder-due
   task-completed   (WebSocket/SSE)
   task-deleted
        │
        ├─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   audit      │  │  recurring   │  │  Neon DB     │
│   (8004)     │  │   (8002)     │  │  (Shared)    │
└──────────────┘  └──────────────┘  └──────────────┘
   log all events    create next    tasks, notifications,
   to audit_logs    recurring      audit_logs, sessions,
                     instance      messages
```

### Event Flow

```
User → Frontend → Dapr Invoke → backend-api
                                    ↓
                            Save to DB
                                    ↓
                    Publish task-created to Kafka
                                    ↓
        ┌───────────────────────────┼───────────────────┐
        ▼                           ▼                   ▼
   websocket-service          audit-service        recurring-service
   (broadcast to clients)      (log to DB)        (create next instance)
```

---

## 📁 Project Structure

```
phase-5/backend/
├── src/backend/
│   ├── main.py                    # FastAPI entry point + SERVICE-based routing
│   ├── config.py                  # Environment configuration
│   ├── database.py                # Neon PostgreSQL connection
│   ├── agents.py                  # Dual-agent system (Orchestrator + Urdu)
│   ├── task_serves_mcp_tools.py   # MCP server with 7 tools
│   │
│   ├── microservices/             # Microservice implementations
│   │   ├── __init__.py
│   │   ├── audit_service.py       # Audit event subscriber
│   │   ├── notification_service.py # Reminder processing (cron-triggered)
│   │   ├── recurring_service.py   # Recurring task generator
│   │   └── websocket_service.py   # Real-time broadcast service
│   │
│   ├── utils/                     # Dapr utilities
│   │   ├── dapr_state.py          # Dapr State Store client
│   │   ├── event_publisher.py     # Event publishing to Kafka
│   │   └── idempotency.py         # Idempotency checking
│   │
│   ├── api/                       # ChatKit API endpoints
│   │   └── chatkit.py            # ChatKitServer + session endpoints
│   │
│   ├── store/                     # ChatKit Store implementation
│   │   └── chatkit_store.py      # 14 methods with user isolation
│   │
│   ├── models/                    # SQLModel entities
│   │   ├── task.py               # Task model with Phase 5 fields
│   │   ├── chat.py               # ChatSession & ChatMessage models
│   │   ├── notification.py       # Notification model
│   │   ├── audit_log.py          # AuditLog model
│   │   └── agent.py              # Agent model (legacy)
│   │
│   ├── schemas/                   # Pydantic schemas
│   │   ├── task.py               # Task request/response schemas
│   │   └── notification.py       # Notification schemas
│   │
│   ├── routers/                   # API endpoints
│   │   ├── tasks.py              # Task CRUD routes with event publishing
│   │   ├── notifications.py      # Notification routes
│   │   └── audit.py              # Audit log routes
│   │
│   ├── services/                  # Business logic
│   │   ├── task_service.py       # Task operations (with event publishing)
│   │   ├── notification_service.py # Notification service (legacy)
│   │   ├── audit_service.py      # Audit logging service (legacy)
│   │   └── reminder_service.py   # Reminder polling (disabled)
│   │
│   └── auth/                      # JWT validation
│       └── jwt.py                # Better Auth JWKS integration
│
├── migrations/                    # Database migrations
│   ├── 001_create_tasks_table.py
│   ├── 002_create_agent_tables.py
│   ├── 003_dapr_state.sql        # Dapr state store table
│   ├── 003_fix_chatkit_schema.sql
│   ├── 004_phase5_features.sql   # Recurring, reminders, notifications, audit
│   ├── chat_sessions_create.sql
│   └── chat_messages_create.sql
│
├── tests/                         # API tests
│   ├── test_tasks.py
│   ├── test_agents.py
│   ├── test_api.py
│   └── test_mcp_tools.py
│
├── pyproject.toml                # Python dependencies
├── Dockerfile                    # Multi-service Docker image
├── .env.example                  # Environment template
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+**
- **uv package manager**
- **Neon PostgreSQL database** (shared by all services)
- **Dapr CLI 1.14+**
- **Redpanda** (Kafka-compatible message broker)
- **Redis 7** (for Dapr State Store)
- **OpenAI API Key** (for ChatKit)
- **Xiaomi API Key** (for mimo-v2-flash model)
- **BETTER_AUTH_SECRET** (same as frontend)

### 1. Environment Setup

```bash
# Navigate to backend directory
cd phase-5/backend

# Install dependencies
uv sync

# Create environment file
cat > .env << EOF
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT/Auth
JWT_SECRET="your-jwt-secret"
BETTER_AUTH_SECRET="your-better-auth-secret"

# Dapr
DAPR_HTTP_PORT="3500"
DAPR_HOST="localhost"

# API Configuration
API_HOST="0.0.0.0"
API_PORT="8000"
CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# AI
OPENAI_API_KEY="sk-..."
XIAOMI_API_KEY="your-xiaomi-api-key"

# Service Selection (for Docker/K8s multi-service deployment)
SERVICE="backend-api"
ENVIRONMENT="development"
DEBUG="true"
EOF
```

### 2. Run Services (Local Development)

```bash
# Backend API (main service)
SERVICE=backend-api uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000

# WebSocket Service (separate terminal)
SERVICE=websocket-service uv run uvicorn src.backend.microservices.websocket_service:app --reload --host 0.0.0.0 --port 8001

# Notification Service (separate terminal)
SERVICE=notification-service uv run uvicorn src.backend.microservices.notification_service:app --reload --host 0.0.0.0 --port 8002

# Audit Service (separate terminal)
SERVICE=audit-service uv run uvicorn src.backend.microservices.audit_service:app --reload --host 0.0.0.0 --port 8004

# Recurring Service (separate terminal)
SERVICE=recurring-service uv run uvicorn src.backend.microservices.recurring_service:app --reload --host 0.0.0.0 --port 8002
```

### 3. Run with Dapr (Local Development)

```bash
# Backend API with Dapr sidecar
dapr run --app-id backend-api --app-port 8000 --dapr-http-port 3500 \
    uv run uvicorn src.backend.main:app --host 0.0.0.0 --port 8000

# WebSocket Service with Dapr sidecar
dapr run --app-id websocket-service --app-port 8001 --dapr-http-port 3501 \
    uv run uvicorn src.backend.microservices.websocket_service:app --host 0.0.0.0 --port 8001
```

### 4. Test the Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Create task (triggers event publishing)
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"high"}' \
  http://localhost:8000/api/user_123/tasks

# WebSocket connection (real-time updates)
ws://localhost:8001/ws?user_id=user_123

# SSE fallback (if WebSocket fails)
http://localhost:8001/api/sse/user_123
```

---

## 🔧 Microservices

### 1. Backend API (backend-api)

**Port**: 8000
**App ID**: `backend-api`
**Purpose**: Main API for task CRUD + ChatKit

**Publishes Events**:
- `task-created` - When new task created
- `task-updated` - When task modified
- `task-completed` - When task toggled
- `task-deleted` - When task removed

**Endpoints**:
- All task CRUD endpoints
- ChatKit endpoints
- Health check

### 2. WebSocket Service (websocket-service)

**Port**: 8001
**App ID**: `websocket-service`
**Purpose**: Real-time updates to connected clients

**Subscribes To**:
- `task-created`
- `task-updated`
- `task-completed`
- `task-deleted`
- `reminder-due`

**Features**:
- WebSocket connections with user_id
- SSE fallback after 2 WebSocket errors
- Broadcasts to all connected clients for a user
- CORS enabled for Minikube tunnel

### 3. Notification Service (notification-service)

**Port**: 8002
**App ID**: `notification-service`
**Purpose**: Process reminders and create notifications

**Triggered By**: Dapr Cron Binding (`@every 1m`)

**Process**:
1. Check for due reminders (reminder_at <= now, reminder_sent = false)
2. Create notification records
3. Publish `reminder-due` events
4. Mark reminders as sent

### 4. Audit Service (audit-service)

**Port**: 8004
**App ID**: `audit-service`
**Purpose**: Complete audit trail of all task events

**Subscribes To**:
- `task-created`
- `task-updated`
- `task-completed`
- `task-deleted`

**Features**:
- Logs all events with full context
- Idempotency check via Dapr State
- Stores in `audit_logs` table

### 5. Recurring Service (recurring-service)

**Port**: 8002
**App ID**: `recurring-service`
**Purpose**: Auto-generate next recurring task instance

**Subscribes To**:
- `task-completed`

**Process**:
1. Check if completed task has recurring_rule
2. Calculate next due date based on rule
3. Check if recurring_end_date is passed
4. Create new task instance
5. Publish `task-created` event

---

## 📊 API Endpoints

### Backend API (port 8000)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat with AI agents |
| GET | `/api/{user_id}/tasks` | List tasks with filters |
| POST | `/api/{user_id}/tasks` | Create task (publishes event) |
| GET | `/api/{user_id}/tasks/{task_id}` | Get single task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task (publishes event) |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task (publishes event) |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion (publishes event) |
| GET | `/api/{user_id}/stats` | Get statistics |
| GET | `/api/{user_id}/notifications` | Get notifications |
| PATCH | `/api/{user_id}/notifications/{id}/read` | Mark as read |
| GET | `/api/{user_id}/audit` | Get audit logs |

### ChatKit Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/chatkit/session` | Create ChatKit session |
| POST | `/api/chatkit/refresh` | Refresh ChatKit session |
| GET | `/api/chatkit/health` | ChatKit health check |
| POST | `/api/chatkit` | Main ChatKit endpoint (SSE streaming) |

### WebSocket Service (port 8001)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| WS | `/ws?user_id={id}` | WebSocket connection |
| GET | `/api/sse/{user_id}` | SSE fallback |
| GET | `/health` | Health check |

---

## 🗄️ Database Schema

### Tasks Table (Phase 5 Enhanced)

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(20) CHECK (category IN ('work', 'personal', 'home', 'other')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    completed BOOLEAN DEFAULT false,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id TEXT NOT NULL,

    -- Phase 5 Fields
    recurring_rule VARCHAR(20) CHECK (recurring_rule IN ('daily', 'weekly', 'monthly', 'yearly')),
    recurring_end_date TIMESTAMP WITH TIME ZONE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    reminder_at TIMESTAMP WITH TIME ZONE,
    reminder_sent BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_recurring ON tasks(recurring_rule) WHERE recurring_rule IS NOT NULL;
CREATE INDEX idx_tasks_reminder ON tasks(reminder_at) WHERE reminder_at IS NOT NULL;
```

### Notifications Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) DEFAULT 'task',
    entity_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Dapr State Table

```sql
CREATE TABLE state (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    isbinary BOOLEAN DEFAULT false,
    insertdate TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updatedate TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Idempotency key format: processed-{event_id}-{service_name}
```

---

## 🔄 Event Schemas

### CloudEvents Envelope (Dapr Standard)

All events follow this structure:

```json
{
  "data": {
    "event_id": "uuid-v4",
    "timestamp": "2025-01-08T12:00:00Z",
    "event_type": "task-created",
    "user_id": "user-123",
    "correlation_id": "optional-correlation-id",
    "data": {
      "task_id": "uuid",
      "title": "Task title",
      "priority": "high",
      "category": "work"
    }
  },
  "datacontenttype": "application/json",
  "id": "unique-event-id",
  "pubsubname": "pubsub",
  "source": "backend-api",
  "specversion": "1.0",
  "topic": "task-created",
  "traceid": "trace-id"
}
```

### Kafka Topics

| Topic | Publisher | Subscribers |
|-------|-----------|-------------|
| `task-created` | backend-api, recurring-service | audit-service, websocket-service |
| `task-updated` | backend-api | audit-service, websocket-service |
| `task-completed` | backend-api | audit-service, recurring-service, websocket-service |
| `task-deleted` | backend-api | audit-service, websocket-service |
| `reminder-due` | notification-service | websocket-service |
| `task-updates` | (aggregated) | websocket-service |

---

## 🔐 Authentication

### JWT Validation

All services validate JWT tokens via Better Auth JWKS:

```python
# src/backend/auth/jwt.py
- JWKS (JSON Web Key Set) validation
- Supports EdDSA, ES256, RS256 algorithms
- User ID extraction from sub or id claims
- Bypass token support for development
```

### User Isolation

- Every database query scoped to `user_id`
- MCP tools require `user_id` parameter
- WebSocket connections authenticated via `user_id` query param
- Event envelopes include `user_id` for filtering

---

## 🧪 Testing

### Run All Tests

```bash
cd phase-5/backend
uv run pytest tests/ -v
```

### Test Coverage

```bash
uv run pytest tests/ --cov=src/backend --cov-report=html
```

### Manual Testing Checklist

- ✅ Task creation triggers `task-created` event
- ✅ WebSocket clients receive real-time updates
- ✅ SSE fallback works when WebSocket fails
- ✅ Recurring tasks auto-generate on completion
- ✅ Reminders create notifications
- ✅ Audit logs capture all events
- ✅ Idempotency prevents duplicate processing
- ✅ JWT authentication works on all endpoints
- ✅ ChatKit integration persists conversations

---

## 🐳 Docker Deployment

### Multi-Service Dockerfile

Single Docker image supports all 5 services via `SERVICE` environment variable:

```dockerfile
# SERVICE=backend-api -> runs backend API
# SERVICE=websocket-service -> runs WebSocket service
# SERVICE=notification-service -> runs notification service
# SERVICE=audit-service -> runs audit service
# SERVICE=recurring-service -> runs recurring service
```

### Build & Run

```bash
# Build image
docker build -t phase5-backend:v1 phase-5/backend/

# Run backend-api
docker run -e SERVICE=backend-api -p 8000:8000 phase5-backend:v1

# Run websocket-service
docker run -e SERVICE=websocket-service -p 8001:8001 phase5-backend:v1
```

---

## ☸️ Kubernetes Deployment

### Helm Charts

See `../helm-charts/` for complete Kubernetes deployment:

- `helm-charts/backend/` - Backend API service
- `helm-charts/websocket-service/` - WebSocket service
- `helm-charts/notification-service/` - Notification service
- `helm-charts/audit-service/` - Audit service
- `helm-charts/recurring-service/` - Recurring service

### Dapr Configuration

See `../k8s-dapr/` for Dapr components:

- `components/pubsub.yaml` - Kafka Pub/Sub component
- `components/statestore.yaml` - Redis State Store component
- `bindings/cron-binding.yaml` - @every 1m cron for reminders
- `subscriptions/` - Declarative event subscriptions
- `configurations/` - Dapr configuration (no-statestore)

---

## 🔗 Related Documentation

- **Main Project**: [../../README.md](../../README.md)
- **Spec 013**: [../../specs/013-microservices-dapr/spec.md](../../specs/013-microservices-dapr/spec.md)
- **Plan 013**: [../../specs/013-microservices-dapr/plan.md](../../specs/013-microservices-dapr/plan.md)
- **Tasks 013**: [../../specs/013-microservices-dapr/tasks.md](../../specs/013-microservices-dapr/tasks.md)
- **Quickstart**: [../../specs/013-microservices-dapr/quickstart.md](../../specs/013-microservices-dapr/quickstart.md)
- **Phase 5 README**: [../README.md](../README.md)
- **Minikube Deployment**: [../minikube-deployment.md](../minikube-deployment.md)
- **Dapr Skill**: [../../.claude/skills/minikube-deployment/](../../.claude/skills/minikube-deployment/)
- **OpenAI Agents SDK**: [../../.claude/skills/openai-agents-sdk/SKILL.md](../../.claude/skills/openai-agents-sdk/SKILL.md)
- **MCP Integration**: [../../.claude/skills/mcp-integration/SKILL.md](../../.claude/skills/mcp-integration/SKILL.md)
- **ChatKit Skill**: [../../.claude/skills/chatkit/SKILL.md](../../.claude/skills/chatkit/SKILL.md)

---

## 🎯 Success Criteria (Phase V)

### ✅ Microservices Architecture Complete
- [x] 5 independent microservices implemented
- [x] Dapr Pub/Sub with Redpanda (Kafka)
- [x] Redis State Store for idempotency
- [x] Dapr Cron Binding for reminders (@every 1m)
- [x] Event-driven communication (no direct service calls)
- [x] CloudEvents envelope format
- [x] 6 Kafka topics configured

### ✅ Real-time Updates
- [x] WebSocket connections with user_id
- [x] SSE fallback after 2 failures
- [x] Broadcast to all connected clients
- [x] CORS enabled for Minikube tunnel

### ✅ Recurring Tasks
- [x] Auto-generate next instance on completion
- [x] Support daily, weekly, monthly, yearly
- [x] Respects recurring_end_date
- [x] Parent-child linking

### ✅ Reminders & Notifications
- [x] Dapr cron triggers every minute
- [x] Processes due reminders
- [x] Creates notification records
- [x] Publishes reminder-due events

### ✅ Audit Trail
- [x] Logs all task events
- [x] Full context in JSONB data field
- [x] Idempotency via Dapr State
- [x] User-scoped queries

### ✅ Deployment
- [x] Multi-service Dockerfile
- [x] 6 Helm charts configured
- [x] Dapr components for Kubernetes
- [x] Minikube deployment ready

---

## 🚀 Upcoming (014-cloud-deployment)

- Cloud Kubernetes deployment to complete Phase 5
- Production-ready infrastructure setup
- Monitoring and observability

---

**Phase V Backend Complete** ✅ (95% - Cloud deployment pending in 014)
*Built with ❤️ using Spec-Driven Development & Dapr Microservices Architecture*
