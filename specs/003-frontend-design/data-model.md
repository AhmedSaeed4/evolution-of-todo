# Data Model: Todo Full-Stack Web Application Frontend

**Branch**: `003-frontend-design`
**Date**: 2025-12-29
**Constitution Version**: v1.1.0

---

## Entity Overview

The frontend data model consists of 5 core entities that mirror the backend FastAPI schema for seamless integration. All entities use TypeScript interfaces with strict typing and ISO 8601 date formats.

---

## Core Entities

### 1. Task Entity

**Purpose**: Represents a todo item with full lifecycle management

**Interface Definition**:
```typescript
// src/types/index.ts

export interface Task {
  id: string;                    // UUID, unique identifier
  title: string;                 // Required, max 200 chars
  description?: string;          // Optional, markdown supported
  priority: Priority;            // 'low' | 'medium' | 'high'
  category: Category;            // 'work' | 'personal' | 'home' | 'other'
  status: TaskStatus;            // 'pending' | 'completed'
  completed: boolean;            // Completion flag for quick checks
  dueDate?: string;              // ISO 8601: "2025-12-29T10:00:00Z"
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  userId: string;                // Foreign key to User entity
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters, non-empty string
- `description`: Optional, 0-1000 characters, supports markdown
- `priority`: Required, one of three discrete values
- `category`: Required, one of four discrete values
- `status`: Required, derived from `completed` boolean
- `dueDate`: Optional, must be valid ISO 8601 format if provided
- `userId`: Required, must match authenticated user

**State Transitions**:
```
pending ↔ completed
  ↓           ↓
[Edit]    [Toggle]
  ↓           ↓
pending ↔ completed
```

**Relationships**:
- Many-to-One: Task → User (via `userId`)
- Zero-to-One: Task → TaskFilters (for queries)

---

### 2. User Entity

**Purpose**: Represents an authenticated user account

**Interface Definition**:
```typescript
// src/types/index.ts

export interface User {
  id: string;                    // UUID, unique identifier
  email: string;                 // Valid email format
  name: string;                  // User's display name
}
```

**Validation Rules**:
- `id`: Required, UUID format
- `email`: Required, valid email format (RFC 5322)
- `name`: Required, 1-100 characters

**Relationships**:
- One-to-Many: User → Tasks (owns multiple tasks)

---

### 3. TaskFilters Entity

**Purpose**: Query parameters for filtering and sorting tasks

**Interface Definition**:
```typescript
// src/types/index.ts

export interface TaskFilters {
  status?: TaskStatus;           // Filter by completion status
  priority?: Priority;           // Filter by priority level
  category?: Category;           // Filter by category
  search?: string;               // Full-text search query
  sortBy?: 'dueDate' | 'priority' | 'title' | 'createdAt';  // Sort field
  sortOrder?: 'asc' | 'desc';    // Sort direction
}
```

**Validation Rules**:
- All fields are optional
- `search`: Debounced at 300ms, case-insensitive
- `sortBy`: Must be one of four allowed fields
- `sortOrder`: Must be 'asc' or 'desc'

**Query Behavior**:
- Multiple filters combine with AND logic
- Empty filters return all tasks for user
- Search performs substring match on title + description

---

### 4. CreateTaskDTO

**Purpose**: Data transfer object for task creation

**Interface Definition**:
```typescript
// src/types/index.ts

export interface CreateTaskDTO {
  title: string;                 // Required
  description?: string;          // Optional
  priority: Priority;            // Required
  category: Category;            // Required
  dueDate?: string;              // Optional ISO 8601
}
```

**Validation Rules**:
- Same as Task entity for shared fields
- No `id`, `userId`, `status`, `completed`, `createdAt`, `updatedAt` (auto-generated)
- All required fields must be present

**Form Mapping**:
```
TaskForm (Create Mode) → CreateTaskDTO
  Title Input          → title
  Description Input    → description
  Priority Select      → priority
  Category Select      → category
  Due Date Input       → dueDate
```

---

### 5. UpdateTaskDTO

**Purpose**: Data transfer object for task updates

**Interface Definition**:
```typescript
// src/types/index.ts

export interface UpdateTaskDTO {
  title?: string;                // Optional
  description?: string;          // Optional
  priority?: Priority;           // Optional
  category?: Category;           // Optional
  dueDate?: string;              // Optional ISO 8601
}
```

**Validation Rules**:
- All fields are optional
- At least one field must be provided
- Same validation as Task entity for provided fields

**Form Mapping**:
```
TaskForm (Edit Mode) → UpdateTaskDTO
  Title Input          → title (if changed)
  Description Input    → description (if changed)
  Priority Select      → priority (if changed)
  Category Select      → category (if changed)
  Due Date Input       → dueDate (if changed)
```

---

## Type Definitions

### Priority Type

```typescript
export type Priority = 'low' | 'medium' | 'high';
```

**Visual Indicators**:
- `high`: Red/Orange accent (#FF6B4A)
- `medium`: Yellow/Amber accent (#F59E0B)
- `low`: Green/Muted accent (#10B981)

**Usage**:
- Task card left border color
- Badge background color
- Filter dropdown options

---

### Category Type

```typescript
export type Category = 'work' | 'personal' | 'home' | 'other';
```

**Visual Indicators**:
- `work`: Briefcase icon
- `personal`: User icon
- `home`: Home icon
- `other`: Tag icon

**Usage**:
- Task card category badge
- Filter dropdown options
- Form selection

---

### TaskStatus Type

```typescript
export type TaskStatus = 'pending' | 'completed';
```

**Derived Logic**:
```typescript
const status: TaskStatus = task.completed ? 'completed' : 'pending';
```

**Visual Indicators**:
- `pending`: Normal opacity, no strikethrough
- `completed`: Reduced opacity (0.6), strikethrough title, faded colors

---

## Data Flow Patterns

### 1. Create Task Flow

```
User Action → Form State → CreateTaskDTO → Mock API → Task Entity → UI Update
  Click        Fill         Validate        Add to        Render
  "Add"        Fields       & Post          Mock Store    with Animation
```

**Steps**:
1. User clicks "Add Task" button
2. Modal opens with empty form
3. User fills CreateTaskDTO fields
4. Form validation passes
5. Mock API adds to `mockTasks[]` with generated ID/timestamps
6. New Task appears in list with stagger animation

---

### 2. Update Task Flow

```
User Action → Form State → UpdateTaskDTO → Mock API → Task Entity → UI Update
  Edit         Pre-fill     Validate        Update        Highlight
  Icon         Fields       & Put           Mock Store    Animation
```

**Steps**:
1. User clicks edit icon on TaskCard
2. Modal opens with pre-filled Task data
3. User modifies fields
4. Form validation passes
5. Mock API updates `mockTasks[id]`
6. TaskCard updates with highlight animation

---

### 3. Filter/Sort Flow

```
User Input → TaskFilters → Debounce → Filter Logic → Sorted Tasks → UI Update
  Search     Object       (300ms)    useMemo        Layout
  or Select                           & sort         Animation
```

**Steps**:
1. User types in search or selects filter
2. TaskFilters state updates
3. Debounce waits 300ms
4. useMemo applies filters + sorts
5. TaskList re-renders with layout animation

---

### 4. Authentication Flow

```
User Action → Auth State → Session → Protected Route → Redirect or Render
  Login        Update      Token    Check            Dashboard / Login
```

**Steps**:
1. User submits login form
2. Better Auth validates credentials
3. Session established with JWT
4. ProtectedRoute checks auth
5. Redirect to `/tasks` or `/login`

---

## Mock Data Structure

### Initial Mock Store

```typescript
// src/lib/api.ts

let mockTasks: Task[] = [
  {
    id: "1",
    title: "Design database schema",
    description: "Create ERD for task management system",
    priority: "high",
    category: "work",
    status: "pending",
    completed: false,
    dueDate: "2025-12-30T17:00:00Z",
    createdAt: "2025-12-29T10:00:00Z",
    updatedAt: "2025-12-29T10:00:00Z",
    userId: "user-1"
  },
  {
    id: "2",
    title: "Buy groceries",
    description: "Milk, eggs, bread",
    priority: "low",
    category: "home",
    status: "completed",
    completed: true,
    createdAt: "2025-12-28T14:30:00Z",
    updatedAt: "2025-12-29T09:00:00Z",
    userId: "user-1"
  }
];

let mockUsers: User[] = [
  {
    id: "user-1",
    email: "demo@example.com",
    name: "Demo User"
  }
];
```

---

## Backend Integration Points

### API Endpoints (Future FastAPI)

All methods include TODO comments for future implementation:

```typescript
// src/lib/api.ts

// TODO: Replace with fetch() to FastAPI endpoint
// TODO: POST /api/{user_id}/tasks
async function create(userId: string, data: CreateTaskDTO): Promise<Task> {
  // Mock implementation
  const newTask: Task = {
    id: generateUUID(),
    ...data,
    status: 'pending',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId
  };
  mockTasks.push(newTask);
  return newTask;
}

// TODO: Replace with fetch() to FastAPI endpoint
// TODO: GET /api/{user_id}/tasks?status=pending&priority=high
async function getAll(userId: string, filters?: TaskFilters): Promise<Task[]> {
  // Mock implementation with filtering
  return mockTasks
    .filter(task => task.userId === userId)
    .filter(task => !filters?.status || task.status === filters.status)
    .filter(task => !filters?.priority || task.priority === filters.priority)
    // ... more filters
    .sort(/* sort logic */);
}
```

---

## Type Safety Guarantees

### Compile-Time Validation

```typescript
// ✅ Valid
const task: Task = {
  id: "123",
  title: "Valid task",
  priority: "high",        // Correct enum
  category: "work",        // Correct enum
  status: "pending",       // Correct enum
  completed: false,
  createdAt: "2025-12-29T10:00:00Z",
  updatedAt: "2025-12-29T10:00:00Z",
  userId: "user-1"
};

// ❌ Invalid - TypeScript will error
const invalidTask: Task = {
  id: "123",
  title: "Invalid task",
  priority: "critical",    // Error: not in union
  category: "business",    // Error: not in union
  status: "in-progress",   // Error: not in union
  completed: false,
  createdAt: "2025-12-29T10:00:00Z",
  updatedAt: "2025-12-29T10:00:00Z",
  userId: "user-1"
};
```

---

## Migration Path to Backend

### Phase 1: Mock Implementation
- In-memory store (`mockTasks[]`, `mockUsers[]`)
- Immediate return, no network latency
- TODO comments on all methods

### Phase 2: Backend Integration
- Replace mock with `fetch()` calls
- Add JWT token injection via `api-client.ts`
- Handle network errors and loading states
- Maintain same TypeScript interfaces

### Phase 3: Production Ready
- Add proper error handling
- Implement retry logic
- Add request/response logging
- Performance optimization

---

**Data Model Status**: ✅ Complete
**Backend Compatibility**: ✅ Verified
**Type Safety**: ✅ Enforced