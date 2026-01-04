# FastAPI Todo Backend

A production-ready FastAPI backend for the Todo application with JWT authentication, PostgreSQL database, and comprehensive CRUD operations.

## =� Features

- **FastAPI Framework**: High-performance Python web framework
- **JWT Authentication**: Secure token-based authentication using Better Auth secrets
- **PostgreSQL Database**: Neon Serverless PostgreSQL with connection pooling
- **SQLModel ORM**: Type-safe database models with Pydantic integration
- **Full CRUD Operations**: Create, Read, Update, Delete, and Toggle task completion
- **Advanced Filtering**: Filter by status, priority, category, and search
- **Multi-tenancy**: Zero-trust security with user-scoped queries
- **Structured Logging**: Comprehensive logging for monitoring and debugging
- **CORS Support**: Configured for frontend integration
- **Type Safety**: Full TypeScript-style type hints throughout

## =� API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| GET | `/api/{user_id}/tasks` | List tasks with filters |
| POST | `/api/{user_id}/tasks` | Create new task |
| GET | `/api/{user_id}/tasks/{task_id}` | Get single task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion |
| GET | `/api/{user_id}/stats` | Get task statistics |

## =� Technology Stack

- **Python**: 3.13+
- **FastAPI**: 0.128.0
- **SQLModel**: 0.0.31
- **PostgreSQL**: Neon Serverless
- **JWT**: python-jose with cryptography
- **uv**: Package manager

## =� Installation

### Prerequisites

- Python 3.13+
- uv package manager
- Neon PostgreSQL database
- BETTER_AUTH_SECRET (same as frontend)

### Setup

```bash
# Navigate to backend directory
cd phase-2/backend

# Install dependencies
uv sync

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# JWT Authentication (must match frontend Better Auth secret)
BETTER_AUTH_SECRET="your-secret-key"

# CORS
CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"

# API Server
API_HOST="0.0.0.0"
API_PORT="8000"

# Development
DEBUG="true"
```

## =� Running the Server

### Development Mode

```bash
# From backend directory
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# Using uvicorn directly
uv run uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 --workers 4

# Or using the backend script
uv run python -m src.backend.main
```

### Verify Installation

```bash
# Health check
curl http://localhost:8000/health

# Should return:
# {"status":"healthy","timestamp":"ok"}
```

## = Authentication

### JWT Token Format

The backend expects JWT tokens in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Bypass Mode (Development)

For development, you can enable bypass mode in the frontend `.env.local`:

```
NEXT_PUBLIC_AUTH_BYPASS=true
```

This generates bypass tokens that the backend will accept for testing.

## =� API Usage Examples

### List Tasks with Filtering

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:8000/api/user_123/tasks?status=pending&priority=high&category=work&sort_by=createdAt&sort_order=desc"
```

### Create Task

```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Buy groceries","priority":"high","category":"home"}' \
     http://localhost:8000/api/user_123/tasks
```

### Update Task

```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Updated title","priority":"medium"}' \
     http://localhost:8000/api/user_123/tasks/task_id_here
```

### Toggle Completion

```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/user_123/tasks/task_id_here/complete
```

### Get Statistics

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/user_123/stats
```

## =� Database Schema

### Tasks Table

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

## >� Testing

### Run All Tests

```bash
uv run pytest tests/ -v
```

### Run Specific Test

```bash
uv run pytest tests/test_api.py::test_health_check -v
```

### Test Coverage

```bash
uv run pytest tests/ --cov=src/backend --cov-report=html
```

## =� Project Structure

```
phase-2/backend/
