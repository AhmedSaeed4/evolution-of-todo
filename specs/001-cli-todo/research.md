# Research: CLI Todo Application Architecture

**Feature**: `001-cli-todo`
**Date**: 2025-12-27
**Constitution**: v1.1.0

## Executive Summary

This research document captures technical decisions and rationale for the Phase I CLI Todo application. All requirements are well-defined with no major technical unknowns.

## Research Areas

### 1. Technology Stack Selection

**Question**: What technologies should be used for Phase I CLI application?

**Findings**:
- **Language**: Python 3.13+ (per Constitution VI)
- **Dependencies**: None required for core functionality
- **Package Manager**: `uv` (per project standards)
- **External Libraries**: Not needed (standard library sufficient)

**Decision**: Python standard library only
**Rationale**:
- Spec explicitly requires "in-memory only, no persistence"
- CLI interface doesn't require web frameworks
- Zero dependencies = zero setup friction
- Educational value (understanding fundamentals)

**Alternatives Considered**:
- ❌ `rich` library for formatting (rejected: adds dependency for minor benefit)
- ❌ `typer` for CLI (rejected: overkill for simple command parsing)
- ❌ `pydantic` for validation (rejected: built-in validation sufficient)

### 2. Data Storage Strategy

**Question**: How to store tasks in memory?

**Findings**:
- **Option A**: List of dictionaries
- **Option B**: Dictionary with ID keys
- **Option C**: Custom class with internal storage

**Decision**: Dictionary with ID keys
**Rationale**:
- O(1) lookup by ID (required for delete, update, complete)
- Natural mapping: task_id → Task object
- Simple iteration for list operations
- Easy to understand and maintain

**Implementation**:
```python
tasks: dict[int, Task] = {}
next_id: int = 1
```

**Alternatives Considered**:
- ❌ List storage: O(n) lookup for ID-based operations
- ❌ Set storage: No ordering, no ID mapping

### 3. Architecture Pattern

**Question**: How to structure the codebase?

**Findings**:
- **Option A**: Monolithic single file
- **Option B**: Layered architecture
- **Option C**: MVC pattern

**Decision**: Layered architecture (Constitution I compliant)
**Rationale**:
- Decouples business logic from presentation
- Enables independent testing
- Ready for Phase II (FastAPI wrapper)
- Follows SDD principles

**Structure**:
```
models.py      → Data structures (Task)
manager.py     → Business logic (TaskManager)
commands.py    → Presentation (CLI handlers)
main.py        → Orchestration (CLI loop)
```

**Benefits**:
- `models.py`: Pure data, no logic
- `manager.py`: Testable business logic
- `commands.py`: User interaction layer
- `main.py`: Application entry point

### 4. Input Validation Strategy

**Question**: How to validate user input?

**Findings**:
- **Title validation**: `str.strip()` + `len() > 0`
- **ID validation**: `try/except` + `int() > 0`
- **Command validation**: Dictionary lookup

**Decision**: Multi-layer validation
**Rationale**:
- Defense in depth
- Clear error messages at each layer
- User-friendly feedback

**Layers**:
1. **Command parser**: Unknown commands
2. **Argument validation**: Missing/invalid arguments
3. **Business validation**: Title non-empty, ID exists

### 5. Output Formatting

**Question**: How to display tasks in a formatted table?

**Findings**:
- **Option A**: External library (`rich`, `tabulate`)
- **Option B**: Manual string formatting
- **Option C**: Simple list view

**Decision**: Manual table formatting with standard library
**Rationale**:
- No external dependencies
- Full control over format
- Educational value
- Performance acceptable for 10k tasks

**Implementation**:
- Calculate column widths dynamically
- Use box-drawing characters for borders
- Align columns properly
- Handle edge cases (empty list, long titles)

**Trade-offs**:
- ✅ Zero dependencies
- ✅ Customizable
- ❌ More code than library
- ❌ Manual testing needed

### 6. Error Handling Strategy

**Question**: How to handle errors gracefully?

**Findings**:
- **Input errors**: Usage hints
- **Business errors**: Descriptive messages
- **System errors**: Rare, handled defensively

**Decision**: User-friendly error messages
**Rationale**:
- CLI users need clear guidance
- Self-service error recovery
- Professional user experience

**Error Types**:
1. **Usage errors**: "Usage: add <title>"
2. **Validation errors**: "Invalid ID. Please enter a number."
3. **Business errors**: "Task #99 not found."
4. **System errors**: "System error: Please restart"

**Pattern**: `✗ Error: <message>` for errors, `✓ <message>` for success

### 7. Testing Strategy

**Question**: How to ensure code quality?

**Findings**:
- **Unit tests**: Each layer independently
- **Integration tests**: End-to-end workflows
- **Acceptance tests**: Spec scenarios

**Decision**: Test-Driven Development (TDD)
**Rationale**:
- Reduces bugs
- Documents behavior
- Enables refactoring
- Required by SDD principles

**Coverage targets**:
- 100% command handlers
- 100% error paths
- All acceptance scenarios

### 8. Performance Considerations

**Question**: What are the performance characteristics?

**Findings**:
- **Add/Delete/Update/Complete**: O(1) - dictionary operations
- **List**: O(n log n) - sorting (n ≤ 10,000, negligible)
- **Memory**: ~100 bytes per task
- **10,000 tasks**: ~1MB memory, <100ms operations

**Decision**: Performance is not a constraint
**Rationale**:
- All operations are instant for practical purposes
- Memory usage is minimal
- No network/database latency
- Python standard library is fast enough

**Targets** (easily met):
- Operations: <10ms
- Memory: <10MB for 10k tasks
- Startup: <100ms

### 9. Extensibility Planning

**Question**: How to prepare for Phase II+?

**Findings**:
- **Phase II**: Wrap manager.py in FastAPI
- **Phase III**: Expose manager methods as MCP tools
- **Phase IV**: Add event sourcing
- **Phase V**: Distributed with Kafka

**Decision**: Clean separation enables extension
**Rationale**:
- manager.py is Phase I ready
- manager.py is Phase II+ ready (no changes needed)
- CLI can be replaced without touching business logic
- Business logic can be extended without breaking CLI

**Migration Path**:
- Phase I: CLI + manager.py
- Phase II: FastAPI + manager.py + CLI (optional)
- Phase III: MCP tools + manager.py
- Phase IV: Event-driven + manager.py + event store
- Phase V: Distributed + manager.py + Kafka

### 10. Constitution Compliance

**Question**: How does this align with Constitution v1.1.0?

**Findings**:
- ✅ **I. Universal Logic Decoupling**: manager.py decoupled from CLI
- ⚠️ **II. AI-Native Interoperability**: Deferred to Phase III (CLI only now)
- ✅ **III. Strict Statelessness**: In-memory only, no persistence
- ⚠️ **IV. Event-Driven Decoupling**: Not applicable to CLI
- ⚠️ **V. Zero-Trust Multi-Tenancy**: Not applicable to single-user CLI
- ✅ **VI. Technology Stack**: Python 3.13+ only
- ✅ **VII. Security**: Input validation, no secrets
- ⚠️ **VIII. Observability**: Minimal (structured output only)

**Compliance**: ✅ **PASS** with documented scope limitations

**Rationale for deviations**:
- Principles II, IV, V target Phase II+ (web/agent/multi-tenant)
- Phase I is explicitly a foundation layer
- All principles will be fully applied in later phases

## Summary of Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| **Stack** | Python stdlib only | Zero dependencies, per spec |
| **Storage** | dict[int, Task] | O(1) lookup, simple |
| **Architecture** | Layered (models/manager/commands/main) | Constitution I, extensible |
| **Validation** | Multi-layer defense in depth | Clear errors, user-friendly |
| **Formatting** | Manual table formatting | No dependencies, full control |
| **Errors** | User-friendly messages | Self-service recovery |
| **Testing** | TDD, 100% coverage | Quality, documentation |
| **Performance** | Not a constraint | All operations instant |
| **Extensibility** | Clean separation | Phase II+ ready |
| **Constitution** | Phase I scope | Compliant with justifications |

## Conclusion

No major technical unknowns or research gaps identified. All decisions are straightforward and align with:
- Specification requirements
- Constitution principles (with Phase I scope)
- Python best practices
- SDD methodology

**Ready for implementation.**