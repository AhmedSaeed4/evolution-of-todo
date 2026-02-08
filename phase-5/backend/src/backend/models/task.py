"""Task SQLModel definition"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, Column
from sqlalchemy import String, DateTime, Boolean, ARRAY, text as sql_text


class TaskPriority(str, Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskCategory(str, Enum):
    """Task categories"""
    WORK = "work"
    PERSONAL = "personal"
    HOME = "home"
    OTHER = "other"


class TaskStatus(str, Enum):
    """Task completion status"""
    PENDING = "pending"
    COMPLETED = "completed"


class Task(SQLModel, table=True):
    """Core task entity - stored in tasks table"""
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    # Use plain string fields for enum values to store lowercase
    priority: str = Field(sa_column=Column(String, nullable=False))
    category: str = Field(sa_column=Column(String, nullable=False))
    status: str = Field(default="pending", sa_column=Column(String, nullable=False))
    completed: bool = Field(default=False)
    due_date: Optional[datetime] = Field(default=None, sa_column=Column("dueDate", DateTime, nullable=True))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column("createdAt", DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column("updatedAt", DateTime, nullable=False))
    user_id: str = Field(sa_column=Column("userId", String, nullable=False))

    # NEW: Recurring task fields
    recurring_rule: Optional[str] = Field(default=None)  # "daily", "weekly", "monthly", "yearly"
    recurring_end_date: Optional[datetime] = Field(default=None)
    parent_task_id: Optional[UUID] = Field(default=None, foreign_key="tasks.id")

    # NEW: Reminder fields
    reminder_at: Optional[datetime] = Field(default=None)
    reminder_sent: bool = Field(default=False)

    # NEW: Tags (PostgreSQL array type)
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))

    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }