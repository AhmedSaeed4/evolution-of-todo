# TaskManager class with business logic
# Task: T022-T027 - Complete implementation per data-model.md

from datetime import datetime
from backend.models import Task


class TaskManager:
    """Manages all tasks and provides business logic operations."""

    def __init__(self):
        """Initialize TaskManager with empty tasks dictionary and ID counter."""
        self.tasks = {}  # task_id -> Task
        self.next_id = 1

    def add_task(self, title):
        """
        Create a new task with the given title.

        Args:
            title (str): Task description

        Returns:
            Task: The created task

        Raises:
            ValueError: If title is empty or whitespace-only
        """
        # Validate title
        if not title or not title.strip():
            raise ValueError("Title cannot be empty")

        # Trim title
        trimmed_title = title.strip()

        # Create task
        task = Task(
            id=self.next_id,
            title=trimmed_title,
            is_complete=False,
            created_at=datetime.now()
        )

        # Store task
        self.tasks[self.next_id] = task
        self.next_id += 1

        return task

    def delete_task(self, task_id):
        """
        Delete a task by ID.

        Args:
            task_id (int): ID of task to delete

        Returns:
            bool: True if deleted, False if not found
        """
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False

    def update_task(self, task_id, new_title):
        """
        Update a task's title.

        Args:
            task_id (int): ID of task to update
            new_title (str): New title for the task

        Returns:
            Task | None: Updated task if found, None otherwise

        Raises:
            ValueError: If new_title is empty or whitespace-only
        """
        # Validate new title
        if not new_title or not new_title.strip():
            raise ValueError("Title cannot be empty")

        # Check task exists
        if task_id not in self.tasks:
            return None

        # Update task
        task = self.tasks[task_id]
        task.title = new_title.strip()
        return task

    def list_tasks(self):
        """
        Get all tasks sorted by ID.

        Returns:
            list[Task]: List of all tasks sorted by ID ascending
        """
        return [self.tasks[key] for key in sorted(self.tasks.keys())]

    def toggle_complete(self, task_id):
        """
        Toggle task completion status.

        Args:
            task_id (int): ID of task to toggle

        Returns:
            Task | None: Updated task if found, None otherwise
        """
        if task_id not in self.tasks:
            return None

        task = self.tasks[task_id]
        task.is_complete = not task.is_complete
        return task

    def get_task(self, task_id):
        """
        Retrieve a single task by ID.

        Args:
            task_id (int): ID of task to retrieve

        Returns:
            Task | None: Task if found, None otherwise
        """
        return self.tasks.get(task_id)