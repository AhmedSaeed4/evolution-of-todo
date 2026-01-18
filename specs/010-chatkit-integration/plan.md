# Implementation Plan: ChatKit Integration with OpenAI Agents SDK & MCP Tools

**Branch**: `010-chatkit-integration` | **Date**: 2026-01-16 | **Spec**: [specs/010-chatkit-integration/spec.md](specs/010-chatkit-integration/spec.md)
**Input**: Feature specification from `/specs/010-chatkit-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Integrate OpenAI ChatKit frontend components with existing Phase-3 backend that features OpenAI Agents SDK (Xiaomi mimo-v2-flash) and 7 MCP task management tools. Replace custom chat interface with production-ready ChatKit UI, add streaming responses, persistent chat history, and tool visualization while maintaining user isolation and existing functionality.

**Technical Approach**: Use OpenAI ChatKit React components with custom backend integration via session endpoints and Store implementation. Backend maintains existing OpenAI Agents SDK and MCP tools, adapting them for ChatKit's streaming interface. Database extended with chat session/message tables using existing Neon PostgreSQL infrastructure.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x, React 19.2.3, Next.js 16.1.1 (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, OpenAI ChatKit React, Better Auth, SQLModel, Neon PostgreSQL
**Storage**: Neon PostgreSQL (serverless) - extending existing schema for chat persistence
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web (Next.js App Router), Modern browsers with streaming support
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <2s message send/receive, <1s interface loading, <200KB bundle increase
**Constraints**: Zero breaking changes to existing API, maintain user isolation, preserve existing functionality
**Scale/Scope**: Single user per session, 7 MCP tools with streaming visualization, ChatKit handles all UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: Business logic decoupled from presentation layer ✅
  - Backend agents remain independent of frontend ChatKit UI
  - MCP tools remain backend-only, exposed via streaming responses

- [x] **II. AI-Native Interoperability**: MCP tools defined with strict typing ✅
  - Existing 7 MCP tools maintain strict typing and user isolation
  - ChatKit will visualize tool execution without modifying tool definitions

- [x] **III. Strict Statelessness**: No in-memory session storage, all state persisted ✅
  - ChatKit sessions will be persisted to PostgreSQL (extending existing schema)
  - JWT tokens maintain stateless authentication

- [x] **IV. Event-Driven Decoupling**: Async operations use event streams ✅
  - Implement Server-Sent Events (SSE) for streaming responses
  - Maintain existing async FastAPI architecture

- [x] **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id ✅
  - Chat sessions and messages scoped to user_id from JWT
  - Existing user isolation patterns extended to chat data

- [x] **VI. Technology Stack**: Authorized libraries only ✅
  - Frontend: Next.js 16.1.1, React 19.2.3, OpenAI ChatKit (authorized)
  - Backend: Python 3.13+, FastAPI, OpenAI Agents SDK (existing)
  - Database: Neon PostgreSQL (existing)

- [x] **VII. Security**: JWT validation, input validation, no hardcoded secrets ✅
  - ChatKit integration uses existing Better Auth JWT validation
  - Input validation maintained from existing backend
  - No new secrets required

- [x] **VIII. Observability**: Structured logging, metrics, audit trail requirements met ✅
  - Extend existing logging to include chat sessions and streaming events
  - Add metrics for ChatKit performance and tool execution

**Constitution Status**: ✅ **PASSED** - All gates met, no violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/010-chatkit-integration/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── openapi.yaml
│   ├── graphql-schema.graphql
│   └── store-interface.py
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure in phase-3 (current implementation)
phase-3/backend/
├── src/
│   ├── backend/
│   │   ├── agents.py              # OpenAI Agents SDK (existing)
│   │   ├── main.py                # FastAPI server (existing + ChatKit endpoints)
│   │   ├── task_serves_mcp_tools.py          # MCP tools (existing)
│   │   ├── models/
│   │   │   ├── task.py           # Task models (existing)
│   │   │   ├── agent.py          # Agent models (existing)
│   │   │   └── chat.py           # NEW: Chat models (SQLModel)
│   │   ├── api/
│   │   │   └── chatkit.py        # NEW: ChatKit session endpoints
│   │   └── store/
│   │       └── chatkit_store.py  # NEW: Store implementation (14 methods)
│   └── tests/
│       └── test_mcp_tools.py     # Existing MCP tests
│
phase-3/frontend/
├── src/
│   ├── app/
│   │   ├── chatbot/
│   │   │   └── page.tsx          # REPLACED: ChatKit integration (simple)
│   │   ├── api/
│   │   │   ├── auth/[...all]/    # Existing Better Auth
│   │   │   └── chatkit/
│   │   │       ├── session.ts    # NEW: ChatKit session endpoint
│   │   │       └── refresh.ts    # NEW: ChatKit refresh endpoint
│   │   └── (dashboard)/
│   │       ├── tasks/            # Existing task UI
│   │       └── profile/          # Existing profile UI
│   ├── lib/
│   │   └── chatkit.ts           # NEW: ChatKit configuration
│   └── types/
│       └── index.ts             # Extended with chat types
```

**Structure Decision**: Web application structure maintained. Backend adds ChatKit session endpoints and Store implementation. Frontend replaces `/chatbot/page.tsx` with simple ChatKit integration while preserving existing task/profile functionality.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A - All gates passed | Constitution compliance achieved | N/A |

## Phase 0: Research & Discovery

### Current State Analysis

**Backend (Phase-3 Complete)**:
- ✅ OpenAI Agents SDK with Xiaomi mimo-v2-flash model
- ✅ Dual-agent system (Orchestrator + Urdu Specialist)
- ✅ 7 MCP task management tools with user isolation
- ✅ FastAPI server with `/api/chat` endpoint (synchronous)
- ✅ JWT authentication with Better Auth integration
- ✅ Neon PostgreSQL with task schema

**Frontend (Phase-3 Complete)**:
- ✅ Next.js 16.1.1 with App Router
- ✅ Better Auth v1.4.9 with JWT tokens
- ✅ Modern Technical Editorial design system
- ✅ Task management UI with full CRUD
- ✅ Basic chat interface (custom implementation)
- ❌ ChatKit integration (pending)
- ❌ Streaming responses (pending)
- ❌ Persistent chat history (pending)

### Key Research Findings

**OpenAI ChatKit Integration**:
- ChatKit provides production-ready UI components matching requirements
- Requires OpenAI API key for session management (even with other providers)
- Supports custom `getClientSecret()` function for authentication
- Built-in streaming support and tool visualization
- Can integrate with any backend via custom fetch interceptors

**Backend Streaming Architecture**:
- Server-Sent Events (SSE) recommended for streaming responses
- FastAPI supports SSE via `StreamingResponse`
- OpenAI Agents SDK can stream responses incrementally
- ChatKit expects streaming responses in specific format

**Database Schema Extensions**:
- Two new tables: `chat_sessions` and `chat_messages`
- Both include `user_id` for multi-tenancy
- Indexes required for performance on user queries
- JSONB columns for metadata flexibility

**Authentication Flow**:
- Extend existing Better Auth JWT with ChatKit session endpoints
- Custom `getClientSecret()` bridges auth systems
- Session refresh mechanism required for long conversations
- User context maintained across all ChatKit operations

**MCP Tool Integration**:
- Existing MCP tools already implement user isolation and strict typing
- ChatKit can visualize tool execution through custom event handlers
- No changes needed to core business logic
- Tool execution results can be streamed to ChatKit UI

**Performance & Bundle Size**:
- ChatKit CDN script is ~150KB gzipped
- Additional React components add ~30KB
- Total increase should stay under 200KB target
- Lazy loading possible for non-critical features

### Technology Stack Validation

**Backend Stack Compliance (Constitution VI)**:
- ✅ Python 3.13+ (existing)
- ✅ FastAPI (existing)
- ✅ SQLModel (existing)
- ✅ OpenAI Agents SDK (existing)
- ✅ OpenAI Python SDK (new - required for session management)
- ✅ OpenAI ChatKit Server (new - required for ChatKit integration)
- ✅ Neon PostgreSQL (existing)

**Frontend Stack Compliance (Constitution VI)**:
- ✅ Next.js 16.1.1 (existing)
- ✅ React 19.2.3 (existing)
- ✅ TypeScript 5.x (existing)
- ✅ Better Auth v1.4.9 (existing)
- ✅ OpenAI ChatKit React (new)
- ✅ Tailwind CSS v4 (existing)

### Integration Challenges & Solutions

| Challenge | Solution | Complexity |
|-----------|----------|------------|
| **Script Loading (Next.js 16+)** | Use CDN script in body, detect with `customElements.whenDefined()` | Medium |
| **Authentication Flow** | Custom `getClientSecret()` bridging Better Auth → OpenAI | Low |
| **Streaming Backend** | SSE with existing OpenAI Agents SDK, maintain async patterns | Medium |
| **Tool Visualization** | Custom event handlers in ChatKit for MCP tool execution | Medium |
| **Design Consistency** | Theme ChatKit to match existing editorial aesthetic | Low |
| **Data Migration** | New tables for chat sessions/messages (no migration needed) | Low |
| **User Isolation** | Extend existing JWT validation to chat operations | Low |
| **Error Handling** | Graceful fallbacks for ChatKit failures, clear error messages | Medium |

### Research Conclusions

**Key Decisions Made**:
1. **Use OpenAI ChatKit** for frontend UI (production-ready, matches requirements)
2. **Implement SSE** for streaming (fits architecture, ChatKit support)
3. **Extend PostgreSQL** with chat tables (leverages existing infrastructure)
4. **Bridge auth systems** via custom session endpoints (maintains security)
5. **Adapt existing MCP tools** for ChatKit visualization (no code duplication)

**Technology Choices Validated**:
- ✅ ChatKit integration is feasible with existing stack
- ✅ User isolation can be maintained throughout the flow
- ✅ Performance targets are achievable
- ✅ Security requirements can be met
- ✅ Development timeline is realistic (2-3 days)

**Next Steps**:
- Phase 1: Design database schema and API contracts
- Phase 2: Implement backend ChatKit Store and session endpoints
- Phase 3: Implement frontend ChatKit integration
- Phase 4: Testing and validation

## Phase 1: Design & Architecture

### Backend Design

#### 1.1 Database Schema Extensions

**New Tables** (all with user isolation):

```sql
-- Chat sessions table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Chat messages table
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_type VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'tool'
    sender_name VARCHAR(100), -- 'Orchestrator', 'Urdu Specialist', 'create_task', etc.
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
```

#### 1.2 ChatKit Session API Design

**New Endpoints** (in `/backend/src/backend/api/chatkit.py`):

```python
# Required by ChatKit frontend for authentication
@router.post("/chatkit/session")
async def create_chatkit_session(
    user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Create new ChatKit session and return client_secret"""
    # Uses OpenAI package to create session
    # Returns: {"client_secret": str, "session_id": str}

@router.post("/chatkit/refresh")
async def refresh_chatkit_session(
    current_token: dict,
    user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Refresh expired ChatKit session token"""
    # Returns: {"client_secret": str, "session_id": str}
```

#### 1.3 Store Implementation Design

**ChatKit Store** (`/backend/src/backend/store/chatkit_store.py`):
```python
class ChatKitStore(Store[dict]):
    """Implements all 14 required methods for ChatKit thread/message persistence"""

    # ID Generation (2 methods)
    async def generate_thread_id(self, context: dict) -> str
    async def generate_item_id(self, thread_id: str, context: dict) -> str

    # Thread Operations (5 methods)
    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata
    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None
    async def load_threads(
        self, limit: int, after: str | None, order: str, context: dict
    ) -> Page[ThreadMetadata]
    async def delete_thread(self, thread_id: str, context: dict) -> None

    # Item Operations (6 methods)
    async def load_thread_items(
        self, thread_id: str, after: str | None, limit: int, order: str, context: dict
    ) -> Page[ThreadItem]
    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None
    async def load_item(self, thread_id: str, item_id: str, context: dict) -> ThreadItem
    async def delete_thread_item(self, thread_id: str, item_id: str, context: dict) -> None

    # Attachment Operations (3 methods)
    async def save_attachment(self, attachment: Any, context: dict) -> None
    async def load_attachment(self, attachment_id: str, context: dict) -> Any
    async def delete_attachment(self, attachment_id: str, context: dict) -> None
```

**Integration with Existing Agents**:
- ChatKit automatically calls `load_thread_items()` to get conversation history
- Your existing `agents.py` with OpenAI Agents SDK continues working unchanged
- MCP tools continue working with user isolation via context
- ChatKit handles all streaming and UI updates automatically

### Frontend Design

#### 2.1 ChatKit Configuration

**ChatKit Integration** (`/frontend/src/app/chatbot/page.tsx`):
```typescript
'use client'

import { useState, useEffect } from 'react'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { useAuth } from '@/hooks/useAuth'

export default function ChatBotPage() {
  const { user, token } = useAuth()
  const [initialThread, setInitialThread] = useState<string | null>(null)

  // Load saved thread ID from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatkit-thread-id')
    setInitialThread(saved)
  }, [])

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })
        const { client_secret } = await res.json()
        return client_secret
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

### Integration Architecture

#### 3.1 Complete Flow

```
Frontend ChatKit → /api/chatkit/session → Backend Session Endpoints → OpenAI
         ↓
    Better Auth JWT
         ↓
    ChatKit Store (your 14 methods)
         ↓
    Your existing agents.py + MCP tools
         ↓
    ChatKit UI (auto-generated)
```

**Session Endpoints** (`/frontend/src/app/api/chatkit/`):
```typescript
// session.ts - Create ChatKit session
export async function POST(req: Request) {
  const token = getAuthToken()
  const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit/session`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return NextResponse.json(await backendResponse.json())
}

// refresh.ts - Refresh session
export async function POST(req: Request) {
  const token = getAuthToken()
  const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit/refresh`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return NextResponse.json(await backendResponse.json())
}
```

**How It Works**:
1. ChatKit calls your `/api/chatkit/session` endpoint
2. Backend creates OpenAI session, returns `client_secret`
3. ChatKit uses secret to communicate directly with OpenAI
4. OpenAI calls your `ChatKitServer.respond()` method
5. Your server loads history via `store.load_thread_items()`
6. Your existing agents + MCP tools process the request
7. ChatKit handles all streaming and UI updates automatically

## Phase 2: Implementation Tasks

### Backend Tasks

#### Task 2.1: Install Dependencies & Validate Environment
- [ ] `uv add openai` (required for session management)
- [ ] `uv add openai-chatkit` (ChatKit server framework)
- [ ] Verify existing dependencies: FastAPI, OpenAI Agents SDK, SQLModel
- [ ] **Add environment validation** in `backend/src/backend/config.py`

#### Task 2.2: Database Schema Extensions
- [ ] Create migration for `chat_sessions` table (user_id, metadata, timestamps)
- [ ] Create migration for `chat_messages` table (thread_id, content, sender_type, etc.)
- [ ] Add indexes for user queries and sorting
- [ ] Update SQLModel definitions in `/backend/src/backend/models/chat.py`

#### Task 2.3: Implement ChatKit Store (14 methods)
- [ ] Create `/backend/src/backend/store/chatkit_store.py`
- [ ] Implement `ChatKitStore(Store[dict])` with all 14 required methods
- [ ] Add user isolation via context extraction
- [ ] Use existing Neon PostgreSQL connection
- [ ] Test store methods with user isolation

#### Task 2.4: Create ChatKit Server
- [ ] Subclass `ChatKitServer` in `/backend/src/backend/chatkit_server.py`
- [ ] Implement `respond()` method that:
  - Loads conversation history via `store.load_thread_items()`
  - Uses existing `agents.py` with OpenAI Agents SDK
  - Maintains MCP tool integration with user isolation
  - Returns `StreamingResult` with agent response
- [ ] Handle ID collision fix for non-OpenAI providers

#### Task 2.5: Session Endpoints
- [ ] Create `/backend/src/backend/api/chatkit.py`
- [ ] **Add OpenAI client initialization with validation**
- [ ] Implement `/api/chatkit/session` endpoint using OpenAI package
- [ ] Implement `/api/chatkit/refresh` endpoint
- [ ] Add JWT authentication with user context
- [ ] Return `client_secret` and `session_id` to frontend
- [ ] **Add error handling** for common OpenAI API errors

#### Task 2.6: OpenAI API Key Validation & Error Handling
- [ ] **Add startup validation** in FastAPI app
- [ ] **Add clear error responses** for session endpoint failures
- [ ] **Create setup validation endpoint** (`GET /api/chatkit/health`)
- [ ] **Document setup requirements** in error messages

#### Task 2.7: Integration & Testing
- [ ] Connect ChatKitServer to FastAPI app
- [ ] Test session creation with frontend
- [ ] Verify user isolation in store operations
- [ ] Test MCP tool execution within ChatKit
- [ ] **Test error scenarios**:
  - Missing OPENAI_API_KEY
  - Invalid API key format
  - OpenAI API errors (rate limits, permissions)
- [ ] Performance test: <2s response time target

### Frontend Tasks

#### Task 2.8: Install Dependencies & Setup Validation
- [ ] `npm install @openai/chatkit-react`
- [ ] Verify existing dependencies: Next.js, React, Better Auth
- [ ] **Add environment validation** in `next.config.js`

#### Task 2.9: Create Session API Routes with Error Handling
- [ ] Create `/frontend/src/app/api/chatkit/session/route.ts`
- [ ] Create `/frontend/src/app/api/chatkit/refresh/route.ts`
- [ ] Implement JWT token forwarding to backend
- [ ] **Add clear error responses**

#### Task 2.10: Simple ChatKit Integration
- [ ] Replace `/frontend/src/app/chatbot/page.tsx` with simple ChatKit component
- [ ] Add `useChatKit` hook with `getClientSecret()` function
- [ ] Implement localStorage for thread persistence
- [ ] Add theme configuration matching editorial design
- [ ] Add start screen with task-related prompts
- [ ] Style container to match existing design system
- [ ] **Add error boundary** for ChatKit failures

#### Task 2.11: Testing & Validation
- [ ] Test ChatKit loads correctly
- [ ] Verify authentication flow works
- [ ] Test thread persistence across page refresh
- [ ] Verify MCP tool execution in UI
- [ ] **Test error scenarios**:
  - Missing OPENAI_API_KEY (should show clear error)
  - Invalid session endpoint (should show helpful message)
  - ChatKit script loading failure (should show fallback)
- [ ] Performance test: <200KB bundle increase
- [ ] Mobile responsiveness check

## Phase 3: Verification & Testing

### Backend Verification

#### 3.1 OpenAI API Key Validation Testing
```bash
# Test environment validation
curl -X GET http://localhost:8000/api/chatkit/health

# Test with missing key (should return helpful error)
export OPENAI_API_KEY=""
curl -X POST http://localhost:8000/api/chatkit/session \
  -H "Authorization: Bearer $JWT_TOKEN"
```

#### 3.2 Session Endpoint Testing
```bash
# Test session creation with valid key
curl -X POST http://localhost:8000/api/chatkit/session \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"

# Test with invalid key format
export OPENAI_API_KEY="invalid-key"
curl -X POST http://localhost:8000/api/chatkit/session \
  -H "Authorization: Bearer $JWT_TOKEN"
```

#### 3.3 Store Implementation Test
```python
# Test all 14 store methods with user isolation
async def test_chatkit_store():
    store = ChatKitStore()
    context = {"user": {"id": "test-user-123"}}

    # Test thread operations
    thread_id = await store.generate_thread_id(context)
    await store.save_thread(thread_metadata, context)
    threads = await store.load_threads(10, None, "desc", context)

    # Test item operations
    item_id = await store.generate_item_id(thread_id, context)
    await store.add_thread_item(thread_id, user_message, context)
    items = await store.load_thread_items(thread_id, None, 50, "asc", context)

    # Verify user isolation
    assert all(t.user_id == "test-user-123" for t in threads.data)
```

### Frontend Verification

#### 3.4 OpenAI API Key Validation Test
```typescript
// Test missing OpenAI key error handling
test('Shows clear error when OPENAI_API_KEY missing', async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => ({
      detail: "OPENAI_API_KEY is required for ChatKit session management..."
    })
  })
  global.fetch = mockFetch

  render(<ChatBotPage />)

  await waitFor(() => {
    expect(screen.getByText(/OPENAI_API_KEY is required/i)).toBeInTheDocument()
  })
})
```

#### 3.5 ChatKit Integration Test
```typescript
// Test ChatKit loads correctly
test('ChatKit component renders', async () => {
  render(<ChatBotPage />)
  await waitFor(() => {
    expect(screen.getByText('AI Task Assistant')).toBeInTheDocument()
  })
})

// Test authentication flow
test('Session endpoint called with JWT', async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    json: async () => ({ client_secret: 'test-secret' })
  })
  global.fetch = mockFetch

  render(<ChatBotPage />)

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/chatkit/session',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    )
  })
})
```

### Integration End-to-End Testing

#### 3.7 Complete User Flow Test
```
1. User logs in (Better Auth) → JWT token issued
2. User navigates to /chatbot → ChatKit loads
3. ChatKit calls /api/chatkit/session → Backend creates OpenAI session
4. User sends "Create task Buy groceries" → ChatKit communicates with OpenAI
5. OpenAI calls your ChatKitServer.respond() → Loads history, runs agent
6. MCP tool executes (create_task) → Result returned to ChatKit
7. ChatKit displays complete UI with tool execution
8. Thread ID saved to localStorage for persistence
9. User refreshes page → Previous thread loaded automatically
```

#### 3.8 Error Handling Test
- [ ] Invalid JWT token (401 response)
- [ ] Backend service unavailable (503 response)
- [ ] ChatKit script loading failure (fallback UI)
- [ ] OpenAI API errors (graceful error display)
- [ ] Store method failures (error handling in respond())

## Phase 4: Deployment & Rollout

### 4.1 Environment Configuration & Validation

**Prerequisites Check** (Run before implementation):
```bash
# Verify OpenAI API key exists
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:-NOT SET}"

# Test key validity (basic check)
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq '.object'

# Expected: "list" (if key is valid)
# Error: "invalid_request_error" (if key is invalid/missing)
```

**Backend Environment** (existing + new):
```env
# Existing
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
XIAOMI_API_KEY=...
CORS_ORIGINS=http://localhost:3000

# New for ChatKit (REQUIRED - even for non-OpenAI providers)
OPENAI_API_KEY=sk-...  # Required for session management
```

**Frontend Environment** (existing + new):
```env
# Existing
NEXT_PUBLIC_AUTH_BYPASS=false
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# New for ChatKit (optional)
NEXT_PUBLIC_CHATKIT_SCRIPT_URL=https://cdn.platform.openai.com/deployments/chatkit/chatkit.js
```

**Important Notes**:
- `OPENAI_API_KEY` is **required** even when using Xiaomi mimo-v2-flash model
- ChatKit uses OpenAI's session management API for authentication
- The key only needs "ChatKit" permissions (session creation)
- Without this key, ChatKit will fail to initialize with clear error messages

### 4.2 Database Migration

**Migration Script** (run in Neon PostgreSQL):
```sql
BEGIN;
-- Add chat_sessions table
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Add chat_messages table
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

-- Add indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Verify existing data intact
SELECT COUNT(*) FROM tasks;
COMMIT;
```

### 4.3 Deployment Checklist

**Pre-Deployment Validation**:
- [ ] **Verify OPENAI_API_KEY exists** and has ChatKit permissions
- [ ] **Test OpenAI key validity** with curl command from section 4.1
- [ ] **Run setup validation endpoint** (`GET /api/chatkit/health`)
- [ ] **Document key requirements** for team members

**Deployment Steps**:
- [ ] Install new dependencies: `uv add openai openai-chatkit`, `npm install @openai/chatkit-react`
- [ ] Database migrations applied and verified
- [ ] ChatKit session endpoints deployed (`/api/chatkit/session`, `/api/chatkit/refresh`)
- [ ] ChatKit Store implementation deployed
- [ ] ChatKitServer integration with FastAPI
- [ ] Frontend ChatKit integration deployed
- [ ] Domain allowlisting configured in OpenAI Platform (localhost + production)
- [ ] Authentication flow validated in production
- [ ] User isolation verified with test accounts
- [ ] Performance metrics monitored

**Post-Deployment Validation**:
- [ ] **Test session creation** with valid OpenAI key
- [ ] **Verify error handling** for invalid/missing keys
- [ ] **Check ChatKit health endpoint** returns correct status
- [ ] **Monitor logs** for OpenAI API errors

### 4.4 Monitoring & Observability

**Backend Metrics**:
- Session creation success rate
- Store method performance (target: <100ms per method)
- MCP tool execution success rate
- User isolation violations (should be 0)

**Frontend Metrics**:
- ChatKit script load time (target: <500ms)
- Session creation time (target: <1s)
- ChatKit UI render time
- Error rates by component

## Phase 5: Rollback Plan

### 5.1 Feature Flag Implementation
```typescript
// Environment variable to disable ChatKit
const CHATKIT_ENABLED = process.env.NEXT_PUBLIC_CHATKIT_ENABLED !== 'false'

// Conditional rendering in /chatbot/page.tsx
export default function ChatBotPage() {
  if (!CHATKIT_ENABLED) {
    return <LegacyChatInterface />  // Keep old custom chat as fallback
  }
  return <ChatKitIntegration />
}
```

### 5.2 Database Rollback
```sql
-- If issues arise, drop new tables (preserves existing task data)
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
-- No impact on existing tasks table
```

### 5.3 Code Rollback
- Keep existing chat implementation as fallback component
- Git tag before deployment: `chatkit-integration-v1`
- Quick revert: `git revert HEAD` or disable via feature flag

## Success Criteria & Validation

### ✅ Acceptance Criteria

- [ ] **OpenAI API Key Validation**: Clear error messages for missing/invalid keys
- [ ] **ChatKit Loads**: CDN script loads without errors
- [ ] **Authentication**: Session creation works with JWT tokens
- [ ] **Store Implementation**: All 14 methods implemented and tested
- [ ] **User Isolation**: Chat data properly scoped to user_id
- [ ] **MCP Tools**: Task management tools work within ChatKit
- [ ] **Thread Persistence**: localStorage saves/loads thread IDs
- [ ] **History Loading**: Previous conversations load automatically
- [ ] **Performance**: ChatKit bundle <200KB increase, response <2s
- [ ] **Design**: ChatKit styled to match editorial aesthetic
- [ ] **Compatibility**: No breaking changes to existing functionality
- [ ] **Error Handling**: Graceful fallbacks for all failure scenarios

### 🎯 Success Metrics

- **User Experience**: ChatKit loads in <500ms, first response <2s
- **Reliability**: 99% session creation success rate
- **Data Integrity**: Zero chat data loss, proper user isolation
- **Developer Experience**: Clear error messages, easy debugging
- **Maintainability**: Store implementation follows existing patterns

### 📊 Validation Commands

```bash
# Backend validation
cd backend && uv run pytest tests/test_chatkit_store.py -v
uv run python -c "from backend.store.chatkit_store import ChatKitStore; print('Store import OK')"

# Frontend validation
cd frontend && npm run build
npm run test -- ChatBotPage.test.tsx

# Bundle analysis
npm run analyze
# Verify ChatKit < 200KB gzipped
```

## Follow-ups & Risks

### 🚀 Follow-up Tasks

1. **Advanced Features** (Post-MVP):
   - Custom composer tools for task management
   - Rich text formatting in ChatKit messages
   - Multi-language support (Urdu/English)
   - Advanced thread search/filtering

2. **Performance Optimization**:
   - Implement connection pooling for store methods
   - Add Redis caching for frequently accessed threads
   - Optimize database indexes for chat queries

3. **Analytics & Insights**:
   - Track MCP tool usage patterns
   - Monitor conversation length and frequency
   - A/B test different greeting prompts

### ⚠️ Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **ChatKit Script Loading Failure** | Medium | High | Feature flag fallback to legacy chat |
| **Store Method Performance** | Low | Medium | Database optimization, connection pooling |
| **User Isolation Issues** | Very Low | Critical | Comprehensive testing, security audit |
| **OpenAI API Rate Limits** | Medium | Medium | Implement retry logic, user notifications |
| **Domain Allowlisting Issues** | Medium | Low | Clear documentation, early configuration |
| **Bundle Size Exceeds Limit** | Low | Medium | Use CDN, code splitting |

### 🔍 Post-Implementation Review

**Day 1**: Monitor session creation success rates
**Week 1**: Track user engagement with ChatKit vs legacy chat
**Week 2**: Performance analysis, store method optimization
**Week 3**: User feedback collection, feature requests
**Week 4**: Architecture review, lessons learned documentation

---

**Plan Status**: Ready for implementation
**Estimated Timeline**: 2-3 days (P1 features)
**Dependencies**: None (all prerequisites met)
**Risk Level**: Low (solid foundation, incremental changes)

## Simplified Implementation Summary

### What You Need to Build:
1. **Backend**: ChatKit Store (14 methods) + Session endpoints (2 endpoints) + OpenAI API validation
2. **Frontend**: Simple ChatKit integration (1 component) + error handling
3. **Database**: 2 new tables for chat persistence

### What ChatKit Provides:
- Complete chat UI (no custom components needed)
- Thread management and history display
- Streaming responses and tool visualization
- All frontend components and interactions

### Key Requirements Added:
- **OpenAI API Key Validation**: Required even for non-OpenAI providers (Xiaomi)
- **Environment Validation**: Clear error messages for missing configuration
- **Health Check Endpoint**: `/api/chatkit/health` for setup validation
- **Graceful Error Handling**: Fallbacks for all failure scenarios

### Key Changes from Original Plan:
- ❌ **Removed**: Complex custom UI components (StreamingIndicator, ChatHistory, etc.)
- ❌ **Removed**: Custom streaming handlers and SSE parsers
- ❌ **Removed**: Complex thread list sidebar components
- ✅ **Added**: Simple ChatKit Store implementation (14 methods)
- ✅ **Added**: Basic session endpoints for authentication
- ✅ **Added**: Single frontend component with ChatKit integration
- ✅ **Added**: OpenAI API key validation with clear error messages

This plan provides a streamlined roadmap for integrating OpenAI ChatKit with your existing Phase-3 backend, leveraging ChatKit's built-in UI components while adding only the essential backend infrastructure needed for persistence and authentication, with comprehensive validation and error handling.
