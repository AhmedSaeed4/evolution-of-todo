# Evolution of Todo

> A Spec-Driven Development (SDD) project demonstrating the complete evolution from CLI to cloud-native deployment through 5 systematic phases.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/Python-3.13%2B-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16+](https://img.shields.io/badge/Next.js-16%2B-black.svg)](https://nextjs.org/)
[![Spec-Driven Development](https://img.shields.io/badge/SDD-Framework-purple.svg)](https://github.com/AhmedSaeed4/evolution-of-todo)

## 🗺️ 5-Phase Evolution Roadmap

| Phase | Description | Technology Stack | Status |
|-------|-------------|------------------|--------|
| **Phase I** | In-Memory Python Console App | Python, Claude Code, Spec-Kit Plus | ✅ **COMPLETE** |
| **Phase II** | Full-Stack Web Application | Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth | ✅ **COMPLETE** |
| **Phase III** | AI-Powered Todo Chatbot | OpenAI ChatKit, Agents SDK, Official MCP SDK | 🎯 **NEXT** |
| **Phase IV** | Local Kubernetes Deployment | Docker, Minikube, Helm, kubectl-ai, kagent | ⏳ **PLANNED** |
| **Phase V** | Advanced Cloud Deployment | [To be specified] | 📋 **FUTURE** |

## 🚀 Quick Access

| Component | Status | Quick Start |
|-----------|--------|-------------|
| **Backend CLI** | ✅ Complete | `cd backend && uv run python -m backend.main` |
| **Backend API** | ✅ Complete | `cd phase-2/backend && uv run uvicorn src.backend.main:app --reload` |
| **Frontend Web** | ✅ Phase 2 | `cd phase-2/frontend && npm run dev` |
| **Authentication** | ✅ Production-Ready | See `specs/005-user-auth/quickstart.md` |
| **Auth Bypass** | 🎯 Testing Mode | `echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local` |
| **Documentation** | 📚 Complete | See below for phase-specific docs |

## 🚀 Project Overview

**Evolution of Todo** is a comprehensive demonstration of Spec-Driven Development methodology, building a CLI todo application through clearly defined evolutionary stages. Each stage represents a distinct feature branch, creating a complete development history from concept to production-ready system.

### 🎯 FastAPI Backend (006-backend-implement) ✅

**Production-Ready RESTful API with JWT Authentication:**

```bash
# Quick setup for backend API
cd phase-2/backend
uv sync  # Install dependencies
# Configure .env with DATABASE_URL and BETTER_AUTH_SECRET
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000

# Test the API endpoints
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user_123/tasks
```

**What's Working:**
- ✅ **7 RESTful Endpoints** - Full CRUD + stats for tasks
- ✅ **JWT Validation** - EdDSA/ES256/RS256 via Better Auth JWKS
- ✅ **Multi-Tenancy** - User isolation via user_id scoping
- ✅ **SQLModel ORM** - Type-safe database operations
- ✅ **Pydantic Validation** - Request/response validation
- ✅ **CORS Support** - Frontend integration ready
- ✅ **Async/Await** - High-performance async patterns

**API Endpoints:**
- `GET /api/{user_id}/tasks` - List tasks with filters
- `POST /api/{user_id}/tasks` - Create task (201)
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task (204)
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `GET /api/{user_id}/stats` - Task statistics

### 🎯 Authentication System (005-user-auth) ✅

**Production-Ready Authentication with Better Auth:**

```bash
# Quick setup for real authentication
cd phase-2/frontend
npm install  # Includes pg dependency
# Configure .env.local with DATABASE_URL and BETTER_AUTH_SECRET
npm run dev

# Test the API endpoints
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@example.com","password":"password123"}'
```

**What's Working:**
- ✅ **User Registration** - Email/password signup with validation
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Session Management** - Persistent sessions via cookies
- ✅ **Password Security** - bcrypt hashing, constant-time comparison
- ✅ **JWT Integration** - Ready for FastAPI backend validation
- ✅ **Neon PostgreSQL** - Database persistence with SSL
- ✅ **Complete API** - 3 endpoints tested and documented

**Backend Integration Ready:**
- JWT tokens (HS256/EdDSA) with user_id, email, name, exp
- Shared secret for Next.js ↔ FastAPI authentication
- User isolation via user_id for multi-tenancy
- See `specs/005-user-auth/contracts/auth-api.md` for details

### 🎯 Key Features

- **Sequential Branching Strategy**: `001-cli-todo`, `002-cli-ui-update`, `003-*` etc.
- **Menu-Driven Interface**: 7 numbered options with input validation and retry logic
- **Complete Development Lifecycle**: Spec → Plan → Tasks → Implementation → Documentation
- **Architecture Decision Records**: Every significant decision documented
- **Prompt History Tracking**: Complete record of all AI interactions
- **Python 3.13+**: Modern Python with uv package manager
- **In-Memory Storage**: Standard library only, no external dependencies
- **TDD Approach**: Comprehensive unit and integration tests

## 🏗️ Architecture

### Branch Structure

```
main (stable, protected)
├── 001-cli-todo (completed)
│   ├── specs/           # CLI specifications
│   ├── backend/         # Command-line implementation
│   └── docs/            # Original documentation
├── 002-cli-ui-update (completed)
│   ├── specs/           # Menu interface specifications
│   ├── backend/         # Menu-driven implementation
│   └── docs/            # Updated documentation
├── 003-frontend-design (completed)
│   ├── specs/           # Next.js frontend specs
│   └── phase-2/         # Web application
├── 004-profile-editing (completed)
│   ├── specs/           # Profile management specs
│   └── phase-2/         # Enhanced profile features
├── 005-user-auth (completed)
│   ├── specs/           # Authentication specs
│   └── phase-2/         # Better Auth integration
└── 006-backend-implement (current)
    ├── specs/           # FastAPI backend specs
    ├── phase-2/backend/ # RESTful API implementation
    └── phase-2/frontend/# Frontend API client updates
```

### Technology Stack

**Backend CLI (Original):**
- **Language**: Python 3.13+
- **Package Manager**: uv (fast, modern Python tooling)
- **Storage**: In-memory dictionary (per spec requirement)
- **Architecture**: Layered CLI application
- **Testing**: Unit + Integration tests

**Backend API (FastAPI):**
- **Framework**: FastAPI 0.128.0 (async/await)
- **ORM**: SQLModel 0.0.31 (Pydantic + SQLAlchemy)
- **Database**: Neon PostgreSQL (serverless, SSL)
- **Authentication**: JWT validation via Better Auth JWKS
- **Security**: Pydantic validation, CORS, multi-tenancy
- **Performance**: Asyncpg for connection pooling
- **API Style**: RESTful with OpenAPI documentation

**Frontend (Web):**
- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS with Modern Technical Editorial design
- **Animations**: Framer Motion
- **State Management**: React Hooks + Server Components
- **Authentication**: Better Auth v1.4.9 (with bypass mode)
- **API Client**: Fetch with JWT token management

## 📁 Project Structure

```
evolution-of-todo/
├── .claude/                    # Claude Code configuration
│   ├── commands/              # Custom slash commands
│   └── skills/                # Development skills
├── .specify/                   # Spec-Driven Development framework
│   ├── memory/                # Project constitution
│   ├── scripts/bash/          # Automation scripts
│   └── templates/             # Document templates
├── backend/                    # Python CLI implementation
│   ├── src/backend/           # Application code
│   ├── tests/                 # Test suite
│   └── pyproject.toml         # Python config
├── phase-2/                    # Next.js Web Frontend + FastAPI Backend
│   ├── frontend/              # Next.js application
│   │   ├── src/app/           # App Router pages
│   │   │   ├── api/           # API routes
│   │   │   │   └── auth/      # Authentication endpoints
│   │   │   │       └── [...all]/route.ts  # Better Auth handler
│   │   ├── src/components/    # React components
│   │   │   ├── profile/       # Profile management components
│   │   │   ├── tasks/         # Task management components
│   │   │   ├── auth/          # Authentication components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── src/lib/           # Utilities and auth
│   │   │   ├── auth.ts        # Client auth config
│   │   │   ├── api.ts         # API client (backend integration)
│   │   │   └── auth-server.ts # Better Auth server config
│   │   ├── src/hooks/         # Custom hooks
│   │   └── src/motion/        # Animation variants
│   ├── backend/               # FastAPI RESTful API
│   │   ├── src/backend/       # Python application
│   │   │   ├── main.py        # FastAPI entry point
│   │   │   ├── config.py      # Environment config
│   │   │   ├── database.py    # Neon PostgreSQL connection
│   │   │   ├── models/        # SQLModel entities
│   │   │   │   └── task.py    # Task model
│   │   │   ├── schemas/       # Pydantic schemas
│   │   │   │   └── task.py    # Request/response schemas
│   │   │   ├── routers/       # API endpoints
│   │   │   │   └── tasks.py   # Task CRUD routes
│   │   │   ├── services/      # Business logic
│   │   │   │   └── task_service.py
│   │   │   └── auth/          # JWT validation
│   │   │       └── jwt.py     # Better Auth JWKS integration
│   │   ├── tests/             # API tests
│   │   ├── pyproject.toml     # Python dependencies
│   │   └── .env.example       # Environment template
│   ├── AUTH_BYPASS_IMPLEMENTATION.md  # Bypass feature docs
│   ├── AUTH_BYPASS_ROLLBACK.md        # Rollback reference
│   └── AUTH_BYPASS_SUMMARY.md         # Quick reference
├── docs/                       # Documentation
│   ├── architecture.md        # System architecture
│   ├── api_reference.md       # API documentation
│   └── branching-strategy.md  # Git workflow
├── specs/                      # Specifications
│   ├── 001-cli-todo/          # Feature 001 specs (completed)
│   ├── 002-cli-ui-update/     # Feature 002 specs (completed)
│   ├── 003-frontend-design/   # Feature 003 specs (completed)
│   ├── 004-profile-editing/   # Feature 004 specs (completed)
│   ├── 005-user-auth/         # Feature 005 specs (completed)
│   └── 006-backend-implement/ # Feature 006 specs (current)
│       ├── spec.md            # Requirements
│       ├── plan.md            # Architecture
│       ├── tasks.md           # Implementation tasks
│       ├── quickstart.md      # Setup guide
│       ├── data-model.md      # Database schema
│       ├── contracts/         # API contracts (OpenAPI)
│       └── checklists/        # Quality checks
├── history/                    # Development history
│   ├── adr/                   # Architecture Decision Records
│   └── prompts/               # Prompt History Records
└── README.md                   # This file
```

## 🎓 Spec-Driven Development

This project follows the **Spec-Driven Development** methodology:

1. **Specification** (`specs/*/spec.md`) - What to build
2. **Planning** (`specs/*/plan.md`) - How to build it
3. **Tasks** (`specs/*/tasks.md`) - Specific implementation steps
4. **Implementation** (`backend/`) - Code that meets the spec
5. **Documentation** (`docs/`) - Architecture and API docs
6. **History** (`history/`) - Decisions and interactions

### Current Stage: 006-backend-implement

**Production-Ready FastAPI Backend** with JWT authentication:

- ✅ **7 RESTful Endpoints** - Full task CRUD + statistics
- ✅ **JWT Validation** - EdDSA/ES256/RS256 via Better Auth JWKS
- ✅ **Multi-Tenancy** - User isolation via user_id scoping
- ✅ **SQLModel ORM** - Type-safe database operations
- ✅ **Pydantic Validation** - Request/response validation
- ✅ **CORS Support** - Frontend integration ready
- ✅ **Async/Await** - High-performance async patterns
- ✅ **OpenAPI Docs** - Auto-generated API documentation

**Previous Stages:**
- `001-cli-todo` - Original CLI with command-line interface ✅
- `002-cli-ui-update` - Menu-driven CLI interface with enhanced UX ✅
- `003-frontend-design` - Next.js web frontend with auth bypass ✅
- `004-profile-editing` - Enhanced profile management system ✅
- `005-user-auth` - Production-ready authentication with Better Auth ✅

### 🎯 Key Innovation: Full-Stack Architecture

**FastAPI Backend Integration:**
- **RESTful API** - 7 endpoints for complete task management
- **JWT Validation** - EdDSA/ES256/RS256 via Better Auth JWKS endpoint
- **SQLModel ORM** - Type-safe database operations with Neon PostgreSQL
- **Multi-Tenancy** - User isolation via user_id in all queries
- **CORS Support** - Seamless frontend integration
- **OpenAPI Docs** - Auto-generated at `/docs` endpoint

**Better Auth (Frontend):**
- **Server Configuration** - `auth-server.ts` with PostgreSQL adapter
- **API Route Handler** - Single file handles all auth endpoints
- **JWT Plugin** - Token generation for backend validation
- **Database Schema** - User, Session, Account tables with proper indexes
- **Security Features** - bcrypt hashing, constant-time comparison, SSL connections

**Working Authentication Flow:**
1. User signs up/logs in via Better Auth → JWT token issued
2. Frontend stores token in session
3. API calls include `Authorization: Bearer <token>`
4. Backend validates token via JWKS, extracts user_id
5. Backend scopes all queries to user_id for data isolation

**Backend API Endpoints:**
- `GET /api/{user_id}/tasks` - List with filters (status, priority, category, search)
- `POST /api/{user_id}/tasks` - Create task (201 Created)
- `GET /api/{user_id}/tasks/{task_id}` - Get single task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task (204 No Content)
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion
- `GET /api/{user_id}/stats` - Task statistics (total, pending, completed)

### 🎯 Key Innovation: Authentication Bypass System

**What it does:**
- **Toggle authentication** with `NEXT_PUBLIC_AUTH_BYPASS=true`
- **Instant access** to all features without login/signup
- **Mock user system** with visual indicators
- **Zero setup** for frontend testing and development

**Use Cases:**
- ✅ Rapid frontend development
- ✅ UI/UX testing without backend
- ✅ Demo presentations
- ✅ Integration testing
- ✅ CI/CD pipelines

**How it works:**
```bash
# Enable bypass mode
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > phase-2/frontend/.env.local

# Start development server
cd phase-2/frontend && npm run dev

# Visit http://localhost:3000
# → Auto-redirects to /tasks
# → Shows "(Bypass)" in navbar
# → Full functionality without login
```

**Safety Features:**
- Default is **disabled** (`false`)
- Visual indicators in UI
- Complete rollback documentation
- Environment variable only (no code changes)

**Documentation**: See `phase-2/AUTH_BYPASS_IMPLEMENTATION.md` for complete details

## 🚀 Getting Started

### Prerequisites

**Backend API (FastAPI):**
- Python 3.13+
- uv package manager
- Neon PostgreSQL database

**Backend CLI (Original):**
- Python 3.13+
- uv package manager

**Frontend (Web):**
- Node.js 18+
- npm or yarn

### Backend API Setup (FastAPI - Phase 2)

```bash
# Clone the repository
git clone https://github.com/AhmedSaeed4/evolution-of-todo.git
cd evolution-of-todo

# Navigate to backend directory
cd phase-2/backend

# Install dependencies with uv
uv sync

# Create environment file
cat > .env << EOF
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
BETTER_AUTH_SECRET="your-generated-secret-key"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
API_HOST="0.0.0.0"
API_PORT="8000"
DEBUG="true"
EOF

# Run the development server
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Quick Start (Backend API):**
```bash
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
# Health check at http://localhost:8000/health

# Test with curl (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user_123/tasks
```

### Backend CLI Setup (Original)

```bash
# Navigate to CLI backend
cd backend

# Install dependencies
uv sync

# Run the application
uv run todo --help
```

**Quick Start (CLI):**
```bash
# Launch the menu-driven interface
uv run python -m backend.main
```

**Menu Options:**
1. Add a new task
2. List all tasks
3. Complete a task
4. Update a task title
5. Delete a task
6. Show help
7. Exit application

### Frontend Setup (Web - Phase 2)

```bash
# Navigate to phase-2 frontend
cd phase-2/frontend

# Install dependencies (includes pg for database)
npm install

# Set up authentication environment
# Generate secure secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
cat > .env.local << EOF
NEXT_PUBLIC_AUTH_BYPASS=false
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
BETTER_AUTH_SECRET=your-generated-64-char-secret
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
EOF

# Run development server
npm run dev
```

**Quick Start (Web):**
- Visit `http://localhost:3000`
- **With bypass** (`NEXT_PUBLIC_AUTH_BYPASS=true`): Direct access to tasks
- **Without bypass**: Login/signup pages with real authentication

**Authentication System Features:**
- **Real Authentication**: Better Auth with Neon PostgreSQL
- **JWT Tokens**: Ready for FastAPI backend integration
- **Complete API**: Registration, login, session validation endpoints
- **Security**: bcrypt hashing, SSL connections, proper validation
- **See**: `specs/005-user-auth/quickstart.md` for complete setup guide

## 📖 Documentation

### Backend API (FastAPI - Phase 2)
- **[Spec 006](specs/006-backend-implement/spec.md)** - FastAPI backend specification (current)
- **[Backend Quickstart](specs/006-backend-implement/quickstart.md)** - Complete setup guide
- **[API Contracts](specs/006-backend-implement/contracts/openapi.yaml)** - OpenAPI specification
- **[Data Model](specs/006-backend-implement/data-model.md)** - Database schema and relationships
- **[API Reference](docs/api_reference.md)** - Complete endpoint documentation
- **Auto-Generated Docs**: `http://localhost:8000/docs` (Swagger UI)
- **Auto-Generated Docs**: `http://localhost:8000/redoc` (ReDoc)

### Backend CLI (Original)
- **[Branching Strategy](docs/branching-strategy.md)** - Git workflow and branch management
- **[Architecture](docs/architecture.md)** - System design and decisions
- **[Spec 001](specs/001-cli-todo/spec.md)** - CLI todo specification (completed)
- **[Spec 002](specs/002-cli-ui-update/spec.md)** - Menu-driven interface specification (completed)

### Frontend (Web - Phase 2)
- **[Spec 003](specs/003-frontend-design/spec.md)** - Next.js frontend specification (completed)
- **[Spec 004](specs/004-profile-editing/spec.md)** - Profile management specification (completed)
- **[Spec 005](specs/005-user-auth/spec.md)** - Authentication system specification (completed)
- **[Auth Quickstart](specs/005-user-auth/quickstart.md)** - Complete setup guide
- **[API Contracts](specs/005-user-auth/contracts/auth-api.md)** - RESTful endpoints documentation
- **[Data Model](specs/005-user-auth/data-model.md)** - Database schema and relationships
- **[Auth Bypass Guide](phase-2/AUTH_BYPASS_IMPLEMENTATION.md)** - Complete bypass feature documentation
- **[Auth Bypass Summary](phase-2/AUTH_BYPASS_SUMMARY.md)** - Quick reference guide
- **[Auth Bypass Rollback](phase-2/AUTH_BYPASS_ROLLBACK.md)** - Complete rollback reference

### Development History
- **[ADRs](history/adr/)** - Architecture Decision Records
- **[PHRs](history/prompts/)** - Prompt History Records

## 🔄 Development Workflow

### Working on Features

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create new feature branch
git checkout -b 002-next-feature

# 3. Develop and commit
# ... make changes ...
git add .
git commit -m "feat: add meaningful description"

# 4. Push and create PR
git push -u origin 002-next-feature
# Then create PR on GitHub
```

### Current Branches

- `main` - Stable base (protected, default)
- `004-profile-editing` - Enhanced profile management system (current)
- `003-frontend-design` - Next.js web frontend with auth bypass
- `002-cli-ui-update` - Menu-driven CLI interface with enhanced UX
- `001-cli-todo` - Original CLI todo application (previous version)

## 🧪 Testing

### Backend API (FastAPI) Testing

```bash
cd phase-2/backend

# Run all tests
uv run pytest

# Run API tests
uv run pytest tests/test_tasks.py -v

# Run with coverage
uv run pytest --cov=src/backend

# Manual API testing (requires running server)
# Get JWT token from frontend, then:

# Test health check
curl http://localhost:8000/health

# Test list tasks
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/api/user_123/tasks

# Test create task
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","priority":"high","category":"work"}' \
     http://localhost:8000/api/user_123/tasks

# View auto-generated docs
open http://localhost:8000/docs
```

### Backend (CLI) Testing

```bash
cd backend

# Run all tests
uv run pytest

# Run unit tests
uv run pytest tests/unit/

# Run integration tests
uv run pytest tests/integration/

# Run with coverage
uv run pytest --cov=src/backend
```

### Frontend (Web) Testing

**Authentication Testing (Real Backend):**
```bash
cd phase-2/frontend

# Set up real authentication
echo "NEXT_PUBLIC_AUTH_BYPASS=false" > .env.local
# Add DATABASE_URL and BETTER_AUTH_SECRET to .env.local

# Start server
npm run dev

# Test registration
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"testpassword123"}'

# Test login
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}'

# Test session validation
curl http://localhost:3000/api/auth/get-session \
  -b "better-auth.session_token=YOUR_TOKEN"
```

**Bypass Mode Testing:**
```bash
# Enable bypass for UI testing
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local
npm run dev

# Manual testing checklist:
# ✅ Visit http://localhost:3000 - should redirect to /tasks
# ✅ Check navbar shows "(Bypass)" indicator
# ✅ Test task creation, editing, deletion
# ✅ Test profile page access
# ✅ Test logout behavior
# ✅ Verify all routes work without login
```

## 📊 Project Metrics

### Backend API (FastAPI - Phase 2)
- **Total Files**: 15+ Python files
- **Endpoints**: 7 RESTful API endpoints
- **Models**: SQLModel with 1 main entity (Task)
- **Schemas**: Pydantic request/response validation
- **Python Version**: 3.13+
- **Dependencies**: FastAPI, SQLModel, asyncpg, python-jose
- **Features**: Full CRUD + JWT auth + multi-tenancy + filtering

### Backend CLI (Original)
- **Total Files**: 75+
- **Lines of Code**: 15,000+
- **Test Coverage**: 22/22 unit tests passing
- **Python Version**: 3.13+
- **Dependencies**: Zero external (stdlib only)
- **Features**: 7 menu operations with full CRUD

### Frontend (Web - Phase 2)
- **Total Files**: 70+
- **Components**: 25+ React components
- **Auth Components**: Login, Signup forms with validation
- **Profile Components**: 5 specialized cards (Info, Password, Account, Stats, Danger)
- **Pages**: 6 main pages (Home, Login, Signup, Tasks, Profile, Test)
- **API Routes**: 1 auth route handler (`[...all]/route.ts`)
- **TypeScript**: 100% coverage
- **Dependencies**: Better Auth v1.4.9, pg v8.16.3, Next.js 16.1.1
- **Features**: Full task management + real authentication + profile management

### Overall
- **Architecture**: Spec-Driven Development framework
- **Branches**: 6 feature branches (001-006)
- **Documentation**: Complete ADR + PHR tracking
- **Database**: Neon PostgreSQL (shared between auth and API)
- **Authentication**: Better Auth + JWT validation via JWKS

## 🤝 Contributing

This project uses Spec-Driven Development. All contributions should follow the established patterns:

1. Create specification document
2. Plan implementation approach
3. Break down into tasks
4. Implement with tests
5. Document decisions
6. Track in PHR

## 📜 License

MIT License - feel free to use this as a template for your own SDD projects.

## 🔗 Links

- **Repository**: https://github.com/AhmedSaeed4/evolution-of-todo
- **Issues**: https://github.com/AhmedSaeed4/evolution-of-todo/issues
- **Discussions**: https://github.com/AhmedSaeed4/evolution-of-todo/discussions

## 🎯 Evolution Stages

**Completed:**
- `001-cli-todo` - Original CLI with command-line interface ✅
- `002-cli-ui-update` - Menu-driven CLI interface with enhanced UX ✅
- `003-frontend-design` - Next.js web frontend with auth bypass ✅
- `004-profile-editing` - Enhanced profile management system ✅
- `005-user-auth` - Production-ready authentication with Better Auth ✅
- `006-backend-implement` - FastAPI RESTful backend with JWT validation ✅
- `007-frontend-ux-polish` - Toast notifications, date labels, animations ✅

**Current Focus:**
- **Phase 2**: Full-stack architecture with frontend + backend integration
- **Key Innovation**: Complete authentication flow from Better Auth → JWT → FastAPI validation

**What's Working:**
- ✅ **7 RESTful Endpoints** - Full task CRUD + statistics
- ✅ **JWT Validation** - EdDSA/ES256/RS256 via Better Auth JWKS
- ✅ **Multi-Tenancy** - User isolation via user_id scoping
- ✅ **SQLModel ORM** - Type-safe database operations
- ✅ **Pydantic Validation** - Request/response validation
- ✅ **CORS Support** - Frontend integration ready
- ✅ **OpenAPI Docs** - Auto-generated API documentation

**Integration Complete:**
- ✅ Better Auth issues JWT tokens
- ✅ Frontend stores tokens in session
- ✅ Backend validates via JWKS endpoint
- ✅ All queries scoped to user_id
- ✅ Shared Neon PostgreSQL database

**UX Polish Features (007-frontend-ux-polish):**
- ✅ **Sonner Toast Notifications** - 7 scenarios (CRUD + Auth events)
- ✅ **Enhanced Date Labels** - Due/Created/Updated with icons and mono typography
- ✅ **Task Completion Animations** - Scale 0.98/1, opacity 0.6/1, editorial easing
- ✅ **Modern Technical Editorial Design** - Cream backgrounds, sharp corners, mono labels
- ✅ **Mobile Hamburger Menu** - Framer Motion animated navigation

**Future Stages:**
- `008-frontend-backend-integration` - Connect Next.js to FastAPI endpoints
- `009-websocket-realtime` - Real-time updates and notifications
- `010-mobile-app` - React Native mobile application
- `011-oauth-providers` - Google, GitHub authentication
- `012-2fa-security` - Two-factor authentication
- `013-mcp-integration` - Model Context Protocol for AI agents
- `014-docker-deployment` - Containerized production deployment

---

**Built with ❤️ using Spec-Driven Development**
*Every decision documented. Every interaction tracked. Every evolution clear.*