"""Database connection and session management"""
from sqlmodel import create_engine, Session
from sqlalchemy.pool import QueuePool, StaticPool
from typing import Generator
import os

from .config import settings


# Check if using SQLite (for testing)
is_sqlite = settings.database_url.startswith('sqlite://')

# Create database engine with appropriate pool class
if is_sqlite:
    # SQLite doesn't support connection pools, use StaticPool
    engine = create_engine(
        settings.database_url,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
        echo=settings.debug,
    )
else:
    # PostgreSQL with standard connection pool
    engine = create_engine(
        settings.database_url,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=settings.debug,
    )


def get_session() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get a database session.

    Yields:
        Session: SQLModel session for database operations
    """
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()