# ADR-0002: In-Memory Storage with Standard Library

> **Scope**: Document decision clusters, not individual technology choices. Group related decisions that work together (e.g., "Frontend Stack" not separate ADRs for framework, styling, deployment).

- **Status:** Accepted
- **Date:** 2025-12-27
- **Feature:** 001-cli-todo
- **Context**: Phase I specification explicitly requires "in-memory only, no persistence" for the CLI Todo application. The application must provide fast task operations without external dependencies. Constitution v1.1.0 Principle VI mandates Python 3.13+ with minimal technology stack. This decision cluster combines storage strategy (in-memory) with technology constraint (standard library only).

<!-- Significance checklist (ALL must be true to justify this ADR)
     1) Impact: Long-term consequence for architecture/platform/security?
     2) Alternatives: Multiple viable options considered with tradeoffs?
     3) Scope: Cross-cutting concern (not an isolated detail)?
     If any are false, prefer capturing as a PHR note instead of an ADR. -->

## Decision

**Storage Strategy**: In-memory dictionary with zero persistence

- **Data Structure**: `dict[int, Task]` with O(1) lookup by task ID
- **State Management**: `next_id: int` counter for auto-incrementing IDs
- **Session Lifetime**: State exists only during application runtime
- **Persistence**: None - all data lost on exit (per spec requirement)

**Technology Stack**: Python 3.13+ Standard Library Only

- **Language**: Python 3.13+ (Constitution VI requirement)
- **Dependencies**: Zero external packages
- **Data Structures**: Built-in `dict`, `dataclasses`, `datetime`
- **Validation**: Standard string methods (`strip()`, `len()`) and type checking
- **Output**: Manual table formatting using `print()` and string manipulation

**Implementation Details**:
- `tasks: dict[int, Task] = {}` - Main storage
- `next_id: int = 1` - ID counter
- `@dataclass` for Task model (type safety, clarity)
- `datetime.now()` for timestamps

## Consequences

### Positive

- **Zero Setup**: No installation, configuration, or database setup required
- **Instant Performance**: All operations <1ms (dictionary O(1) operations)
- **Portability**: Runs anywhere Python 3.13+ is installed
- **Educational Value**: Demonstrates fundamental data structures and algorithms
- **Constitution VI Compliance**: Minimal technology stack, no dependencies
- **Spec Compliance**: Meets "in-memory only, no persistence" requirement
- **Development Speed**: No external tooling or infrastructure to learn
- **Security**: No secrets, credentials, or external connections required

### Negative

- **Data Loss**: All tasks lost on application exit (by design)
- **No Multi-Session**: Cannot resume work from previous sessions
- **Memory Limits**: Limited by system RAM (though 10k tasks = ~1MB)
- **No Concurrent Access**: Single-user, single-session only
- **Manual Formatting**: No external libraries for pretty tables
- **Reinventing Wheels**: Building validation/formatting that libraries provide
- **User Expectations**: Users may expect persistence (need clear communication)

## Alternatives Considered

### Alternative A: SQLite Database (File-based Persistence)
- **Structure**: SQLite file with SQLModel/SQLAlchemy ORM
- **Rationale**: Persistent storage, relational queries, data safety
- **Why Rejected**:
  - Violates spec requirement "in-memory only, no persistence"
  - Adds dependencies (sqlite3 driver, ORM)
  - Requires schema migration setup
  - Overkill for Phase I scope (will be added in Phase II)

### Alternative B: External Libraries (Rich, Typer, Pydantic)
- **Structure**: `rich` for tables, `typer` for CLI, `pydantic` for validation
- **Rationale**: Professional UX, less boilerplate, better error messages
- **Why Rejected**:
  - Violates Constitution VI (minimal dependencies)
  - Adds installation friction for users
  - Not essential for Phase I MVP
  - Can be added in Phase II+ if needed

### Alternative C: JSON File Persistence
- **Structure**: Tasks saved to `tasks.json` on exit, loaded on start
- **Rationale**: Simple persistence without full database
- **Why Rejected**:
  - Violates "no persistence" spec requirement
  - Adds file I/O complexity (error handling, file permissions)
  - Requires serialization/deserialization logic
  - Scope creep for Phase I (will be Phase II feature)

### Alternative D: List-based Storage
- **Structure**: `list[Task]` with linear search for operations
- **Rationale**: Simpler data structure, natural ordering
- **Why Rejected**:
  - O(n) lookup for delete/update/complete operations
  - Performance degrades with task count
  - Dictionary provides O(1) lookup by ID (required for efficiency)

## References

- Feature Spec: [specs/001-cli-todo/spec.md](../specs/001-cli-todo/spec.md) - Section 1.2 (Storage Requirements)
- Implementation Plan: [specs/001-cli-todo/plan.md](../specs/001-cli-todo/plan.md) - Technical Context
- Research: [specs/001-cli-todo/research.md](../specs/001-cli-todo/research.md) - Sections 1 & 2
- Constitution: [.specify/memory/constitution.md](../.specify/memory/constitution.md) - Principle VI (Technology Stack)
- Related ADRs: [ADR-0001](0001-cli-layered-architecture.md) (Layered Architecture)
- Evaluator Evidence: [history/prompts/001-cli-todo/0002-create-cli-todo-plan.plan.prompt.md](../history/prompts/001-cli-todo/0002-create-cli-todo-plan.plan.prompt.md) - Constitution Check PASS
