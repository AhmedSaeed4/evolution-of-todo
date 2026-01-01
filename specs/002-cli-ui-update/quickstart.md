# Quickstart: Menu-Driven CLI Interface

**Feature**: 002-cli-ui-update
**Date**: 2025-12-28
**Phase**: 1 (Design)

## Overview

This quickstart guide provides the essential commands and patterns for implementing the menu-driven CLI interface.

## Prerequisites

- Python 3.13+ installed
- Repository cloned
- Branch `002-cli-ui-update` checked out
- No new dependencies required

## Implementation Steps

### Step 1: Create Menu Interface Layer

**File**: `backend/src/backend/menu.py`

```python
"""
Menu-driven UI for CLI Todo Application
Replaces command-line interface with numbered menu options
"""

def display_welcome():
    """Show welcome screen with branding"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║      In-Memory CLI Todo Application - Menu Mode           ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()

def display_main_menu():
    """Show main menu with 7 options"""
    print("┌────────────────────────────────────────────────────────────┐")
    print("│ What would you like to do?                                 │")
    print("├────────────────────────────────────────────────────────────┤")
    print("│ 1. Add a new task                                          │")
    print("│ 2. List all tasks                                          │")
    print("│ 3. Complete a task                                         │")
    print("│ 4. Update a task title                                     │")
    print("│ 5. Delete a task                                           │")
    print("│ 6. Show help                                               │")
    print("│ 7. Exit application                                        │")
    print("└────────────────────────────────────────────────────────────┘")
    print()

def get_menu_choice():
    """Get and validate user choice (1-7)"""
    while True:
        try:
            choice = input("Enter choice (1-7): ").strip()
            if choice.isdigit() and 1 <= int(choice) <= 7:
                return int(choice)
            print("✗ Please enter a number between 1 and 7")
        except (ValueError, EOFError, KeyboardInterrupt):
            print("\n✗ Invalid input. Please try again.")

def prompt_for_task_title():
    """Get task title with validation"""
    while True:
        try:
            title = input("Enter task title: ").strip()
            if title:
                return title
            print("✗ Title cannot be empty")
        except (EOFError, KeyboardInterrupt):
            print("\n✗ Operation cancelled")
            return None

def prompt_for_task_id(action):
    """Get task ID with validation"""
    while True:
        try:
            task_id = input(f"Enter task ID to {action}: ").strip()
            if task_id.isdigit():
                return int(task_id)
            print("✗ Please enter a valid number")
        except (EOFError, KeyboardInterrupt):
            print("\n✗ Operation cancelled")
            return None

def show_results_and_pause():
    """Pause after showing results"""
    input("\nPress Enter to continue...")

def menu_loop(manager):
    """Main menu interaction loop"""
    display_welcome()

    while True:
        display_main_menu()
        choice = get_menu_choice()

        if choice == 1:  # Add
            title = prompt_for_task_title()
            if title:
                from backend.commands import add_task_handler
                add_task_handler([title], manager)

        elif choice == 2:  # List
            from backend.commands import list_tasks_handler
            list_tasks_handler([], manager)

        elif choice == 3:  # Complete
            task_id = prompt_for_task_id("complete")
            if task_id:
                from backend.commands import complete_task_handler
                complete_task_handler([str(task_id)], manager)

        elif choice == 4:  # Update
            task_id = prompt_for_task_id("update")
            if task_id:
                new_title = prompt_for_task_title()
                if new_title:
                    from backend.commands import update_task_handler
                    update_task_handler([str(task_id), new_title], manager)

        elif choice == 5:  # Delete
            task_id = prompt_for_task_id("delete")
            if task_id:
                from backend.commands import delete_task_handler
                delete_task_handler([str(task_id)], manager)

        elif choice == 6:  # Help
            from backend.commands import help_handler
            help_handler([], manager)

        elif choice == 7:  # Exit
            from backend.commands import exit_handler
            exit_handler([], manager)
            break

        # Pause after each operation (except exit)
        if choice != 7:
            show_results_and_pause()
```

### Step 2: Update Main Entry Point

**File**: `backend/src/backend/main.py`

```python
"""
CLI entry point - Menu mode only
Replaces command-line interface with menu
"""

from backend.manager import TaskManager
from backend.menu import menu_loop


def main():
    """
    Main entry point - launches menu interface
    """
    # Initialize task manager
    manager = TaskManager()

    # Launch menu loop (replaces CLI loop)
    menu_loop(manager)


if __name__ == "__main__":
    main()
```

### Step 3: Update Commands Module

**File**: `backend/src/backend/commands.py`

Remove CLI parsing functions (`parse_command`, `dispatch_command`, command mapping).

Update `help_handler`:

```python
def help_handler(args, manager):
    """
    Handle help command.

    Usage: help
    """
    print("Available commands (used via menu):")
    print("  1. Add a new task")
    print("  2. List all tasks")
    print("  3. Complete a task")
    print("  4. Update a task title")
    print("  5. Delete a task")
    print("  6. Show help")
    print("  7. Exit application")
    print()
    print("All operations are now performed through the menu interface.")
```

### Step 4: Create Unit Tests

**File**: `backend/tests/unit/test_menu.py`

Test all menu functions with mocked input.

### Step 5: Create Integration Tests

**File**: `backend/tests/integration/test_menu_workflow.py`

Test complete workflows with simulated user input.

### Step 6: Update Existing Tests

**File**: `backend/tests/unit/test_commands.py`

- Remove CLI parsing tests
- Update help handler tests
- Keep all handler tests

**File**: `backend/tests/integration/test_cli_workflow.py`

- Rename to `test_menu_workflow.py`
- Update to use menu input simulation

## Testing Commands

```bash
# Run all tests
cd backend
pytest

# Run menu-specific tests
pytest tests/unit/test_menu.py
pytest tests/integration/test_menu_workflow.py

# Run with coverage
pytest --cov=backend --cov-report=html

# Test specific workflow
pytest tests/integration/test_menu_workflow.py::TestCompleteMenuWorkflows::test_full_workflow_add_list_complete_delete
```

## Manual Testing

```bash
# Launch application
cd backend
python -m backend.main

# Test workflow:
# 1. Select 1 → Enter "Test Task" → Press Enter
# 2. Select 2 → Verify task appears
# 3. Select 3 → Enter "1" → Press Enter
# 4. Select 2 → Verify task is complete
# 5. Select 5 → Enter "1" → Press Enter
# 6. Select 2 → Verify task deleted
# 7. Select 7 → Exit
```

## Key Patterns

### Pattern 1: Input Validation Loop
```python
while True:
    try:
        value = input("Prompt: ").strip()
        if valid(value):
            return value
        print("✗ Error message")
    except (EOFError, KeyboardInterrupt):
        print("\n✗ Operation cancelled")
        return None
```

### Pattern 2: Handler Import
```python
from backend.commands import handler_name
handler_name(args, manager)
```

### Pattern 3: Pause After Operation
```python
if choice != 7:  # Don't pause on exit
    input("\nPress Enter to continue...")
```

## Common Issues

### Issue: Import Errors
**Solution**: Ensure `backend/src/backend/__init__.py` exists

### Issue: Handler Not Found
**Solution**: Verify handler function names in `commands.py`

### Issue: Tests Fail
**Solution**: Check that mock input sequences match expected prompts

## Success Criteria

- ✅ Menu displays 7 options
- ✅ All operations work via menu
- ✅ Input validation prevents errors
- ✅ Tests pass (unit + integration)
- ✅ No new dependencies
- ✅ Performance maintained

## Next Steps

After implementation:
1. Run full test suite
2. Verify manual workflows
3. Check constitution compliance
4. Create PHR for this work
5. Consider ADRs for key decisions
6. Ready for `/sp.tasks` if needed

## Quick Reference

| Operation | Menu Option | Handler | Validation |
|-----------|-------------|---------|------------|
| Add | 1 | add_task_handler | Non-empty title |
| List | 2 | list_tasks_handler | None |
| Complete | 3 | complete_task_handler | Numeric ID |
| Update | 4 | update_task_handler | Numeric ID + non-empty title |
| Delete | 5 | delete_task_handler | Numeric ID |
| Help | 6 | help_handler | None |
| Exit | 7 | exit_handler | None |

## Constitution Compliance

- ✅ Logic decoupled (menu wraps handlers)
- ✅ No new dependencies (stdlib only)
- ✅ State preserved (in-memory unchanged)
- ✅ Input validation implemented
- ✅ Ready for future phases (MCP, JWT, etc.)

**Status**: ✅ READY TO IMPLEMENT