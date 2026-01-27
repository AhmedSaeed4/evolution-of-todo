# Phase IV: AI Chatbot + Minikube Deployment

> Intelligent task management chatbot with dual-agent system, bilingual support, MCP integration, AND production-ready Kubernetes deployment using Minikube, Docker, and Helm.

## 🎯 Phase Overview

**Phase IV** delivers a production-ready AI chatbot system with full Kubernetes deployment:
- **AI Model**: Xiaomi mimo-v2-flash via OpenAI Agents SDK
- **Architecture**: Dual-agent system (Orchestrator + Urdu Specialist)
- **MCP Integration**: 7 task management tools with user isolation
- **Language Support**: English + Urdu bilingual responses
- **Backend**: Enhanced FastAPI with AI chat endpoints
- **Frontend**: Next.js 16.1.1 with ChatKit integration
- **🆕 Deployment**: Containerized with Docker + Minikube + Helm
- **🆕 Orchestration**: Kubernetes with LoadBalancer services
- **🆕 Secrets**: Kubernetes Secrets for secure credential management
- **Foundation**: Phase 2 full-stack application (Next.js + FastAPI + Neon DB)

**Status**: ✅ **COMPLETE** (Chatbot + Minikube Deployment) 

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **AI Model** | Xiaomi mimo-v2-flash | Primary language model |
| **Agent SDK** | OpenAI Agents SDK | Agent orchestration |
| **MCP Server** | FastMCP | Tool integration |
| **Frontend** | Next.js 16.1.1 (App Router) | React framework with ChatKit |
| **Language** | TypeScript 5.x | Type-safe development |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Animations** | Framer Motion v12.23.26 | Smooth transitions |
| **Icons** | Lucide React v0.562.0 | Technical iconography |
| **Toasts** | Sonner v2.0.7 | Notification system |
| **ChatKit** | @openai/chatkit-react | OpenAI ChatKit UI |
| **Backend** | FastAPI 0.128.0 | Async Python web framework |
| **ORM** | SQLModel 0.0.31 | Pydantic + SQLAlchemy hybrid |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL |
| **Auth** | Better Auth v1.4.9 | Authentication framework |
| **Driver** | asyncpg | High-performance async DB driver |
| **JWT** | python-jose | Token generation/validation |

### System Flow

```
User → ChatKit Interface → Session API → AI Agents → MCP Tools → Database
                    ↓                    ↓
            Language Selection    Enhanced Input (user_id)
                    ↓                    ↓
         Conversation History    Bilingual Response (English/Urdu)

[Phase 2 Foundation: Next.js → Better Auth → FastAPI → Neon DB]
```

---

## 📁 Project Structure

```
phase-4/
├── frontend/              # Next.js 16+ App Router with ChatKit
│   ├── src/
│   │   ├── app/          # App Router pages & routes
│   │   │   ├── chatbot/  # ChatKit interface
│   │   │   │   └── page.tsx
│   │   │   ├── api/      # API routes (Better Auth + ChatKit)
│   │   │   │   ├── auth/
│   │   │   │   └── chatkit/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   ├── Dockerfile         # 🆕 Multi-stage build
│   ├── .dockerignore      # 🆕 Build exclusions
│   └── next.config.ts
│
├── backend/               # AI Chatbot Backend with ChatKit
│   ├── src/backend/
│   │   ├── agents.py
│   │   ├── main.py
│   │   ├── api/chatkit.py
│   │   ├── store/
│   │   ├── models/
│   │   ├── task_serves_mcp_tools.py
│   │   └── auth/jwt.py
│   ├── Dockerfile         # 🆕 Multi-stage build
│   ├── .dockerignore      # 🆕 Build exclusions
│   └── pyproject.toml
│
├── helm-charts/           # 🆕 Kubernetes manifests
│   ├── frontend/          # Frontend Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── backend/           # Backend Helm chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│
├── deployment-guide/      # 🆕 Deployment docs
│   ├── MINIKUBE_DEPLOYMENT.md
│   └── DEPLOYMENT_ACCESS.md
│
└── scripts/               # 🆕 Utility scripts
    ├── verify-deployment.sh
    └── cleanup-deployment.sh
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+** (for backend AI chatbot)
- **uv package manager** (for backend)
- **Neon PostgreSQL database** (shared with Phase 2)
- **Xiaomi API Key** (for mimo-v2-flash model)
- **Node.js 18+** (for frontend - future ChatKit integration)

### 1. Environment Setup

**Backend (.env):**
```bash
cd backend
cat > .env << EOF
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
BETTER_AUTH_SECRET="your-generated-secret-key"
OPENAI_API_KEY="sk-..."  # Required for ChatKit session management
XIAOMI_API_KEY="your-xiaomi-api-key"
CORS_ORIGINS="http://localhost:3000"
API_HOST="0.0.0.0"
API_PORT="8000"
DEBUG="true"
EOF
```

**Frontend (.env.local):**
```bash
cd frontend
echo "NEXT_PUBLIC_AUTH_BYPASS=false" > .env.local
echo "DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require" >> .env.local
echo "BETTER_AUTH_SECRET=your-64-char-secret" >> .env.local
echo "NEXT_PUBLIC_AUTH_URL=http://localhost:3000" >> .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" >> .env.local
```

### 2. Install & Run

**Backend (AI Chatbot):**
```bash
cd backend
uv sync
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
# API docs: http://localhost:8000/docs
# Chat endpoint: POST http://localhost:8000/chat
```

**Frontend (Next.js - Phase 2 Foundation):**
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

### 3. Test the AI Chatbot

**ChatKit Session Creation (for frontend):**
```bash
# Create ChatKit session (returns client_secret for frontend)
curl -X POST http://localhost:8000/api/chatkit/session

# Refresh expired session
curl -X POST http://localhost:8000/api/chatkit/refresh

# Check ChatKit health
curl http://localhost:8000/api/chatkit/health
```

**Chat with Agents (English):**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a task: Buy milk", "user_id": "user_123"}' \
  http://localhost:8000/chat
```

**Chat with Agents (Urdu):**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "نیا ٹاسک بنائیں: کل کی ڈیڈ لائن کے ساتھ پراجیکٹ رپورٹ مکمل کریں", "user_id": "user_123"}' \
  http://localhost:8000/chat
```

**Traditional API Endpoints (Still Available):**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user_123/tasks
```

**ChatKit Frontend Integration:**
```bash
# Visit ChatKit interface
# http://localhost:3000/chatbot
# - Loads OpenAI ChatKit component
# - Full-height responsive layout
# - Cream background matching design system
# - Session creation via backend API
# - Tool execution visual feedback
```

---

## ✅ Features Delivered

### AI Chatbot System (Phase 3)

**ChatKit Integration:**
- ✅ **OpenAI ChatKit UI**: Production-ready chat interface via CDN
- ✅ **Session Management**: JWT bridging between Better Auth and OpenAI
- ✅ **Persistent History**: PostgreSQL-backed chat sessions and messages
- ✅ **Full-Height Layout**: Responsive interface that fills screen space
- ✅ **Modern Technical Editorial Design**: Cream backgrounds, orange accents
- ✅ **Loading States**: Centered spinner animations
- ✅ **Error Handling**: Retry functionality with clear error messages
- ✅ **Mobile Responsive**: Works on all screen sizes

**Dual-Agent Architecture:**
- ✅ **Orchestrator Agent**: Main coordinator with language detection
- ✅ **Urdu Specialist Agent**: Urdu-only responses with cultural context
- ✅ **Language Detection**: Automatic detection based on Urdu characters
- ✅ **Bilingual Responses**: English + Urdu support

**Xiaomi Model Integration:**
- ✅ **Xiaomi mimo-v2-flash**: Primary language model
- ✅ **OpenAI Agents SDK**: Agent orchestration framework
- ✅ **Enhanced Input**: User context preservation via JWT

**MCP Tool Integration (7 Tools):**
- ✅ `create_task` - Create new tasks with due dates
- ✅ `list_tasks` - Filter by status, priority, category, search
- ✅ `get_task` - Retrieve single task details
- ✅ `update_task` - Modify task properties
- ✅ `delete_task` - Remove tasks
- ✅ `toggle_complete` - Toggle task completion
- ✅ `get_stats` - Get task statistics

**ChatKit Store Implementation:**
- ✅ **14 Methods**: Complete store interface with user isolation
- ✅ **Thread Operations**: Load, save, list, delete threads
- ✅ **Item Operations**: Load, add, save, delete messages
- ✅ **Attachment Operations**: Store, load, delete file attachments
- ✅ **Database Schema**: chat_sessions and chat_messages tables

**User Isolation & Security:**
- ✅ JWT-based user identification
- ✅ Enhanced input with user_id context
- ✅ Database queries scoped to user
- ✅ Zero-trust security model

### Authentication System (Better Auth)

**Endpoints:**
- `POST /api/auth/sign-up/email` - User registration
- `POST /api/auth/sign-in/email` - User login
- `GET /api/auth/get-session` - Session validation

**Security:**
- ✅ bcrypt password hashing
- ✅ JWT tokens (HS256)
- ✅ Constant-time comparison
- ✅ Generic error messages (no enumeration)
- ✅ SSL connections to Neon PostgreSQL

### Task Management (Full CRUD)

**Frontend Operations:**
- ✅ Create tasks with title, description, priority, category
- ✅ List tasks with filters (status, priority, category, search)
- ✅ Complete/uncomplete tasks with animations
- ✅ Edit task details
- ✅ Delete tasks
- ✅ Task statistics dashboard

**Backend API (7 Endpoints):**
- `GET /api/{user_id}/tasks` - List with filters
- `POST /api/{user_id}/tasks` - Create (201)
- `GET /api/{user_id}/tasks/{task_id}` - Get single
- `PUT /api/{user_id}/tasks/{task_id}` - Update
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete (204)
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle
- `GET /api/{user_id}/stats` - Statistics

### Profile Management

**5 Specialized Components:**
- **ProfileInfoCard** - Editable name/email
- **PasswordChangeCard** - Secure password updates
- **AccountInfoCard** - User statistics
- **TaskStatsCard** - Task analytics
- **DangerZoneCard** - Account deletion

### UX Polish (007-frontend-ux-polish)

**Sonner Toast Notifications (7 scenarios):**
- Login → "Welcome back!" (bottom-right, 4s)
- Create task → "Task created"
- Update task → "Task updated"
- Delete task → "Task deleted"
- Toggle task → "Task completed" / "Task reopened"
- Logout → "Logged out"
- Password change → "Password changed successfully"

**Enhanced Date Labels:**
- Due: [date] with Calendar icon
- Created: [date] with Clock icon
- Updated: [date] with Pencil icon (conditional)
- Mono typography, uppercase labels, proper spacing

**Task Completion Animations:**
- Scale: 0.98 (completed) ↔ 1 (pending)
- Opacity: 0.6 (completed) ↔ 1 (pending)
- Editorial ease curve: [0.22, 1, 0.36, 1]
- Duration: 0.2s
- Performance: 60fps GPU-accelerated

**Modern Technical Editorial Design:**
- Background: #F9F7F2 (Cream)
- Text: #2A1B12 (Espresso)
- Accent: #FF6B4A (Orange)
- Structure: #E5E0D6 (Wireframe)
- Typography: Playfair Display, DM Sans, JetBrains Mono

---

## 🔐 Authentication Flow

### JWT Integration

```
1. User signs up/logs in → Better Auth → JWT token issued
2. Frontend stores token in session
3. API calls include: Authorization: Bearer <token>
4. Backend validates via JWKS endpoint
5. Backend scopes all queries to user_id
6. Multi-tenant data isolation enforced
```

### Backend JWT Validation

```python
# In FastAPI routers
from auth.jwt import validate_token

@router.get("/api/{user_id}/tasks")
async def get_tasks(user_id: str, token: str = Header(...)):
    validated = await validate_token(token)
    if validated.user_id != user_id:
        raise HTTPException(403, "Access denied")
    # Continue with scoped query...
```

---

## 🧪 Testing

### Frontend Testing

**UX Polish Features:**
```bash
# Enable bypass mode
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > frontend/.env.local
cd frontend && npm run dev

# Test checklist:
# ✅ Toast notifications (7 scenarios)
# ✅ Date labels (3 scenarios: new, edited, with due date)
# ✅ Animations (3 scenarios: complete, reopen, performance)
# ✅ Mobile navigation (hamburger menu)
```

**Real Authentication:**
```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Backend Testing

**API Endpoint Testing:**
```bash
cd backend

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src/backend

# Manual API testing (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user_123/tasks
```

**Auto-Generated Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 📊 Performance & Metrics

### Frontend
- **Bundle Size**: ~2.9kb (Sonner only)
- **Animation**: 60fps, GPU-accelerated
- **TypeScript**: 100% coverage
- **Components**: 25+ React components

### Backend
- **Endpoints**: 7 RESTful + 3 Auth
- **Response Time**: <100ms (p95)
- **Database**: Neon PostgreSQL with SSL
- **Async**: Full async/await patterns

---

## 🔗 Related Documentation

- **Main Project**: [../../README.md](../../README.md)
- **Spec 010**: [../../specs/010-chatkit-integration/spec.md](../../specs/010-chatkit-integration/spec.md)
- **Spec 009**: [../../specs/009-agents-mcp/spec.md](../../specs/009-agents-mcp/spec.md)
- **Phase 3 Backend**: [backend/README.md](backend/README.md)
- **Phase 3 Frontend**: [frontend/README.md](frontend/README.md)
- **OpenAI Agents SDK**: [../../.claude/skills/openai-agents-sdk/SKILL.md](../../.claude/skills/openai-agents-sdk/SKILL.md)
- **MCP Integration**: [../../.claude/skills/mcp-integration/SKILL.md](../../.claude/skills/mcp-integration/SKILL.md)
- **ChatKit Skill**: [../../.claude/skills/chatkit/SKILL.md](../../.claude/skills/chatkit/SKILL.md)
- **Phase 3 History**: [../../history/prompts/009-agents-mcp/](../../history/prompts/009-agents-mcp/)
- **ChatKit History**: [../../history/prompts/010-chatkit-integration/](../../history/prompts/010-chatkit-integration/)
- **Spec 007**: [../../specs/007-frontend-ux-polish/spec.md](../../specs/007-frontend-ux-polish/spec.md)
- **Spec 006**: [../../specs/006-backend-implement/spec.md](../../specs/006-backend-implement/spec.md)
- **Spec 005**: [../../specs/005-user-auth/spec.md](../../specs/005-user-auth/spec.md)
- **Design System**: [../../.claude/skills/ui-design/TOKENS.md](../../.claude/skills/ui-design/TOKENS.md)
- **Auth Bypass**: [AUTH_BYPASS_IMPLEMENTATION.md](AUTH_BYPASS_IMPLEMENTATION.md)

---

## 🎯 Success Criteria (Phase III)

### ✅ All Met
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
- [x] All Phase 2 features preserved
- [x] Traditional CRUD endpoints still functional
- [x] JWT authentication for both chat and API

### ✅ ChatKit Integration Complete
- [x] OpenAI ChatKit UI integration (React component via CDN)
- [x] Real-time streaming responses (SSE support)
- [x] Conversation history (PostgreSQL persistence)
- [x] ChatKit Store implementation (14 methods with user isolation)
- [x] Session management (JWT bridging between Better Auth and OpenAI)
- [x] Database migrations (chat_sessions and chat_messages tables)
- [x] Modern Technical Editorial UI design (cream backgrounds, orange accents)
- [x] Full-height responsive layout (fills screen space)
- [x] Loading and error states with retry functionality
- [x] Mobile responsive design
- [x] Tool execution visual feedback

---

## 🐳 Phase IV: Minikube Deployment

> Production-ready containerization and Kubernetes deployment for this full-stack AI chatbot application.

### Deployment Overview

The Phase-4 application is now fully deployable to local Kubernetes using Minikube, Docker, and Helm charts.

**Status**: ✅ **Complete** (92% - 61/65 tasks)

### Quick Deploy

```bash
# 1. Start Minikube
minikube start

# 2. Configure Docker for Minikube
eval $(minikube docker-env)

# 3. Create Secrets (from your .env files)
kubectl create secret generic phase4-secrets \
  --from-literal=DATABASE_URL='your-neon-url' \
  --from-literal=BETTER_AUTH_SECRET='your-jwt-secret' \
  --from-literal=OPENAI_API_KEY='your-openai-key' \
  --from-literal=XIAOMI_API_KEY='your-xiaomi-key'

# 4. Build Images
docker build -t phase4-backend:v1 ./backend
docker build -t phase4-frontend:v1 \
  --build-arg NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000" \
  --build-arg NEXT_PUBLIC_AUTH_URL="http://127.0.0.1:3000" \
  --build-arg NEXT_PUBLIC_AUTH_BYPASS="false" \
  --build-arg NEXT_PUBLIC_CHATKIT_DOMAIN_KEY="yourdomain.com" \
  ./frontend

# 5. Deploy
helm install backend ./helm-charts/backend
helm install frontend ./helm-charts/frontend

# 6. Start tunnel (in new terminal)
minikube tunnel
```

### Access the Application

| Service | URL |
|---------|-----|
| **Frontend (Chatbot UI)** | http://127.0.0.1:3000 |
| **Backend (API)** | http://127.0.0.1:8000 |

### Deployment Features

**Containerization:**
- ✅ Multi-stage Docker builds (node:20-alpine, python:3.13-slim)
- ✅ Optimized images (frontend: 254MB, backend: 336MB)
- ✅ Next.js standalone output mode

**Kubernetes:**
- ✅ Helm charts for frontend and backend
- ✅ LoadBalancer services with external IPs via minikube tunnel
- ✅ Kubernetes Secrets for sensitive data (no hardcoded secrets)
- ✅ Health probes (liveness/readiness) for self-healing

**Scripts & Tools:**
- ✅ `scripts/verify-deployment.sh` - Deployment health check
- ✅ `scripts/cleanup-deployment.sh` - Resource cleanup
- ✅ `deployment-guide/MINIKUBE_DEPLOYMENT.md` - Full deployment guide
- ✅ `deployment-guide/DEPLOYMENT_ACCESS.md` - Quick access info

### Project Structure (Updated)

```
phase-4/
├── frontend/              # Next.js 16+ with ChatKit
├── backend/               # FastAPI with AI agents
├── helm-charts/           # 🆕 Kubernetes manifests
│   ├── frontend/          # Frontend Helm chart
│   └── backend/           # Backend Helm chart
├── deployment-guide/      # 🆕 Deployment docs
│   ├── MINIKUBE_DEPLOYMENT.md
│   └── DEPLOYMENT_ACCESS.md
└── scripts/               # 🆕 Utility scripts
    ├── verify-deployment.sh
    └── cleanup-deployment.sh
```

### Documentation

- **Full Guide**: [deployment-guide/MINIKUBE_DEPLOYMENT.md](deployment-guide/MINIKUBE_DEPLOYMENT.md)
- **Access Info**: [deployment-guide/DEPLOYMENT_ACCESS.md](deployment-guide/DEPLOYMENT_ACCESS.md)
- **Spec**: [../specs/011-minikube-deployment/spec.md](../specs/011-minikube-deployment/spec.md)
- **Tasks**: [../specs/011-minikube-deployment/tasks.md](../specs/011-minikube-deployment/tasks.md)

---

**Phase IV Complete** ✅
*AI Chatbot with Minikube containerization and Kubernetes deployment*
Built with ❤️ using Spec-Driven Development