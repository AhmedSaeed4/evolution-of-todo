"""ChatKit data models for chat sessions and messages"""
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, Relationship


class SenderType(str, Enum):
    """Type of sender in a chat message"""
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class ChatSession(SQLModel, table=True):
    """Represents a chat session thread"""

    session_id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id", nullable=False)
    title: str = Field(max_length=255, default="New Chat")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata_: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"name": "metadata"})

    # Relationships
    messages: list["ChatMessage"] = Relationship(back_populates="session", cascade_delete=True)
    user: "User" = Relationship(back_populates="chat_sessions")

    def __init__(self, **data):
        super().__init__(**data)
        if not self.title or not self.title.strip():
            self.title = "New Chat"
        elif len(self.title) > 255:
            self.title = self.title.strip()[:255]


class ChatMessage(SQLModel, table=True):
    """Represents an individual chat message"""

    message_id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chat_sessions.session_id", nullable=False)
    user_id: str = Field(foreign_key="user.id", nullable=False)
    content: str = Field(nullable=False)
    sender_type: SenderType = Field(nullable=False)
    sender_name: Optional[str] = Field(max_length=100, nullable=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata_: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"name": "metadata"})

    # Relationships
    session: ChatSession = Relationship(back_populates="messages")
    user: "User" = Relationship(back_populates="chat_messages")

    def __init__(self, **data):
        super().__init__(**data)
        if not self.content or not self.content.strip():
            raise ValueError("Content cannot be empty")
        if len(self.content) > 100000:
            raise ValueError("Content exceeds maximum length of 100,000 characters")
        self.content = self.content.strip()


# Extended User model with chat relationships
class User(SQLModel, table=True):
    """Extended User model with chat relationships"""
    __tablename__ = "user"  # Match existing Better Auth table name

    # Existing fields from Better Auth (simplified)
    id: str = Field(primary_key=True)
    email: str = Field(nullable=False)
    name: Optional[str] = Field(nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # New relationships
    chat_sessions: list[ChatSession] = Relationship(back_populates="user", cascade_delete=True)
    chat_messages: list[ChatMessage] = Relationship(back_populates="user", cascade_delete=True)