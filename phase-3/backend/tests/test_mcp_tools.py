"""Comprehensive tests for MCP tools with user isolation validation"""
import pytest
import sys
import os
from pathlib import Path
from uuid import uuid4

# Add src to path
backend_dir = Path(__file__).parent.parent / "src" / "backend"
sys.path.insert(0, str(backend_dir))

from backend.task_serves_mcp_tools import (
    create_task, list_tasks, get_task, update_task,
    delete_task, toggle_complete, get_stats
)
from backend.database import get_session
from backend.services.task_service import TaskService
from backend.models.task import Task


class TestMCPToolsUserIsolation:
    """Test user isolation across all MCP tools"""

    def setup_method(self):
        """Setup test data for each test"""
        # Use existing user IDs from the database
        self.user1 = "pvXpHDR7jHQHlUsqesGTok9wiOsGPZHq"  # fa@gmail.com
        self.user2 = "VSisPat0VoZDw7nuAOQIsYxO7NRQ0mNo"   # jade@gmail.com

        # Clean up any existing test data
        session = next(get_session())
        tasks = session.query(Task).filter(
            Task.user_id.in_([self.user1, self.user2])
        ).all()
        for task in tasks:
            session.delete(task)
        session.commit()

    def test_create_task_success(self):
        """Test successful task creation"""
        result = create_task(
            user_id=self.user1,
            title="Test Task",
            description="Test Description",
            priority="high",
            category="work"
        )

        assert result["success"] == True
        assert result["data"]["title"] == "Test Task"
        assert result["data"]["user_id"] == self.user1
        assert result["data"]["priority"] == "high"
        assert result["data"]["category"] == "work"

    def test_create_task_empty_title(self):
        """Test task creation with empty title fails"""
        result = create_task(
            user_id=self.user1,
            title="   ",  # Empty after strip
            description="Test"
        )

        assert result["success"] == False
        assert "Title cannot be empty" in result["error"]

    def test_list_tasks_user_isolation(self):
        """Test that list_tasks only returns user's own tasks"""
        # Create tasks for both users
        task1 = create_task(user_id=self.user1, title="User 1 Task")
        task2 = create_task(user_id=self.user2, title="User 2 Task")

        # User 1 should only see their tasks
        result1 = list_tasks(user_id=self.user1)
        assert result1["success"] == True
        assert len(result1["data"]) == 1
        assert result1["data"][0]["user_id"] == self.user1

        # User 2 should only see their tasks
        result2 = list_tasks(user_id=self.user2)
        assert result2["success"] == True
        assert len(result2["data"]) == 1
        assert result2["data"][0]["user_id"] == self.user2

    def test_get_task_user_isolation(self):
        """Test that get_task enforces user isolation"""
        # Create task for user 1
        create_result = create_task(user_id=self.user1, title="User 1 Task")
        task_id = create_result["data"]["id"]

        # User 1 can get their task
        result1 = get_task(user_id=self.user1, task_id=task_id)
        assert result1["success"] == True
        assert result1["data"]["id"] == task_id

        # User 2 cannot get user 1's task
        result2 = get_task(user_id=self.user2, task_id=task_id)
        assert result2["success"] == False
        assert "Access denied" in result2["error"]

    def test_get_task_nonexistent(self):
        """Test getting non-existent task"""
        fake_id = str(uuid4())
        result = get_task(user_id=self.user1, task_id=fake_id)
        assert result["success"] == False
        assert "Access denied" in result["error"]

    def test_update_task_user_isolation(self):
        """Test that update_task enforces user isolation"""
        # Create task for user 1
        create_result = create_task(user_id=self.user1, title="Original Title")
        task_id = create_result["data"]["id"]

        # User 1 can update their task
        result1 = update_task(
            user_id=self.user1,
            task_id=task_id,
            title="Updated Title"
        )
        assert result1["success"] == True
        assert result1["data"]["title"] == "Updated Title"

        # User 2 cannot update user 1's task
        result2 = update_task(
            user_id=self.user2,
            task_id=task_id,
            title="Hacked Title"
        )
        assert result2["success"] == False
        assert "Access denied" in result2["error"]

    def test_delete_task_user_isolation(self):
        """Test that delete_task enforces user isolation"""
        # Create task for user 1
        create_result = create_task(user_id=self.user1, title="User 1 Task")
        task_id = create_result["data"]["id"]

        # User 2 cannot delete user 1's task
        result2 = delete_task(user_id=self.user2, task_id=task_id)
        assert result2["success"] == False
        assert "Access denied" in result2["error"]

        # User 1 can delete their task
        result1 = delete_task(user_id=self.user1, task_id=task_id)
        assert result1["success"] == True
        assert "deleted successfully" in result1["data"]

    def test_toggle_complete_user_isolation(self):
        """Test that toggle_complete enforces user isolation"""
        # Create task for user 1
        create_result = create_task(user_id=self.user1, title="User 1 Task")
        task_id = create_result["data"]["id"]

        # User 2 cannot toggle user 1's task
        result2 = toggle_complete(user_id=self.user2, task_id=task_id)
        assert result2["success"] == False
        assert "Access denied" in result2["error"]

        # User 1 can toggle their task
        result1 = toggle_complete(user_id=self.user1, task_id=task_id)
        assert result1["success"] == True
        assert result1["data"]["completed"] == True
        assert result1["data"]["status"] == "completed"

    def test_get_stats_user_isolation(self):
        """Test that get_stats returns only user's own statistics"""
        # Create tasks for both users
        create_task(user_id=self.user1, title="User 1 Task 1")
        create_task(user_id=self.user1, title="User 1 Task 2")
        create_task(user_id=self.user2, title="User 2 Task 1")

        # User 1 stats should only count their tasks
        stats1 = get_stats(user_id=self.user1)
        assert stats1["success"] == True
        assert stats1["data"]["total"] == 2
        assert stats1["data"]["pending"] == 2
        assert stats1["data"]["completed"] == 0

        # User 2 stats should only count their tasks
        stats2 = get_stats(user_id=self.user2)
        assert stats2["success"] == True
        assert stats2["data"]["total"] == 1
        assert stats2["data"]["pending"] == 1
        assert stats2["data"]["completed"] == 0

    def test_list_tasks_with_filters(self):
        """Test list_tasks with various filters"""
        # Create tasks with different properties
        create_task(user_id=self.user1, title="High Priority Work", priority="high", category="work")
        create_task(user_id=self.user1, title="Low Priority Personal", priority="low", category="personal")
        create_task(user_id=self.user1, title="Completed Work", priority="medium", category="work")

        # Toggle one to completed
        tasks = list_tasks(user_id=self.user1)
        completed_id = tasks["data"][2]["id"]
        toggle_complete(user_id=self.user1, task_id=completed_id)

        # Test status filter
        pending = list_tasks(user_id=self.user1, status="pending")
        assert len(pending["data"]) == 2

        completed = list_tasks(user_id=self.user1, status="completed")
        assert len(completed["data"]) == 1

        # Test priority filter
        high_priority = list_tasks(user_id=self.user1, priority="high")
        assert len(high_priority["data"]) == 1
        assert high_priority["data"][0]["title"] == "High Priority Work"

        # Test category filter
        work_tasks = list_tasks(user_id=self.user1, category="work")
        assert len(work_tasks["data"]) == 2

        # Test search
        search_result = list_tasks(user_id=self.user1, search="Personal")
        assert len(search_result["data"]) == 1
        assert "Personal" in search_result["data"][0]["title"]

    def test_structured_response_format(self):
        """Test that all tools return consistent structured responses"""
        # Test success format
        result = create_task(user_id=self.user1, title="Test")
        assert "success" in result
        assert "data" in result
        assert result["success"] == True

        # Test error format
        result = get_task(user_id=self.user1, task_id="invalid-uuid")
        assert "success" in result
        assert "error" in result
        assert result["success"] == False
        assert isinstance(result["error"], str)

    def test_input_validation(self):
        """Test input validation across tools"""
        # Invalid priority
        result = create_task(user_id=self.user1, title="Test", priority="invalid")
        assert result["success"] == False

        # Invalid category
        result = create_task(user_id=self.user1, title="Test", category="invalid")
        assert result["success"] == False

        # Invalid UUID format
        result = get_task(user_id=self.user1, task_id="not-a-uuid")
        assert result["success"] == False

    def test_concurrent_user_operations(self):
        """Test that concurrent operations by different users don't interfere"""
        # Both users create tasks simultaneously (simulated)
        user1_task = create_task(user_id=self.user1, title="User 1 Task")
        user2_task = create_task(user_id=self.user2, title="User 2 Task")

        # Verify isolation
        user1_tasks = list_tasks(user_id=self.user1)
        user2_tasks = list_tasks(user_id=self.user2)

        assert len(user1_tasks["data"]) == 1
        assert len(user2_tasks["data"]) == 1
        assert user1_tasks["data"][0]["id"] != user2_tasks["data"][0]["id"]

    def teardown_method(self):
        """Clean up test data"""
        session = next(get_session())
        tasks = session.query(Task).filter(
            Task.user_id.in_([self.user1, self.user2])
        ).all()
        for task in tasks:
            session.delete(task)
        session.commit()


class TestMCPResponseFormat:
    """Test structured response format consistency"""

    def test_all_tools_return_dict(self):
        """Verify all tools return dict with expected structure"""
        tools = [
            lambda: create_task(user_id="test", title="Test"),
            lambda: list_tasks(user_id="test"),
            lambda: get_task(user_id="test", task_id=str(uuid4())),
            lambda: update_task(user_id="test", task_id=str(uuid4()), title="Test"),
            lambda: delete_task(user_id="test", task_id=str(uuid4())),
            lambda: toggle_complete(user_id="test", task_id=str(uuid4())),
            lambda: get_stats(user_id="test")
        ]

        for tool in tools:
            result = tool()
            assert isinstance(result, dict)
            assert "success" in result
            assert result["success"] in [True, False]
            assert ("data" in result) or ("error" in result)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])