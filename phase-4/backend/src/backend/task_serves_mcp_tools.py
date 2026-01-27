"""MCP server for task operations using FastMCP"""
# Load environment first
from pathlib import Path
env_path = Path(__file__).parent.parent.parent / '.env'
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

from mcp.server.fastmcp import FastMCP
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID
import os
import sys

# Add src to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(current_dir, '..', '..', 'src')
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from backend.database import get_session
from backend.services.task_service import TaskService
from backend.schemas.task import TaskUpdate, TaskCreate
from backend.models.task import Task

# Create MCP server
mcp = FastMCP("TaskService")


def get_service():
    """Get task service instance"""
    session = next(get_session())
    return TaskService(session)

@mcp.tool()
def create_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Literal["low", "medium", "high"] = "medium",
    category: Literal["work", "personal", "home", "other"] = "work",
    due_date: Optional[str] = None
) -> dict:
    """
    Create a new task with user isolation.

    Args:
        user_id: User ID from JWT (required for isolation)
        title: Task title (1-255 characters)
        description: Optional task description
        priority: Task priority level (low/medium/high)
        category: Task category (work/personal/home/other)
        due_date: Optional due date in ISO format

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    try:
        service = get_service()

        # Parse due_date if provided
        due_date_dt = None
        if due_date:
            due_date_dt = datetime.fromisoformat(due_date.replace('Z', '+00:00'))

        # Create TaskCreate object
        task_data = TaskCreate(
            title=title,
            description=description,
            priority=priority,
            category=category,
            dueDate=due_date_dt  # ← Fixed: use camelCase dueDate
        )

        # Create task using existing service
        task = service.create_task(user_id=user_id, task_data=task_data)

        return {"success": True, "data": task.model_dump()}
    except Exception as e:
        return {"success": False, "error": str(e)}

@mcp.tool()
def list_tasks(
    user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "createdAt",
    sort_order: str = "desc"
) -> dict:
    """
    List all tasks for user with filtering.

    Args:
        user_id: User ID from JWT (required for isolation)
        status: Filter by completion status (pending/completed)
        priority: Filter by priority (low/medium/high)
        category: Filter by category (work/personal/home/other)
        search: Search in title and description
        sort_by: Field to sort by (createdAt/updatedAt/dueDate/priority/title)
        sort_order: Sort direction (asc/desc)

    Returns:
        dict: {"success": True, "data": [...]} or {"success": False, "error": "..."}
    """
    try:
        service = get_service()
        tasks = service.get_user_tasks(
            user_id=user_id,
            status=status,
            priority=priority,
            category=category,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )

        return {"success": True, "data": [task.model_dump() for task in tasks]}
    except Exception as e:
        return {"success": False, "error": str(e)}

@mcp.tool()
def get_task(user_id: str, task_id: str) -> dict:
    """
    Get a specific task by ID.

    Args:
        user_id: User ID from JWT (required for isolation)
        task_id: UUID of the task to retrieve

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    try:
        # Validate user ownership
        session = next(get_session())
        task = session.get(Task, UUID(task_id))
        if not task or task.user_id != user_id:
            return {"success": False, "error": "Access denied to this task"}

        return {"success": True, "data": task.model_dump()}
    except Exception as e:
        return {"success": False, "error": str(e)}

@mcp.tool()
def update_task(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[Literal["low", "medium", "high"]] = None,
    category: Optional[Literal["work", "personal", "home", "other"]] = None,
    due_date: Optional[str] = None
) -> dict:
    """
    Update an existing task.

    Args:
        user_id: User ID from JWT (required for isolation)
        task_id: UUID of the task to update
        title: New title (optional)
        description: New description (optional)
        priority: New priority (optional)
        category: New category (optional)
        due_date: New due date in ISO format (optional)

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    try:
        # Validate user ownership first
        session = next(get_session())
        task = session.get(Task, UUID(task_id))
        if not task or task.user_id != user_id:
            return {"success": False, "error": "Access denied to this task"}

        service = get_service()

        # Parse due_date if provided
        due_date_dt = None
        if due_date:
            due_date_dt = datetime.fromisoformat(due_date.replace('Z', '+00:00'))

        update_data = TaskUpdate(
            title=title,
            description=description,
            priority=priority,
            category=category,
            dueDate=due_date_dt  # ← Fixed: use camelCase dueDate
        )

        task = service.update_task(user_id, UUID(task_id), update_data)

        if not task:
            return {"success": False, "error": "Task not found"}

        return {"success": True, "data": task.model_dump()}
    except Exception as e:
        return {"success": False, "error": str(e)}

@mcp.tool()
def delete_task(user_id: str, task_id: str) -> dict:
    """
    Delete a task.

    Args:
        user_id: User ID from JWT (required for isolation)
        task_id: UUID of the task to delete

    Returns:
        dict: {"success": True, "data": "Task deleted successfully"} or {"success": False, "error": "..."}
    """
    try:
        # Validate user ownership first
        session = next(get_session())
        task = session.get(Task, UUID(task_id))
        if not task or task.user_id != user_id:
            return {"success": False, "error": "Access denied to this task"}

        service = get_service()
        deleted = service.delete_task(user_id, UUID(task_id))

        if not deleted:
            return {"success": False, "error": "Task not found"}

        return {"success": True, "data": "Task deleted successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@mcp.tool()
def toggle_complete(user_id: str, task_id: str) -> dict:
    """
    Toggle task completion status.

    Args:
        user_id: User ID from JWT (required for isolation)
        task_id: UUID of the task to toggle

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    try:
        # Validate user ownership first
        session = next(get_session())
        task = session.get(Task, UUID(task_id))
        if not task or task.user_id != user_id:
            return {"success": False, "error": "Access denied to this task"}

        service = get_service()
        task = service.toggle_complete(user_id, UUID(task_id))

        if not task:
            return {"success": False, "error": "Task not found"}

        return {"success": True, "data": task.model_dump()}
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
def get_stats(user_id: str) -> dict:
    """
    Get task statistics for user.

    Args:
        user_id: User ID from JWT (required for isolation)

    Returns:
        dict: {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    try:
        service = get_service()
        stats = service.get_stats(user_id)

        return {"success": True, "data": stats}
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    mcp.run(transport="stdio")