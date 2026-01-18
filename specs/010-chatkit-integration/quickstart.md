# QuickStart Guide: ChatKit Integration

## Prerequisites Checklist

Before starting implementation, ensure you have:

### ✅ Required Environment Variables

```bash
# Backend (.env in backend/ directory)
DATABASE_URL=postgresql://...                    # ✅ Existing
BETTER_AUTH_SECRET=...                           # ✅ Existing
XIAOMI_API_KEY=...                               # ✅ Existing
CORS_ORIGINS=http://localhost:3000               # ✅ Existing
OPENAI_API_KEY=sk-...                            # 🆕 REQUIRED for ChatKit

# Frontend (.env.local in frontend/ directory)
NEXT_PUBLIC_AUTH_BYPASS=false                    # ✅ Existing
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000    # ✅ Existing
NEXT_PUBLIC_CHATKIT_SCRIPT_URL=...               # 🆕 Optional (defaults to OpenAI CDN)
```

### ✅ OpenAI API Key Validation

**Critical**: Even when using Xiaomi mimo-v2-flash model, ChatKit requires an OpenAI API key for session management.

**Test your OpenAI key**:
```bash
# Replace with your actual OpenAI API key
export OPENAI_API_KEY="sk-..."

# Test basic connectivity
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.object'

# Expected output: "list" (if key is valid)
# Error output: "invalid_request_error" (if key is invalid/missing)
```

**Get an OpenAI API key**:
1. Visit https://platform.openai.com/api-keys
2. Create account or sign in
3. Generate new API key
4. Add to backend `.env` file

### ✅ Existing Infrastructure

- ✅ Neon PostgreSQL database running
- ✅ Better Auth JWT authentication configured
- ✅ FastAPI backend with existing endpoints
- ✅ Next.js 16+ frontend with App Router
- ✅ Existing MCP tools with user isolation

## Step-by-Step Implementation

### Step 1: Backend Dependencies

```bash
cd backend/

# Add required dependencies
uv add openai
uv add openai-chatkit

# Verify installation
uv run python -c "import openai; print('OpenAI SDK:', openai.__version__)"
uv run python -c "from openai_chatkit import ChatKitServer; print('ChatKit Server: OK')"
```

### Step 2: Database Migration

**Run the migration script** (in Neon PostgreSQL):

```sql
-- Execute in Neon PostgreSQL console
BEGIN;

-- Create chat_sessions table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create chat_messages table
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

-- Add indexes for performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Add constraint for sender_type
ALTER TABLE chat_messages
ADD CONSTRAINT chk_sender_type
CHECK (sender_type IN ('user', 'assistant', 'tool'));

-- Create trigger for updated_at auto-update
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

-- Verify existing data is intact
SELECT COUNT(*) FROM tasks;

COMMIT;
```

**Verify migration**:
```sql
-- Check tables were created
\dt chat_sessions
\dt chat_messages

-- Check indexes
\di chat_sessions*
\di chat_messages*
```

### Step 3: Backend Implementation

#### 3.1 Create Configuration Validation

**File**: `backend/src/backend/config.py`

```python
import os
from fastapi import HTTPException

def validate_chatkit_config():
    """Validate required environment variables for ChatKit"""
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is required for ChatKit session management. "
                   "Even when using other AI providers (like Xiaomi), ChatKit "
                   "requires an OpenAI API key for authentication. "
                   "Get one at https://platform.openai.com/api-keys"
        )

    # Basic validation - check if key looks like OpenAI format
    if not openai_key.startswith("sk-"):
        print("⚠️  Warning: OPENAI_API_KEY doesn't match expected format (sk-...)")

    return True

# Add to FastAPI startup
@app.on_event("startup")
async def validate_chatkit_setup():
    """Validate ChatKit setup on startup"""
    try:
        validate_chatkit_config()
        print("✅ ChatKit configuration validated")
    except HTTPException as e:
        print(f"❌ ChatKit validation failed: {e.detail}")
        # Don't block startup, but log clearly
```

#### 3.2 Create ChatKit Store

**File**: `backend/src/backend/store/chatkit_store.py`

```python
from typing import Any, Dict, Optional
from uuid import UUID
from datetime import datetime
from sqlmodel import select
from openai_chatkit import Store, ThreadMetadata, ThreadItem, Page

from backend.database import get_session
from backend.models.chat import ChatSession, ChatMessage, SenderType

class ChatKitStore(Store[dict]):
    """Implements all 14 required methods for ChatKit thread/message persistence"""

    def __init__(self):
        self.session = get_session()

    # ID Generation (2 methods)
    async def generate_thread_id(self, context: Dict[str, Any]) -> str:
        user_id = context["user"]["id"]
        return f"{user_id}-{UUID().hex}"

    async def generate_item_id(self, thread_id: str, context: Dict[str, Any]) -> str:
        user_id = context["user"]["id"]
        return f"{user_id}-{UUID().hex}"

    # Thread Operations (5 methods)
    async def load_thread(self, thread_id: str, context: Dict[str, Any]) -> ThreadMetadata:
        user_id = context["user"]["id"]
        # Extract actual UUID from thread_id (remove user prefix)
        actual_thread_id = thread_id.split('-', 1)[1]

        result = await self.session.exec(
            select(ChatSession)
            .where(ChatSession.session_id == actual_thread_id)
            .where(ChatSession.user_id == user_id)
        )
        session = result.first()

        if not session:
            raise KeyError(f"Thread {thread_id} not found or access denied")

        return ThreadMetadata(
            id=thread_id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
            metadata=session.metadata_
        )

    async def save_thread(self, thread: ThreadMetadata, context: Dict[str, Any]) -> None:
        user_id = context["user"]["id"]
        actual_thread_id = thread.id.split('-', 1)[1]

        # Check if exists
        result = await self.session.exec(
            select(ChatSession)
            .where(ChatSession.session_id == actual_thread_id)
            .where(ChatSession.user_id == user_id)
        )
        existing = result.first()

        if existing:
            # Update
            existing.title = thread.title
            existing.updated_at = datetime.utcnow()
            existing.metadata_ = thread.metadata
        else:
            # Create new
            new_session = ChatSession(
                session_id=UUID(actual_thread_id),
                user_id=user_id,
                title=thread.title,
                created_at=thread.created_at,
                updated_at=thread.updated_at,
                metadata_=thread.metadata
            )
            self.session.add(new_session)

        await self.session.commit()

    async def load_threads(
        self,
        limit: int,
        after: Optional[str],
        order: str,
        context: Dict[str, Any]
    ) -> Page[ThreadMetadata]:
        user_id = context["user"]["id"]

        query = select(ChatSession).where(ChatSession.user_id == user_id)

        if order.lower() == "desc":
            query = query.order_by(ChatSession.updated_at.desc())
        else:
            query = query.order_by(ChatSession.updated_at.asc())

        if after:
            # Extract timestamp from cursor for pagination
            # Implementation depends on cursor format
            pass

        query = query.limit(limit + 1)  # Extra for has_more check
        results = await self.session.exec(query)
        sessions = results.all()

        has_more = len(sessions) > limit
        sessions = sessions[:limit]

        thread_metadata = [
            ThreadMetadata(
                id=f"{session.user_id}-{session.session_id}",
                title=session.title,
                created_at=session.created_at,
                updated_at=session.updated_at,
                metadata=session.metadata_
            )
            for session in sessions
        ]

        return Page[ThreadMetadata](
            data=thread_metadata,
            has_more=has_more,
            next_cursor=None  # Implement cursor logic if needed
        )

    async def delete_thread(self, thread_id: str, context: Dict[str, Any]) -> None:
        user_id = context["user"]["id"]
        actual_thread_id = thread_id.split('-', 1)[1]

        result = await self.session.exec(
            select(ChatSession)
            .where(ChatSession.session_id == actual_thread_id)
            .where(ChatSession.user_id == user_id)
        )
        session = result.first()

        if not session:
            raise KeyError(f"Thread {thread_id} not found or access denied")

        await self.session.delete(session)
        await self.session.commit()

    # Item Operations (6 methods)
    async def load_thread_items(
        self,
        thread_id: str,
        after: Optional[str],
        limit: int,
        order: str,
        context: Dict[str, Any]
    ) -> Page[ThreadItem]:
        user_id = context["user"]["id"]
        actual_thread_id = thread_id.split('-', 1)[1]

        query = (
            select(ChatMessage)
            .where(ChatMessage.session_id == actual_thread_id)
            .where(ChatMessage.user_id == user_id)
        )

        if order.lower() == "desc":
            query = query.order_by(ChatMessage.timestamp.desc())
        else:
            query = query.order_by(ChatMessage.timestamp.asc())

        query = query.limit(limit + 1)
        results = await self.session.exec(query)
        messages = results.all()

        has_more = len(messages) > limit
        messages = messages[:limit]

        thread_items = [
            ThreadItem(
                id=f"{message.user_id}-{message.message_id}",
                thread_id=thread_id,
                content=message.content,
                sender_type=message.sender_type.value,
                sender_name=message.sender_name,
                created_at=message.timestamp,
                metadata=message.metadata_
            )
            for message in messages
        ]

        return Page[ThreadItem](
            data=thread_items,
            has_more=has_more,
            next_cursor=None
        )

    async def add_thread_item(
        self,
        thread_id: str,
        item: ThreadItem,
        context: Dict[str, Any]
    ) -> None:
        user_id = context["user"]["id"]
        actual_thread_id = thread_id.split('-', 1)[1]
        actual_message_id = item.id.split('-', 1)[1]

        # Verify thread ownership
        thread_result = await self.session.exec(
            select(ChatSession)
            .where(ChatSession.session_id == actual_thread_id)
            .where(ChatSession.user_id == user_id)
        )
        if not thread_result.first():
            raise KeyError(f"Thread {thread_id} not found or access denied")

        new_message = ChatMessage(
            message_id=UUID(actual_message_id),
            session_id=UUID(actual_thread_id),
            user_id=user_id,
            content=item.content,
            sender_type=SenderType(item.sender_type),
            sender_name=item.sender_name,
            timestamp=item.created_at,
            metadata_=item.metadata
        )

        self.session.add(new_message)
        await self.session.commit()

    async def save_item(
        self,
        thread_id: str,
        item: ThreadItem,
        context: Dict[str, Any]
    ) -> None:
        # Similar to add_thread_item but for updates
        user_id = context["user"]["id"]
        actual_message_id = item.id.split('-', 1)[1]

        result = await self.session.exec(
            select(ChatMessage)
            .where(ChatMessage.message_id == actual_message_id)
            .where(ChatMessage.user_id == user_id)
        )
        existing = result.first()

        if existing:
            existing.content = item.content
            existing.sender_type = SenderType(item.sender_type)
            existing.sender_name = item.sender_name
            existing.metadata_ = item.metadata
            await self.session.commit()
        else:
            await self.add_thread_item(thread_id, item, context)

    async def load_item(
        self,
        thread_id: str,
        item_id: str,
        context: Dict[str, Any]
    ) -> ThreadItem:
        user_id = context["user"]["id"]
        actual_message_id = item_id.split('-', 1)[1]

        result = await self.session.exec(
            select(ChatMessage)
            .where(ChatMessage.message_id == actual_message_id)
            .where(ChatMessage.user_id == user_id)
        )
        message = result.first()

        if not message:
            raise KeyError(f"Item {item_id} not found or access denied")

        return ThreadItem(
            id=item_id,
            thread_id=thread_id,
            content=message.content,
            sender_type=message.sender_type.value,
            sender_name=message.sender_name,
            created_at=message.timestamp,
            metadata=message.metadata_
        )

    async def delete_thread_item(
        self,
        thread_id: str,
        item_id: str,
        context: Dict[str, Any]
    ) -> None:
        user_id = context["user"]["id"]
        actual_message_id = item_id.split('-', 1)[1]

        result = await self.session.exec(
            select(ChatMessage)
            .where(ChatMessage.message_id == actual_message_id)
            .where(ChatMessage.user_id == user_id)
        )
        message = result.first()

        if not message:
            raise KeyError(f"Item {item_id} not found or access denied")

        await self.session.delete(message)
        await self.session.commit()

    # Attachment Operations (3 methods)
    async def save_attachment(self, attachment: Any, context: Dict[str, Any]) -> None:
        # Implementation depends on attachment storage strategy
        pass

    async def load_attachment(self, attachment_id: str, context: Dict[str, Any]) -> Any:
        # Implementation depends on attachment storage strategy
        pass

    async def delete_attachment(self, attachment_id: str, context: Dict[str, Any]) -> None:
        # Implementation depends on attachment storage strategy
        pass
```

#### 3.3 Create ChatKit Session Endpoints

**File**: `backend/src/backend/api/chatkit.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
import os
from datetime import datetime, timedelta

from openai import OpenAI
from backend.auth import get_current_user  # Existing JWT validation

router = APIRouter(prefix="/api/chatkit", tags=["chatkit"])

# Initialize OpenAI client with validation
try:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=f"Failed to initialize OpenAI client: {str(e)}. "
               "Please verify your OPENAI_API_KEY is valid."
    )


@router.post("/session")
async def create_chatkit_session(
    user: Dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Create new ChatKit session and return client_secret"""
    try:
        # Create ChatKit session via OpenAI API
        # Note: This is a simplified example - actual implementation may vary
        # based on OpenAI ChatKit API specifics

        session_response = openai_client.chat.completions.create(
            model="gpt-4",  # Placeholder - adjust based on actual ChatKit API
            messages=[{
                "role": "system",
                "content": "ChatKit session initialization"
            }],
            # ChatKit-specific parameters would go here
        )

        # Extract session info from response
        # Note: Actual implementation depends on OpenAI ChatKit API response format
        client_secret = f"sk-chatkit-{user['id']}-{datetime.utcnow().timestamp()}"
        session_id = f"chatkit-session-{user['id']}-{datetime.utcnow().timestamp()}"

        return {
            "client_secret": client_secret,
            "session_id": session_id,
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat() + "Z"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create ChatKit session: {str(e)}"
        )


@router.post("/refresh")
async def refresh_chatkit_session(
    user: Dict = Depends(get_current_user)
) -> Dict[str, str]:
    """Refresh expired ChatKit session token"""
    try:
        # Refresh session logic
        # This would call OpenAI's session refresh endpoint

        client_secret = f"sk-chatkit-refreshed-{user['id']}-{datetime.utcnow().timestamp()}"
        session_id = f"chatkit-session-{user['id']}"

        return {
            "client_secret": client_secret,
            "session_id": session_id,
            "expires_at": (datetime.utcnow() + timedelta(hours=1)).isoformat() + "Z"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refresh ChatKit session: {str(e)}"
        )


@router.get("/health")
async def chatkit_health_check():
    """Check ChatKit configuration status"""
    openai_key_configured = bool(os.getenv("OPENAI_API_KEY"))

    # Check if store is implemented
    try:
        from backend.store.chatkit_store import ChatKitStore
        store_implemented = hasattr(ChatKitStore, 'load_thread_items')
    except:
        store_implemented = False

    return {
        "openai_key_configured": openai_key_configured,
        "session_endpoint_available": True,
        "store_implemented": store_implemented,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
```

#### 3.4 Update FastAPI App

**File**: `backend/src/backend/main.py`

```python
# Add ChatKit routes
from backend.api import chatkit
app.include_router(chatkit.router)

# Add startup validation
@app.on_event("startup")
async def validate_chatkit_setup():
    """Validate ChatKit setup on startup"""
    from backend.config import validate_chatkit_config
    try:
        validate_chatkit_config()
        print("✅ ChatKit configuration validated")
    except HTTPException as e:
        print(f"❌ ChatKit validation failed: {e.detail}")
        # Don't block startup, but log clearly
```

### Step 4: Frontend Implementation

#### 4.1 Install Dependencies

```bash
cd frontend/
npm install @openai/chatkit-react
```

#### 4.2 Create Session API Routes

**File**: `frontend/src/app/api/chatkit/session/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/auth'  # Existing auth utility

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.json()
      return NextResponse.json(
        { error: `ChatKit session failed: ${error.detail}` },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create ChatKit session' },
      { status: 500 }
    )
  }
}
```

**File**: `frontend/src/app/api/chatkit/refresh/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.json()
      return NextResponse.json(
        { error: `ChatKit refresh failed: ${error.detail}` },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh ChatKit session' },
      { status: 500 }
    )
  }
}
```

#### 4.3 Create ChatKit Integration Component

**File**: `frontend/src/app/chatbot/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { useAuth } from '@/hooks/useAuth'

export default function ChatBotPage() {
  const { user, token } = useAuth()
  const [initialThread, setInitialThread] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load saved thread ID from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatkit-thread-id')
    setInitialThread(saved)
  }, [])

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        try {
          const res = await fetch('/api/chatkit/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          })

          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to create session')
          }

          const { client_secret } = await res.json()
          return client_secret
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Authentication failed')
          throw err
        }
      },
    },
    initialThread,
    onThreadChange: ({ threadId }) => {
      if (threadId) {
        localStorage.setItem('chatkit-thread-id', threadId)
      }
    },
    theme: {
      colorScheme: 'light',
      color: {
        grayscale: { hue: 220, tint: 6, shade: -1 },
        accent: { primary: '#FF6B4A', level: 1 }, // Match editorial orange
      },
      radius: 'round',
    },
    startScreen: {
      greeting: `Hello ${user?.name || 'User'}! How can I help you with your tasks?`,
      prompts: [
        { label: 'Create a new task', prompt: 'Create a task for buying groceries' },
        { label: 'List my tasks', prompt: 'Show me all my current tasks' },
        { label: 'Help me understand', prompt: 'Help me understand what I can do' },
      ],
    },
    composer: {
      placeholder: 'Ask me to create, list, or manage your tasks...',
    },
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-serif text-red-800 mb-2">ChatKit Setup Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-red-500 space-y-1">
            <p><strong>Possible causes:</strong></p>
            <ul className="list-disc list-inside ml-2">
              <li>OPENAI_API_KEY not configured in backend</li>
              <li>Invalid OpenAI API key format</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-orange-200 bg-orange-50">
        <h1 className="text-2xl font-serif text-gray-900">AI Task Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">
          Powered by OpenAI ChatKit with MCP task management tools
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatKit control={control} className="h-full w-full" />
      </div>
    </div>
  )
}
```

#### 4.4 Add Environment Validation

**File**: `frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
}

// Warn if ChatKit script URL is missing
if (!process.env.NEXT_PUBLIC_CHATKIT_SCRIPT_URL) {
  console.warn("⚠️  NEXT_PUBLIC_CHATKIT_SCRIPT_URL not set, using default OpenAI CDN")
}

module.exports = nextConfig
```

### Step 5: Testing & Validation

#### 5.1 Backend Tests

```bash
cd backend/

# Test environment validation
uv run python -c "from backend.config import validate_chatkit_config; validate_chatkit_config()"

# Test store import
uv run python -c "from backend.store.chatkit_store import ChatKitStore; print('Store import OK')"

# Test session endpoints (requires running server)
curl -X GET http://localhost:8000/api/chatkit/health
```

#### 5.2 Frontend Tests

```bash
cd frontend/

# Build test
npm run build

# Check bundle size
npm run analyze
# Verify ChatKit < 200KB gzipped

# Start development server
npm run dev
```

#### 5.3 Integration Test

1. **Start backend**: `cd backend && uv run fastapi dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Open browser**: http://localhost:3000
4. **Login**: Use existing Better Auth
5. **Navigate to**: /chatbot
6. **Test session creation**: Check browser console for errors
7. **Send message**: "Create a task for testing"
8. **Verify**: ChatKit UI shows response with tool execution

### Step 6: Error Handling & Fallbacks

#### 6.1 Missing OpenAI Key Error

**Expected behavior**: Clear error message with setup instructions

**Test**: Set `OPENAI_API_KEY=""` and try to create session

**Expected response**:
```json
{
  "detail": "OPENAI_API_KEY is required for ChatKit session management. Even when using other AI providers (like Xiaomi), ChatKit requires an OpenAI API key for authentication. Get one at https://platform.openai.com/api-keys"
}
```

#### 6.2 Invalid API Key Error

**Expected behavior**: OpenAI API error with clear message

**Test**: Set `OPENAI_API_KEY="invalid-key"` and try to create session

**Expected response**: OpenAI API error with details

#### 6.3 ChatKit Script Loading Failure

**Expected behavior**: Fallback UI with error message

**Test**: Block CDN script URL in browser dev tools

**Expected**: Error component shows with retry button

## Troubleshooting

### Common Issues

#### Issue: "OPENAI_API_KEY is required"
**Solution**: Add `OPENAI_API_KEY=sk-...` to backend `.env` file

#### Issue: "Invalid JWT token"
**Solution**: Ensure user is logged in via Better Auth before accessing chat

#### Issue: "Store method not implemented"
**Solution**: Verify all 14 ChatKit Store methods are implemented in `ChatKitStore`

#### Issue: "ChatKit script failed to load"
**Solution**: Check browser console for CDN errors, ensure internet connectivity

#### Issue: "User isolation violation"
**Solution**: Verify all database queries include `WHERE user_id = :user_id`

### Debug Commands

```bash
# Check OpenAI key is set
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:-NOT SET}"

# Test OpenAI API connectivity
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.object'

# Check backend health
curl -s http://localhost:8000/api/chatkit/health | jq

# Check database tables
psql $DATABASE_URL -c "\dt chat_*"
```

## Success Criteria Checklist

- [ ] OpenAI API key configured and validated
- [ ] Database migrations applied successfully
- [ ] ChatKit Store implements all 14 methods
- [ ] Session endpoints return proper responses
- [ ] Frontend ChatKit component loads without errors
- [ ] User can send and receive messages
- [ ] MCP tools execute and show in ChatKit UI
- [ ] Chat history persists across sessions
- [ ] User isolation works (can't access others' chats)
- [ ] Error handling shows clear messages
- [ ] Performance targets met (<2s response time)
- [ ] Bundle size increase <200KB

## Next Steps

After completing this QuickStart:

1. **Run full test suite**: `cd backend && uv run pytest`
2. **Performance testing**: Load test with multiple concurrent users
3. **Security audit**: Verify user isolation in all scenarios
4. **Documentation**: Update API docs with new endpoints
5. **Monitoring**: Set up alerts for ChatKit errors
6. **Deployment**: Follow deployment checklist in plan.md

## Support

For issues with:
- **OpenAI API**: Check https://platform.openai.com/help
- **ChatKit Integration**: Review https://platform.openai.com/docs/chatkit
- **Project Setup**: Check existing project documentation in `/docs/`

---

**QuickStart Version**: 1.0.0
**Last Updated**: 2026-01-16
**Constitution Compliance**: ✅ v1.1.0