"""Test data generators for CLI Todo Application tests."""

from datetime import datetime
from backend.models import Task
from backend.manager import TaskManager


def create_sample_tasks(count=5):
    """
    Generate a list of sample tasks for testing.

    Args:
        count (int): Number of tasks to generate

    Returns:
        list[Task]: List of sample tasks
    """
    tasks = []
    sample_titles = [
        "Buy groceries",
        "Walk the dog",
        "Complete project report",
        "Call dentist",
        "Read documentation",
        "Write unit tests",
        "Review pull requests",
        "Update dependencies",
        "Plan next sprint",
        "Clean workspace"
    ]

    for i in range(count):
        task = Task(
            id=i + 1,
            title=sample_titles[i % len(sample_titles)],
            is_complete=(i % 3 == 0),  # Every third task is complete
            created_at=datetime.now()
        )
        tasks.append(task)

    return tasks


def create_populated_manager(count=5):
    """
    Create a TaskManager populated with sample tasks.

    Args:
        count (int): Number of tasks to add

    Returns:
        TaskManager: Manager with sample tasks
    """
    manager = TaskManager()
    tasks = create_sample_tasks(count)

    # Manually add to manager to preserve IDs
    for task in tasks:
        manager.tasks[task.id] = task
        if task.id >= manager.next_id:
            manager.next_id = task.id + 1

    return manager


def create_error_scenarios():
    """
    Generate common error scenarios for testing.

    Returns:
        dict: Dictionary of error test cases
    """
    return {
        "empty_title": "",
        "whitespace_title": "   ",
        "invalid_id": "abc",
        "negative_id": -1,
        "nonexistent_id": 999,
        "missing_args": [],
        "long_title": "This is a very long task title that exceeds normal length and should be truncated in display",
        "special_chars": "Task with special chars: @#$%^&*()",
        "unicode": "Task with unicode: 你好 🎉 ✓",
        "very_long_unicode": "任务描述很长包含中文字符和emoji 🚀⭐🌟✨💫"
    }


# Sample data for quick testing
SAMPLE_TASKS = [
    {"title": "Buy milk", "complete": False},
    {"title": "Walk dog", "complete": True},
    {"title": "Read book", "complete": False},
    {"title": "Call mom", "complete": True},
    {"title": "Pay bills", "complete": False},
]


def quick_setup():
    """Quick setup for manual testing."""
    manager = TaskManager()
    for task_data in SAMPLE_TASKS:
        t = manager.add_task(task_data["title"])
        if task_data["complete"]:
            manager.toggle_complete(t.id)
    return manager