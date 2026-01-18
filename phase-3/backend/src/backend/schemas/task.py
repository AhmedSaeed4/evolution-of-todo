"""Pydantic schemas for task requests and responses"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Literal
from uuid import UUID


# Use Literal types for validation instead of Enums
PriorityType = Literal["low", "medium", "high"]
CategoryType = Literal["work", "personal", "home", "other"]
StatusType = Literal["pending", "completed"]


# Request Schemas

class TaskCreate(BaseModel):
    """POST /api/{user_id}/tasks - Create task"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: PriorityType
    category: CategoryType
    dueDate: Optional[datetime] = Field(None)

    @field_validator('title')
    def title_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
    
    @field_validator('priority', mode='before')
    def convert_priority(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v
    
    @field_validator('category', mode='before')
    def convert_category(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v
    
    @field_validator('dueDate', mode='before')
    def convert_due_date(cls, v):
        # Handle empty string from frontend
        if v == '' or v is None:
            return None
        return v
    
    class Config:
        populate_by_name = True


class TaskUpdate(BaseModel):
    """PUT /api/{user_id}/tasks/{task_id} - Update task"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[PriorityType] = None
    category: Optional[CategoryType] = None
    dueDate: Optional[datetime] = Field(None)

    @field_validator('title')
    def title_not_empty(cls, v):
        if v and not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip() if v else v
    
    @field_validator('priority', mode='before')
    def convert_priority(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v
    
    @field_validator('category', mode='before')
    def convert_category(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v
    
    @field_validator('dueDate', mode='before')
    def convert_due_date(cls, v):
        # Handle empty string from frontend
        if v == '' or v is None:
            return None
        return v
    
    class Config:
        populate_by_name = True


class TaskComplete(BaseModel):
    """PATCH /api/{user_id}/tasks/{task_id}/complete - Toggle completion"""
    # No fields needed - just toggle action
    pass


# Response Schemas

class TaskResponse(BaseModel):
    """Standard task response with camelCase field names for frontend"""
    id: UUID
    title: str
    description: Optional[str]
    priority: PriorityType
    category: CategoryType
    status: StatusType
    completed: bool
    dueDate: Optional[datetime] = Field(None, serialization_alias="dueDate", validation_alias="due_date")
    createdAt: datetime = Field(serialization_alias="createdAt", validation_alias="created_at")
    updatedAt: datetime = Field(serialization_alias="updatedAt", validation_alias="updated_at")
    userId: str = Field(serialization_alias="userId", validation_alias="user_id")

    class Config:
        """Pydantic configuration"""
        from_attributes = True
        populate_by_name = True


class StatsResponse(BaseModel):
    """GET /api/{user_id}/stats - Statistics response"""
    total: int
    pending: int
    completed: int

    class Config:
        """Pydantic configuration"""
        from_attributes = True