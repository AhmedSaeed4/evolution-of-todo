# Data Model: ChatKit Integration

## Entity Definitions

### ChatSession

Represents an ongoing conversation thread stored in Neon database.

**Fields**:
- `session_id` (UUID, Primary Key): Unique identifier for the chat session
- `user_id` (UUID, Foreign Key): References authenticated user (enforces multi-tenancy)
- `title` (VARCHAR(255), Not Null): Auto-generated title from first message or custom name
- `created_at` (TIMESTAMP WITH TIME ZONE, Default NOW()): Session creation timestamp
- `updated_at` (TIMESTAMP WITH TIME ZONE, Default NOW()): Last activity timestamp
- `metadata` (JSONB, Default '{}'): Flexible storage for session configuration

**Validation Rules**:
- `session_id`: Auto-generated UUID, never null
- `user_id`: Must reference existing user in "user" table, required
- `title`: Max 255 characters, auto-generated if not provided
- `created_at`: Auto-set on creation, immutable
- `updated_at`: Auto-updated on any message activity
- `metadata`: JSON object, validated schema for future extensibility

**State Transitions**:
- `ACTIVE`: Session with recent activity (last 30 days)
- `ARCHIVED`: Session marked inactive by user or system
- `DELETED`: Soft delete via user_id scoping (actual deletion via cascade)

**Relationships**:
- One-to-Many: ChatSession → ChatMessages (1 session has N messages)
- Many-to-One: ChatSession → User (N sessions belong to 1 user)

**Indexes**:
- Primary: `session_id` (auto-created)
- Foreign: `user_id` for user-scoped queries
- Sort: `updated_at DESC` for recent sessions first

---

### ChatMessage

Represents individual messages within a chat session.

**Fields**:
- `message_id` (UUID, Primary Key): Unique identifier for the message
- `session_id` (UUID, Foreign Key): References parent chat session
- `user_id` (UUID, Foreign Key): References authenticated user (enforces multi-tenancy)
- `content` (TEXT, Not Null): Message content (user input or agent response)
- `sender_type` (VARCHAR(50), Not Null): Type of sender - 'user', 'assistant', 'tool'
- `sender_name` (VARCHAR(100)): Optional name - 'Orchestrator', 'Urdu Specialist', 'create_task', etc.
- `timestamp` (TIMESTAMP WITH TIME ZONE, Default NOW()): When message was created
- `metadata` (JSONB, Default '{}'): Tool calls, errors, response times, etc.

**Validation Rules**:
- `message_id`: Auto-generated UUID, never null
- `session_id`: Must reference existing ChatSession, required
- `user_id`: Must reference existing user, required, must match session's user_id
- `content`: Non-empty text, max length 100,000 characters (configurable)
- `sender_type`: Enum values only ['user', 'assistant', 'tool']
- `sender_name`: Optional, max 100 characters
- `timestamp`: Auto-set on creation, immutable
- `metadata`: JSON object with structured data for tool calls, errors, etc.

**Sender Type Values**:
- `user`: Human user message
- `assistant`: AI agent response
- `tool`: MCP tool execution result/intermediate step

**Metadata Schema** (for tool calls):
```json
{
  "tool_call": {
    "name": "create_task",
    "arguments": {...},
    "result": {...},
    "execution_time_ms": 150
  },
  "error": null,
  "response_time_ms": 450
}
```

**Relationships**:
- Many-to-One: ChatMessage → ChatSession (N messages belong to 1 session)
- Many-to-One: ChatMessage → User (N messages belong to 1 user)

**Indexes**:
- Primary: `session_id` (auto-created)
- Foreign: `user_id` for user-scoped queries
- Foreign: `session_id` for session-scoped queries
- Sort: `timestamp DESC` for message ordering

---

### User (Existing Table - Extended)

**Existing Fields** (from Better Auth):
- `id` (UUID, Primary Key)
- `email` (VARCHAR)
- `name` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**New Relationships**:
- One-to-Many: User → ChatSessions (1 user has N sessions)
- One-to-Many: User → ChatMessages (1 user has N messages)

**Validation Extension**:
- All new chat queries must include `WHERE user_id = :current_user_id`
- Cascade delete: When user is deleted, all associated sessions and messages are deleted

---

## Database Schema (SQL)

### Table Creation Order

1. **Users Table** (existing - no changes)
2. **Chat Sessions Table** (new)
3. **Chat Messages Table** (new)

### SQL Definitions

```sql
-- Chat Sessions Table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_type VARCHAR(50) NOT NULL,
    sender_name VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for Performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Constraints for Data Integrity
ALTER TABLE chat_messages
ADD CONSTRAINT chk_sender_type
CHECK (sender_type IN ('user', 'assistant', 'tool'));

-- Trigger for updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### SQLModel Definitions (Python)

```python
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from sqlmodel import Field, SQLModel, Relationship
from pydantic import validator


class SenderType(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


class ChatSession(SQLModel, table=True):
    """Represents a chat session thread"""

    session_id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    title: str = Field(max_length=255, default="New Chat")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata_: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"name": "metadata"})

    # Relationships
    messages: list["ChatMessage"] = Relationship(back_populates="session", cascade_delete=True)
    user: "User" = Relationship(back_populates="chat_sessions")

    @validator("title")
    def validate_title(cls, v):
        if not v or not v.strip():
            return "New Chat"
        return v.strip()[:255]


class ChatMessage(SQLModel, table=True):
    """Represents an individual chat message"""

    message_id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="chat_sessions.session_id", nullable=False)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    content: str = Field(nullable=False)
    sender_type: SenderType = Field(nullable=False)
    sender_name: Optional[str] = Field(max_length=100, nullable=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata_: Dict[str, Any] = Field(default_factory=dict, sa_column_kwargs={"name": "metadata"})

    # Relationships
    session: ChatSession = Relationship(back_populates="messages")
    user: "User" = Relationship(back_populates="chat_messages")

    @validator("content")
    def validate_content(cls, v):
        if not v or not v.strip():
            raise ValueError("Content cannot be empty")
        if len(v) > 100000:
            raise ValueError("Content exceeds maximum length of 100,000 characters")
        return v.strip()


# Extended User model with chat relationships
class User(SQLModel, table=True):
    """Extended User model with chat relationships"""
    __tablename__ = "user"  # Match existing Better Auth table name

    # Existing fields from Better Auth (simplified)
    id: UUID = Field(primary_key=True)
    email: str = Field(nullable=False)
    name: Optional[str] = Field(nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # New relationships
    chat_sessions: list[ChatSession] = Relationship(back_populates="user", cascade_delete=True)
    chat_messages: list[ChatMessage] = Relationship(back_populates="user", cascade_delete=True)
```

---

## API Contracts

### ChatKit Session Endpoints

#### 1. Create ChatKit Session

**Endpoint**: `POST /api/chatkit/session`
**Purpose**: Create new OpenAI ChatKit session and return client secret for frontend authentication

**Request**:
```http
POST /api/chatkit/session
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**: None

**Response (Success - 200)**:
```json
{
  "client_secret": "sk-chatkit-...",
  "session_id": "chatkit-session-uuid",
  "expires_at": "2026-01-17T10:30:00Z"
}
```

**Response (Error - 401)**:
```json
{
  "detail": "Invalid or expired JWT token"
}
```

**Response (Error - 500)**:
```json
{
  "detail": "OPENAI_API_KEY is required for ChatKit session management. Even when using other AI providers (like Xiaomi), ChatKit requires an OpenAI API key for authentication. Get one at https://platform.openai.com/api-keys"
}
```

**Business Logic**:
1. Validate JWT token using existing Better Auth middleware
2. Extract user_id from validated token
3. Initialize OpenAI client with OPENAI_API_KEY
4. Create ChatKit session via OpenAI API
5. Return client_secret and session_id to frontend
6. Store session metadata in database for user isolation

**User Isolation**: ✅ Enforced via JWT validation

---

#### 2. Refresh ChatKit Session

**Endpoint**: `POST /api/chatkit/refresh`
**Purpose**: Refresh expired ChatKit session token

**Request**:
```http
POST /api/chatkit/refresh
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**: None

**Response (Success - 200)**:
```json
{
  "client_secret": "sk-chatkit-refreshed-...",
  "session_id": "chatkit-session-uuid",
  "expires_at": "2026-01-17T11:30:00Z"
}
```

**Response (Error - 401)**:
```json
{
  "detail": "Invalid or expired JWT token"
}
```

**Response (Error - 404)**:
```json
{
  "detail": "ChatKit session not found or expired"
}
```

**Business Logic**:
1. Validate JWT token using existing Better Auth middleware
2. Extract user_id from validated token
3. Check if user has existing ChatKit session
4. Request token refresh from OpenAI API
5. Return new client_secret and updated expiration

**User Isolation**: ✅ Enforced via JWT validation and session lookup

---

#### 3. ChatKit Health Check

**Endpoint**: `GET /api/chatkit/health`
**Purpose**: Validate ChatKit configuration and endpoint availability

**Request**:
```http
GET /api/chatkit/health
```

**Request Body**: None

**Response (Success - 200)**:
```json
{
  "openai_key_configured": true,
  "session_endpoint_available": true,
  "store_implemented": true,
  "timestamp": "2026-01-16T10:30:00Z"
}
```

**Response (Error - 500)**:
```json
{
  "openai_key_configured": false,
  "session_endpoint_available": true,
  "store_implemented": true,
  "timestamp": "2026-01-16T10:30:00Z"
}
```

**Business Logic**:
1. Check if OPENAI_API_KEY environment variable exists
2. Verify OpenAI client can be initialized
3. Check if ChatKit Store methods are implemented
4. Return configuration status

**User Isolation**: ❌ Not required (health check is public)

---

### ChatKit Store Methods (Internal)

These methods are called by ChatKit backend framework, not directly by frontend.

#### 1. Thread Operations

**Generate Thread ID**
```python
async def generate_thread_id(self, context: dict) -> str
```
- Input: context with user_id
- Output: Unique thread_id (UUID string)
- User Isolation: ✅ Uses user_id from context

**Load Thread**
```python
async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata
```
- Input: thread_id, context with user_id
- Output: Thread metadata (title, timestamps, etc.)
- User Isolation: ✅ Queries with `WHERE session_id = :thread_id AND user_id = :user_id`

**Save Thread**
```python
async def save_thread(self, thread: ThreadMetadata, context: dict) -> None
```
- Input: thread metadata, context with user_id
- Output: None (creates/updates database record)
- User Isolation: ✅ Sets user_id from context on creation

**Load Threads (List)**
```python
async def load_threads(self, limit: int, after: str | None, order: str, context: dict) -> Page[ThreadMetadata]
```
- Input: pagination params, context with user_id
- Output: Page of thread metadata
- User Isolation: ✅ Queries with `WHERE user_id = :user_id`

**Delete Thread**
```python
async def delete_thread(self, thread_id: str, context: dict) -> None
```
- Input: thread_id, context with user_id
- Output: None (soft delete via user_id scoping)
- User Isolation: ✅ Verifies ownership before deletion

#### 2. Item (Message) Operations

**Load Thread Items**
```python
async def load_thread_items(self, thread_id: str, after: str | None, limit: int, order: str, context: dict) -> Page[ThreadItem]
```
- Input: thread_id, pagination params, context with user_id
- Output: Page of messages in thread
- User Isolation: ✅ Queries with `WHERE session_id = :thread_id AND user_id = :user_id`

**Add Thread Item**
```python
async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
```
- Input: thread_id, message item, context with user_id
- Output: None (creates message in database)
- User Isolation: ✅ Sets user_id from context, validates thread ownership

**Save Item**
```python
async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
```
- Input: thread_id, message item, context with user_id
- Output: None (updates existing message)
- User Isolation: ✅ Verifies ownership before update

**Load Item**
```python
async def load_item(self, thread_id: str, item_id: str, context: dict) -> ThreadItem
```
- Input: thread_id, item_id, context with user_id
- Output: Single message
- User Isolation: ✅ Queries with `WHERE message_id = :item_id AND user_id = :user_id`

**Delete Thread Item**
```python
async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None
```
- Input: thread_id, item_id, context with user_id
- Output: None (deletes message)
- User Isolation: ✅ Verifies ownership before deletion

#### 3. Attachment Operations

**Save Attachment**
```python
async def save_attachment(self, attachment: Any, context: dict) -> None
```
- Input: attachment data, context with user_id
- Output: None (stores attachment metadata)
- User Isolation: ✅ Sets user_id from context

**Load Attachment**
```python
async def load_attachment(self, attachment_id: str, context: dict) -> Any
```
- Input: attachment_id, context with user_id
- Output: Attachment data
- User Isolation: ✅ Queries with `WHERE attachment_id = :attachment_id AND user_id = :user_id`

**Delete Attachment**
```python
async def delete_attachment(self, attachment_id: str, context: dict) -> None
```
- Input: attachment_id, context with user_id
- Output: None (deletes attachment)
- User Isolation: ✅ Verifies ownership before deletion

---

## Integration Points

### Frontend → Backend Flow

1. **User Authentication**: Better Auth provides JWT token
2. **Session Creation**: Frontend calls `/api/chatkit/session` with JWT
3. **ChatKit Initialization**: Frontend uses returned client_secret to initialize ChatKit
4. **Message Sending**: ChatKit sends messages directly to OpenAI
5. **Backend Processing**: OpenAI calls ChatKitServer.respond() method
6. **History Loading**: ChatKitServer uses Store methods to load conversation history
7. **Tool Execution**: MCP tools execute with user isolation via context

### Backend → Database Flow

1. **Session Creation**: Store.save_thread() creates chat_sessions record
2. **Message Storage**: Store.add_thread_item() creates chat_messages record
3. **History Retrieval**: Store.load_thread_items() queries messages with user isolation
4. **User Isolation**: All queries include `WHERE user_id = :user_id`

### Security Validation Points

1. **JWT Validation**: Every API request validates JWT token
2. **User Context**: Every Store method receives user_id in context
3. **Query Scoping**: All database queries include user_id filter
4. **Session Ownership**: Thread operations verify user owns session before modification

---

## Data Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   Database      │
│   (ChatKit)     │    │   (FastAPI)      │    │   (Neon PG)     │
└────────┬────────┘    └────────┬─────────┘    └────────┬────────┘
         │                      │                       │
         │ 1. JWT Auth          │                       │
         │─────────────────────>│                       │
         │                      │                       │
         │ 2. POST /api/chatkit/session                │
         │─────────────────────>│                       │
         │                      │ 3. Validate JWT       │
         │                      │──────────────────────>│
         │                      │                       │
         │                      │ 4. Create OpenAI Session
         │                      │──────────────────────>│ (OpenAI API)
         │                      │                       │
         │ 5. Return client_secret
         │<─────────────────────│                       │
         │                      │                       │
         │ 6. Initialize ChatKit
         │──────────────────────│                       │
         │                      │                       │
         │ 7. User sends message
         │──────────────────────>│                       │
         │                      │ 8. Call ChatKitServer.respond()
         │                      │──────────────────────>│
         │                      │                       │
         │                      │ 9. Load history       │
         │                      │──────────────────────>│
         │                      │                       │
         │                      │ 10. Execute MCP tools │
         │                      │──────────────────────>│
         │                      │                       │
         │                      │ 11. Store messages    │
         │                      │──────────────────────>│
         │                      │                       │
         │ 12. Stream response  │                       │
         │<─────────────────────│                       │
         │                      │                       │
```

---

## Constitution Compliance

### ✅ All Requirements Met

- **I. Universal Logic Decoupling**: ChatKit Store decouples persistence from UI
- **II. AI-Native Interoperability**: MCP tools maintain strict typing, exposed via ChatKit
- **III. Strict Statelessness**: All state persisted to PostgreSQL, no in-memory storage
- **IV. Event-Driven Decoupling**: SSE streaming for async responses
- **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id via foreign keys
- **VI. Technology Stack**: All libraries authorized (OpenAI ChatKit, Python SDK)
- **VII. Security**: JWT validation on all endpoints, input validation via Pydantic
- **VIII. Observability**: Structured logging for all chat operations

### User Isolation Validation

Every database operation includes user_id filtering:
- `SELECT * FROM chat_sessions WHERE user_id = :user_id`
- `SELECT * FROM chat_messages WHERE session_id = :session_id AND user_id = :user_id`
- `INSERT INTO chat_messages (...) VALUES (...)` with user_id from context
- `DELETE FROM chat_sessions WHERE session_id = :session_id AND user_id = :user_id`

### Performance Considerations

- **Indexes**: All foreign keys and sort columns indexed
- **Query Optimization**: User_id first in composite indexes
- **Connection Pooling**: Reuse existing Neon PostgreSQL connections
- **Pagination**: All list operations use cursor-based pagination for performance

---

## Next Steps

### Phase 2: Implementation
1. Create database migrations for new tables
2. Implement ChatKit Store with all 14 methods
3. Create ChatKit session endpoints with OpenAI integration
4. Add environment validation and error handling
5. Implement frontend ChatKit integration

### Phase 3: Testing
1. Test user isolation in all Store methods
2. Validate JWT authentication flow
3. Test error scenarios (missing API key, invalid tokens)
4. Performance testing for query optimization

### Phase 4: Deployment
1. Apply database migrations
2. Deploy backend ChatKit endpoints
3. Deploy frontend ChatKit integration
4. Monitor performance and error rates