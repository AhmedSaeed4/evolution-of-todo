# Feature Specification: Better Auth Server Integration

**Feature Branch**: `005-user-auth`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "name the new branch "005-frontend-auth" and heres the specs: # Feature Specification: Better Auth Server Integration

## Executive Summary

This specification defines the implementation of a Better Auth Server within the existing Next.js frontend application. The server will handle user authentication (sign-up, sign-in, sign-out, session management) and persist user data to the shared Neon PostgreSQL database. This enables the FastAPI backend to validate JWT tokens without implementing custom authentication logic.

---

## Business Context

### Current State
- Frontend has Better Auth **client** installed and configured
- Login/signup UI pages exist and call `authClient.signIn/signUp`
- No Better Auth **server** exists — client calls have no endpoint to hit
- Currently running in "bypass mode" with mock data for development

### Target State
- Better Auth Server running as Next.js API route
- Users can register, login, logout with real credentials
- User data persisted to Neon PostgreSQL
- JWT tokens generated and validated using shared secret
- Backend (FastAPI) can verify tokens without custom auth implementation

### Business Value
- **Unified Authentication**: Single source of truth for user identity
- **Reduced Backend Complexity**: FastAPI only validates tokens, doesn't manage auth
- **Security**: Better Auth handles password hashing, session management, token rotation
- **Future-Proof**: Easy to add OAuth providers, 2FA, etc.

---

## User Scenarios & Testing

### User Story 1 - New User Registration (Priority: P1)

A new user visits the application and creates an account with their email and password.

**Why this priority**: User registration is the entry point for all new users and enables account creation, which is fundamental to the application's value proposition.

**Independent Test**: Can be tested by attempting to register a new account with valid credentials and verifying the user data is persisted to the database.

**Acceptance Scenarios**:

1. **Given** a user on the signup page, **When** they enter valid name, email, and password, **Then** account is created and stored in Neon DB
2. **Given** a user with valid credentials, **When** signup completes, **Then** they are automatically logged in with a valid session
3. **Given** an email already in use, **When** user tries to register, **Then** they receive a clear error message
4. **Given** a password less than 8 characters, **When** user tries to register, **Then** validation error is shown

---

### User Story 2 - Existing User Login (Priority: P1)

A registered user returns to the application and logs in with their credentials.

**Why this priority**: Login functionality is essential for returning users and enables session-based authentication, which is core to the application's security model.

**Independent Test**: Can be tested by registering a user, logging out, then logging back in with the same credentials.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** user submits login form, **Then** session is created and user is redirected to dashboard
2. **Given** invalid password, **When** user submits login form, **Then** clear error message is shown without revealing which field is wrong
3. **Given** non-existent email, **When** user submits login form, **Then** same error as invalid password (security best practice)
4. **Given** a logged-in user, **When** they refresh the page, **Then** session persists and they remain authenticated

---

### User Story 3 - Session Management (Priority: P1)

A logged-in user's session is managed securely across the application.

**Why this priority**: Session management ensures users stay authenticated across page refreshes and protects sensitive routes, providing seamless user experience.

**Independent Test**: Can be tested by logging in, accessing protected routes, then logging out and verifying access is denied.

**Acceptance Scenarios**:

1. **Given** a valid session, **When** user accesses protected routes, **Then** they can access their data
2. **Given** a logged-in user, **When** they click logout, **Then** session is terminated and they are redirected to login
3. **Given** an expired session, **When** user tries to access protected routes, **Then** they are redirected to login
4. **Given** a valid JWT token, **When** backend receives API request, **Then** it can verify token using shared secret

---

### User Story 4 - Password Security (Priority: P2)

User passwords are handled securely at all stages.

**Why this priority**: Password security is critical for protecting user accounts, but the underlying Better Auth library handles most of this automatically. This story validates proper configuration.

**Independent Test**: Can be verified by checking database storage and login behavior without needing full user interaction.

**Acceptance Scenarios**:

1. **Given** user registration, **When** password is stored, **Then** it is hashed with bcrypt (never plain text)
2. **Given** user login, **When** password is verified, **Then** comparison uses constant-time algorithm
3. **Given** the database, **When** queried for users, **Then** password field is always hashed

---

### Edge Cases

- What happens when multiple users try to register with the same email simultaneously?
- How does the system handle database connection failures during authentication?
- What happens when JWT token expires while user is actively using the application?
- How does the system handle malformed or tampered JWT tokens?
- What happens when Better Auth server is unavailable during login attempt?

---

## Requirements

**Constitution Alignment**: All requirements MUST comply with Evolution of Todo Constitution v1.1.0

### Functional Requirements

- **FR-001**: System MUST provide `/api/auth/*` endpoints via Better Auth server
- **FR-002**: System MUST store user data (email, name, hashed password) in Neon PostgreSQL
- **FR-003**: System MUST issue JWT tokens signed with `BETTER_AUTH_SECRET`
- **FR-004**: System MUST validate email format and password length (8+ chars) during registration
- **FR-005**: System MUST prevent duplicate email registration
- **FR-006**: System MUST hash passwords using bcrypt before storage
- **FR-007**: System MUST support session-based authentication with cookies
- **FR-008**: System MUST expose session data for backend JWT verification

### Non-Functional Requirements

- **NFR-001**: Authentication endpoints MUST respond within 500ms for 95% of requests
- **NFR-002**: System MUST support concurrent user sessions without data conflicts
- **NFR-003**: System MUST work with existing frontend UI without modifications
- **NFR-004**: Database connection MUST use SSL for Neon PostgreSQL

### Architecture Requirements

- **AR-001**: Better Auth Server MUST run as Next.js App Router API route
- **AR-002**: Database adapter MUST use pg (postgres) driver for Neon connection
- **AR-003**: JWT secret MUST be loaded from environment variable `BETTER_AUTH_SECRET`
- **AR-004**: System MUST share database with FastAPI backend (same Neon instance)

### Key Entities

- **User**: Represents an application user with email, name, and hashed password
- **Session**: Represents an authenticated user session with associated JWT token
- **Account**: Represents the Better Auth account linkage for the user

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can successfully register with unique email/password
- **SC-002**: Users can login with valid credentials and receive session
- **SC-003**: Users can logout and session is properly terminated
- **SC-004**: User data is persisted in Neon PostgreSQL `user` table
- **SC-005**: Frontend auth hooks work without modification
- **SC-006**: FastAPI backend can verify JWT tokens using shared secret
- **SC-007**: Bypass mode can be disabled and real auth works end-to-end
