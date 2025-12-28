# Tasks: In-Memory CLI Todo Application

**Input**: Design documents from `/specs/001-cli-todo/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Feature Branch**: `001-cli-todo`

**Tests**: Tests are explicitly requested in the specification for all user stories. All tasks include TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure using UV package manager

**User Input Context**: "The first task should focus on using 'backend' skill to understand the backend structure. Then, initialize UV in the root of this project folder"

- [X] T001 Use backend skill to understand current project structure and UV workflow
- [X] T002 Initialize UV package in project root: `uv init --package backend` (creates backend/ directory with pyproject.toml)
- [X] T003 Create project directory structure per plan.md: `backend/src/backend/` with subdirectories
- [X] T004 [P] Create `.python-version` file specifying Python 3.13+
- [X] T005 [P] Create `.gitignore` for Python/UV projects (exclude __pycache__, .venv, etc.)

**Checkpoint**: UV project initialized with proper structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Constitution v1.1.0 Compliance Tasks:**

- [X] T006 Create `backend/src/backend/__init__.py` (package initialization)
- [X] T007 [P] Create `backend/src/backend/models.py` with Task dataclass (from data-model.md)
- [X] T008 [P] Create `backend/src/backend/manager.py` with TaskManager class stub (empty methods)
- [X] T009 [P] Create `backend/src/backend/commands.py` (command handler stubs)
- [X] T010 [P] Create `backend/src/backend/main.py` (CLI entry point stub)
- [X] T011 Create `backend/pyproject.toml` with Python 3.13+ requirement (no external dependencies)
- [X] T012 [P] Create `backend/tests/` directory structure (unit/, integration/, fixtures/)
- [X] T013 [P] Create `docs/` directory with architecture.md stub
- [X] T014 Verify Constitution Check: All files follow layered architecture (models/manager/commands/main)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel
**Constitution Check**: Verify all Phase 2 tasks align with Constitution gates before proceeding

---

## Phase 3: User Story 1 - Basic Task Management (Priority: P1) 🎯 MVP

**Goal**: Core task management - add, list, complete, delete tasks with full validation and formatted output

**Independent Test**: Run application, execute workflow: add → list → complete → delete → list. Each command verified independently.

### Tests for User Story 1 (TDD - Write tests FIRST)

- [X] T015 [P] [US1] Unit test for Task dataclass in `backend/tests/unit/test_models.py`
- [X] T016 [P] [US1] Unit test for TaskManager.add_task() in `backend/tests/unit/test_manager.py`
- [X] T017 [P] [US1] Unit test for TaskManager.delete_task() in `backend/tests/unit/test_manager.py`
- [X] T018 [P] [US1] Unit test for TaskManager.toggle_complete() in `backend/tests/unit/test_manager.py`
- [X] T019 [P] [US1] Unit test for TaskManager.list_tasks() in `backend/tests/unit/test_manager.py`
- [X] T020 [P] [US1] Unit test for command handlers (add, delete, complete, list) in `backend/tests/unit/test_commands.py`
- [X] T021 [P] [US1] Integration test for complete workflow in `backend/tests/integration/test_cli_workflow.py`

**Verify**: All tests in T015-T021 should FAIL before implementation

### Implementation for User Story 1

- [X] T022 [P] [US1] Implement Task dataclass in `backend/src/backend/models.py` (id, title, is_complete, created_at)
- [X] T023 [P] [US1] Implement TaskManager.__init__() in `backend/src/backend/manager.py` (tasks dict, next_id)
- [X] T024 [P] [US1] Implement TaskManager.add_task() in `backend/src/backend/manager.py`
- [X] T025 [P] [US1] Implement TaskManager.delete_task() in `backend/src/backend/manager.py`
- [X] T026 [P] [US1] Implement TaskManager.toggle_complete() in `backend/src/backend/manager.py`
- [X] T027 [P] [US1] Implement TaskManager.list_tasks() in `backend/src/backend/manager.py`
- [X] T028 [US1] Implement add_task command handler in `backend/src/backend/commands.py` (with validation)
- [X] T029 [US1] Implement delete_task command handler in `backend/src/backend/commands.py` (with validation)
- [X] T030 [US1] Implement complete_task command handler in `backend/src/backend/commands.py` (with validation)
- [X] T031 [US1] Implement list_tasks command handler in `backend/src/backend/commands.py` (formatted table output)
- [X] T032 [US1] Implement help command handler in `backend/src/backend/commands.py`
- [X] T033 [US1] Implement exit/quit command handler in `backend/src/backend/commands.py`
- [X] T034 [US1] Implement main CLI loop in `backend/src/backend/main.py` (welcome, prompt, parse, dispatch)
- [X] T035 [US1] Implement command parser in `backend/src/backend/main.py` (split input, route commands)
- [X] T036 [US1] Add input validation for all commands (empty input, unknown commands, missing args)
- [X] T037 [US1] Add formatted table output for list command (box-drawing characters, column alignment)
- [X] T038 [US1] Add success/error message formatting (✓ for success, ✗ for errors)
- [X] T039 [US1] Add empty state handling for list command
- [X] T040 [US1] Add summary statistics to list output (total, complete, pending counts)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently
**Validation**: Run all tests T015-T021 - they should now PASS

---

## Phase 4: User Story 2 - Task Updates and Corrections (Priority: P2)

**Goal**: Enable modification of existing task titles for corrections and updates

**Independent Test**: Add a task, update it with new title, verify change is reflected correctly

### Tests for User Story 2 (TDD - Write tests FIRST)

- [X] T041 [P] [US2] Unit test for TaskManager.update_task() in `backend/tests/unit/test_manager.py`
- [X] T042 [P] [US2] Unit test for update command handler in `backend/tests/unit/test_commands.py`
- [X] T043 [P] [US2] Integration test for update workflow in `backend/tests/integration/test_cli_workflow.py`

**Verify**: All tests in T041-T043 should FAIL before implementation

### Implementation for User Story 2

- [X] T044 [P] [US2] Implement TaskManager.update_task() in `backend/src/backend/manager.py` (with validation)
- [X] T045 [US2] Implement update command handler in `backend/src/backend/commands.py`
- [X] T046 [US2] Add validation for update command (ID exists, new title non-empty)
- [X] T047 [US2] Add success message showing old → new title for update
- [X] T048 [US2] Add error handling for non-existent task updates

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently
**Validation**: Run all tests T015-T043 - they should all PASS

---

## Phase 5: User Story 3 - Error Handling and Validation (Priority: P3)

**Goal**: Comprehensive error handling with clear, actionable feedback for all failure scenarios

**Independent Test**: Attempt invalid operations and verify clear error messages display

### Tests for User Story 3 (TDD - Write tests FIRST)

- [X] T049 [P] [US3] Unit test for empty/whitespace input handling in `backend/tests/unit/test_commands.py`
- [X] T050 [P] [US3] Unit test for unknown command handling in `backend/tests/unit/test_commands.py`
- [X] T051 [P] [US3] Unit test for missing argument handling in `backend/tests/unit/test_commands.py`
- [X] T052 [P] [US3] Unit test for invalid ID format handling in `backend/tests/unit/test_commands.py`
- [X] T053 [P] [US3] Unit test for task not found handling in `backend/tests/unit/test_commands.py`
- [X] T054 [P] [US3] Integration test for all error scenarios in `backend/tests/integration/test_cli_workflow.py`

**Verify**: All tests in T049-T054 should FAIL before implementation

### Implementation for User Story 3

- [X] T055 [US3] Implement empty input handling (silent re-prompt) in `backend/src/backend/main.py`
- [X] T056 [US3] Implement unknown command error with help suggestion in `backend/src/backend/main.py`
- [X] T057 [US3] Implement missing argument usage hints in `backend/src/backend/commands.py`
- [X] T058 [US3] Implement invalid ID format error in `backend/src/backend/commands.py`
- [X] T059 [US3] Implement task not found error in `backend/src/backend/commands.py`
- [X] T060 [US3] Add whitespace trimming for all command inputs
- [X] T061 [US3] Add welcome message on startup (FR-018)
- [X] T062 [US3] Add goodbye message on exit (FR-019)

**Checkpoint**: All user stories should now be independently functional
**Validation**: Run all tests T015-T062 - they should all PASS

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T063 [P] Run quickstart.md validation workflow end-to-end
- [X] T064 [P] Add comprehensive docstrings to all functions and classes
- [X] T065 [P] Verify all acceptance criteria from spec.md are met
- [X] T066 [P] Performance test with 10,000 tasks (verify <100ms operations)
- [X] T067 [P] Memory usage validation (verify ~1MB for 10k tasks)
- [X] T068 [P] Cross-platform testing (Linux, macOS, Windows CLI compatibility)
- [X] T069 [P] Documentation: Update `docs/architecture.md` with implementation details
- [X] T070 [P] Documentation: Create `docs/api_reference.md` with command reference
- [X] T071 Code cleanup: Remove any debug prints, ensure consistent formatting
- [X] T072 Final validation: All acceptance scenarios from spec.md pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent but builds on US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent but benefits from US1/US2

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Models before services/manager methods
- Manager methods before command handlers
- Command handlers before main loop integration
- Core implementation before validation/error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T004, T005 can run in parallel
- **Phase 2**: T007, T008, T009, T010, T012, T013 can run in parallel
- **Phase 3 (US1)**:
  - All unit tests T015-T020 can run in parallel
  - All manager methods T022-T027 can run in parallel
  - All command handlers T028-T033 can run in parallel (after manager complete)
- **Phase 4 (US2)**: T041-T042 tests can run in parallel; T044-T045 implementation can run in parallel
- **Phase 5 (US3)**: T049-T053 tests can run in parallel; T055-T062 implementation can run in parallel
- **Phase 6**: All T063-T070 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "T015 [P] [US1] Unit test for Task dataclass in backend/tests/unit/test_models.py"
Task: "T016 [P] [US1] Unit test for TaskManager.add_task() in backend/tests/unit/test_manager.py"
Task: "T017 [P] [US1] Unit test for TaskManager.delete_task() in backend/tests/unit/test_manager.py"
Task: "T018 [P] [US1] Unit test for TaskManager.toggle_complete() in backend/tests/unit/test_manager.py"
Task: "T019 [P] [US1] Unit test for TaskManager.list_tasks() in backend/tests/unit/test_manager.py"
Task: "T020 [P] [US1] Unit test for command handlers in backend/tests/unit/test_commands.py"
Task: "T021 [P] [US1] Integration test for complete workflow in backend/tests/integration/test_cli_workflow.py"

# Launch all manager methods together (after tests written):
Task: "T022 [P] [US1] Implement Task dataclass in backend/src/backend/models.py"
Task: "T023 [P] [US1] Implement TaskManager.__init__() in backend/src/backend/manager.py"
Task: "T024 [P] [US1] Implement TaskManager.add_task() in backend/src/backend/manager.py"
Task: "T025 [P] [US1] Implement TaskManager.delete_task() in backend/src/backend/manager.py"
Task: "T026 [P] [US1] Implement TaskManager.toggle_complete() in backend/src/backend/manager.py"
Task: "T027 [P] [US1] Implement TaskManager.list_tasks() in backend/src/backend/manager.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T014) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T015-T040)
4. **STOP and VALIDATE**: Run all tests T015-T021 - verify they PASS
5. Manual test: Run application, execute full workflow
6. **MVP Complete**: Can demo basic task management

### Incremental Delivery

1. **Setup + Foundational** → Foundation ready (T001-T014)
2. **User Story 1** → Test independently → Deploy/Demo (MVP!) (T015-T040)
3. **User Story 2** → Test independently → Deploy/Demo (T041-T048)
4. **User Story 3** → Test independently → Deploy/Demo (T049-T062)
5. **Polish** → Final validation (T063-T072)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T014)
2. **Once Foundational is done:**
   - **Developer A**: User Story 1 (T015-T040) - Core task management
   - **Developer B**: User Story 2 (T041-T048) - Task updates (can start after T027)
   - **Developer C**: User Story 3 (T049-T062) - Error handling (can start after T035)
3. **Stories complete and integrate independently**

---

## Total Task Count

- **Setup Phase**: 5 tasks
- **Foundational Phase**: 9 tasks
- **User Story 1**: 26 tasks (6 tests + 20 implementation)
- **User Story 2**: 8 tasks (3 tests + 5 implementation)
- **User Story 3**: 14 tasks (6 tests + 8 implementation)
- **Polish Phase**: 10 tasks
- **TOTAL**: 72 tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- **Verify tests FAIL before implementing** (TDD principle)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All tasks reference exact file paths from plan.md
- Constitution v1.1.0 compliance verified in Phase 2
