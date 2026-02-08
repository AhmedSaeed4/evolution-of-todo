---

description: "Task list for Branch 012-features: Recurring Tasks, Reminders, Notifications & Audit Logging"
---

# Tasks: Recurring Tasks, Reminders, Notifications & Audit Logging

**Input**: Design documents from `/specs/012-features/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this branch. The specification does not explicitly request TDD approach. Test tasks are included below for completeness but can be skipped if not following TDD.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `phase-5/backend/src/`
- **Frontend**: `phase-5/frontend/src/`
- **Migrations**: `phase-5/backend/migrations/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and dependency setup for new features

- [X] T001 Create database migration file in phase-5/backend/migrations/004_phase5_features.sql
- [X] T002 Add python-dateutil dependency to phase-5/backend/pyproject.toml
- [ ] T003 [P] Verify migration on local database using psql (manual step - user to run)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Constitution v1.1.0 Compliance Tasks:**

- [X] T004 [P] Create AuditLog model in phase-5/backend/src/backend/models/audit_log.py
- [X] T005 [P] Create Notification model in phase-5/backend/src/backend/models/notification.py
- [X] T006 [P] Update Task model with new fields in phase-5/backend/src/backend/models/task.py (recurring_rule, recurring_end_date, parent_task_id, reminder_at, reminder_sent, tags)
- [X] T007 [P] Update TaskCreate schema with new fields in phase-5/backend/src/backend/schemas/task.py
- [X] T008 [P] Update TaskUpdate schema with new fields in phase-5/backend/src/backend/schemas/task.py
- [X] T009 [P] Update TaskResponse schema with new fields in phase-5/backend/src/backend/schemas/task.py
- [X] T010 Create AuditService with log_event method in phase-5/backend/src/backend/services/audit_service.py
- [X] T011 Create NotificationService with CRUD methods in phase-5/backend/src/backend/services/notification_service.py
- [X] T012 Create ReminderService with async polling in phase-5/backend/src/backend/services/reminder_service.py
- [X] T013 Integrate audit logging into TaskService.create_task in phase-5/backend/src/backend/services/task_service.py
- [X] T014 Integrate audit logging into TaskService.update_task in phase-5/backend/src/backend/services/task_service.py
- [X] T015 Integrate audit logging into TaskService.delete_task in phase-5/backend/src/backend/services/task_service.py
- [X] T016 Integrate audit logging into TaskService.toggle_complete in phase-5/backend/src/backend/services/task_service.py
- [X] T017 Update frontend Task type with new fields in phase-5/frontend/src/types/index.ts
- [X] T018 Add RecurringRule, Notification, AuditLog types to phase-5/frontend/src/types/index.ts
- [X] T019 Update CreateTaskDTO with new fields in phase-5/frontend/src/types/index.ts
- [X] T020 Update UpdateTaskDTO with new fields in phase-5/frontend/src/types/index.ts
- [X] T021 Add notifications API methods to phase-5/frontend/src/lib/api.ts
- [X] T022 Add audit API methods to phase-5/frontend/src/lib/api.ts
- [X] T023 Create useNotifications hook in phase-5/frontend/src/hooks/useNotifications.ts
- [X] T024 Create useAudit hook in phase-5/frontend/src/hooks/useAudit.ts
- [X] T025 Update useTasks hook to handle new fields in phase-5/frontend/src/hooks/useTasks.ts (types automatically handled)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel
**Constitution Check**: MCP tools update deferred to User Story phases per Constitution II

---

## Phase 3: User Story 1 - Create Recurring Task (Priority: P1) 🎯 MVP

**Goal**: Users can create recurring tasks that automatically create the next instance when completed

**Independent Test**: Create a daily recurring task, complete it, verify the next day's task appears automatically with correct due date

### Tests for User Story 1 (OPTIONAL)

- [ ] T026 [P] [US1] Unit test for date calculation in phase-5/backend/tests/unit/test_reminder_service.py
- [ ] T027 [P] [US1] Integration test for recurring task creation in phase-5/backend/tests/integration/test_recurring_tasks.py

### Implementation for User Story 1

**Backend:**

- [X] T028 [US1] Add recurring task logic to toggle_complete in phase-5/backend/src/backend/services/task_service.py (calculate next due date, create new instance)
- [X] T029 [US1] Update tasks router POST endpoint to accept recurring fields in phase-5/backend/src/backend/routers/tasks.py (handled by schema update)
- [X] T030 [US1] Update tasks router PUT endpoint to accept recurring fields in phase-5/backend/src/backend/routers/tasks.py (handled by schema update)
- [X] T031 [US1] Update MCP create_task tool with recurring_rule, recurring_end_date, reminder_at, tags parameters in phase-5/backend/src/backend/task_serves_mcp_tools.py
- [X] T032 [US1] Update MCP update_task tool with recurring_rule, recurring_end_date, reminder_at, tags parameters in phase-5/backend/src/backend/task_serves_mcp_tools.py
- [X] T033 [US1] Register reminder scheduler in main.py startup event in phase-5/backend/src/backend/main.py

**Frontend:**

- [X] T034 [P] [US1] Create RecurringOptions component in phase-5/frontend/src/components/tasks/RecurringOptions.tsx
- [X] T035 [P] [US1] Create DateTimePicker component in phase-5/frontend/src/components/tasks/DateTimePicker.tsx
- [X] T036 [US1] Update TaskForm component with recurring fields in phase-5/frontend/src/components/tasks/TaskForm.tsx
- [X] T037 [US1] Update TaskCard component to show recurring indicator in phase-5/frontend/src/components/tasks/TaskCard.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Set Task Reminder (Priority: P1)

**Goal**: Users can set reminders on tasks and receive notifications when reminders are due

**Independent Test**: Create task with reminder 2 minutes in future, wait for polling, verify notification created and displayed

### Tests for User Story 2 (OPTIONAL)

- [ ] T038 [P] [US2] Unit test for reminder processing in phase-5/backend/tests/unit/test_reminder_service.py
- [ ] T039 [P] [US2] Integration test for reminder notification creation in phase-5/backend/tests/integration/test_recurring_tasks.py

### Implementation for User Story 2

**Backend:**

- [X] T040 [US2] Create notifications router in phase-5/backend/src/backend/routers/notifications.py
- [X] T041 [US2] Register notifications router in main.py in phase-5/backend/src/backend/main.py

**Frontend:**

- [X] T042 [P] [US2] Create NotificationPanel component in phase-5/frontend/src/components/notifications/NotificationPanel.tsx
- [X] T043 [P] [US2] Create NotificationItem component in phase-5/frontend/src/components/notifications/NotificationItem.tsx
- [X] T044 [US2] Update TaskForm component with reminder field in phase-5/frontend/src/components/tasks/TaskForm.tsx (added in Phase 3)
- [X] T045 [US2] Add NotificationPanel to navbar layout in phase-5/frontend/src/components/layout/Navbar.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently ✅ MVP COMPLETE

---

## Phase 5: User Story 3 - View Notification Panel (Priority: P2) ✅ COMPLETE

**Goal**: Users can view all notifications in one place with bell icon showing unread count

**Independent Test**: Create tasks with reminders, wait for notifications, verify bell icon shows correct count and clicking displays notifications

### Tests for User Story 3 (OPTIONAL)

- [ ] T046 [P] [US3] Component test for NotificationPanel in phase-5/frontend/tests/unit/NotificationPanel.test.tsx

### Implementation for User Story 3

**Backend:**

- [X] T047 [US3] Implement GET /api/{user_id}/notifications endpoint in phase-5/backend/src/backend/routers/notifications.py
- [X] T048 [US3] Implement PATCH /api/{user_id}/notifications/{id}/read endpoint in phase-5/backend/src/backend/routers/notifications.py
- [X] T049 [US3] Implement PATCH /api/{user_id}/notifications/read-all endpoint in phase-5/backend/src/backend/routers/notifications.py

**Frontend:**

- [X] T050 [US3] Add 30s polling to useNotifications hook in phase-5/frontend/src/hooks/useNotifications.ts
- [X] T051 [US3] Update NotificationPanel component to show unread count in phase-5/frontend/src/components/notifications/NotificationPanel.tsx

**Checkpoint**: All P1 and P2 user stories should now be independently functional ✅

---

## Phase 6: User Story 4 - View Audit Log (Priority: P2)

**Goal**: Users can see history of all task operations with filtering by event type

**Independent Test**: Perform various task operations (create, update, delete, complete), then view audit log to verify all actions are recorded

### Tests for User Story 4 (OPTIONAL)

- [ ] T052 [P] [US4] Unit test for audit service in phase-5/backend/tests/unit/test_audit_service.py
- [ ] T053 [P] [US4] Integration test for audit logging in phase-5/backend/tests/integration/test_recurring_tasks.py

### Implementation for User Story 4

**Backend:**

- [ ] T054 [US4] Create audit router in phase-5/backend/src/backend/routers/audit.py
- [ ] T055 [US4] Implement GET /api/{user_id}/audit endpoint with filters in phase-5/backend/src/backend/routers/audit.py
- [ ] T056 [US4] Register audit router in main.py in phase-5/backend/src/backend/main.py

**Frontend:**

- [ ] T057 [P] [US4] Create AuditLogList component in phase-5/frontend/src/components/audit/AuditLogList.tsx
- [ ] T058 [US4] Create audit log page at phase-5/frontend/src/app/(dashboard)/audit/page.tsx

**Checkpoint**: All P1 and P2 user stories should be independently functional

---

## Phase 7: User Story 5 - Edit Recurring Task Properties (Priority: P3) ✅ COMPLETE

**Goal**: Users can modify recurring rule or stop recurring by clearing the rule

**Independent Test**: Create recurring task, edit its recurring_rule, verify future instances follow new pattern

### Tests for User Story 5 (OPTIONAL)

- [ ] T059 [P] [US5] Unit test for recurring rule modification in phase-5/backend/tests/unit/test_task_service.py

### Implementation for User Story 5

**Backend:**

- [X] T060 [US5] Handle recurring_rule modification in TaskService.update_task in phase-5/backend/src/backend/services/task_service.py
- [X] T061 [US5] Handle reminder_at modification with reminder_sent reset in phase-5/backend/src/backend/services/task_service.py

**Frontend:**

- [X] T062 [US5] Update TaskForm to allow editing recurring fields in phase-5/frontend/src/components/tasks/TaskForm.tsx

**Checkpoint**: All user stories should now be independently functional ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T063 [P] Add tags filter to tasks page in phase-5/frontend/src/app/(dashboard)/tasks/page.tsx
- [ ] T064 [P] Update TaskCard to display tags in phase-5/frontend/src/components/tasks/TaskCard.tsx
- [ ] T065 [P] Add tags input to TaskForm in phase-5/frontend/src/components/tasks/TaskForm.tsx
- [X] T066 [P] Update MCP tools with recurring_rule, recurring_end_date, reminder_at, tags parameters in phase-5/backend/src/backend/task_serves_mcp_tools.py
- [ ] T067 Run end-to-end test: Create recurring task in phase-5/backend/tests/integration/test_recurring_tasks.py
- [ ] T068 Run end-to-end test: Complete recurring task verify new instance in phase-5/backend/tests/integration/test_recurring_tasks.py
- [ ] T069 Run end-to-end test: Set reminder verify notification created in phase-5/backend/tests/integration/test_recurring_tasks.py
- [ ] T070 Run end-to-end test: Mark notification as read in phase-5/backend/tests/integration/test_recurring_tasks.py
- [ ] T071 Run end-to-end test: View audit log in phase-5/backend/tests/integration/test_recurring_tasks.py
- [ ] T072 Performance test: Verify <100ms p95 for API calls
- [ ] T073 Manual testing: Edge cases (Feb 29, Jan 31) per quickstart.md
- [ ] T074 Bug fixes and polish

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Create Recurring Task**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1) - Set Task Reminder**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P2) - View Notification Panel**: Can start after Foundational - Integrates with US2 (reminders) but independently testable
- **User Story 4 (P2) - View Audit Log**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (P3) - Edit Recurring Task Properties**: Can start after Foundational - Extends US1 but independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
uv run pytest tests/unit/test_reminder_service.py
uv run pytest tests/integration/test_recurring_tasks.py

# Launch all RecurringOptions/DateTimePicker components together:
# Create RecurringOptions.tsx
# Create DateTimePicker.tsx
```

---

## Parallel Example: Multiple User Stories

Once Foundational (Phase 2) is complete, different developers can work in parallel:

```bash
# Developer A: User Story 1 (Recurring Tasks)
# - T028-T037

# Developer B: User Story 2 (Reminders)
# - T040-T045

# Developer C: User Story 4 (Audit Log)
# - T054-T058
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Both P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create Recurring Task)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Complete Phase 4: User Story 2 (Set Task Reminder)
6. **STOP and VALIDATE**: Test User Story 2 independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Recurring tasks work!)
3. Add User Story 2 → Test independently → Deploy/Demo (Reminders work!)
4. Add User Story 3 → Test independently → Deploy/Demo (Notifications panel works!)
5. Add User Story 4 → Test independently → Deploy/Demo (Audit log works!)
6. Add User Story 5 → Test independently → Deploy/Demo (Edit recurring works!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1 + 5 (Recurring tasks)
   - Developer B: User Stories 2 + 3 (Reminders + Notifications)
   - Developer C: User Story 4 (Audit log)
3. Stories complete and integrate independently

---

## Notes

- **[P] tasks** = different files, no dependencies on incomplete tasks
- **[Story] label** maps task to specific user story for traceability (US1-US5)
- **P1 stories** (US1, US2) are the MVP - complete these first for minimum viable product
- **P2 stories** (US3, US4) add significant value but depend on P1 for full functionality
- **P3 story** (US5) is nice-to-have but not blocking for MVP
- Each user story should be independently completable and testable
- Branch 012 intentionally uses simple patterns (polling, synchronous audit) - advanced patterns come in branch 014
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
