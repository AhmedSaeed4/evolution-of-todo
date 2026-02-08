# Backend Integration Checklist

## Backend Team Requirements

This checklist is for the backend development team to ensure compatibility with the frontend.

### ✅ API Endpoints (Required)

#### Task Management
- [ ] `GET /api/{user_id}/tasks` - Get all tasks with filters
- [ ] `POST /api/{user_id}/tasks` - Create new task
- [ ] `PUT /api/{user_id}/tasks/{task_id}` - Update task
- [ ] `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- [ ] `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion

#### Authentication (Better Auth compatible)
- [ ] Session management endpoint
- [ ] JWT token validation
- [ ] User info endpoint

### ✅ Data Schema Compliance

#### Task Entity
```typescript
{
  id: string (UUID, required)
  title: string (1-200 chars, required)
  description?: string (0-1000 chars)
  priority: 'low' | 'medium' | 'high' (required)
  category: 'work' | 'personal' | 'home' | 'other' (required)
  status: 'pending' | 'completed' (derived from completed)
  completed: boolean (required)
  dueDate?: string (ISO 8601)
  createdAt: string (ISO 8601, required)
  updatedAt: string (ISO 8601, required)
  userId: string (required, foreign key)
}
```

#### User Entity
```typescript
{
  id: string (UUID, required)
  email: string (valid email, required)
  name: string (1-100 chars, required)
}
```

### ✅ Query Parameters Support

#### Filter Parameters (all optional)
- `status`: 'pending' | 'completed'
- `priority`: 'low' | 'medium' | 'high'
- `category`: 'work' | 'personal' | 'home' | 'other'
- `search`: string (full-text search on title + description)

#### Sort Parameters
- `sortBy`: 'dueDate' | 'priority' | 'title' | 'createdAt'
- `sortOrder`: 'asc' | 'desc'

### ✅ Error Response Format

All errors must follow this format:
```json
{
  "error": "Error Type",
  "message": "Human readable message",
  "details": { "field": "field_name", "reason": "validation_reason" }
}
```

#### Error Types
- `Validation Error` - 400
- `Authentication Required` - 401
- `Access Denied` - 403
- `Not Found` - 404
- `Server Error` - 500

### ✅ Security Requirements

#### Authentication
- [ ] JWT token validation on all protected routes
- [ ] Extract user_id from token for query scoping
- [ ] Prevent users from accessing other users' tasks

#### Validation
- [ ] Input validation (title length, email format, etc.)
- [ ] SQL injection prevention
- [ ] XSS prevention

### ✅ Performance Requirements

#### Response Times
- [ ] GET /tasks: < 300ms (p95)
- [ ] POST /tasks: < 500ms (p95)
- [ ] PUT /tasks: < 500ms (p95)
- [ ] DELETE /tasks: < 500ms (p95)

#### Pagination (Optional for future)
- [ ] Support for pagination parameters
- [ ] Default limit: 50 tasks

### ✅ CORS Configuration

The frontend requires CORS headers:
```
Access-Control-Allow-Origin: http://localhost:3000 (or production domain)
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### ✅ Database Schema

#### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(10) NOT NULL,
  category VARCHAR(10) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  dueDate TIMESTAMP WITH TIME ZONE,
  createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE NOT NULL,
  userId UUID NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX idx_tasks_user ON tasks(userId);
CREATE INDEX idx_tasks_status ON tasks(completed);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);
```

### ✅ Testing Requirements

#### Unit Tests
- [ ] All endpoints tested with valid/invalid inputs
- [ ] Authentication middleware tested
- [ ] Query parameter parsing tested

#### Integration Tests
- [ ] Complete user flow tested
- [ ] Error scenarios covered
- [ ] Performance benchmarks met

### ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] CORS enabled
- [ ] JWT secret configured
- [ ] Error logging implemented
- [ ] Health check endpoint added
- [ ] API documentation generated

## Frontend Verification

Once backend is ready, verify:

1. **Update `.env.local`** with backend URL
2. **Remove mock data** from `api.ts`
3. **Test each endpoint** manually
4. **Run full user flow** (auth → CRUD → filters)
5. **Check error handling** (network failures, validation errors)

## Contact

For questions about frontend requirements, refer to:
- `BACKEND_INTEGRATION.md` - Detailed integration guide
- `src/lib/api.ts` - API service with TODO comments
- `src/types/index.ts` - TypeScript interfaces

---

**Status**: Ready for Backend Development
**Priority**: P1 - Core functionality
**Estimated Effort**: 2-3 days for basic API