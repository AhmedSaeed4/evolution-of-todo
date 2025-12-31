---
id: 001
title: Create FastAPI backend spec
stage: spec
date: 2025-12-31
surface: agent
model: claude-opus-4-5-20251101
feature: backend-implement
branch: 006-backend-implement
user: User
command: /sp.specify name the new branch "006-backend-implement" heres are the specs : # Feature Specification: FastAPI Backend for Todo Application


## Overview

This specification defines the Python FastAPI backend that will serve the existing Next.js frontend. The backend must implement all CRUD operations for tasks, integrate with the existing Neon PostgreSQL database, and validate JWT tokens issued by Better Auth on the frontend.

---

## User Scenarios & Testing

### User Story 1 - List My Tasks (Priority: P1)

As a logged-in user, I want to see all my tasks so I can manage my work.

**Why this priority**: Core functionality - without this, the app has no value. This is the most frequently used feature.

**Independent Test**: User logs in, navigates to /tasks, and sees their task list (or empty state if new user).

**Acceptance Scenarios**:

1. **Given** a user with 3 tasks, **When** they navigate to /tasks, **Then** they see all 3 tasks belonging to them
2. **Given** a user with no tasks, **When** they navigate to /tasks, **Then** they see an empty state
3. **Given** a user requests tasks, **When** they provide filter parameters (status, priority, category), **Then** only matching tasks are returned
4. **Given** an unauthenticated request, **When** the API is called, **Then** return 401 Unauthorized

---

### User Story 2 - Create a Task (Priority: P1)

As a user, I want to create new tasks so I can track my work.

**Why this priority**: Essential CRUD operation - users must be able to add tasks.

**Independent Test**: User clicks "Add Task", fills form, submits, and sees new task in list.

**Acceptance Scenarios**:

1. **Given** valid task data (title, priority, category), **When** user submits, **Then** task is created with auto-generated id, timestamps, and userId
2. **Given** missing required field (title), **When** user submits, **Then** return 422 validation error
3. **Given** optional fields (description, dueDate), **When** user includes them, **Then** they are saved correctly

---

### User Story 3 - Update a Task (Priority: P1)

As a user, I want to edit my existing tasks to correct mistakes or add details.

**Why this priority**: Essential CRUD operation - users expect to edit tasks.

**Independent Test**: User clicks edit on a task, modifies fields, saves, and sees updated task.

**Acceptance Scenarios**:

1. **Given** a valid task owned by user, **When** user updates any field, **Then** task is updated with new updatedAt timestamp
2. **Given** a task owned by another user, **When** user tries to update, **Then** return 403 Forbidden
3. **Given** a non-existent task ID, **When** user tries to update, **Then** return 404 Not Found

---

### User Story 4 - Delete a Task (Priority: P1)

As a user, I want to delete tasks I no longer need.

**Why this priority**: Essential CRUD operation - users must clean up completed/outdated tasks.

**Independent Test**: User clicks delete on a task, confirms, and task disappears from list.

**Acceptance Scenarios**:

1. **Given** a valid task owned by user, **When** user deletes, **Then** task is removed permanently
2. **Given** a task owned by another user, **When** user tries to delete, **Then** return 403 Forbidden
3. **Given** a non-existent task ID, **When** user tries to delete, **Then** return 404 Not Found

---

### User Story 5 - Toggle Task Completion (Priority: P1)

As a user, I want to mark tasks as complete/incomplete to track progress.

**Why this priority**: Core user interaction - the primary way users interact with tasks daily.

**Independent Test**: User clicks checkbox on a task, status toggles, and UI reflects change.

**Acceptance Scenarios**:

1. **Given** a pending task, **When** user toggles, **Then** task becomes completed with status='completed' and completed=true
2. **Given** a completed task, **When** user toggles, **Then** task becomes pending with status='pending' and completed=false

---

### User Story 6 - View Task Statistics (Priority: P2)

As a user, I want to see a summary of my task statistics on my profile page.

**Why this priority**: Nice-to-have feature that enhances user experience but not critical for core functionality.

**Independent Test**: User navigates to profile, sees task counts (total, pending, completed).

**Acceptance Scenarios**:

1. **Given** a user with 5 tasks (3 pending, 2 completed), **When** they view stats, **Then** they see total=5, pending=3, completed=2

---

### Edge Cases

- What happens when JWT token is expired? Return 401 with appropriate message
- What happens when user_id in URL doesn't match token? Return 403 Forbidden
- What happens when database connection fails? Return 503 Service Unavailable
- What happens when task data exceeds size limits? Return 422 with validation error

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST expose RESTful API endpoints for all task CRUD operations
- **FR-002**: System MUST validate all incoming requests using Pydantic schemas
- **FR-003**: System MUST authenticate all requests using JWT tokens from Better Auth
- **FR-004**: System MUST verify that user_id in URL matches user_id in JWT token
- **FR-005**: System MUST persist all data to the shared Neon PostgreSQL database
- **FR-006**: System MUST return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
- **FR-007**: System MUST support filtering tasks by status, priority, and category
- **FR-008**: System MUST support sorting tasks by dueDate, priority, title, createdAt
- **FR-009**: System MUST support searching tasks by title and description

### Architecture Requirements

- **AR-001**: System MUST use FastAPI framework with async/await patterns
- **AR-002**: System MUST use SQLModel for database ORM
- **AR-003**: System MUST use the same Neon PostgreSQL database as the frontend auth
- **AR-004**: System MUST validate JWT tokens using the BETTER_AUTH_SECRET
- **AR-005**: System MUST implement CORS for frontend integration
- **AR-006**: System MUST use environment variables for all configuration

### Key Entities

- **Task**: Core entity with id, title, description, priority, category, status, completed, dueDate, createdAt, updatedAt, userId
- **User**: Managed by Better Auth - backend only reads user info from JWT token

---

## API Endpoints (Required by Frontend)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/{user_id}/tasks | List all tasks with optional filters | Query params | Task[] |
| POST | /api/{user_id}/tasks | Create new task | CreateTaskDTO | Task |
| GET | /api/{user_id}/tasks/{task_id} | Get single task | - | Task |
| PUT | /api/{user_id}/tasks/{task_id} | Update task | UpdateTaskDTO | Task |
| DELETE | /api/{user_id}/tasks/{task_id} | Delete task | - | 204 |
| PATCH | /api/{user_id}/tasks/{task_id}/complete | Toggle completion | - | Task |
| GET | /api/{user_id}/stats | Get task statistics | - | Stats |

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 7 API endpoints respond within 200ms p95 latency
- **SC-002**: Frontend can successfully call all endpoints with JWT authentication
- **SC-003**: Multi-tenancy enforced - users can only access their own tasks
- **SC-004**: 100% of frontend features work when connected to backend
- **SC-005**: All validation errors return clear, actionable messages"
labels: ["spec", "backend", "fastapi", "crud"]
links:
  spec: specs/006-backend-implement/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-backend-implement/spec.md (created/updated)
  - specs/006-backend-implement/checklists/requirements.md (created)
tests:
  - Specification quality validation completed
  - All checklist items passed

---

## Prompt

name the new branch "006-backend-implement" heres are the specs : # Feature Specification: FastAPI Backend for Todo Application


## Overview

This specification defines the Python FastAPI backend that will serve the existing Next.js frontend. The backend must implement all CRUD operations for tasks, integrate with the existing Neon PostgreSQL database, and validate JWT tokens issued by Better Auth on the frontend.

---

## User Scenarios & Testing

### User Story 1 - List My Tasks (Priority: P1)

As a logged-in user, I want to see all my tasks so I can manage my work.

**Why this priority**: Core functionality - without this, the app has no value. This is the most frequently used feature.

**Independent Test**: User logs in, navigates to /tasks, and sees their task list (or empty state if new user).

**Acceptance Scenarios**:

1. **Given** a user with 3 tasks, **When** they navigate to /tasks, **Then** they see all 3 tasks belonging to them
2. **Given** a user with no tasks, **When** they navigate to /tasks, **Then** they see an empty state
3. **Given** a user requests tasks, **When** they provide filter parameters (status, priority, category), **Then** only matching tasks are returned
4. **Given** an unauthenticated request, **When** the API is called, **Then** return 401 Unauthorized

---

### User Story 2 - Create a Task (Priority: P1)

As a user, I want to create new tasks so I can track my work.

**Why this priority**: Essential CRUD operation - users must be able to add tasks.

**Independent Test**: User clicks "Add Task", fills form, submits, and sees new task in list.

**Acceptance Scenarios**:

1. **Given** valid task data (title, priority, category), **When** user submits, **Then** task is created with auto-generated id, timestamps, and userId
2. **Given** missing required field (title), **When** user submits, **Then** return 422 validation error
3. **Given** optional fields (description, dueDate), **When** user includes them, **Then** they are saved correctly

---

### User Story 3 - Update a Task (Priority: P1)

As a user, I want to edit my existing tasks to correct mistakes or add details.

**Why this priority**: Essential CRUD operation - users expect to edit tasks.

**Independent Test**: User clicks edit on a task, modifies fields, saves, and sees updated task.

**Acceptance Scenarios**:

1. **Given** a valid task owned by user, **When** user updates any field, **Then** task is updated with new updatedAt timestamp
2. **Given** a task owned by another user, **When** user tries to update, **Then** return 403 Forbidden
3. **Given** a non-existent task ID, **When** user tries to update, **Then** return 404 Not Found

---

### User Story 4 - Delete a Task (Priority: P1)

As a user, I want to delete tasks I no longer need.

**Why this priority**: Essential CRUD operation - users must clean up completed/outdated tasks.

**Independent Test**: User clicks delete on a task, confirms, and task disappears from list.

**Acceptance Scenarios**:

1. **Given** a valid task owned by user, **When** user deletes, **Then** task is removed permanently
2. **Given** a task owned by another user, **When** user tries to delete, **Then** return 403 Forbidden
3. **Given** a non-existent task ID, **When** user tries to delete, **Then** return 404 Not Found

---

### User Story 5 - Toggle Task Completion (Priority: P1)

As a user, I want to mark tasks as complete/incomplete to track progress.

**Why this priority**: Core user interaction - the primary way users interact with tasks daily.

**Independent Test**: User clicks checkbox on a task, status toggles, and UI reflects change.

**Acceptance Scenarios**:

1. **Given** a pending task, **When** user toggles, **Then** task becomes completed with status='completed' and completed=true
2. **Given** a completed task, **When** user toggles, **Then** task becomes pending with status='pending' and completed=false

---

### User Story 6 - View Task Statistics (Priority: P2)

As a user, I want to see a summary of my task statistics on my profile page.

**Why this priority**: Nice-to-have feature that enhances user experience but not critical for core functionality.

**Independent Test**: User navigates to profile, sees task counts (total, pending, completed).

**Acceptance Scenarios**:

1. **Given** a user with 5 tasks (3 pending, 2 completed), **When** they view stats, **Then** they see total=5, pending=3, completed=2

---

### Edge Cases

- What happens when JWT token is expired? Return 401 with appropriate message
- What happens when user_id in URL doesn't match token? Return 403 Forbidden
- What happens when database connection fails? Return 503 Service Unavailable
- What happens when task data exceeds size limits? Return 422 with validation error

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST expose RESTful API endpoints for all task CRUD operations
- **FR-002**: System MUST validate all incoming requests using Pydantic schemas
- **FR-003**: System MUST authenticate all requests using JWT tokens from Better Auth
- **FR-004**: System MUST verify that user_id in URL matches user_id in JWT token
- **FR-005**: System MUST persist all data to the shared Neon PostgreSQL database
- **FR-006**: System MUST return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
- **FR-007**: System MUST support filtering tasks by status, priority, and category
- **FR-008**: System MUST support sorting tasks by dueDate, priority, title, createdAt
- **FR-009**: System MUST support searching tasks by title and description

### Architecture Requirements

- **AR-001**: System MUST use FastAPI framework with async/await patterns
- **AR-002**: System MUST use SQLModel for database ORM
- **AR-003**: System MUST use the same Neon PostgreSQL database as the frontend auth
- **AR-004**: System MUST validate JWT tokens using the BETTER_AUTH_SECRET
- **AR-005**: System MUST implement CORS for frontend integration
- **AR-006**: System MUST use environment variables for all configuration

### Key Entities

- **Task**: Core entity with id, title, description, priority, category, status, completed, dueDate, createdAt, updatedAt, userId
- **User**: Managed by Better Auth - backend only reads user info from JWT token

---

## API Endpoints (Required by Frontend)

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | /api/{user_id}/tasks | List all tasks with optional filters | Query params | Task[] |
| POST | /api/{user_id}/tasks | Create new task | CreateTaskDTO | Task |
| GET | /api/{user_id}/tasks/{task_id} | Get single task | - | Task |
| PUT | /api/{user_id}/tasks/{task_id} | Update task | UpdateTaskDTO | Task |
| DELETE | /api/{user_id}/tasks/{task_id} | Delete task | - | 204 |
| PATCH | /api/{user_id}/tasks/{task_id}/complete | Toggle completion | - | Task |
| GET | /api/{user_id}/stats | Get task statistics | - | Stats |

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 7 API endpoints respond within 200ms p95 latency
- **SC-002**: Frontend can successfully call all endpoints with JWT authentication
- **SC-003**: Multi-tenancy enforced - users can only access their own tasks
- **SC-004**: 100% of frontend features work when connected to backend
- **SC-005**: All validation errors return clear, actionable messages

## Response snapshot

Successfully created branch 006-backend-implement and feature specification for FastAPI Backend for Todo Application. The specification includes:

1. **6 prioritized user stories** (5 P1, 1 P2) with independent test cases and acceptance scenarios
2. **9 functional requirements** covering all CRUD operations, authentication, filtering, sorting, and searching
3. **6 architecture requirements** defining the tech stack constraints (FastAPI, SQLModel, Neon PostgreSQL, JWT validation, CORS, env vars)
4. **7 API endpoints** with full specification (method, path, request body, response)
5. **5 measurable success criteria** including performance targets and integration requirements
6. **4 edge cases** covering security, database, and validation scenarios
7. **Quality validation** - all checklist items passed

The spec is ready for `/sp.clarify` or `/sp.plan` phases.

## Outcome

- ✅ Impact: Created comprehensive backend specification with 6 user stories, 9 functional requirements, 7 API endpoints, and measurable success criteria
- 🧪 Tests: Specification quality validation completed - all checklist items passed
- 📁 Files: specs/006-backend-implement/spec.md, specs/006-backend-implement/checklists/requirements.md
- 🔁 Next prompts: /sp.clarify (to resolve any ambiguities) or /sp.plan (to create implementation plan)
- 🧠 Reflection: The specification successfully translates user requirements into a structured, testable format while maintaining technology-agnostic success criteria. All mandatory sections are complete and quality validated.

## Evaluation notes (flywheel)

- Failure modes observed: None - specification creation completed successfully
- Graders run and results (PASS/FAIL): PASS - all quality checklist items passed
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to /sp.clarify or /sp.plan