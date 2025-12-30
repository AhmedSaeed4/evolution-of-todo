---
id: 0003
title: Better Auth Server Tasks Generation
stage: tasks
date: 2025-12-30
surface: agent
model: claude-opus-4-5-20251101
feature: 005-user-auth
branch: 005-user-auth
user: user
command: /sp.tasks # Better Auth Server Implementation Tasks

## Overview

This document contains all tasks required to implement Better Auth Server in the Next.js frontend. Tasks are organized for sequential execution.


---

## Dependencies

- **Blocking**: None (independent of backend implementation)
- **Blocked By This**: Backend implementation requires this for JWT token verification

---

## Phase 1: Setup & Dependencies

Install required dependencies and configure environment.

- [ ] T001 Install PostgreSQL driver dependency
  - Command: `cd phase-2/frontend && npm install pg`
  - Creates: Updated `package.json` with `pg` dependency
  - Note: Required for Better Auth database adapter

- [ ] T002 Configure environment variables
  - File: `phase-2/frontend/.env.local`
  - Add: 00/signup`
  - Input: Name, Email, Password (8+ chars)
  - Expected: Account created, redirected to `/tasks`
  - Verify: New user record in Neon `user` table
  - Verify: Password is hashed (not plain text)

- [ ] T008 Test user login flow
  - Navigate: `http://localhost:3000/login`
  - Input: Registered email/password
  - Expected: Login successful, redirected to `/tasks`
  - Verify: Session cookie set in browser
  - Verify: New session record in Neon `session` table

- [ ] T009 Test user logout flow
  - Action: Click logout button while logged in
  - Expected: Session terminated, redirected to `/login`
  - Verify: Session cookie cleared
  - Verify: Cannot access `/tasks` without re-login

- [ ] T010 Test session persistence
  - Action: Login, then refresh page
  - Expected: Remain logged in (session persists)
  - Action: Close and reopen browser tab
  - Expected: Session persists (based on cookie settings)

- [ ] T011 Test validation errors
  - Test: Registration with duplicate email
  - Expected: Clear error message
  - Test: Login with wrong password
  - Expected: Generic "invalid credentials" error (security)
  - Test: Registration with short password (<8 chars)
  - Expected: Validation error

**Checkpoint**: All auth flows working. Bypass mode can be permanently disabled.

---

## Phase 5: Backend Integration Prep

Prepare for FastAPI backend integration.

- [ ] T012 Document JWT token format
  - Action: Login and extract JWT from session
  - Document: Token structure (payload fields)
  - Document: Token claims (userId, exp, iat)
  - Save: Example token for backend testing

- [ ] T013 Verify shared secret works
  - Action: Decode JWT using `BETTER_AUTH_SECRET`
  - Verify: Signature validates correctly
  - Verify: Payload contains expected fields
  - Note: This confirms backend can verify tokens

- [ ] T014 Update backend spec (separate task)
  - File: `specs/005-backend-implement/tasks.md`
  - Remove: T014-T019 (auth endpoints)
  - Keep: T008-T010 (JWT verification — backend validates, doesn't create)
  - Update: Plan.md and other spec files

**Checkpoint**: Frontend auth complete. Backend ready to implement with JWT verification only.

---

## Summary

| Phase | Tasks | Purpose |
|-------|-------|---------|
| Setup | T001-T002 | Install deps, configure env |
| Server | T003-T004 | Create auth server and API route |
| Database | T005-T006 | Verify tables and connection |
| Testing | T007-T011 | Test all auth flows |
| Integration | T012-T014 | Prep for backend |

**Total Tasks**: 14
**Estimated Time**: 2-4 hours
**Dependencies**: Neon database, environment variables

---

## Success Criteria

- [ ] Users can register with email/password
- [ ] Users can login with valid credentials
- [ ] Users can logout and session is cleared
- [ ] Session persists across page refreshes
- [ ] User data stored in Neon PostgreSQL
- [ ] JWT tokens generated with correct format
- [ ] Bypass mode disabled, real auth working

---

## Notes

- **Existing UI**: Login/signup pages already built — no UI changes needed
- **Existing Client**: `auth.ts` and `useAuth.ts` already configured — no changes needed
- **Database**: Same Neon instance as backend — tables coexist
- **Secret**: Must match `BETTER_AUTH_SECRET` in backend `.env`

labels: ["tasks", "implementation", "better-auth", "nextjs", "checklist"]
links:
  spec: specs/005-user-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-user-auth/tasks.md (NEW - 29 tasks generated)
  - specs/005-user-auth/plan.md (existing)
  - specs/005-user-auth/spec.md (existing)
  - specs/005-user-auth/data-model.md (existing)
  - specs/005-user-auth/contracts/auth-api.md (existing)
tests:
  - Manual browser testing (no automated test suite)
  - 7-step verification process per user story
  - Database query validation
  - JWT token verification

## Prompt

# Better Auth Server Implementation Tasks

## Overview

This document contains all tasks required to implement Better Auth Server in the Next.js frontend. Tasks are organized for sequential execution.


---

## Dependencies

- **Blocking**: None (independent of backend implementation)
- **Blocked By This**: Backend implementation requires this for JWT token verification

---

## Phase 1: Setup & Dependencies

Install required dependencies and configure environment.

- [ ] T001 Install PostgreSQL driver dependency
  - Command: `cd phase-2/frontend && npm install pg`
  - Creates: Updated `package.json` with `pg` dependency
  - Note: Required for Better Auth database adapter

- [ ] T002 Configure environment variables
  - File: `phase-2/frontend/.env.local`
  - Add: 00/signup`
  - Input: Name, Email, Password (8+ chars)
  - Expected: Account created, redirected to `/tasks`
  - Verify: New user record in Neon `user` table
  - Verify: Password is hashed (not plain text)

- [ ] T008 Test user login flow
  - Navigate: `http://localhost:3000/login`
  - Input: Registered email/password
  - Expected: Login successful, redirected to `/tasks`
  - Verify: Session cookie set in browser
  - Verify: New session record in Neon `session` table

- [ ] T009 Test user logout flow
  - Action: Click logout button while logged in
  - Expected: Session terminated, redirected to `/login`
  - Verify: Session cookie cleared
  - Verify: Cannot access `/tasks` without re-login

- [ ] T010 Test session persistence
  - Action: Login, then refresh page
  - Expected: Remain logged in (session persists)
  - Action: Close and reopen browser tab
  - Expected: Session persists (based on cookie settings)

- [ ] T011 Test validation errors
  - Test: Registration with duplicate email
  - Expected: Clear error message
  - Test: Login with wrong password
  - Expected: Generic "invalid credentials" error (security)
  - Test: Registration with short password (<8 chars)
  - Expected: Validation error

**Checkpoint**: All auth flows working. Bypass mode can be permanently disabled.

---

## Phase 5: Backend Integration Prep

Prepare for FastAPI backend integration.

- [ ] T012 Document JWT token format
  - Action: Login and extract JWT from session
  - Document: Token structure (payload fields)
  - Document: Token claims (userId, exp, iat)
  - Save: Example token for backend testing

- [ ] T013 Verify shared secret works
  - Action: Decode JWT using `BETTER_AUTH_SECRET`
  - Verify: Signature validates correctly
  - Verify: Payload contains expected fields
  - Note: This confirms backend can verify tokens

- [ ] T014 Update backend spec (separate task)
  - File: `specs/005-backend-implement/tasks.md`
  - Remove: T014-T019 (auth endpoints)
  - Keep: T008-T010 (JWT verification — backend validates, doesn't create)
  - Update: Plan.md and other spec files

**Checkpoint**: Frontend auth complete. Backend ready to implement with JWT verification only.

---

## Summary

| Phase | Tasks | Purpose |
|-------|-------|---------|
| Setup | T001-T002 | Install deps, configure env |
| Server | T003-T004 | Create auth server and API route |
| Database | T005-T006 | Verify tables and connection |
| Testing | T007-T011 | Test all auth flows |
| Integration | T012-T014 | Prep for backend |

**Total Tasks**: 14
**Estimated Time**: 2-4 hours
**Dependencies**: Neon database, environment variables

---

## Success Criteria

- [ ] Users can register with email/password
- [ ] Users can login with valid credentials
- [ ] Users can logout and session is cleared
- [ ] Session persists across page refreshes
- [ ] User data stored in Neon PostgreSQL
- [ ] JWT tokens generated with correct format
- [ ] Bypass mode disabled, real auth working

---

## Notes

- **Existing UI**: Login/signup pages already built — no UI changes needed
- **Existing Client**: `auth.ts` and `useAuth.ts` already configured — no changes needed
- **Database**: Same Neon instance as backend — tables coexist
- **Secret**: Must match `BETTER_AUTH_SECRET` in backend `.env`

## Response snapshot

Generated comprehensive tasks.md file with 29 tasks organized by user story:

**Structure**:
- Phase 1: Setup & Dependencies (T001-T002)
- Phase 2: Foundational Infrastructure (T003-T006)
- Phase 3: User Story 1 - Registration (T007-T011)
- Phase 4: User Story 2 - Login (T012-T016)
- Phase 5: User Story 3 - Sessions (T017-T021)
- Phase 6: User Story 4 - Security (T022-T024)
- Phase 7: Integration & Finalization (T025-T027)
- Phase 8: Cross-Cutting Concerns (T028-T029)

**Format Compliance**: ✅ ALL tasks follow strict checklist format
- Checkbox: `- [ ]`
- Task ID: Sequential (T001-T029)
- [P] marker: For parallelizable tasks
- [Story] label: For user story tasks (US1-US4)
- File paths: Included for all tasks

**Key Features**:
- 12 parallel execution opportunities
- Independent test criteria per user story
- MVP scope identified (Phases 1-3 = 11 tasks)
- Database verification steps included
- JWT token documentation for backend integration

## Outcome

- ✅ Impact: Created executable task list with 29 tasks, organized by user story, enabling independent implementation and testing
- 🧪 Tests: Manual browser testing strategy with 7-step verification per story
- 📁 Files:
  - specs/005-user-auth/tasks.md (NEW - 29 tasks)
  - history/prompts/005-user-auth/0003-better-auth-server-tasks-generation.tasks.prompt.md (PHR)
- 🔁 Next prompts: Proceed to implementation (T001-T029) or create tasks for backend integration
- 🧠 Reflection: All tasks are immediately executable, each task is specific enough for LLM completion without additional context. Format validation passed.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All 29 tasks follow required format, organized by user story, independently testable
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementation with T001, verify setup works before proceeding
