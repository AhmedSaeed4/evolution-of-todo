# API Contracts: Todo Full-Stack Web Application Frontend

**Branch**: `003-frontend-design`
**Date**: 2025-12-29
**Constitution Version**: v1.1.0
**Status**: Mock Implementation → Backend Ready

---

## Overview

This document defines the API contracts for the frontend service layer. All contracts are designed for **seamless backend integration** with FastAPI endpoints. The current implementation uses mock data services, but maintains exact interface compatibility with future backend endpoints.

---

## Service Layer Architecture

### File: `src/lib/api.ts`

**Purpose**: Task-related CRUD operations with mock data store

**Key Imports**:
```typescript
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters, User } from '@/types';
```

**Exports**:
- `getAll(userId: string, filters?: TaskFilters): Promise<Task[]>`
- `create(userId: string, data: CreateTaskDTO): Promise<Task>`
- `update(userId: string, taskId: string, data: UpdateTaskDTO): Promise<Task>`
- `delete(userId: string, taskId: string): Promise<void>`
- `toggleComplete(userId: string, taskId: string): Promise<Task>`

---

## API Method Specifications

### 1. GET All Tasks

**Method**: `getAll`

**Signature**:
```typescript
async function getAll(
  userId: string,
  filters?: TaskFilters
): Promise<Task[]>
```

**Current Implementation**: Mock data with in-memory filtering

**Future Backend Endpoint**:
```
GET /api/{user_id}/tasks
Query Parameters: ?status=pending&priority=high&category=work&search=keyword&sortBy=dueDate&sortOrder=asc
```

**Request Flow**:
```
Frontend → useAuth hook → Get JWT token → apiClient → GET /api/{user_id}/tasks
```

**Response**:
```typescript
// Success (200)
[
  {
    "id": "123",
    "title": "Task title",
    "description": "Optional description",
    "priority": "high",
    "category": "work",
    "status": "pending",
    "completed": false,
    "dueDate": "2025-12-30T17:00:00Z",
    "createdAt": "2025-12-29T10:00:00Z",
    "updatedAt": "2025-12-29T10:00:00Z",
    "userId": "user-123"
  }
]

// Error (401, 500)
{
  "error": "Authentication required",
  "message": "Valid JWT token required"
}
```

**Mock Implementation**:
```typescript
// TODO: Replace with fetch() to FastAPI endpoint
// TODO: GET /api/{user_id}/tasks
async function getAll(userId: string, filters?: TaskFilters): Promise<Task[]> {
  return mockTasks
    .filter(task => task.userId === userId)
    .filter(task => !filters?.status || task.status === filters.status)
    .filter(task => !filters?.priority || task.priority === filters.priority)
    .filter(task => !filters?.category || task.category === filters.category)
    .filter(task => {
      if (!filters?.search) return true;
      const search = filters.search.toLowerCase();
      return task.title.toLowerCase().includes(search) ||
             (task.description?.toLowerCase().includes(search) || false);
    })
    .sort((a, b) => {
      if (!filters?.sortBy) return 0;

      const field = filters.sortBy;
      const order = filters.sortOrder === 'desc' ? -1 : 1;

      let aVal = a[field];
      let bVal = b[field];

      if (field === 'dueDate' || field === 'createdAt') {
        return (new Date(aVal).getTime() - new Date(bVal).getTime()) * order;
      }

      if (field === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order;
      }

      return String(aVal).localeCompare(String(bVal)) * order;
    });
}
```

**Usage in Components**:
```typescript
// src/hooks/useTasks.ts
export function useTasks(userId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});

  useEffect(() => {
    api.getAll(userId, filters).then(setTasks);
  }, [userId, filters]);

  return { tasks, setFilters };
}
```

---

### 2. CREATE Task

**Method**: `create`

**Signature**:
```typescript
async function create(
  userId: string,
  data: CreateTaskDTO
): Promise<Task>
```

**Current Implementation**: Mock data with auto-generated fields

**Future Backend Endpoint**:
```
POST /api/{user_id}/tasks
Content-Type: application/json

Request Body:
{
  "title": "New task",
  "description": "Optional",
  "priority": "high",
  "category": "work",
  "dueDate": "2025-12-30T17:00:00Z"
}
```

**Request Flow**:
```
TaskForm Submit → Validate → CreateTaskDTO → apiClient → POST /api/{user_id}/tasks
```

**Response**:
```typescript
// Success (201)
{
  "id": "generated-uuid",
  "title": "New task",
  "description": "Optional",
  "priority": "high",
  "category": "work",
  "status": "pending",
  "completed": false,
  "dueDate": "2025-12-30T17:00:00Z",
  "createdAt": "2025-12-29T14:30:00Z",
  "updatedAt": "2025-12-29T14:30:00Z",
  "userId": "user-123"
}

// Error (400, 401, 500)
{
  "error": "Validation Error",
  "message": "Title is required",
  "details": { "field": "title", "reason": "required" }
}
```

**Mock Implementation**:
```typescript
// TODO: Replace with fetch() to FastAPI endpoint
// TODO: POST /api/{user_id}/tasks
async function create(userId: string, data: CreateTaskDTO): Promise<Task> {
  const newTask: Task = {
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description,
    priority: data.priority,
    category: data.category,
    status: 'pending',
    completed: false,
    dueDate: data.dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId
  };
  mockTasks.push(newTask);
  return newTask;
}
```

**Usage in Components**:
```typescript
// src/components/tasks/TaskForm.tsx
const handleSubmit = async (data: CreateTaskDTO) => {
  const newTask = await api.create(userId, data);
  // Update local state or refetch
  setTasks(prev => [...prev, newTask]);
};
```

---

### 3. UPDATE Task

**Method**: `update`

**Signature**:
```typescript
async function update(
  userId: string,
  taskId: string,
  data: UpdateTaskDTO
): Promise<Task>
```

**Current Implementation**: Mock data with partial update

**Future Backend Endpoint**:
```
PUT /api/{user_id}/tasks/{task_id}
Content-Type: application/json

Request Body:
{
  "title": "Updated title",
  "priority": "medium"
}
```

**Request Flow**:
```
TaskForm Submit → Validate → UpdateTaskDTO → apiClient → PUT /api/{user_id}/tasks/{task_id}
```

**Response**:
```typescript
// Success (200)
{
  "id": "123",
  "title": "Updated title",
  "description": "Original description",
  "priority": "medium",
  "category": "work",
  "status": "pending",
  "completed": false,
  "dueDate": "2025-12-30T17:00:00Z",
  "createdAt": "2025-12-29T10:00:00Z",
  "updatedAt": "2025-12-29T15:00:00Z",
  "userId": "user-123"
}

// Error (404, 403, 400)
{
  "error": "Not Found",
  "message": "Task not found or access denied"
}
```

**Mock Implementation**:
```typescript
// TODO: Replace with fetch() to FastAPI endpoint
// TODO: PUT /api/{user_id}/tasks/{task_id}
async function update(userId: string, taskId: string, data: UpdateTaskDTO): Promise<Task> {
  const taskIndex = mockTasks.findIndex(t => t.id === taskId && t.userId === userId);

  if (taskIndex === -1) {
    throw new Error('Task not found or access denied');
  }

  const updatedTask = {
    ...mockTasks[taskIndex],
    ...data,
    updatedAt: new Date().toISOString()
  };

  mockTasks[taskIndex] = updatedTask;
  return updatedTask;
}
```

---

### 4. DELETE Task

**Method**: `delete`

**Signature**:
```typescript
async function deleteTask(
  userId: string,
  taskId: string
): Promise<void>
```

**Current Implementation**: Mock data removal

**Future Backend Endpoint**:
```
DELETE /api/{user_id}/tasks/{task_id}
```

**Request Flow**:
```
Delete Icon Click → Confirmation → apiClient → DELETE /api/{user_id}/tasks/{task_id}
```

**Response**:
```typescript
// Success (204)
// No content

// Error (404, 403)
{
  "error": "Not Found",
  "message": "Task not found or access denied"
}
```

**Mock Implementation**:
```typescript
// TODO: Replace with fetch() to FastAPI endpoint
// TODO: DELETE /api/{user_id}/tasks/{task_id}
async function deleteTask(userId: string, taskId: string): Promise<void> {
  const taskIndex = mockTasks.findIndex(t => t.id === taskId && t.userId === userId);

  if (taskIndex === -1) {
    throw new Error('Task not found or access denied');
  }

  mockTasks.splice(taskIndex, 1);
}
```

---

### 5. TOGGLE COMPLETE

**Method**: `toggleComplete`

**Signature**:
```typescript
async function toggleComplete(
  userId: string,
  taskId: string
): Promise<Task>
```

**Current Implementation**: Mock data toggle

**Future Backend Endpoint**:
```
PATCH /api/{user_id}/tasks/{task_id}/complete
```

**Request Flow**:
```
Checkbox Click → apiClient → PATCH /api/{user_id}/tasks/{task_id}/complete
```

**Response**:
```typescript
// Success (200)
{
  "id": "123",
  "title": "Task title",
  "priority": "high",
  "category": "work",
  "status": "completed",        // Changed
  "completed": true,            // Changed
  "updatedAt": "2025-12-29T16:00:00Z",
  // ... other fields unchanged
}

// Error (404, 403)
{
  "error": "Not Found",
  "message": "Task not found or access denied"
}
```

**Mock Implementation**:
```typescript
// TODO: Replace with fetch() to FastAPI endpoint
// TODO: PATCH /api/{user_id}/tasks/{task_id}/complete
async function toggleComplete(userId: string, taskId: string): Promise<Task> {
  const taskIndex = mockTasks.findIndex(t => t.id === taskId && t.userId === userId);

  if (taskIndex === -1) {
    throw new Error('Task not found or access denied');
  }

  const task = mockTasks[taskIndex];
  task.completed = !task.completed;
  task.status = task.completed ? 'completed' : 'pending';
  task.updatedAt = new Date().toISOString();

  return task;
}
```

---

## API Client Layer

### File: `src/lib/api-client.ts`

**Purpose**: Generic fetch wrapper with JWT token injection

**Key Imports**:
```typescript
import { getSession } from '@/lib/auth';
```

**Exports**:
- `apiClient<T>(endpoint: string, options?: RequestInit): Promise<T>`

**Implementation**:
```typescript
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get JWT token from auth session
  const session = await getSession();
  const token = session?.token;

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make request
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  // Parse response
  return response.json() as Promise<T>;
}
```

**Usage in Service Layer**:
```typescript
// Future implementation
async function getAll(userId: string, filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  // ... add other filters

  return apiClient<Task[]>(`/api/${userId}/tasks?${params}`);
}
```

---

## Authentication Contracts

### File: `src/lib/auth.ts`

**Purpose**: Better Auth client configuration

**Key Imports**:
```typescript
import { createAuthClient } from 'better-auth/react';
import { jwtClient } from 'better-auth/client/plugins';
```

**Exports**:
- `authClient` - Auth client instance
- `signIn` - Sign in method
- `signUp` - Sign up method
- `signOut` - Sign out method
- `useSession` - Session hook
- `getSession` - Get current session

**Configuration**:
```typescript
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [jwtClient()]
});

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
export const useSession = authClient.useSession;
export const getSession = authClient.getSession;
```

---

## Error Handling

### Error Types

```typescript
interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
  status?: number;
}
```

### Error Handling Pattern

```typescript
try {
  const task = await api.create(userId, data);
} catch (error) {
  if (error.message.includes('validation')) {
    // Show form validation errors
  } else if (error.message.includes('authentication')) {
    // Redirect to login
  } else {
    // Show generic error message
  }
}
```

---

## Integration Checklist

### Current State (Mock Implementation)
- ✅ All method signatures defined
- ✅ TypeScript interfaces match backend schema
- ✅ Mock data store implemented
- ✅ TODO comments on all methods
- ✅ Error handling patterns

### Backend Integration Ready
- ✅ API client with JWT injection
- ✅ Endpoint structure defined
- ✅ Request/response formats documented
- ✅ Error taxonomy established
- ✅ Type safety maintained

### Next Steps for Backend Integration
1. Replace mock implementations with `fetch()` calls
2. Update `NEXT_PUBLIC_API_URL` environment variable
3. Add request/response logging
4. Implement retry logic for failed requests
5. Add proper error boundary handling

---

**Contract Status**: ✅ Backend Ready
**Mock Implementation**: ✅ Complete
**Integration Path**: ✅ Clear