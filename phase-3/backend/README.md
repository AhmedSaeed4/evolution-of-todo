# Phase 3: AI Chatbot Backend

> Production-ready AI-powered chatbot backend using OpenAI Agents SDK with Xiaomi mimo-v2-flash model and MCP integration, built on top of the Phase 2 FastAPI backend.

## 🎯 Overview

**Phase 3** enhances the existing Phase 2 backend with AI chatbot capabilities:

### Phase 3 AI Chatbot Features
- **Dual-Agent System**: Orchestrator + Urdu Specialist agents
- **Xiaomi Model**: mimo-v2-flash via OpenAI Agents SDK
- **MCP Integration**: 7 task management tools with user isolation
- **Bilingual Support**: English + Urdu language responses
- **User Isolation**: Enhanced input with user context preservation
- **Tool Calling**: Automatic tool selection and execution

### Phase 2 Backend Features (Inherited)
- **FastAPI Framework**: High-performance Python web framework
- **JWT Authentication**: Secure token-based authentication using Better Auth secrets
- **PostgreSQL Database**: Neon Serverless PostgreSQL with connection pooling
- **SQLModel ORM**: Type-safe database models with Pydantic integration
- **Full CRUD Operations**: Create, Read, Update, Delete, and Toggle task completion
- **Advanced Filtering**: Filter by status, priority, category, and search
- **Multi-tenancy**: Zero-trust security with user-scoped queries
- **Structured Logging**: Comprehensive logging for monitoring and debugging
- **CORS Support**: Configured for frontend integration
- **Type Safety**: Full Python type hints throughout

**Status**: 🚧 **IN PROGRESS** (ChatKit frontend integration pending)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **AI Model** | Xiaomi mimo-v2-flash | Primary language model |
| **Agent SDK** | OpenAI Agents SDK | Agent orchestration |
| **MCP Server** | FastMCP | Tool integration |
| **Backend** | FastAPI 0.128.0 | Async Python web framework |
| **ORM** | SQLModel 0.0.31 | Pydantic + SQLAlchemy hybrid |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL |
| **Auth** | JWT via Better Auth | User authentication |
| **Driver** | asyncpg | High-performance async DB driver |
| **JWT** | python-jose | Token generation/validation |
| **Language** | Python 3.13+ | Core implementation |

### System Flow

```
User → Chat Endpoint → Agent Router → Tool Execution → Database
                    ↓
            Enhanced Input (user_id context)
                    ↓
         Bilingual Response (English/Urdu)
```

---

## 📁 Project Structure

```
phase-3/backend/
├── src/backend/
│   ├── agents.py              # Dual-agent system (Orchestrator + Urdu)
│   ├── main.py                # FastAPI with chat endpoint
│   ├── task_serves_mcp_tools.py # MCP server with 7 tools
│   ├── config.py              # Environment configuration
│   ├── database.py            # Neon PostgreSQL connection
│   ├── models/                # SQLModel entities
│   │   └── task.py           # Task model
│   ├── schemas/               # Pydantic schemas
│   │   └── task.py           # Task schemas (camelCase)
│   ├── routers/               # API endpoints
│   │   └── tasks.py          # Task CRUD routes
│   ├── services/              # Business logic
│   │   └── task_service.py   # Task operations
│   └── auth/                  # JWT validation
│       └── jwt.py            # Better Auth JWKS integration
├── tests/                     # API tests
├── pyproject.toml            # Python dependencies
└── .env.example              # Environment template
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+**
- **uv package manager**
- **Neon PostgreSQL database**
- **Xiaomi API Key** (for mimo-v2-flash model)
- **BETTER_AUTH_SECRET** (same as frontend)

### 1. Environment Setup

```bash
# Navigate to backend directory
cd phase-3/backend

# Install dependencies
uv sync

# Create environment file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
BETTER_AUTH_SECRET="your-generated-secret-key"
XIAOMI_API_KEY="your-xiaomi-api-key"
CORS_ORIGINS="http://localhost:3000"
API_HOST="0.0.0.0"
API_PORT="8000"
DEBUG="true"
EOF
```

### 2. Run the Server

```bash
# Development mode
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uv run uvicorn src.backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 3. Test the Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Chat with the agent (requires JWT token)
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a task: Buy milk", "user_id": "user_123"}' \
  http://localhost:8000/chat

# Traditional API endpoints (still available)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user_123/tasks
```

---

## 🤖 Agent System

### Dual-Agent Architecture

**Orchestrator Agent** (`orchestrator_agent`):
- Main coordinator for task management
- Language detection (English/Urdu)
- Direct tool calling (no handoffs)
- Responds in same language as user

**Urdu Specialist Agent** (`urdu_agent`):
- Urdu language specialist
- Responds exclusively in Urdu
- Immediate tool calling (no describing)
- Culturally appropriate responses

### Language Detection

The system automatically detects language based on Urdu characters:
- **Urdu characters**: آ, ب, پ, ت, ث, ج, چ, ح, خ, د, ذ, ر, ز, س, ش, ص, ض, ط, ظ, ع, غ, ف, ق, ک, گ, ل, م, ن, و, ه, ی, ے
- **Response**: Matches user's language

---

## 🔧 MCP Tools

### Available Tools (7 total)

| Tool | Parameters | Purpose |
|------|------------|---------|
| `create_task` | user_id, title, description, priority, category, due_date | Create new task |
| `list_tasks` | user_id, status, priority, category, search, sort_by, sort_order | List filtered tasks |
| `get_task` | user_id, task_id | Get single task |
| `update_task` | user_id, task_id, title, description, priority, category, due_date | Update task |
| `delete_task` | user_id, task_id | Delete task |
| `toggle_complete` | user_id, task_id | Toggle completion |
| `get_stats` | user_id | Get task statistics |

### Tool Usage Examples

**English:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a high priority task for work: Finish project report due tomorrow", "user_id": "user_123"}' \
  http://localhost:8000/chat
```

**Urdu:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "نیا ٹاسک بنائیں: کل کی ڈیڈ لائن کے ساتھ پراجیکٹ رپورٹ مکمل کریں", "user_id": "user_123"}' \
  http://localhost:8000/chat
```

---

## 🔐 Authentication

### JWT Integration

The backend expects JWT tokens in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### User Context Flow

1. **JWT Token** contains `user_id`
2. **Enhanced Input** adds user context to agent
3. **MCP Tools** receive `user_id` for data isolation
4. **Database Queries** scoped to user

### Bypass Mode (Development)

For testing, enable bypass mode in frontend:
```bash
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > phase-3/frontend/.env.local
```

---

## 📊 API Endpoints

### AI Chat Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/chat` | Chat with AI agents |

### Traditional Task Endpoints (MCP Tools)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/{user_id}/tasks` | List tasks with filters |
| POST | `/api/{user_id}/tasks` | Create new task |
| GET | `/api/{user_id}/tasks/{task_id}` | Get single task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion |
| GET | `/api/{user_id}/stats` | Get task statistics |

---

## 🧪 Testing

### Run All Tests

```bash
cd phase-3/backend
uv run pytest tests/ -v
```

### Test Chat Endpoint

```bash
# Test with English
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "List my tasks", "user_id": "user_123"}' \
  http://localhost:8000/chat

# Test with Urdu
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "تمام ٹاسکس دکھائیں", "user_id": "user_123"}' \
  http://localhost:8000/chat
```

### Manual Testing Checklist

- ✅ Agent responds in same language as user
- ✅ Urdu agent uses proper formatting (line breaks, spacing)
- ✅ Tool calling works immediately (no describing)
- ✅ Due dates are properly saved (camelCase parameter)
- ✅ User isolation enforced (can't access other users' tasks)
- ✅ Agent name properly detected in responses
- ✅ Traditional CRUD endpoints still work
- ✅ JWT authentication works for both chat and API endpoints

### Test Coverage

```bash
uv run pytest tests/ --cov=src/backend --cov-report=html
```

---

## 🗄️ Database Schema

### Tasks Table (Inherited from Phase 2)

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

---

## 🔗 Related Documentation

- **Main Project**: [../../README.md](../../README.md)
- **Spec 009**: [../../specs/009-agents-mcp/spec.md](../../specs/009-agents-mcp/spec.md)
- **Phase 2 Backend**: [../../phase-2/backend/README.md](../../phase-2/backend/README.md)
- **OpenAI Agents SDK**: [../../.claude/skills/openai-agents-sdk/SKILL.md](../../.claude/skills/openai-agents-sdk/SKILL.md)
- **MCP Integration**: [../../.claude/skills/mcp-integration/SKILL.md](../../.claude/skills/mcp-integration/SKILL.md)
- **Phase 3 History**: [../../history/prompts/009-agents-mcp/](../../history/prompts/009-agents-mcp/)

---

## 🎯 Success Criteria (Phase III)

### ✅ Completed
- [x] Dual-agent system (Orchestrator + Urdu Specialist)
- [x] Xiaomi mimo-v2-flash model integration
- [x] MCP server with 7 task management tools
- [x] User isolation via JWT + enhanced input
- [x] Bilingual support (English/Urdu)
- [x] Automatic language detection
- [x] Immediate tool calling (no describing)
- [x] Proper response formatting
- [x] Due date parameter fix (camelCase)
- [x] Agent name detection in responses
- [x] All Phase 2 backend features preserved
- [x] Traditional CRUD endpoints still functional
- [x] JWT authentication for both chat and API

### 🚧 Pending
- [ ] ChatKit frontend integration
- [ ] Real-time streaming responses
- [ ] Conversation history
- [ ] Advanced UI for chat interface

---

## 🚀 Next Phase: ChatKit Integration

**Upcoming Branch**: `010-chatkit-integration`

- **Frontend**: React chat interface with OpenAI ChatKit
- **Streaming**: Real-time agent responses
- **Context**: Conversation history and memory
- **Tools**: Client-side tool integration
- **UI**: Modern chat interface with animations

---

**Phase III Backend Complete** ✅
*Built with ❤️ using Spec-Driven Development & OpenAI Agents SDK*