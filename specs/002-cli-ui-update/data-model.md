# Data Model: Menu-Driven CLI Interface

**Feature**: 002-cli-ui-update
**Date**: 2025-12-28
**Phase**: 1 (Design)

## Overview

This feature is a presentation layer change that wraps existing business logic. The data model remains unchanged from the existing implementation.

## Existing Entities (Unchanged)

### Task
Represents a single todo item in the system.

**Source**: `backend/src/backend/models.py`

**Attributes**:
- `id` (int): Unique identifier, auto-incremented
- `title` (str): Task description, non-empty
- `is_complete` (bool): Completion status, default False

**State Transitions**:
- `incomplete` → `complete` (via complete_task_handler)
- `complete` → `incomplete` (not supported in current spec)
- `any` → `deleted` (via delete_task_handler)

**Validation Rules**:
- Title: Must be non-empty string, stripped of whitespace
- ID: Must be positive integer
- Completion: Boolean only

### TaskManager
Manages in-memory storage of tasks.

**Source**: `backend/src/backend/manager.py`

**Operations**:
- `add_task(title: str) -> Task`
- `get_task(id: int) -> Task | None`
- `list_tasks() -> list[Task]`
- `complete_task(id: int) -> bool`
- `update_task(id: int, new_title: str) -> bool`
- `delete_task(id: int) -> bool`

**Storage**: Dictionary `{id: Task}`

## Menu Interface Data Flow

### User Input → Handler Call

```
User Action: Select menu option 1
    ↓
Menu Layer: prompt_for_task_title()
    ↓
User Input: "Buy groceries"
    ↓
Menu Layer: Validate (non-empty)
    ↓
Menu Layer: add_task_handler(["Buy groceries"], manager)
    ↓
Business Logic: manager.add_task("Buy groceries")
    ↓
Data Layer: Create Task(id=1, title="Buy groceries", is_complete=False)
    ↓
Menu Layer: Display confirmation
    ↓
Menu Layer: Pause for user
```

### Input Validation Data

**Menu Choice Validation**:
- Input: string from `input()`
- Valid: "1", "2", ..., "7"
- Invalid: "0", "8", "abc", "", " "
- Output: int (1-7) or retry

**Task Title Validation**:
- Input: string from `input()`
- Valid: non-empty after strip()
- Invalid: "", "   ", whitespace only
- Output: string or retry

**Task ID Validation**:
- Input: string from `input()`
- Valid: positive integer string ("1", "42")
- Invalid: "0", "-1", "abc", ""
- Output: int or retry

## Error State Data

### Error Messages
All errors are user-facing strings with visual indicators:

```
✗ Please enter a number between 1 and 7
✗ Title cannot be empty
✗ Please enter a valid number
✗ Operation cancelled
✗ Task #999 not found
```

### Success Messages
All successes use existing handler formatting:

```
✓ Task #1 added
Total: 1 tasks
[Task list with status]
✓ Task #1 marked as complete
✓ Task #1 updated
✓ Task #1 deleted
```

## No Schema Changes

**Important**: This feature requires NO changes to:
- Task model schema
- TaskManager interface
- Handler function signatures
- Storage format
- Validation rules

**Reason**: Pure presentation layer change - menu interface wraps existing logic without modification.

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                           │
│  (Sees: Menu options, Prompts, Output, Errors)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Menu Interface Layer                     │
│  - display_welcome()                                        │
│  - display_main_menu()                                      │
│  - get_menu_choice() → validates 1-7                        │
│  - prompt_for_task_title() → validates non-empty           │
│  - prompt_for_task_id() → validates numeric                │
│  - show_results_and_pause()                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Command Handler Layer                     │
│  - add_task_handler(title)                                  │
│  - list_tasks_handler()                                     │
│  - complete_task_handler(id)                                │
│  - update_task_handler(id, new_title)                       │
│  - delete_task_handler(id)                                  │
│  - help_handler()                                           │
│  - exit_handler()                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   Business Logic Layer                      │
│  - TaskManager operations                                   │
│  - Task state management                                    │
│  - Business rule validation                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      Data Layer                             │
│  - In-memory dictionary: {id: Task}                         │
│  - Task model (id, title, is_complete)                      │
└─────────────────────────────────────────────────────────────┘
```

## Conclusion

**Data Impact**: ✅ NONE

This feature is purely a presentation layer change. All data models, business logic, and storage mechanisms remain unchanged. The menu interface simply provides an alternative way to interact with the existing system.

**Ready for Implementation**: All data model considerations resolved.