"""Task service layer - business logic for task operations"""
from sqlmodel import Session, select, and_
from datetime import datetime
from uuid import UUID
from typing import Optional, List

from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate


class TaskService:
    """Service class for task operations"""

    def __init__(self, session: Session):
        """Initialize with database session"""
        self.session = session

    def get_user_tasks(
        self,
        user_id: str,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "createdAt",
        sort_order: str = "desc"
    ) -> List[Task]:
        """
        Get all tasks for user with filtering and sorting.

        Args:
            user_id: User ID to filter tasks
            status: Filter by status (pending/completed)
            priority: Filter by priority (low/medium/high)
            category: Filter by category (work/personal/home/other)
            search: Search in title and description
            sort_by: Field to sort by
            sort_order: Sort direction (asc/desc)

        Returns:
            List[Task]: List of tasks matching criteria
        """
        query = select(Task).where(Task.user_id == user_id)

        # Apply filters
        conditions = []
        if status:
            conditions.append(Task.status == status)
        if priority:
            conditions.append(Task.priority == priority)
        if category:
            conditions.append(Task.category == category)
        if search:
            conditions.append(
                Task.title.contains(search) | Task.description.contains(search)
            )

        if conditions:
            query = query.where(and_(*conditions))

        # Apply sorting
        sort_column = getattr(Task, sort_by, Task.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        return list(self.session.exec(query).all())

    def get_task(self, user_id: str, task_id: UUID) -> Optional[Task]:
        """
        Get single task by ID (scoped to user).

        Args:
            user_id: User ID for scoping
            task_id: Task ID to retrieve

        Returns:
            Optional[Task]: Task if found, None otherwise
        """
        return self.session.get(Task, task_id)

    def create_task(self, user_id: str, task_data: TaskCreate) -> Task:
        """
        Create new task.

        Args:
            user_id: Owner user ID
            task_data: Task creation data

        Returns:
            Task: Created task
        """
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            category=task_data.category,
            due_date=task_data.dueDate,
            status="pending",
            completed=False
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def update_task(self, user_id: str, task_id: UUID, task_data: TaskUpdate) -> Optional[Task]:
        """
        Update existing task.

        Args:
            user_id: User ID for scoping
            task_id: Task ID to update
            task_data: Update data

        Returns:
            Optional[Task]: Updated task if found, None otherwise
        """
        task = self.get_task(user_id, task_id)
        if not task:
            return None

        # Map schema field names to model field names
        field_mapping = {
            'dueDate': 'due_date',
        }

        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            # Map camelCase to snake_case if needed
            model_field = field_mapping.get(field, field)
            setattr(task, model_field, value)

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)
        return task

    def delete_task(self, user_id: str, task_id: UUID) -> bool:
        """
        Delete task.

        Args:
            user_id: User ID for scoping
            task_id: Task ID to delete

        Returns:
            bool: True if deleted, False if not found
        """
        task = self.get_task(user_id, task_id)
        if not task:
            return False

        self.session.delete(task)
        self.session.commit()
        return True

    def toggle_complete(self, user_id: str, task_id: UUID) -> Optional[Task]:
        """
        Toggle task completion status.

        Args:
            user_id: User ID for scoping
            task_id: Task ID to toggle

        Returns:
            Optional[Task]: Updated task if found, None otherwise
        """
        task = self.get_task(user_id, task_id)
        if not task:
            return None

        if task.status == "pending":
            task.status = "completed"
            task.completed = True
        else:
            task.status = "pending"
            task.completed = False

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_stats(self, user_id: str) -> dict:
        """
        Get task statistics for user.

        Args:
            user_id: User ID to get stats for

        Returns:
            dict: Statistics with total, pending, completed counts
        """
        query = select(Task).where(Task.user_id == user_id)
        tasks = list(self.session.exec(query).all())

        total = len(tasks)
        pending = sum(1 for t in tasks if t.status == "pending")
        completed = sum(1 for t in tasks if t.status == "completed")

        return {
            "total": total,
            "pending": pending,
            "completed": completed
        }