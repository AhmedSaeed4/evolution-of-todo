"""Audit Log SQLModel definition"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, Column
from sqlalchemy import String, DateTime, JSON


class AuditEventType(str, Enum):
    """Audit event types"""
    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"
    COMPLETED = "completed"


class AuditLog(SQLModel, table=True):
    """Audit log entity - complete audit trail of all operations"""
    __tablename__ = "audit_logs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    event_type: str = Field(max_length=50)  # "created", "updated", "deleted", "completed"
    entity_type: str = Field(default="task", max_length=50)  # "task" (extensible)
    entity_id: UUID = Field(foreign_key="tasks.id")
    user_id: str = Field(max_length=255)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: dict = Field(default={}, sa_column=Column("data", JSON))

    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }
