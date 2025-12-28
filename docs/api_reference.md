# API Reference: CLI Todo Application

**Feature**: 001-cli-todo
**Version**: 1.0.0
**Date**: 2025-12-28

## Command Reference

### Add Task
**Command**: `add <title>`

**Purpose**: Creates a new task with the specified title.

**Arguments**:
- `title` (required): Task description (non-empty string)

**Examples**:
```bash
todo> add Buy groceries
✓ Task #1 added: "Buy groceries"

todo> add Call doctor tomorrow at 3pm
✓ Task #2 added: "Call doctor tomorrow at 3pm"
```

**Error Cases**:
```bash
todo> add
Usage: add <title>

todo> add
Usage: add <title>
```

---

### Delete Task
**Command**: `delete <id>`

**Purpose**: Removes a task by its ID.

**Arguments**:
- `id` (required): Task ID (positive integer)

**Examples**:
```bash
todo> delete 1
✓ Task #1 deleted

todo> delete 99
✗ Task #99 not found
```

**Error Cases**:
```bash
todo> delete
Usage: delete <id>

todo> delete abc
Invalid ID. Please enter a number.

todo> delete 99
✗ Task #99 not found
```

---

### Update Task
**Command**: `update <id> <new_title>`

**Purpose**: Modifies an existing task's title.

**Arguments**:
- `id` (required): Task ID (positive integer)
- `new_title` (required): New task description (non-empty string)

**Examples**:
```bash
todo> update 1 Buy organic groceries
✓ Task #1 updated: "Buy groceries" → "Buy organic groceries"

todo> update 2 Call doctor tomorrow
✓ Task #2 updated: "Call doctor" → "Call doctor tomorrow"
```

**Error Cases**:
```bash
todo> update
Usage: update <id> <new_title>

todo> update 1
Usage: update <id> <new_title>

todo> update abc New title
Invalid ID. Please enter a number.

todo> update 99 New title
✗ Task #99 not found

todo> update 1
Usage: update <id> <new_title>
```

---

### List Tasks
**Command**: `list`

**Purpose**: Displays all tasks in a formatted table with summary statistics.

**Arguments**: None

**Examples**:
```bash
todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [x]    │ Buy groceries           │
│  2 │ [ ]    │ Call doctor             │
│  3 │ [x]    │ Finish homework         │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (2 complete, 1 pending)

todo> list
No tasks yet. Add a task with 'add <title>'
```

**Features**:
- Box-drawing characters for table borders
- Column alignment (ID right-aligned, Title left-aligned)
- Status indicators: `[ ]` for incomplete, `[x]` for complete
- Summary statistics: Total, Complete, Pending
- Empty state message when no tasks exist

---

### Complete Task
**Command**: `complete <id>`

**Purpose**: Toggles the completion status of a task.

**Arguments**:
- `id` (required): Task ID (positive integer)

**Examples**:
```bash
# Mark incomplete task as complete
todo> complete 1
✓ Task #1 marked as complete: "Buy groceries"

# Toggle complete task back to incomplete
todo> complete 1
✓ Task #1 marked as incomplete: "Buy groceries"
```

**Error Cases**:
```bash
todo> complete
Usage: complete <id>

todo> complete abc
Invalid ID. Please enter a number.

todo> complete 99
✗ Task #99 not found
```

---

### Help
**Command**: `help`

**Purpose**: Displays all available commands and their usage.

**Arguments**: None

**Output**:
```
Available commands:
  add <title>        - Add a new task
  delete <id>        - Delete a task
  update <id> <title> - Update task title
  list               - List all tasks
  complete <id>      - Toggle task completion
  help               - Show this help
  exit/quit          - Exit the application
```

---

### Exit / Quit
**Command**: `exit` or `quit`

**Purpose**: Terminates the application.

**Arguments**: None

**Examples**:
```bash
todo> exit
Goodbye! Your tasks have not been saved.

todo> quit
Goodbye! Your tasks have not been saved.
```

**Note**: Both commands are equivalent and display the same goodbye message.

---

## Input Parsing Rules

### Command Format
```
<command> [arguments...]
```

### Parsing Behavior
1. **Whitespace trimming**: Leading and trailing whitespace is removed from input
2. **Empty input**: Silently re-prompts (no error message)
3. **Command extraction**: First word becomes the command (case-sensitive)
4. **Argument joining**: Remaining words are joined with spaces for title arguments
5. **Case sensitivity**: Commands must be lowercase

### Examples
```
"add Buy groceries"      → command="add", args=["Buy", "groceries"]
"  add   Task 1  "       → command="add", args=["Task", "1"]
"delete 1"               → command="delete", args=["1"]
"list"                   → command="list", args=[]
""                       → No command (silent re-prompt)
"   "                    → No command (silent re-prompt)
```

---

## Error Messages

### Input Validation Errors
| Scenario | Message |
|----------|---------|
| Empty input | (Silent re-prompt) |
| Unknown command | `Unknown command '<command>'. Type 'help' for available commands.` |
| Missing arguments | `Usage: <command> <args>` |

### Business Logic Errors
| Scenario | Message |
|----------|---------|
| Invalid ID format | `Invalid ID. Please enter a number.` |
| Task not found | `✗ Task #<id> not found` |
| Empty title | `Usage: add <title>` or `Usage: update <id> <new_title>` |

### Success Messages
| Action | Format |
|--------|--------|
| Add task | `✓ Task #<id> added: "<title>"` |
| Delete task | `✓ Task #<id> deleted` |
| Update task | `✓ Task #<id> updated: "<old_title>" → "<new_title>"` |
| Complete task | `✓ Task #<id> marked as complete: "<title>"` |
| Incomplete task | `✓ Task #<id> marked as incomplete: "<title>"` |

---

## Data Model

### Task Structure
```python
@dataclass
class Task:
    id: int              # Auto-incrementing unique identifier
    title: str           # Task description (trimmed, non-empty)
    is_complete: bool    # Completion status (default: False)
    created_at: datetime # Creation timestamp
```

### TaskManager State
```python
class TaskManager:
    tasks: dict[int, Task]  # task_id → Task mapping
    next_id: int            # Next available ID counter
```

---

## Workflow Examples

### Daily Task Management
```bash
# Morning setup
todo> add Prepare presentation
✓ Task #1 added: "Prepare presentation"

todo> add Email team updates
✓ Task #2 added: "Email team updates"

todo> add Review pull requests
✓ Task #3 added: "Review pull requests"

# Throughout the day
todo> complete 2
✓ Task #2 marked as complete: "Email team updates"

# Evening review
todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [ ]    │ Prepare presentation    │
│  2 │ [x]    │ Email team updates      │
│  3 │ [ ]    │ Review pull requests    │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (1 complete, 2 pending)

# End of day cleanup
todo> delete 2
✓ Task #2 deleted

todo> exit
Goodbye! Your tasks have not been saved.
```

### Project Planning
```bash
todo> add Design database schema
✓ Task #1 added: "Design database schema"

todo> add Implement authentication
✓ Task #2 added: "Implement authentication"

todo> add Write unit tests
✓ Task #3 added: "Write unit tests"

todo> complete 1
✓ Task #1 marked as complete: "Design database schema"

todo> update 3 Write comprehensive unit tests
✓ Task #3 updated: "Write unit tests" → "Write comprehensive unit tests"

todo> list
┌────┬────────┬─────────────────────────┐
│ ID │ Status │ Title                   │
├────┼────────┼─────────────────────────┤
│  1 │ [x]    │ Design database schema  │
│  2 │ [ ]    │ Implement authentication│
│  3 │ [ ]    │ Write comprehensive...  │
└────┴────────┴─────────────────────────┘
Total: 3 tasks (1 complete, 2 pending)
```

---

## Performance Characteristics

### Operation Speed
- **Add**: <1ms
- **Delete**: <1ms
- **Update**: <1ms
- **Complete**: <1ms
- **List**: <1ms (for up to 10,000 tasks)

### Memory Usage
- **Per task**: ~100 bytes
- **10,000 tasks**: ~1 MB
- **Growth**: Linear O(n)

### Scalability
- **Practical limit**: ~100,000 tasks (system memory dependent)
- **Recommended limit**: ~10,000 tasks for optimal UX
- **No hard limits**: Only system memory constraints

---

## System Requirements

### Minimum Requirements
- **Python**: 3.13+
- **Memory**: 10 MB for typical usage
- **Disk**: None (in-memory only)
- **OS**: Linux, macOS, Windows

### Installation
```bash
# Using uv (recommended)
cd backend
uv sync
uv run python -m backend.main

# Using python directly
cd backend
python -m backend.main
```

---

## Troubleshooting

### Application won't start
```bash
# Check Python version
python --version  # Should be 3.13+

# Check if in correct directory
# Should be in project root or backend/

# Try explicit module run
python -m backend.main
```

### Commands not recognized
```bash
# Check available commands
help

# Commands are case-sensitive
# Correct: add, delete, update, list, complete, help, exit
# Incorrect: ADD, Delete, UPDATE, LIST, etc.
```

### Data persistence
**Note**: This is an in-memory application. All data is lost when you exit.
- No data files are created
- No database is used
- Session is not saved

For persistent storage, this will be added in Phase II (web app).

---

## Version History

### v1.0.0 (2025-12-28)
- Initial release
- All core features implemented:
  - Add, delete, update, list, complete commands
  - Input validation and error handling
  - Formatted table output
  - Summary statistics
  - Welcome/goodbye messages
- 100% test coverage
- Constitution v1.1.0 compliant

---

## Support

For issues or questions:
- Check `help` command for available commands
- Review `specs/001-cli-todo/spec.md` for detailed requirements
- Consult `docs/architecture.md` for implementation details
- Run tests: `uv run pytest` from backend directory
