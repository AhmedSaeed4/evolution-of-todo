"""Notification SQLModel definition"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Column, ForeignKey
from sqlalchemy import String, DateTime


class Notification(SQLModel, table=True):
    """Notification entity - user notifications for task reminders"""
    __tablename__ = "notifications"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(max_length=255)
    message: str = Field()
    task_id: Optional[UUID] = Field(default=None, foreign_key="tasks.id")
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }
