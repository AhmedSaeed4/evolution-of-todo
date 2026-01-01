"""
Menu-driven UI for CLI Todo Application
Replaces command-line interface with numbered menu options

Feature: 002-cli-ui-update
Branch: 002-cli-ui-update
"""

from backend.commands import (
    add_task_handler,
    list_tasks_handler,
    complete_task_handler,
    update_task_handler,
    delete_task_handler,
    help_handler,
    exit_handler
)


def display_welcome():
    """Show welcome screen with branding"""
    print("╔════════════════════════════════════════════════════════════╗")
    print("║      In-Memory CLI Todo Application - Menu Mode           ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()


def display_main_menu():
    """Show main menu with 7 options"""
    print("┌────────────────────────────────────────────────────────────┐")
    print("│ What would you like to do?                                 │")
    print("├────────────────────────────────────────────────────────────┤")
    print("│ 1. Add a new task                                          │")
    print("│ 2. List all tasks                                          │")
    print("│ 3. Complete a task                                         │")
    print("│ 4. Update a task title                                     │")
    print("│ 5. Delete a task                                           │")
    print("│ 6. Show help                                               │")
    print("│ 7. Exit application                                        │")
    print("└────────────────────────────────────────────────────────────┘")
    print()


def get_menu_choice():
    """Get and validate user choice (1-7)"""
    while True:
        try:
            choice = input("Enter choice (1-7): ").strip()
            if choice.isdigit() and 1 <= int(choice) <= 7:
                return int(choice)
            print("✗ Please enter a number between 1 and 7")
        except (ValueError, EOFError, KeyboardInterrupt):
            print("\n✗ Invalid input. Please try again.")


def prompt_for_task_title():
    """Get task title with validation"""
    while True:
        try:
            title = input("Enter task title: ").strip()
            if title:
                return title
            print("✗ Title cannot be empty")
        except (EOFError, KeyboardInterrupt):
            print("\n✗ Operation cancelled")
            return None


def prompt_for_task_id(action):
    """Get task ID with validation"""
    while True:
        try:
            task_id = input(f"Enter task ID to {action}: ").strip()
            if task_id.isdigit() and int(task_id) > 0:
                return int(task_id)
            print("✗ Please enter a valid number")
        except (EOFError, KeyboardInterrupt):
            print("\n✗ Operation cancelled")
            return None


def show_results_and_pause():
    """Pause after showing results"""
    input("\nPress Enter to continue...")


def menu_loop(manager):
    """Main menu interaction loop"""
    display_welcome()

    while True:
        display_main_menu()
        choice = get_menu_choice()

        if choice == 1:  # Add
            title = prompt_for_task_title()
            if title:
                add_task_handler([title], manager)

        elif choice == 2:  # List
            list_tasks_handler([], manager)

        elif choice == 3:  # Complete
            task_id = prompt_for_task_id("complete")
            if task_id:
                complete_task_handler([str(task_id)], manager)

        elif choice == 4:  # Update
            task_id = prompt_for_task_id("update")
            if task_id:
                new_title = prompt_for_task_title()
                if new_title:
                    update_task_handler([str(task_id), new_title], manager)

        elif choice == 5:  # Delete
            task_id = prompt_for_task_id("delete")
            if task_id:
                delete_task_handler([str(task_id)], manager)

        elif choice == 6:  # Help
            help_handler([], manager)

        elif choice == 7:  # Exit
            exit_handler([], manager)
            break

        # Pause after each operation (except exit)
        if choice != 7:
            show_results_and_pause()