---
id: 0002
title: Create implementation plan for branch 012 features
stage: plan
date: 2025-02-02
surface: agent
model: glm-4.7
feature: 012-features
branch: 012-features
user: user
command: /sp.plan
labels: [feature,plan,recurring-tasks,reminders,notifications,audit-log,implementation]
links:
  spec: /specs/012-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /specs/012-features/plan.md
  - /specs/012-features/research.md
  - /specs/012-features/data-model.md
  - /specs/012-features/quickstart.md
  - /specs/012-features/contracts/notifications-api.yaml
  - /specs/012-features/contracts/audit-api.yaml
tests:
  - No tests run (plan creation phase)
---

## Prompt

Create a detailed implementation plan for Branch 012-features, which is Phase 1 of Phase V deployment. This branch adds advanced features to the existing monolithic todo app (NO microservices, NO Dapr yet - those come in later branches).

CRITICAL INSTRUCTIONS - DO THIS FIRST

Before creating ANY plan, you MUST:

1. EXAMINE existing codebase:
   - phase-5/backend/src/backend/models/task.py - Current Task model
   - phase-5/backend/src/backend/routes/tasks.py - Current task routes
   - phase-5/backend/setup_chatkit.py - Migration pattern to follow
   - phase-5/frontend/src/app/ - Frontend structure
2. VERIFY all dependencies - Check imports, packages, patterns
3. CROSS-REFERENCE - Ensure your plan matches the spec exactly

DO NOT write code. DO NOT create files. ONLY create a detailed PLAN after thorough research.

---

SCOPE - Branch 012 (In Scope)

What to ADD (monolithic only, no microservices):

1. Database Migration (backend/migrations/002_phase5_features.sql)
   - Add to task table: recurring_rule, recurring_end_date, parent_task_id, reminder_at, reminder_sent, tags
   - Create audit_logs table
   - Create notifications table
2. Backend Models
   - Update Task model with new fields
   - Create AuditLog model
   - Create Notification model
3. Backend Services
   - Create reminder_service.py with asyncio scheduler (60s polling, NO Dapr Jobs yet)
   - Add recurring task logic in existing completion route
4. Backend Routes
   - Update task routes for new fields
   - Add notifications endpoints
5. Frontend
   - Add recurring/reminder/tags fields to task form
   - Create notification panel component

What is OUT OF SCOPE:

- ❌ Microservices split (branch 013)
- ❌ Dapr integration (branch 014)
- ❌ Redpanda/Kafka (branch 014)
- ❌ WebSocket service (branch 013)
- ❌ Kubernetes changes
- ❌ CI/CD (branch 015)

---

YOUR DELIVERABLE

After researching, create a detailed plan with:

1. Verification Summary - What you found in the codebase
2. Architecture Decisions - How each feature will work in monolith
3. Files to Create - Complete list with paths
4. Files to Modify - Complete list with specific changes needed
5. Database Migration Plan - SQL and execution steps
6. Implementation Tasks - Step-by-step, dependency-ordered
7. Testing Strategy - Unit, integration, manual tests

## Response snapshot

Created comprehensive implementation plan for Branch 012-features including:

**Verification Summary**:
- Examined existing backend: Task model, TaskService, FastAPI routes, schemas
- Examined existing frontend: TaskForm, TaskList, hooks, types, API client
- Verified dependencies: FastAPI, SQLModel, asyncio, Next.js 16, React 19, Framer Motion
- Confirmed migration pattern: Plain SQL with BEGIN/COMMIT

**Architecture Decisions**:
- Date arithmetic: `dateutil.relativedelta` for edge case handling (Feb 29, Jan 31)
- Reminder polling: 60s asyncio task (simple, no Dapr yet)
- Tags storage: PostgreSQL TEXT[] array with GIN index
- Audit writes: Synchronous in transaction (upgraded to async in branch 014)
- Notification poll: Frontend 30s interval

**Files Created** (Plan artifacts):
- /specs/012-features/plan.md - Complete implementation plan
- /specs/012-features/research.md - Technical decisions and rationale
- /specs/012-features/data-model.md - Entity definitions with SQLModel code
- /specs/012-features/quickstart.md - Setup and usage guide
- /specs/012-features/contracts/notifications-api.yaml - Notification API spec
- /specs/012-features/contracts/audit-api.yaml - Audit API spec

**Implementation Tasks** (6 Phases):
- Phase 1: Database & Models (Day 1) - Migration, models, unit tests
- Phase 2: Backend Services (Day 2-3) - AuditService, NotificationService, ReminderService
- Phase 3: Backend Routes (Day 4) - New endpoints, MCP tool updates
- Phase 4: Frontend Types & API (Day 5) - TypeScript types, API clients
- Phase 5: Frontend Components (Day 6-7) - NotificationPanel, RecurringOptions, etc.
- Phase 6: Integration & Testing (Day 8) - E2E tests, manual tests, polish

**Key Features**:
- Recurring tasks with auto-creation on completion (daily/weekly/monthly/yearly)
- Per-task reminders with 60s polling → notification creation
- Notification panel with bell icon and unread count (30s frontend polling)
- Complete audit log of all task operations
- Tags support with PostgreSQL array storage

**Constitution Compliance**: 7/8 principles pass; 1 partial (event-driven) is justified per spec branch scope notes

## Outcome

- Impact: Created detailed implementation plan with all Phase 0 and Phase 1 artifacts
- Tests: No tests run (planning phase)
- Files: Created plan.md, research.md, data-model.md, quickstart.md, contracts/ (6 files total)
- Next prompts: Ready for /sp.tasks to generate actionable task list
- Reflection: User provided excellent spec with clear requirements and scope boundaries. Codebase examination confirmed all dependencies are available. Plan intentionally keeps implementation simple per spec requirements (no Dapr, no microservices - those come in later branches).

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASSED (7/8 with justified partial)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
