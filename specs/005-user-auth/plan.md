# Implementation Plan: Better Auth Server Integration

**Branch**: `005-user-auth` | **Date**: 2025-12-30 | **Spec**: [specs/005-user-auth/spec.md](../spec.md)
**Input**: Feature specification from `/specs/005-user-auth/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement Better Auth Server as a Next.js API route to handle user authentication (registration, login, logout, session management) with Neon PostgreSQL persistence. The existing client-side auth infrastructure (hooks, UI) requires no changes — it already calls Better Auth methods that will now have a real server to respond. This enables the FastAPI backend to validate JWT tokens using the shared secret, eliminating the need for custom authentication logic.

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

## Project Structure

### Documentation (this feature)

```text
specs/005-user-auth/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── auth-api.md      # API contract for auth endpoints
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-2/frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts          # NEW: Better Auth API route handler
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # EXISTING: No changes needed
│   │   │   └── signup/
│   │   │       └── page.tsx             # EXISTING: No changes needed
│   │   └── (dashboard)/
│   │       └── tasks/
│   │           └── page.tsx             # EXISTING: Protected route
│   ├── lib/
│   │   ├── auth.ts                      # EXISTING: Client config (no changes)
│   │   └── auth-server.ts               # NEW: Better Auth server configuration
│   ├── hooks/
│   │   └── useAuth.ts                   # EXISTING: No changes needed
│   └── types/
│       └── index.ts                     # EXISTING: User type definition
├── .env.local                           # MODIFIED: Add auth env vars
├── package.json                         # MODIFIED: Add pg dependency
└── tsconfig.json                        # EXISTING: No changes needed
```

**Structure Decision**: Web application structure (Option 2). The feature adds 2 new files to the existing Next.js frontend structure without modifying existing auth client code. All changes are additive and non-breaking.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution gates passed without justification needed.

---

## Phase 0: Research & Clarifications

**Status**: ✅ Complete - No clarifications needed

### Research Summary

The implementation approach is well-defined with no technical unknowns:

1. **Better Auth Server Configuration**: Standard Next.js App Router API route pattern
2. **Database Adapter**: `pg` driver with Neon PostgreSQL SSL configuration
3. **JWT Token Flow**: Shared secret between Next.js and FastAPI enables token validation
4. **Client Compatibility**: Existing hooks already use Better Auth client methods

### No NEEDS CLARIFICATION Items

All technical decisions are resolved based on:
- Existing project structure (Next.js 16+ App Router)
- Already installed dependencies (better-auth v1.4.9)
- Documented requirements (spec.md)
- Standard Better Auth patterns

**Research Complete**: Proceeding to Phase 1 Design.

---

## Phase 1: Design & Implementation Details

### 1. Better Auth Server Configuration

**File**: `phase-2/frontend/src/lib/auth-server.ts`

**Purpose**: Configure Better Auth server with PostgreSQL adapter and JWT support.

**Key Components**:
- Import `betterAuth` from `better-auth`
- Configure `adapter: postgresql()` using `pg` driver
- Set `secret: process.env.BETTER_AUTH_SECRET`
- Enable `email` authentication provider
- Configure JWT plugin for token generation
- Set database URL with SSL for Neon

**Configuration Pattern**:
```typescript
export const auth = betterAuth({
  database: postgresql({
    url: process.env.DATABASE_URL!,
    ssl: true, // Required for Neon
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },
  plugins: [jwt()],
});
```

### 2. API Route Handler

**File**: `phase-2/frontend/src/app/api/auth/[...all]/route.ts`

**Purpose**: Handle all Better Auth API endpoints automatically.

**Implementation**:
```typescript
import { auth } from '@/lib/auth-server';

export const GET = auth.handler;
export const POST = auth.handler;
```

**Endpoints Created**:
- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/get-session` - Session validation
- `POST /api/auth/change-password` - Password change
- `POST /api/auth/update-user` - Profile update

### 3. Environment Variables

**File**: `phase-2/frontend/.env.local`

**Required additions**:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
BETTER_AUTH_SECRET=generate-secure-random-64-char-string
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
```

**Security**: `BETTER_AUTH_SECRET` must be a cryptographically secure random string (64+ characters).

### 4. Dependency Installation

**File**: `phase-2/frontend/package.json`

**New dependency**:
```json
{
  "dependencies": {
    "pg": "^latest"
  }
}
```

### 5. Database Schema

**Auto-generated by Better Auth**:

```sql
-- User table
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  emailVerified BOOLEAN DEFAULT FALSE,
  image TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- Session table
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id),
  token TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL
);

-- Account table (for future OAuth)
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id),
  providerId TEXT NOT NULL,
  providerUserId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL
);
```

### 6. Integration with Backend

**JWT Token Flow**:
1. Frontend authenticates with Better Auth → receives JWT token
2. Frontend includes token in API requests to FastAPI backend
3. Backend validates token using `BETTER_AUTH_SECRET`
4. Backend extracts `user_id` from token for multi-tenancy

**Shared Database**:
- Better Auth tables: `user`, `session`, `account`
- Backend tables: `task` (already exists)
- All in same Neon PostgreSQL instance

### 7. Verification Strategy

**Manual Testing Steps**:
1. **Install dependency**: `npm install pg`
2. **Update env vars**: Add `DATABASE_URL` and `BETTER_AUTH_SECRET`
3. **Start dev server**: `npm run dev`
4. **Test registration**: `/signup` → create account
5. **Test login**: `/login` → authenticate
6. **Test session**: Refresh page → stay logged in
7. **Test logout**: Click logout → redirect to login
8. **Verify database**: Check Neon for `user` table entries

**Success Criteria**:
- ✅ User created in Neon `user` table
- ✅ Session persists across page refreshes
- ✅ JWT tokens generated and verifiable
- ✅ Existing frontend hooks work without changes
- ✅ Bypass mode can be disabled

### 8. Rollback Plan

**If issues occur**:
1. Delete `src/lib/auth-server.ts`
2. Delete `src/app/api/auth/[...all]/route.ts`
3. Remove `pg` from `package.json`
4. Set `NEXT_PUBLIC_AUTH_BYPASS=true` in `.env.local`

**No breaking changes** - All existing code remains functional.

---

## Implementation Checklist

### Pre-Implementation
- [ ] Generate secure `BETTER_AUTH_SECRET` (64+ characters)
- [ ] Obtain Neon PostgreSQL connection string
- [ ] Verify existing frontend auth hooks are compatible

### Implementation
- [ ] Install `pg` dependency
- [ ] Create `src/lib/auth-server.ts`
- [ ] Create `src/app/api/auth/[...all]/route.ts`
- [ ] Update `.env.local` with required variables

### Verification
- [ ] Start development server
- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test session persistence
- [ ] Test logout functionality
- [ ] Verify database entries in Neon
- [ ] Test JWT token validation (backend integration)

### Post-Implementation
- [ ] Disable bypass mode: `NEXT_PUBLIC_AUTH_BYPASS=false`
- [ ] Update backend integration docs
- [ ] Test end-to-end auth flow
- [ ] Create PHR for this work
