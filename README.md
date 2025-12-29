# Evolution of Todo

> A Spec-Driven Development (SDD) project demonstrating the evolution from CLI to modern web application through systematic development phases.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/Python-3.13%2B-blue.svg)](https://www.python.org/downloads/)
[![Next.js 16+](https://img.shields.io/badge/Next.js-16%2B-black.svg)](https://nextjs.org/)
[![Spec-Driven Development](https://img.shields.io/badge/SDD-Framework-purple.svg)](https://github.com/AhmedSaeed4/evolution-of-todo)

## 🚀 Quick Access

| Component | Status | Quick Start |
|-----------|--------|-------------|
| **Backend CLI** | ✅ Complete | `cd phase-1//backend && uv run python -m backend.main` |
| **Frontend Web** | ✅ Phase 2 | `cd phase-2/frontend && npm run dev` |
| **Auth Bypass** | 🎯 Key Feature | `echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local` |
| **Documentation** | 📚 Complete | See below for phase-specific docs |

## 🚀 Project Overview

**Evolution of Todo** is a comprehensive demonstration of Spec-Driven Development methodology, building a CLI todo application through clearly defined evolutionary stages. Each stage represents a distinct feature branch, creating a complete development history from concept to production-ready system.

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
│   │   ├── src/components/    # React components
│   │   │   ├── profile/       # Profile management components
│   │   │   ├── tasks/         # Task management components
│   │   │   ├── auth/          # Authentication components
│   │   │   └── ui/            # Reusable UI components
│   │   ├── src/lib/           # Utilities and auth
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
│   └── 004-profile-editing/   # Feature 004 specs (current)
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

### Current Stage: 004-profile-editing

**Enhanced Profile Management System** with comprehensive user settings:

- ✅ **Profile Information Form** - Edit name and email with validation
- ✅ **Password Change Form** - Secure password updates with confirmation
- ✅ **Account Information Display** - Read-only user data with icons
- ✅ **Task Statistics Dashboard** - Visual metrics and progress tracking
- ✅ **Danger Zone** - Account deletion with confirmation modal
- ✅ **Modern UI Components** - Built with design system tokens
- ✅ **Form Validation** - Real-time error handling and success feedback
- ✅ **Bypass Mode Support** - Full functionality without backend

**Previous Stages:**
- `001-cli-todo` - Original CLI with command-line interface ✅
- `002-cli-ui-update` - Menu-driven CLI interface with enhanced UX ✅
- `003-frontend-design` - Next.js web frontend with auth bypass ✅

### 🎯 Key Innovation: Profile Management Architecture

**New Component Architecture:**
- **ProfileInfoCard** - Editable form with change detection and validation
- **PasswordChangeCard** - Secure password updates with confirmation
- **AccountInfoCard** - Read-only user data display with icons
- **TaskStatsCard** - Visual task statistics and progress metrics
- **DangerZoneCard** - Account deletion with confirmation modal

**Design System Integration:**
- **Typography**: Playfair (serif), DM Sans (sans), JetBrains Mono (mono)
- **Colors**: Cream background (#F9F7F2), Accent orange (#FF6B4A)
- **Animations**: Framer Motion with staggered entrances
- **Components**: Built with reusable UI primitives from design system

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

# Install dependencies
npm install

# Set up environment for bypass mode (optional, for testing)
echo "NEXT_PUBLIC_AUTH_BYPASS=true" > .env.local

# Run development server
npm run dev
```

**Quick Start (Web):**
- Visit `http://localhost:3000`
- **With bypass**: Goes directly to tasks (no login)
- **Without bypass**: Shows login/signup pages

**Authentication Bypass Feature:**
- Set `NEXT_PUBLIC_AUTH_BYPASS=true` in `.env.local`
- Instant access to all features for testing
- Mock user system with visual indicators
- See `phase-2/AUTH_BYPASS_IMPLEMENTATION.md` for details

## 📖 Documentation

### Backend (CLI)
- **[Branching Strategy](docs/branching-strategy.md)** - Git workflow and branch management
- **[Architecture](docs/architecture.md)** - System design and decisions
- **[Spec 001](specs/001-cli-todo/spec.md)** - CLI todo specification (completed)
- **[Spec 002](specs/002-cli-ui-update/spec.md)** - Menu-driven interface specification (completed)

### Frontend (Web - Phase 2)
- **[Spec 003](specs/003-frontend-design/spec.md)** - Next.js frontend specification (completed)
- **[Spec 004](specs/004-profile-editing/spec.md)** - Profile management specification (current)
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

```bash
cd phase-2/frontend

# Run development server with bypass enabled
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
- **Total Files**: 60+
- **Components**: 20+ React components
- **Profile Components**: 5 specialized cards (Info, Password, Account, Stats, Danger)
- **Pages**: 6 main pages (Home, Login, Signup, Tasks, Profile, Test)
- **TypeScript**: 100% coverage
- **Dependencies**: Modern Next.js ecosystem
- **Features**: Full task management + auth bypass + profile management

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

**Current Focus:**
- **Phase 2**: Complete profile management with modern UI/UX
- **Key Innovation**: Component-based architecture with design system integration

**Future Stages:**
- `005-backend-integration` - Connect frontend to FastAPI backend
- `006-database-persistence` - Replace in-memory with database
- `007-real-time` - WebSocket updates and notifications
- `008-mobile-app` - React Native mobile application
- `009-advanced-auth` - OAuth, JWT, and role-based access
- `010-mcp-integration` - Model Context Protocol for AI agents

---

**Built with ❤️ using Spec-Driven Development**
*Every decision documented. Every interaction tracked. Every evolution clear.*