# Research: FastAPI Backend Implementation

**Feature**: 006-backend-implement
**Date**: 2025-12-31
**Purpose**: Resolve technical unknowns and establish best practices for FastAPI backend

---

## JWT Authentication Strategy

### Decision: HS256 with Better Auth Secret
**Rationale**: Better Auth uses HS256 (HMAC with SHA-256) for JWT tokens. The backend must use the same algorithm and secret (`BETTER_AUTH_SECRET`) to validate tokens issued by the frontend.

**Implementation**:
- Use `python-jose` library for JWT validation
- Extract `sub` (user_id) from token claims
- Validate signature, expiration, and user_id match
- Return 401 for invalid/expired tokens, 403 for user_id mismatch

**Alternatives Considered**:
- RS256 (public/private key): Rejected - Better Auth uses symmetric HS256
- Custom auth: Rejected - JWT is standard and secure

---

## Database Integration

### Decision: Shared Neon PostgreSQL with SQLModel
**Rationale**: The backend must use the same database as Better Auth to maintain data consistency and avoid complex multi-database setups.

**Implementation**:
- Connection via `DATABASE_URL` environment variable
- Use SQLModel for ORM (matches constitution requirement)
- Create single `tasks` table with foreign key to Better Auth's `user` table
- Use connection pooling for performance

**Alternatives Considered**:
- Separate database: Rejected - would require complex synchronization
- Raw SQL: Rejected - SQLModel provides type safety and validation

---

## CORS Configuration

### Decision: Explicit CORS origins with credentials
**Rationale**: Frontend (Next.js) runs on different origin than backend API. Must allow cross-origin requests with credentials.

**Implementation**:
- Configure `CORS_ORIGINS` environment variable
- Allow methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Allow headers: Authorization, Content-Type
- Enable credentials for cookie-based auth if needed

---

## Error Handling Strategy

### Decision: Standard HTTP status codes with clear messages
**Rationale**: Frontend needs predictable error responses to handle appropriately.

**Implementation**:
- 200/201/204: Success
- 400: Malformed request
- 401: Invalid/expired JWT
- 403: User_id mismatch (trying to access another user's data)
- 404: Resource not found
- 422: Validation error (Pydantic)
- 500: Unexpected server error

---

## Performance Requirements

### Decision: < 200ms p95 latency for all endpoints
**Rationale**: User experience requires fast response times. Database queries must be optimized.

**Implementation**:
- Indexes on `userId`, `status`, `priority`
- Connection pooling
- Async/await patterns throughout
- Query optimization for filtering/sorting

---

## Project Structure

### Decision: Backend subdirectory within phase-2
**Rationale**: Keeps backend code organized and separate from frontend, but within the same feature branch.

**Implementation**:
```
phase-2/backend/
├── src/backend/
│   ├── main.py          # FastAPI app
│   ├── config.py        # Environment config
│   ├── database.py      # DB connection
│   ├── models/          # SQLModel definitions
│   ├── schemas/         # Pydantic request/response
│   ├── routers/         # API endpoints
│   ├── services/        # Business logic
│   └── auth/            # JWT validation
├── tests/               # pytest tests
└── pyproject.toml       # Dependencies
```

---

## Technology Stack Validation

### Decision: Python 3.13+, FastAPI, SQLModel, uvicorn
**Rationale**: Matches constitution requirements and provides modern async capabilities.

**Dependencies**:
- `fastapi`: Web framework
- `sqlmodel`: ORM + Pydantic
- `uvicorn`: ASGI server
- `python-jose`: JWT handling
- `asyncpg`: PostgreSQL driver (for async)
- `pytest`: Testing framework

**Constitution Compliance**: ✅ All authorized libraries

---

## Security Considerations

### Decision: Zero-trust multi-tenancy with JWT validation
**Rationale**: Every request must be authenticated and authorized.

**Implementation**:
- JWT validation middleware
- User ID extraction from token
- Query scoping to user_id
- No hardcoded secrets
- Input validation via Pydantic

---

## Frontend Integration

### Decision: Update frontend `api.ts` to use backend
**Rationale**: Replace mock implementations with real API calls.

**Changes needed**:
- Add `NEXT_PUBLIC_BACKEND_URL` environment variable
- Add JWT token to Authorization header
- Update fetch calls to use backend endpoints
- Handle API errors appropriately

---

## Testing Strategy

### Decision: pytest with httpx for API testing
**Rationale**: FastAPI recommends pytest + httpx for testing async endpoints.

**Test categories**:
- Unit: JWT validation, query building
- Integration: Full API endpoints with test DB
- Contract: API response format validation

---

## Constitution Compliance

### All principles satisfied:

✅ **I. Universal Logic Decoupling**: Services layer separates business logic from routes
✅ **II. AI-Native Interoperability**: REST API (can add MCP tools later)
✅ **III. Strict Statelessness**: No in-memory sessions, all state in DB
✅ **IV. Event-Driven Decoupling**: Basic CRUD doesn't require events (can add later)
✅ **V. Zero-Trust Multi-Tenancy**: JWT validation + user_id scoping
✅ **VI. Technology Stack**: Python 3.13+, FastAPI, SQLModel (authorized)
✅ **VII. Security**: JWT validation, Pydantic validation, no hardcoded secrets
✅ **VIII. Observability**: Structured logging planned

---

## No Unresolved Unknowns

All technical decisions have been made based on:
1. User's provided implementation plan
2. Constitution requirements
3. Better Auth JWT specifications
4. Neon PostgreSQL capabilities
5. FastAPI best practices

**Status**: ✅ Research complete - ready for Phase 1 design