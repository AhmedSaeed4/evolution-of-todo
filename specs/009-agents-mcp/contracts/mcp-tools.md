# MCP Tools Contract

**Feature**: 009-agents-mcp
**Date**: 2026-01-13
**Purpose**: Define MCP tool signatures and behavior for agent integration

---

## Overview

This document defines the MCP (Model Context Protocol) tools that enable AI agents to perform CRUD operations on tasks. All tools follow the standardized response format and enforce user isolation.

---

## Tool Response Format

All MCP tools return structured responses:

```python
# Success Response
{
    "success": True,
    "data": <result>
}

# Error Response
{
    "success": False,
    "error": "Descriptive error message"
}
```

---

## Task Management Tools

### 1. create_task

**Purpose**: Create a new task for the authenticated user

**Signature**:
```python
@mcp.tool()
def create_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Literal["low", "medium", "high"] = "medium",
    category: Literal["work", "personal", "home", "other"] = "work",
    due_date: Optional[datetime] = None
) -> dict:
    """Create a new task with user isolation.

    Args:
        user_id: User ID from JWT token (required for isolation)
        title: Task title (1-255 characters)
        description: Optional task description (max 1000 chars)
        priority: Task priority level (low/medium/high)
        category: Task category (work/personal/home/other)
        due_date: Optional due date (ISO 8601 format)

    Returns:
        Structured response with created task or error

    Example:
        create_task("user_123", "Buy groceries", "Milk, bread, eggs", "high", "home")
    """
```

**Validation Rules**:
- `user_id`: Required, must match authenticated user
- `title`: Required, 1-255 chars, non-empty
- `description`: Optional, max 1000 chars
- `priority`: Must be one of ["low", "medium", "high"]
- `category`: Must be one of ["work", "personal", "home", "other"]
- `due_date`: Optional datetime, must be valid ISO 8601

**Success Response**:
```json
{
    "success": true,
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Buy groceries",
        "description": "Milk, bread, eggs",
        "priority": "high",
        "category": "home",
        "status": "pending",
        "completed": false,
        "dueDate": "2026-01-15T10:00:00Z",
        "createdAt": "2026-01-13T10:00:00Z",
        "updatedAt": "2026-01-13T10:00:00Z",
        "userId": "user_123"
    }
}
```

**Error Responses**:
```json
{"success": false, "error": "Title cannot be empty"}
{"success": false, "error": "Invalid priority: must be low/medium/high"}
{"success": false, "error": "User authentication required"}
```

---

### 2. list_tasks

**Purpose**: Retrieve all tasks for a user with optional filtering

**Signature**:
```python
@mcp.tool()
def list_tasks(
    user_id: str,
    status: Optional[Literal["pending", "completed"]] = None,
    priority: Optional[Literal["low", "medium", "high"]] = None,
    category: Optional[Literal["work", "personal", "home", "other"]] = None,
    search: Optional[str] = None,
    sort_by: Literal["dueDate", "priority", "title", "createdAt"] = "createdAt",
    sort_order: Literal["asc", "desc"] = "desc"
) -> dict:
    """List all tasks for user with filtering and sorting.

    Args:
        user_id: User ID from JWT token (required for isolation)
        status: Filter by completion status
        priority: Filter by priority level
        category: Filter by category
        search: Search in title and description
        sort_by: Field to sort by
        sort_order: Sort direction

    Returns:
        Structured response with list of tasks or error

    Example:
        list_tasks("user_123", status="pending", priority="high", sort_by="dueDate")
    """
```

**Success Response**:
```json
{
    "success": true,
    "data": [
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "title": "Buy groceries",
            "priority": "high",
            "category": "home",
            "status": "pending",
            "completed": false,
            "dueDate": "2026-01-15T10:00:00Z",
            "createdAt": "2026-01-13T10:00:00Z",
            "updatedAt": "2026-01-13T10:00:00Z",
            "userId": "user_123"
        },
        {
            "id": "456e7890-e89b-12d3-a456-426614174000",
            "title": "Finish report",
            "priority": "medium",
            "category": "work",
            "status": "pending",
            "completed": false,
            "dueDate": "2026-01-14T17:00:00Z",
            "createdAt": "2026-01-12T14:30:00Z",
            "updatedAt": "2026-01-12T14:30:00Z",
            "userId": "user_123"
        }
    ]
}
```

**Error Responses**:
```json
{"success": false, "error": "User authentication required"}
{"success": false, "error": "Invalid sort_by field"}
```

---

### 3. get_task

**Purpose**: Retrieve a single task by ID

**Signature**:
```python
@mcp.tool()
def get_task(
    user_id: str,
    task_id: str
) -> dict:
    """Get a specific task by ID.

    Args:
        user_id: User ID from JWT token (required for isolation)
        task_id: UUID of the task to retrieve

    Returns:
        Structured response with task or error

    Example:
        get_task("user_123", "123e4567-e89b-12d3-a456-426614174000")
    """
```

**Success Response**:
```json
{
    "success": true,
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Buy groceries",
        "description": "Milk, bread, eggs",
        "priority": "high",
        "category": "home",
        "status": "pending",
        "completed": false,
        "dueDate": "2026-01-15T10:00:00Z",
        "createdAt": "2026-01-13T10:00:00Z",
        "updatedAt": "2026-01-13T10:00:00Z",
        "userId": "user_123"
    }
}
```

**Error Responses**:
```json
{"success": false, "error": "Task not found"}
{"success": false, "error": "Access denied to this task"}
{"success": false, "error": "Invalid task ID format"}
```

---

### 4. update_task

**Purpose**: Update an existing task

**Signature**:
```python
@mcp.tool()
def update_task(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[Literal["low", "medium", "high"]] = None,
    category: Optional[Literal["work", "personal", "home", "other"]] = None,
    due_date: Optional[datetime] = None
) -> dict:
    """Update an existing task.

    Args:
        user_id: User ID from JWT token (required for isolation)
        task_id: UUID of the task to update
        title: New title (optional)
        description: New description (optional)
        priority: New priority (optional)
        category: New category (optional)
        due_date: New due date (optional)

    Returns:
        Structured response with updated task or error

    Example:
        update_task("user_123", "123e4567...", title="Buy milk and bread")
    """
```

**Success Response**:
```json
{
    "success": true,
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Buy milk and bread",
        "description": "Milk, bread, eggs",
        "priority": "high",
        "category": "home",
        "status": "pending",
        "completed": false,
        "dueDate": "2026-01-15T10:00:00Z",
        "createdAt": "2026-01-13T10:00:00Z",
        "updatedAt": "2026-01-13T10:05:00Z",
        "userId": "user_123"
    }
}
```

**Error Responses**:
```json
{"success": false, "error": "Task not found"}
{"success": false, "error": "Access denied to this task"}
{"success": false, "error": "Title cannot be empty"}
```

---

### 5. delete_task

**Purpose**: Delete a task

**Signature**:
```python
@mcp.tool()
def delete_task(
    user_id: str,
    task_id: str
) -> dict:
    """Delete a task.

    Args:
        user_id: User ID from JWT token (required for isolation)
        task_id: UUID of the task to delete

    Returns:
        Structured response indicating success or error

    Example:
        delete_task("user_123", "123e4567-e89b-12d3-a456-426614174000")
    """
```

**Success Response**:
```json
{
    "success": true,
    "data": "Task deleted successfully"
}
```

**Error Responses**:
```json
{"success": false, "error": "Task not found"}
{"success": false, "error": "Access denied to this task"}
{"success": false, "error": "Invalid task ID format"}
```

---

### 6. toggle_complete

**Purpose**: Toggle task completion status

**Signature**:
```python
@mcp.tool()
def toggle_complete(
    user_id: str,
    task_id: str
) -> dict:
    """Toggle task completion status.

    Args:
        user_id: User ID from JWT token (required for isolation)
        task_id: UUID of the task to toggle

    Returns:
        Structured response with updated task or error

    Example:
        toggle_complete("user_123", "123e4567-e89b-12d3-a456-426614174000")
    """
```

**Success Response**:
```json
{
    "success": true,
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Buy groceries",
        "priority": "high",
        "category": "home",
        "status": "completed",
        "completed": true,
        "dueDate": "2026-01-15T10:00:00Z",
        "createdAt": "2026-01-13T10:00:00Z",
        "updatedAt": "2026-01-13T10:10:00Z",
        "userId": "user_123"
    }
}
```

**Error Responses**:
```json
{"success": false, "error": "Task not found"}
{"success": false, "error": "Access denied to this task"}
```

---

### 7. get_stats

**Purpose**: Get task statistics for user

**Signature**:
```python
@mcp.tool()
def get_stats(
    user_id: str
) -> dict:
    """Get task statistics for user.

    Args:
        user_id: User ID from JWT token (required for isolation)

    Returns:
        Structured response with statistics or error

    Example:
        get_stats("user_123")
    """
```

**Success Response**:
```json
{
    "success": true,
    "data": {
        "total": 5,
        "pending": 3,
        "completed": 2
    }
}
```

**Error Responses**:
```json
{"success": false, "error": "User authentication required"}
```

---

## Security & Isolation

### User Isolation Enforcement
All tools MUST enforce user isolation at the tool level:

```python
# In every tool implementation
if not user_id:
    return {"success": False, "error": "User authentication required"}

# Validate user owns the resource
task = session.get(Task, task_id)
if not task or task.user_id != user_id:
    return {"success": False, "error": "Access denied to this task"}
```

### Input Validation
All parameters validated using Pydantic schemas before business logic:

```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime

class TaskCreateParams(BaseModel):
    user_id: str
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Literal["low", "medium", "high"] = "medium"
    category: Literal["work", "personal", "home", "other"] = "work"
    due_date: Optional[datetime] = None

    @field_validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
```

---

## Error Taxonomy

### Client Errors (4xx equivalent)
- `User authentication required` - Missing user_id parameter
- `Access denied to this task` - User doesn't own the resource
- `Invalid task ID format` - Malformed UUID
- `Title cannot be empty` - Validation failure
- `Invalid priority: must be low/medium/high` - Enum validation
- `Task not found` - Resource doesn't exist

### Server Errors (5xx equivalent)
- `Database connection failed` - Infrastructure issue
- `Internal processing error` - Unexpected exception
- `MCP server unavailable` - Tool system failure

---

## Tool Integration Pattern

### Agent → Tool Call Flow
```python
# In agent logic
async def handle_task_creation(user_id: str, message: str):
    # Parse message for task details
    task_details = parse_task_from_message(message)

    # Call MCP tool
    result = await mcp_server.call_tool("create_task", {
        "user_id": user_id,
        "title": task_details.title,
        "priority": task_details.priority,
        "category": task_details.category
    })

    if result["success"]:
        return f"Task '{result['data']['title']}' created successfully!"
    else:
        return f"Error: {result['error']}"
```

### MCP Server → Service Layer
```python
# In MCP tools file
@mcp.tool()
def create_task(**params) -> dict:
    try:
        # Validate input
        validated = TaskCreateParams(**params)

        # Use existing service layer
        service = TaskService(session)
        task = service.create_task(validated.user_id, validated)

        return {"success": True, "data": task}

    except Exception as e:
        return {"success": False, "error": str(e)}
```

---

## Testing Contract

### Unit Test Examples
```python
def test_create_task_success():
    result = create_task(
        user_id="test_user",
        title="Test Task",
        priority="high",
        category="work"
    )
    assert result["success"] == True
    assert result["data"]["title"] == "Test Task"
    assert result["data"]["userId"] == "test_user"

def test_create_task_user_isolation():
    # Should fail if user_id doesn't match
    result = create_task(
        user_id="wrong_user",
        title="Test Task"
    )
    assert result["success"] == False
    assert "Access denied" in result["error"]
```

### Integration Test Examples
```python
async def test_full_agent_workflow():
    # User sends message to chatbot
    response = await client.post("/api/chat", json={
        "message": "Create task 'Buy milk' with high priority"
    }, headers={"Authorization": "Bearer test_token"})

    assert response.status_code == 200
    data = response.json()
    assert data["agent"] in ["orchestrator", "urdu"]
    assert "Buy milk" in data["response"]
```

---

## Performance Considerations

### Expected Performance
- **Tool execution**: < 500ms p95
- **Database queries**: < 200ms p95
- **Total response time**: < 2s p95

### Optimization Strategies
1. **Database indexes** on user_id, status, priority, category
2. **Connection pooling** via existing infrastructure
3. **Query optimization** with proper WHERE clauses
4. **Result caching** for frequently accessed data

---

## Next Steps

1. **Implement MCP tools file** with all 7 tools
2. **Update main.py** to include MCP server lifecycle
3. **Connect agents** to MCP tools
4. **Test all tools** with user isolation
5. **Validate response format** consistency

This contract provides the foundation for agent-tool integration while maintaining security and consistency.