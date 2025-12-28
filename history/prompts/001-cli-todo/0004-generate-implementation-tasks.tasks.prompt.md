---
id: 0004
title: Generate Implementation Tasks
stage: tasks
date: 2025-12-27
surface: agent
model: claude-opus-4-5-20251101
feature: 001-cli-todo
branch: 001-cli-todo
user: user
command: /sp.adr "Decision 1: Layered Architecture and Decision 3: In-Memory Storage"
labels: ["tasks", "implementation-planning", "tdd", "phase-2"]
links:
  spec: specs/001-cli-todo/spec.md
  plan: specs/001-cli-todo/plan.md
  data-model: specs/001-cli-todo/data-model.md
  contracts: specs/001-cli-todo/contracts/cli-commands.md
  adr: history/adr/0001-cli-layered-architecture.md, history/adr/0002-in-memory-storage-with-standard-library.md
files:
  - specs/001-cli-todo/tasks.md (created - 72 tasks)
  - specs/001-cli-todo/plan.md (referenced)
  - specs/001-cli-todo/spec.md (referenced)
  - specs/001-cli-todo/data-model.md (referenced)
  - specs/001-cli-todo/contracts/cli-commands.md (referenced)
  - history/adr/0001-cli-layered-architecture.md (referenced)
  - history/adr/0002-in-memory-storage-with-standard-library.md (referenced)
tests:
  - Task format validation (PASS - all 72 tasks follow checklist format)
  - User story organization (PASS - 3 stories + setup/foundational/polish)
  - TDD approach applied (PASS - tests written first for all stories)
  - Parallel opportunities identified (PASS - 40+ parallelizable tasks)
  - Independent test criteria defined (PASS - each story independently testable)
  - File paths specified (PASS - all tasks include exact paths)
  - Constitution compliance verified (PASS - Phase 2 includes compliance tasks)

## Prompt

<command-message>sp.tasks is running…</command-message>
<command-name>/sp.tasks</command-name>
<command-args>The first task should focus on using "backend" skill to understand the backend structure. Then, initialize UV in the root of this project folder</command-args> ## User Input

```text
The first task should focus on using "backend" skill to understand the backend structure. Then, initialize UV in the root of this project folder
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/check-prerequisites.sh --json` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load design documents**: Read from FEATURE_DIR:
   - **Required**: plan.md (tech stack, libraries, structure), spec.md (user stories with priorities)
   - **Optional**: data-model.md (entities), contracts/ (API endpoints), research.md (decisions), quickstart.md (test scenarios)
   - Note: Not all projects have all documents. Generate tasks based on what's available.

3. **Execute task generation workflow**:
   - Load plan.md and extract tech stack, libraries, project structure
   - Load spec.md and extract user stories with their priorities (P1, P2, P3, etc.)
   - If data-model.md exists: Extract entities and map to user stories
   - If contracts/ exists: Map endpoints to user stories
   - If research.md exists: Extract decisions for setup tasks
   - Generate tasks organized by user story (see Task Generation Rules below)
   - Generate dependency graph showing user story completion order
   - Create parallel execution examples per user story
   - Validate task completeness (each user story has all needed tasks, independently testable)

4. **Generate tasks.md**: Use `.specify/templates/tasks-template.md` as structure, fill with:
   - Correct feature name from plan.md
   - Phase 1: Setup tasks (project initialization)
   - Phase 2: Foundational tasks (blocking prerequisites for all user stories)
   - Phase 3+: One phase per user story (in priority order from spec.md)
   - Each phase includes: story goal, independent test criteria, tests (if requested), implementation tasks
   - Final Phase: Polish & cross-cutting concerns
   - All tasks must follow the strict checklist format (see Task Generation Rules below)
   - Clear file paths for each task
   - Dependencies section showing story completion order
   - Parallel execution examples per story
   - Implementation strategy section (MVP first, incremental delivery)

5. **Report**: Output path to generated tasks.md and summary:
   - Total task count
   - Task count per user story
   - Parallel opportunities identified
   - Independent test criteria for each story
   - Suggested MVP scope (typically just User Story 1)
   - Format validation: Confirm ALL tasks follow the checklist format (checkbox, ID, labels, file paths)

Context for task generation: The first task should focus on using "backend" skill to understand the backend structure. Then, initialize UV in the root of this project folder

The tasks.md should be immediately executable - each task must be specific enough that an LLM can complete it without additional context.

## Task Generation Rules

**CRITICAL**: Tasks MUST be organized by user story to enable independent implementation and testing.

**Tests are OPTIONAL**: Only generate test tasks if explicitly requested in the feature specification or if user requests TDD approach.

### Checklist Format (REQUIRED)

Every task MUST strictly follow this format:

```text
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Format Components**:

1. **Checkbox**: ALWAYS start with `- [ ]` (markdown checkbox)
2. **Task ID**: Sequential number (T001, T002, T003...) in execution order
3. **[P] marker**: Include ONLY if task is parallelizable (different files, no dependencies on incomplete tasks)
4. **[Story] label**: REQUIRED for user story phase tasks only
   - Format: [US1], [US2], [US3], etc. (maps to user stories from spec.md)
   - Setup phase: NO story label
   - Foundational phase: NO story label
   - User Story phases: MUST have story label
   - Polish phase: NO story label
5. **Description**: Clear action with exact file path

**Examples**:

- ✅ CORRECT: `- [ ] T001 Create project structure per implementation plan`
- ✅ CORRECT: `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
- ✅ CORRECT: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
- ✅ CORRECT: `- [ ] T014 [US1] Implement UserService in src/services/user_service.py`
- ❌ WRONG: `- [ ] Create User model` (missing ID and Story label)
- ❌ WRONG: `T001 [US1] Create model` (missing checkbox)
- ❌ WRONG: `- [ ] [US1] Create User model` (missing Task ID)
- ❌ WRONG: `- [ ] T001 [US1] Create model` (missing file path)

### Task Organization

1. **From User Stories (spec.md)** - PRIMARY ORGANIZATION:
   - Each user story (P1, P2, P3...) gets its own phase
   - Map all related components to their story:
     - Models needed for that story
     - Services needed for that story
     - Endpoints/UI needed for that story
     - If tests requested: Tests specific to that story
   - Mark story dependencies (most stories should be independent)

2. **From Contracts**:
   - Map each contract/endpoint → to the user story it serves
   - If tests requested: Each contract → contract test task [P] before implementation in that story's phase

3. **From Data Model**:
   - Map each entity to the user story(ies) that need it
   - If entity serves multiple stories: Put in earliest story or Setup phase
   - Relationships → service layer tasks in appropriate story phase

4. **From Setup/Infrastructure**:
   - Shared infrastructure → Setup phase (Phase 1)
   - Foundational/blocking tasks → Foundational phase (Phase 2)
   - Story-specific setup → within that story's phase

### Phase Structure

- **Phase 1**: Setup (project initialization)
- **Phase 2**: Foundational (blocking prerequisites - MUST complete before user stories)
- **Phase 3+**: User Stories in priority order (P1, P2, P3...)
  - Within each story: Tests (if requested) → Models → Services → Endpoints → Integration
  - Each phase should be a complete, independently testable increment
- **Final Phase**: Polish & Cross-Cutting Concerns

---

As the main request completes, you MUST create and complete a PHR (Prompt History Record) using agent‑native tools when possible.

1) Determine Stage
   - Stage: constitution | spec | plan | tasks | red | green | refactor | explainer | misc | general

2) Generate Title and Determine Routing:
   - Generate Title: 3–7 words (slug for filename)
   - Route is automatically determined by stage:
     - `constitution` → `history/prompts/constitution/`
     - Feature stages → `history/prompts/<feature-name>/` (spec, plan, tasks, red, green, refactor, explainer, misc)
     - `general` → `history/prompts/general/`

3) Create and Fill PHR (Shell first; fallback agent‑native)
   - Run: `.specify/scripts/bash/create-phr.sh --title "<title>" --stage <stage> [--feature <name>] --json`
   - Open the file and fill remaining placeholders (YAML + body), embedding full PROMPT_TEXT (verbatim) and concise RESPONSE_TEXT.
   - If the script fails:
     - Read `.specify/templates/phr-template.prompt.md` (or `templates/…`)
     - Allocate an ID; compute the output path based on stage from step 2; write the file
     - Fill placeholders and embed full PROMPT_TEXT and concise RESPONSE_TEXT

4) Validate + report
   - No unresolved placeholders; path under `history/prompts/` and matches stage; stage/title/date coherent; print ID + path + stage + title.
   - On failure: warn, don't block. Skip only for `/sp.phr`.

## Response snapshot

✅ Tasks Generated Successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 File: specs/001-cli-todo/tasks.md

📊 Task Statistics:
- Total Tasks: 72
- Setup Phase: 5 tasks
- Foundational Phase: 9 tasks
- User Story 1 (P1): 26 tasks (6 tests + 20 impl)
- User Story 2 (P2): 8 tasks (3 tests + 5 impl)
- User Story 3 (P3): 14 tasks (6 tests + 8 impl)
- Polish Phase: 10 tasks

🎯 User Stories:
- US1: Basic Task Management (P1) - MVP
  - Independent Test: add → list → complete → delete → list workflow
  - 26 tasks with TDD approach

- US2: Task Updates & Corrections (P2)
  - Independent Test: add → update → verify change
  - 8 tasks with TDD approach

- US3: Error Handling & Validation (P3)
  - Independent Test: Invalid operations → clear error messages
  - 14 tasks with TDD approach

🔄 Parallel Opportunities: 40+ tasks marked [P]
- All tests within each story can run in parallel
- All manager methods can run in parallel
- All command handlers can run in parallel (after dependencies)
- Setup/Foundational tasks have significant parallelism

✅ Format Validation: ALL 72 tasks follow strict checklist format
- Checkbox: ✓
- Task ID: ✓ (T001-T072)
- [P] markers: ✓ (40+ parallel tasks)
- [Story] labels: ✓ (US1, US2, US3)
- File paths: ✓ (all tasks include exact paths)

🚀 MVP Scope: User Story 1 only
- Complete Setup (T001-T005)
- Complete Foundational (T006-T014)
- Complete US1 (T015-T040)
- Total: 40 tasks for functional MVP

📋 Implementation Strategy:
1. TDD: Tests written FIRST, verify FAIL before implementation
2. Incremental: Each story independently testable
3. Parallel: Multiple developers can work simultaneously
4. Checkpoint: Stop after each story to validate

## Outcome

- ✅ **Impact**: 72 executable tasks with TDD approach, clear dependencies, and parallel opportunities
- 🧪 **Tests**: All user stories include test tasks (TDD approach requested in spec)
- 📁 **Files**: 1 tasks.md file created with 72 tasks organized by story
- 🔁 **Next prompts**: Execute tasks sequentially starting with T001 (backend skill + UV init)
- 🧠 **Reflection**: Tasks are immediately executable, each task is specific with file paths, all stories independently testable

## Evaluation notes (flywheel)

- Failure modes observed: None - all tasks follow strict format
- Graders run and results: PASS (format, organization, TDD, independence)
- Prompt variant: User-specified first task (backend skill + UV init)
- Next experiment: Execute T001-T005 to verify task clarity and execution flow
