# Evolution of Todo

> A Spec-Driven Development (SDD) project demonstrating the evolution of a CLI todo application through systematic development phases.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/Python-3.13%2B-blue.svg)](https://www.python.org/downloads/)
[![Spec-Driven Development](https://img.shields.io/badge/SDD-Framework-purple.svg)](https://github.com/AhmedSaeed4/evolution-of-todo)

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

- **Language**: Python 3.13+
- **Package Manager**: uv (fast, modern Python tooling)
- **Storage**: In-memory dictionary (per spec requirement)
- **Architecture**: Layered CLI application
- **Testing**: Unit + Integration tests

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
├── backend/                    # Python implementation
│   ├── src/backend/           # Application code
│   ├── tests/                 # Test suite
│   └── pyproject.toml         # Python config
├── docs/                       # Documentation
│   ├── architecture.md        # System architecture
│   ├── api_reference.md       # API documentation
│   └── branching-strategy.md  # Git workflow
├── specs/                      # Specifications
│   ├── 001-cli-todo/          # Feature 001 specs (completed)
│   └── 002-cli-ui-update/     # Feature 002 specs (current)
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

### Current Stage: 002-cli-ui-update

**Menu-Driven CLI Todo Application** with full SDD framework:
- ✅ Menu-driven interface (7 numbered options)
- ✅ Task management (add, list, complete, update, delete)
- ✅ Input validation with retry loops
- ✅ Pause-after-operation UX
- ✅ Spec-Driven Development tooling
- ✅ Architecture Decision Records
- ✅ Prompt History tracking

**Previous Stage**: `001-cli-todo` - Original CLI with command-line interface

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- uv package manager

### Installation

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

### Quick Start

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

**Example Workflow:**
1. Select option 1 → Enter task title → Press Enter
2. Select option 2 → View all tasks → Press Enter
3. Select option 3 → Enter task ID → Press Enter
4. Select option 7 → Exit application

**Note**: The new interface replaces command-line arguments with an interactive menu system.

## 📖 Documentation

- **[Branching Strategy](docs/branching-strategy.md)** - Git workflow and branch management
- **[Architecture](docs/architecture.md)** - System design and decisions
- **[Spec 001](specs/001-cli-todo/spec.md)** - CLI todo specification (completed)
- **[Spec 002](specs/002-cli-ui-update/spec.md)** - Menu-driven interface specification (current)
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
- `002-cli-ui-update` - Menu-driven CLI interface with enhanced UX
- `001-cli-todo` - Original CLI todo application (previous version)

## 🧪 Testing

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

## 📊 Project Metrics

- **Total Files**: 75+
- **Lines of Code**: 15,000+
- **Test Coverage**: 22/22 unit tests passing
- **Python Version**: 3.13+
- **Dependencies**: Zero external (stdlib only)
- **Features**: 7 menu operations with full CRUD
- **Architecture**: Spec-Driven Development framework

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

**Future Stages:**
- `003-database-persistence` - Replace in-memory with database
- `004-api-layer` - REST API for external integrations
- `005-web-interface` - Web UI for todo management
- `006-authentication` - User authentication and authorization
- `007-real-time` - WebSocket updates and notifications
- `008-mcp-tools` - Model Context Protocol integration

---

**Built with ❤️ using Spec-Driven Development**
*Every decision documented. Every interaction tracked. Every evolution clear.*