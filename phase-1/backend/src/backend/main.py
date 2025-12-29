# CLI entry point - Menu mode only
# Task: T005 - Replace CLI loop with menu loop

from backend.manager import TaskManager
from backend.menu import menu_loop


def main():
    """
    Main entry point - launches menu interface
    """
    # Initialize task manager
    manager = TaskManager()

    # Launch menu loop (replaces CLI loop)
    menu_loop(manager)


if __name__ == "__main__":
    main()