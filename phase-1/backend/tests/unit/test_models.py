"""Unit tests for Task dataclass."""

import pytest
from datetime import datetime
from backend.models import Task


class TestTask:
    """Test cases for Task dataclass."""

    def test_task_creation(self):
        """Test basic task creation with all required fields."""
        created_at = datetime.now()
        task = Task(
            id=1,
            title="Buy groceries",
            is_complete=False,
            created_at=created_at
        )

        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.is_complete is False
        assert task.created_at == created_at

    def test_task_with_complete_status(self):
        """Test task creation with completion status set to True."""
        task = Task(
            id=2,
            title="Complete report",
            is_complete=True,
            created_at=datetime.now()
        )

        assert task.is_complete is True

    def test_task_title_with_whitespace(self):
        """Test task with title containing whitespace."""
        task = Task(
            id=3,
            title="  Task with spaces  ",
            is_complete=False,
            created_at=datetime.now()
        )

        # Note: Task dataclass doesn't trim - that's manager's responsibility
        assert task.title == "  Task with spaces  "

    def test_task_id_uniqueness(self):
        """Test that task IDs are independent."""
        now = datetime.now()
        task1 = Task(id=1, title="Task 1", is_complete=False, created_at=now)
        task2 = Task(id=2, title="Task 2", is_complete=False, created_at=now)

        assert task1.id != task2.id
        assert task1.title != task2.title

    def test_task_dataclass_structure(self):
        """Verify Task dataclass has all required fields."""
        task = Task(
            id=99,
            title="Test task",
            is_complete=True,
            created_at=datetime(2024, 1, 1, 12, 0, 0)
        )

        # Check all expected attributes exist
        assert hasattr(task, 'id')
        assert hasattr(task, 'title')
        assert hasattr(task, 'is_complete')
        assert hasattr(task, 'created_at')

        # Check types
        assert isinstance(task.id, int)
        assert isinstance(task.title, str)
        assert isinstance(task.is_complete, bool)
        assert isinstance(task.created_at, datetime)