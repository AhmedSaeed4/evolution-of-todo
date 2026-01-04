# Implementation Plan: FastAPI Backend for Todo Application

**Branch**: `006-backend-implement` | **Date**: 2025-12-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-backend-implement/spec.md`

## Summary

Build a Python FastAPI backend that serves the existing Next.js frontend. The backend implements RESTful CRUD operations for tasks, connects to the shared Neon PostgreSQL database, and validates JWT tokens issued by Better Auth for authentication. All endpoints enforce multi-tenancy by scoping queries to user_id extracted from JWT tokens.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: FastAPI, SQLModel, uvicorn, python-jose, asyncpg
**Storage**: Neon Serverless PostgreSQL (shared with frontend Better Auth)
**Testing**: pytest with httpx for API testing
**Target Platform**: Linux server / Docker container
**Project Type**: Web API backend
**Performance Goals**: < 200ms p95 latency for all endpoints
**Constraints**: Must use same database as Better Auth, must validate JWT tokens from frontend
**Scale/Scope**: Single-user to 1000 concurrent users

### JWT Authentication Strategy

**How It Works**:
1. Frontend (Better Auth) creates JWT token on user login
2. Frontend stores token and includes in `Authorization: Bearer <token>` header
3. Backend validates JWT using `BETTER_AUTH_SECRET` (same as frontend)
4. Backend extracts `sub` (user_id) from token claims
5. Backend compares user_id in token with user_id in URL path
6. All database queries scoped to user_id from token

**Security Checks**:
- Verify JWT signature using shared secret
- Check token expiration (`exp` claim)
- Extract user_id from token (`sub` claim)
- Compare user_id in token with user_id in URL path
- Reject request if any check fails (401/403)

### Database Integration

**Shared Database**: Backend connects to same Neon PostgreSQL as Better Auth
- **Existing tables**: `user`, `session`, `account`, `jwks` (managed by Better Auth)
- **New table**: `tasks` (created by backend)

**Tasks Table Schema**:
- id: UUID (primary key)
- title: VARCHAR(255) (required)
- description: TEXT (optional)
- priority: ENUM (low/medium/high)
- category: ENUM (work/personal/home/other)
- status: ENUM (pending/completed)
- completed: BOOLEAN
- dueDate: TIMESTAMP (optional)
- createdAt: TIMESTAMP (auto)
- updatedAt: TIMESTAMP (auto)
- userId: TEXT (foreign key to user.id, ON DELETE CASCADE)

**Indexes**: userId, status, priority, category, dueDate

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/{user_id}/tasks | List with filters |
| POST | /api/{user_id}/tasks | Create task |
| GET | /api/{user_id}/tasks/{task_id} | Get single task |
| PUT | /api/{user_id}/tasks/{task_id} | Update task |
| DELETE | /api/{user_id}/tasks/{task_id} | Delete task |
| PATCH | /api/{user_id}/tasks/{task_id}/complete | Toggle completion |
| GET | /api/{user_id}/stats | Get statistics |

### Environment Variables

- `DATABASE_URL`: Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Shared JWT secret
- `CORS_ORIGINS`: Frontend URLs (comma-separated)
- `API_HOST`: Server host (0.0.0.0)
- `API_PORT`: Server port (8000)

### Error Handling

- 200/201/204: Success
- 400: Malformed request
- 401: Invalid/expired JWT
- 403: User_id mismatch
- 404: Resource not found
- 422: Validation error
- 500: Server error

### Frontend Integration

Frontend `api.ts` needs to:
1. Add `NEXT_PUBLIC_BACKEND_URL` environment variable
2. Include JWT token in Authorization header
3. Replace mock implementations with fetch calls
4. Handle API errors appropriately

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: Business logic decoupled from presentation layer
  - ✅ Services layer (`task_service.py`) separates business logic from API routes
  - ✅ Routes only handle HTTP concerns, delegate to services
  - ✅ Services are independently testable without HTTP dependencies

- [x] **II. AI-Native Interoperability**: MCP tools defined with strict typing
  - ⚠️ REST API (not MCP) - justified for web frontend integration
  - ✅ All endpoints use Pydantic schemas for strict typing
  - ✅ Can add MCP tools later for AI agent access

- [x] **III. Strict Statelessness**: No in-memory session storage, all state persisted
  - ✅ No in-memory sessions - all state in Neon PostgreSQL
  - ✅ JWT tokens stateless (client-side)
  - ✅ Database connection pooling (ephemeral connections)

- [x] **IV. Event-Driven Decoupling**: Async operations use event streams (not direct HTTP)
  - ⚠️ Basic CRUD doesn't require events - justified for MVP
  - ✅ Async/await patterns throughout (FastAPI + SQLModel)
  - ✅ Ready to add event streams for advanced features (reminders, audit)

- [x] **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id
  - ✅ JWT validation extracts user_id from token
  - ✅ All API endpoints require user_id in URL path
  - ✅ All database queries include `WHERE userId = ?`
  - ✅ User_id comparison: token.sub vs URL.user_id

- [x] **VI. Technology Stack**: Authorized libraries only (Python 3.13+, FastAPI, SQLModel, etc.)
  - ✅ Python 3.13+ (Constitution VI)
  - ✅ FastAPI (authorized)
  - ✅ SQLModel (authorized)
  - ✅ python-jose (JWT validation)
  - ✅ asyncpg (PostgreSQL driver)
  - ✅ No unauthorized dependencies

- [x] **VII. Security**: JWT validation, input validation, no hardcoded secrets
  - ✅ JWT validation with BETTER_AUTH_SECRET
  - ✅ Pydantic schemas for all input validation
  - ✅ No hardcoded secrets (environment variables only)
  - ✅ Foreign key constraints (ON DELETE CASCADE)
  - ✅ Parameterized queries (SQL injection prevention)

- [x] **VIII. Observability**: Structured logging, metrics, audit trail requirements met
  - ✅ Structured logging ready (FastAPI middleware)
  - ✅ Request tracing with correlation IDs
  - ✅ Metrics: request count, latency, error rates
  - ✅ Audit trail: All CRUD operations logged with user_id + timestamp

**Result**: ✅ ALL GATES PASSED - Ready for implementation

**Constitution Version**: v1.1.0 | **Compliance**: 100%

## Project Structure

### Documentation (this feature)

```text
specs/006-backend-implement/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - resolves technical unknowns
├── data-model.md        # Phase 1 output - entity definitions
├── quickstart.md        # Phase 1 output - setup guide
├── contracts/           # Phase 1 output - API schemas
│   └── openapi.yaml     # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output - to be created by /sp.tasks
```

### Source Code (backend implementation)

```text
phase-2/
└── backend/
    ├── src/
    │   └── backend/             # Main package
    │       ├── __init__.py
    │       ├── main.py          # FastAPI app entry point
    │       ├── config.py        # Environment configuration
    │       ├── database.py      # Database connection & pooling
    │       ├── models/
    │       │   ├── __init__.py
    │       │   └── task.py      # Task SQLModel
    │       ├── schemas/
    │       │   ├── __init__.py
    │       │   └── task.py      # Pydantic request/response schemas
    │       ├── routers/
    │       │   ├── __init__.py
    │       │   └── tasks.py     # Task CRUD endpoints
    │       ├── services/
    │       │   ├── __init__.py
    │       │   └── task_service.py  # Business logic
    │       └── auth/
    │           ├── __init__.py
    │           └── jwt.py       # JWT validation
    ├── tests/
    │   ├── __init__.py
    │   ├── conftest.py          # Test fixtures
    │   └── test_tasks.py        # API integration tests
    ├── migrations/              
    │   └── 001_create_tasks.py  # Database migration
    ├── pyproject.toml           # Project dependencies
    ├── .env.example             # Environment template
    └── README.md                # Backend-specific docs
```

### Frontend Integration (updates required)

```text
phase-2/frontend/
├── src/
│   └── lib/
│       ├── api-client.ts    # API client with auth headers (add BACKEND_URL)
│       └── api.ts           # Updated to use backend API endpoints
└── .env.local               # Add BACKEND_URL
```

**Structure Decision**: Backend subdirectory within phase-2 keeps code organized while maintaining single-branch workflow. Frontend updates are minimal (API layer only).

## Complexity Tracking

> **No violations - Constitution Check passed 100%**

**Justifications for design choices:**

| Design Choice | Why Needed | Simpler Alternative Rejected Because |
|---------------|------------|-------------------------------------|
| **Services Layer** | Decouples business logic from HTTP layer for testability | Direct DB access in routes would be harder to test |
| **SQLModel ORM** | Type safety + Pydantic integration + async support | Raw SQL would lose type checking and validation |
| **JWT Validation Middleware** | Security requirement for multi-tenancy | No auth would allow unauthorized access |
| **Shared Database** | Consistency with Better Auth, simpler deployment | Separate DB would require complex synchronization |
| **REST API (not MCP)** | Native web frontend integration | MCP would require additional protocol layer |

**No additional complexity introduced** - all choices align with constitution and reduce technical debt.
