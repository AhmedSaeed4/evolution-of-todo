---
id: 003
title: Generate tasks.md for FastAPI backend
stage: tasks
date: 2025-12-31
surface: agent
model: claude-opus-4-5-20251101
feature: 006-backend-implement
branch: 006-backend-implement
user: User
command: /sp.tasks
labels: ["backend", "fastapi", "tasks", "spec-driven"]
links:
  spec: specs/006-backend-implement/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-backend-implement/plan.md
  - specs/006-backend-implement/spec.md
  - specs/006-backend-implement/data-model.md
  - specs/006-backend-implement/tasks.md (created)
tests:
  - No tests generated (not requested in spec)
---

## Prompt

# Tasks: FastAPI Backend for Todo Application


## Phase 1: Setup

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Python backend project with `uv init --package backend`
- [ ] T002 Add dependencies: cd phase-2/backend && uv add fastapi, uvicorn, sqlmodel, asyncpg, python-jose, pydantic-settings
- [ ] T003 [P] Create `.env.example` with required environment variables
- [ ] T004 [P] Create project directory structure per plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story

**⚠️ CRITICAL**: No endpoint work can begin until this phase is complete

- [ ] T005 Create `config.py` with environment variable settings using pydantic-settings
- [ ] T006 Create `database.py` with async SQLAlchemy/SQLModel connection to Neon PostgreSQL
- [ ] T007 Create Task SQLModel in `models/task.py` matching frontend types
- [ ] T008 [P] Create Pydantic schemas in `schemas/task.py` for request/response validation
- [ ] T009 Create JWT validation middleware in `auth/jwt.py` using python-jose
- [ ] T010 Configure CORS in `main.py` to allow frontend requests
- [ ] T011 Create base FastAPI app in `main.py` with router includes

**Checkpoint**: Foundation ready - endpoint implementation can begin

---

## Phase 3: User Story 1 & 2 - List and Create Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can see their tasks and create new ones

**Independent Test**: POST a task, GET all tasks, verify the created task appears

### Implementation

- [ ] T012 [US1] Create `services/task_service.py` with `get_tasks()` function
- [ ] T013 [US2] Add `create_task()` function to task_service.py
- [ ] T014 [US1] Implement GET `/api/{user_id}/tasks` endpoint in `routers/tasks.py`
- [ ] T015 [US2] Implement POST `/api/{user_id}/tasks` endpoint in `routers/tasks.py`
- [ ] T016 Add query parameter handling for filtering (status, priority, category, search)
- [ ] T017 Add sorting support (sortBy, sortOrder parameters)

**Checkpoint**: Users can create and view tasks - basic MVP functionality complete

---

## Phase 4: User Story 3 & 4 - Update and Delete Tasks (Priority: P1)

**Goal**: Users can modify and remove tasks

**Independent Test**: Create task → Update title → Delete task → Verify it's gone

### Implementation

- [ ] T018 [US3] Add `get_task_by_id()` function to task_service.py
- [ ] T019 [US3] Add `update_task()` function to task_service.py
- [ ] T020 [US4] Add `delete_task()` function to task_service.py
- [ ] T021 [US3] Implement GET `/api/{user_id}/tasks/{task_id}` endpoint
- [ ] T022 [US3] Implement PUT `/api/{user_id}/tasks/{task_id}` endpoint
- [ ] T023 [US4] Implement DELETE `/api/{user_id}/tasks/{task_id}` endpoint

**Checkpoint**: Full CRUD operations available

---

## Phase 5: User Story 5 - Toggle Task Completion (Priority: P1)

**Goal**: Users can mark tasks complete/incomplete

**Independent Test**: Create task → Toggle → Verify status changed → Toggle again → Verify reverted

### Implementation

- [ ] T024 [US5] Add `toggle_complete()` function to task_service.py
- [ ] T025 [US5] Implement PATCH `/api/{user_id}/tasks/{task_id}/complete` endpoint

**Checkpoint**: All task operations complete

---

## Phase 6: User Story 6 - Task Statistics (Priority: P2)

**Goal**: Profile page shows task summary

**Independent Test**: Create 3 tasks (2 pending, 1 completed) → GET stats → Verify counts

### Implementation

- [ ] T026 [US6] Add `get_task_stats()` function to task_service.py
- [ ] T027 [US6] Implement GET `/api/{user_id}/stats` endpoint
- [ ] T028 [US6] Create Stats response schema in schemas/task.py

**Checkpoint**: All backend endpoints complete

---

## Phase 7: Frontend Integration

**Purpose**: Connect frontend to backend

- [ ] T029 Create API client helper in frontend to get JWT token
- [ ] T030 Update frontend `api.ts` - replace mock `getAll()` with fetch to backend
- [ ] T031 Update frontend `api.ts` - replace mock `create()` with fetch to backend
- [ ] T032 Update frontend `api.ts` - replace mock `update()` with fetch to backend
- [ ] T033 Update frontend `api.ts` - replace mock `delete()` with fetch to backend
- [ ] T034 Update frontend `api.ts` - replace mock `toggleComplete()` with fetch to backend
- [ ] T035 Update frontend `api.ts` - replace mock `getTaskStats()` with fetch to backend
- [ ] T036 Add backend URL environment variable to frontend (.env.local)

**Checkpoint**: Frontend fully connected to backend

---

## Phase 8: Polish & Testing

**Purpose**: Finalize and verify

- [ ] T037 Add structured logging to all endpoints
- [ ] T038 Add error handling middleware
- [ ] T039 Test full user flow: login → create → list → update → complete → delete
- [ ] T040 Verify multi-tenancy: ensure user A cannot see user B's tasks
- [ ] T041 Update documentation in README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all endpoints
- **Phase 3-6 (User Stories)**: All depend on Phase 2
  - Can proceed sequentially P1 → P2
  - Within P1: US1/US2 → US3/US4 → US5 recommended order
- **Phase 7 (Integration)**: Depends on Phase 6 completion
- **Phase 8 (Polish)**: Depends on Phase 7 completion

### Parallel Opportunities

- All tasks marked [P] can run in parallel
- T012 and T013 can run in parallel (different functions)
- T018, T019, T020 can run in parallel (different functions)
- T029-T036 (frontend updates) can run in parallel

---

## Verification Strategy

### How to Run Backend

```bash
cd backend
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
3. Log in to frontend
4. Create a task
5. Refresh page - task should persist
6. Toggle task complete
7. Delete task
8. Verify all operations work

---

## Notes

- All endpoints require JWT authentication
- user_id in URL must match user_id in JWT token
- Use async/await throughout for better performance
- SQLModel combines SQLAlchemy and Pydantic

## Response snapshot

Generated comprehensive tasks.md file with 41 tasks organized into 8 phases:

**Phase 1**: Setup (4 tasks) - Project initialization
**Phase 2**: Foundational (7 tasks) - Core infrastructure blocking all endpoints
**Phase 3**: US1 & US2 MVP (6 tasks) - List and create tasks
**Phase 4**: US3 & US4 CRUD (6 tasks) - Update and delete tasks
**Phase 5**: US5 Toggle (2 tasks) - Task completion
**Phase 6**: US6 Stats (3 tasks) - Task statistics
**Phase 7**: Database Migration (3 tasks) - Schema creation
**Phase 8**: Frontend Integration (8 tasks) - Connect frontend
**Phase 9**: Polish & Testing (5 tasks) - Final verification

**Key Features**:
- Strict checklist format with Task IDs, [P] markers, and [USn] labels
- Clear file paths for every task
- Parallel execution opportunities identified
- Independent test criteria for each user story
- MVP scope focused on User Story 1 & 2
- Dependencies clearly mapped
- Verification strategy included

## Outcome

- ✅ Impact: Created executable task list for FastAPI backend implementation
- 🧪 Tests: No tests generated (not requested in spec)
- 📁 Files: specs/006-backend-implement/tasks.md (created)
- 🔁 Next prompts: /sp.implement to execute tasks
- 🧠 Reflection: Tasks follow strict SDD format, ready for immediate execution

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Execute tasks via /sp.implement