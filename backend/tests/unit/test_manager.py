"""Unit tests for TaskManager class."""

import pytest
from datetime import datetime
from backend.models import Task
from backend.manager import TaskManager


class TestTaskManager:
    """Test cases for TaskManager business logic."""

    def setup_method(self):
        """Create fresh TaskManager for each test."""
        self.manager = TaskManager()

    def test_manager_initialization(self):
        """Test TaskManager starts with empty state."""
        assert self.manager.tasks == {}
        assert self.manager.next_id == 1

    def test_add_task_success(self):
        """Test adding a task successfully."""
        task = self.manager.add_task("Buy groceries")

        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.is_complete is False
        assert isinstance(task.created_at, datetime)
        assert len(self.manager.tasks) == 1
        assert self.manager.next_id == 2

    def test_add_task_strips_whitespace(self):
        """Test that add_task trims whitespace from title."""
        task = self.manager.add_task("  Task with spaces  ")

        assert task.title == "Task with spaces"

    def test_add_task_empty_title_raises_error(self):
        """Test that empty title raises ValueError."""
        with pytest.raises(ValueError, match="Title cannot be empty"):
            self.manager.add_task("")

        with pytest.raises(ValueError, match="Title cannot be empty"):
            self.manager.add_task("   ")

    def test_add_task_auto_increment(self):
        """Test that task IDs auto-increment."""
        task1 = self.manager.add_task("Task 1")
        task2 = self.manager.add_task("Task 2")
        task3 = self.manager.add_task("Task 3")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_delete_task_success(self):
        """Test deleting an existing task."""
        self.manager.add_task("Task to delete")
        result = self.manager.delete_task(1)

        assert result is True
        assert 1 not in self.manager.tasks
        assert len(self.manager.tasks) == 0

    def test_delete_task_not_found(self):
        """Test deleting non-existent task returns False."""
        result = self.manager.delete_task(999)

        assert result is False
        assert len(self.manager.tasks) == 0

    def test_delete_task_multiple(self):
        """Test deleting specific task leaves others intact."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        self.manager.add_task("Task 3")

        self.manager.delete_task(2)

        assert 1 in self.manager.tasks
        assert 2 not in self.manager.tasks
        assert 3 in self.manager.tasks
        assert len(self.manager.tasks) == 2

    def test_toggle_complete_success(self):
        """Test toggling task completion status."""
        task = self.manager.add_task("Test task")
        assert task.is_complete is False

        updated = self.manager.toggle_complete(1)
        assert updated.is_complete is True

        toggled_again = self.manager.toggle_complete(1)
        assert toggled_again.is_complete is False

    def test_toggle_complete_not_found(self):
        """Test toggling non-existent task returns None."""
        result = self.manager.toggle_complete(999)
        assert result is None

    def test_list_tasks_empty(self):
        """Test listing tasks when none exist."""
        tasks = self.manager.list_tasks()
        assert tasks == []

    def test_list_tasks_returns_sorted(self):
        """Test that list_tasks returns tasks sorted by ID."""
        self.manager.add_task("Task 3")
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")

        tasks = self.manager.list_tasks()

        assert len(tasks) == 3
        assert tasks[0].id == 1
        assert tasks[1].id == 2
        assert tasks[2].id == 3
        assert tasks[0].title == "Task 3"  # Order by ID, not insertion

    def test_list_tasks_mixed_completion(self):
        """Test listing tasks with mixed completion status."""
        self.manager.add_task("Incomplete 1")
        self.manager.add_task("Complete 1")
        self.manager.toggle_complete(2)
        self.manager.add_task("Incomplete 2")

        tasks = self.manager.list_tasks()

        assert tasks[0].is_complete is False
        assert tasks[1].is_complete is True
        assert tasks[2].is_complete is False

    def test_update_task_success(self):
        """Test updating task title successfully."""
        self.manager.add_task("Original title")
        updated = self.manager.update_task(1, "Updated title")

        assert updated.title == "Updated title"
        assert updated.id == 1
        assert self.manager.tasks[1].title == "Updated title"

    def test_update_task_strips_whitespace(self):
        """Test that update_task trims whitespace."""
        self.manager.add_task("Original")
        updated = self.manager.update_task(1, "  New Title  ")

        assert updated.title == "New Title"

    def test_update_task_empty_title_raises_error(self):
        """Test that updating to empty title raises ValueError."""
        self.manager.add_task("Original")

        with pytest.raises(ValueError, match="Title cannot be empty"):
            self.manager.update_task(1, "")

        with pytest.raises(ValueError, match="Title cannot be empty"):
            self.manager.update_task(1, "   ")

    def test_update_task_not_found(self):
        """Test updating non-existent task returns None."""
        result = self.manager.update_task(999, "New title")
        assert result is None

    def test_get_task_success(self):
        """Test retrieving existing task."""
        task = self.manager.add_task("Test task")
        retrieved = self.manager.get_task(1)

        assert retrieved == task
        assert retrieved.id == 1

    def test_get_task_not_found(self):
        """Test retrieving non-existent task returns None."""
        result = self.manager.get_task(999)
        assert result is None

    def test_complex_workflow(self):
        """Test realistic workflow: add, update, complete, delete."""
        # Add tasks
        task1 = self.manager.add_task("Buy milk")
        task2 = self.manager.add_task("Walk dog")
        task3 = self.manager.add_task("Read book")

        # Update one
        self.manager.update_task(2, "Walk dog for 30 minutes")

        # Complete one
        self.manager.toggle_complete(3)

        # Delete one
        self.manager.delete_task(1)

        # Verify final state
        tasks = self.manager.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].title == "Walk dog for 30 minutes"
        assert tasks[0].is_complete is False
        assert tasks[1].title == "Read book"
        assert tasks[1].is_complete is True

    def test_update_preserves_other_tasks(self):
        """Test that updating one task doesn't affect others."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        self.manager.add_task("Task 3")

        self.manager.update_task(2, "Updated Task 2")

        assert self.manager.get_task(1).title == "Task 1"
        assert self.manager.get_task(2).title == "Updated Task 2"
        assert self.manager.get_task(3).title == "Task 3"