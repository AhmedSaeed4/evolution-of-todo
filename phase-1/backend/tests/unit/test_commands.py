"""Unit tests for command handlers."""

import pytest
from io import StringIO
from unittest.mock import patch
from backend.manager import TaskManager
from backend.commands import (
    add_task_handler,
    delete_task_handler,
    update_task_handler,
    list_tasks_handler,
    complete_task_handler,
    help_handler,
    exit_handler
)


class TestAddTaskHandler:
    """Test cases for add_task_handler."""

    def setup_method(self):
        self.manager = TaskManager()

    def test_add_task_success(self, capsys):
        """Test successful task addition."""
        add_task_handler(["Buy", "groceries"], self.manager)
        captured = capsys.readouterr()

        assert "✓ Task #1 added" in captured.out
        assert "Buy groceries" in captured.out
        assert len(self.manager.tasks) == 1

    def test_add_task_with_single_word(self, capsys):
        """Test adding task with single word."""
        add_task_handler(["Task"], self.manager)
        captured = capsys.readouterr()

        assert "✓ Task #1 added" in captured.out
        assert "Task" in captured.out

    def test_add_task_empty_args(self, capsys):
        """Test add with no arguments."""
        add_task_handler([], self.manager)
        captured = capsys.readouterr()

        assert "Usage: add <title>" in captured.out
        assert len(self.manager.tasks) == 0

    def test_add_task_whitespace_only(self, capsys):
        """Test add with whitespace-only title."""
        add_task_handler(["   "], self.manager)
        captured = capsys.readouterr()

        assert "Usage: add <title>" in captured.out
        assert len(self.manager.tasks) == 0

    def test_add_task_strips_whitespace(self, capsys):
        """Test that add task trims whitespace."""
        add_task_handler(["  ", "Task", "  "], self.manager)
        captured = capsys.readouterr()

        task = self.manager.get_task(1)
        assert task.title == "Task"


class TestDeleteTaskHandler:
    """Test cases for delete_task_handler."""

    def setup_method(self):
        self.manager = TaskManager()
        self.manager.add_task("Test task")

    def test_delete_task_success(self, capsys):
        """Test successful task deletion."""
        delete_task_handler(["1"], self.manager)
        captured = capsys.readouterr()

        assert "✓ Task #1 deleted" in captured.out
        assert 1 not in self.manager.tasks

    def test_delete_task_not_found(self, capsys):
        """Test deleting non-existent task."""
        delete_task_handler(["999"], self.manager)
        captured = capsys.readouterr()

        assert "✗ Task #999 not found" in captured.out
        assert 1 in self.manager.tasks

    def test_delete_task_invalid_id(self, capsys):
        """Test delete with invalid ID format."""
        delete_task_handler(["abc"], self.manager)
        captured = capsys.readouterr()

        assert "Invalid ID. Please enter a number." in captured.out

    def test_delete_task_no_args(self, capsys):
        """Test delete with no arguments."""
        delete_task_handler([], self.manager)
        captured = capsys.readouterr()

        assert "Usage: delete <id>" in captured.out


class TestUpdateTaskHandler:
    """Test cases for update_task_handler."""

    def setup_method(self):
        self.manager = TaskManager()
        self.manager.add_task("Original title")

    def test_update_task_success(self, capsys):
        """Test successful task update."""
        update_task_handler(["1", "New", "title"], self.manager)
        captured = capsys.readouterr()

        assert "✓ Task #1 updated" in captured.out
        assert "Original title" in captured.out
        assert "New title" in captured.out
        assert self.manager.get_task(1).title == "New title"

    def test_update_task_not_found(self, capsys):
        """Test updating non-existent task."""
        update_task_handler(["999", "New title"], self.manager)
        captured = capsys.readouterr()

        assert "✗ Task #999 not found" in captured.out

    def test_update_task_invalid_id(self, capsys):
        """Test update with invalid ID format."""
        update_task_handler(["abc", "New title"], self.manager)
        captured = capsys.readouterr()

        assert "Invalid ID. Please enter a number." in captured.out

    def test_update_task_missing_title(self, capsys):
        """Test update with no new title."""
        update_task_handler(["1"], self.manager)
        captured = capsys.readouterr()

        assert "Usage: update <id> <new_title>" in captured.out

    def test_update_task_empty_title(self, capsys):
        """Test update with empty new title."""
        update_task_handler(["1", "   "], self.manager)
        captured = capsys.readouterr()

        assert "Usage: update <id> <new_title>" in captured.out


class TestListTasksHandler:
    """Test cases for list_tasks_handler."""

    def setup_method(self):
        self.manager = TaskManager()

    def test_list_empty(self, capsys):
        """Test listing when no tasks exist."""
        list_tasks_handler([], self.manager)
        captured = capsys.readouterr()

        assert "No tasks yet" in captured.out

    def test_list_single_task(self, capsys):
        """Test listing single task."""
        self.manager.add_task("Test task")
        list_tasks_handler([], self.manager)
        captured = capsys.readouterr()

        assert "ID" in captured.out
        assert "Status" in captured.out
        assert "Title" in captured.out
        assert "Test task" in captured.out
        assert "Total: 1 tasks" in captured.out

    def test_list_multiple_tasks(self, capsys):
        """Test listing multiple tasks."""
        self.manager.add_task("Task 1")
        self.manager.add_task("Task 2")
        self.manager.toggle_complete(2)
        list_tasks_handler([], self.manager)
        captured = capsys.readouterr()

        assert "Task 1" in captured.out
        assert "Task 2" in captured.out
        assert "[ ]" in captured.out  # incomplete
        assert "[x]" in captured.out  # complete
        assert "Total: 2 tasks (1 complete, 1 pending)" in captured.out

    def test_list_long_title_truncation(self, capsys):
        """Test that long titles are truncated."""
        long_title = "This is a very long task title that should be truncated"
        self.manager.add_task(long_title)
        list_tasks_handler([], self.manager)
        captured = capsys.readouterr()

        # Should contain truncated version with ellipsis
        assert "This is a very long tas..." in captured.out
        assert "..." in captured.out


class TestCompleteTaskHandler:
    """Test cases for complete_task_handler."""

    def setup_method(self):
        self.manager = TaskManager()
        self.manager.add_task("Test task")

    def test_complete_task_success(self, capsys):
        """Test completing a task."""
        complete_task_handler(["1"], self.manager)
        captured = capsys.readouterr()

        assert "✓ Task #1 marked as complete" in captured.out
        assert self.manager.get_task(1).is_complete is True

    def test_complete_task_toggle_back(self, capsys):
        """Test toggling task back to incomplete."""
        self.manager.toggle_complete(1)  # Make complete first
        complete_task_handler(["1"], self.manager)
        captured = capsys.readouterr()

        assert "✓ Task #1 marked as incomplete" in captured.out
        assert self.manager.get_task(1).is_complete is False

    def test_complete_task_not_found(self, capsys):
        """Test completing non-existent task."""
        complete_task_handler(["999"], self.manager)
        captured = capsys.readouterr()

        assert "✗ Task #999 not found" in captured.out

    def test_complete_task_invalid_id(self, capsys):
        """Test complete with invalid ID format."""
        complete_task_handler(["abc"], self.manager)
        captured = capsys.readouterr()

        assert "Invalid ID. Please enter a number." in captured.out

    def test_complete_task_no_args(self, capsys):
        """Test complete with no arguments."""
        complete_task_handler([], self.manager)
        captured = capsys.readouterr()

        assert "Usage: complete <id>" in captured.out


class TestHelpHandler:
    """Test cases for help_handler."""

    def setup_method(self):
        self.manager = TaskManager()

    def test_help_output(self, capsys):
        """Test help command output."""
        help_handler([], self.manager)
        captured = capsys.readouterr()

        assert "Available commands:" in captured.out
        assert "add <title>" in captured.out
        assert "delete <id>" in captured.out
        assert "update <id> <title>" in captured.out
        assert "list" in captured.out
        assert "complete <id>" in captured.out
        assert "help" in captured.out
        assert "exit/quit" in captured.out


class TestExitHandler:
    """Test cases for exit_handler."""

    def setup_method(self):
        self.manager = TaskManager()

    def test_exit_returns_exit_signal(self):
        """Test exit handler returns EXIT signal."""
        result = exit_handler([], self.manager)
        assert result == "EXIT"


class TestErrorHandlingUserStory3:
    """Test cases for User Story 3 - Error Handling and Validation."""

    def setup_method(self):
        self.manager = TaskManager()

    def test_empty_input_handling(self, capsys):
        """T049: Empty input should re-prompt silently."""
        # Test empty args for various commands
        add_task_handler([], self.manager)
        captured = capsys.readouterr()
        assert "Usage: add <title>" in captured.out

        delete_task_handler([], self.manager)
        captured = capsys.readouterr()
        assert "Usage: delete <id>" in captured.out

        update_task_handler(["1"], self.manager)  # Missing new title
        captured = capsys.readouterr()
        assert "Usage: update <id> <new_title>" in captured.out

        complete_task_handler([], self.manager)
        captured = capsys.readouterr()
        assert "Usage: complete <id>" in captured.out

    def test_whitespace_only_input(self, capsys):
        """T049: Whitespace-only input should be handled gracefully."""
        add_task_handler(["   "], self.manager)
        captured = capsys.readouterr()
        assert "Usage: add <title>" in captured.out
        assert len(self.manager.tasks) == 0

    def test_unknown_command_handling(self, capsys):
        """T050: Unknown commands should suggest using help."""
        # Test via main.py's dispatch command (simulate unknown command)
        from backend.main import dispatch_command

        # Unknown command
        dispatch_command("unknown_command", ["arg1", "arg2"], self.manager)
        captured = capsys.readouterr()
        assert "Unknown command" in captured.out
        assert "help" in captured.out

    def test_missing_argument_handling(self, capsys):
        """T051: Missing arguments should show usage hints."""
        # Add a task first
        self.manager.add_task("Test task")

        # Test add without title
        add_task_handler([], self.manager)
        captured = capsys.readouterr()
        assert "Usage: add <title>" in captured.out

        # Test delete without ID
        delete_task_handler([], self.manager)
        captured = capsys.readouterr()
        assert "Usage: delete <id>" in captured.out

        # Test update without new title
        update_task_handler(["1"], self.manager)
        captured = capsys.readouterr()
        assert "Usage: update <id> <new_title>" in captured.out

        # Test complete without ID
        complete_task_handler([], self.manager)
        captured = capsys.readouterr()
        assert "Usage: complete <id>" in captured.out

    def test_invalid_id_format_handling(self, capsys):
        """T052: Invalid ID format should show specific error."""
        # Test delete with invalid ID
        delete_task_handler(["abc"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID. Please enter a number." in captured.out

        # Test update with invalid ID
        update_task_handler(["xyz", "New title"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID. Please enter a number." in captured.out

        # Test complete with invalid ID
        complete_task_handler(["def"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID. Please enter a number." in captured.out

        # Test with special characters
        delete_task_handler(["1@#"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID. Please enter a number." in captured.out

    def test_task_not_found_handling(self, capsys):
        """T053: Operations on non-existent tasks should show clear error."""
        # Test delete non-existent
        delete_task_handler(["999"], self.manager)
        captured = capsys.readouterr()
        assert "Task #999 not found" in captured.out

        # Test update non-existent
        update_task_handler(["999", "New title"], self.manager)
        captured = capsys.readouterr()
        assert "Task #999 not found" in captured.out

        # Test complete non-existent
        complete_task_handler(["999"], self.manager)
        captured = capsys.readouterr()
        assert "Task #999 not found" in captured.out

    def test_whitespace_trimming(self, capsys):
        """Additional: Verify whitespace is trimmed from task titles."""
        add_task_handler(["  Task  with  spaces  "], self.manager)
        task = self.manager.get_task(1)
        assert task.title == "Task  with  spaces"

        # Update with whitespace
        update_task_handler(["1", "  Updated  title  "], self.manager)
        task = self.manager.get_task(1)
        assert task.title == "Updated  title"

    def test_mixed_error_scenarios(self, capsys):
        """T054 Integration: Test multiple error scenarios in sequence."""
        # 1. Try to delete non-existent
        delete_task_handler(["999"], self.manager)
        captured = capsys.readouterr()
        assert "not found" in captured.out

        # 2. Try invalid ID format
        delete_task_handler(["abc"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID" in captured.out

        # 3. Try empty add
        add_task_handler([], self.manager)
        captured = capsys.readouterr()
        assert "Usage: add" in captured.out

        # 4. Now add valid task
        add_task_handler(["Valid", "task"], self.manager)
        captured = capsys.readouterr()
        assert "✓ Task #1 added" in captured.out

        # 5. Try update with missing args
        update_task_handler(["1"], self.manager)
        captured = capsys.readouterr()
        assert "Usage: update" in captured.out

        # 6. Try complete with invalid ID
        complete_task_handler(["xyz"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID" in captured.out

        # 7. Verify task still exists and unchanged
        task = self.manager.get_task(1)
        assert task.title == "Valid task"
        assert task.is_complete is False