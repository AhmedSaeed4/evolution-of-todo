---
id: 002
title: Create implementation plan
stage: plan
date: 2025-12-31
surface: agent
model: claude-opus-4-5-20251101
feature: backend-implement
branch: 006-backend-implement
user: User
command: /sp.plan # Implementation Plan: FastAPI Backend for Todo Application

## Summary

Build a Python FastAPI backend that serves the existing Next.js frontend. The backend will implement RESTful CRUD operations for tasks, connect to the shared Neon PostgreSQL database, and validate JWT tokens issued by Better Auth for authentication.

---

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI, SQLModel, uvicorn, python-jose (for JWT), asyncpg
**Storage**: Neon Serverless PostgreSQL (shared with frontend auth - same DATABASE_URL)
**Testing**: pytest with httpx for API testing
**Target Platform**: Linux server / Docker container
**Project Type**: Web API backend
**Performance Goals**: < 200ms p95 latency for all endpoints
**Constraints**: Must use same database as Better Auth, must validate JWT tokens from frontend
**Scale/Scope**: Single-user to 1000 concurrent users

---

## JWT Authentication Strategy

### How It Works

1. **Frontend (Better Auth)**: User logs in → Better Auth creates session + JWT token
2. **Frontend stores token**: JWT token stored in browser
3. **Frontend makes API call**: Includes `Authorization: Bearer <token>` header
4. **Backend validates token**: Extracts and verifies JWT using shared secret
5. **Backend authorizes**: Ensures user_id in URL matches user_id in token

### JWT Verification Requirements

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret**: `BETTER_AUTH_SECRET` environment variable (same as frontend)
- **Token location**: `Authorization: Bearer <token>` header
- **Claims to extract**: `sub` (user ID), `email`, `name`, `exp` (expiration)

### Security Checks

1. Verify JWT signature using BETTER_AUTH_SECRET
2. Check token expiration (`exp` claim)
3. Extract user_id from token (`sub` claim)
4. Compare user_id in token with user_id in URL path
5. Reject request if any check fails (401/403)

---

## Database Integration

### Shared Database

The backend will connect to the **same Neon PostgreSQL database** that Better Auth uses. This database already contains:

- `user` table (managed by Better Auth)
- `session` table (managed by Better Auth)
- `account` table (managed by Better Auth)
- `jwks` table (managed by Better Auth JWT plugin)

### New Table Required

The backend will create one new table:

**tasks table schema:**

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULLABLE |
| priority | VARCHAR(10) | NOT NULL, CHECK (low/medium/high) |
| category | VARCHAR(20) | NOT NULL, CHECK (work/personal/home/other) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' |
| completed | BOOLEAN | NOT NULL, DEFAULT false |
| dueDate | TIMESTAMP | NULLABLE |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT now() |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT now() |
| userId | TEXT | NOT NULL, FOREIGN KEY to user(id) |

**SQL CREATE TABLE:**

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  category VARCHAR(20) NOT NULL CHECK (category IN ('work', 'personal', 'home', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed BOOLEAN NOT NULL DEFAULT false,
  "dueDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_tasks_user_id ON tasks("userId");
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

---

## API Endpoint Specifications

### GET /api/{user_id}/tasks

**Purpose**: List all tasks for a user with optional filtering

**Query Parameters**:
- `status`: Filter by pending/completed
- `priority`: Filter by low/medium/high
- `category`: Filter by work/personal/home/other
- `search`: Search in title and description
- `sort_by`: Sort field (dueDate, priority, title, createdAt)
- `sort_order`: asc or desc

**Response**: Array of Task objects

---

### POST /api/{user_id}/tasks

**Purpose**: Create a new task

**Request Body**:
- `title` (required): string
- `description` (optional): string
- `priority` (required): low/medium/high
- `category` (required): work/personal/home/other
- `dueDate` (optional): ISO 8601 timestamp

**Response**: Created Task object with generated id, createdAt, updatedAt

---

### GET /api/{user_id}/tasks/{task_id}

**Purpose**: Get a single task by ID

**Response**: Task object or 404

---

### PUT /api/{user_id}/tasks/{task_id}

**Purpose**: Update an existing task

**Request Body** (all optional):
- `title`: string
- `description`: string
- `priority`: low/medium/high
- `category`: work/personal/home/other
- `dueDate`: ISO 8601 timestamp

**Response**: Updated Task object

---

### DELETE /api/{user_id}/tasks/{task_id}

**Purpose**: Delete a task

**Response**: 204 No Content

---

### PATCH /api/{user_id}/tasks/{task_id}/complete

**Purpose**: Toggle task completion status

**Behavior**:
- If pending → completed (status='completed', completed=true)
- If completed → pending (status='pending', completed=false)

**Response**: Updated Task object

---

### GET /api/{user_id}/stats

**Purpose**: Get task statistics for profile page

**Response**:
```json
{
  "total": 10,
  "pending": 7,
  "completed": 3
}
```

---

## Project Structure inside phase-2 directory

```text
backend/
├── src/
│   └── backend/
│       ├── __init__.py
│       ├── main.py              # FastAPI app entry point
│       ├── config.py            # Environment configuration
│       ├── database.py          # Database connection
│       ├── models/
│       │   ├── __init__.py
│       │   └── task.py          # Task SQLModel
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── task.py          # Pydantic request/response schemas
│       ├── routers/
│       │   ├── __init__.py
│       │   └── tasks.py         # Task CRUD endpoints
│       ├── services/
│       │   ├── __init__.py
│       │   └── task_service.py  # Business logic
│       └── auth/
│           ├── __init__.py
│           └── jwt.py           # JWT validation
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_tasks.py
├── pyproject.toml
└── .env.example
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Neon PostgreSQL connection string | postgresql://... |
| BETTER_AUTH_SECRET | Shared secret for JWT validation | your-secret-key |
| CORS_ORIGINS | Allowed origins for CORS | http://localhost:3000 |
| API_HOST | Host to bind | 0.0.0.0 |
| API_PORT | Port to bind | 8000 |

---

## CORS Configuration

The backend must accept requests from the frontend:

- **Allowed Origins**: http://localhost:3000 (dev), production URL
- **Allowed Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Allowed Headers**: Authorization, Content-Type
- **Credentials**: true (for cookies if needed)

---

## Error Handling Strategy

| HTTP Status | When to Use |
|-------------|-------------|
| 200 OK | Successful GET, PUT, PATCH |
| 201 Created | Successful POST |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Malformed request |
| 401 Unauthorized | Missing or invalid JWT |
| 403 Forbidden | user_id mismatch (trying to access another user's data) |
| 404 Not Found | Resource doesn't exist |
| 422 Unprocessable Entity | Validation error |
| 500 Internal Server Error | Unexpected server error |

---

## Frontend Integration Changes

After backend is built, the frontend's `api.ts` needs to be updated to:

1. Replace mock implementations with `fetch()` calls
2. Add JWT token to Authorization header
3. Point to backend URL (configurable via env var)
4. Handle API errors appropriately

---

## Verification Plan

### Automated Tests

1. **Unit Tests**: Test individual functions (JWT validation, query building)
2. **Integration Tests**: Test API endpoints with test database

**Command to run tests**:
```bash
cd phase-2/backend
uv run pytest tests/ -v
```

### Manual Verification

1. Start backend: `cd phase-2/backend && uv run uvicorn src.backend.main:app --reload`
2. Start frontend: `cd phase-2/frontend && npm run dev`
3. Update frontend `api.ts` to point to backend
4. Test login → create task → list tasks → complete task → delete task flow
5. Verify tasks persist after page refresh

---

## Constitution Check

- [x] **I. Universal Logic Decoupling**: Business logic in services, separate from routes
- [x] **II. AI-Native Interoperability**: N/A for backend (no MCP tools required)
- [x] **III. Strict Statelessness**: No in-memory session storage, all state in database
- [x] **IV. Event-Driven Decoupling**: N/A for basic CRUD (can add later)
- [x] **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id, JWT validation
- [x] **VI. Technology Stack**: Python 3.13+, FastAPI, SQLModel as authorized
- [x] **VII. Security**: JWT validation, Pydantic input validation, no hardcoded secrets
- [x] **VIII. Observability**: Structured logging with correlation IDs

## Response snapshot

Successfully created comprehensive implementation plan for FastAPI Backend for Todo Application. The plan includes:

1. **Complete Technical Context** with JWT authentication strategy, database integration, API specifications, and project structure
2. **Constitution Check** - All 8 principles passed with 100% compliance
3. **Phase 0 Research** (research.md) - Resolved all technical unknowns
4. **Phase 1 Design** with:
   - Complete data model (data-model.md) including SQLModel definitions, database schema, validation rules, and state transitions
   - API contracts (contracts/openapi.yaml) - OpenAPI 3.0 specification for all 7 endpoints
   - Quickstart guide (quickstart.md) - Step-by-step setup and development instructions
5. **Agent Context Update** - Added Python 3.13+, FastAPI, SQLModel, uvicorn, python-jose, asyncpg to CLAUDE.md

**Key Decisions Made**:
- JWT validation using HS256 with Better Auth shared secret
- Shared Neon PostgreSQL database (same as frontend)
- Services layer for business logic decoupling
- REST API (not MCP) for native web frontend integration
- Pydantic + SQLModel for strict typing and validation
- Multi-tenancy enforced at query level with user_id scoping

**Files Created**:
- `specs/006-backend-implement/plan.md` - Main implementation plan
- `specs/006-backend-implement/research.md` - Technical research and decisions
- `specs/006-backend-implement/data-model.md` - Entity definitions and schemas
- `specs/006-backend-implement/quickstart.md` - Setup and development guide
- `specs/006-backend-implement/contracts/openapi.yaml` - API specification
- `specs/006-backend-implement/checklists/requirements.md` - Quality validation (marked complete)

**Status**: ✅ Ready for implementation. All planning phases complete, constitution gates passed, ready for `/sp.tasks` to break down into actionable tasks.

## Outcome

- ✅ Impact: Complete implementation plan with all Phase 0 research and Phase 1 design artifacts
- 🧪 Tests: Constitution Check 100% passed, all quality gates met
- 📁 Files: 6 new files created in specs/006-backend-implement/
- 🔁 Next prompts: `/sp.tasks` to generate actionable task breakdown
- 🧠 Reflection: The plan successfully integrates JWT authentication with Better Auth, enforces multi-tenancy, and provides comprehensive implementation guidance while maintaining 100% constitution compliance. All technical unknowns resolved through research phase.

## Evaluation notes (flywheel)

- Failure modes observed: None - plan creation completed successfully
- Graders run and results (PASS/FAIL): PASS - Constitution Check 100% compliance
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to `/sp.tasks` for task breakdown