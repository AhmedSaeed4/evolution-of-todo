# CLI entry point and main loop
# Task: T034-T040 - Complete implementation

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


def parse_command(user_input):
    """
    Parse user input into command and arguments.

    Args:
        user_input (str): Raw user input

    Returns:
        tuple: (command, args_list)
    """
    # Strip leading/trailing whitespace
    user_input = user_input.strip()

    # Handle empty input
    if not user_input:
        return None, []

    # Split into parts
    parts = user_input.split()
    command = parts[0].lower()
    args = parts[1:]

    return command, args


def dispatch_command(command, args, manager):
    """
    Dispatch command to appropriate handler.

    Args:
        command (str): Command name
        args (list): Command arguments
        manager (TaskManager): Task manager instance

    Returns:
        str | None: "EXIT" if should exit, None otherwise
    """
    # Command mapping
    handlers = {
        "add": add_task_handler,
        "delete": delete_task_handler,
        "update": update_task_handler,
        "list": list_tasks_handler,
        "complete": complete_task_handler,
        "help": help_handler,
        "exit": exit_handler,
        "quit": exit_handler,
    }

    if command in handlers:
        result = handlers[command](args, manager)
        return result
    else:
        print(f"Unknown command '{command}'. Type 'help' for available commands.")
        return None


def main():
    """
    Main CLI entry point and loop.

    Displays welcome message, processes commands, and handles exit.
    """
    # Initialize task manager
    manager = TaskManager()

    # Display welcome message (FR-018)
    print("Welcome to the In-Memory CLI Todo Application!")
    print("Type 'help' for available commands, 'exit' to quit.")
    print()

    # Main command loop
    while True:
        try:
            # Get user input
            user_input = input("todo> ")

            # Parse command
            command, args = parse_command(user_input)

            # Skip empty input (silent re-prompt) (FR-015)
            if command is None:
                continue

            # Dispatch and execute command
            result = dispatch_command(command, args, manager)

            # Check for exit signal
            if result == "EXIT":
                break

        except KeyboardInterrupt:
            # Handle Ctrl+C gracefully
            print("\nUse 'exit' or 'quit' to exit the application.")
            continue
        except EOFError:
            # Handle Ctrl+D
            print("\nGoodbye!")
            break


if __name__ == "__main__":
    main()