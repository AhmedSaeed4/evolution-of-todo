# Data Model: In-Memory CLI Todo Application

**Feature**: `001-cli-todo`
**Created**: 2025-12-27
**Constitution**: v1.1.0

## Overview

This document defines the data entities, their attributes, relationships, and validation rules for the in-memory task management system.

## Entities

### 1. Task

Represents a single todo item in the system.

**Type**: Dataclass (immutable core, mutable status)

```python
@dataclass
class Task:
    id: int              # Unique identifier (auto-incremented)
    title: str           # Task description (required, non-empty)
    is_complete: bool    # Completion status (default: False)
    created_at: datetime # Timestamp of creation
```

**Attributes**:
- **id** (`int`): Auto-incrementing unique identifier
  - Starts at 1, increments by 1
  - Never reused during session
  - Used as dictionary key in TaskManager

- **title** (`str`): Task description
  - **Validation**: Must not be empty or whitespace-only
  - **Normalization**: Leading/trailing whitespace trimmed
  - **Constraints**: No maximum length enforced (system memory limits only)

- **is_complete** (`bool`): Completion status
  - **Default**: `False` (incomplete)
  - **Toggle**: Can be flipped to `True` or `False` via `complete` command

- **created_at** (`datetime`): Creation timestamp
  - **Source**: `datetime.now()` at creation time
  - **Purpose**: Audit trail, potential future sorting/filtering
  - **Format**: ISO 8601 compatible

**Validation Rules**:
1. **Title validation**: `title.strip()` must not be empty
2. **ID uniqueness**: Guaranteed by TaskManager's auto-increment
3. **Type safety**: All fields strictly typed

### 2. TaskManager

Manages all tasks and provides business logic operations.

**Type**: Class with state

```python
class TaskManager:
    tasks: dict[int, Task]  # Storage: task_id → Task
    next_id: int            # Counter for next task ID
```

**State**:
- **tasks**: In-memory dictionary mapping task_id → Task object
- **next_id**: Integer counter for auto-incrementing IDs

**Methods**:

#### `add_task(title: str) -> Task`
- **Purpose**: Create new task
- **Validation**: Check title is non-empty
- **Behavior**:
  1. Trim title
  2. Generate ID (next_id)
  3. Create Task with current timestamp
  4. Store in tasks dict
  5. Increment next_id
  6. Return Task
- **Returns**: Created Task object

#### `delete_task(task_id: int) -> bool`
- **Purpose**: Remove task by ID
- **Validation**: Check task exists
- **Behavior**:
  1. Check if task_id in tasks
  2. If yes: remove from dict, return True
  3. If no: return False
- **Returns**: Success status (bool)

#### `update_task(task_id: int, new_title: str) -> Task | None`
- **Purpose**: Modify task title
- **Validation**: Check task exists, new_title non-empty
- **Behavior**:
  1. Check task exists
  2. Validate new_title
  3. Update task.title = new_title.strip()
  4. Return updated Task
- **Returns**: Updated Task or None if not found

#### `list_tasks() -> list[Task]`
- **Purpose**: Get all tasks
- **Behavior**: Return sorted list (by ID ascending)
- **Returns**: List of all Task objects

#### `toggle_complete(task_id: int) -> Task | None`
- **Purpose**: Toggle task completion status
- **Validation**: Check task exists
- **Behavior**:
  1. Check task exists
  2. Flip task.is_complete = not task.is_complete
  3. Return updated Task
- **Returns**: Updated Task or None if not found

#### `get_task(task_id: int) -> Task | None`
- **Purpose**: Retrieve single task
- **Behavior**: Lookup by ID
- **Returns**: Task or None

## Data Flow

### Add Task Flow
```
User Input: "add Buy groceries"
    ↓
Command Parser: extract_command("add Buy groceries")
    ↓
Command Handler: add_task("Buy groceries")
    ↓
TaskManager.add_task("Buy groceries")
    ↓
TaskManager: Create Task(id=1, title="Buy groceries", ...)
    ↓
Store in tasks[1]
    ↓
Return Task → Command Handler → User Output
```

### List Tasks Flow
```
User Input: "list"
    ↓
Command Parser: extract_command("list")
    ↓
Command Handler: list_tasks()
    ↓
TaskManager.list_tasks()
    ↓
Sort tasks by ID → Return list[Task]
    ↓
Format as table → User Output
```

## Validation Layer

### Input Validation (Command Layer)
- **Empty input**: Silent re-prompt
- **Unknown command**: "Unknown command. Type 'help' for available commands."
- **Missing arguments**: "Usage: <command> <args>"

### Business Logic Validation (Manager Layer)
- **Empty title**: Rejected before Task creation
- **Invalid ID format**: Caught in command handler
- **Task not found**: Returns None, handled by command layer

### Data Integrity (Model Layer)
- **Type safety**: Python dataclass ensures correct types
- **Required fields**: All fields mandatory in dataclass
- **Immutability**: Task creation is atomic

## State Management

### Session State
- **Scope**: Single application instance
- **Lifetime**: Application runtime only
- **Storage**: In-memory dictionary
- **Persistence**: None (per spec requirement)

### State Transitions
```
Initial State: tasks = {}, next_id = 1

Add Task: tasks[id] = Task(...), next_id += 1
Delete Task: del tasks[id], next_id unchanged
Update Task: tasks[id].title = new_title
Complete Task: tasks[id].is_complete = not tasks[id].is_complete
List Task: Read-only operation, no state change

Final State: tasks = {} (on exit)
```

## Performance Characteristics

### Memory Usage
- **Per Task**: ~100 bytes (dataclass overhead + string storage)
- **10,000 tasks**: ~1 MB total
- **Growth**: Linear O(n) with task count

### Operation Complexity
- **Add**: O(1) - dictionary insert
- **Delete**: O(1) - dictionary delete
- **Update**: O(1) - dictionary lookup + attribute assignment
- **List**: O(n log n) - sort by ID (n ≤ 10,000, negligible)
- **Complete**: O(1) - dictionary lookup + bool flip

### Constraints
- **Maximum tasks**: Limited by system memory
- **Title length**: Limited by system memory
- **Performance target**: <100ms for all operations (10k tasks)

## Future Extensibility

### Phase II (Web App)
- **Migration**: In-memory → PostgreSQL via SQLModel
- **Entity preservation**: Task model compatible with SQLModel
- **Additions**: User_id field for multi-tenancy

### Phase III (AI Agent)
- **MCP tools**: TaskManager methods exposed as MCP tools
- **Type preservation**: Pydantic models for MCP parameter validation
- **Additions**: Event emission for audit trail

### Phase IV (Microservices)
- **Event sourcing**: Task changes emit events
- **Stateless**: TaskManager remains stateless, state in event store
- **Additions**: Correlation IDs, distributed tracing

## Testing Strategy

### Unit Tests
- **Task model**: Type validation, dataclass behavior
- **TaskManager**: All methods, edge cases, error conditions

### Integration Tests
- **CLI workflows**: End-to-end command sequences
- **Error scenarios**: All error paths validated

### Performance Tests
- **Scale**: 10,000 task operations
- **Memory**: Verify linear growth, no leaks