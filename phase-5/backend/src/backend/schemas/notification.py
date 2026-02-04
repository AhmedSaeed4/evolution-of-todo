"""Pydantic schemas for notification requests and responses"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID


class NotificationResponse(BaseModel):
    """Standard notification response with camelCase field names for frontend"""
    id: UUID
    userId: str = Field(serialization_alias="userId", validation_alias="user_id")
    message: str
    taskId: Optional[UUID] = Field(None, serialization_alias="taskId", validation_alias="task_id")
    read: bool
    createdAt: datetime = Field(serialization_alias="createdAt", validation_alias="created_at")

    class Config:
        """Pydantic configuration"""
        from_attributes = True
        populate_by_name = True


class NotificationListResponse(BaseModel):
    """List of notifications"""
    notifications: list[NotificationResponse]
    unreadCount: int = Field(serialization_alias="unreadCount", validation_alias="unread_count")

    class Config:
        """Pydantic configuration"""
        from_attributes = True
        populate_by_name = True
