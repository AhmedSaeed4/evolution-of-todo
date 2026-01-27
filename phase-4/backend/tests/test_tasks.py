"""Integration tests for task endpoints"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from datetime import datetime
from uuid import uuid4
import os
import sys

# Mock the config before importing anything else
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['BETTER_AUTH_SECRET'] = 'test-secret-key'
os.environ['CORS_ORIGINS'] = 'http://localhost:3000'
os.environ['API_HOST'] = '0.0.0.0'
os.environ['API_PORT'] = '8000'
os.environ['DEBUG'] = 'false'

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from backend.main import app
from backend.database import get_session
from backend.models.task import Task, TaskPriority, TaskCategory, TaskStatus
from backend.auth.jwt import get_user_id_from_token


# Test database (in-memory SQLite for testing)
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(TEST_DATABASE_URL)

# Create a mock user table for the foreign key
# The table name must be 'user' to match the Task model's foreign key
from sqlmodel import SQLModel, Field
from sqlalchemy import Table, Column, String, MetaData

metadata = MetaData()

# Create user table manually to ensure correct name
user_table = Table(
    'user',
    metadata,
    Column('id', String, primary_key=True),
    Column('email', String),
    Column('name', String),
)

# Create all tables
SQLModel.metadata.create_all(test_engine)


def get_test_session():
    """Override get_session for testing"""
    with Session(test_engine) as session:
        yield session


def get_test_user_id(token: str = None):
    """Override get_user_id_from_token for testing"""
    if not token:
        return "test-user"
    # In tests, just extract user_id from token or use default
    return token.split(':')[1] if ':' in token else "test-user"


# Override dependencies
app.dependency_overrides[get_session] = get_test_session
app.dependency_overrides[get_user_id_from_token] = get_test_user_id


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Create authentication headers"""
    return {"Authorization": "Bearer test:test-user"}


class TestTaskEndpoints:
    """Test task CRUD operations"""

    def test_health_check(self, client):
        """Test health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_create_task(self, client, auth_headers):
        """Test creating a task"""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "priority": "high",
            "category": "work",
            "due_date": "2025-12-31T23:59:59Z"
        }

        response = client.post(
            "/api/test-user/tasks",
            json=task_data,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["priority"] == "high"
        assert data["category"] == "work"
        assert data["status"] == "pending"
        assert data["completed"] == False
        assert "id" in data

    def test_list_tasks(self, client, auth_headers):
        """Test listing tasks"""
        # First create a task
        task_data = {"title": "List Test", "priority": "medium", "category": "personal"}
        client.post("/api/test-user/tasks", json=task_data, headers=auth_headers)

        # Then list tasks
        response = client.get("/api/test-user/tasks", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["title"] == "List Test"

    def test_get_single_task(self, client, auth_headers):
        """Test getting a single task"""
        # Create task
        task_data = {"title": "Get Test", "priority": "low", "category": "home"}
        create_response = client.post("/api/test-user/tasks", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]

        # Get the task
        response = client.get(f"/api/test-user/tasks/{task_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Get Test"
        assert data["id"] == task_id

    def test_update_task(self, client, auth_headers):
        """Test updating a task"""
        # Create task
        task_data = {"title": "Original", "priority": "low", "category": "home"}
        create_response = client.post("/api/test-user/tasks", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]

        # Update task
        update_data = {"title": "Updated", "priority": "high"}
        response = client.put(
            f"/api/test-user/tasks/{task_id}",
            json=update_data,
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated"
        assert data["priority"] == "high"

    def test_delete_task(self, client, auth_headers):
        """Test deleting a task"""
        # Create task
        task_data = {"title": "Delete Test", "priority": "medium", "category": "work"}
        create_response = client.post("/api/test-user/tasks", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]

        # Delete task
        response = client.delete(f"/api/test-user/tasks/{task_id}", headers=auth_headers)
        assert response.status_code == 204

        # Verify it's gone
        get_response = client.get(f"/api/test-user/tasks/{task_id}", headers=auth_headers)
        assert get_response.status_code == 404

    def test_toggle_complete(self, client, auth_headers):
        """Test toggling task completion"""
        # Create task
        task_data = {"title": "Toggle Test", "priority": "medium", "category": "work"}
        create_response = client.post("/api/test-user/tasks", json=task_data, headers=auth_headers)
        task_id = create_response.json()["id"]

        # Toggle to complete
        response = client.patch(f"/api/test-user/tasks/{task_id}/complete", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["completed"] == True

        # Toggle back to pending
        response = client.patch(f"/api/test-user/tasks/{task_id}/complete", headers=auth_headers)
        data = response.json()
        assert data["status"] == "pending"
        assert data["completed"] == False

    def test_get_stats(self, client, auth_headers):
        """Test getting task statistics"""
        # Create tasks
        client.post("/api/test-user/tasks", json={
            "title": "Task 1", "priority": "high", "category": "work"
        }, headers=auth_headers)

        client.post("/api/test-user/tasks", json={
            "title": "Task 2", "priority": "medium", "category": "personal"
        }, headers=auth_headers)

        # Toggle one to complete
        create_response = client.post("/api/test-user/tasks", json={
            "title": "Task 3", "priority": "low", "category": "home"
        }, headers=auth_headers)
        task_id = create_response.json()["id"]
        client.patch(f"/api/test-user/tasks/{task_id}/complete", headers=auth_headers)

        # Get stats
        response = client.get("/api/test-user/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert data["pending"] == 2
        assert data["completed"] == 1

    def test_filter_tasks(self, client, auth_headers):
        """Test task filtering"""
        # Create multiple tasks
        tasks = [
            {"title": "Work Task", "priority": "high", "category": "work"},
            {"title": "Personal Task", "priority": "medium", "category": "personal"},
            {"title": "Home Task", "priority": "low", "category": "home"},
        ]

        for task in tasks:
            client.post("/api/test-user/tasks", json=task, headers=auth_headers)

        # Filter by category
        response = client.get("/api/test-user/tasks?category=work", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["category"] == "work"

        # Filter by priority
        response = client.get("/api/test-user/tasks?priority=medium", headers=auth_headers)
        data = response.json()
        assert len(data) == 1
        assert data[0]["priority"] == "medium"

    def test_search_tasks(self, client, auth_headers):
        """Test task search"""
        # Create tasks
        client.post("/api/test-user/tasks", json={
            "title": "Buy groceries", "description": "Milk and eggs", "priority": "high", "category": "home"
        }, headers=auth_headers)

        client.post("/api/test-user/tasks", json={
            "title": "Finish report", "description": "Quarterly results", "priority": "high", "category": "work"
        }, headers=auth_headers)

        # Search
        response = client.get("/api/test-user/tasks?search=report", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert "report" in data[0]["title"].lower()

    def test_unauthorized_access(self, client):
        """Test that unauthorized requests fail"""
        # Request without auth header
        response = client.get("/api/test-user/tasks")
        assert response.status_code == 401

        # Request with wrong user_id in path
        response = client.get("/api/wrong-user/tasks", headers={"Authorization": "Bearer test:test-user"})
        assert response.status_code == 403

    def test_bypass_token(self, client):
        """Test bypass token format"""
        # Create a bypass token
        import base64
        header = base64.b64encode('{"alg":"HS256","typ":"JWT"}'.encode()).decode()
        payload = base64.b64encode('{"sub":"bypass-user","email":"test@example.com","exp":9999999999}'.encode()).decode()
        bypass_token = f"{header}.{payload}.bypass-signature"

        headers = {"Authorization": f"Bearer {bypass_token}"}

        # Should work with bypass token
        task_data = {"title": "Bypass Test", "priority": "medium", "category": "work"}
        response = client.post("/api/bypass-user/tasks", json=task_data, headers=headers)
        assert response.status_code == 201

    def test_sorting(self, client, auth_headers):
        """Test task sorting"""
        # Create tasks with different due dates
        tasks = [
            {"title": "Task A", "priority": "high", "category": "work", "due_date": "2025-01-15T10:00:00Z"},
            {"title": "Task B", "priority": "medium", "category": "personal", "due_date": "2025-01-10T10:00:00Z"},
            {"title": "Task C", "priority": "low", "category": "home", "due_date": "2025-01-20T10:00:00Z"},
        ]

        for task in tasks:
            client.post("/api/test-user/tasks", json=task, headers=auth_headers)

        # Sort by dueDate ascending
        response = client.get("/api/test-user/tasks?sort_by=dueDate&sort_order=asc", headers=auth_headers)
        data = response.json()
        assert data[0]["title"] == "Task B"  # Earliest due date
        assert data[2]["title"] == "Task C"  # Latest due date

        # Sort by dueDate descending
        response = client.get("/api/test-user/tasks?sort_by=dueDate&sort_order=desc", headers=auth_headers)
        data = response.json()
        assert data[0]["title"] == "Task C"  # Latest due date first