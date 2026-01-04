---
id: 0002
title: Better Auth Server Implementation Plan
stage: plan
date: 2025-12-30
surface: agent
model: claude-opus-4-5-20251101
feature: 005-user-auth
branch: 005-user-auth
user: user
command: /sp.plan # Implementation Plan: Better Auth Server Integration


## Summary

This plan implements a Better Auth Server within the Next.js frontend application to enable real user authentication. The server will handle user registration, login, logout, and session management, persisting all data to the shared Neon PostgreSQL database.

**Key Approach**: Add Better Auth server configuration and API route handler. The existing client-side auth code (hooks, UI) requires no changes — it already calls Better Auth methods that will now have a server to respond.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.1.1 (App Router), React 19.2.3
**Primary Dependencies**: better-auth v1.4.9 (already installed), pg (new - PostgreSQL driver)
**Storage**: Neon PostgreSQL (shared with FastAPI backend)
**Testing**: Manual verification (no existing auth tests)
**Target Platform**: Next.js App Router (Node.js/Edge runtime)
**Project Type**: Web application (frontend + backend integration)
**Performance Goals**: Authentication endpoints respond within 500ms for 95% of requests
**Constraints**: SSL required for Neon connection, no server-side session storage
**Scale/Scope**: Single-user authentication initially, scalable to multiple concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [X] **I. Universal Logic Decoupling**: ✅ PASS - Auth logic contained in Better Auth library, decoupled from UI
- [X] **II. AI-Native Interoperability**: ✅ PASS - JWT tokens enable AI agents to authenticate with backend
- [X] **III. Strict Statelessness**: ✅ PASS - No in-memory sessions, all state persisted to Neon PostgreSQL
- [X] **IV. Event-Driven Decoupling**: ✅ PASS - Not applicable for auth (synchronous auth flow is standard)
- [X] **V. Zero-Trust Multi-Tenancy**: ✅ PASS - JWT tokens scoped to user_id, enforced at backend
- [X] **VI. Technology Stack**: ✅ PASS - Uses authorized Next.js stack, adds only `pg` for database
- [X] **VII. Security**: ✅ PASS - JWT validation, bcrypt password hashing, no hardcoded secrets
- [X] **VIII. Observability**: ✅ PASS - Better Auth provides structured auth logs

**All gates pass. No violations to document.**

labels: ["plan", "authentication", "better-auth", "nextjs", "implementation"]
links:
  spec: specs/005-user-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-user-auth/plan.md
  - specs/005-user-auth/research.md
  - specs/005-user-auth/data-model.md
  - specs/005-user-auth/quickstart.md
  - specs/005-user-auth/contracts/auth-api.md
  - phase-2/frontend/src/lib/auth-server.ts (NEW)
  - phase-2/frontend/src/app/api/auth/[...all]/route.ts (NEW)
  - phase-2/frontend/.env.local (MODIFIED)
  - phase-2/frontend/package.json (MODIFIED)
tests:
  - Manual verification checklist in quickstart.md
  - 7-step testing process for registration, login, session, logout
  - Database verification queries
  - Backend JWT validation test

## Prompt

# Implementation Plan: Better Auth Server Integration


## Summary

This plan implements a Better Auth Server within the Next.js frontend application to enable real user authentication. The server will handle user registration, login, logout, and session management, persisting all data to the shared Neon PostgreSQL database.

**Key Approach**: Add Better Auth server configuration and API route handler. The existing client-side auth code (hooks, UI) requires no changes — it already calls Better Auth methods that will now have a server to respond.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16.1.1 (App Router), React 19.2.3
**Primary Dependencies**: better-auth v1.4.9 (already installed), pg (new - PostgreSQL driver)
**Storage**: Neon PostgreSQL (shared with FastAPI backend)
**Testing**: Manual verification (no existing auth tests)
**Target Platform**: Next.js App Router (Node.js/Edge runtime)
**Project Type**: Web application (frontend + backend integration)
**Performance Goals**: Authentication endpoints respond within 500ms for 95% of requests
**Constraints**: SSL required for Neon connection, no server-side session storage
**Scale/Scope**: Single-user authentication initially, scalable to multiple concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [X] **I. Universal Logic Decoupling**: ✅ PASS - Auth logic contained in Better Auth library, decoupled from UI
- [X] **II. AI-Native Interoperability**: ✅ PASS - JWT tokens enable AI agents to authenticate with backend
- [X] **III. Strict Statelessness**: ✅ PASS - No in-memory sessions, all state persisted to Neon PostgreSQL
- [X] **IV. Event-Driven Decoupling**: ✅ PASS - Not applicable for auth (synchronous auth flow is standard)
- [X] **V. Zero-Trust Multi-Tenancy**: ✅ PASS - JWT tokens scoped to user_id, enforced at backend
- [X] **VI. Technology Stack**: ✅ PASS - Uses authorized Next.js stack, adds only `pg` for database
- [X] **VII. Security**: ✅ PASS - JWT validation, bcrypt password hashing, no hardcoded secrets
- [X] **VIII. Observability**: ✅ PASS - Better Auth provides structured auth logs

**All gates pass. No violations to document.**

## Response snapshot

Specification created successfully with the following deliverables:
- Feature branch: 005-user-auth (created and checked out)
- Specification file: specs/005-user-auth/spec.md (complete)
- Quality checklist: specs/005-user-auth/checklists/requirements.md (all items validated)
- All validation criteria passed ✅

Implementation plan completed with:
- Phase 0: Research (complete, no clarifications needed)
- Phase 1: Design & Implementation Details (complete)
- 5 new artifacts created (research.md, data-model.md, quickstart.md, contracts/auth-api.md, plan.md)
- Agent context updated with new technologies
- All constitution gates passed

## Outcome

- ✅ Impact: Created comprehensive implementation plan with 8-phase approach, 2 new files to create, 2 files to modify, complete testing strategy, and rollback plan
- 🧪 Tests: Manual verification checklist with 7-step testing process, database verification queries, backend integration test
- 📁 Files:
  - specs/005-user-auth/plan.md (main implementation plan)
  - specs/005-user-auth/research.md (technical decisions and best practices)
  - specs/005-user-auth/data-model.md (complete entity definitions)
  - specs/005-user-auth/quickstart.md (step-by-step implementation guide)
  - specs/005-user-auth/contracts/auth-api.md (API contract documentation)
  - history/prompts/005-user-auth/0002-better-auth-server-implementation-plan.plan.prompt.md (PHR)
- 🔁 Next prompts: /sp.tasks (to break down into actionable tasks) or proceed directly to implementation
- 🧠 Reflection: All technical decisions resolved, no blockers identified. Implementation is straightforward following Better Auth patterns. Ready for immediate execution.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All constitution gates passed, all requirements covered
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Create tasks.md with implementation steps, then proceed to code implementation
