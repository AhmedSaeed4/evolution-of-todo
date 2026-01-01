"""
Unit tests for menu interface functions

Feature: 002-cli-ui-update
Branch: 002-cli-ui-update
Tests: T007, T008, T010
"""

import pytest
from unittest.mock import patch, MagicMock
from backend.menu import (
    display_welcome,
    display_main_menu,
    get_menu_choice,
    prompt_for_task_title,
    prompt_for_task_id,
    show_results_and_pause,
    menu_loop
)
from backend.manager import TaskManager


class TestMenuDisplay:
    """Tests for menu display functions"""

    def test_display_welcome(self, capsys):
        """Test welcome screen displays branding"""
        display_welcome()
        captured = capsys.readouterr()

        assert "In-Memory CLI Todo Application" in captured.out
        assert "Menu Mode" in captured.out
        assert "╔" in captured.out
        assert "╝" in captured.out

    def test_display_main_menu(self, capsys):
        """Test main menu displays all 7 options"""
        display_main_menu()
        captured = capsys.readouterr()

        # Check all menu options are present
        assert "1. Add a new task" in captured.out
        assert "2. List all tasks" in captured.out
        assert "3. Complete a task" in captured.out
        assert "4. Update a task title" in captured.out
        assert "5. Delete a task" in captured.out
        assert "6. Show help" in captured.out
        assert "7. Exit application" in captured.out


class TestMenuValidation:
    """Tests for menu input validation"""

    @patch('builtins.input', return_value='3')
    def test_get_menu_choice_valid(self, mock_input):
        """Test valid menu choice is accepted"""
        result = get_menu_choice()
        assert result == 3

    @patch('builtins.input', side_effect=['0', '8', 'abc', '3'])
    def test_get_menu_choice_retry(self, mock_input):
        """Test invalid choices retry until valid"""
        result = get_menu_choice()
        assert result == 3
        assert mock_input.call_count == 4

    @patch('builtins.input', return_value='Test Task')
    def test_prompt_for_task_title_valid(self, mock_input):
        """Test valid task title is accepted"""
        result = prompt_for_task_title()
        assert result == "Test Task"

    @patch('builtins.input', side_effect=['', '   ', 'Valid Task'])
    def test_prompt_for_task_title_empty_retry(self, mock_input):
        """Test empty titles retry until valid"""
        result = prompt_for_task_title()
        assert result == "Valid Task"
        assert mock_input.call_count == 3

    @patch('builtins.input', return_value='42')
    def test_prompt_for_task_id_valid(self, mock_input):
        """Test valid task ID is accepted"""
        result = prompt_for_task_id("complete")
        assert result == 42

    @patch('builtins.input', side_effect=['abc', '-1', '0', '5'])
    def test_prompt_for_task_id_invalid_retry(self, mock_input):
        """Test invalid IDs retry until valid"""
        result = prompt_for_task_id("delete")
        assert result == 5
        assert mock_input.call_count == 4

    @patch('builtins.input', side_effect=[EOFError])
    def test_prompt_for_task_title_eof_handling(self, mock_input):
        """Test EOFError is handled gracefully"""
        result = prompt_for_task_title()
        assert result is None

    @patch('builtins.input', side_effect=[EOFError])
    def test_prompt_for_task_id_eof_handling(self, mock_input):
        """Test EOFError is handled gracefully"""
        result = prompt_for_task_id("complete")
        assert result is None

    @patch('builtins.input', side_effect=[KeyboardInterrupt])
    def test_prompt_for_task_title_keyboard_interrupt_handling(self, mock_input):
        """Test KeyboardInterrupt is handled gracefully"""
        result = prompt_for_task_title()
        assert result is None

    @patch('builtins.input', side_effect=[KeyboardInterrupt])
    def test_prompt_for_task_id_keyboard_interrupt_handling(self, mock_input):
        """Test KeyboardInterrupt is handled gracefully"""
        result = prompt_for_task_id("delete")
        assert result is None


class TestMenuLoop:
    """Tests for menu loop functionality"""

    @patch('builtins.input', side_effect=['1', 'Test Task', '', '7', ''])
    @patch('backend.menu.add_task_handler')
    @patch('backend.menu.exit_handler')
    def test_menu_loop_add_task(self, mock_exit, mock_add, mock_input):
        """Test menu loop handles add task operation"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify add_task_handler was called with correct arguments
        mock_add.assert_called_once_with(['Test Task'], manager)
        mock_exit.assert_called_once_with([], manager)

    @patch('builtins.input', side_effect=['2', '', '7', ''])
    @patch('backend.menu.list_tasks_handler')
    @patch('backend.menu.exit_handler')
    def test_menu_loop_list_tasks(self, mock_exit, mock_list, mock_input):
        """Test menu loop handles list tasks operation"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify list_tasks_handler was called
        mock_list.assert_called_once_with([], manager)
        mock_exit.assert_called_once_with([], manager)

    @patch('builtins.input', side_effect=['6', '', '7', ''])
    @patch('backend.menu.help_handler')
    @patch('backend.menu.exit_handler')
    def test_menu_loop_help(self, mock_exit, mock_help, mock_input):
        """Test menu loop handles help operation"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify help_handler was called
        mock_help.assert_called_once_with([], manager)
        mock_exit.assert_called_once_with([], manager)

    @patch('builtins.input', side_effect=['3', '1', '', '7', ''])
    @patch('backend.menu.complete_task_handler')
    @patch('backend.menu.exit_handler')
    def test_menu_loop_complete_task(self, mock_exit, mock_complete, mock_input):
        """Test menu loop handles complete task operation"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify complete_task_handler was called
        mock_complete.assert_called_once_with(['1'], manager)
        mock_exit.assert_called_once_with([], manager)

    @patch('builtins.input', side_effect=['4', '1', 'Updated Title', '', '7', ''])
    @patch('backend.menu.update_task_handler')
    @patch('backend.menu.exit_handler')
    def test_menu_loop_update_task(self, mock_exit, mock_update, mock_input):
        """Test menu loop handles update task operation"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify update_task_handler was called
        mock_update.assert_called_once_with(['1', 'Updated Title'], manager)
        mock_exit.assert_called_once_with([], manager)

    @patch('builtins.input', side_effect=['5', '1', '', '7', ''])
    @patch('backend.menu.delete_task_handler')
    @patch('backend.menu.exit_handler')
    def test_menu_loop_delete_task(self, mock_exit, mock_delete, mock_input):
        """Test menu loop handles delete task operation"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify delete_task_handler was called
        mock_delete.assert_called_once_with(['1'], manager)
        mock_exit.assert_called_once_with([], manager)

    @patch('builtins.input', side_effect=['7', ''])
    @patch('backend.menu.exit_handler')
    def test_menu_loop_exit(self, mock_exit, mock_input):
        """Test menu loop exits cleanly"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify exit_handler was called and loop terminated
        mock_exit.assert_called_once_with([], manager)

    @patch('builtins.input', side_effect=['1', 'Task 1', '', '2', '', '7', ''])
    @patch('backend.menu.add_task_handler')
    @patch('backend.menu.list_tasks_handler')
    @patch('backend.menu.exit_handler')
    def test_menu_loop_multiple_operations(self, mock_exit, mock_list, mock_add, mock_input):
        """Test menu loop handles multiple operations"""
        manager = TaskManager()
        menu_loop(manager)

        # Verify all handlers were called in order
        assert mock_add.call_count == 1
        assert mock_list.call_count == 1
        assert mock_exit.call_count == 1


class TestPauseBehavior:
    """Tests for pause functionality"""

    @patch('builtins.input', return_value='')
    def test_show_results_and_pause(self, mock_input):
        """Test pause waits for user input"""
        show_results_and_pause()
        mock_input.assert_called_once_with("\nPress Enter to continue...")

    @patch('builtins.input', side_effect=['1', 'Task', '', '7', ''])
    @patch('backend.menu.show_results_and_pause')
    @patch('backend.menu.exit_handler')
    def test_pause_after_operations(self, mock_exit, mock_pause, mock_input):
        """Test pause is called after each operation except exit"""
        manager = TaskManager()
        menu_loop(manager)

        # Should pause after add (choice 1) but not after exit (choice 7)
        assert mock_pause.call_count == 1
        mock_exit.assert_called_once()