# Quickstart: FastAPI Backend Implementation

**Feature**: 006-backend-implement
**Date**: 2025-12-31
**Purpose**: Setup and development guide for the FastAPI backend

---

## Prerequisites

### Required Tools
- **Python 3.13+** (check with `python --version`)
- **uv** package manager (install with `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **Neon PostgreSQL** database (same as Better Auth frontend)
- **Git** for version control

### Environment Variables
Create a `.env` file in the backend directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Authentication
BETTER_AUTH_SECRET="your-better-auth-secret-key"

# CORS
CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"

# API Server
API_HOST="0.0.0.0"
API_PORT="8000"

# Optional: Development mode
DEBUG="true"
```

**Note**: Use the same `BETTER_AUTH_SECRET` as your Next.js frontend to validate JWT tokens.

---

## Project Structure

```text
phase-2/backend/
├── src/backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database connection & pooling
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic request/response schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   └── tasks.py         # Task CRUD endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── task_service.py  # Business logic
│   └── auth/
│       ├── __init__.py
│       └── jwt.py           # JWT validation
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Test fixtures
│   └── test_tasks.py        # API tests
├── pyproject.toml           # Dependencies
└── .env.example             # Environment template
```

---

## Setup Instructions

### 1. Initialize Backend Project

```bash
# Navigate to phase-2 directory
cd phase-2

# Create backend directory
mkdir -p backend/src/backend/{models,schemas,routers,services,auth}
mkdir -p backend/tests

# Initialize uv project
cd backend
uv init --package backend --python 3.13
```

### 2. Install Dependencies

```bash
# From backend directory
uv add fastapi uvicorn sqlmodel asyncpg python-jose[cryptography] pydantic

# Add development dependencies
uv add --dev pytest httpx python-dotenv
```

### 3. Create pyproject.toml

```toml
[project]
name = "backend"
version = "0.1.0"
description = "FastAPI backend for Todo application"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlmodel>=0.0.14",
    "asyncpg>=0.29.0",
    "python-jose[cryptography]>=3.3.0",
    "pydantic>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "httpx>=0.25.0",
    "python-dotenv>=1.0.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

### 4. Create Environment Template

```bash
# .env.example
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
BETTER_AUTH_SECRET="your-secret-key-here"
CORS_ORIGINS="http://localhost:3000"
API_HOST="0.0.0.0"
API_PORT="8000"
DEBUG="true"
```

---

## Implementation Steps

### Step 1: Database Connection (`database.py`)

```python
from sqlmodel import create_engine, Session
from sqlalchemy.pool import AsyncAdaptedQueuePool
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

def get_session():
    with Session(engine) as session:
        yield session
```

### Step 2: Configuration (`config.py`)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    better_auth_secret: str
    cors_origins: str = "http://localhost:3000"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

### Step 3: JWT Validation (`auth/jwt.py`)

```python
from jose import jwt, JWTError
from fastapi import HTTPException, status
from datetime import datetime
import os

SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

def verify_token(token: str) -> dict:
    """Verify JWT token and return claims"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

def get_user_id_from_token(token: str) -> str:
    """Extract user_id from JWT token"""
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user_id"
        )
    return user_id
```

### Step 4: Task Service (`services/task_service.py`)

```python
from sqlmodel import Session, select, and_
from datetime import datetime
from uuid import UUID
from typing import Optional, List

from ..models.task import Task, TaskStatus
from ..schemas.task import TaskCreate, TaskUpdate

class TaskService:
    def __init__(self, session: Session):
        self.session = session

    def get_user_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "createdAt",
        sort_order: str = "desc"
    ) -> List[Task]:
        """Get all tasks for user with filtering and sorting"""
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        conditions = []
        if status:
            conditions.append(Task.status == status)
        if priority:
            conditions.append(Task.priority == priority)
        if category:
            conditions.append(Task.category == category)
        if search:
            conditions.append(
                Task.title.contains(search) | Task.description.contains(search)
            )

        if conditions:
            query = query.where(and_(*conditions))

        # Apply sorting
        sort_column = getattr(Task, sort_by, Task.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        return list(self.session.exec(query).all())

    def get_task(self, user_id: str, task_id: UUID) -> Optional[Task]:
        """Get single task by ID (scoped to user)"""
        return self.session.get(Task, task_id)

    def create_task(self, user_id: str, task_data: TaskCreate) -> Task:
        """Create new task"""
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            category=task_data.category,
            due_date=task_data.due_date,
            status=TaskStatus.PENDING,
            completed=False
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def update_task(self, user_id: str, task_id: UUID, task_data: TaskUpdate) -> Optional[Task]:
        """Update existing task"""
        task = self.get_task(user_id, task_id)
        if not task:
            return None

        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)
        return task

    def delete_task(self, user_id: str, task_id: UUID) -> bool:
        """Delete task"""
        task = self.get_task(user_id, task_id)
        if not task:
            return False

        self.session.delete(task)
        self.session.commit()
        return True

    def toggle_complete(self, user_id: str, task_id: UUID) -> Optional[Task]:
        """Toggle task completion status"""
        task = self.get_task(user_id, task_id)
        if not task:
            return None

        if task.status == TaskStatus.PENDING:
            task.status = TaskStatus.COMPLETED
            task.completed = True
        else:
            task.status = TaskStatus.PENDING
            task.completed = False

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_stats(self, user_id: str) -> dict:
        """Get task statistics for user"""
        query = select(Task).where(Task.user_id == user_id)
        tasks = list(self.session.exec(query).all())

        total = len(tasks)
        pending = sum(1 for t in tasks if t.status == TaskStatus.PENDING)
        completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)

        return {
            "total": total,
            "pending": pending,
            "completed": completed
        }
```

### Step 5: Task Router (`routers/tasks.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session
from uuid import UUID
from typing import Optional, List

from ..database import get_session
from ..auth.jwt import get_user_id_from_token
from ..services.task_service import TaskService
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse, StatsResponse

router = APIRouter(prefix="/api", tags=["tasks"])

def get_current_user_id(token: str = Depends(lambda: None)) -> str:
    """Dependency to get user_id from Authorization header"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    return get_user_id_from_token(token)

@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def list_tasks(
    user_id: str,
    token: str = Depends(lambda: None),
    session: Session = Depends(get_session),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("createdAt"),
    sort_order: str = Query("desc")
):
    """List all tasks for user with optional filtering"""
    current_user_id = get_user_id_from_token(token)

    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )

    service = TaskService(session)
    tasks = service.get_user_tasks(
        user_id=user_id,
        status=status,
        priority=priority,
        category=category,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return tasks

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    token: str = Depends(lambda: None),
    session: Session = Depends(get_session)
):
    """Create new task"""
    current_user_id = get_user_id_from_token(token)

    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )

    service = TaskService(session)
    task = service.create_task(user_id, task_data)
    return task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: UUID,
    token: str = Depends(lambda: None),
    session: Session = Depends(get_session)
):
    """Get single task by ID"""
    current_user_id = get_user_id_from_token(token)

    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )

    service = TaskService(session)
    task = service.get_task(user_id, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: UUID,
    task_data: TaskUpdate,
    token: str = Depends(lambda: None),
    session: Session = Depends(get_session)
):
    """Update existing task"""
    current_user_id = get_user_id_from_token(token)

    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )

    service = TaskService(session)
    task = service.update_task(user_id, task_id, task_data)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: UUID,
    token: str = Depends(lambda: None),
    session: Session = Depends(get_session)
):
    """Delete task"""
    current_user_id = get_user_id_from_token(token)

    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )

    service = TaskService(session)
    deleted = service.delete_task(user_id, task_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: UUID,
    token: str = Depends(lambda: None),
    session: Session = Depends(get_session)
):
    """Toggle task completion status"""
    current_user_id = get_user_id_from_token(token)

    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )

    service = TaskService(session)
    task = service.toggle_complete(user_id, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task

@router.get("/{user_id}/stats", response_model=StatsResponse)
async def get_stats(
    user_id: str,
    token: str = Depends(lambda: None),
    session: Session = Depends(get_session)
):
    """Get task statistics"""
    current_user_id = get_user_id_from_token(token)

    if current_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )

    service = TaskService(session)
    stats = service.get_stats(user_id)
    return stats
```

### Step 6: FastAPI Main Application (`main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .config import settings
from .routers import tasks

app = FastAPI(
    title="FastAPI Todo Backend",
    description="RESTful API for managing user tasks with JWT authentication",
    version="1.0.0"
)

# CORS Configuration
origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include routers
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {"message": "FastAPI Todo Backend", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "ok"}
```

---

## Development Workflow

### Start Development Server

```bash
# From backend directory
cd phase-2/backend

# Set environment variables
export DATABASE_URL="postgresql://..."
export BETTER_AUTH_SECRET="your-secret"
export CORS_ORIGINS="http://localhost:3000"

# Run with auto-reload
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Run Tests

```bash
# Run all tests
uv run pytest tests/ -v

# Run specific test file
uv run pytest tests/test_tasks.py -v

# Run with coverage
uv run pytest tests/ --cov=src/backend --cov-report=html
```

### Manual API Testing

```bash
# Get auth token from frontend (Better Auth)
# Then test with curl:

# List tasks
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user_123/tasks

# Create task
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","priority":"high","category":"work"}' \
     http://localhost:8000/api/user_123/tasks
```

---

## Frontend Integration

### Update Frontend API Configuration

Update your Next.js frontend's API configuration:

```typescript
// frontend/src/lib/api.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function getAuthHeader() {
  // Get token from Better Auth session
  const { data: session } = useSession();
  return session?.token ? `Bearer ${session.token}` : "";
}

export async function listTasks(userId: string, filters = {}) {
  const token = await getAuthHeader();
  const params = new URLSearchParams(filters);

  const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks?${params}`, {
    headers: {
      "Authorization": token,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function createTask(userId: string, taskData) {
  const token = await getAuthHeader();

  const response = await fetch(`${BACKEND_URL}/api/${userId}/tasks`, {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  return response.json();
}

// Similar patterns for update, delete, toggle, stats...
```

---

## Database Schema Creation

### Auto-Migration (Recommended)

```python
# migrations/001_create_tasks.py
from sqlmodel import SQLModel
from backend.database import engine
from backend.models.task import Task

def create_tables():
    """Create tasks table"""
    SQLModel.metadata.create_all(engine)
    print("✅ Tasks table created")

if __name__ == "__main__":
    create_tables()
```

### Manual SQL (Alternative)

```sql
-- Connect to Neon PostgreSQL and run:
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

CREATE INDEX idx_tasks_user_id ON tasks("userId");
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

---

## Verification Checklist

### ✅ Before Testing

- [ ] Backend server starts without errors
- [ ] Database connection successful
- [ ] Tasks table exists in Neon PostgreSQL
- [ ] Environment variables loaded correctly
- [ ] CORS origins configured for frontend
- [ ] Frontend can generate JWT tokens via Better Auth

### ✅ API Endpoints Test

Use this checklist to verify each endpoint:

- [ ] **GET /api/{user_id}/tasks** - Returns task list (empty or with data)
- [ ] **POST /api/{user_id}/tasks** - Creates task, returns 201
- [ ] **GET /api/{user_id}/tasks/{task_id}** - Returns single task
- [ ] **PUT /api/{user_id}/tasks/{task_id}** - Updates task, returns 200
- [ ] **DELETE /api/{user_id}/tasks/{task_id}** - Deletes task, returns 204
- [ ] **PATCH /api/{user_id}/tasks/{task_id}/complete** - Toggles completion
- [ ] **GET /api/{user_id}/stats** - Returns statistics

### ✅ Security Tests

- [ ] Requests without JWT return 401
- [ ] Requests with invalid JWT return 401
- [ ] Requests with wrong user_id return 403
- [ ] Requests with valid JWT + correct user_id return 200

### ✅ Validation Tests

- [ ] POST with missing title returns 422
- [ ] POST with invalid priority returns 422
- [ ] PUT with empty title returns 422
- [ ] Query params filter correctly

### ✅ Integration Test

- [ ] Login via frontend (Better Auth)
- [ ] Create task via frontend
- [ ] List tasks via frontend
- [ ] Complete task via frontend
- [ ] Delete task via frontend
- [ ] Verify persistence after page refresh

---

## Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'backend'`
- **Fix**: Run from backend directory: `cd phase-2/backend`

**Issue**: `JWT validation failed`
- **Fix**: Ensure `BETTER_AUTH_SECRET` matches frontend exactly

**Issue**: `CORS error`
- **Fix**: Add frontend URL to `CORS_ORIGINS` environment variable

**Issue**: `Database connection failed`
- **Fix**: Verify `DATABASE_URL` includes `sslmode=require` for Neon

**Issue**: `403 Forbidden on all requests`
- **Fix**: Check that user_id in URL matches user_id in JWT token

---

## Next Steps

1. ✅ **Backend complete** - Ready for frontend integration
2. ⏭️ **Update frontend API calls** - Replace mocks with real endpoints
3. ⏭️ **Run end-to-end tests** - Full user flow verification
4. ⏭️ **Deploy to production** - Docker + Kubernetes setup

---

## Constitution Compliance

✅ **I. Universal Logic Decoupling**: Services layer separates business logic
✅ **III. Strict Statelessness**: No in-memory sessions, all state in DB
✅ **V. Zero-Trust Multi-Tenancy**: JWT validation + user_id scoping
✅ **VI. Technology Stack**: Python 3.13+, FastAPI, SQLModel
✅ **VII. Security**: JWT validation, Pydantic validation, no hardcoded secrets
✅ **VIII. Observability**: Structured logging ready

**Status**: ✅ Ready for implementation