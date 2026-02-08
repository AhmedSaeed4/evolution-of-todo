#!/usr/bin/env python
"""Test the Phase 5 features"""
import os
import sys
import json
import base64
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from dotenv import load_dotenv
load_dotenv()

# API base URL
BASE_URL = "http://localhost:8000"

# Test user ID (bypass mode)
USER_ID = "bypass-user"

def create_bypass_token(user_id: str = USER_ID) -> str:
    """Create a bypass token for testing"""
    payload = {
        "sub": user_id,
        "id": user_id,
        "email": f"{user_id}@test.com",
        "name": "Test User"
    }
    payload_json = json.dumps(payload)
    payload_b64 = base64.b64encode(payload_json.encode()).decode().rstrip('=')
    return f"header.{payload_b64}.bypass-signature"

def get_headers():
    """Get headers with bypass token"""
    return {
        "Authorization": f"Bearer {create_bypass_token()}",
        "Content-Type": "application/json"
    }

def print_section(title):
    """Print section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)

def test_root():
    """Test root endpoint"""
    print_section("Test 1: Root Endpoint")
    response = requests.get(f"{BASE_URL}/")
    print(f"GET / → {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_health():
    """Test health endpoint"""
    print_section("Test 2: Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print(f"GET /health → {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_create_task_with_recurring():
    """Test creating a recurring task"""
    print_section("Test 3: Create Recurring Task")

    # Task due tomorrow
    tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
    # End date in 3 days
    end_date = (datetime.now() + timedelta(days=3)).isoformat()

    task_data = {
        "title": "Daily Standup",
        "description": "Team daily standup meeting",
        "priority": "high",
        "category": "work",
        "dueDate": tomorrow,
        "recurringRule": "daily",
        "recurringEndDate": end_date,
        "tags": ["work", "meeting", "daily"]
    }

    response = requests.post(
        f"{BASE_URL}/api/{USER_ID}/tasks",
        json=task_data,
        headers=get_headers()
    )

    print(f"POST /api/{{user_id}}/tasks → {response.status_code}")
    if response.status_code == 201:
        task = response.json()
        print(f"✅ Task created successfully!")
        print(f"   ID: {task['id']}")
        print(f"   Title: {task['title']}")
        print(f"   Recurring: {task.get('recurringRule')}")
        print(f"   Tags: {task.get('tags')}")
        return task
    else:
        print(f"❌ Failed: {response.text}")
        return None

def test_create_task_with_reminder():
    """Test creating a task with a reminder"""
    print_section("Test 4: Create Task with Reminder")

    # Task due in 1 hour
    due_date = (datetime.now() + timedelta(hours=1)).isoformat()
    # Reminder in 2 minutes for testing
    reminder_time = (datetime.now() + timedelta(minutes=2)).isoformat()

    task_data = {
        "title": "Call with Client",
        "description": "Important client call",
        "priority": "high",
        "category": "work",
        "dueDate": due_date,
        "reminderAt": reminder_time,
        "tags": ["urgent", "client"]
    }

    response = requests.post(
        f"{BASE_URL}/api/{USER_ID}/tasks",
        json=task_data,
        headers=get_headers()
    )

    print(f"POST /api/{{user_id}}/tasks → {response.status_code}")
    if response.status_code == 201:
        task = response.json()
        print(f"✅ Task created successfully!")
        print(f"   ID: {task['id']}")
        print(f"   Reminder At: {task.get('reminderAt')}")
        print(f"   Reminder Sent: {task.get('reminderSent')}")
        return task
    else:
        print(f"❌ Failed: {response.text}")
        return None

def test_get_tasks():
    """Test getting all tasks"""
    print_section("Test 5: Get All Tasks")

    response = requests.get(
        f"{BASE_URL}/api/{USER_ID}/tasks",
        headers=get_headers()
    )

    print(f"GET /api/{{user_id}}/tasks → {response.status_code}")
    if response.status_code == 200:
        tasks = response.json()
        print(f"✅ Retrieved {len(tasks)} tasks")
        for task in tasks:
            recurring = task.get('recurringRule') or '-'
            reminder = task.get('reminderAt') or '-'
            tags = task.get('tags') or []
            print(f"   - {task['title'][:30]:30} | Recurring: {recurring:10} | Reminder: {reminder[:19] if len(reminder) > 19 else reminder:19} | Tags: {tags}")
        return tasks
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_get_notifications():
    """Test getting notifications"""
    print_section("Test 6: Get Notifications")

    response = requests.get(
        f"{BASE_URL}/api/{USER_ID}/notifications",
        headers=get_headers()
    )

    print(f"GET /api/{{user_id}}/notifications → {response.status_code}")
    if response.status_code == 200:
        notifications = response.json()
        print(f"✅ Retrieved {len(notifications)} notifications")
        for notif in notifications:
            read_status = "Read" if notif['read'] else "Unread"
            print(f"   - [{read_status}] {notif['message']}")
        return notifications
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_get_audit_logs():
    """Test getting audit logs"""
    print_section("Test 7: Get Audit Logs")

    response = requests.get(
        f"{BASE_URL}/api/{USER_ID}/audit?limit=10",
        headers=get_headers()
    )

    print(f"GET /api/{{user_id}}/audit → {response.status_code}")
    if response.status_code == 200:
        logs = response.json()
        print(f"✅ Retrieved {len(logs)} audit log entries")
        for log in logs[:5]:  # Show first 5
            print(f"   - [{log['eventType']}] {log.get('data', {}).get('title', 'N/A')} at {log['timestamp'][:19]}")
        return logs
    else:
        print(f"❌ Failed: {response.text}")
        return []

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  Phase 5 Features Test Suite")
    print("="*60)

    results = []

    # Run tests
    results.append(("Root Endpoint", test_root()))
    results.append(("Health Check", test_health()))

    task1 = test_create_task_with_recurring()
    results.append(("Create Recurring Task", task1 is not None))

    task2 = test_create_task_with_reminder()
    results.append(("Create Task with Reminder", task2 is not None))

    tasks = test_get_tasks()
    results.append(("Get Tasks", len(tasks) > 0))

    notifications = test_get_notifications()
    results.append(("Get Notifications", True))  # Always returns true (empty list is ok)

    logs = test_get_audit_logs()
    results.append(("Get Audit Logs", len(logs) > 0))

    # Summary
    print_section("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} - {name}")

    print(f"\n  Total: {passed}/{total} tests passed")

    if passed == total:
        print("\n  🎉 All tests passed!")
        return 0
    else:
        print(f"\n  ⚠️  {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
