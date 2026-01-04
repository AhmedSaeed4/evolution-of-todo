# Research: Better Auth Server Integration

**Feature**: 005-user-auth
**Date**: 2025-12-30
**Status**: Complete

---

## Decision Log

### Decision 1: PostgreSQL Driver Selection

**Decision**: Use `pg` (node-postgres) as the PostgreSQL driver for Better Auth

**Rationale**:
- `pg` is the most widely-used PostgreSQL driver for Node.js
- Better Auth has built-in support for `pg` adapter
- Compatible with Neon PostgreSQL serverless architecture
- Supports SSL connections required by Neon

**Alternatives Considered**:
- `@neondatabase/serverless` - Neon-specific driver, but `pg` works fine with connection strings
- `postgres` (npm package) - Modern alternative, but `pg` has better Better Auth integration

### Decision 2: Database Connection Strategy

**Decision**: Single shared database connection between Next.js (Better Auth) and FastAPI backend

**Rationale**:
- Both services connect to same Neon PostgreSQL instance
- Better Auth creates its own tables (`user`, `session`, `account`)
- Backend tables (`task`) coexist without conflicts
- Shared `DATABASE_URL` simplifies configuration
- No data synchronization issues

**Alternative Considered**:
- Separate databases for auth and tasks - rejected due to complexity and shared user_id requirements

### Decision 3: JWT Token Flow

**Decision**: Better Auth issues JWT tokens, FastAPI validates them using shared secret

**Rationale**:
- Better Auth handles token generation automatically with JWT plugin
- Shared `BETTER_AUTH_SECRET` enables cross-service validation
- Stateless authentication aligns with constitution requirements
- No custom auth logic needed in backend

**Alternative Considered**:
- Custom token generation in backend - rejected because Better Auth provides this out-of-the-box

### Decision 4: Bypass Mode Transition

**Decision**: Gradual transition from bypass mode to real auth

**Rationale**:
- Current system uses `NEXT_PUBLIC_AUTH_BYPASS=true`
- Implementation enables real auth without breaking existing code
- Can disable bypass by setting `NEXT_PUBLIC_AUTH_BYPASS=false`
- Rollback is simple (re-enable bypass mode)

**Implementation Strategy**:
1. Add real auth infrastructure
2. Test thoroughly
3. Disable bypass mode
4. Monitor for issues
5. Rollback if needed

### Decision 5: No Code Changes to Existing Auth Client

**Decision**: Keep existing `src/lib/auth.ts` and `src/hooks/useAuth.ts` unchanged

**Rationale**:
- Already configured for Better Auth client
- Hooks already call Better Auth methods
- UI pages already use these hooks
- Implementation is purely server-side addition

**Verification**:
- Existing client calls `authClient.signIn.email()` etc.
- These methods will now hit real endpoints instead of failing

---

## Best Practices Research

### Better Auth Server Configuration

**Source**: Better Auth documentation and examples

**Key Findings**:
1. **Database Adapter**: Better Auth supports multiple adapters including PostgreSQL
2. **JWT Plugin**: Required for token generation, enabled via `plugins: [jwt()]`
3. **SSL Requirement**: Neon requires SSL connections (`ssl: true`)
4. **Secret Length**: Should be 64+ characters, cryptographically random
5. **Password Policy**: Minimum length configurable, defaults to 8 characters

**Security Considerations**:
- Never commit `BETTER_AUTH_SECRET` to version control
- Use `.env.local` for development, environment variables for production
- Enable SSL for all Neon connections
- Better Auth handles password hashing with bcrypt automatically

### Next.js App Router API Routes

**Source**: Next.js 16+ App Router documentation

**Pattern**:
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth-server';

export const GET = auth.handler;
export const POST = auth.handler;
```

**Key Points**:
- Catch-all route `[...all]` handles all auth sub-paths
- Single handler for both GET and POST
- Better Auth handles routing internally
- No manual endpoint mapping needed

### Database Schema Management

**Source**: Better Auth automatic schema creation

**Process**:
1. Better Auth automatically creates tables on first use
2. Tables: `user`, `session`, `account`
3. No manual migration needed for initial setup
4. Schema evolves with Better Auth versions

**Coexistence**: Backend's `task` table references `user.id` as foreign key

---

## Integration Patterns

### Frontend → Backend Auth Flow

```
1. User registers/logs in via Next.js UI
   ↓
2. Better Auth client calls /api/auth/sign-in/email
   ↓
3. Better Auth server validates credentials
   ↓
4. JWT token issued and stored in cookies
   ↓
5. Frontend makes request to FastAPI with token
   ↓
6. FastAPI validates JWT using BETTER_AUTH_SECRET
   ↓
7. FastAPI extracts user_id and scopes queries
```

### Shared Database Architecture

```
Neon PostgreSQL Instance
├── Better Auth Tables
│   ├── user (id, email, name, password_hash, timestamps)
│   ├── session (id, user_id, token, expires_at)
│   └── account (id, user_id, provider, tokens)
│
└── Backend Tables
    └── task (id, user_id, title, status, timestamps)
```

---

## Risk Analysis

### Low Risk Items
- ✅ **Dependency addition**: `pg` is stable and widely used
- ✅ **Schema conflicts**: Better Auth uses clean table names, no conflicts expected
- ✅ **Client compatibility**: Existing hooks already use Better Auth methods

### Medium Risk Items
- ⚠️ **Environment variables**: Must be properly configured for Neon
- ⚠️ **SSL configuration**: Must be enabled for Neon connections
- ⚠️ **Secret generation**: Must be cryptographically secure

### Mitigation Strategies
- Clear documentation in plan.md
- Step-by-step verification checklist
- Simple rollback procedure
- Manual testing before production deployment

---

## Validation

### Requirements Coverage

| Requirement | Coverage | Notes |
|-------------|----------|-------|
| FR-001: `/api/auth/*` endpoints | ✅ | Better Auth auto-generates |
| FR-002: User data in Neon | ✅ | Automatic table creation |
| FR-003: JWT tokens | ✅ | JWT plugin enabled |
| FR-004: Email/password validation | ✅ | Built-in validation |
| FR-005: Duplicate prevention | ✅ | Unique constraint on email |
| FR-006: Password hashing | ✅ | bcrypt via Better Auth |
| FR-007: Session cookies | ✅ | Better Auth manages cookies |
| FR-008: Backend verification | ✅ | Shared secret enables validation |

### Success Criteria Alignment

| Success Criteria | Implementation |
|------------------|----------------|
| SC-001: User registration | Better Auth sign-up endpoint |
| SC-002: User login | Better Auth sign-in endpoint |
| SC-003: Logout | Better Auth sign-out endpoint |
| SC-004: Neon persistence | Database adapter configuration |
| SC-005: Hook compatibility | No changes needed to existing hooks |
| SC-006: Backend verification | JWT plugin + shared secret |
| SC-007: Bypass disable | Environment variable toggle |

---

## Conclusion

**Research Status**: ✅ Complete

**Summary**: All technical decisions are well-defined with no unresolved questions. The implementation approach follows established patterns and best practices. The feature can proceed to implementation with confidence.

**Next Steps**:
1. Create data model documentation
2. Generate API contracts
3. Create quickstart guide
4. Proceed with implementation