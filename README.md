# Evolution of Todo

> A Spec-Driven Development (SDD) project demonstrating the evolution from CLI to modern web application through systematic development phases.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/Python-3.13%2B-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16+](https://img.shields.io/badge/Next.js-16%2B-black.svg)](https://nextjs.org/)
[![Spec-Driven Development](https://img.shields.io/badge/SDD-Framework-purple.svg)](https://github.com/AhmedSaeed4/evolution-of-todo)

## 🚀 Quick Access

| Component | Status | Quick Start |
|-----------|--------|-------------|
| **Backend CLI** | ✅ Complete | `cd backend && uv run python -m backend.main` |
| **Frontend Web** | ✅ Phase 2 | `cd phase-2/frontend && npm run dev` |
| **Authentication** | ✅ Production-Ready | See `specs/005-user-auth/quickstart.md` |
| **Auth Bypass** | 🎯 Testing Mode | `echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local` |
| **Documentation** | 📚 Complete | See below for phase-specific docs |

## 🚀 Project Overview

**Evolution of Todo** is a comprehensive demonstration of Spec-Driven Development methodology, building a CLI todo application through clearly defined evolutionary stages. Each stage represents a distinct feature branch, creating a complete development history from concept to production-ready system.

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
- JWT tokens (HS256) with user_id, email, name, exp
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
└── 002-cli-ui-update (current)
    ├── specs/           # Menu interface specifications
    ├── backend/         # Menu-driven implementation
    ├── docs/            # Updated documentation
    ├── history/         # ADRs and PHRs
    └── .specify/        # SDD templates and scripts
```

### Technology Stack

**Backend (CLI):**
- **Language**: Python 3.13+
- **Package Manager**: uv (fast, modern Python tooling)
- **Storage**: In-memory dictionary (per spec requirement)
- **Architecture**: Layered CLI application
- **Testing**: Unit + Integration tests

**Frontend (Web):**
- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Modern Technical Editorial design
- **Animations**: Framer Motion
- **State Management**: React Hooks + Server Components
- **Authentication**: Better Auth (with bypass mode for testing)

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
├── phase-2/                    # Next.js Web Frontend
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
│   │   │   └── auth-server.ts # Better Auth server config
│   │   ├── src/hooks/         # Custom hooks
│   │   └── src/motion/        # Animation variants
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
│   └── 005-user-auth/         # Feature 005 specs (current)
│       ├── spec.md            # Requirements
│       ├── plan.md            # Architecture
│       ├── tasks.md           # Implementation tasks
│       ├── quickstart.md      # Setup guide
│       ├── data-model.md      # Database schema
│       ├── contracts/         # API contracts
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

### Current Stage: 005-user-auth

**Production-Ready Authentication System** with Better Auth integration:

- ✅ **User Registration** - Email/password signup with full validation
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Session Management** - Persistent sessions with cookie-based auth
- ✅ **Password Security** - bcrypt hashing with constant-time comparison
- ✅ **JWT Integration** - Ready for FastAPI backend validation
- ✅ **Neon PostgreSQL** - Database persistence with SSL connections
- ✅ **API Endpoints** - Complete RESTful authentication endpoints
- ✅ **Comprehensive Documentation** - Quickstart, API contracts, data models

**Previous Stages:**
- `001-cli-todo` - Original CLI with command-line interface ✅
- `002-cli-ui-update` - Menu-driven CLI interface with enhanced UX ✅
- `003-frontend-design` - Next.js web frontend with auth bypass ✅
- `004-profile-editing` - Enhanced profile management system ✅

### 🎯 Key Innovation: Production-Ready Authentication

**Better Auth Integration:**
- **Server Configuration** - `auth-server.ts` with PostgreSQL adapter
- **API Route Handler** - Single file handles all auth endpoints
- **JWT Plugin** - Token generation for FastAPI backend integration
- **Database Schema** - User, Session, Account tables with proper indexes
- **Security Features** - bcrypt hashing, constant-time comparison, SSL connections

**Working API Endpoints:**
- **Registration**: `POST /api/auth/sign-up/email` - Validates, creates user, returns JWT
- **Login**: `POST /api/auth/sign-in/email` - Verifies credentials, issues session
- **Session**: `GET /api/auth/get-session` - Validates cookies, returns user data
- **Security**: Generic error messages prevent user enumeration

**Backend Integration Ready:**
- **JWT Format**: HS256 signed tokens with user_id, email, name, exp
- **Shared Secret**: `BETTER_AUTH_SECRET` for both Next.js and FastAPI
- **Database**: Neon PostgreSQL with SSL, shared with backend
- **User Isolation**: All queries scoped to user_id for multi-tenancy

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

**Backend (CLI):**
- Python 3.13+
- uv package manager

**Frontend (Web):**
- Node.js 18+
- npm or yarn

### Backend Setup (CLI)

```bash
# Clone the repository
git clone https://github.com/AhmedSaeed4/evolution-of-todo.git
cd evolution-of-todo

# Navigate to backend
cd backend

# Install dependencies with uv
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

### Backend (CLI)
- **[Branching Strategy](docs/branching-strategy.md)** - Git workflow and branch management
- **[Architecture](docs/architecture.md)** - System design and decisions
- **[Spec 001](specs/001-cli-todo/spec.md)** - CLI todo specification (completed)
- **[Spec 002](specs/002-cli-ui-update/spec.md)** - Menu-driven interface specification (completed)

### Frontend (Web - Phase 2)
- **[Spec 003](specs/003-frontend-design/spec.md)** - Next.js frontend specification (completed)
- **[Spec 004](specs/004-profile-editing/spec.md)** - Profile management specification (completed)
- **[Spec 005](specs/005-user-auth/spec.md)** - Authentication system specification (current)
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

### Backend (CLI)
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
- **Branches**: 4 feature branches (001, 002, 003, 004)
- **Documentation**: Complete ADR + PHR tracking

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

**Current Focus:**
- **Phase 2**: Complete authentication system ready for backend integration
- **Key Innovation**: Better Auth + Neon PostgreSQL + JWT tokens for FastAPI

**Backend Integration Ready:**
- ✅ JWT tokens generated with HS256
- ✅ Shared secret configured for both systems
- ✅ Database tables created in Neon PostgreSQL
- ✅ User isolation via user_id for multi-tenancy
- ✅ API endpoints fully functional and tested

**Future Stages:**
- `006-fastapi-jwt-validation` - Backend JWT verification implementation
- `007-task-api-integration` - Connect task CRUD to authenticated users
- `008-websocket-realtime` - Real-time updates and notifications
- `009-mobile-app` - React Native mobile application
- `010-oauth-providers` - Google, GitHub authentication
- `011-2fa-security` - Two-factor authentication
- `012-mcp-integration` - Model Context Protocol for AI agents

---

**Built with ❤️ using Spec-Driven Development**
*Every decision documented. Every interaction tracked. Every evolution clear.*