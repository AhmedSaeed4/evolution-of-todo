# Tasks: FastAPI Backend for Todo Application

**Feature Branch**: `006-backend-implement`
**Generated**: 2025-12-31
**Source**: plan.md, spec.md, data-model.md
**Total Tasks**: 41

---

## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Python backend project with `uv init --package backend` in `phase-2/`
- [ ] T002 Add dependencies: `cd phase-2/backend && uv add fastapi uvicorn sqlmodel asyncpg python-jose pydantic-settings`
- [ ] T003 [P] Create `.env.example` with DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS, API_HOST, API_PORT
- [ ] T004 [P] Create project directory structure per plan.md (src/backend/, tests/, migrations/)

**Checkpoint**: Foundation ready - endpoint implementation can begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story

**⚠️ CRITICAL**: No endpoint work can begin until this phase is complete

- [ ] T005 Create `src/backend/config.py` with pydantic-settings for environment variables
- [ ] T006 Create `src/backend/database.py` with async SQLModel connection to Neon PostgreSQL
- [ ] T007 Create Task SQLModel in `src/backend/models/task.py` matching frontend types (from data-model.md)
- [ ] T008 [P] Create Pydantic schemas in `src/backend/schemas/task.py` for request/response validation
- [ ] T009 Create JWT validation middleware in `src/backend/auth/jwt.py` using python-jose
- [ ] T010 Configure CORS in `src/backend/main.py` to allow frontend requests
- [ ] T011 Create base FastAPI app in `src/backend/main.py` with router includes and health endpoint

**Checkpoint**: Foundation ready - endpoint implementation can begin

---

## Phase 3: User Story 1 & 2 - List and Create Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can see their tasks and create new ones

**Independent Test**: POST a task, GET all tasks, verify the created task appears

### Implementation

- [ ] T012 [P] [US1] Create `src/backend/services/task_service.py` with `get_tasks()` function
- [ ] T013 [P] [US2] Add `create_task()` function to `src/backend/services/task_service.py`
- [ ] T014 [US1] Implement GET `/api/{user_id}/tasks` endpoint in `src/backend/routers/tasks.py`
- [ ] T015 [US2] Implement POST `/api/{user_id}/tasks` endpoint in `src/backend/routers/tasks.py`
- [ ] T016 [P] Add query parameter handling for filtering (status, priority, category, search) to GET endpoint
- [ ] T017 [P] Add sorting support (sortBy, sortOrder parameters) to GET endpoint

**Checkpoint**: Users can create and view tasks - basic MVP functionality complete

---

## Phase 4: User Story 3 & 4 - Update and Delete Tasks (Priority: P1)

**Goal**: Users can modify and remove tasks

**Independent Test**: Create task → Update title → Delete task → Verify it's gone

### Implementation

- [ ] T018 [P] [US3] Add `get_task_by_id()` function to `src/backend/services/task_service.py`
- [ ] T019 [P] [US3] Add `update_task()` function to `src/backend/services/task_service.py`
- [ ] T020 [P] [US4] Add `delete_task()` function to `src/backend/services/task_service.py`
- [ ] T021 [US3] Implement GET `/api/{user_id}/tasks/{task_id}` endpoint in `src/backend/routers/tasks.py`
- [ ] T022 [US3] Implement PUT `/api/{user_id}/tasks/{task_id}` endpoint in `src/backend/routers/tasks.py`
- [ ] T023 [US4] Implement DELETE `/api/{user_id}/tasks/{task_id}` endpoint in `src/backend/routers/tasks.py`

**Checkpoint**: Full CRUD operations available

---

## Phase 5: User Story 5 - Toggle Task Completion (Priority: P1)

**Goal**: Users can mark tasks complete/incomplete

**Independent Test**: Create task → Toggle → Verify status changed → Toggle again → Verify reverted

### Implementation

- [ ] T024 [US5] Add `toggle_complete()` function to `src/backend/services/task_service.py`
- [ ] T025 [US5] Implement PATCH `/api/{user_id}/tasks/{task_id}/complete` endpoint in `src/backend/routers/tasks.py`

**Checkpoint**: All task operations complete

---

## Phase 6: User Story 6 - Task Statistics (Priority: P2)

**Goal**: Profile page shows task summary

**Independent Test**: Create 3 tasks (2 pending, 1 completed) → GET stats → Verify counts

### Implementation

- [ ] T026 [P] [US6] Add `get_task_stats()` function to `src/backend/services/task_service.py`
- [ ] T027 [US6] Implement GET `/api/{user_id}/stats` endpoint in `src/backend/routers/tasks.py`
- [ ] T028 [P] [US6] Create Stats response schema in `src/backend/schemas/task.py`

**Checkpoint**: All backend endpoints complete

---

## Phase 7: Database Migration

**Purpose**: Create tasks table in Neon PostgreSQL

- [ ] T029 [P] Create `migrations/001_create_tasks_table.py` with SQLModel metadata
- [ ] T030 [P] Create migration runner script to apply schema changes
- [ ] T031 [P] Add indexes for userId, status, priority, category, dueDate

**Checkpoint**: Database ready for data

---

## Phase 8: Frontend Integration

**Purpose**: Connect frontend to backend

- [ ] T032 [P] Create API client helper in `phase-2/frontend/src/lib/api-client.ts` to get JWT token
- [ ] T033 Update `phase-2/frontend/src/lib/api.ts` - replace mock `getAll()` with fetch to backend
- [ ] T034 Update `phase-2/frontend/src/lib/api.ts` - replace mock `create()` with fetch to backend
- [ ] T035 Update `phase-2/frontend/src/lib/api.ts` - replace mock `update()` with fetch to backend
- [ ] T036 Update `phase-2/frontend/src/lib/api.ts` - replace mock `delete()` with fetch to backend
- [ ] T037 Update `phase-2/frontend/src/lib/api.ts` - replace mock `toggleComplete()` with fetch to backend
- [ ] T038 Update `phase-2/frontend/src/lib/api.ts` - replace mock `getTaskStats()` with fetch to backend
- [ ] T039 [P] Add `NEXT_PUBLIC_BACKEND_URL` environment variable to `phase-2/frontend/.env.local`

**Checkpoint**: Frontend fully connected to backend

---

## Phase 9: Polish & Testing

**Purpose**: Finalize and verify

- [ ] T040 Add structured logging to all endpoints in `src/backend/main.py`
- [ ] T041 Add error handling middleware in `src/backend/main.py`
- [ ] T042 Test full user flow: login → create → list → update → complete → delete
- [ ] T043 Verify multi-tenancy: ensure user A cannot see user B's tasks
- [ ] T044 Update `phase-2/backend/README.md` with setup and usage instructions

**Checkpoint**: Backend ready for production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all endpoints
- **Phase 3-6 (User Stories)**: All depend on Phase 2
  - Can proceed sequentially P1 → P2
  - Within P1: US1/US2 → US3/US4 → US5 recommended order
- **Phase 7 (Database)**: Can run in parallel with Phase 2
- **Phase 8 (Integration)**: Depends on Phase 6 completion
- **Phase 9 (Polish)**: Depends on Phase 8 completion

### Parallel Opportunities

**Phase 1**: T003 and T004 can run in parallel
**Phase 2**: T005-T011 can run in parallel (different files)
**Phase 3**: T012-T013 can run in parallel (different service functions)
**Phase 4**: T018-T020 can run in parallel (different service functions)
**Phase 7**: T029-T031 can run in parallel (migration files)
**Phase 8**: T032-T039 can run in parallel (frontend updates)

---

## Verification Strategy

### How to Run Backend

```bash
cd phase-2/backend
uv sync
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

### How to Test Endpoints Manually

```bash
# Health check
curl http://localhost:8000/health

# Create task (requires valid JWT)
curl -X POST http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "priority": "medium", "category": "work"}'

# List tasks
curl http://localhost:8000/api/{user_id}/tasks \
  -H "Authorization: Bearer {jwt_token}"
```

### End-to-End Verification

1. Start backend on port 8000
2. Start frontend on port 3000
3. Log in to frontend (Better Auth)
4. Create a task
5. Refresh page - task should persist
6. Toggle task complete
7. Delete task
8. Verify all operations work

---

## Notes

- All endpoints require JWT authentication
- user_id in URL must match user_id in JWT token (security check)
- Use async/await throughout for better performance
- SQLModel combines SQLAlchemy and Pydantic
- All database queries must include `WHERE userId = ?` for multi-tenancy
- JWT validation uses `BETTER_AUTH_SECRET` from environment
- CORS must allow frontend origins
- Error responses follow REST standards (401, 403, 404, 422, 500)