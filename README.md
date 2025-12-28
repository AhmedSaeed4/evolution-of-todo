# Evolution of Todo

> A Spec-Driven Development (SDD) project demonstrating the evolution of a CLI todo application through systematic development phases.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.13+](https://img.shields.io/badge/Python-3.13%2B-blue.svg)](https://www.python.org/downloads/)
[![Spec-Driven Development](https://img.shields.io/badge/SDD-Framework-purple.svg)](https://github.com/AhmedSaeed4/evolution-of-todo)

## 🚀 Project Overview

**Evolution of Todo** is a comprehensive demonstration of Spec-Driven Development methodology, building a CLI todo application through clearly defined evolutionary stages. Each stage represents a distinct feature branch, creating a complete development history from concept to production-ready system.

### 🎯 Key Features

- **Sequential Branching Strategy**: `001-cli-todo`, `002-*`, `003-*` etc.
- **Complete Development Lifecycle**: Spec → Plan → Tasks → Implementation → Documentation
- **Architecture Decision Records**: Every significant decision documented
- **Prompt History Tracking**: Complete record of all AI interactions
- **Python 3.13+**: Modern Python with uv package manager
- **In-Memory Storage**: Standard library only, no external dependencies

## 🏗️ Architecture

### Branch Structure

```
main (stable, protected)
└── 001-cli-todo (feature branch)
    ├── specs/           # Requirements and specifications
    ├── backend/         # Python implementation
    ├── docs/            # Documentation
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
│   └── 001-cli-todo/          # Feature 001 specs
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

### Current Stage: 001-cli-todo

**CLI Todo Application** with full SDD framework:
- ✅ Command-line interface
- ✅ Task management (add, list, complete, delete)
- ✅ Spec-Driven Development tooling
- ✅ Architecture Decision Records
- ✅ Prompt History tracking

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
# Add a task
uv run todo add "Learn Spec-Driven Development"

# List all tasks
uv run todo list

# Complete a task
uv run todo complete 1

# Delete a task
uv run todo delete 2

# Show help
uv run todo --help
```

## 📖 Documentation

- **[Branching Strategy](docs/branching-strategy.md)** - Git workflow and branch management
- **[Architecture](docs/architecture.md)** - System design and decisions
- **[API Reference](docs/api_reference.md)** - Command interface documentation
- **[Spec 001](specs/001-cli-todo/spec.md)** - CLI todo specification
- **[ADRs](history/adr/)** - Architecture Decision Records

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
- `001-cli-todo` - CLI todo application with SDD framework

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

- **Total Files**: 69+
- **Lines of Code**: 14,000+
- **Test Coverage**: Comprehensive
- **Python Version**: 3.13+
- **Dependencies**: Zero external (stdlib only)

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

## 🎯 Future Evolution Stages

Potential next stages for this project:

- `002-web-interface` - Web UI for todo management
- `003-database-persistence` - Replace in-memory with database
- `004-api-layer` - REST API for external integrations
- `005-authentication` - User authentication and authorization
- `006-real-time` - WebSocket updates and notifications

---

**Built with ❤️ using Spec-Driven Development**
*Every decision documented. Every interaction tracked. Every evolution clear.*