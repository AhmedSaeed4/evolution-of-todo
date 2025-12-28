# CLI Command Contracts

**Feature**: `001-cli-todo`
**Type**: CLI Interface Specification
**Constitution**: v1.1.0

## Overview

This document defines the command-line interface contracts for the Todo application. Each command specifies inputs, outputs, error conditions, and validation rules.

## Command Definitions

### 1. Add Task

**Command**: `add <title>`

**Purpose**: Create a new task with the given title.

**Input**:
- `title`: string (required, non-empty)

**Validation**:
- Title must not be empty after trimming whitespace
- Title must be provided

**Success Output**:
```
✓ Task #<id> added: "<title>"
```

**Error Cases**:
- Missing title: `Usage: add <title>`
- Empty title: `Usage: add <title>` (after validation)

**Example**:
```bash
todo> add Buy groceries
✓ Task #1 added: "Buy groceries"
```

**Business Logic**:
1. Trim whitespace from title
2. Validate non-empty
3. Generate unique ID
4. Create Task with timestamp
5. Store in TaskManager
6. Return success message

---

### 2. Delete Task

**Command**: `delete <id>`

**Purpose**: Remove a task by ID.

**Input**:
- `id`: integer (required, positive)

**Validation**:
- ID must be a valid integer
- ID must be positive (> 0)
- Task with ID must exist

**Success Output**:
```
✓ Task #<id> deleted: "<title>"
```

**Error Cases**:
- Missing ID: `Usage: delete <id>`
- Invalid format: `Invalid ID. Please enter a number.`
- Not found: `Task #<id> not found.`

**Example**:
```bash
todo> delete 1
✓ Task #1 deleted: "Buy groceries"

todo> delete 99
✗ Error: Task #99 not found
```

**Business Logic**:
1. Parse ID as integer
2. Validate ID > 0
3. Check task exists
4. Remove from TaskManager
5. Return success/error message

---

### 3. Update Task

**Command**: `update <id> <new_title>`

**Purpose**: Modify an existing task's title.

**Input**:
- `id`: integer (required, positive)
- `new_title`: string (required, non-empty)

**Validation**:
- ID must be valid integer > 0
- Task with ID must exist
- New title must not be empty after trimming

**Success Output**:
```
✓ Task #<id> updated: "<old_title>" → "<new_title>"
```

**Error Cases**:
- Missing arguments: `Usage: update <id> <new_title>`
- Invalid ID format: `Invalid ID. Please enter a number.`
- Task not found: `Task #<id> not found.`
- Empty new title: `Usage: update <id> <new_title>`

**Example**:
```bash
todo> update 1 Buy organic groceries
✓ Task #1 updated: "Buy groceries" → "Buy organic groceries"

todo> update 99 New title
✗ Error: Task #99 not found
```

**Business Logic**:
1. Parse ID as integer
2. Validate ID > 0
3. Check task exists
4. Validate new title
5. Update task title
6. Return old → new confirmation

---

### 4. List Tasks

**Command**: `list`

**Purpose**: Display all tasks in formatted table.

**Input**: None

**Validation**: None

**Success Output**:
```
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [ ]    │ Buy groceries           │
│  2 │ [x]    │ Call doctor             │
│  3 │ [ ]    │ Finish homework         │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (1 complete, 2 pending)
```

**Empty State Output**:
```
No tasks found. Add a task with: add <title>
```

**Error Cases**: None

**Example**:
```bash
todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [ ]    │ Buy groceries           │
└────┴────────┴─────────────────────────┘
Total: 1 tasks (0 complete, 1 pending)
```

**Business Logic**:
1. Get all tasks from TaskManager
2. Sort by ID ascending
3. Format as table with borders
4. Calculate statistics (total, complete, pending)
5. Display or show empty state

---

### 5. Complete Task

**Command**: `complete <id>`

**Purpose**: Toggle task completion status.

**Input**:
- `id`: integer (required, positive)

**Validation**:
- ID must be valid integer > 0
- Task with ID must exist

**Success Output** (Complete):
```
✓ Task #<id> marked as complete: "<title>"
```

**Success Output** (Incomplete):
```
✓ Task #<id> marked as incomplete: "<title>"
```

**Error Cases**:
- Missing ID: `Usage: complete <id>`
- Invalid format: `Invalid ID. Please enter a number.`
- Not found: `Task #<id> not found.`

**Example**:
```bash
todo> complete 1
✓ Task #1 marked as complete: "Buy groceries"

todo> complete 1
✓ Task #1 marked as incomplete: "Buy groceries"

todo> complete 99
✗ Error: Task #99 not found
```

**Business Logic**:
1. Parse ID as integer
2. Validate ID > 0
3. Check task exists
4. Toggle is_complete status
5. Return appropriate confirmation message

---

### 6. Help

**Command**: `help`

**Purpose**: Display available commands and usage.

**Input**: None

**Validation**: None

**Success Output**:
```
Available Commands:
  add <title>           Add a new task
  delete <id>           Delete a task by ID
  update <id> <title>   Update a task's title
  list                  View all tasks
  complete <id>         Toggle task completion status
  help                  Show this help message
  exit                  Exit the application
```

**Error Cases**: None

**Business Logic**:
1. Return static help text
2. No state changes

---

### 7. Exit

**Command**: `exit` or `quit`

**Purpose**: Terminate the application.

**Input**: None

**Validation**: None

**Success Output**:
```
Goodbye! Your tasks have not been saved.
```

**Error Cases**: None

**Example**:
```bash
todo> exit
Goodbye! Your tasks have not been saved.

todo> quit
Goodbye! Your tasks have not been saved.
```

**Business Logic**:
1. Display goodbye message
2. Break main loop
3. Terminate application

---

## Error Handling Contract

### Error Types

1. **Input Validation Errors**
   - Empty input → Silent re-prompt
   - Unknown command → "Unknown command. Type 'help' for available commands."
   - Missing arguments → "Usage: <command> <args>"

2. **Business Logic Errors**
   - Invalid ID format → "Invalid ID. Please enter a number."
   - Task not found → "Task #<id> not found."
   - Empty title → "Usage: add <title>" or "Usage: update <id> <new_title>"

3. **System Errors** (unlikely in Phase I)
   - Memory exhaustion → "System error: Cannot create task"
   - Unexpected state → "System error: Please restart application"

### Error Response Pattern
```
✗ Error: <descriptive message>
```

### Success Response Pattern
```
✓ <action confirmation>
```

---

## Command Parsing Contract

### Input Format
```
<command> [arguments...]
```

### Parsing Rules
1. Split by whitespace
2. First token = command
3. Remaining tokens = arguments (joined with spaces for title)
4. Case-sensitive commands
5. Extra whitespace trimmed

### Examples
```
"add Buy groceries" → command="add", args=["Buy", "groceries"] → title="Buy groceries"
"delete 1" → command="delete", args=["1"] → id=1
"list" → command="list", args=[] → no arguments
"  add   Task 1  " → command="add", title="Task 1" (trimmed)
```

---

## State Management Contract

### Session State
- **Scope**: Single application instance
- **Lifetime**: Application runtime
- **Persistence**: None (data lost on exit)

### State Changes
- **Add**: Creates new task, increments counter
- **Delete**: Removes task, counter unchanged
- **Update**: Modifies task title, counter unchanged
- **Complete**: Toggles status, counter unchanged
- **List**: Read-only, no state change
- **Help**: Read-only, no state change
- **Exit**: Terminates, state discarded

---

## Testing Contract

### Unit Test Coverage
- All command handlers
- All validation paths
- All error conditions
- All success paths

### Integration Test Coverage
- Complete user workflows
- Error recovery flows
- Edge cases (empty list, max tasks, etc.)

### Expected Test Results
- 100% command coverage
- 100% error path coverage
- All acceptance scenarios from spec.md pass