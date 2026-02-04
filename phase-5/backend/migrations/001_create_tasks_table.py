"""Migration: Create tasks table"""
from sqlmodel import SQLModel
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from backend.database import engine
from backend.models.task import Task


def create_tables():
    """Create tasks table with all required indexes"""
    print("Creating tasks table...")

    # Create the table
    SQLModel.metadata.create_all(engine)

    # Create indexes manually for better control
    from sqlalchemy import text

    with engine.connect() as conn:
        # User ID index (essential for multi-tenancy)
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks("userId")'))

        # Status index (common filter)
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)'))

        # Priority index (common filter)
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)'))

        # Category index (common filter)
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category)'))

        # Due date index (for sorting by deadline)
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks("dueDate")'))

        conn.commit()

    print("✅ Tasks table and indexes created successfully")


def drop_tables():
    """Drop tasks table (for rollback)"""
    print("Dropping tasks table...")
    SQLModel.metadata.drop_all(engine)
    print("✅ Tasks table dropped")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Manage tasks table migration")
    parser.add_argument("--action", choices=["create", "drop"], default="create",
                       help="Action to perform")

    args = parser.parse_args()

    if args.action == "create":
        create_tables()
    elif args.action == "drop":
        drop_tables()