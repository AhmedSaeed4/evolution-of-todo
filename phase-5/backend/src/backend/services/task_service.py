"""Task service layer - business logic for task operations"""
from sqlmodel import Session, select, and_
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from dateutil.relativedelta import relativedelta

from ..models.task import Task
from ..schemas.task import TaskCreate, TaskUpdate
from .audit_service import AuditService
from .notification_service import NotificationService


class TaskService:
    """Service class for task operations"""

    def __init__(self, session: Session):
        """Initialize with database session"""
        self.session = session
        self.audit_service = AuditService(session)
        self.notification_service = NotificationService(session)

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
        # Map schema field names to model field names
        task = Task(
            user_id=user_id,
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority,
            category=task_data.category,
            due_date=task_data.dueDate,
            # NEW: Recurring task fields
            recurring_rule=task_data.recurringRule,
            recurring_end_date=task_data.recurringEndDate,
            # NEW: Reminder field
            reminder_at=task_data.reminderAt,
            # NEW: Tags field
            tags=task_data.tags,
            status="pending",
            completed=False
        )
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)

        # Audit logging
        self.audit_service.log_event(
            event_type="created",
            entity_type="task",
            entity_id=task.id,
            user_id=user_id,
            data={
                "title": task.title,
                "priority": task.priority,
                "category": task.category,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "recurring_rule": task.recurring_rule,
                "reminder_at": task.reminder_at.isoformat() if task.reminder_at else None,
                "tags": task.tags
            }
        )
        self.session.commit()

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

        # Track changes for audit log
        changes = {}

        # Map schema field names to model field names
        field_mapping = {
            'dueDate': 'due_date',
            'recurringRule': 'recurring_rule',
            'recurringEndDate': 'recurring_end_date',
            'reminderAt': 'reminder_at'
        }

        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            # Map camelCase to snake_case if needed
            model_field = field_mapping.get(field, field)
            old_value = getattr(task, model_field)
            setattr(task, model_field, value)

            # Track change for audit log
            if old_value != value:
                changes[field] = {"old": old_value, "new": value}

            # NEW: Reset reminder_sent if reminder_at is being changed
            if model_field == 'reminder_at' and old_value != value:
                task.reminder_sent = False

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)

        # Audit logging
        if changes:
            self.audit_service.log_event(
                event_type="updated",
                entity_type="task",
                entity_id=task.id,
                user_id=user_id,
                data={
                    "title": task.title,
                    "changes": changes
                }
            )
            self.session.commit()

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

        # Audit logging before deletion
        self.audit_service.log_event(
            event_type="deleted",
            entity_type="task",
            entity_id=task.id,
            user_id=user_id,
            data={
                "title": task.title,
                "priority": task.priority,
                "category": task.category,
                "completed": task.completed
            }
        )
        self.session.commit()

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

        was_completed = task.completed

        if task.status == "pending":
            task.status = "completed"
            task.completed = True
        else:
            task.status = "pending"
            task.completed = False

        task.updated_at = datetime.utcnow()
        self.session.commit()
        self.session.refresh(task)

        # Audit logging
        if not was_completed and task.completed:
            # Task was just completed
            audit_data = {
                "title": task.title,
                "completed": True
            }

            # Check if this is a recurring task completion
            if task.recurring_rule:
                audit_data["recurring_rule"] = task.recurring_rule
                # Create next instance
                next_task = self._create_next_recurring_instance(task)
                if next_task:
                    audit_data["next_instance_created"] = str(next_task.id)

            self.audit_service.log_event(
                event_type="completed",
                entity_type="task",
                entity_id=task.id,
                user_id=user_id,
                data=audit_data
            )
            self.session.commit()

        return task

    def _create_next_recurring_instance(self, completed_task: Task) -> Optional[Task]:
        """
        Create the next instance of a recurring task.

        Args:
            completed_task: The task that was just completed

        Returns:
            Optional[Task]: The newly created task instance, or None if no more instances
        """

        # Helper to strip timezone info for comparison
        def to_naive(dt):
            """Remove timezone info if present"""
            if dt is None:
                return None
            return dt.replace(tzinfo=None) if dt.tzinfo else dt

        # Check if we should stop recurring
        if completed_task.recurring_end_date:
            # Use the due_date if available, otherwise use completed time
            base_date = completed_task.due_date or datetime.utcnow()
            # Strip timezone info for comparison
            base_date_naive = to_naive(base_date)
            end_date_naive = to_naive(completed_task.recurring_end_date)

            if base_date_naive and end_date_naive and base_date_naive >= end_date_naive:
                # End date has been reached, don't create more instances
                return None

        # Calculate next due date
        base_date = completed_task.due_date or datetime.utcnow()
        next_due_date = self._calculate_next_due_date(base_date, completed_task.recurring_rule)

        # Check if next due date is after end date
        if completed_task.recurring_end_date:
            next_due_naive = to_naive(next_due_date)
            end_date_naive = to_naive(completed_task.recurring_end_date)
            if next_due_naive and end_date_naive and next_due_naive > end_date_naive:
                return None

        # Calculate adjusted reminder time for the new instance
        next_reminder_at = None
        if completed_task.reminder_at and completed_task.due_date:
            # Calculate the time difference between due date and reminder
            # Strip timezone info for consistent subtraction
            due_date_naive = to_naive(completed_task.due_date)
            reminder_naive = to_naive(completed_task.reminder_at)
            time_diff = due_date_naive - reminder_naive
            # Apply the same offset to the new due date (also strip timezone)
            next_due_date_naive = to_naive(next_due_date)
            next_reminder_at = next_due_date_naive - time_diff

        # Create new instance
        next_task = Task(
            user_id=completed_task.user_id,
            title=completed_task.title,
            description=completed_task.description,
            priority=completed_task.priority,
            category=completed_task.category,
            due_date=next_due_date,
            recurring_rule=completed_task.recurring_rule,
            recurring_end_date=completed_task.recurring_end_date,
            parent_task_id=completed_task.id if not completed_task.parent_task_id else completed_task.parent_task_id,
            reminder_at=next_reminder_at,  # Adjusted reminder for new due date
            reminder_sent=False,  # Reset reminder sent
            tags=completed_task.tags,  # Copy tags
            status="pending",
            completed=False
        )

        self.session.add(next_task)
        self.session.commit()
        self.session.refresh(next_task)

        # Audit log for the new instance
        self.audit_service.log_event(
            event_type="created",
            entity_type="task",
            entity_id=next_task.id,
            user_id=completed_task.user_id,
            data={
                "title": next_task.title,
                "priority": next_task.priority,
                "category": next_task.category,
                "due_date": next_task.due_date.isoformat() if next_task.due_date else None,
                "recurring_rule": next_task.recurring_rule,
                "parent_task_id": str(completed_task.id),
                "auto_created": True
            }
        )
        self.session.commit()

        import sys
        print(f"DEBUG: New recurring task created - id={next_task.id}, title={next_task.title}, due_date={next_task.due_date}, status={next_task.status}", file=sys.stderr)
        return next_task

    def _calculate_next_due_date(self, base_date: datetime, recurring_rule: str) -> datetime:
        """
        Calculate the next due date based on recurring rule.

        Args:
            base_date: The base date to calculate from
            recurring_rule: One of 'daily', 'weekly', 'monthly', 'yearly'

        Returns:
            datetime: The next due date

        Uses dateutil.relativedelta for proper handling of month/year edge cases
        (e.g., Jan 31 -> Feb 28/29, Feb 29 -> Feb 28 in non-leap years)
        """
        if recurring_rule == "daily":
            return base_date + relativedelta(days=1)
        elif recurring_rule == "weekly":
            return base_date + relativedelta(weeks=1)
        elif recurring_rule == "monthly":
            return base_date + relativedelta(months=1)
        elif recurring_rule == "yearly":
            return base_date + relativedelta(years=1)
        else:
            # Default to daily if invalid rule
            return base_date + relativedelta(days=1)

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