"""Migration: Create agent, chat_sessions, and chat_messages tables"""
from sqlmodel import SQLModel
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from backend.database import engine
from backend.models.agent import Agent, ChatSession, ChatMessage


def create_tables():
    """Create agent tables with all required indexes"""
    print("Creating agent tables...")

    # Create the tables
    SQLModel.metadata.create_all(engine)

    # Create indexes manually for better control
    from sqlalchemy import text

    with engine.connect() as conn:
        # Agent table indexes
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name)'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(type)'))

        # Chat session indexes
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions("userId")'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status)'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions("startedAt")'))

        # Chat message indexes
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id)'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages("userId")'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp)'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_messages_direction ON chat_messages(direction)'))
        conn.execute(text('CREATE INDEX IF NOT EXISTS idx_chat_messages_agent_source ON chat_messages(agent_source)'))

        conn.commit()

    print("✅ Agent tables and indexes created successfully")


def drop_tables():
    """Drop agent tables (for rollback)"""
    print("Dropping agent tables...")
    SQLModel.metadata.drop_all(engine)
    print("✅ Agent tables dropped")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Manage agent tables migration")
    parser.add_argument("--action", choices=["create", "drop"], default="create",
                       help="Action to perform")

    args = parser.parse_args()

    if args.action == "create":
        create_tables()
    elif args.action == "drop":
        drop_tables()