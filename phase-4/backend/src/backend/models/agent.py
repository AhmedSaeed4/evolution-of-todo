"""Agent SQLModel definition"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, Column
from sqlalchemy import String, DateTime, JSON


class AgentType(str, Enum):
    """Agent types"""
    ORCHESTRATOR = "orchestrator"
    URDU = "urdu"


class Agent(SQLModel, table=True):
    """AI Agent entity - stored in agents table"""
    __tablename__ = "agents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(max_length=50, unique=True)
    type: str = Field(sa_column=Column(String, nullable=False))  # AgentType values
    description: Optional[str] = Field(default=None)
    model: str = Field(max_length=100, default="mimo-v2-flash")
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime, nullable=False))

    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class ChatSession(SQLModel, table=True):
    """User-agent conversation session - stored in chat_sessions table"""
    __tablename__ = "chat_sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(sa_column=Column("userId", String, nullable=False))
    started_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column("startedAt", DateTime, nullable=False))
    ended_at: Optional[datetime] = Field(default=None, sa_column=Column("endedAt", DateTime, nullable=True))
    status: str = Field(default="active", sa_column=Column(String, nullable=False))  # active, completed, failed

    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
        }


class ChatMessage(SQLModel, table=True):
    """Single message in conversation - stored in chat_messages table"""
    __tablename__ = "chat_messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chat_sessions.id")
    user_id: str = Field(sa_column=Column("userId", String, nullable=False))
    content: str = Field(max_length=10000)
    direction: str = Field(sa_column=Column(String, nullable=False))  # user_to_agent, agent_to_user
    agent_source: Optional[str] = Field(default=None, sa_column=Column(String, nullable=True))  # orchestrator, urdu
    timestamp: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime, nullable=False))
    metadata_json: Optional[dict] = Field(default=None, sa_column=Column("metadata", JSON, nullable=True))

    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
            dict: lambda v: v,
        }


# Update __init__.py to include new models
__all__ = ["Agent", "ChatSession", "ChatMessage"]