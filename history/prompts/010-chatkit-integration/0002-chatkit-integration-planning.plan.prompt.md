---
id: "0002"
title: "ChatKit Integration Planning"
stage: "plan"
date: "2026-01-16"
surface: "agent"
model: "claude-sonnet-4-5"
feature: "010-chatkit-integration"
branch: "010-chatkit-integration"
user: "user"
command: "/sp.plan"
labels: ["chatkit", "integration", "planning", "architecture"]
links:
  spec: "specs/010-chatkit-integration/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "specs/010-chatkit-integration/plan.md"
  - "specs/010-chatkit-integration/research.md"
  - "specs/010-chatkit-integration/data-model.md"
  - "specs/010-chatkit-integration/quickstart.md"
  - "specs/010-chatkit-integration/contracts/openapi.yaml"
  - "specs/010-chatkit-integration/contracts/graphql-schema.graphql"
  - "specs/010-chatkit-integration/contracts/store-interface.py"
tests:
  - "Constitution compliance check: PASSED"
  - "Technology stack validation: COMPLETED"
  - "Integration architecture design: COMPLETED"
---

## Prompt

# Implementation Plan: ChatKit Integration with OpenAI Agents SDK & MCP Tools


## Summary

Integrate OpenAI ChatKit frontend components with existing Phase-3 backend that features OpenAI Agents SDK (Xiaomi mimo-v2-flash) and 7 MCP task management tools. Replace custom chat interface with production-ready ChatKit UI, add streaming responses, persistent chat history, and tool visualization while maintaining user isolation and existing functionality.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x, React 19.2.3, Next.js 16.1.1 (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, OpenAI ChatKit React, Better Auth, SQLModel, Neon PostgreSQL
**Storage**: Neon PostgreSQL (serverless) - extending existing schema for chat persistence
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web (Next.js App Router), Modern browsers with streaming support
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <2s message send/receive, <1s interface loading, <200KB bundle increase
**Constraints**: Zero breaking changes to existing API, maintain user isolation, preserve existing functionality
**Scale/Scope**: Single user per session, 7 MCP tools with streaming visualization, ChatKit handles all UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: Business logic decoupled from presentation layer ✅
  - Backend agents remain independent of frontend ChatKit UI
  - MCP tools remain backend-only, exposed via streaming responses

- [x] **II. AI-Native Interoperability**: MCP tools defined with strict typing ✅
  - Existing 7 MCP tools maintain strict typing and user isolation
  - ChatKit will visualize tool execution without modifying tool definitions

- [x] **III. Strict Statelessness**: No in-memory session storage, all state persisted ✅
  - ChatKit sessions will be persisted to PostgreSQL (extending existing schema)
  - JWT tokens maintain stateless authentication

- [x] **IV. Event-Driven Decoupling**: Async operations use event streams ✅
  - Implement Server-Sent Events (SSE) for streaming responses
  - Maintain existing async FastAPI architecture

- [x] **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id ✅
  - Chat sessions and messages scoped to user_id from JWT
  - Existing user isolation patterns extended to chat data

- [x] **VI. Technology Stack**: Authorized libraries only ✅
  - Frontend: Next.js 16.1.1, React 19.2.3, OpenAI ChatKit (authorized)
  - Backend: Python 3.13+, FastAPI, OpenAI Agents SDK (existing)
  - Database: Neon PostgreSQL (existing)

- [x] **VII. Security**: JWT validation, input validation, no hardcoded secrets ✅
  - ChatKit integration uses existing Better Auth JWT validation
  - Input validation maintained from existing backend
  - No new secrets required

- [x] **VIII. Observability**: Structured logging, metrics, audit trail requirements met ✅
  - Extend existing logging to include chat sessions and streaming events
  - Add metrics for ChatKit performance and tool execution

**Constitution Status**: ✅ **PASSED** - All gates met, no violations requiring justification.

## Response snapshot

Successfully completed comprehensive planning for ChatKit integration with Phase-3 backend. Created detailed implementation plan covering:

**Key Achievements:**
- ✅ Constitution compliance verified (all 8 principles met)
- ✅ Technology stack validated and authorized
- ✅ Research completed on ChatKit integration requirements
- ✅ Database schema designed with user isolation
- ✅ API contracts defined (OpenAPI, GraphQL, Store interface)
- ✅ Architecture designed for streaming and authentication
- ✅ QuickStart guide created with step-by-step implementation
- ✅ Risk assessment and mitigation strategies documented

**Technical Decisions Made:**
1. Use OpenAI ChatKit for frontend UI (production-ready)
2. Implement SSE for streaming responses
3. Extend PostgreSQL with chat_sessions and chat_messages tables
4. Bridge Better Auth JWT with OpenAI session management
5. Adapt existing MCP tools for ChatKit visualization

**Deliverables Created:**
- `/specs/010-chatkit-integration/plan.md` - Complete implementation plan
- `/specs/010-chatkit-integration/research.md` - Phase 0 research findings
- `/specs/010-chatkit-integration/data-model.md` - Database schema and API contracts
- `/specs/010-chatkit-integration/quickstart.md` - Step-by-step implementation guide
- `/specs/010-chatkit-integration/contracts/` - API specifications and interfaces

**Next Steps Ready:**
- Phase 2: Implementation (backend Store + frontend integration)
- Phase 3: Testing and validation
- Phase 4: Deployment and monitoring

## Outcome

- ✅ Impact: High - Comprehensive implementation plan created for ChatKit integration with existing Phase-3 backend. All constitutional gates passed, technology validated, and detailed architecture designed for production deployment.
- 🧪 Tests: Constitution compliance check: PASSED, Technology stack validation: COMPLETED, Integration architecture design: COMPLETED
- 📁 Files: 7 new specification files created covering complete implementation lifecycle from research through deployment
- 🔁 Next prompts: /sp.tasks (to generate actionable implementation tasks), /sp.adr (for architectural decisions if needed)
- 🧠 Reflection: Successfully balanced complexity vs. functionality by leveraging ChatKit's built-in UI components instead of building custom ones. Key insight: OpenAI API key required even for non-OpenAI providers due to ChatKit's session management architecture.

## Evaluation notes (flywheel)

- Failure modes observed: None - All constitutional requirements met without violations
- Graders run and results (PASS/FAIL): Constitution Check: PASS, Technology Validation: PASS, Architecture Design: PASS
- Prompt variant (if applicable): N/A - Standard planning workflow executed successfully
- Next experiment: Generate implementation tasks via /sp.tasks command to break down the 5-phase plan into actionable development tasks
