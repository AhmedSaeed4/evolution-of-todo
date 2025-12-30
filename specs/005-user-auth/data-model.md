# Data Model: Better Auth Server Integration

**Feature**: 005-user-auth
**Date**: 2025-12-30
**Database**: Neon PostgreSQL

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Session     │       │     Account     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │───────│ userId (FK)     │───────│ userId (FK)     │
│ name            │       │ token           │       │ providerId      │
│ passwordHash    │       │ expiresAt       │       │ providerUserId  │
│ emailVerified   │       │ createdAt       │       │ accessToken     │
│ image           │       └─────────────────┘       │ refreshToken    │
│ createdAt       │                                 │ expiresAt       │
│ updatedAt       │                                 │ createdAt       │
└─────────────────┘                                 └─────────────────┘
        │                                                   │
        │                                                   │
        └──────────────────┬───────────────────────────────┘
                           │
                    ┌──────────────┐
                    │     Task     │ (Backend)
                    ├──────────────┤
                    │ id (PK)      │
                    │ userId (FK)  │
                    │ title        │
                    │ status       │
                    │ createdAt    │
                    └──────────────┘
```

---

## Entity Definitions

### User Entity

**Purpose**: Core user identity and authentication data

**Table**: `user`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique user identifier (UUID) |
| `email` | TEXT | UNIQUE, NOT NULL | User email address |
| `name` | TEXT | - | Display name (optional) |
| `passwordHash` | TEXT | NOT NULL | bcrypt hashed password |
| `emailVerified` | BOOLEAN | DEFAULT FALSE | Email verification status |
| `image` | TEXT | - | Profile image URL (optional) |
| `createdAt` | TIMESTAMP | NOT NULL | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last update timestamp |

**Validation Rules**:
- Email: Valid format, unique constraint
- Password: Minimum 8 characters (enforced by Better Auth)
- ID: Generated UUID v4

**Indexes**:
- Primary: `id`
- Unique: `email`

---

### Session Entity

**Purpose**: Track active user sessions and JWT tokens

**Table**: `session`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Session identifier |
| `userId` | TEXT | FOREIGN KEY → user.id | Associated user |
| `token` | TEXT | NOT NULL | JWT token string |
| `expiresAt` | TIMESTAMP | NOT NULL | Token expiration |
| `createdAt` | TIMESTAMP | NOT NULL | Session creation time |

**Validation Rules**:
- Token: JWT format (Better Auth validates)
- Expiration: Set per session policy (e.g., 7 days)
- Foreign Key: Cascades on user deletion

**Indexes**:
- Primary: `id`
- Foreign: `userId`
- Query: `token` (for validation lookups)

---

### Account Entity

**Purpose**: Store OAuth provider links (for future use)

**Table**: `account`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Account link identifier |
| `userId` | TEXT | FOREIGN KEY → user.id | Associated user |
| `providerId` | TEXT | NOT NULL | OAuth provider name |
| `providerUserId` | TEXT | NOT NULL | User ID from provider |
| `accessToken` | TEXT | - | OAuth access token |
| `refreshToken` | TEXT | - | OAuth refresh token |
| `expiresAt` | TIMESTAMP | - | Token expiration |
| `createdAt` | TIMESTAMP | NOT NULL | Link creation time |

**Note**: This table is created by Better Auth for future OAuth support but not used in current implementation.

---

## Relationships

### User ↔ Session (One-to-Many)

- **User** can have multiple active **Sessions**
- **Session** belongs to exactly one **User**
- **Cascade**: Deleting user removes all their sessions

**Query Pattern**:
```sql
SELECT * FROM session WHERE userId = ?;
```

### User ↔ Account (One-to-Many)

- **User** can have multiple **Accounts** (different OAuth providers)
- **Account** belongs to exactly one **User**
- **Cascade**: Deleting user removes all linked accounts

### User ↔ Task (One-to-Many) [Backend]

- **User** can have multiple **Tasks**
- **Task** belongs to exactly one **User**
- **Foreign Key**: `task.userId` references `user.id`

**Query Pattern** (Backend):
```sql
SELECT * FROM task WHERE userId = ?;
```

---

## Data Flow

### User Registration

```
1. User submits signup form (name, email, password)
   ↓
2. Better Auth validates inputs
   ↓
3. Better Auth hashes password (bcrypt)
   ↓
4. Better Auth creates User record
   ↓
5. Better Auth creates Session record
   ↓
6. JWT token issued to client
   ↓
7. User logged in automatically
```

### User Login

```
1. User submits login form (email, password)
   ↓
2. Better Auth finds user by email
   ↓
3. Better Auth verifies password hash
   ↓
4. Better Auth creates Session record
   ↓
5. JWT token issued to client
   ↓
6. User logged in
```

### Session Validation

```
1. Client makes request with JWT token
   ↓
2. Better Auth validates token signature
   ↓
3. Better Auth checks session exists and not expired
   ↓
4. Better Auth returns user data
   ↓
5. Request proceeds with authenticated user
```

### Backend JWT Validation

```
1. Frontend sends request to FastAPI with JWT
   ↓
2. FastAPI validates JWT using BETTER_AUTH_SECRET
   ↓
3. FastAPI extracts user_id from token
   ↓
4. FastAPI scopes database queries to user_id
   ↓
5. Returns user-specific data
```

---

## Security Considerations

### Password Storage

- **Hashing**: bcrypt with automatic salt generation
- **Work Factor**: Default (Better Auth handles)
- **Never stored**: Plain text passwords

### Token Security

- **JWT Secret**: 64+ character random string
- **Algorithm**: HS256 (symmetric signing)
- **Expiration**: Configurable (default: 7 days)
- **Storage**: HTTP-only cookies (Better Auth manages)

### Data Isolation

- **Multi-tenancy**: All queries scoped to `user_id`
- **Row-level security**: Application layer enforcement
- **Foreign keys**: Ensure referential integrity

### Audit Trail

- **Timestamps**: All entities have `createdAt`
- **Updates**: User entity has `updatedAt`
- **Sessions**: Track creation and expiration

---

## Performance Considerations

### Indexes

**User Table**:
- Primary: `id` (automatic)
- Unique: `email` (for login lookups)

**Session Table**:
- Primary: `id` (automatic)
- Foreign: `userId` (for session queries)
- Index: `token` (for validation lookups)

**Account Table**:
- Primary: `id` (automatic)
- Foreign: `userId` (for account queries)
- Composite: `(providerId, providerUserId)` (for OAuth lookups)

### Query Patterns

**Login**:
```sql
SELECT * FROM user WHERE email = ?;
-- Uses email index
```

**Session Validation**:
```sql
SELECT * FROM session WHERE token = ? AND expiresAt > NOW();
-- Uses token index
```

**User Tasks** (Backend):
```sql
SELECT * FROM task WHERE userId = ?;
-- Uses userId foreign key index
```

---

## Schema Evolution

### Initial Setup

Better Auth automatically creates all tables on first use. No manual migration required.

### Future Enhancements

**OAuth Support**:
- Already supported via `account` table
- Just need to configure OAuth providers in Better Auth

**Email Verification**:
- `emailVerified` flag ready
- Add verification token table if needed

**Password Reset**:
- Can be added via Better Auth plugins
- No schema changes required

---

## Integration with Backend

### Shared User ID

Both systems use the same `user.id` format:
- Generated by Better Auth (UUID v4)
- Referenced by backend `task.userId`
- Enables cross-service data correlation

### Foreign Key Constraint

```sql
ALTER TABLE task
ADD CONSTRAINT task_user_fkey
FOREIGN KEY (userId) REFERENCES user(id)
ON DELETE CASCADE;
```

**Benefits**:
- Data integrity
- Automatic cleanup
- Query optimization

---

## Testing Data

### Sample User Record

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "name": "Test User",
  "passwordHash": "$2b$12$...",
  "emailVerified": false,
  "image": null,
  "createdAt": "2025-12-30T21:30:00.000Z",
  "updatedAt": "2025-12-30T21:30:00.000Z"
}
```

### Sample Session Record

```json
{
  "id": "session_123",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-12-30T21:30:00.000Z",
  "createdAt": "2025-12-30T21:30:00.000Z"
}
```

---

## Conclusion

**Data Model Status**: ✅ Complete

The data model provides:
- ✅ Complete user authentication lifecycle
- ✅ Session management with JWT tokens
- ✅ Future OAuth support capability
- ✅ Backend integration via shared user_id
- ✅ Proper indexing for performance
- ✅ Security best practices
- ✅ Scalability considerations

**Ready for**: API contract generation and implementation