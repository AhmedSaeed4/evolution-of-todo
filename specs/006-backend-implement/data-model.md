# Data Model: FastAPI Backend for Todo Application

**Feature**: 006-backend-implement
**Date**: 2025-12-31
**Source**: Feature spec + research findings

---

## Entity: Task

### Core Entity Definition

The **Task** entity represents a single todo item belonging to a user. It is the primary entity in the backend system.

### SQLModel Definition (Python)

```python
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel
from enum import Enum

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TaskCategory(str, Enum):
    WORK = "work"
    PERSONAL = "personal"
    HOME = "home"
    OTHER = "other"

class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class Task(SQLModel, table=True):
    """Core task entity - stored in tasks table"""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    priority: TaskPriority = Field(nullable=False)
    category: TaskCategory = Field(nullable=False)
    status: TaskStatus = Field(default=TaskStatus.PENDING, nullable=False)
    completed: bool = Field(default=False, nullable=False)
    due_date: Optional[datetime] = Field(default=None, nullable=True, sa_column_kwargs={"name": "dueDate"})
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, sa_column_kwargs={"name": "createdAt"})
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, sa_column_kwargs={"name": "updatedAt"})
    user_id: str = Field(nullable=False, foreign_key="user.id", sa_column_kwargs={"name": "userId"})

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
            TaskPriority: lambda v: v.value,
            TaskCategory: lambda v: v.value,
            TaskStatus: lambda v: v.value
        }
```

### Database Schema (SQL)

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('work', 'personal', 'home', 'other')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    completed BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX idx_tasks_user_id ON tasks("userId");
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_due_date ON tasks("dueDate");
```

### Field Validation Rules

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key |
| title | string | Yes | 1-255 chars | Task description |
| description | string | No | Max 1000 chars | Additional details |
| priority | enum | Yes | low/medium/high | Task importance |
| category | enum | Yes | work/personal/home/other | Task context |
| status | enum | Yes | pending/completed | Current state |
| completed | boolean | Yes | Default false | Completion flag |
| due_date | datetime | No | ISO 8601 | Optional deadline |
| created_at | datetime | Yes | Auto-generated | Creation timestamp |
| updated_at | datetime | Yes | Auto-updated | Last modification |
| user_id | string | Yes | Foreign key | Owner reference |

---

## State Transitions

### Completion State Machine

```
pending → completed (via PATCH /complete)
completed → pending (via PATCH /complete)
```

**Rules**:
- `status` and `completed` must always be synchronized
- When `status='completed'`, `completed=true`
- When `status='pending'`, `completed=false`
- Transition updates `updated_at` timestamp

---

## Relationships

### User ↔ Task (One-to-Many)

- **User**: One user can have many tasks
- **Task**: Each task belongs to exactly one user
- **Constraint**: `ON DELETE CASCADE` - deleting user deletes all their tasks
- **Reference**: `tasks.userId` → `user.id`

---

## Query Patterns

### Common Queries

1. **List all tasks for user**
   ```sql
   SELECT * FROM tasks WHERE "userId" = $1
   ```

2. **Filter by status**
   ```sql
   SELECT * FROM tasks WHERE "userId" = $1 AND status = $2
   ```

3. **Filter by priority**
   ```sql
   SELECT * FROM tasks WHERE "userId" = $1 AND priority = $2
   ```

4. **Filter by category**
   ```sql
   SELECT * FROM tasks WHERE "userId" = $1 AND category = $2
   ```

5. **Search in title/description**
   ```sql
   SELECT * FROM tasks
   WHERE "userId" = $1
   AND (title ILIKE $2 OR description ILIKE $2)
   ```

6. **Get statistics**
   ```sql
   SELECT
     COUNT(*) as total,
     COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
     COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
   FROM tasks WHERE "userId" = $1
   ```

---

## Pydantic Schemas

### Request Schemas

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from .task import TaskPriority, TaskCategory

class TaskCreate(BaseModel):
    """POST /api/{user_id}/tasks - Create task"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: TaskPriority
    category: TaskCategory
    due_date: Optional[datetime] = None

    @field_validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

class TaskUpdate(BaseModel):
    """PUT /api/{user_id}/tasks/{task_id} - Update task"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[TaskPriority] = None
    category: Optional[TaskCategory] = None
    due_date: Optional[datetime] = None

    @field_validator('title')
    def title_not_empty(cls, v):
        if v and not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip() if v else v

class TaskComplete(BaseModel):
    """PATCH /api/{user_id}/tasks/{task_id}/complete - Toggle completion"""
    # No fields needed - just toggle action
    pass
```

### Response Schemas

```python
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional
from .task import TaskPriority, TaskCategory, TaskStatus

class TaskResponse(BaseModel):
    """Standard task response"""
    id: UUID
    title: str
    description: Optional[str]
    priority: TaskPriority
    category: TaskCategory
    status: TaskStatus
    completed: bool
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    user_id: str

class StatsResponse(BaseModel):
    """GET /api/{user_id}/stats - Statistics response"""
    total: int
    pending: int
    completed: int
```

---

## Validation Rules Summary

### Create Task (Required Fields)
- ✅ `title`: 1-255 chars, non-empty
- ✅ `priority`: one of low/medium/high
- ✅ `category`: one of work/personal/home/other

### Update Task (Optional Fields)
- ✅ Any field can be updated independently
- ✅ `title`: if provided, must be 1-255 chars, non-empty
- ✅ `due_date`: must be valid datetime

### Query Parameters (List Tasks)
- ✅ `status`: pending/completed (optional)
- ✅ `priority`: low/medium/high (optional)
- ✅ `category`: work/personal/home/other (optional)
- ✅ `search`: free text search (optional)
- ✅ `sort_by`: dueDate/priority/title/createdAt (optional, default: createdAt)
- ✅ `sort_order`: asc/desc (optional, default: desc)

---

## Index Strategy

### Primary Indexes
1. **User-scoped queries**: `idx_tasks_user_id` - Essential for multi-tenancy
2. **Status filtering**: `idx_tasks_status` - Common filter
3. **Priority filtering**: `idx_tasks_priority` - Common filter
4. **Category filtering**: `idx_tasks_category` - Common filter

### Secondary Indexes
5. **Due date sorting**: `idx_tasks_due_date` - For deadline-based queries

### Composite Indexes (Future Optimization)
If needed for complex queries:
```sql
CREATE INDEX idx_tasks_user_status ON tasks("userId", status);
CREATE INDEX idx_tasks_user_priority ON tasks("userId", priority);
```

---

## Data Consistency Rules

### Atomic Operations
All state changes must be wrapped in transactions:
- Task creation
- Task updates
- Task deletion
- Completion toggle

### Synchronization Requirements
- `updated_at` must be updated on every modification
- `completed` boolean must match `status` enum
- Foreign key constraint ensures user exists

---

## Migration Strategy

### Initial Setup
```python
# migrations/001_create_tasks_table.py
from sqlmodel import SQLModel
from backend.database import engine
from backend.models.task import Task

def migrate():
    SQLModel.metadata.create_all(engine)
```

### Future Migrations
- Add new columns with defaults
- Add new indexes as needed
- No breaking changes to existing columns

---

## Constitution Compliance

✅ **III.B. Data Consistency & Schema**: Strict typing with Pydantic + SQLModel
✅ **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id
✅ **VII. Observability**: All CRUD operations logged with user_id and timestamp
✅ **VIII. Compliance**: Schema defined, validation rules clear, indexes planned

---

## Next Steps

1. ✅ **Data model complete** - Ready for implementation
2. ⏭️ **Create API contracts** - OpenAPI schemas
3. ⏭️ **Generate quickstart.md** - Setup instructions
4. ⏭️ **Update agent context** - Add FastAPI/SQLModel knowledge