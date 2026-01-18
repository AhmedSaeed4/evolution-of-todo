"""
ChatKit Store Interface Definition

This file defines the interface that ChatKit expects from a custom store implementation.
All 14 required methods must be implemented by ChatKitStore class.

Reference: https://platform.openai.com/docs/chatkit/store-interface
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, TypeVar, Generic
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

# Type variables for generic store
T = TypeVar('T')  # Generic type for store items


class ThreadMetadata(BaseModel):
    """Metadata for a chat thread"""
    id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = {}


class ThreadItem(BaseModel):
    """Represents a single message/item in a thread"""
    id: str
    thread_id: str
    content: str
    sender_type: str  # 'user', 'assistant', 'tool'
    sender_name: Optional[str] = None
    created_at: datetime
    metadata: Dict[str, Any] = {}


class Page(BaseModel, Generic[T]):
    """Paginated response container"""
    data: List[T]
    has_more: bool
    next_cursor: Optional[str] = None


class Store(ABC, Generic[T]):
    """
    Abstract base class that ChatKit expects all stores to implement.

    This interface is used by ChatKit to persist threads and messages.
    Your implementation must handle user isolation via the context parameter.
    """

    # ID Generation (2 methods)
    @abstractmethod
    async def generate_thread_id(self, context: Dict[str, Any]) -> str:
        """
        Generate a unique thread ID.

        Args:
            context: Contains user_id and other context information

        Returns:
            Unique thread identifier (string)

        Note: For user isolation, include user_id in generated ID or store it separately
        """
        pass

    @abstractmethod
    async def generate_item_id(self, thread_id: str, context: Dict[str, Any]) -> str:
        """
        Generate a unique item ID for a thread.

        Args:
            thread_id: Parent thread identifier
            context: Contains user_id and other context information

        Returns:
            Unique item identifier (string)
        """
        pass

    # Thread Operations (5 methods)
    @abstractmethod
    async def load_thread(self, thread_id: str, context: Dict[str, Any]) -> ThreadMetadata:
        """
        Load thread metadata by ID.

        Args:
            thread_id: Thread identifier to load
            context: Contains user_id for isolation

        Returns:
            ThreadMetadata object

        Raises:
            KeyError: If thread not found or user doesn't have access
        """
        pass

    @abstractmethod
    async def save_thread(self, thread: ThreadMetadata, context: Dict[str, Any]) -> None:
        """
        Save or update thread metadata.

        Args:
            thread: ThreadMetadata object to save
            context: Contains user_id for isolation

        Note: Should create if not exists, update if exists
        """
        pass

    @abstractmethod
    async def load_threads(
        self,
        limit: int,
        after: Optional[str],
        order: str,
        context: Dict[str, Any]
    ) -> Page[ThreadMetadata]:
        """
        Load paginated list of threads for user.

        Args:
            limit: Maximum number of threads to return
            after: Cursor for pagination (exclusive)
            order: Sort order ('asc' or 'desc')
            context: Contains user_id for isolation

        Returns:
            Page of ThreadMetadata objects
        """
        pass

    @abstractmethod
    async def delete_thread(self, thread_id: str, context: Dict[str, Any]) -> None:
        """
        Delete a thread and all its items.

        Args:
            thread_id: Thread identifier to delete
            context: Contains user_id for isolation

        Raises:
            KeyError: If thread not found or user doesn't have access
        """
        pass

    # Item Operations (6 methods)
    @abstractmethod
    async def load_thread_items(
        self,
        thread_id: str,
        after: Optional[str],
        limit: int,
        order: str,
        context: Dict[str, Any]
    ) -> Page[ThreadItem]:
        """
        Load paginated list of items in a thread.

        Args:
            thread_id: Thread identifier
            after: Cursor for pagination (exclusive)
            limit: Maximum number of items to return
            order: Sort order ('asc' or 'desc')
            context: Contains user_id for isolation

        Returns:
            Page of ThreadItem objects
        """
        pass

    @abstractmethod
    async def add_thread_item(
        self,
        thread_id: str,
        item: ThreadItem,
        context: Dict[str, Any]
    ) -> None:
        """
        Add a new item to a thread.

        Args:
            thread_id: Thread identifier
            item: ThreadItem object to add
            context: Contains user_id for isolation

        Raises:
            KeyError: If thread doesn't exist or user doesn't have access
        """
        pass

    @abstractmethod
    async def save_item(
        self,
        thread_id: str,
        item: ThreadItem,
        context: Dict[str, Any]
    ) -> None:
        """
        Save or update an item in a thread.

        Args:
            thread_id: Thread identifier
            item: ThreadItem object to save
            context: Contains user_id for isolation

        Note: Should create if not exists, update if exists
        """
        pass

    @abstractmethod
    async def load_item(
        self,
        thread_id: str,
        item_id: str,
        context: Dict[str, Any]
    ) -> ThreadItem:
        """
        Load a specific item from a thread.

        Args:
            thread_id: Thread identifier
            item_id: Item identifier
            context: Contains user_id for isolation

        Returns:
            ThreadItem object

        Raises:
            KeyError: If item not found or user doesn't have access
        """
        pass

    @abstractmethod
    async def delete_thread_item(
        self,
        thread_id: str,
        item_id: str,
        context: Dict[str, Any]
    ) -> None:
        """
        Delete an item from a thread.

        Args:
            thread_id: Thread identifier
            item_id: Item identifier to delete
            context: Contains user_id for isolation

        Raises:
            KeyError: If item not found or user doesn't have access
        """
        pass

    # Attachment Operations (3 methods)
    @abstractmethod
    async def save_attachment(self, attachment: Any, context: Dict[str, Any]) -> None:
        """
        Save an attachment.

        Args:
            attachment: Attachment data (type depends on implementation)
            context: Contains user_id for isolation

        Note: Attachments could be files, images, or other binary data
        """
        pass

    @abstractmethod
    async def load_attachment(self, attachment_id: str, context: Dict[str, Any]) -> Any:
        """
        Load an attachment by ID.

        Args:
            attachment_id: Attachment identifier
            context: Contains user_id for isolation

        Returns:
            Attachment data

        Raises:
            KeyError: If attachment not found or user doesn't have access
        """
        pass

    @abstractmethod
    async def delete_attachment(self, attachment_id: str, context: Dict[str, Any]) -> None:
        """
        Delete an attachment.

        Args:
            attachment_id: Attachment identifier to delete
            context: Contains user_id for isolation

        Raises:
            KeyError: If attachment not found or user doesn't have access
        """
        pass


# Example context structure for user isolation
EXAMPLE_CONTEXT = {
    "user": {
        "id": "user-uuid-12345",
        "email": "user@example.com",
        "name": "User Name"
    },
    "session": {
        "id": "session-uuid-67890",
        "ip": "192.168.1.1",
        "user_agent": "Mozilla/5.0..."
    },
    "request": {
        "timestamp": "2026-01-16T10:30:00Z",
        "id": "request-uuid-abcde"
    }
}


class ChatKitStore(Store[dict]):
    """
    Concrete implementation of ChatKit Store interface.

    This class must implement all 14 methods defined in the Store interface.
    Each method receives a context parameter containing user_id for isolation.

    Example usage:
        store = ChatKitStore()
        context = {"user": {"id": user_id}}

        # Create thread
        thread_id = await store.generate_thread_id(context)
        thread = ThreadMetadata(
            id=thread_id,
            title="New Chat",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        await store.save_thread(thread, context)

        # Load threads for user
        page = await store.load_threads(limit=50, after=None, order="desc", context=context)
    """

    def __init__(self, db_session=None):
        """
        Initialize store with database session.

        Args:
            db_session: Database session/connection (from existing Neon PostgreSQL)
        """
        self.db = db_session
        # Will be connected to existing Neon PostgreSQL from backend

    # ID Generation (2 methods)
    async def generate_thread_id(self, context: Dict[str, Any]) -> str:
        """Generate unique thread ID using UUID"""
        user_id = context["user"]["id"]
        # Include user_id prefix for easier debugging/tracing
        return f"{user_id}-{UUID().hex}"

    async def generate_item_id(self, thread_id: str, context: Dict[str, Any]) -> str:
        """Generate unique item ID using UUID"""
        user_id = context["user"]["id"]
        return f"{user_id}-{UUID().hex}"

    # Thread Operations (5 methods)
    async def load_thread(self, thread_id: str, context: Dict[str, Any]) -> ThreadMetadata:
        """Load thread with user isolation"""
        user_id = context["user"]["id"]
        # SQL: SELECT * FROM chat_sessions WHERE session_id = :thread_id AND user_id = :user_id
        # Implementation will use existing Neon PostgreSQL connection
        pass

    async def save_thread(self, thread: ThreadMetadata, context: Dict[str, Any]) -> None:
        """Save thread with user isolation"""
        user_id = context["user"]["id"]
        # SQL: INSERT/UPDATE chat_sessions SET ... WHERE session_id = :thread_id AND user_id = :user_id
        pass

    async def load_threads(
        self,
        limit: int,
        after: Optional[str],
        order: str,
        context: Dict[str, Any]
    ) -> Page[ThreadMetadata]:
        """Load threads list with user isolation and pagination"""
        user_id = context["user"]["id"]
        # SQL: SELECT * FROM chat_sessions WHERE user_id = :user_id ORDER BY updated_at DESC LIMIT :limit
        pass

    async def delete_thread(self, thread_id: str, context: Dict[str, Any]) -> None:
        """Delete thread with user isolation verification"""
        user_id = context["user"]["id"]
        # SQL: DELETE FROM chat_sessions WHERE session_id = :thread_id AND user_id = :user_id
        pass

    # Item Operations (6 methods)
    async def load_thread_items(
        self,
        thread_id: str,
        after: Optional[str],
        limit: int,
        order: str,
        context: Dict[str, Any]
    ) -> Page[ThreadItem]:
        """Load thread items with user isolation"""
        user_id = context["user"]["id"]
        # SQL: SELECT * FROM chat_messages
        #      WHERE session_id = :thread_id AND user_id = :user_id
        #      ORDER BY timestamp DESC LIMIT :limit
        pass

    async def add_thread_item(
        self,
        thread_id: str,
        item: ThreadItem,
        context: Dict[str, Any]
    ) -> None:
        """Add thread item with user isolation"""
        user_id = context["user"]["id"]
        # Verify thread ownership first
        # SQL: INSERT INTO chat_messages (message_id, session_id, user_id, ...) VALUES (...)
        pass

    async def save_item(
        self,
        thread_id: str,
        item: ThreadItem,
        context: Dict[str, Any]
    ) -> None:
        """Save thread item with user isolation"""
        user_id = context["user"]["id"]
        # SQL: UPDATE chat_messages SET ... WHERE message_id = :item_id AND user_id = :user_id
        pass

    async def load_item(
        self,
        thread_id: str,
        item_id: str,
        context: Dict[str, Any]
    ) -> ThreadItem:
        """Load specific item with user isolation"""
        user_id = context["user"]["id"]
        # SQL: SELECT * FROM chat_messages
        #      WHERE message_id = :item_id AND session_id = :thread_id AND user_id = :user_id
        pass

    async def delete_thread_item(
        self,
        thread_id: str,
        item_id: str,
        context: Dict[str, Any]
    ) -> None:
        """Delete thread item with user isolation"""
        user_id = context["user"]["id"]
        # SQL: DELETE FROM chat_messages
        #      WHERE message_id = :item_id AND session_id = :thread_id AND user_id = :user_id
        pass

    # Attachment Operations (3 methods)
    async def save_attachment(self, attachment: Any, context: Dict[str, Any]) -> None:
        """Save attachment with user isolation"""
        user_id = context["user"]["id"]
        # Implementation depends on attachment storage strategy
        # Could store in database or external storage (S3, etc.)
        pass

    async def load_attachment(self, attachment_id: str, context: Dict[str, Any]) -> Any:
        """Load attachment with user isolation"""
        user_id = context["user"]["id"]
        # Retrieve attachment data
        pass

    async def delete_attachment(self, attachment_id: str, context: Dict[str, Any]) -> None:
        """Delete attachment with user isolation"""
        user_id = context["user"]["id"]
        # Remove attachment data
        pass


# Usage Example
async def example_usage():
    """Example of how ChatKit uses the store"""

    # Initialize store
    store = ChatKitStore()

    # Context with user isolation
    context = {
        "user": {
            "id": "user-uuid-12345",
            "email": "user@example.com"
        }
    }

    # ChatKit calls these methods automatically:

    # 1. Generate thread ID for new conversation
    thread_id = await store.generate_thread_id(context)

    # 2. Save initial thread metadata
    thread = ThreadMetadata(
        id=thread_id,
        title="New Chat",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await store.save_thread(thread, context)

    # 3. Load user's threads (for thread list UI)
    threads_page = await store.load_threads(
        limit=50,
        after=None,
        order="desc",
        context=context
    )

    # 4. Load messages in a thread
    items_page = await store.load_thread_items(
        thread_id=thread_id,
        after=None,
        limit=100,
        order="asc",
        context=context
    )

    # 5. Add user message
    user_message = ThreadItem(
        id=await store.generate_item_id(thread_id, context),
        thread_id=thread_id,
        content="Create a task for buying groceries",
        sender_type="user",
        created_at=datetime.utcnow()
    )
    await store.add_thread_item(thread_id, user_message, context)

    # 6. Add assistant response with tool call
    assistant_message = ThreadItem(
        id=await store.generate_item_id(thread_id, context),
        thread_id=thread_id,
        content="I'll create that task for you.",
        sender_type="assistant",
        created_at=datetime.utcnow(),
        metadata={
            "tool_calls": [{
                "name": "create_task",
                "arguments": {"title": "Buy groceries"},
                "result": {"task_id": "task-123", "status": "created"}
            }]
        }
    )
    await store.add_thread_item(thread_id, assistant_message, context)


# Error Handling Examples
class StoreError(Exception):
    """Base exception for store operations"""
    pass


class NotFoundError(StoreError):
    """Resource not found or access denied"""
    pass


class ValidationError(StoreError):
    """Invalid data provided"""
    pass


class PermissionError(StoreError):
    """User doesn't have permission to access resource"""
    pass