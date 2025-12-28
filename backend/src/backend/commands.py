# Command handlers
# Task: T028-T033 - Complete implementation

import sys


def add_task_handler(args, manager):
    """
    Handle add task command.

    Usage: add <title>
    """
    if not args:
        print("Usage: add <title>")
        return

    title = " ".join(args)
    if not title.strip():
        print("Usage: add <title>")
        return

    try:
        task = manager.add_task(title)
        print(f"✓ Task #{task.id} added: \"{task.title}\"")
    except ValueError as e:
        print(f"✗ Error: {e}")


def delete_task_handler(args, manager):
    """
    Handle delete task command.

    Usage: delete <id>
    """
    if not args:
        print("Usage: delete <id>")
        return

    try:
        task_id = int(args[0])
    except ValueError:
        print("Invalid ID. Please enter a number.")
        return

    if manager.delete_task(task_id):
        print(f"✓ Task #{task_id} deleted")
    else:
        print(f"✗ Task #{task_id} not found")


def update_task_handler(args, manager):
    """
    Handle update task command.

    Usage: update <id> <new_title>
    """
    if len(args) < 2:
        print("Usage: update <id> <new_title>")
        return

    try:
        task_id = int(args[0])
    except ValueError:
        print("Invalid ID. Please enter a number.")
        return

    new_title = " ".join(args[1:])
    if not new_title.strip():
        print("Usage: update <id> <new_title>")
        return

    # Get old title before updating
    old_task = manager.get_task(task_id)
    if not old_task:
        print(f"✗ Task #{task_id} not found")
        return

    old_title = old_task.title

    task = manager.update_task(task_id, new_title)
    if task:
        print(f"✓ Task #{task_id} updated: \"{old_title}\" → \"{task.title}\"")
    else:
        print(f"✗ Task #{task_id} not found")


def list_tasks_handler(args, manager):
    """
    Handle list tasks command.

    Usage: list
    """
    tasks = manager.list_tasks()

    if not tasks:
        print("No tasks yet. Add a task with 'add <title>'")
        return

    # Calculate statistics
    total = len(tasks)
    complete = sum(1 for t in tasks if t.is_complete)
    pending = total - complete

    # Print table header
    print("┌────┬────────┬─────────────────────────┐")
    print("│ ID │ Status │ Title                   │")
    print("├────┼────────┼─────────────────────────┤")

    # Print each task
    for task in tasks:
        status = "[x]" if task.is_complete else "[ ]"
        title = task.title[:23] + "..." if len(task.title) > 23 else task.title
        print(f"│ {task.id:2d} │ {status:6} │ {title:<23} │")

    # Print table footer
    print("└────┴────────┴─────────────────────────┘")
    print(f"Total: {total} tasks ({complete} complete, {pending} pending)")


def complete_task_handler(args, manager):
    """
    Handle complete task command.

    Usage: complete <id>
    """
    if not args:
        print("Usage: complete <id>")
        return

    try:
        task_id = int(args[0])
    except ValueError:
        print("Invalid ID. Please enter a number.")
        return

    task = manager.toggle_complete(task_id)
    if task:
        status = "complete" if task.is_complete else "incomplete"
        print(f"✓ Task #{task_id} marked as {status}: \"{task.title}\"")
    else:
        print(f"✗ Task #{task_id} not found")


def help_handler(args, manager):
    """
    Handle help command.

    Usage: help
    """
    print("Available commands (used via menu):")
    print("  1. Add a new task")
    print("  2. List all tasks")
    print("  3. Complete a task")
    print("  4. Update a task title")
    print("  5. Delete a task")
    print("  6. Show help")
    print("  7. Exit application")
    print()
    print("All operations are now performed through the menu interface.")


def exit_handler(args, manager):
    """
    Handle exit command.

    Usage: exit
    """
    print("Goodbye! Your tasks have not been saved.")
    return "EXIT"