# Data Model: Minikube Deployment

**Feature**: 011-minikube-deployment
**Date**: 2026-01-25
**Status**: Complete

## Overview

This is an infrastructure deployment feature. No new application data models are introduced. The existing Phase-4 data models are preserved and containerized. This document describes both the existing application entities and the new Kubernetes infrastructure entities.

---

## Part 1: Existing Application Data Models (Preserved)

### Database Schema (Neon PostgreSQL)

The following tables exist in Neon PostgreSQL and are unchanged by this deployment feature:

#### users
**Purpose**: Better Auth user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | User unique identifier |
| email | text | UNIQUE NOT NULL | User email address |
| name | text | | User display name |
| password | text | NOT NULL | Bcrypt hashed password |
| created_at | timestamp | DEFAULT NOW() | Account creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_users_email` on `email` (unique)

**Relationships**:
- One-to-many with `tasks` (via `user_id`)
- One-to-many with `chat_sessions` (via `user_id`)

---

#### tasks
**Purpose**: Task management entities

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | Task unique identifier |
| user_id | text | NOT NULL FK | Owner user ID |
| title | text | NOT NULL | Task title |
| description | text | | Task description |
| status | text | DEFAULT 'pending' | Task status (pending/completed) |
| priority | text | DEFAULT 'medium' | Task priority (low/medium/high) |
| category | text | | Task category |
| due_date | timestamp | | Task due date |
| created_at | timestamp | DEFAULT NOW() | Creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

**Indexes**:
- `idx_tasks_user_id` on `user_id`
- `idx_tasks_status` on `status`
- `idx_tasks_priority` on `priority`

**Relationships**:
- Many-to-one with `users` (via `user_id`)

**Validation Rules**:
- `status` must be one of: 'pending', 'completed', 'cancelled'
- `priority` must be one of: 'low', 'medium', 'high'
- `user_id` must match authenticated user (Zero-Trust Multi-Tenancy)

---

#### chat_sessions
**Purpose**: ChatKit conversation history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | Session unique identifier |
| user_id | text | NOT NULL FK | Owner user ID |
| title | text | | Session title (auto-generated) |
| created_at | timestamp | DEFAULT NOW() | Session creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last activity timestamp |

**Indexes**:
- `idx_chat_sessions_user_id` on `user_id`
- `idx_chat_sessions_updated_at` on `updated_at` (DESC)

**Relationships**:
- Many-to-one with `users` (via `user_id`)
- One-to-many with `chat_messages` (via `session_id`)

**Validation Rules**:
- `user_id` must match authenticated user (Zero-Trust Multi-Tenancy)

---

#### chat_messages
**Purpose**: ChatKit message persistence

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | Message unique identifier |
| session_id | text | NOT NULL FK | Parent session ID |
| role | text | NOT NULL | Message role (user/assistant/system) |
| content | text | NOT NULL | Message content |
| created_at | timestamp | DEFAULT NOW() | Message timestamp |
| attachments | jsonb | | File attachments (if any) |

**Indexes**:
- `idx_chat_messages_session_id` on `session_id`
- `idx_chat_messages_created_at` on `created_at` (DESC)

**Relationships**:
- Many-to-one with `chat_sessions` (via `session_id`)

**Validation Rules**:
- `role` must be one of: 'user', 'assistant', 'system'
- `session_id` must belong to authenticated user

---

### SQLModel Entities (Backend)

**File**: `phase-4/backend/src/backend/models/task.py`

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    category: Optional[str] = None
    due_date: Optional[datetime] = None

class Task(TaskBase, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskRead(TaskBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
```

---

### Pydantic Schemas (Backend)

**File**: `phase-4/backend/src/backend/schemas/task.py`

```python
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    category: Optional[str] = None
    due_date: Optional[str] = None  # ISO 8601 string for JSON

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[str] = None

class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
```

**Note**: `due_date` uses string type for JSON serialization (camelCase to match API contract).

---

### TypeScript Interfaces (Frontend)

**File**: `phase-4/frontend/src/types/index.ts`

```typescript
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;  // ISO 8601 format
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  due_date?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}
```

---

## Part 2: Kubernetes Infrastructure Entities

### Pod

**Purpose**: Smallest deployable Kubernetes unit, contains one or more containers

**Frontend Pod**:
- **Container**: phase4-frontend:v1
- **Image**: Built from `phase-4/frontend/Dockerfile`
- **Port**: 3000
- **Health Checks**: HTTP GET /api/health every 30s
- **Replicas**: 1 (configurable via Helm)

**Backend Pod**:
- **Container**: phase4-backend:v1
- **Image**: Built from `phase-4/backend/Dockerfile`
- **Port**: 8000
- **Health Checks**: HTTP GET /health every 30s
- **Replicas**: 1 (configurable via Helm)

**Pod States**:
- `Pending`: Pod created, containers not yet running
- `Running`: At least one container is running
- `Succeeded`: All containers terminated successfully
- `Failed`: At least one container terminated with error
- `Unknown`: Pod state could not be obtained

---

### Deployment

**Purpose**: Manages pod replicas and updates

**Frontend Deployment**:
- **Name**: `frontend` (Helm release name)
- **Replicas**: 1
- **Strategy**: RollingUpdate (default)
- **Image**: phase4-frontend:v1
- **Image Pull Policy**: IfNotPresent (critical for local builds)

**Backend Deployment**:
- **Name**: `backend` (Helm release name)
- **Replicas**: 1
- **Strategy**: RollingUpdate (default)
- **Image**: phase4-backend:v1
- **Image Pull Policy**: IfNotPresent (critical for local builds)

**Update Strategy**:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 1
    maxSurge: 1
```

---

### Service

**Purpose**: Network abstraction for pod-to-pod communication

**Frontend Service**:
- **Name**: `frontend`
- **Type**: LoadBalancer (external access via minikube tunnel)
- **Port**: 3000
- **Target Port**: 3000
- **Selector**: app.kubernetes.io/name=frontend
- **External IP**: Assigned by minikube tunnel

**Backend Service**:
- **Name**: `backend`
- **Type**: ClusterIP (internal only)
- **Port**: 8000
- **Target Port**: 8000
- **Selector**: app.kubernetes.io/name=backend
- **External IP**: None (internal-only, by design)

**Service Discovery**:
- Frontend reaches backend via: `http://backend:8000`
- Backend service name = Helm release name

---

### Secret

**Purpose**: Encrypted storage for sensitive environment variables

**Secret Definition**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: phase4-secrets
type: Opaque
data:
  DATABASE_URL: cG9zdGdyZXNxbDovLw...  # base64 encoded
  BETTER_AUTH_SECRET: UTJXc1BhV0...    # base64 encoded
  OPENAI_API_KEY: c2stcHJvag...         # base64 encoded
  XIAOMI_API_KEY: c2stc2twdXg...        # base64 encoded
```

**Usage in Backend**:
```yaml
envFrom:
  - secretRef:
      name: phase4-secrets
```

**Security Notes**:
- Secrets are stored in etcd (only base64 encoded, not encrypted by default)
- For production, enable encryption at rest
- Never commit secrets to git
- Use .dockerignore to prevent copying .env files

---

### ConfigMap (Not Used)

**Decision**: Not using ConfigMap for this deployment

**Rationale**:
- Non-sensitive configuration is in values.yaml (Helm templating)
- Sensitive configuration is in Secrets
- No need for separate ConfigMap layer

**Future Use Cases** (if needed):
- Feature flags that change frequently
- Configuration shared across multiple services
- Application configuration files (e.g., nginx.conf)

---

## Part 3: Data Flow Architecture

### Request Flow (External to Backend)

```
1. User Browser → LoadBalancer (EXTERNAL-IP:3000)
2. LoadBalancer → Frontend Service (ClusterIP)
3. Frontend Service → Frontend Pod (Next.js)
4. Frontend Pod → Internal DNS Resolution (backend:8000)
5. Backend Service (ClusterIP) → Backend Pod (FastAPI)
6. Backend Pod → Neon PostgreSQL (external cloud)
7. Response follows reverse path
```

### Chat Flow (AI Agent Request)

```
1. Frontend ChatKit → /api/chatkit/session (backend)
2. Backend validates JWT → Creates ChatKit session
3. Frontend sends message → /api/chatkit/chat
4. Backend creates dynamic MCP server (per-request)
5. Backend runs agent (Xiaomi model) → MCP tools
6. MCP tools → Database operations (user-isolated)
7. Agent response → ChatKit streaming → Frontend
8. MCP server cleanup (per-request lifecycle)
```

### Authentication Flow

```
1. Frontend → Better Auth (/api/auth/*)
2. Better Auth → JWT token generation
3. Frontend stores JWT → httpOnly cookie
4. Frontend → Backend API (/api/{user_id}/tasks)
5. Backend validates JWT (via JWKS endpoint)
6. Backend scopes queries to user_id (Zero-Trust)
```

---

## Part 4: State Management

### Application State (Preserved)

**No Changes**: All application state management is preserved from Phase-4

**Frontend State**:
- React hooks (useAuth, useTasks, useChat)
- Client-side state only (no server sessions)
- Better Auth session tokens (httpOnly cookies)

**Backend State**:
- All state persisted to Neon PostgreSQL
- No in-memory session storage (Constitution III)
- ChatKit sessions/messages persisted
- MCP server created per-request, cleaned up after use

### Infrastructure State (New)

**Kubernetes State**:
- Pod state (Running, Pending, Failed, etc.)
- Deployment state (replica count, update status)
- Service state (Endpoints, LoadBalancer IP)
- Secret state (immutable, versioned)

**Minikube State**:
- Docker daemon images (local registry)
- Cluster configuration (CP, nodes, addons)
- Tunnel state (active routes)

---

## Part 5: Validation Rules

### Application-Level Validation (Preserved)

**Task Validation**:
```python
# Backend (Pydantic)
status = Field(regex="^(pending|completed|cancelled)$")
priority = Field(regex="^(low|medium|high)$")
```

```typescript
// Frontend (TypeScript)
type TaskStatus = 'pending' | 'completed' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high';
```

**User Validation**:
- Email format (Better Auth)
- Password strength (min 8 characters, Better Auth)
- JWT signature (HS256, Better Auth)

### Infrastructure-Level Validation (New)

**Health Check Validation**:
- Frontend: `/api/health` returns 200 OK with JSON body
- Backend: `/health` returns 200 OK with JSON body
- Failure triggers pod restart (after retry threshold)

**Readiness Probe Validation**:
- Pod marked "Ready" only after health check passes
- Traffic not routed to unready pods
- Prevents routing to starting/stopping pods

**Resource Limits (Optional)**:
```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

---

## Part 6: Database Migrations

### Existing Migrations (Preserved)

**Phase-4 Migrations**:
- `001_create_tasks_table.sql` (via SQLModel)
- `chat_sessions_create.sql` (ChatKit)
- `chat_messages_create.sql` (ChatKit)
- `fix-jwks-schema.sql` (Better Auth JWKS)

**Migration Strategy**:
- No changes required for Minikube deployment
- Neon PostgreSQL is external (shared across environments)
- Existing migrations already applied

---

## References

- **Phase-4 Models**: `phase-4/backend/src/backend/models/`
- **Phase-4 Schemas**: `phase-4/backend/src/backend/schemas/`
- **Phase-4 Types**: `phase-4/frontend/src/types/index.ts`
- **Database**: Neon PostgreSQL (external cloud)
- **Constitution**: `.specify/memory/constitution.md`

---

**Data Model Status**: ✅ Complete - No new application entities, Kubernetes infrastructure entities defined
