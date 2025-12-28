# Quickstart Guide: CLI Todo Application

**Feature**: `001-cli-todo`
**Created**: 2025-12-27
**Constitution**: v1.1.0

## Overview

This guide provides step-by-step instructions to set up, run, and use the in-memory CLI Todo application.

## Prerequisites

- **Python**: 3.13+ (per Constitution VI)
- **Package Manager**: `uv` (preferred) or standard Python tools
- **Terminal**: Command-line access (Linux/macOS/Windows)

## Installation

### Option 1: Using UV (Recommended)

```bash
# Navigate to project root
cd /path/to/project

# Initialize backend package (if not already done)
uv init --package backend

# Install dependencies (none required for core functionality)
uv sync

# Run the application
uv run python -m backend.main
```

### Option 2: Using Standard Python

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Run directly
python -m backend.main
```

## Quick Start

### First Run

```bash
$ uv run python -m backend.main

╔════════════════════════════════════════════════════════════╗
║           Welcome to Todo App v1.0                        ║
║           Type 'help' for available commands              ║
╚════════════════════════════════════════════════════════════╝

todo>
```

### Basic Workflow

```bash
# 1. Add your first task
todo> add Buy groceries
✓ Task #1 added: "Buy groceries"

# 2. Add more tasks
todo> add Call doctor
✓ Task #2 added: "Call doctor"

todo> add Finish homework
✓ Task #3 added: "Finish homework"

# 3. View all tasks
todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [ ]    │ Buy groceries           │
│  2 │ [ ]    │ Call doctor             │
│  3 │ [ ]    │ Finish homework         │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (0 complete, 3 pending)

# 4. Complete a task
todo> complete 1
✓ Task #1 marked as complete: "Buy groceries"

# 5. Update a task
todo> update 2 Call doctor tomorrow
✓ Task #2 updated: "Call doctor" → "Call doctor tomorrow"

# 6. View updated list
todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [x]    │ Buy groceries           │
│  2 │ [ ]    │ Call doctor tomorrow    │
│  3 │ [ ]    │ Finish homework         │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (1 complete, 2 pending)

# 7. Delete a task
todo> delete 3
✓ Task #3 deleted: "Finish homework"

# 8. Exit
todo> exit
Goodbye! Your tasks have not been saved.
```

## Command Reference

### Add Task
```bash
todo> add <title>
```
Creates a new task with the specified title.

### Delete Task
```bash
todo> delete <id>
```
Removes the task with the specified ID.

### Update Task
```bash
todo> update <id> <new_title>
```
Changes the title of the task with the specified ID.

### List Tasks
```bash
todo> list
```
Displays all tasks in a formatted table.

### Complete Task
```bash
todo> complete <id>
```
Toggles the completion status of the task with the specified ID.

### Help
```bash
todo> help
```
Displays all available commands.

### Exit
```bash
todo> exit
```
or
```bash
todo> quit
```
Terminates the application.

## Common Workflows

### Daily Task Management
```bash
# Morning: Add tasks for the day
todo> add Prepare presentation
todo> add Email team updates
todo> add Review pull requests

# Throughout day: Mark as complete
todo> complete 1
todo> complete 2

# Evening: Review remaining
todo> list

# End of day: Clean up
todo> delete 3  # Remove if not needed
todo> exit
```

### Project Planning
```bash
# Add project tasks
todo> add Design database schema
todo> add Implement authentication
todo> add Write unit tests
todo> add Deploy to staging

# Mark phases complete
todo> complete 1
todo> complete 2

# Update as needed
todo> update 3 Write comprehensive unit tests
todo> list
```

### Error Recovery Examples

```bash
# Forgot to add task title
todo> add
Usage: add <title>

# Tried to delete non-existent task
todo> delete 99
✗ Error: Task #99 not found

# Invalid ID format
todo> complete abc
Invalid ID. Please enter a number.

# Empty list
todo> list
No tasks found. Add a task with: add <title>
```

## Tips and Best Practices

### Task Naming
- **Be specific**: "Buy groceries" vs "Shopping"
- **Use action verbs**: "Call", "Write", "Buy", "Review"
- **Keep concise**: Long titles wrap in display

### Task ID Management
- IDs auto-increment starting from 1
- IDs are reused if tasks are deleted
- Check current IDs with `list` before operations

### Workflow Patterns
1. **Add all tasks first**: Batch add tasks for context
2. **Complete as you go**: Mark tasks done immediately
3. **Review regularly**: Use `list` to see progress
4. **Clean up**: Delete completed tasks to reduce clutter

### Performance Notes
- **Fast**: All operations are instant (<1ms)
- **Memory**: ~100 bytes per task
- **Scale**: Handles 10,000+ tasks easily
- **Limit**: No hard limits (system memory only)

## Troubleshooting

### Application won't start
```bash
# Check Python version
python --version  # Should be 3.13+

# Check if running from correct directory
pwd  # Should be project root or backend/

# Try explicit module run
python -m backend.main
```

### Commands not recognized
```bash
# Check available commands
help

# Check for typos (commands are case-sensitive)
# Correct: add, delete, update, list, complete, help, exit
```

### Data persistence
**Note**: This is an in-memory application. All data is lost when you exit.
- No data files are created
- No database is used
- Session is not saved

For persistent storage, this will be added in Phase II (web app).

## Development Setup

### Project Structure
```
backend/
├── pyproject.toml          # UV configuration
├── README.md               # Project overview
└── src/
    └── backend/
        ├── __init__.py     # Package init
        ├── main.py         # CLI entry point
        ├── models.py       # Task dataclass
        ├── manager.py      # Business logic
        └── commands.py     # Command handlers
```

### Running Tests
```bash
# Install test dependencies
uv add --dev pytest

# Run tests
uv run pytest

# Run with coverage
uv run pytest --cov=backend
```

### Code Quality
```bash
# Install linting tools
uv add --dev ruff mypy

# Check formatting
ruff check src/
ruff format src/

# Type checking
mypy src/
```

## Next Steps

After mastering the CLI application:

1. **Phase II**: Web interface with FastAPI
2. **Phase III**: AI Agent integration with MCP
3. **Phase IV**: Cloud deployment with Kubernetes
4. **Phase V**: Multi-tenant with event sourcing

## Support

For issues or questions:
- Check `help` command for available commands
- Review `specs/001-cli-todo/spec.md` for detailed requirements
- Consult `specs/001-cli-todo/plan.md` for architecture decisions

---

**Version**: 1.0.0
**Last Updated**: 2025-12-27
**Constitution**: v1.1.0