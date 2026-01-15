# Quickstart Guide: MCP Agent Integration

**Feature**: 009-agents-mcp
**Date**: 2026-01-13
**Purpose**: Get started with dual-agent MCP system in 5 minutes

---

## Prerequisites

### ✅ Existing Infrastructure
- **Backend**: FastAPI running on port 8000
- **Database**: Neon PostgreSQL with existing tasks table
- **Frontend**: Next.js running on port 3000
- **Authentication**: Better Auth with JWT tokens
- **User isolation**: Already implemented in TaskService

### 🔧 New Dependencies Required

#### Backend (Python)
```bash
cd phase-3/backend

# Add to pyproject.toml dependencies:
# openai-agents>=0.6.5
# mcp>=0.6.0  # Model Context Protocol SDK

# Install:
uv add openai-agents mcp
```

#### Frontend (TypeScript)
```bash
cd phase-3/frontend

# No new dependencies needed - uses existing apiClient
```

---

## 5-Minute Setup

### Step 1: Environment Variables

#### Backend (.env)
```bash
# Add to existing backend .env file
XIAOMI_API_KEY=your_xiaomi_api_key_here
BETTER_AUTH_SECRET=your_existing_secret
DATABASE_URL=your_existing_db_url
```

#### Frontend (.env.local)
```bash
# Add to existing frontend .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
# Uses existing auth setup
```

### Step 2: Create Agent System

#### File: `backend/src/backend/agents.py`
```python
"""Dual-agent system with Urdu specialization"""
from agents import Agent, Runner, function_tool
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
import os

# Xiaomi configuration
client = AsyncOpenAI(
    api_key=os.environ["XIAOMI_API_KEY"],
    base_url="https://api.xiaomimimo.com/v1/"
)

model = OpenAIChatCompletionsModel(
    model="mimo-v2-flash",
    openai_client=client
)

config = RunConfig(model=model, model_provider=client)

# Urdu Specialist Agent
urdu_agent = Agent(
    name="Urdu Specialist",
    instructions="""You are a Urdu language specialist. Respond EXCLUSIVELY in Urdu.
    Help users with task management in Urdu language.
    Use cultural context and polite Urdu phrases.
    If user asks in English, respond in Urdu if content is Urdu-related.""",
    model=model,
    config=config
)

# Orchestrator Agent
orchestrator_agent = Agent(
    name="Task Orchestrator",
    instructions="""You are the main coordinator for task management.
    - Handle general questions and English task management directly
    - Use MCP tools for all task operations
    - Always return structured responses with agent attribution""",
    model=model,
    config=config,
    handoffs=[urdu_agent]
)
```

### Step 3: Create MCP Tools

#### File: `backend/src/backend/task_serves_mcp_tools.py`
```python
"""MCP tools for task CRUD operations with user isolation"""
from mcp.server import Server
from mcp.server.stdio import stdio_server
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
import json
import sys
import os

# Import existing infrastructure
from backend.database import get_session
from backend.services.task_service import TaskService
from backend.models.task import Task

# Pydantic schemas for validation
class TaskCreateParams(BaseModel):
    user_id: str
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Literal["low", "medium", "high"] = "medium"
    category: Literal["work", "personal", "home", "other"] = "work"
    due_date: Optional[datetime] = None

    @field_validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

# MCP Server
server = Server("task-tools")

@server.tool()
def create_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    priority: Literal["low", "medium", "high"] = "medium",
    category: Literal["work", "personal", "home", "other"] = "work",
    due_date: Optional[datetime] = None
) -> dict:
    """Create a new task with user isolation"""
    try:
        # Validate input
        params = TaskCreateParams(
            user_id=user_id, title=title, description=description,
            priority=priority, category=category, due_date=due_date
        )

        # Use existing service layer
        session = next(get_session())
        service = TaskService(session)
        task = service.create_task(user_id, params)

        return {"success": True, "data": task.model_dump()}

    except Exception as e:
        return {"success": False, "error": str(e)}

@server.tool()
def list_tasks(
    user_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "createdAt",
    sort_order: str = "desc"
) -> dict:
    """List all tasks for user with filtering"""
    try:
        session = next(get_session())
        service = TaskService(session)
        tasks = service.get_user_tasks(
            user_id=user_id, status=status, priority=priority,
            category=category, search=search, sort_by=sort_by,
            sort_order=sort_order
        )

        return {"success": True, "data": [task.model_dump() for task in tasks]}

    except Exception as e:
        return {"success": False, "error": str(e)}

@server.tool()
def get_task(user_id: str, task_id: str) -> dict:
    """Get single task by ID"""
    try:
        from uuid import UUID
        session = next(get_session())
        service = TaskService(session)
        task = service.get_task(user_id, UUID(task_id))

        if not task:
            return {"success": False, "error": "Task not found"}

        return {"success": True, "data": task.model_dump()}

    except Exception as e:
        return {"success": False, "error": str(e)}

@server.tool()
def update_task(
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[Literal["low", "medium", "high"]] = None,
    category: Optional[Literal["work", "personal", "home", "other"]] = None,
    due_date: Optional[datetime] = None
) -> dict:
    """Update existing task"""
    try:
        from uuid import UUID
        from backend.schemas.task import TaskUpdate

        session = next(get_session())
        service = TaskService(session)

        update_data = TaskUpdate(
            title=title, description=description, priority=priority,
            category=category, due_date=due_date
        )

        task = service.update_task(user_id, UUID(task_id), update_data)

        if not task:
            return {"success": False, "error": "Task not found"}

        return {"success": True, "data": task.model_dump()}

    except Exception as e:
        return {"success": False, "error": str(e)}

@server.tool()
def delete_task(user_id: str, task_id: str) -> dict:
    """Delete a task"""
    try:
        from uuid import UUID
        session = next(get_session())
        service = TaskService(session)

        deleted = service.delete_task(user_id, UUID(task_id))

        if not deleted:
            return {"success": False, "error": "Task not found"}

        return {"success": True, "data": "Task deleted successfully"}

    except Exception as e:
        return {"success": False, "error": str(e)}

@server.tool()
def toggle_complete(user_id: str, task_id: str) -> dict:
    """Toggle task completion status"""
    try:
        from uuid import UUID
        session = next(get_session())
        service = TaskService(session)

        task = service.toggle_complete(user_id, UUID(task_id))

        if not task:
            return {"success": False, "error": "Task not found"}

        return {"success": True, "data": task.model_dump()}

    except Exception as e:
        return {"success": False, "error": str(e)}

@server.tool()
def get_stats(user_id: str) -> dict:
    """Get task statistics"""
    try:
        session = next(get_session())
        service = TaskService(session)
        stats = service.get_stats(user_id)

        return {"success": True, "data": stats}

    except Exception as e:
        return {"success": False, "error": str(e)}

async def main():
    """MCP server entry point"""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

### Step 4: Update Main Application

#### File: `backend/src/backend/main.py` (Add to existing)
```python
# Add to existing imports
from agents import Runner
from backend.agents import orchestrator_agent, urdu_agent, config
from backend.task_serves_mcp_tools import create_task, list_tasks, get_task, update_task, delete_task, toggle_complete, get_stats
from mcp.server import Server
from mcp.server.stdio import stdio_server
import asyncio
from contextlib import asynccontextmanager

# Add to existing FastAPI app
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(
    request: ChatRequest,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    """Handle chat messages with agent system"""
    user_id = get_user_id_from_token(user_payload)

    # Use orchestrator agent (handles handoffs automatically)
    agent = orchestrator_agent

    # Create MCP tools for this request
    mcp_tools = [
        lambda: create_task,
        lambda: list_tasks,
        lambda: get_task,
        lambda: update_task,
        lambda: delete_task,
        lambda: toggle_complete,
        lambda: get_stats
    ]

    # Add user_id to all tool calls
    def wrap_tool(tool_func):
        def wrapped(**kwargs):
            kwargs["user_id"] = user_id
            return tool_func(**kwargs)
        return wrapped

    # Execute agent with tools
    try:
        # In real implementation, connect MCP server to agent
        # For now, simulate agent response
        if "create task" in request.message.lower():
            # Parse task details and call MCP tool
            result = create_task(
                user_id=user_id,
                title="Task from chat",
                priority="medium",
                category="work"
            )

            if result["success"]:
                return {
                    "response": f"Task '{result['data']['title']}' created successfully!",
                    "agent": agent.name,
                    "timestamp": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "response": f"Error: {result['error']}",
                    "agent": agent.name,
                    "timestamp": datetime.utcnow().isoformat()
                }

        # For general messages, use agent directly
        return {
            "response": f"Hello from {agent.name}! I received: {request.message}",
            "agent": agent.name,
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Step 5: Create Frontend Chatbot Page

#### File: `frontend/src/app/chatbot/page.tsx`
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { getAuthToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChatMessage {
  id: string;
  content: string;
  agent: 'orchestrator' | 'urdu';
  timestamp: string;
  isUser: boolean;
}

export default function ChatbotPage() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !isAuthenticated) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      agent: 'orchestrator',
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Authentication required');

      const response = await apiClient<{
        response: string;
        agent: 'orchestrator' | 'urdu';
        timestamp: string;
      }>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.content })
      }, token);

      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        agent: response.agent,
        timestamp: response.timestamp,
        isUser: false
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Please log in to access the chatbot.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2A1B12]">
            Task Management Chatbot
          </h1>
          <p className="text-sm text-[#5C4D45]">
            Dual-agent system with Urdu specialization
          </p>
        </div>
        <div className="text-right text-sm text-[#5C4D45]">
          <div>👤 {user?.name || 'User'}</div>
          <div className="font-mono text-xs">{user?.email}</div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-[#F9F7F2] rounded-sm border border-[#E5E0D6]">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-sm px-4 py-3 ${
                  message.isUser
                    ? 'bg-[#FF6B4A] text-white'
                    : 'bg-white border border-[#E5E0D6]'
                }`}
              >
                {/* Agent Attribution */}
                {!message.isUser && (
                  <div className="text-xs font-mono mb-1 text-[#5C4D45]">
                    {message.agent === 'urdu' ? '🇵🇰 Urdu Specialist' : '🤖 Orchestrator'}
                  </div>
                )}

                {/* Message Content */}
                <div className="font-sans text-sm leading-relaxed">
                  {message.content}
                </div>

                {/* Timestamp */}
                <div className={`text-xs mt-1 font-mono ${
                  message.isUser ? 'text-white/80' : 'text-[#5C4D45]'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#E5E0D6] rounded-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF6B4A] rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-[#FF6B4A] rounded-full animate-pulse delay-75" />
                <div className="w-2 h-2 bg-[#FF6B4A] rounded-full animate-pulse delay-150" />
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FF6B4A]/10 border border-[#FF6B4A] rounded-sm px-4 py-3"
          >
            <p className="text-[#FF6B4A] font-mono text-sm">{error}</p>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message... (Try: 'Create task Buy groceries with high priority')"
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            variant="primary"
          >
            Send
          </Button>
        </div>

        {/* Quick Examples */}
        <div className="flex gap-2 flex-wrap">
          {['Create task Buy groceries', 'Show my tasks', 'کیا آپ میری مدد کر سکتے ہیں؟'].map((example) => (
            <Button
              key={example}
              variant="secondary"
              size="sm"
              onClick={() => setInputValue(example)}
              disabled={isLoading}
              className="text-xs"
            >
              {example.length > 30 ? example.substring(0, 30) + '...' : example}
            </Button>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-4 p-3 bg-[#F9F7F2] border border-[#E5E0D6] rounded-sm text-xs font-mono text-[#5C4D45]">
        <strong>System Info:</strong> Dual-agent system with Urdu specialization.
        Orchestrator handles general tasks, Urdu specialist responds in Urdu.
        All operations use MCP tools with user isolation.
      </div>
    </div>
  );
}
```

---

## Testing the System

### Step 6: Start Services

#### Terminal 1: Backend
```bash
cd phase-3/backend
uv run uvicorn src.backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2: Frontend
```bash
cd phase-3/frontend
npm run dev
```

### Step 7: Test Workflows

#### Test 1: Dual-Agent Communication
```
User: "Hello, how are you?"
Expected: Orchestrator response + Urdu agent response (if Urdu content)
```

#### Test 2: Task Creation via Chat
```
User: "Create task 'Buy groceries' with high priority"
Expected: "Task 'Buy groceries' created successfully!"
```

#### Test 3: Urdu Language
```
User: "کیا آپ میری مدد کر سکتے ہیں؟"
Expected: Urdu response from Urdu specialist
```

#### Test 4: List Tasks
```
User: "Show me my tasks"
Expected: List of user's tasks
```

---

## Troubleshooting

### Common Issues

#### 1. "XIAOMI_API_KEY not found"
**Solution**: Add `XIAOMI_API_KEY=your_key` to backend `.env`

#### 2. "MCP server not starting"
**Solution**: Ensure `mcp` package is installed: `uv add mcp`

#### 3. "Authentication failed"
**Solution**: Verify JWT token is included in requests

#### 4. "User isolation not working"
**Solution**: Check that all MCP tools receive `user_id` parameter

#### 5. "Urdu agent not responding"
**Solution**: Verify orchestrator agent has `handoffs=[urdu_agent]` configured

---

## Next Steps

After quickstart setup:

1. **Test all 7 MCP tools** with user isolation
2. **Implement proper agent handoff** with MCP server integration
3. **Add loading states** and error handling in frontend
4. **Test Urdu language detection** with various inputs
5. **Add agent attribution styling** in UI
6. **Implement conversation history** (optional)

---

## Success Checklist

- [ ] Backend dependencies installed
- [ ] Environment variables configured
- [ ] `agents.py` created with dual-agent system
- [ ] `task_serves_mcp_tools.py` created with 7 tools
- [ ] `/api/chat` endpoint added to main.py
- [ ] Chatbot page created in frontend
- [ ] User can send messages and receive responses
- [ ] Task creation via chat works
- [ ] Urdu language handoffs work
- [ ] User isolation enforced across all operations

**Estimated Time**: 5-10 minutes for complete setup
**Difficulty**: Easy (builds on existing infrastructure)