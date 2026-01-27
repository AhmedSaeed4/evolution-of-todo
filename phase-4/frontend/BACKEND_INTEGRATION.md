# Backend Integration Guide

This document outlines the steps required to integrate the frontend with a FastAPI backend.

## Current State

✅ **Frontend Ready**: All components, hooks, and mock services are implemented
✅ **Type Safety**: TypeScript interfaces match backend schema requirements
✅ **API Contracts**: Mock services have clear TODO comments for backend endpoints

## Integration Steps

### 1. Environment Variables

Create `.env.local` in the `frontend/` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication URL (Better Auth)
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Better Auth Secret (for production)
BETTER_AUTH_SECRET=your-secret-key-here
```

### 2. Backend Endpoint Requirements

The frontend expects the following FastAPI endpoints:

#### Task Endpoints

```python
# GET all tasks with filters
GET /api/{user_id}/tasks
Query Parameters:
  - status: 'pending' | 'completed' (optional)
  - priority: 'low' | 'medium' | 'high' (optional)
  - category: 'work' | 'personal' | 'home' | 'other' (optional)
  - search: string (optional)
  - sortBy: 'dueDate' | 'priority' | 'title' | 'createdAt' (optional)
  - sortOrder: 'asc' | 'desc' (optional)

Response: Task[]
```

```python
# CREATE task
POST /api/{user_id}/tasks
Body: CreateTaskDTO
Response: Task
```

```python
# UPDATE task
PUT /api/{user_id}/tasks/{task_id}
Body: UpdateTaskDTO
Response: Task
```

```python
# DELETE task
DELETE /api/{user_id}/tasks/{task_id}
Response: 204 No Content
```

```python
# TOGGLE COMPLETE
PATCH /api/{user_id}/tasks/{task_id}/complete
Response: Task
```

### 3. Update API Service

Replace the mock implementation in `src/lib/api.ts`:

```typescript
// Before (Mock)
async function getAll(userId: string, filters?: TaskFilters): Promise<Task[]> {
  // TODO: Replace with fetch() to FastAPI endpoint
  // TODO: GET /api/{user_id}/tasks
  return mockTasks.filter(...);
}

// After (Real API)
async function getAll(userId: string, filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  return apiClient<Task[]>(`/api/${userId}/tasks?${params}`);
}
```

### 4. Authentication Integration

The frontend uses Better Auth with JWT. The backend must:

1. **Validate JWT tokens** on all protected routes
2. **Extract user_id** from the token for scoping queries
3. **Return user info** in session responses

#### Better Auth Backend Setup (if needed)

```typescript
// Backend auth configuration
export const auth = createAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  // ... other config
});
```

### 5. Error Handling

The frontend expects standardized error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable message",
  "details": { "field": "field_name", "reason": "validation_reason" }
}
```

### 6. Data Format Requirements

#### Task Schema
```typescript
{
  id: string;              // UUID
  title: string;           // 1-200 chars
  description?: string;    // 0-1000 chars
  priority: 'low'|'medium'|'high';
  category: 'work'|'personal'|'home'|'other';
  status: 'pending'|'completed';
  completed: boolean;
  dueDate?: string;        // ISO 8601
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  userId: string;          // Foreign key
}
```

#### User Schema
```typescript
{
  id: string;              // UUID
  email: string;           // Valid email
  name: string;            // 1-100 chars
}
```

## Migration Checklist

- [ ] Set up FastAPI backend with database
- [ ] Implement all 5 task endpoints
- [ ] Configure JWT authentication
- [ ] Update `.env.local` with backend URL
- [ ] Replace mock implementations in `api.ts`
- [ ] Add request/response logging
- [ ] Implement retry logic for failed requests
- [ ] Add error boundary handling
- [ ] Test complete user flow
- [ ] Deploy backend to production

## Testing the Integration

1. **Start backend server** on port 8000
2. **Update environment variables** in frontend
3. **Restart frontend dev server**
4. **Test each operation**:
   - Login/Signup
   - Create task
   - Edit task
   - Toggle completion
   - Delete task
   - Filter/search tasks

## Performance Considerations

- **Debounce**: Search already debounced at 300ms
- **Loading States**: All operations show loading indicators
- **Error Handling**: Graceful fallbacks for network errors
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## Next Steps

1. **Backend Development**: Implement FastAPI endpoints
2. **Database Setup**: Configure PostgreSQL/MySQL
3. **Authentication**: Set up Better Auth backend
4. **Integration Testing**: Test full user flows
5. **Deployment**: Deploy backend and frontend

---

**Status**: ✅ Frontend Ready for Backend Integration
**Last Updated**: 2025-12-29