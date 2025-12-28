# ADR-0001: CLI Layered Architecture

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2025-12-27
- **Feature:** 001-cli-todo
- **Context**: Phase I CLI Todo application requires a clean separation of concerns to enable testability, maintainability, and future extensibility. The application must support 7 commands (add, delete, update, list, complete, help, exit) with strict validation and formatted output. Constitution v1.1.0 Principle I mandates decoupling business logic from presentation layers.

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

**Architecture Pattern**: Four-layer separation with strict boundaries

- **Layer 1 - Data Models** (`models.py`): Pure data structures using Python dataclasses
  - `Task` dataclass with id, title, is_complete, created_at fields
  - No business logic, only type definitions and validation rules

- **Layer 2 - Business Logic** (`manager.py`): TaskManager class
  - Core operations: add_task(), delete_task(), update_task(), list_tasks(), toggle_complete()
  - O(1) dictionary-based storage: `tasks: dict[int, Task]`
  - State management: `next_id: int` for auto-incrementing IDs
  - Pure business logic, no user interaction

- **Layer 3 - Presentation** (`commands.py`): Command handlers
  - User-facing command implementations
  - Input parsing and validation
  - Formatted output (tables, success/error messages)
  - Error handling with user-friendly messages

- **Layer 4 - Orchestration** (`main.py`): CLI entry point
  - Main loop: read → parse → dispatch → display
  - Command routing and argument parsing
  - Welcome/goodbye messages
  - Exit handling

## Consequences

### Positive

- **Constitution I Compliance**: Business logic decoupled from presentation, enabling independent evolution
- **Testability**: Each layer can be tested in isolation (unit tests for manager, integration tests for commands)
- **Extensibility**: Ready for Phase II (FastAPI wrapper) - manager.py can be reused without changes
- **Maintainability**: Clear separation makes debugging and feature addition straightforward
- **Independent Evolution**: CLI can be replaced with web UI without touching business logic
- **Type Safety**: Dataclass-based models provide clear contracts between layers

### Negative

- **File Overhead**: 4 separate files instead of 1 monolithic file (more files to manage)
- **Import Dependencies**: Layers must import each other, creating coupling points
- **Initial Complexity**: More structure required upfront vs. simple script approach
- **Learning Curve**: New contributors must understand layer boundaries and responsibilities

## Alternatives Considered

### Alternative A: Monolithic Single-File Approach
- **Structure**: All code in one `main.py` file with functions
- **Rationale**: Simpler for small scripts, fewer files, easier to understand at a glance
- **Why Rejected**:
  - Violates Constitution I (tight coupling of logic and presentation)
  - Difficult to test individual components
  - Harder to extend for Phase II (no clean separation for FastAPI wrapper)
  - Becomes unwieldy as features grow

### Alternative B: MVC Pattern
- **Structure**: Model (Task), View (CLI output), Controller (command handlers)
- **Rationale**: Familiar pattern, separates data, presentation, and control flow
- **Why Rejected**:
  - MVC is optimized for web UIs, not CLI applications
  - "View" layer doesn't map cleanly to CLI output formatting
  - Layered architecture is more natural for CLI (orchestration → presentation → logic → data)
  - Less intuitive for Python CLI development

### Alternative C: Object-Oriented with Task Methods
- **Structure**: Task class with methods like task.add(), task.delete()
- **Rationale**: Encapsulates behavior with data
- **Why Rejected**:
  - Doesn't scale well for bulk operations (list all tasks)
  - Violates single responsibility principle
  - TaskManager pattern provides cleaner separation

## References

- Feature Spec: [specs/001-cli-todo/spec.md](../specs/001-cli-todo/spec.md)
- Implementation Plan: [specs/001-cli-todo/plan.md](../specs/001-cli-todo/plan.md)
- Research: [specs/001-cli-todo/research.md](../specs/001-cli-todo/research.md)
- Related ADRs: None (first ADR for this feature)
- Evaluator Evidence: [history/prompts/001-cli-todo/0002-create-cli-todo-plan.plan.prompt.md](../history/prompts/001-cli-todo/0002-create-cli-todo-plan.plan.prompt.md) - Constitution Check PASS
