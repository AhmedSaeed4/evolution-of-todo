"""Integration tests for complete CLI workflow."""

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


class TestCompleteCLIWorkflow:
    """Integration tests for end-to-end CLI workflows."""

    def setup_method(self):
        """Create fresh manager for each test."""
        self.manager = TaskManager()

    def capture_handler_output(self, handler, args):
        """Helper to capture handler output."""
        with patch('sys.stdout', new=StringIO()) as fake_out:
            handler(args, self.manager)
            return fake_out.getvalue()

    def test_full_workflow_add_list_complete_delete(self, capsys):
        """Test complete workflow: add → list → complete → delete → list."""
        # Step 1: Add tasks
        add_task_handler(["Buy", "groceries"], self.manager)
        add_task_handler(["Walk", "dog"], self.manager)
        add_task_handler(["Read", "book"], self.manager)

        # Verify additions
        assert len(self.manager.tasks) == 3

        # Step 2: List tasks
        output = self.capture_handler_output(list_tasks_handler, [])
        assert "Buy groceries" in output
        assert "Walk dog" in output
        assert "Read book" in output
        assert "Total: 3 tasks" in output

        # Step 3: Complete task #2
        complete_task_handler(["2"], self.manager)
        task2 = self.manager.get_task(2)
        assert task2.is_complete is True

        # Step 4: Delete task #1
        delete_task_handler(["1"], self.manager)
        assert 1 not in self.manager.tasks

        # Step 5: List again to verify final state
        output = self.capture_handler_output(list_tasks_handler, [])
        assert "Buy groceries" not in output  # deleted
        assert "Walk dog" in output  # still exists, complete
        assert "Read book" in output  # still exists, incomplete
        assert "[x]" in output  # completed task
        assert "[ ]" in output  # incomplete task
        assert "Total: 2 tasks (1 complete, 1 pending)" in output

    def test_update_workflow(self, capsys):
        """Test update workflow: add → update → list."""
        # Add task
        add_task_handler(["Original", "title"], self.manager)

        # Update task
        update_task_handler(["1", "New", "title"], self.manager)

        # Verify update
        output = self.capture_handler_output(list_tasks_handler, [])
        assert "New title" in output
        assert "Original title" not in output

    def test_error_recovery_workflow(self, capsys):
        """Test error handling and recovery in workflow."""
        # Try to delete non-existent task
        delete_task_handler(["999"], self.manager)
        captured = capsys.readouterr()
        assert "not found" in captured.out

        # Add task successfully
        add_task_handler(["Recovery", "task"], self.manager)

        # Verify task was added despite previous error
        assert len(self.manager.tasks) == 1

        # Try invalid ID format
        complete_task_handler(["abc"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID" in captured.out

        # Verify task still exists
        assert len(self.manager.tasks) == 1

    def test_empty_input_workflow(self, capsys):
        """Test handling of empty/invalid inputs in workflow."""
        # Empty add
        add_task_handler([], self.manager)
        assert len(self.manager.tasks) == 0

        # Whitespace add
        add_task_handler(["   "], self.manager)
        assert len(self.manager.tasks) == 0

        # Add valid task
        add_task_handler(["Valid", "task"], self.manager)
        assert len(self.manager.tasks) == 1

        # Empty update
        update_task_handler(["1"], self.manager)
        assert self.manager.get_task(1).title == "Valid task"  # unchanged

    def test_mixed_operations_workflow(self, capsys):
        """Test mixed operations in realistic sequence."""
        # Setup
        add_task_handler(["Task", "A"], self.manager)
        add_task_handler(["Task", "B"], self.manager)
        add_task_handler(["Task", "C"], self.manager)

        # Complete middle task
        complete_task_handler(["2"], self.manager)

        # Update first task
        update_task_handler(["1", "Updated", "A"], self.manager)

        # Add new task
        add_task_handler(["Task", "D"], self.manager)

        # Delete last task
        delete_task_handler(["3"], self.manager)

        # Final verification
        tasks = self.manager.list_tasks()
        assert len(tasks) == 3
        assert tasks[0].title == "Updated A"
        assert tasks[0].is_complete is False
        assert tasks[1].title == "Task B"
        assert tasks[1].is_complete is True
        assert tasks[2].title == "Task D"
        assert tasks[2].is_complete is False

    def test_statistics_calculation(self, capsys):
        """Test that list command calculates correct statistics."""
        # Create mixed state
        add_task_handler(["Complete", "1"], self.manager)
        add_task_handler(["Complete", "2"], self.manager)
        add_task_handler(["Pending", "1"], self.manager)
        add_task_handler(["Pending", "2"], self.manager)
        add_task_handler(["Pending", "3"], self.manager)

        # Complete two tasks
        complete_task_handler(["1"], self.manager)
        complete_task_handler(["2"], self.manager)

        # List and verify statistics
        output = self.capture_handler_output(list_tasks_handler, [])
        assert "Total: 5 tasks (2 complete, 3 pending)" in output

    def test_exit_workflow(self):
        """Test exit command returns correct signal."""
        result = exit_handler([], self.manager)
        assert result == "EXIT"

    def test_help_integration(self, capsys):
        """Test help command shows all available commands."""
        help_handler([], self.manager)
        captured = capsys.readouterr()

        # Should show all commands
        commands = ["add", "delete", "update", "list", "complete", "help", "exit"]
        for cmd in commands:
            assert cmd in captured.out

    def test_task_id_persistence_across_operations(self):
        """Test that task IDs remain consistent across operations."""
        # Add three tasks
        t1 = self.manager.add_task("Task 1")
        t2 = self.manager.add_task("Task 2")
        t3 = self.manager.add_task("Task 3")

        assert t1.id == 1
        assert t2.id == 2
        assert t3.id == 3

        # Delete middle task
        self.manager.delete_task(2)

        # Add new task - should get ID 4, not 2
        t4 = self.manager.add_task("Task 4")
        assert t4.id == 4

        # IDs 1 and 3 still exist
        assert self.manager.get_task(1) is not None
        assert self.manager.get_task(3) is not None
        assert self.manager.get_task(2) is None

    def test_large_workflow_with_10_tasks(self):
        """Test workflow with 10 tasks to verify performance."""
        # Add 10 tasks
        for i in range(1, 11):
            self.manager.add_task(f"Task {i}")

        # Complete every other task
        for i in range(1, 11, 2):
            self.manager.toggle_complete(i)

        # Delete first and last
        self.manager.delete_task(1)
        self.manager.delete_task(10)

        # Verify final state
        tasks = self.manager.list_tasks()
        assert len(tasks) == 8

        complete_count = sum(1 for t in tasks if t.is_complete)
        pending_count = sum(1 for t in tasks if not t.is_complete)

        # Tasks 2,4,6,8 were completed (4 tasks)
        # Tasks 3,5,7,9 were not completed (4 tasks)
        assert complete_count == 4
        assert pending_count == 4

    def test_whitespace_handling_in_workflow(self):
        """Test that whitespace is handled correctly throughout workflow."""
        # Add task with lots of whitespace
        self.manager.add_task("  Task   with   spaces  ")

        # Verify it's trimmed
        task = self.manager.get_task(1)
        assert task.title == "Task   with   spaces"

        # Update with whitespace
        self.manager.update_task(1, "  New   title  ")

        # Verify update trimmed
        task = self.manager.get_task(1)
        assert task.title == "New   title"

    def test_concurrent_operations_simulation(self):
        """Simulate multiple users working on same task list."""
        # User A adds tasks
        self.manager.add_task("User A task 1")
        self.manager.add_task("User A task 2")

        # User B completes first task
        self.manager.toggle_complete(1)

        # User C adds task
        self.manager.add_task("User C task")

        # User A deletes second task
        self.manager.delete_task(2)

        # Verify final state
        tasks = self.manager.list_tasks()
        assert len(tasks) == 2
        assert tasks[0].is_complete is True  # Task 1
        assert tasks[1].title == "User C task"  # Task 3

    def test_update_task_workflow(self, capsys):
        """Test User Story 2: Update task title with validation."""
        # Add task
        add_task_handler(["Buy", "groceries"], self.manager)

        # Update with new title
        update_task_handler(["1", "Buy", "organic", "groceries"], self.manager)
        captured = capsys.readouterr()

        assert "✓ Task #1 updated" in captured.out
        assert "Buy groceries" in captured.out  # old title
        assert "Buy organic groceries" in captured.out  # new title

        # Verify change persisted
        task = self.manager.get_task(1)
        assert task.title == "Buy organic groceries"

    def test_update_nonexistent_task(self, capsys):
        """Test updating task that doesn't exist."""
        update_task_handler(["999", "New title"], self.manager)
        captured = capsys.readouterr()

        assert "✗ Task #999 not found" in captured.out

    def test_update_validation_errors(self, capsys):
        """Test update command validation."""
        # Add task first
        add_task_handler(["Test"], self.manager)

        # Invalid ID
        update_task_handler(["abc", "New title"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID" in captured.out

        # Missing title
        update_task_handler(["1"], self.manager)
        captured = capsys.readouterr()
        assert "Usage: update <id> <new_title>" in captured.out

        # Empty title
        update_task_handler(["1", "   "], self.manager)
        captured = capsys.readouterr()
        assert "Usage: update <id> <new_title>" in captured.out

    def test_comprehensive_error_handling_workflow(self, capsys):
        """T054: Test all error scenarios in realistic workflow."""
        from backend.main import dispatch_command

        # Scenario 1: Empty input (should silently continue)
        result = dispatch_command("", [], self.manager)
        assert result is None  # No output, just continue

        # Scenario 2: Unknown command
        dispatch_command("unknown", [], self.manager)
        captured = capsys.readouterr()
        assert "Unknown command" in captured.out

        # Scenario 3: Add with missing args
        dispatch_command("add", [], self.manager)
        captured = capsys.readouterr()
        assert "Usage: add <title>" in captured.out

        # Scenario 4: Valid add
        dispatch_command("add", ["Task", "1"], self.manager)
        captured = capsys.readouterr()
        assert "✓ Task #1 added" in captured.out

        # Scenario 5: Delete with invalid ID format
        dispatch_command("delete", ["abc"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID. Please enter a number." in captured.out

        # Scenario 6: Delete non-existent task
        dispatch_command("delete", ["999"], self.manager)
        captured = capsys.readouterr()
        assert "Task #999 not found" in captured.out

        # Scenario 7: Update with missing args
        dispatch_command("update", ["1"], self.manager)
        captured = capsys.readouterr()
        assert "Usage: update <id> <new_title>" in captured.out

        # Scenario 8: Complete with invalid ID
        dispatch_command("complete", ["xyz"], self.manager)
        captured = capsys.readouterr()
        assert "Invalid ID. Please enter a number." in captured.out

        # Scenario 9: Complete non-existent
        dispatch_command("complete", ["999"], self.manager)
        captured = capsys.readouterr()
        assert "Task #999 not found" in captured.out

        # Scenario 10: List should work fine
        dispatch_command("list", [], self.manager)
        captured = capsys.readouterr()
        assert "Task 1" in captured.out

        # Verify task is still intact despite all errors
        task = self.manager.get_task(1)
        assert task.title == "Task 1"
        assert task.is_complete is False