# API Contract: Better Auth Endpoints

**Feature**: 005-user-auth
**Date**: 2025-12-30
**Base URL**: `http://localhost:3000/api/auth`

---

## Overview

Better Auth automatically generates RESTful endpoints for authentication operations. All endpoints follow standard HTTP conventions and return JSON responses.

**Authentication**: JWT tokens in cookies (httpOnly)
**Content-Type**: `application/json`
**Response Format**: Standard JSON with error handling

---

## Endpoints

### 1. User Registration

**Endpoint**: `POST /api/auth/sign-up/email`

**Purpose**: Create a new user account

**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Validation**:
- `name`: Required, non-empty string
- `email`: Valid email format, unique
- `password`: Minimum 8 characters

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": false
  }
}
```

**Error Responses**:

*Email Already Exists (400)*:
```json
{
  "error": {
    "message": "Email already exists",
    "code": "EMAIL_ALREADY_EXISTS"
  }
}
```

*Invalid Password (400)*:
```json
{
  "error": {
    "message": "Password must be at least 8 characters",
    "code": "INVALID_PASSWORD"
  }
}
```

*Invalid Email (400)*:
```json
{
  "error": {
    "message": "Invalid email format",
    "code": "INVALID_EMAIL"
  }
}
```

---

### 2. User Login

**Endpoint**: `POST /api/auth/sign-in/email`

**Purpose**: Authenticate existing user

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": true
  }
}
```

**Error Responses**:

*Invalid Credentials (401)*:
```json
{
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
}
```

*User Not Found (404)*:
```json
{
  "error": {
    "message": "User not found",
    "code": "USER_NOT_FOUND"
  }
}
```

**Security Note**: Error messages are generic to prevent user enumeration.

---

### 3. User Logout

**Endpoint**: `POST /api/auth/sign-out`

**Purpose**: Terminate current session

**Authentication**: Required (valid session cookie)

**Success Response** (200):
```json
{
  "message": "Signed out successfully"
}
```

**Error Response** (401):
```json
{
  "error": {
    "message": "Not authenticated",
    "code": "NOT_AUTHENTICATED"
  }
}
```

---

### 4. Session Validation

**Endpoint**: `GET /api/auth/get-session`

**Purpose**: Get current authenticated user session

**Authentication**: Required (valid session cookie)

**Success Response** (200):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": true
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2025-12-30T21:30:00.000Z"
  }
}
```

**No Session Response** (200):
```json
{
  "user": null,
  "session": null
}
```

---

### 5. Change Password

**Endpoint**: `POST /api/auth/change-password`

**Purpose**: Update user password

**Authentication**: Required

**Request Body**:
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Validation**:
- `currentPassword`: Must match current password
- `newPassword`: Minimum 8 characters, different from current

**Success Response** (200):
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses**:

*Incorrect Current Password (400)*:
```json
{
  "error": {
    "message": "Current password is incorrect",
    "code": "INCORRECT_PASSWORD"
  }
}
```

*Weak Password (400)*:
```json
{
  "error": {
    "message": "New password must be at least 8 characters",
    "code": "WEAK_PASSWORD"
  }
}
```

---

### 6. Update User Profile

**Endpoint**: `POST /api/auth/update-user`

**Purpose**: Update user information

**Authentication**: Required

**Request Body**:
```json
{
  "name": "string"
}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Updated Name",
    "emailVerified": true
  }
}
```

---

## Authentication Flow

### Complete Registration Flow

```
Client → POST /api/auth/sign-up/email
        ↓
    Validate input
        ↓
    Check email uniqueness
        ↓
    Hash password (bcrypt)
        ↓
    Create user record
        ↓
    Create session record
        ↓
    Generate JWT token
        ↓
    Set httpOnly cookie
        ↓
Client ← 200 OK with user data + token
```

### Complete Login Flow

```
Client → POST /api/auth/sign-in/email
        ↓
    Validate input
        ↓
    Find user by email
        ↓
    Verify password hash
        ↓
    Create session record
        ↓
    Generate JWT token
        ↓
    Set httpOnly cookie
        ↓
Client ← 200 OK with user data + token
```

### Session Validation Flow

```
Client → GET /api/auth/get-session (with cookie)
        ↓
    Extract token from cookie
        ↓
    Verify JWT signature
        ↓
    Check session exists
        ↓
    Check session not expired
        ↓
Client ← 200 OK with user/session data
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Success |
| `400` | Bad Request | Invalid input, duplicate email, etc. |
| `401` | Unauthorized | Invalid/missing authentication |
| `404` | Not Found | User not found |
| `500` | Internal Server Error | Database/connection issues |

---

## Error Response Format

All errors follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {} // Optional additional context
  }
}
```

**Common Error Codes**:
- `INVALID_EMAIL`
- `INVALID_PASSWORD`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `USER_NOT_FOUND`
- `NOT_AUTHENTICATED`
- `INCORRECT_PASSWORD`
- `WEAK_PASSWORD`

---

## Headers

### Request Headers

```
Content-Type: application/json
Cookie: better-auth.session_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response Headers

```
Content-Type: application/json
Set-Cookie: better-auth.session_token=...; HttpOnly; Secure; SameSite=Strict
```

---

## Rate Limiting

**Note**: Better Auth does not include built-in rate limiting. Consider implementing:

- **Registration**: 5 attempts per hour per IP
- **Login**: 10 attempts per 15 minutes per account
- **Password Change**: 3 attempts per hour per account

---

## JWT Token Structure

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**:
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1735588200,
  "exp": 1736193000
}
```

**Claims**:
- `sub`: User ID
- `email`: User email
- `name`: User name
- `iat`: Issued at (timestamp)
- `exp`: Expiration (timestamp)

---

## Backend Integration

### FastAPI JWT Validation

```python
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def verify_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    payload = verify_jwt(credentials.credentials)
    return payload["sub"]  # Returns user_id
```

### Usage in FastAPI Routes

```python
@app.get("/api/tasks")
async def get_tasks(user_id: str = Depends(get_current_user)):
    # Query tasks WHERE userId = user_id
    return await db.query("SELECT * FROM task WHERE userId = ?", user_id)
```

---

## Testing Examples

### Registration

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### Session Check

```bash
curl http://localhost:3000/api/auth/get-session \
  -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:3000/api/auth/sign-out \
  -b cookies.txt
```

---

## Security Considerations

### Transport Security
- Always use HTTPS in production
- Better Auth automatically sets `Secure` flag on cookies in production

### Cookie Security
- `HttpOnly`: Prevents JavaScript access (XSS protection)
- `SameSite=Strict`: CSRF protection
- `Secure`: HTTPS only in production

### Password Security
- Never logged or stored in plain text
- bcrypt hashing with automatic salting
- Minimum 8 character requirement

### Token Security
- JWT signed with shared secret
- Short expiration (configurable)
- Automatic refresh capability

---

## Compatibility

### Frontend Client

The existing `authClient` from `src/lib/auth.ts` is fully compatible:

```typescript
import { authClient } from '@/lib/auth';

// Registration
await authClient.signUp.email({ name, email, password });

// Login
await authClient.signIn.email({ email, password });

// Logout
await authClient.signOut();

// Get session
await authClient.getSession();
```

### Backend Client

FastAPI can validate tokens using the shared secret:

```python
import jwt

def validate_token(token: str):
    return jwt.decode(token, os.getenv("BETTER_AUTH_SECRET"), ["HS256"])
```

---

## Conclusion

**Contract Status**: ✅ Complete

All endpoints are:
- ✅ RESTful and standard
- ✅ Secure with proper validation
- ✅ Compatible with existing frontend
- ✅ Backend integration ready
- ✅ Error handling documented
- ✅ Testing examples provided

**Ready for**: Implementation