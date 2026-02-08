# Implementation Plan: Recurring Tasks, Reminders, Notifications & Audit Logging

**Branch**: `012-features` | **Date**: 2025-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-features/spec.md`

## Summary

This plan implements Phase 1 of Phase V deployment for the Todo app. Branch 012 adds advanced features (recurring tasks, reminders, notifications, audit logging) to the existing monolithic FastAPI + Next.js application. This branch intentionally avoids microservices, Dapr, and other advanced patterns - those come in later branches (013, 014). The implementation uses simple polling for reminders and synchronous database writes for audit logging.

**Primary Requirements:**
1. Recurring tasks with auto-creation on completion (daily/weekly/monthly/yearly)
2. Per-task reminders with notification creation
3. Notification panel with bell icon and unread count
4. Complete audit log of all task operations
5. Tags support for tasks

**Technical Approach:**
- Monolithic FastAPI backend with asyncio-based reminder polling (60s intervals)
- Database migrations for new fields and tables
- Frontend components integrated with existing UI patterns
- All operations scoped to user_id for multi-tenancy

## Technical Context

**Language/Version**: Python 3.13+, TypeScript 5.x, Next.js 16+
**Primary Dependencies**: FastAPI, SQLModel, asyncio, React 19, Framer Motion, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL (SQLModel/SQLAlchemy ORM)
**Testing**: pytest (backend), React Testing Library (frontend) - existing patterns
**Target Platform**: Linux server (Docker/Minikube), Web browser (Chrome/Firefox/Safari)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: <100ms p95 for API responses, <2s for task completion flow
**Constraints**: No Dapr, no microservices, keep simple for later upgrade
**Scale/Scope**: Single-user focus with multi-tenancy, ~100 tasks per user, ~10 active reminders

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: Business logic in TaskService layer, decoupled from FastAPI routes and React components
- [x] **II. AI-Native Interoperability**: MCP tools will be updated with new fields (recurring_rule, reminder_at, tags)
- [x] **III. Strict Statelessness**: No in-memory session storage, all state persisted to PostgreSQL
- [ ] **IV. Event-Driven Decoupling**: PARTIAL - Audit logging uses synchronous DB writes (upgraded to Dapr Pub/Sub in branch 014)
- [x] **V. Zero-Trust Multi-Tenancy**: All database queries scoped to user_id, JWT validation on every request
- [x] **VI. Technology Stack**: Using authorized stack (Python 3.13+, FastAPI, SQLModel, Next.js 16+, TypeScript)
- [x] **VII. Security**: JWT validation, Pydantic input validation, no hardcoded secrets
- [x] **VIII. Observability**: Audit trail implementation, structured logging via existing patterns

**Complexity Tracking:**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Synchronous audit logging | Branch 012 intentionally avoids Dapr/Event patterns for simplicity | Full event-driven architecture deferred to branch 014 per spec |
| Polling for reminders (60s intervals) | Dapr Jobs API integration deferred to branch 014 | Advanced scheduling would require Dapr sidecar setup |

**Justification**: The spec explicitly states "Branch 012 implements features with simple patterns. These will be upgraded in a future branch." This is documented in spec.md under "Branch Scope Notes".

## Project Structure

### Documentation (this feature)

```text
specs/012-features/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (being created)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── openapi.yaml     # OpenAPI spec for new endpoints
│   └── notification-api.yaml  # Notification API contract
└── tasks.md             # Phase 2 output (created by /sp.tasks later)
```

### Source Code (repository root)

```text
phase-5/backend/
├── migrations/
│   ├── 001_initial_schema.sql  # Existing tasks table
│   └── 002_phase5_features.sql # NEW: Branch 012 additions
├── src/
│   └── backend/
│       ├── models/
│       │   ├── task.py         # MODIFY: Add new fields
│       │   ├── audit_log.py    # NEW: AuditLog model
│       │   └── notification.py # NEW: Notification model
│       ├── schemas/
│       │   └── task.py         # MODIFY: Add new fields to schemas
│       ├── services/
│       │   ├── task_service.py        # MODIFY: Add recurring logic
│       │   ├── audit_service.py       # NEW: Audit logging
│       │   ├── notification_service.py # NEW: Notification management
│       │   └── reminder_service.py    # NEW: Async polling for reminders
│       ├── routers/
│       │   ├── tasks.py        # MODIFY: Update for new fields
│       │   ├── notifications.py # NEW: Notification endpoints
│       │   └── audit.py        # NEW: Audit log endpoints
│       ├── mcp_tools/          # NEW/UPDATE: MCP tool definitions
│       └── main.py             # MODIFY: Register reminder scheduler
└── tests/
    ├── unit/
    │   ├── test_task_service.py
    │   ├── test_reminder_service.py
    │   └── test_audit_service.py
    └── integration/
        └── test_recurring_tasks.py

phase-5/frontend/
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       ├── layout.tsx      # MODIFY: Add notification bell
│   │       ├── tasks/page.tsx  # MODIFY: Filter by tags
│   │       └── audit/page.tsx  # NEW: Audit log viewer
│   ├── components/
│   │   ├── tasks/
│   │   │   ├── TaskForm.tsx    # MODIFY: Add recurring/reminder/tags
│   │   │   ├── TaskCard.tsx    # MODIFY: Show recurring indicator, tags
│   │   │   └── RecurringOptions.tsx # NEW: Recurring rule selector
│   │   ├── notifications/
│   │   │   ├── NotificationPanel.tsx # NEW: Bell icon + dropdown
│   │   │   └── NotificationItem.tsx  # NEW: Single notification
│   │   └── audit/
│   │       └── AuditLogList.tsx     # NEW: Audit log viewer
│   ├── hooks/
│   │   ├── useTasks.ts         # MODIFY: Handle new fields
│   │   ├── useNotifications.ts # NEW: Notification hook
│   │   └── useAudit.ts         # NEW: Audit log hook
│   ├── lib/
│   │   ├── api.ts              # MODIFY: Add new endpoints
│   │   └── reminders.ts        # NEW: Reminder API client
│   └── types/
│       └── index.ts            # MODIFY: Add new types
└── tests/
    └── unit/
        └── test_recurring_logic.test.ts
```

**Structure Decision**: Web application structure confirmed. Phase-5 directory contains the active monolithic backend and frontend that will be modified for this branch.

## Verification Summary

**Codebase Examination Results:**

### Existing Backend Structure (phase-5/backend/)
- **Models**: `/src/backend/models/task.py` - SQLModel Task class with basic fields
- **Services**: `/src/backend/services/task_service.py` - TaskService class with CRUD operations
- **Routes**: `/src/backend/routers/tasks.py` - FastAPI router with JWT auth
- **Schemas**: `/src/backend/schemas/task.py` - Pydantic request/response models
- **Database**: `/src/backend/database.py` - PostgreSQL connection with session management
- **Main**: `/src/backend/main.py` - FastAPI app with CORS and startup events

### Existing Frontend Structure (phase-5/frontend/)
- **Pages**: `/src/app/(dashboard)/tasks/page.tsx` - Main tasks page with TaskForm, TaskList
- **Components**: `/src/components/tasks/TaskForm.tsx`, `/src/components/tasks/TaskList.tsx`, `/src/components/tasks/TaskCard.tsx`
- **Hooks**: `/src/hooks/useTasks.ts`, `/src/hooks/useAuth.ts`
- **Types**: `/src/types/index.ts` - TypeScript interfaces (Task, CreateTaskDTO, etc.)
- **API**: `/src/lib/api.ts` - API client for backend communication

### Migration Pattern
- Existing migrations in `/phase-5/backend/migrations/`: chat_sessions_create.sql, chat_messages_create.sql
- Pattern: Plain SQL with BEGIN/COMMIT transactions, index creation, triggers for updated_at

### Dependencies Verified
- Backend: FastAPI, SQLModel, SQLAlchemy, Pydantic, python-jose, asyncio (all available)
- Frontend: Next.js 16, React 19, Framer Motion, Tailwind CSS, TypeScript (all available)

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **Recurring Task Date Calculation**
   - Question: How to handle edge cases (Feb 29, Jan 31)?
   - Research: Python `dateutil.relativedelta` vs manual calculation
   - Decision: Use `dateutil.relativedelta` for robust month/year arithmetic

2. **Reminder Polling Strategy**
   - Question: How often to poll for due reminders?
   - Research: Trade-offs between 30s, 60s, 120s intervals
   - Decision: 60s polling interval (balance between responsiveness and load)

3. **Notification Storage**
   - Question: How long to retain notifications?
   - Research: Industry standards, user expectations
   - Decision: Retain for 90 days (matches audit retention in constitution)

4. **Audit Log Performance**
   - Question: Impact of synchronous audit writes?
   - Research: Database index strategy for queries
   - Decision: Add composite index on (user_id, timestamp) for efficient filtering

5. **Tags Storage Format**
   - Question: How to store tags in PostgreSQL?
   - Research: ARRAY vs JSONB vs separate table
   - Decision: TEXT[] array type (simple, queryable, indexed)

### Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Date arithmetic | `dateutil.relativedelta` | Handles month/year edge cases correctly |
| Reminder polling | 60s asyncio task | Simple, no external dependencies |
| Tags storage | PostgreSQL TEXT[] array | Native array type, indexable |
| Audit writes | Synchronous in transaction | Simple, consistent (upgrade to async in branch 014) |
| Notification poll | Frontend 30s interval | Balance real-time feel vs server load |
| Leap year handling | Last day of month fallback | Standard business logic pattern |

## Phase 1: Design & Contracts

### Data Model

**See [data-model.md](./data-model.md) for complete entity definitions.**

**Entity Summary:**

1. **Task** (modified) - Add 6 new fields
   - `recurring_rule`: VARCHAR(20) NULL - "daily", "weekly", "monthly", "yearly"
   - `recurring_end_date`: TIMESTAMP NULL
   - `parent_task_id`: UUID NULL
   - `reminder_at`: TIMESTAMP NULL
   - `reminder_sent`: BOOLEAN DEFAULT FALSE
   - `tags`: TEXT[] NULL

2. **AuditLog** (new)
   - `id`: UUID PRIMARY KEY
   - `event_type`: VARCHAR(50) NOT NULL
   - `entity_type`: VARCHAR(50) NOT NULL
   - `entity_id`: UUID NOT NULL
   - `user_id`: TEXT NOT NULL
   - `timestamp`: TIMESTAMP NOT NULL
   - `data`: JSONB NOT NULL
   - Indexes: (user_id, timestamp), (entity_id)

3. **Notification** (new)
   - `id`: UUID PRIMARY KEY
   - `user_id`: TEXT NOT NULL
   - `message`: TEXT NOT NULL
   - `task_id`: UUID NULL
   - `read`: BOOLEAN DEFAULT FALSE
   - `created_at`: TIMESTAMP NOT NULL
   - Indexes: (user_id, read), (created_at)

### API Contracts

**See [contracts/](./contracts/) for OpenAPI specifications.**

**New Endpoints:**

1. **Notifications API**
   - `GET /api/{user_id}/notifications` - List notifications
   - `PATCH /api/{user_id}/notifications/{id}/read` - Mark as read
   - `PATCH /api/{user_id}/notifications/read-all` - Mark all as read

2. **Audit API**
   - `GET /api/{user_id}/audit` - Get audit log with filters

**Modified Endpoints:**

1. **Tasks API** - Add request/response fields:
   - `POST /api/{user_id}/tasks` - Accept recurring_rule, reminder_at, tags
   - `PUT /api/{user_id}/tasks/{id}` - Update recurring_rule, reminder_at, tags
   - `PATCH /api/{user_id}/tasks/{id}/complete` - Trigger recurring task creation

### Database Migration Plan

**File: `phase-5/backend/migrations/002_phase5_features.sql`**

```sql
-- Migration: Phase 5 Features (Recurring Tasks, Reminders, Audit, Notifications)
-- Date: 2025-02-02
-- Description: Add recurring tasks, reminders, audit logging, and notifications

BEGIN;

-- Install required extension for arrays (if not already installed)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add new columns to tasks table
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS recurring_rule VARCHAR(20),
  ADD COLUMN IF NOT EXISTS recurring_end_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_rule ON tasks(recurring_rule) WHERE recurring_rule IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_at ON tasks(reminder_at) WHERE reminder_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    data JSONB NOT NULL DEFAULT '{}'
);

-- Add indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Verify existing data is intact
SELECT COUNT(*) FROM tasks;

COMMIT;
```

**Migration Execution Steps:**

1. Backup database (Neon point-in-time recovery available)
2. Test migration on staging copy first
3. Apply migration to production
4. Verify row counts and data integrity
5. Update application code to use new fields

## Architecture Decisions

### 1. Recurring Task Flow

**Completion → Next Instance Creation:**

```python
# In task_service.toggle_complete():
if task.recurring_rule and not task.completed:
    # Task is being marked complete and has recurring rule
    if should_create_next_instance(task):
        next_task = create_next_instance(task)
        audit_log("recurring_task_created", next_task)
```

**Date Calculation Logic:**

```python
from dateutil.relativedelta import relativedelta

def calculate_next_due_date(current_due_date: date, rule: str) -> date:
    if rule == "daily":
        return current_due_date + relativedelta(days=1)
    elif rule == "weekly":
        return current_due_date + relativedelta(weeks=1)
    elif rule == "monthly":
        return current_due_date + relativedelta(months=1)
    elif rule == "yearly":
        return current_due_date + relativedelta(years=1)
```

### 2. Reminder Service Architecture

**Async Polling Pattern:**

```python
# In reminder_service.py
class ReminderService:
    async def start_polling(self):
        while True:
            await asyncio.sleep(60)  # Poll every 60 seconds
            await self.process_due_reminders()

    async def process_due_reminders(self):
        # Find tasks where reminder_at <= now AND reminder_sent = false
        # Create notifications
        # Mark reminder_sent = true
```

**Startup Registration:**

```python
# In main.py
@app.on_event("startup")
async def startup_event():
    reminder_service = ReminderService(db_session)
    asyncio.create_task(reminder_service.start_polling())
```

### 3. Audit Logging Strategy

**Synchronous Write Pattern:**

```python
# In audit_service.py
class AuditService:
    def log_event(self, event_type, entity_type, entity_id, user_id, data):
        audit_log = AuditLog(
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            user_id=user_id,
            data=data
        )
        self.session.add(audit_log)
        # Commit happens in same transaction as the main operation
```

**Integration Points:**

- After `create_task()` → log "created"
- After `update_task()` → log "updated"
- After `delete_task()` → log "deleted"
- After `toggle_complete()` → log "completed"
- After recurring task creation → log "recurring_created"

### 4. Frontend Polling Strategy

**Notification Refetch:**

```typescript
// In useNotifications.ts hook
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30000); // Poll every 30 seconds
  return () => clearInterval(interval);
}, []);
```

## Files to Create

### Backend Files

| File | Purpose |
|------|---------|
| `phase-5/backend/src/backend/models/audit_log.py` | AuditLog SQLModel |
| `phase-5/backend/src/backend/models/notification.py` | Notification SQLModel |
| `phase-5/backend/src/backend/services/audit_service.py` | Audit logging business logic |
| `phase-5/backend/src/backend/services/notification_service.py` | Notification CRUD |
| `phase-5/backend/src/backend/services/reminder_service.py` | Async reminder polling |
| `phase-5/backend/src/backend/routers/notifications.py` | Notification endpoints |
| `phase-5/backend/src/backend/routers/audit.py` | Audit log endpoints |
| `phase-5/backend/migrations/002_phase5_features.sql` | Database migration |
| `phase-5/backend/tests/unit/test_reminder_service.py` | Reminder service tests |
| `phase-5/backend/tests/unit/test_audit_service.py` | Audit service tests |

### Frontend Files

| File | Purpose |
|------|---------|
| `phase-5/frontend/src/components/notifications/NotificationPanel.tsx` | Bell + dropdown |
| `phase-5/frontend/src/components/notifications/NotificationItem.tsx` | Single notification |
| `phase-5/frontend/src/components/tasks/RecurringOptions.tsx` | Recurring rule selector |
| `phase-5/frontend/src/components/audit/AuditLogList.tsx` | Audit log viewer |
| `phase-5/frontend/src/hooks/useNotifications.ts` | Notification data hook |
| `phase-5/frontend/src/hooks/useAudit.ts` | Audit log hook |
| `phase-5/frontend/src/app/(dashboard)/audit/page.tsx` | Audit log page |
| `phase-5/frontend/src/lib/reminders.ts` | Reminder API client |
| `phase-5/frontend/src/components/tasks/DateTimePicker.tsx` | Date + time picker |

## Files to Modify

### Backend Files

| File | Changes Required |
|------|------------------|
| `phase-5/backend/src/backend/models/task.py` | Add 6 new fields to Task model |
| `phase-5/backend/src/backend/schemas/task.py` | Add new fields to TaskCreate, TaskUpdate, TaskResponse |
| `phase-5/backend/src/backend/services/task_service.py` | Add recurring logic, integrate audit logging |
| `phase-5/backend/src/backend/routers/tasks.py` | Support new fields in create/update routes |
| `phase-5/backend/src/backend/main.py` | Register reminder scheduler on startup |
| `phase-5/backend/src/backend/task_serves_mcp_tools.py` | Update MCP tools with new parameters |
| `phase-5/backend/pyproject.toml` | Add `python-dateutil` dependency |

### Frontend Files

| File | Changes Required |
|------|------------------|
| `phase-5/frontend/src/types/index.ts` | Add new types (RecurringRule, Notification, AuditLog) |
| `phase-5/frontend/src/lib/api.ts` | Add new API methods (notifications, audit) |
| `phase-5/frontend/src/hooks/useTasks.ts` | Handle new fields in create/update |
| `phase-5/frontend/src/components/tasks/TaskForm.tsx` | Add recurring/reminder/tags inputs |
| `phase-5/frontend/src/components/tasks/TaskCard.tsx` | Show recurring indicator, tags |
| `phase-5/frontend/src/app/(dashboard)/layout.tsx` | Add NotificationPanel to navbar |
| `phase-5/frontend/src/app/(dashboard)/tasks/page.tsx` | Add tags filter |

## Implementation Tasks (Dependency-Ordered)

### Phase 1: Database & Models (Day 1)

- [ ] **T1.1** Create migration file `002_phase5_features.sql`
- [ ] **T1.2** Test migration on local database
- [ ] **T1.3** Create `AuditLog` model in `models/audit_log.py`
- [ ] **T1.4** Create `Notification` model in `models/notification.py`
- [ ] **T1.5** Update `Task` model with new fields
- [ ] **T1.6** Create unit tests for models

### Phase 2: Backend Services (Day 2-3)

- [ ] **T2.1** Create `AuditService` with `log_event()` method
- [ ] **T2.2** Integrate audit logging into `TaskService.create_task()`
- [ ] **T2.3** Integrate audit logging into `TaskService.update_task()`
- [ ] **T2.4** Integrate audit logging into `TaskService.delete_task()`
- [ ] **T2.5** Integrate audit logging into `TaskService.toggle_complete()`
- [ ] **T2.6** Create `NotificationService` with CRUD methods
- [ ] **T2.7** Create `ReminderService` with async polling
- [ ] **T2.8** Add recurring task logic to `toggle_complete()`
- [ ] **T2.9** Update schemas (`TaskCreate`, `TaskUpdate`, `TaskResponse`)
- [ ] **T2.10** Write unit tests for all services

### Phase 3: Backend Routes (Day 4)

- [ ] **T3.1** Create `notifications.py` router with endpoints
- [ ] **T3.2** Create `audit.py` router with endpoints
- [ ] **T3.3** Update `tasks.py` router to accept new fields
- [ ] **T3.4** Register new routers in `main.py`
- [ ] **T3.5** Start reminder scheduler in `main.py` startup event
- [ ] **T3.6** Update MCP tools with new parameters
- [ ] **T3.7** Write integration tests for routes

### Phase 4: Frontend Types & API (Day 5)

- [ ] **T4.1** Update `types/index.ts` with new interfaces
- [ ] **T4.2** Update `lib/api.ts` with notification/audit methods
- [ ] **T4.3** Create `lib/reminders.ts` API client
- [ ] **T4.4** Create `useNotifications.ts` hook
- [ ] **T4.5** Create `useAudit.ts` hook
- [ ] **T4.6** Update `useTasks.ts` for new fields

### Phase 5: Frontend Components (Day 6-7)

- [ ] **T5.1** Create `NotificationPanel.tsx` component
- [ ] **T5.2** Create `NotificationItem.tsx` component
- [ ] **T5.3** Create `RecurringOptions.tsx` component
- [ ] **T5.4** Create `DateTimePicker.tsx` component
- [ ] **T5.5** Create `AuditLogList.tsx` component
- [ ] **T5.6** Update `TaskForm.tsx` with new fields
- [ ] **T5.7** Update `TaskCard.tsx` with recurring indicator and tags
- [ ] **T5.8** Update `layout.tsx` with NotificationPanel
- [ ] **T5.9** Create audit log page at `audit/page.tsx`
- [ ] **T5.10** Update tasks page with tags filter

### Phase 6: Integration & Testing (Day 8)

- [ ] **T6.1** End-to-end test: Create recurring task
- [ ] **T6.2** End-to-end test: Complete recurring task → verify new instance
- [ ] **T6.3** End-to-end test: Set reminder → verify notification created
- [ ] **T6.4** End-to-end test: Mark notification as read
- [ ] **T6.5** End-to-end test: View audit log
- [ ] **T6.6** Performance test: Verify <100ms p95 for API calls
- [ ] **T6.7** Manual testing: Edge cases (Feb 29, Jan 31)
- [ ] **T6.8** Bug fixes and polish

## Testing Strategy

### Unit Tests

**Backend (pytest):**
- `test_reminder_service.py`: Test date calculation, polling logic
- `test_audit_service.py`: Test event logging, filtering
- `test_task_service.py`: Test recurring task creation
- `test_notification_service.py`: Test notification CRUD

**Frontend (React Testing Library):**
- `test_recurring_logic.test.ts`: Test date calculations
- `TaskForm.test.tsx`: Test form with new fields
- `NotificationPanel.test.tsx`: Test bell icon and dropdown

### Integration Tests

- Create recurring task via API → verify in DB
- Complete recurring task → verify next instance created
- Set reminder → wait for polling → verify notification created
- Perform CRUD operations → verify audit log entries

### Manual Tests

1. **Recurring Tasks:**
   - Create daily recurring task
   - Complete it → verify next day's task appears
   - Set recurring_end_date → verify stops after date
   - Test weekly, monthly, yearly patterns

2. **Reminders:**
   - Create task with reminder 2 minutes in future
   - Wait for polling → verify notification created
   - Edit reminder time → verify reset
   - Complete task before reminder → verify no notification

3. **Notifications:**
   - Verify bell icon shows count
   - Click bell → verify dropdown shows notifications
   - Mark as read → verify count decreases
   - Verify 30s polling updates notifications

4. **Audit Log:**
   - Create task → verify "created" event
   - Update task → verify "updated" event
   - Complete task → verify "completed" event
   - Delete task → verify "deleted" event
   - Filter by event type → verify correct results

5. **Edge Cases:**
   - Create yearly task on Feb 29 → verify correct next occurrence
   - Create monthly task on Jan 31 → verify Feb 28/29
   - Create multiple reminders at same time → verify all processed

## Dependencies

**New Python Dependencies:**
```toml
# pyproject.toml
python-dateutil = "^2.8.2"  # For robust date arithmetic
```

**New TypeScript Dependencies:**
```json
// package.json
// No new dependencies needed - using existing APIs
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Migration fails on existing data | Test on staging copy first, Neon point-in-time recovery |
| Reminder polling performance | Start with 60s intervals, monitor DB load |
| Audit log slows down operations | Use indexes, batch writes if needed (upgrade to async in branch 014) |
| Frontend state desync | Use optimistic updates, refetch on focus |
| Date calculation edge cases | Use `dateutil.relativedelta`, comprehensive tests |

## Rollback Plan

If critical issues are found:
1. Revert code changes (git reset)
2. Database: Neon point-in-time recovery to pre-migration state
3. Deploy previous stable version from branch 011

## Success Criteria

- [ ] All 5 user stories pass acceptance scenarios
- [ ] All functional requirements (FR-001 through FR-029) met
- [ ] All technical success criteria (TSC-001 through TSC-008) met
- [ ] Constitution compliance verified
- [ ] No performance regression (>100ms added)
- [ ] Tests pass (unit, integration, manual)

## Next Steps

After this plan is approved:
1. Execute `/sp.tasks` to generate detailed task list
2. Begin implementation with Phase 1 (Database & Models)
3. Create ADR if any architectural decisions need formal documentation
