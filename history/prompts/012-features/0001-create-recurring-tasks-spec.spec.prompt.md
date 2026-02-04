---
id: 0001
title: Create recurring tasks, reminders, notifications, and audit logging spec
stage: spec
date: 2025-02-02
surface: agent
model: glm-4.7
feature: 012-features
branch: 012-features
user: user
command: /sp.specify
labels: [feature,spec,recurring-tasks,reminders,notifications,audit-log]
links:
  spec: /specs/012-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - /specs/012-features/spec.md
  - /specs/012-features/checklists/requirements.md
tests:
  - No tests run (spec creation phase)
---

## Prompt

name the new branch "012-features" and here are my spec:
## User Scenarios & Testing

### User Story 1 - Create Recurring Task (Priority: P1)

As a user, I want to create a daily recurring task like "Take medication" so that I don't have to manually recreate it every single day. When I complete today's task, the system should automatically create tomorrow's task for me.

**Why this priority**: This is the core value proposition of recurring tasks - automation of repeated tasks saves time and ensures important tasks aren't forgotten.

**Independent Test**: Can be fully tested by creating a daily recurring task, completing it, and verifying the next day's task appears automatically in the task list with the correct due date.

**Acceptance Scenarios**:

1. **Given** I am on the tasks page, **When** I create a new task with title "Take medication", set recurring_rule to "daily", **Then** a task is created with `recurring_rule="daily"` and `parent_task_id=null`

2. **Given** I have a daily recurring task, **When** I mark it as complete, **Then** a new task is automatically created with:
   - Same title "Take medication"
   - `parent_task_id` pointing to the completed task
   - `due_date` incremented by 1 day from the completed task's due date

3. **Given** I set a `recurring_end_date`, **When** I complete a recurring task past the end date, **Then** no new task is created

4. **Given** I have a weekly recurring task "Pay rent", **When** I complete it, **Then** the next task's due date is 7 days later

---

### User Story 2 - Set Task Reminder (Priority: P1)

As a user, I want to set a reminder for an important task so that I get notified before it's due and don't miss deadlines.

**Why this priority**: Reminders are critical for time-sensitive tasks and directly support the core todo app functionality.

**Independent Test**: Can be fully tested by creating a task with a `reminder_at` time, waiting for that time, and verifying a notification is created and displayed.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a task, **When** I set `reminder_at` to "tomorrow at 9am", **Then** the task is saved with `reminder_at` set and `reminder_sent=false`

2. **Given** I have a task with `reminder_at` in the past, **When** the reminder time arrives, **Then** the system:
   - Publishes a reminder event via Dapr Pub/Sub
   - Creates a notification for the user
   - Marks `reminder_sent=true` in the database

3. **Given** I edit a task's reminder time, **When** I save the task, **Then** `reminder_sent` is reset to `false` so the new reminder will be sent

4. **Given** I mark a task as complete before the reminder time, **When** the reminder time passes, **Then** no reminder is sent (or notification is suppressed)

---

### User Story 3 - View Notification Panel (Priority: P2)

As a user, I want to see all my notifications in one place with a bell icon showing unread count so I can quickly see what needs my attention.

**Why this priority**: Important for UX but depends on Story 2 (reminders actually being created). Users can still use the app without it, but it enhances the notification experience.

**Independent Test**: Can be fully tested by creating tasks with reminders, waiting for notifications to be generated, and verifying the bell icon shows the correct count and clicking it displays the notifications.

**Acceptance Scenarios**:

1. **Given** I have unread reminders, **When** I look at the navbar, **Then** I see a bell icon with a badge showing the unread count

2. **Given** I click the bell icon, **When** the dropdown opens, **Then** I see a list of notifications with:
   - Task title
   - Reminder time
   - "Mark as read" option

3. **Given** I view the notification panel, **When** I click "Mark as read" on a notification, **Then** the unread count decreases and that notification is visually marked as read

4. **Given** I have no unread notifications, **When** I look at the navbar, **Then** the bell icon has no badge or shows "0"

---

### User Story 4 - View Audit Log (Priority: P2)

As a user, I want to see a history of all task operations so I can track what changed and when.

**Why this priority**: Useful for accountability and debugging but not critical for core functionality. Users can manage tasks without seeing audit logs.

**Independent Test**: Can be fully tested by performing various task operations (create, update, delete, complete) and then viewing the audit log to verify all actions are recorded.

**Acceptance Scenarios**:

1. **Given** I perform task operations (create, update, delete, complete), **When** I navigate to the audit log section, **Then** I see a chronological list of all operations with:
   - Event type (created, updated, deleted, completed)
   - Task title and ID
   - Timestamp
   - My user ID

2. **Given** I filter the audit log by event type, **When** I select "completed", **Then** I only see task completion events

3. **Given** I am viewing the audit log, **When** I click on a task ID, **Then** I can navigate to that task

---

### User Story 5 - Edit Recurring Task Properties (Priority: P3)

As a user, I want to modify or stop a recurring task so I can adapt to changing circumstances without losing the history.

**Why this priority**: Nice-to-have for flexibility but users can achieve similar results by deleting and recreating. Not blocking for MVP.

**Independent Test**: Can be tested by creating a recurring task, editing its `recurring_rule` or `recurring_end_date`, and verifying future instances follow the new pattern.

**Acceptance Scenarios**:

1. **Given** I have a weekly recurring task, **When** I edit it to be "daily", **Then** all future completions create daily tasks instead of weekly

2. **Given** I set a `recurring_end_date`, **When** that date passes, **Then** no more recurring tasks are created

3. **Given** I want to stop recurring, **When** I clear the `recurring_rule`, **Then** the task becomes a one-time task

---

## Edge Cases

### Recurring Task Edge Cases

- **What happens when** a recurring task is due on Feb 29 (leap day) and the rule is "yearly"?
  - **Answer**: Next occurrence should be Feb 29 of the next leap year (4 years later), or Mar 1 if non-leap year handling

- **What happens when** a monthly task is due on Jan 31 and next month has only 28 days?
  - **Answer**: Should default to last day of month (Feb 28), or configurable behavior

- **What happens when** user completes a recurring task, but the parent task gets deleted?
  - **Answer**: Orphan tasks should still be linked via `parent_task_id` for audit trail

- **What happens when** two users have recurring tasks with the same schedule?
  - **Answer**: Tasks are user-scoped via `user_id`, no conflict

### Reminder Edge Cases

- **What happens when** a reminder time is in the past when the task is created?
  - **Answer**: Should send immediately or flag to user for confirmation

- **What happens when** multiple reminders are scheduled for the same time?
  - **Answer**: All should be processed, no throttling

- **What happens when** Dapr Jobs it fires?
  - **Answer**: Job should be cancelled, no notification sent

### Audit Log Edge Cases

- **What happens when** a task is updated multiple times in quick succession?
  - **Answer**: All events should be logged, may need deduplication or batching

- **What happens when** user is deleted (account closure)?
  - **Answer**: Audit logs should be retained or anonymized per compliance requirements

---

## Requirements

### Constitution Alignment

All requirements MUST comply with Evolution of Todo Constitution v1.1.0:
- **Constitution II**: All core functionality exposed via MCP tools
- **Constitution III**: Zero server-side session state
- **Constitution IV**: Event-driven patterns for async operations
- **Constitution V**: Multi-tenancy at query level
- **Constitution VI**: Authorized technology stack only

### Functional Requirements

**Recurring Tasks:**
- **FR-001**: System MUST allow users to create tasks with a `recurring_rule` field with values: "daily", "weekly", "monthly", "yearly", or null
- **FR-002**: System MUST calculate the next occurrence due date based on the `recurring_rule` when a recurring task is completed
- **FR-003**: System MUST automatically create the next task instance when a recurring task is marked complete
- **FR-004**: System MUST link all recurring task instances via `parent_task_id` to the original task
- **FR-005**: System MUST stop creating recurring tasks when `recurring_end_date` is reached
- **FR-006**: System MUST allow users to optionally set a `recurring_end_date` after which no new tasks are created
- **FR-007**: System MUST display a visual indicator on tasks that are recurring (e.g., repeat icon or badge)
- **FR-008**: System MUST allow users to modify the `recurring_rule` of existing tasks

**Reminders:**
- **FR-009**: System MUST allow users to set a `reminder_at` datetime field on tasks
- **FR-010**: System MUST track whether a reminder has been sent via `reminder_sent` boolean field
- **FR-011**: System MUST use Dapr Jobs API to schedule reminder callbacks at exact `reminder_at` times
- **FR-012**: System MUST publish reminder events to Dapr Pub/Sub topic "reminders" when triggered
- **FR-013**: System MUST reset `reminder_sent=false` when a task's reminder time is modified
- **FR-014**: System MUST not send reminders for tasks that are already completed

**Notifications:**
- **FR-015**: System MUST provide a notification panel component accessible via bell icon in the navbar
- **FR-016**: System MUST display an unread count badge on the notification bell icon
- **FR-017**: System MUST allow users to mark notifications as read
- **FR-018**: System MUST store notification history for users to review
- **FR-019**: System MUST support in-app notifications as the primary channel (email/push optional)

**Audit Logging:**
- **FR-020**: System MUST create an `AuditLog` table to store all task operations
- **FR-021**: System MUST emit events for all task CRUD operations (create, update, delete, complete)
- **FR-022**: System MUST log events with: event_type, entity_type, entity_id, user_id, timestamp, and data
- **FR-023**: System MUST provide an API endpoint `GET /api/audit` for users to retrieve their audit log
- **FR-024**: System MUST scope audit logs to `user_id` to maintain multi-tenancy

**MCP Tools:**
- **FR-025**: System MUST update MCP `create_task` tool to accept `recurring_rule`, `reminder_at`, and `tags` parameters
- **FR-026**: System MUST update MCP `update_task` tool to support modifying recurring, reminder, and tags fields

**Tags:**
- **FR-027**: System MUST add `tags` field as Optional[List[str]] to Task model
- **FR-028**: System MUST allow filtering/searching tasks by tags
- **FR-029**: System MUST display tags on task cards in the UI

### Architecture Requirements

- **AR-001**: Database MUST add new fields to Task model: `recurring_rule`, `recurring_end_date`, `parent_task_id`, `reminder_at`, `reminder_sent`, `tags`
- **AR-002**: Database MUST add new AuditLog model for complete audit trail
- **AR-003**: Database MUST add new Notification model for storing user notifications
- **AR-004**: Backend MUST provide job scheduling service using Dapr Jobs API
- **AR-005**: Backend MUST expose `/api/jobs/trigger` endpoint for Dapr job callbacks
- **AR-006**: Frontend MUST add RecurringTaskForm component with recurring dropdown and date pickers
- **AR-007**: Frontend MUST add NotificationPanel component with bell icon and dropdown
- **AR-008**: All database queries MUST be scoped to `user_id` for multi-tenancy

> **Note on Dapr Integration:** Branch 012 implements the database schema, models, and API logic. The full Dapr Pub/Sub and Jobs API integration (event publishing, job scheduling) will be completed in Branch 014. For this branch, reminder checking can use a polling mechanism or be stubbed for later Dapr integration.

### Key Entities

**Task Entity (existing with additions):**
- `id`: UUID (primary key)
- `title`: Task title
- `description`: Optional description
- `completed`: Boolean completion status
- `priority`: Optional priority (low/medium/high)
- `category`: Optional category (work/personal/home/other)
- `due_date`: Optional due date
- **`recurring_rule`**: Optional recurring pattern ("daily", "weekly", "monthly", "yearly")**
- **`recurring_end_date`**: Optional date to stop recurring**
- **`parent_task_id`**: Optional UUID linking to parent recurring task**
- **`reminder_at`**: Optional datetime to send reminder**
- **`reminder_sent`**: Boolean tracking if reminder was sent**
- `user_id`: Owner identifier

**AuditLog Entity (new):**
- `id`: UUID (primary key)
- `event_type`: String ("created", "updated", "deleted", "completed")
- `entity_type`: String ("task")
- `entity_id`: UUID of the task
- `user_id`: User who performed the action
- `timestamp`: When the event occurred
- `data`: JSON object with full event details

**Notification Entity:**
- `id`: UUID (primary key)
- `user_id`: Recipient
- `message`: Notification message
- `task_id`: Associated task (optional)
- `read`: Boolean read status
- `created_at`: When notification was created

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create a recurring task in under 30 seconds
- **SC-002**: System completes task completion → next task creation flow within 2 seconds
- **SC-003**: Users can set reminders on tasks with date/time picker that works
- **SC-004**: Reminder notifications are sent within 10 seconds of scheduled time
- **SC-005**: Users can view all notifications in a dedicated panel
- **SC-006**: Audit log captures 100% of task operations with accurate timestamps
- **SC-007**: Frontend notification badge accurately reflects unread count (±1 tolerance)

### Technical Success Criteria

- **TSC-001**: Database migration successfully adds 5 new fields to Task table
- **TSC-002**: Database migration creates AuditLog table with proper indexes
- **TSC-003**: Backend publishes events to Dapr Pub/Sub for all task operations
- **TSC-004**: Backend successfully schedules Dapr Jobs for reminder times
- **TSC-005**: Backend `/api/jobs/trigger` endpoint correctly processes Dapr callbacks
- **TSC-006**: Frontend RecurringTaskForm component integrates with existing TaskForm
- **TSC-007**: Frontend NotificationPanel displays notifications with real-time updates
- **SC-008**: All operations complete successfully with `user_id` scoping maintained

### Rollback Criteria

If any of the following occur, the feature branch should be reconsidered:
- Database migration fails on existing Phase 4 data
- Dapr Jobs API proves incompatible with Minikube deployment
- Performance impact of audit logging exceeds acceptable thresholds (>100ms added to operations)
- Frontend components break existing task management workflows

---

## Notes

### Dependencies

- Requires Dapr 1.12+ with Jobs API support
- Requires Neon PostgreSQL with migration capability
- Builds on Phase 4 authentication (Better Auth + JWT)
- Depends on Phase 4 database schema (tasks table)

### Migration Strategy

1. Create Alembic migration for new Task fields
2. Create Alembic migration for AuditLog table
3. Run migrations before deploying code changes
4. Test migration on Phase 4 data to ensure compatibility

### Future Considerations (Out of Scope for This Branch)

- Email notifications for reminders (Phase V Part C)
- Push notifications for mobile (Phase V Part C)
- Recurring task conflict resolution (if user modifies while pending)
- Reminder snooze functionality
- Bulk notification actions (mark all as read, etc.)

### What Changes in Branch 014 (Dapr Integration)

> **Note:** Branch 012 implements features with simple patterns. These will be upgraded in Branch 014:

| Branch 012 (This Branch) | Branch 014 (Dapr) |
|--------------------------|-------------------|
| Reminder check via polling/background task | Dapr Jobs API (exact scheduling) |
| Audit log via synchronous DB write | Event publishing via Dapr Pub/Sub |
| Direct database queries | Same (Dapr State is optional) |
| Monolithic backend | Split into 5 microservices |

**Don't over-engineer Branch 012** - keep it simple, Dapr patterns come later.

## Response snapshot

Created feature branch `012-features` and comprehensive specification for:

1. **Recurring Tasks** (P1): Daily/weekly/monthly/yearly recurring tasks with automatic next-instance creation on completion, parent-child linking, optional end dates, and visual indicators.

2. **Reminders** (P1): Per-task `reminder_at` datetime with `reminder_sent` tracking, automatic notification creation when triggered, reset on modification, and suppression for completed tasks.

3. **Notification Panel** (P2): Bell icon with unread count badge in navbar, dropdown showing all notifications with task titles and timestamps, and mark-as-read functionality.

4. **Audit Log** (P2): Complete audit trail of all task operations (create, update, delete, complete) with event type, entity info, user ID, timestamp, and full event data in JSON.

5. **Edit Recurring Tasks** (P3): Modify recurring_rule, set/clear recurring_end_date, and stop recurring.

**Key Entities Added:**
- Task: 6 new fields (recurring_rule, recurring_end_date, parent_task_id, reminder_at, reminder_sent, tags)
- AuditLog: new table for complete audit trail
- Notification: new table for user notifications

**Files Created:**
- `/specs/012-features/spec.md` - Complete feature specification
- `/specs/012-features/checklists/requirements.md` - Quality checklist (PASSED)

Specification quality validation passed all checkpoints with no clarification markers needed.

## Outcome

- Impact: New feature specification created for recurring tasks, reminders, notifications, and audit logging
- Tests: No tests run (spec creation phase)
- Files: Created spec.md and requirements checklist in specs/012-features/
- Next prompts: Ready for /sp.plan to create implementation plan
- Reflection: User provided comprehensive specification eliminating need for clarifications. All requirements testable with clear acceptance criteria. Edge cases thoroughly documented.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Requirements quality checklist PASSED (all 12 items)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
