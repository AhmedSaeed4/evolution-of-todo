# Implementation Plan: Menu-Driven CLI Interface

**Branch**: `002-cli-ui-update` | **Date**: 2025-12-28 | **Spec**: [specs/002-cli-ui-update/spec.md](../spec.md)
**Input**: Feature specification from `/specs/002-cli-ui-update/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace the CLI command-line interface (`todo> add Buy groceries`) with a menu-driven interface (select option 1, then enter title). This is a presentation layer change that preserves all existing business logic, command handlers, and in-memory storage. The new interface will display a numbered menu (1-7) with clear labels for all operations, provide input validation with retry logic, and pause after each operation for user confirmation.

## Technical Context

**Language/Version**: Python 3.13+ (per Constitution VI)
**Primary Dependencies**: Python standard library only (no new dependencies)
**Storage**: In-memory dictionary (no persistence changes - per spec requirement)
**Testing**: pytest (existing test framework)
**Target Platform**: CLI/Terminal application
**Project Type**: CLI application (single project structure)
**Performance Goals**: Maintain CLI performance parity (list 10k tasks < 2 seconds)
**Constraints**: No new dependencies, preserve existing handler functions, maintain in-memory state
**Scale/Scope**: Single-user CLI tool with 7 operations (add, list, complete, update, delete, help, exit)

**Key Technical Decisions**:
- **Architecture**: Presentation layer only - menu interface wraps existing command handlers
- **State Management**: Unchanged - in-memory TaskManager
- **Validation**: Input validation moved from CLI parser to menu prompts
- **Error Handling**: Graceful handling of EOF, Ctrl+C, invalid inputs with retry logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- ✅ **I. Universal Logic Decoupling**: Business logic decoupled from presentation layer
  - Command handlers (`add_task_handler`, etc.) remain unchanged
  - Menu interface (`menu.py`) only handles presentation and input collection
  - No business logic in menu layer

- ✅ **II. AI-Native Interoperability**: MCP tools defined with strict typing
  - **APPLIES TO PHASE II**: This is a CLI-only feature (Phase I)
  - MCP tools will be defined in Phase II when web interface is added
  - Current work: CLI presentation layer only

- ✅ **III. Strict Statelessness**: No in-memory session storage, all state persisted
  - State remains in TaskManager (in-memory per spec)
  - No session state introduced
  - Menu loop is stateless between operations

- ✅ **IV. Event-Driven Decoupling**: Async operations use event streams (not direct HTTP)
  - **NOT APPLICABLE**: This is a synchronous CLI application
  - Event-driven architecture applies to Phase II/III (web/agent interfaces)

- ✅ **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id
  - **NOT APPLICABLE**: Single-user CLI application
  - Multi-tenancy will be enforced in Phase II when user accounts are added

- ✅ **VI. Technology Stack**: Authorized libraries only (Python 3.13+, FastAPI, SQLModel, etc.)
  - Uses only Python standard library (no new dependencies)
  - No FastAPI/SQLModel needed for CLI-only feature
  - Compliant with Constitution VI

- ✅ **VII. Security**: JWT validation, input validation, no hardcoded secrets
  - Input validation implemented in menu prompts (reject empty titles, non-numeric IDs)
  - No secrets involved (in-memory only)
  - **APPLIES TO PHASE II**: JWT validation for web/agent interfaces

- ✅ **VIII. Observability**: Structured logging, metrics, audit trail requirements met
  - **NOT APPLICABLE**: CLI application with print statements
  - Observability requirements apply to Phase II/III services
  - Current: User-facing console output only

**GATE STATUS**: ✅ **ALL CHECKS PASS** - No violations requiring justification

**Constitution Alignment Notes**:
- Phases II/III will implement MCP tools, JWT auth, event streams, and observability
- This Phase I CLI feature is compliant as a presentation layer change only
- All constitution principles are preserved for future phases

## Architecture Decision Records (ADRs)

📋 **Architectural decision detected**: Menu interface wraps existing command handlers without modification
**Document reasoning and tradeoffs?** Run `/sp.adr "Menu Interface Handler Wrapping"`

📋 **Architectural decision detected**: Input validation moved from CLI parser to menu prompts
**Document reasoning and tradeoffs?** Run `/sp.adr "Menu Layer Input Validation"`

📋 **Architectural decision detected**: Pause-after-operation UX pattern for CLI
**Document reasoning and tradeoffs?** Run `/sp.adr "CLI Operation Pause Pattern"`
