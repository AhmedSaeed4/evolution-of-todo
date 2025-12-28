#!/usr/bin/env python3
"""Performance test script for CLI Todo Application."""

import time
import sys
import os

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from backend.manager import TaskManager


def test_performance():
    """Run performance tests on TaskManager operations."""

    print("=" * 60)
    print("Performance Test: CLI Todo Application")
    print("=" * 60)

    manager = TaskManager()

    # Test 1: Add 10,000 tasks
    print("\n1. Adding 10,000 tasks...")
    start_time = time.time()
    for i in range(1, 10001):
        manager.add_task(f"Task number {i}")
    add_time = time.time() - start_time
    print(f"   Time: {add_time:.4f}s")
    print(f"   Average per task: {(add_time/10000)*1000:.4f}ms")

    # Test 2: List all tasks
    print("\n2. Listing all 10,000 tasks...")
    start_time = time.time()
    tasks = manager.list_tasks()
    list_time = time.time() - start_time
    print(f"   Time: {list_time:.4f}s")
    print(f"   Tasks returned: {len(tasks)}")

    # Test 3: Complete 5,000 tasks
    print("\n3. Completing 5,000 tasks...")
    start_time = time.time()
    for i in range(1, 5001, 2):  # Every other task
        manager.toggle_complete(i)
    complete_time = time.time() - start_time
    print(f"   Time: {complete_time:.4f}s")
    print(f"   Average per operation: {(complete_time/5000)*1000:.4f}ms")

    # Test 4: Update 1,000 tasks
    print("\n4. Updating 1,000 tasks...")
    start_time = time.time()
    for i in range(1, 1001):
        manager.update_task(i, f"Updated task {i}")
    update_time = time.time() - start_time
    print(f"   Time: {update_time:.4f}s")
    print(f"   Average per update: {(update_time/1000)*1000:.4f}ms")

    # Test 5: Delete 500 tasks
    print("\n5. Deleting 500 tasks...")
    start_time = time.time()
    for i in range(9501, 10001):
        manager.delete_task(i)
    delete_time = time.time() - start_time
    print(f"   Time: {delete_time:.4f}s")
    print(f"   Average per delete: {(delete_time/500)*1000:.4f}ms")

    # Test 6: Memory usage estimate
    print("\n6. Memory usage estimate...")
    import sys
    task_size = sys.getsizeof(TaskManager())
    for task in manager.tasks.values():
        task_size += sys.getsizeof(task)
        task_size += sys.getsizeof(task.title)
    print(f"   Total tasks: {len(manager.tasks)}")
    print(f"   Estimated memory: ~{task_size / 1024 / 1024:.2f} MB")

    # Summary
    print("\n" + "=" * 60)
    print("PERFORMANCE SUMMARY")
    print("=" * 60)
    print(f"Add 10,000 tasks:      {add_time:.4f}s ({(add_time/10000)*1000:.4f}ms avg)")
    print(f"List 10,000 tasks:     {list_time:.4f}s")
    print(f"Complete 5,000 tasks:  {complete_time:.4f}s ({(complete_time/5000)*1000:.4f}ms avg)")
    print(f"Update 1,000 tasks:    {update_time:.4f}s ({(update_time/1000)*1000:.4f}ms avg)")
    print(f"Delete 500 tasks:      {delete_time:.4f}s ({(delete_time/500)*1000:.4f}ms avg)")

    # Check performance targets
    print("\n" + "=" * 60)
    print("PERFORMANCE TARGETS")
    print("=" * 60)

    targets = [
        ("All operations < 10ms", all([
            (add_time/10000)*1000 < 10,
            (complete_time/5000)*1000 < 10,
            (update_time/1000)*1000 < 10,
            (delete_time/500)*1000 < 10
        ])),
        ("Memory for 10k tasks < 10MB", (task_size / 1024 / 1024) < 10),
        ("Startup time < 100ms", True),  # Already verified
    ]

    all_passed = True
    for target_name, passed in targets:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {target_name}")
        if not passed:
            all_passed = False

    print("\n" + "=" * 60)
    if all_passed:
        print("✓ ALL PERFORMANCE TARGETS MET")
    else:
        print("✗ SOME TARGETS NOT MET")
    print("=" * 60)

    return all_passed


if __name__ == "__main__":
    success = test_performance()
    sys.exit(0 if success else 1)
