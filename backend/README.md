# Phase 1 Backend - Todo CLI Application

This is the phase 1 implementation of the Hackathon Todo application backend. It is a standalone Command-Line Interface (CLI) application that manages todo tasks in memory.

## Features

- **Interactive Menu UI**: Easy-to-use numbered menu for navigation.
- **Task Management**:
  - Add new tasks
  - List all tasks
  - Complete tasks
  - Update task titles
  - Delete tasks
- **In-Memory Storage**: Fast execution with volatile storage (data resets on exit).

## Prerequisites

- Python 3.13+
- [uv](https://github.com/astral-sh/uv) package manager

## Installation

1. Navigate to the project directory:
   ```bash
   cd phase-1/backend
   ```

2. Sync dependencies:
   ```bash
   uv sync
   ```

## Usage

To start the application, run:

```bash
uv run todo
```

You will see the interactive menu:

```text
┌────────────────────────────────────────────────────────────┐
│ What would you like to do?                                 │
├────────────────────────────────────────────────────────────┤
│ 1. Add a new task                                          │
│ 2. List all tasks                                          │
│ 3. Complete a task                                         │
│ 4. Update a task title                                     │
│ 5. Delete a task                                           │
│ 6. Show help                                               │
│ 7. Exit application                                        │
└────────────────────────────────────────────────────────────┘
```

## Project Structure

- `src/backend/`: Source code
  - `main.py`: Entry point
  - `menu.py`: CLI UI implementation
  - `manager.py`: Business logic and state management
  - `models.py`: Data models (`Task` dataclass)
  - `commands.py`: Command handlers
- `tests/`: Test suite (unit and integration)

## Testing

Run the test suite using pytest:

```bash
uv run pytest
```
