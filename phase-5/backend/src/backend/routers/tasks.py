"""Task CRUD endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlmodel import Session
from uuid import UUID
from typing import Optional, List

from ..database import get_session
from ..auth.jwt import verify_token, get_user_id_from_token, validate_token_user_match
from ..services.task_service import TaskService
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse, StatsResponse
from ..utils.event_publisher import (
    publish_event,
    publish_task_created,
    publish_task_updated,
    publish_task_completed,
    publish_task_deleted,
)


router = APIRouter(prefix="/api", tags=["tasks"])


async def get_token_from_header(authorization: Optional[str] = Header(None)) -> str:
    """Extract Bearer token from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    return authorization[7:]  # Remove "Bearer " prefix


async def validate_and_get_user(token: str = Depends(get_token_from_header)) -> dict:
    """Validate token and return user payload"""
    return await verify_token(token)


@router.get("/{user_id}/tasks", response_model=List[TaskResponse])
async def list_tasks(
    user_id: str,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("createdAt"),
    sort_order: str = Query("desc")
):
    """List all tasks for user with optional filtering"""
    validate_token_user_match(user_payload, user_id)

    service = TaskService(session)
    tasks = service.get_user_tasks(
        user_id=user_id,
        status=status,
        priority=priority,
        category=category,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return tasks


@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Create new task"""
    validate_token_user_match(user_payload, user_id)

    service = TaskService(session)
    task = service.create_task(user_id, task_data)

    # Publish event to Kafka via Dapr (fire-and-forget)
    await publish_task_created(
        user_id=user_id,
        task_id=str(task.id),
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date.isoformat() if task.due_date else None,
        reminder_at=task.reminder_at.isoformat() if task.reminder_at else None,
        recurring_rule=task.recurring_rule,
        recurring_end_date=None,
        tags=task.tags
    )

    return task


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: UUID,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Get single task by ID"""
    validate_token_user_match(user_payload, user_id)

    service = TaskService(session)
    task = service.get_task(user_id, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: UUID,
    task_data: TaskUpdate,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Update existing task"""
    validate_token_user_match(user_payload, user_id)

    service = TaskService(session)
    task = service.update_task(user_id, task_id, task_data)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish event to Kafka via Dapr (fire-and-forget)
    await publish_event(
        topic="task-updated",
        event_type="task-updated",
        user_id=user_id,
        data={
            "task_id": str(task.id),
            "title": task.title,
            "changes": task_data.model_dump(exclude_unset=True)
        }
    )

    return task


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: UUID,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Delete task"""
    validate_token_user_match(user_payload, user_id)

    service = TaskService(session)
    deleted = service.delete_task(user_id, task_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish event to Kafka via Dapr (fire-and-forget)
    await publish_task_deleted(
        user_id=user_id,
        task_id=str(task_id),
        title=""
    )


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    user_id: str,
    task_id: UUID,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Toggle task completion status"""
    validate_token_user_match(user_payload, user_id)

    service = TaskService(session)

    # Capture state before toggle for event publishing
    task_before = service.get_task(user_id, task_id)
    if not task_before:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    before_state = {
        "id": str(task_before.id),
        "title": task_before.title,
        "description": task_before.description,
        "status": task_before.status,
        "completed": task_before.completed,
        "priority": task_before.priority,
    }

    # Toggle the task
    task = service.toggle_complete(user_id, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Capture state after toggle
    after_state = {
        "id": str(task.id),
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "completed": task.completed,
        "priority": task.priority,
    }

    # Publish task-updated event for BOTH mark and unmark operations
    await publish_task_updated(
        user_id=user_id,
        task_id=str(task.id),
        before=before_state,
        after=after_state,
    )

    # Also publish task-completed event for recurring-service if task was just completed
    if task.completed:
        await publish_task_completed(
            user_id=user_id,
            task_id=str(task.id),
            title=task.title,
            recurring_rule=task.recurring_rule,
            recurring_end_date=None
        )

    return task


@router.get("/{user_id}/stats", response_model=StatsResponse)
async def get_stats(
    user_id: str,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Get task statistics"""
    validate_token_user_match(user_payload, user_id)

    service = TaskService(session)
    stats = service.get_stats(user_id)
    return stats