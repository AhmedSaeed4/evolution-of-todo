---
id: 002
title: Create Architecture Plan
stage: plan
date: 2025-12-28
surface: agent
model: claude-opus-4-5-20251101
feature: cli-ui-update
branch: 002-cli-ui-update
user: Claude Code
command: /sp.plan
labels: ["architecture", "planning", "constitution-check", "design"]
links:
  spec: specs/002-cli-ui-update/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-cli-ui-update/plan.md (created/updated)
  - specs/002-cli-ui-update/research.md (created)
  - specs/002-cli-ui-update/data-model.md (created)
  - specs/002-cli-ui-update/quickstart.md (created)
  - specs/002-cli-ui-update/contracts/README.md (created)
  - CLAUDE.md (updated with new tech stack info)
tests:
  - Constitution Check: All 8 principles verified (8/8 pass)
  - Phase 0 research: All unknowns resolved
  - Phase 1 design: All artifacts created
---

## Prompt

# Menu-Driven Interface Implementation Plan

## 🎯 Architecture Change Summary

**Approach**: Replace CLI with Menu Interface (Complete Overhaul)

### Current State vs New State
- **Current**: Command-line interface (`todo> add Buy groceries`)
- **New**: Menu-driven interface (select option 1, then enter title)

### What Changes
- ❌ Remove `todo>` command prompt
- ❌ Remove `parse_command()` function
- ❌ Remove `dispatch_command()` function
- ❌ Remove CLI mode entirely

### What Stays
- ✅ All business logic (`manager.py`, `models.py`)
- ✅ All command handlers (`add_task_handler`, etc.)
- ✅ All validation and formatting
- ✅ All existing tests (modified for menu mode)

---

## 📁 Files to Create (NEW - 3 files)

### 1. backend/src/backend/menu.py
**Purpose**: Complete menu-driven interface replacing CLI loop

```python
\"\"\"
Menu-driven UI for CLI Todo Application
Replaces command-line interface with numbered menu options
\"\"\"

def display_welcome():
    \"\"\"Show welcome screen with branding\"\"\"
    print(\"╔════════════════════════════════════════════════════════════╗")
    print(\"║      In-Memory CLI Todo Application - Menu Mode           ║")
    print(\"╚════════════════════════════════════════════════════════════╝")
    print()

def display_main_menu():
    \"\"\"Show main menu with 7 options\"\"\"
    print(\"┌────────────────────────────────────────────────────────────┐")
    print(\"│ What would you like to do?                                 │")
    print(\"├────────────────────────────────────────────────────────────┤")
    print(\"│ 1. Add a new task                                          │")
    print(\"│ 2. List all tasks                                          │")
    print(\"│ 3. Complete a task                                         │")
    print(\"│ 4. Update a task title                                     │")
    print(\"│ 5. Delete a task                                           │")
    print(\"│ 6. Show help                                               │")
    print(\"│ 7. Exit application                                        │")
    print(\"└────────────────────────────────────────────────────────────┘")
    print()

def get_menu_choice():
    \"\"\"Get and validate user choice (1-7)\"\"\"
    while True:
        try:
            choice = input(\"Enter choice (1-7): \").strip()
            if choice.isdigit() and 1 <= int(choice) <= 7:
                return int(choice)
            print(\"✗ Please enter a number between 1 and 7\")
        except (ValueError, EOFError, KeyboardInterrupt):
            print(\"\\n✗ Invalid input. Please try again.\")

def prompt_for_task_title():
    \"\"\"Get task title with validation\"\"\"
    while True:
        try:
            title = input(\"Enter task title: \").strip()
            if title:
                return title
            print(\"✗ Title cannot be empty\")
        except (EOFError, KeyboardInterrupt):
            print(\"\\n✗ Operation cancelled\")
            return None

def prompt_for_task_id(action):
    \"\"\"Get task ID with validation\"\"\"
    while True:
        try:
            task_id = input(f\"Enter task ID to {action}: \").strip()
            if task_id.isdigit():
                return int(task_id)
            print(\"✗ Please enter a valid number\")
        except (EOFError, KeyboardInterrupt):
            print(\"\\n✗ Operation cancelled\")
            return None

def show_results_and_pause():
    \"\"\"Pause after showing results\"\"\"
    input(\"\\nPress Enter to continue...\")

def menu_loop(manager):
    \"\"\"Main menu interaction loop\"\"\"
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
            task_id = prompt_for_task_id(\"complete\")
            if task_id:
                from backend.commands import complete_task_handler
                complete_task_handler([str(task_id)], manager)

        elif choice == 4:  # Update
            task_id = prompt_for_task_id(\"update\")
            if task_id:
                new_title = prompt_for_task_title()
                if new_title:
                    from backend.commands import update_task_handler
                    update_task_handler([str(task_id), new_title], manager)

        elif choice == 5:  # Delete
            task_id = prompt_for_task_id(\"delete\")
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

**Lines**: ~120-150 | **Complexity**: Medium

---

### 2. backend/tests/unit/test_menu.py
**Purpose**: Test all menu functions

```python
\"\"\"
Unit tests for menu.py functions
\"\"\"

import pytest
from unittest.mock import patch, MagicMock
from io import StringIO
from backend.menu import (
    display_welcome,
    display_main_menu,
    get_menu_choice,
    prompt_for_task_title,
    prompt_for_task_id,
    show_results_and_pause
)
from backend.manager import TaskManager


class TestMenuDisplay:
    \"\"\"Test menu display functions\"\"\"

    def test_display_welcome(self, capsys):
        display_welcome()
        captured = capsys.readouterr()
        assert \"In-Memory CLI Todo Application\" in captured.out
        assert \"Menu Mode\" in captured.out

    def test_display_main_menu(self, capsys):
        display_main_menu()
        captured = capsys.readouterr()
        assert \"1. Add a new task\" in captured.out
        assert \"2. List all tasks\" in captured.out
        assert \"7. Exit application\" in captured.out


class TestMenuValidation:
    \"\"\"Test input validation\"\"\"

    def test_get_menu_choice_valid(self):
        with patch('builtins.input', return_value='3'):
            assert get_menu_choice() == 3

    def test_get_menu_choice_retry(self):
        inputs = ['abc', '0', '8', '5']
        with patch('builtins.input', side_effect=inputs):
            result = get_menu_choice()
            assert result == 5

    def test_prompt_for_task_title_valid(self):
        with patch('builtins.input', return_value='Buy groceries'):
            assert prompt_for_task_title() == 'Buy groceries'

    def test_prompt_for_task_title_empty_retry(self):
        inputs = ['', '   ', 'Valid Task']
        with patch('builtins.input', side_effect=inputs):
            assert prompt_for_task_title() == 'Valid Task'

    def test_prompt_for_task_id_valid(self):
        with patch('builtins.input', return_value='5'):
            result = prompt_for_task_id(\"delete\")
            assert result == 5

    def test_prompt_for_task_id_invalid_retry(self):
        inputs = ['abc', '-1', '0', '999']
        with patch('builtins.input', side_effect=inputs):
            result = prompt_for_task_id(\"complete\")
            assert result == 999


class TestMenuLoop:
    \"\"\"Test main menu loop\"\"\"

    def setup_method(self):
        self.manager = TaskManager()

    def test_menu_loop_add_task(self, capsys):
        \"\"\"Test adding task through menu\"\"\"
        with patch('builtins.input', side_effect=['1', 'Test Task', '']):  # Menu choice, title, pause
            from backend.menu import menu_loop
            menu_loop(self.manager)

        assert len(self.manager.tasks) == 1
        assert self.manager.get_task(1).title == \"Test Task\"

    def test_menu_loop_exit(self, capsys):
        \"\"\"Test exit option\"\"\"
        with patch('builtins.input', return_value='7'):
            from backend.menu import menu_loop
            menu_loop(self.manager)

        captured = capsys.readouterr()
        assert \"Goodbye\" in captured.out

    def test_menu_loop_list_tasks(self, capsys):
        \"\"\"Test listing tasks\"\"\"
        self.manager.add_task(\"Task 1\")
        self.manager.add_task(\"Task 2\")

        with patch('builtins.input', side_effect=['2', '']):  # List, pause
            from backend.menu import menu_loop
            menu_loop(self.manager)

        captured = capsys.readouterr()
        assert \"Task 1\" in captured.out
        assert \"Task 2\" in captured.out
```

**Lines**: ~100-120 | **Complexity**: Medium

---

### 3. backend/tests/integration/test_menu_workflow.py
**Purpose**: End-to-end menu workflows

```python
\"\"\"
Integration tests for complete menu workflows
\"\"\"

import pytest
from unittest.mock import patch
from io import StringIO
from backend.manager import TaskManager


class TestCompleteMenuWorkflows:
    \"\"\"Test complete user workflows via menu\"\"\"

    def setup_method(self):
        self.manager = TaskManager()

    def test_full_workflow_add_list_complete_delete(self, capsys):
        \"\"\"Complete workflow: add → list → complete → delete → list\"\"\"
        menu_choices = [
            '1', 'Buy groceries', '',      # Add task
            '2', '',                        # List tasks
            '3', '1', '',                   # Complete task 1
            '5', '1', '',                   # Delete task 1
            '2', '',                        # List tasks (should be empty)
            '7'                             # Exit
        ]

        with patch('builtins.input', side_effect=menu_choices):
            from backend.menu import menu_loop
            menu_loop(self.manager)

        captured = capsys.readouterr()
        assert \"✓ Task #1 added\" in captured.out
        assert \"Total: 1 tasks\" in captured.out
        assert \"marked as complete\" in captured.out
        assert \"✓ Task #1 deleted\" in captured.out
        assert \"No tasks yet\" in captured.out

    def test_update_workflow(self, capsys):
        \"\"\"Add task, update it, verify change\"\"\"
        menu_choices = [
            '1', 'Original title', '',     # Add
            '4', '1', 'Updated title', '', # Update
            '2', '',                        # List
            '7'                             # Exit
        ]

        with patch('builtins.input', side_effect=menu_choices):
            from backend.menu import menu_loop
            menu_loop(self.manager)

        captured = capsys.readouterr()
        assert \"Updated title\" in captured.out
        assert \"Original title\" not in captured.out

    def test_error_recovery_workflow(self, capsys):
        \"\"\"Test error handling in menu mode\"\"\"
        menu_choices = [
            '1', '', 'Valid Task', '',     # Empty then valid
            '3', 'abc', '1', '',           # Invalid ID then valid
            '5', '999', '',                # Non-existent task
            '2', '',                        # List (should still have 1 task)
            '7'                             # Exit
        ]

        with patch('builtins.input', side_effect=menu_choices):
            from backend.menu import menu_loop
            menu_loop(self.manager)

        captured = capsys.readouterr()
        assert \"Title cannot be empty\" in captured.out
        assert \"Invalid ID\" in captured.out
        assert \"Task #999 not found\" in captured.out
        assert \"Total: 1 tasks\" in captured.out  # First task still exists

    def test_help_workflow(self, capsys):
        \"\"\"Test help option\"\"\"
        menu_choices = ['6', '7']  # Help, Exit

        with patch('builtins.input', side_effect=menu_choices):
            from backend.menu import menu_loop
            menu_loop(self.manager)

        captured = capsys.readouterr()
        assert \"Available commands:\" in captured.out
        assert \"add <title>\" in captured.out

    def test_large_scale_menu_workflow(self):
        \"\"\"Test menu mode with 1000 tasks\"\"\"
        # Add 1000 tasks
        for i in range(1000):
            self.manager.add_task(f\"Task {i}\")

        # Test list operation in menu mode
        with patch('builtins.input', side_effect=['2', '7']):
            from backend.menu import menu_loop
            import time
            start = time.time()
            menu_loop(self.manager)
            elapsed = time.time() - start

        # Should complete quickly
        assert elapsed < 1.0  # Under 1 second

    def test_concurrent_operations_simulation(self):
        \"\"\"Simulate realistic menu usage patterns\"\"\"
        # Realistic workflow: Add multiple, complete some, update one, delete one
        menu_choices = [
            '1', 'Task A', '',
            '1', 'Task B', '',
            '1', 'Task C', '',
            '3', '2', '',      # Complete Task B
            '4', '1', 'Updated Task A', '',
            '5', '3', '',      # Delete Task C
            '2', '',
            '7'
        ]

        with patch('builtins.input', side_effect=menu_choices):
            from backend.menu import menu_loop
            menu_loop(self.manager)

        # Verify final state
        tasks = self.manager.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].title == \"Updated Task A\"
        assert tasks[0].is_complete is False
        assert tasks[1].title == \"Task B\"
        assert tasks[1].is_complete is True


class TestMenuPerformance:
    \"\"\"Performance tests for menu mode\"\"\"

    def setup_method(self):
        self.manager = TaskManager()

    def test_menu_performance_10k_tasks(self):
        \"\"\"Test menu operations with 10,000 tasks\"\"\"
        # Setup
        for i in range(10000):
            self.manager.add_task(f\"Task {i}\")

        # Test list operation
        import time
        start = time.time()
        with patch('builtins.input', side_effect=['2', '7']):
            from backend.menu import menu_loop
            menu_loop(self.manager)
        elapsed = time.time() - start

        # Should be fast
        assert elapsed < 2.0  # Under 2 seconds for 10k tasks

    def test_memory_usage_consistency(self):
        \"\"\"Verify memory usage is same as CLI mode\"\"\"
        import sys

        # Add 1000 tasks
        for i in range(1000):
            self.manager.add_task(f\"Task {i}\")

        # Measure memory
        memory_bytes = sys.getsizeof(self.manager.tasks)
        for task in self.manager.tasks.values():
            memory_bytes += sys.getsizeof(task)

        memory_mb = memory_bytes / (1024 * 1024)

        # Should be similar to CLI mode (~0.2MB for 1000 tasks)
        assert memory_mb < 1.0
```

**Lines**: ~150-180 | **Complexity**: Medium-High

---

## 📁 Files to Modify (EXISTING - 4 files)

### 4. backend/src/backend/main.py
**Purpose**: Replace CLI loop with menu loop

**Current**: 118 lines → **New**: ~25 lines (major simplification)

```python
\"\"\"
CLI entry point - Menu mode only
Replaces command-line interface with menu
\"\"\"

from backend.manager import TaskManager
from backend.menu import menu_loop


def main():
    \"\"\"
    Main entry point - launches menu interface
    \"\"\"
    # Initialize task manager
    manager = TaskManager()

    # Launch menu loop (replaces CLI loop)
    menu_loop(manager)


if __name__ == \"__main__\":
    main()
```

**What was removed:**
- ❌ `parse_command()` function
- ❌ `dispatch_command()` function
- ❌ CLI loop with `todo>` prompt
- ❌ Command parsing logic
- ❌ Help message (moved to menu handler)

**What was kept:**
- ✅ TaskManager initialization
- ✅ Main entry point structure

---

### 5. backend/src/backend/commands.py
**Purpose**: Remove CLI-specific functionality, keep handlers

**Current**: 167 lines → **New**: ~140 lines (remove ~27 lines)

```python
\"\"\"
Command handlers - Used by menu module
All handlers remain unchanged except help_handler
\"\"\"

# All existing handlers remain exactly the same:
# - add_task_handler
# - delete_task_handler
# - update_task_handler
# - list_tasks_handler
# - complete_task_handler
# - exit_handler

# MODIFIED: help_handler
def help_handler(args, manager):
    \"\"\"
    Handle help command.

    Usage: help
    \"\"\"
    print(\"Available commands (used via menu):\")
    print(\"  1. Add a new task\")
    print(\"  2. List all tasks\")
    print(\"  3. Complete a task\")
    print(\"  4. Update a task title\")
    print(\"  5. Delete a task\")
    print(\"  6. Show help\")
    print(\"  7. Exit application\")
    print()
    print(\"All operations are now performed through the menu interface.\")
```

**What was removed:**
- ❌ `parse_command()` (moved to menu.py)
- ❌ `dispatch_command()` (replaced by menu_loop)
- ❌ Command mapping dictionary

**What was kept:**
- ✅ All 7 command handlers (unchanged)
- ✅ All validation logic
- ✅ All formatting and output

---

### 6. backend/tests/unit/test_commands.py
**Purpose**: Update tests for menu mode compatibility

**Current**: ~433 lines → **New**: ~200 lines (remove CLI-specific tests, keep handler tests)

```python
\"\"\"
Unit tests for command handlers
Tests remain valid since handlers are unchanged
\"\"\"

# Keep all handler tests that test the handlers directly:
# - TestAddTaskHandler (all tests)
# - TestDeleteTaskHandler (all tests)
# - TestUpdateTaskHandler (all tests)
# - TestListTasksHandler (all tests)
# - TestCompleteTaskHandler (all tests)
# - TestHelpHandler (updated)
# - TestExitHandler (all tests)

# REMOVE: TestErrorHandlingUserStory3 (CLI-specific)
# These tests were for CLI error handling, now handled by menu.py

# UPDATE: TestHelpHandler
class TestHelpHandler:
    \"\"\"Test help output reflects menu mode\"\"\"

    def test_help_output(self, capsys):
        help_handler([], self.manager)
        captured = capsys.readouterr()
        assert \"Available commands (used via menu):\" in captured.out
        assert \"1. Add a new task\" in captured.out
        assert \"7. Exit application\" in captured.out
```

**What changes:**
- ✅ Keep all direct handler tests (they still work)
- ❌ Remove CLI parsing tests
- ❌ Remove command dispatch tests
- ✅ Update help handler tests

---

### 7. backend/tests/integration/test_cli_workflow.py
**Purpose**: Update for menu mode, rename to test_menu_workflow.py

**Current**: ~365 lines → **New**: ~200 lines (simplified, menu-focused)

```python
\"\"\"
Integration tests for menu workflows
Replaces CLI workflow tests
\"\"\"

# Keep tests that verify business logic:
# - TestCompleteCLIWorkflow (rename to TestCompleteMenuWorkflow)
# - Keep all workflow tests but adapt for menu input

# Example adaptation:
def test_full_workflow(self, capsys):
    \"\"\"Add → List → Complete → Delete → List via menu\"\"\"
    # OLD CLI: add_task_handler([\"Buy\", \"groceries\"], manager)
    # NEW MENU: Simulate menu choices

    menu_choices = ['1', 'Buy groceries', '', '2', '', '3', '1', '', '5', '1', '', '2', '', '7']

    with patch('builtins.input', side_effect=menu_choices):
        menu_loop(self.manager)

    # Assertions remain the same
```

---

## 📊 Complete File Impact Summary

| File | Status | Action | Line Change | Complexity |
|------|--------|--------|-------------|------------|
| menu.py | NEW | Create menu module | +120-150 | Medium |
| test_menu.py | NEW | Unit tests | +100-120 | Medium |
| test_menu_workflow.py | NEW | Integration tests | +150-180 | Medium-High |
| main.py | MODIFY | Replace CLI with menu | -93 / +25 | High |
| commands.py | MODIFY | Remove CLI parsing | -27 / +5 | Low |
| test_commands.py | MODIFY | Update for menu | -233 / +50 | Medium |
| test_cli_workflow.py | MODIFY | Rename & update | -165 / +100 | Medium |
| **TOTAL** | | | **~+400 / ~-500** | |

---

## 🎨 Menu UI Flow

```
main() → menu_loop()
├── display_welcome()
├── while True:
│   ├── display_main_menu()
│   ├── get_menu_choice()
│   ├── switch choice:
│   │   ├── 1: prompt_for_task_title() → add_task_handler()
│   │   ├── 2: list_tasks_handler()
│   │   ├── 3: prompt_for_task_id() → complete_task_handler()
│   │   ├── 4: prompt_for_task_id() + prompt_for_task_title() → update_task_handler()
│   │   ├── 5: prompt_for_task_id() → delete_task_handler()
│   │   ├── 6: help_handler()
│   │   └── 7: exit_handler() → break
│   └── show_results_and_pause() (if choice != 7)
```

---

## ✅ Success Criteria

### Functional Requirements
- ✅ Menu displays 7 numbered options
- ✅ All 7 operations work via menu
- ✅ Input validation prevents errors
- ✅ Visual formatting consistent
- ✅ Error messages clear
- ✅ Pause after each operation

### Non-Functional Requirements
- ✅ No new dependencies
- ✅ All existing tests pass (modified)
- ✅ Performance maintained
- ✅ Memory usage unchanged

### Test Coverage
- ✅ Unit tests: 100% menu functions
- ✅ Integration tests: All workflows
- ✅ Regression tests: Handler functionality

---

## Response snapshot

**Phase 0: Research Complete**
- ✅ All technical questions resolved
- ✅ No unknowns requiring clarification
- ✅ Constitution compliance verified

**Phase 1: Design Complete**
- ✅ `research.md` - All decisions documented
- ✅ `data-model.md` - Entity analysis (unchanged)
- ✅ `quickstart.md` - Implementation guide
- ✅ `contracts/README.md` - Interface definitions
- ✅ Agent context updated (CLAUDE.md)

**Phase 2: Planning Complete**
- ✅ `plan.md` - Architecture plan with constitution check
- ✅ 3 ADR suggestions identified
- ✅ All gates passed

**Key Outcomes**:
1. **Constitution Check**: 8/8 principles compliant (with phase-appropriate justifications)
2. **Architecture**: Presentation layer only - menu wraps existing handlers
3. **Dependencies**: Zero new dependencies (stdlib only)
4. **Risk**: Minimal - all decisions straightforward
5. **Next Steps**: Ready for implementation (`/sp.tasks` or manual coding)

---

## Outcome

- ✅ Impact: Complete architecture plan with all Phase 0-1 artifacts
- 🧪 Tests: Constitution check passed (8/8), research complete
- 📁 Files: 5 new files created (plan, research, data-model, quickstart, contracts)
- 🔁 Next prompts: `/sp.tasks` for implementation breakdown, or manual implementation
- 🧠 Reflection: Simple presentation layer change with clear architecture and full constitution compliance

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully
- Graders run and results: Constitution gates all pass
- Prompt variant: Standard /sp.plan with user-provided spec
- Next experiment: Execute `/sp.tasks` to generate implementation tasks

---

## Architecture Decision Records (ADRs)

📋 **Architectural decision detected**: Menu interface wraps existing command handlers without modification
**Document reasoning and tradeoffs?** Run `/sp.adr "Menu Interface Handler Wrapping"`

📋 **Architectural decision detected**: Input validation moved from CLI parser to menu prompts
**Document reasoning and tradeoffs?** Run `/sp.adr "Menu Layer Input Validation"`

📋 **Architectural decision detected**: Pause-after-operation UX pattern for CLI
**Document reasoning and tradeoffs?** Run `/sp.adr "CLI Operation Pause Pattern"`