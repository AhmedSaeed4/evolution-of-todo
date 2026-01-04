# Task dataclass definition
# Task: T007 - Complete implementation per data-model.md

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Task:
    """Represents a single todo item in the system."""
    id: int              # Unique identifier (auto-incremented)
    title: str           # Task description (required, non-empty)
    is_complete: bool    # Completion status (default: False)
    created_at: datetime # Timestamp of creation