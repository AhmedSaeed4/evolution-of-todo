<!--
SYNC IMPACT REPORT: Constitution v1.0.0 → v1.1.0
Version change: 1.0.0 → 1.1.0 (MINOR: Added explicit ADR governance, compliance validation)
Modified principles:
  - I. Universal Logic Decoupling (unchanged)
  - II. AI-Native Interoperability (unchanged)
  - III. Strict Statelessness (unchanged)
  - IV. Event-Driven Decoupling (unchanged)
  - V. Zero-Trust Multi-Tenancy (unchanged)
Added sections:
  - II.B. Natural Language Interface Standards (new)
  - III.B. Data Consistency & Schema (moved from Technical Standards)
  - IV.B. Event Schema Standards (new)
  - V.B. Authentication & Authorization (expanded)
  - VI. Technical Standards & Constraints (consolidated)
  - VII. Operational Standards (expanded)
  - VIII. Compliance & Review (new)
Updated templates:
  - ✅ .specify/templates/plan-template.md (Constitution Check section)
  - ✅ .specify/templates/spec-template.md (Requirements alignment)
  - ✅ .specify/templates/tasks-template.md (Task categorization)
  - ✅ .specify/templates/phr-template.prompt.md (no changes needed)
Follow-up TODOs: None
-->

# Evolution of Todo Constitution

## Core Principles

### I. Universal Logic Decoupling
**Business logic MUST remain independent of the presentation layer.**
The core Todo management logic (CRUD, state transitions) MUST reside in a dedicated service layer or module, decoupled from the interface (CLI, REST API, or Chatbot). This ensures that the same logic powers the Phase I Console, the Phase II Web App, and the Phase III AI Agent without duplication or drift. Services MUST be testable in isolation without interface dependencies.

### II. AI-Native Interoperability (MCP-First)
**The system is architected for AI Agents as primary users.**
All core functionalities MUST be exposed via the **Model Context Protocol (MCP)**. Tools exposed to Agents MUST be stateless, strictly typed, and idempotent where possible. The system MUST support natural language processing by providing clear, distinct tool definitions (e.g., `add_task`, `list_tasks`) that map directly to business logic.

#### II.B. Natural Language Interface Standards
**MCP tool definitions MUST be self-documenting and discoverable.**
Each MCP tool MUST include:
- Clear description of purpose and side effects
- Strictly typed parameters using Pydantic schemas
- Idempotency guarantees where applicable
- Error taxonomy with actionable messages
- Rate limiting and resource constraints documented

### III. Strict Statelessness
**Application services MUST be ephemeral and horizontally scalable.**
The backend (FastAPI) and AI Agents MUST never store conversation state or session data in local memory. All state MUST be persisted immediately to the database (Neon PostgreSQL) or the Event Bus (Kafka). This ensures the system can survive pod restarts in Kubernetes (Phase IV) and scale across multiple nodes (Phase V).

#### III.B. Data Consistency & Schema
**Strict static typing is mandatory across the stack.**
- Python: Type Hints (`typing` module) and Pydantic models for all boundaries
- Frontend: TypeScript interfaces for all data structures
- Validation: All inputs validated at API boundary using Pydantic before business logic
- Persistence: Database schemas defined via SQLModel code-first approaches
- Transactions: All state changes wrapped in ACID transactions

### IV. Event-Driven Decoupling
**Asynchronous communication takes precedence over direct coupling.**
For advanced features (Reminders, Auditing, Recurring Tasks), services MUST communicate via **Event Streams** (Kafka/Redpanda) abstracted through **Dapr Pub/Sub**. Direct synchronous HTTP calls between microservices are prohibited for non-critical path operations to prevent cascading failures.

#### IV.B. Event Schema Standards
**Events MUST be versioned and backward compatible.**
- Event format: `domain.entity.action.v{version}`
- All events MUST include: `event_id`, `timestamp`, `user_id`, `correlation_id`
- Schema evolution: Use additive changes only (MAJOR version bump for breaking changes)
- Event retention: 90 days minimum for audit trail
- Dead letter queue: Required for all event subscriptions

### V. Zero-Trust Multi-Tenancy
**Data isolation is enforced at the query level.**
Every database query and API response MUST be scoped to the authenticated `user_id`. The system MUST enforce "Row Level Security" logic in the application layer, ensuring no user can access, modify, or delete another user's tasks. Authentication tokens (JWT) MUST be validated on every request.

#### V.B. Authentication & Authorization
**JWT-based authentication with strict scope validation.**
- Token validation: Required on every API request and MCP tool call
- Scope enforcement: Fine-grained permissions per tool/action
- Token refresh: Automatic with sliding expiration
- Audit logging: All authentication events logged
- Zero session state: No server-side session storage

## Technical Standards & Constraints

### Technology Stack Integrity
The project MUST strictly adhere to the defined Agentic Dev Stack. No unauthorized libraries may be introduced.
*   **Backend:** Python 3.13+, FastAPI, SQLModel.
*   **Frontend:** Next.js 16+ (App Router), TypeScript, Tailwind CSS.
*   **Database:** Neon Serverless PostgreSQL (via SQLModel/SQLAlchemy).
*   **AI/Agents:** OpenAI Agents SDK, Official MCP SDK, OpenAI ChatKit.
*   **Infrastructure:** Docker, Kubernetes (Minikube/DOKS), Helm, Dapr, Kafka (Redpanda).

### Security Protocols
*   **Authentication:** Better Auth with JWT strategy.
*   **Secrets:** No hardcoded credentials. Secrets MUST be loaded from environment variables or (in later phases) Kubernetes/Dapr Secret Stores.
*   **Communication:** Internal service-to-service communication in Phase V MUST use mTLS (managed by Dapr sidecars).
*   **Input Validation:** All external inputs validated using Pydantic schemas with strict mode enabled.
*   **SQL Injection Prevention:** Parameterized queries only; no string concatenation in SQL.

## Operational Standards

### Observability & Auditing
Every state-changing operation (Create, Update, Delete) MUST be logged. In Phase V, these operations MUST emit distinct events (e.g., `task-created`, `task-completed`) to the Audit topic in Kafka, enabling a reconstructible history of user actions.

**Required telemetry:**
- Structured logging (JSON) with correlation IDs
- Request tracing across service boundaries
- Metrics: request count, latency (p50, p95, p99), error rates
- Audit trail: All CRUD operations with user_id and timestamp

### Deployment Portability
The application MUST be container-native. Configuration MUST be injected via Environment Variables, allowing the same container image to run in Local Docker, Minikube, and Cloud Kubernetes without modification.

**Configuration standards:**
- 12-factor app compliance
- Environment-based config (dev/staging/prod)
- Feature flags for gradual rollouts
- Health check endpoints for all services
- Graceful shutdown handling

## Compliance & Review

### Constitution Check Gates
**All implementation work MUST pass constitution compliance before merge.**

**Pre-implementation checklist:**
- [ ] Logic layer decoupled from presentation
- [ ] MCP tools defined with strict typing
- [ ] Statelessness verified (no in-memory sessions)
- [ ] Event-driven patterns for async operations
- [ ] Multi-tenancy enforced at query level
- [ ] Stack compliance (no unauthorized dependencies)
- [ ] Security protocols implemented
- [ ] Observability requirements met

**Post-implementation validation:**
- [ ] All user stories from spec.md independently testable
- [ ] Constitution Check section in plan.md completed
- [ ] Tasks organized by user story (per tasks-template.md)
- [ ] ADRs created for significant decisions
- [ ] PHR generated for this work

### Amendment Procedure
**Constitution amendments follow semantic versioning:**
- **MAJOR (X.0.0):** Backward incompatible governance changes, principle removals
- **MINOR (1.X.0):** New principles or materially expanded guidance
- **PATCH (1.0.X):** Clarifications, wording fixes, non-semantic refinements

**Amendment process:**
1. Propose change with rationale and impact analysis
2. Update version per semantic rules
3. Update LAST_AMENDED_DATE
4. Run consistency check across all templates
5. Create ADR for significant changes
6. Update PHR with amendment details
7. Get architect approval before merge

### Architectural Decision Records (ADR)
**Significant decisions MUST be documented via ADR.**

**Decision significance test (ALL must be true):**
- **Impact:** Long-term consequences (framework, data model, API, security, platform)
- **Alternatives:** Multiple viable options considered
- **Scope:** Cross-cutting and influences system design

**When triggered:** During `/sp.plan` and `/sp.tasks` execution
**Action:** Suggest "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`."
**Requirement:** Wait for user consent; never auto-create ADRs

### Quality Gates & Validation
**Definition of Done for all work:**
- ✅ Code follows constitution principles
- ✅ Type checking passes (mypy for Python, TypeScript for frontend)
- ✅ Tests pass (unit, integration, contract)
- ✅ Security scan clean
- ✅ Performance budgets met
- ✅ Documentation updated
- ✅ PHR created for the work
- ✅ ADR created if decision is significant

**Validation requirements:**
- All user stories independently testable
- Constitution Check in plan.md: 100% compliance or documented justification
- Tasks organized by user story priority
- No hardcoded secrets or tokens
- Event schemas versioned and backward compatible

## Governance

### Architectural Supremacy
This Constitution defines the hard constraints of the "Evolution of Todo" system. In the event of a conflict between a specific Spec requirement and these Principles (e.g., a spec asking for in-memory session storage), this Constitution takes precedence (requiring DB persistence), and the Spec MUST be corrected.

### Versioning Policy
**Constitution version MUST be referenced in all related artifacts:**
- Plan.md: "Constitution vX.Y.Z compliance verified"
- Spec.md: "Aligned with Constitution vX.Y.Z"
- Tasks.md: "Constitution vX.Y.Z gates passed"

### Compliance Review
**All PRs/reviews MUST verify constitution compliance.**
- Complexity MUST be justified with documented trade-offs
- Deviations require explicit ADR with architect approval
- Use `.specify/memory/constitution.md` as the single source of truth
- Runtime guidance available in `CLAUDE.md` for agent-specific workflows

**Version**: 1.1.0 | **Ratified**: 2025-12-01 | **Last Amended**: 2025-12-27
