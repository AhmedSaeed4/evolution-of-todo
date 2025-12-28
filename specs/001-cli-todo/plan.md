# Implementation Plan: In-Memory Command-Line Todo Application

**Branch**: `001-cli-todo` | **Date**: 2025-12-27 | **Spec**: [specs/001-cli-todo/spec.md](../spec.md)
**Input**: Feature specification from `/specs/001-cli-todo/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan implements a Python-based CLI Todo application that manages tasks entirely in memory. The application provides core task management functionality (add, delete, update, list, complete) through a command-line interface with strict input validation, formatted output, and comprehensive error handling. The architecture follows the Evolution of Todo Constitution v1.1.0, prioritizing business logic decoupling, testability, and user experience.

## Technical Context

**Language/Version**: Python 3.13+ (per Constitution VI)
**Primary Dependencies**: None required for core functionality (Python standard library only)
**Storage**: In-memory dictionary (no persistence - per spec requirement)
**Testing**: pytest for unit/integration testing
**Target Platform**: Linux/macOS/Windows CLI
**Project Type**: Single project (CLI application)
**Performance Goals**: Handle 10,000+ tasks in memory with sub-100ms response times
**Constraints**:
- No external database or persistence layer
- All state lost on application exit (per spec)
- Single-user, single-session usage
- Standard library only (no external dependencies for Phase I)

**Scale/Scope**:
- Single user, local execution
- 1-10,000 tasks per session
- 7 CLI commands (add, delete, update, list, complete, help, exit)
- 20 functional requirements to implement

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: ✅ COMPLIANT - Business logic will be in `manager.py` (TaskManager class), decoupled from CLI interface in `main.py`
- [x] **II. AI-Native Interoperability**: ⚠️ **JUSTIFIED DEVIATION** - This is a CLI-only Phase I application. MCP tools will be added in Phase III (AI Agent integration). Current scope: CLI interface only.
- [x] **III. Strict Statelessness**: ✅ COMPLIANT - All state in memory, no session storage. State lost on exit (per spec). Will use in-memory dictionary for task storage.
- [x] **IV. Event-Driven Decoupling**: ⚠️ **NOT APPLICABLE** - Phase I CLI app has no async operations or microservices. Events will be relevant in Phase III+.
- [x] **V. Zero-Trust Multi-Tenancy**: ⚠️ **NOT APPLICABLE** - Single-user CLI application. Multi-tenancy applies to Phase II+ web app with user accounts.
- [x] **VI. Technology Stack**: ✅ COMPLIANT - Python 3.13+ only, standard library (no external dependencies)
- [x] **VII. Security**: ✅ COMPLIANT - Input validation, no hardcoded secrets, no external auth needed for CLI
- [x] **VIII. Observability**: ⚠️ **MINIMAL COMPLIANCE** - Structured output and error messages. Full observability (logging, metrics) deferred to Phase II+.

**Constitution Check Result**: ✅ **PASS** with documented justifications for Phase I scope limitations

**Justifications for Deviations**:
- **II, IV, V**: These principles target Phase II+ (web app) and Phase III+ (AI agents). Phase I is a standalone CLI tool.
- **VIII**: Full observability requires infrastructure (logging systems, metrics collectors) not relevant to a local CLI tool.

**Phase I Scope**: This implementation is explicitly Phase I of the Evolution of Todo system - a foundation layer that will be extended in later phases.

## Project Structure

### Documentation (this feature)

```text
specs/001-cli-todo/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/                        # Created with: uv init --package backend
├── pyproject.toml              # UV project configuration
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore rules
├── .python-version             # Python version specification
└── src/
    └── backend/
        ├── __init__.py         # Package initialization
        ├── main.py             # Entry point, CLI loop, command parsing
        ├── models.py           # Task dataclass definition
        ├── manager.py          # TaskManager class (business logic)
        └── commands.py         # Command handlers (presentation layer)

backend/
├── tests/
│   ├── unit/
│   │   ├── test_models.py         # Unit tests for Task dataclass
│   │   ├── test_manager.py        # Unit tests for TaskManager
│   │   └── test_commands.py       # Unit tests for command handlers
│   ├── integration/
│   │   └── test_cli_workflow.py   # End-to-end CLI workflow tests
│   └── fixtures/
│       └── sample_data.py         # Test data generators

docs/
├── architecture.md            # High-level architecture decisions
└── api_reference.md           # Command reference for users
```

**Structure Decision**: **Single project (CLI application)** - Selected because:
- Simple, focused scope (Phase I foundation)
- No external dependencies required
- Business logic (manager.py) decoupled from presentation (main.py, commands.py)
- Testable at all layers (unit, integration)
- Ready for Phase II extension (can be wrapped in FastAPI later)
- Follows Python package best practices with `uv` package manager

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations to justify** - Constitution Check passed with documented scope limitations for Phase I.

---

## Phase 0: Research & Clarification

**Purpose**: Resolve any technical uncertainties and establish best practices before implementation.

### Research Tasks

Based on Technical Context analysis, no major unknowns require research. All requirements are well-defined and use standard Python features.

**Research Summary**:
- **Decision**: Use Python standard library only (no external dependencies)
- **Rationale**: Spec explicitly requires "in-memory only, no persistence" and CLI interface
- **Alternatives Considered**:
  - SQLite (rejected: violates "no persistence" requirement)
  - External libraries like `rich` for formatting (rejected: keep dependencies minimal for Phase I)
  - `dataclasses` vs manual classes (chosen: dataclasses for clarity and type safety)

### Key Technical Decisions

1. **Data Storage**: In-memory dictionary with task_id as key
2. **Input Validation**: Built-in string methods and type checking
3. **Output Formatting**: Standard library `print()` with manual table formatting
4. **Error Handling**: Try-except blocks with user-friendly messages
5. **CLI Loop**: While loop with input parsing and command routing

**No unresolved clarifications needed.**

---

## Phase 1: Design & Architecture

**Purpose**: Create detailed design artifacts for implementation.

### 1.1 Data Model Design

**File**: `specs/001-cli-todo/data-model.md`

The data model defines the core entities and their relationships for the in-memory task management system.

**Key Entities**:
- **Task**: Represents a single todo item
  - `id: int` - Unique identifier (auto-incremented)
  - `title: str` - Task description (non-empty, trimmed)
  - `is_complete: bool` - Completion status (default: False)
  - `created_at: datetime` - Timestamp of creation

- **TaskManager**: Manages all tasks and business logic
  - `tasks: dict[int, Task]` - In-memory storage
  - `next_id: int` - Auto-increment counter
  - Methods: `add_task()`, `delete_task()`, `update_task()`, `list_tasks()`, `toggle_complete()`

### 1.2 API Contracts

**Directory**: `specs/001-cli-todo/contracts/`

Since this is a CLI application, contracts define command interfaces rather than HTTP endpoints:

**Command Contracts**:
- `add <title>` → Creates task, returns confirmation
- `delete <id>` → Removes task, returns confirmation/error
- `update <id> <new_title>` → Modifies task, returns old→new confirmation
- `list` → Returns formatted table of all tasks
- `complete <id>` → Toggles status, returns new status
- `help` → Returns command reference
- `exit` → Terminates application

**Error Contract**:
- All errors return user-friendly messages with actionable guidance
- Invalid input: "Usage: <command> <args>"
- Not found: "Task #<id> not found"
- Empty input: Silent re-prompt

### 1.3 Quickstart Guide

**File**: `specs/001-cli-todo/quickstart.md`

**Installation**:
```bash
cd backend
uv sync  # Install dependencies (none required for core)
uv run python -m backend.main  # Start application
```

**Basic Usage**:
```bash
todo> add Buy groceries
✓ Task #1 added: "Buy groceries"

todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [ ]    │ Buy groceries           │
└────┴────────┴─────────────────────────┘
Total: 1 tasks (0 complete, 1 pending)

todo> complete 1
✓ Task #1 marked as complete: "Buy groceries"

todo> exit
Goodbye! Your tasks have not been saved.
```

### 1.4 Agent Context Update

**Action**: Run `.specify/scripts/bash/update-agent-context.sh claude`

This will update the Claude agent context with:
- Python 3.13+ standard library patterns
- CLI application best practices
- In-memory data structure patterns
- Command parsing patterns

**Note**: No new external dependencies required for Phase I.

---

## Phase 2: Implementation Planning

**Purpose**: Define the implementation approach and identify any architectural decisions.

### Implementation Strategy

**Approach**: Test-Driven Development (TDD) following Red-Green-Refactor cycle

**Order of Implementation**:
1. **Data Layer** (`models.py`, `manager.py`) - Core business logic
2. **Command Layer** (`commands.py`) - User interaction handlers
3. **CLI Interface** (`main.py`) - Application entry point and loop
4. **Tests** - Unit tests for each layer, integration tests for workflows

### Key Architectural Decisions

**Decision 1: Layered Architecture**
- **Rationale**: Decouple business logic from presentation (Constitution I)
- **Structure**:
  - `models.py`: Pure data structures (Task dataclass)
  - `manager.py`: Business logic (TaskManager class)
  - `commands.py`: Presentation logic (command handlers)
  - `main.py`: Application orchestration (CLI loop)

**Decision 2: Standard Library Only**
- **Rationale**: Phase I requirement for minimal dependencies
- **Trade-off**: Manual table formatting vs external libraries
- **Benefit**: Zero setup, portable, educational value

**Decision 3: In-Memory Storage**
- **Rationale**: Explicit spec requirement for "no persistence"
- **Trade-off**: Data lost on exit vs database persistence
- **Benefit**: Simple implementation, no setup, fast performance

### ADR Triggers

📋 **Architectural decision detected**: Layered architecture with standard library only
- **Impact**: Long-term maintainability and extensibility
- **Alternatives**: Monolithic single-file approach, external dependencies
- **Scope**: Cross-cutting design pattern for entire application

**Recommendation**: Document this decision via ADR? Run `/sp.adr "CLI Layered Architecture"`
