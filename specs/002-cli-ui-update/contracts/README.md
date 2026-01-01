# Contracts: Menu-Driven CLI Interface

**Feature**: 002-cli-ui-update
**Date**: 2025-12-28
**Phase**: 1 (Design)

## Overview

This feature is a CLI-only presentation layer change. API contracts will be defined in Phase II when the web interface is added.

## Current Phase: CLI Interface

### User Interaction Contract (CLI)

**Interface Type**: Console-based menu system

**Input Methods**:
1. Menu selection (1-7)
2. Task title entry (string)
3. Task ID entry (positive integer)
4. Confirmation (Enter key)

**Output Methods**:
1. Welcome screen (ASCII art)
2. Menu display (numbered options)
3. Task lists (formatted table)
4. Success/error messages
5. Pause prompts

### Command Handler Interface

All handlers follow this pattern:

```python
def handler_name(args: list[str], manager: TaskManager) -> None:
    """
    Process command and print output to console.

    Args:
        args: Command arguments
        manager: TaskManager instance

    Returns:
        None (prints to console)
    """
    # Implementation
```

**Handler Signatures**:
- `add_task_handler([title], manager)`
- `list_tasks_handler([], manager)`
- `complete_task_handler([id], manager)`
- `update_task_handler([id, new_title], manager)`
- `delete_task_handler([id], manager)`
- `help_handler([], manager)`
- `exit_handler([], manager)`

## Future Phase: MCP Tools (Phase II)

When web interface is added, these will become MCP tools:

### MCP Tool: add_task
```json
{
  "name": "add_task",
  "description": "Add a new task to the todo list",
  "input_schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Task description",
        "minLength": 1
      }
    },
    "required": ["title"]
  }
}
```

### MCP Tool: list_tasks
```json
{
  "name": "list_tasks",
  "description": "List all tasks with their completion status",
  "input_schema": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

### MCP Tool: complete_task
```json
{
  "name": "complete_task",
  "description": "Mark a task as complete",
  "input_schema": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "integer",
        "description": "ID of task to complete",
        "minimum": 1
      }
    },
    "required": ["task_id"]
  }
}
```

### MCP Tool: update_task
```json
{
  "name": "update_task",
  "description": "Update task title",
  "input_schema": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "integer",
        "description": "ID of task to update",
        "minimum": 1
      },
      "new_title": {
        "type": "string",
        "description": "New task title",
        "minLength": 1
      }
    },
    "required": ["task_id", "new_title"]
  }
}
```

### MCP Tool: delete_task
```json
{
  "name": "delete_task",
  "description": "Delete a task",
  "input_schema": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "integer",
        "description": "ID of task to delete",
        "minimum": 1
      }
    },
    "required": ["task_id"]
  }
}
```

## Future Phase: REST API (Phase II)

### Endpoints

#### POST /tasks
```yaml
Request:
  Body:
    title: string (required, min 1 char)
Response:
  201 Created:
    {
      "id": 1,
      "title": "Buy groceries",
      "is_complete": false
    }
  400 Bad Request: { "error": "Title cannot be empty" }
```

#### GET /tasks
```yaml
Response:
  200 OK:
    [
      { "id": 1, "title": "Buy groceries", "is_complete": false },
      { "id": 2, "title": "Walk dog", "is_complete": true }
    ]
```

#### PATCH /tasks/{id}/complete
```yaml
Response:
  200 OK: { "status": "completed", "task_id": 1 }
  404 Not Found: { "error": "Task #1 not found" }
```

#### PATCH /tasks/{id}
```yaml
Request:
  Body:
    title: string (required, min 1 char)
Response:
  200 OK: { "status": "updated", "task_id": 1 }
  404 Not Found: { "error": "Task #1 not found" }
```

#### DELETE /tasks/{id}
```yaml
Response:
  200 OK: { "status": "deleted", "task_id": 1 }
  404 Not Found: { "error": "Task #1 not found" }
```

#### GET /help
```yaml
Response:
  200 OK:
    {
      "commands": [
        { "option": 1, "name": "Add a new task" },
        { "option": 2, "name": "List all tasks" },
        ...
      ]
    }
```

## Error Taxonomy

### CLI Errors
| Error Type | Message | User Action |
|------------|---------|-------------|
| Invalid menu choice | "✗ Please enter a number between 1 and 7" | Retry with valid input |
| Empty title | "✗ Title cannot be empty" | Enter non-empty title |
| Invalid ID | "✗ Please enter a valid number" | Enter positive integer |
| Task not found | "✗ Task #999 not found" | Check task ID |
| Operation cancelled | "✗ Operation cancelled" | Continue with menu |

### Future API Errors
| Status Code | Error | Meaning |
|-------------|-------|---------|
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Task doesn't exist |
| 422 | Unprocessable | Validation failed |

## Validation Rules

### Task Title
- **Type**: String
- **Constraints**: Non-empty after strip()
- **Max Length**: Not specified (reasonable limit ~200 chars)
- **Characters**: All Unicode allowed

### Task ID
- **Type**: Integer
- **Constraints**: Positive (≥1)
- **Range**: 1 to max int

### Menu Choice
- **Type**: Integer
- **Constraints**: 1-7 inclusive

## State Management

### Current Phase: In-Memory
- Storage: Python dictionary
- Persistence: None (session only)
- Scope: Single process

### Future Phase: Database
- Storage: PostgreSQL (Neon)
- Persistence: Permanent
- Scope: Multi-user

## Security Considerations

### Current Phase: CLI
- **Authentication**: None (single user)
- **Authorization**: None (full access)
- **Input Validation**: Yes (menu layer)
- **Secrets**: None

### Future Phase: Web/API
- **Authentication**: JWT tokens
- **Authorization**: User-scoped queries
- **Input Validation**: Pydantic schemas
- **Secrets**: Environment variables / K8s secrets

## Testing Contracts

### Unit Test Contract
All menu functions must:
- Accept mocked input
- Return expected values
- Handle edge cases
- Print appropriate messages

### Integration Test Contract
All workflows must:
- Start with empty state
- Execute complete operations
- Verify state changes
- Clean up after test

## Conclusion

**Current Status**: CLI-only contracts defined

**Future Work**:
- Phase II: Implement MCP tools and REST API
- Phase II: Add authentication layer
- Phase II: Implement database persistence

**Ready for**: Implementation of CLI interface