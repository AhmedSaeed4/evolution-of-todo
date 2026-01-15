# Research: MCP Agent Integration

**Feature**: 009-agents-mcp
**Date**: 2026-01-13
**Purpose**: Resolve all technical unknowns and clarify implementation details

---

## Research Questions

### 1. OpenAI Agents SDK Integration
**Question**: How to integrate OpenAI Agents SDK with existing FastAPI backend?

**Decision**: Use OpenAI Agents SDK with Xiaomi mimo-v2-flash model via AsyncOpenAI client
**Rationale**:
- Constitution VI mandates OpenAI Agents SDK as authorized technology
- Xiaomi mimo-v2-flash is specified in skill documentation
- AsyncOpenAI provides non-blocking operations for FastAPI
- Compatible with existing async/await patterns in backend

**Implementation Pattern**:
```python
from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig

client = AsyncOpenAI(
    api_key=os.environ["XIAOMI_API_KEY"],
    base_url="https://api.xiaomimimo.com/v1/"
)

model = OpenAIChatCompletionsModel(
    model="mimo-v2-flash",
    openai_client=client
)

config = RunConfig(model=model, model_provider=client)
```

**Alternatives Considered**: Direct OpenAI API calls (rejected - violates Constitution II)

---

### 2. MCP Server Lifecycle Management
**Question**: How to handle MCP server creation/cleanup per request to prevent resource leaks?

**Decision**: Dynamic MCP server creation per request with try/finally cleanup
**Rationale**:
- FR-009 requires MCP server lifecycle management
- Constitution III mandates strict statelessness
- Prevents memory leaks and connection exhaustion
- Aligns with MCP Integration Skill patterns

**Implementation Pattern**:
```python
async def handle_chat_request(user_id: str, message: str):
    server = None
    try:
        server = MCPServerStdio(
            name="task-tools",
            command="python",
            args=["-m", "backend.task_serves_mcp_tools"],
            env={**os.environ, "USER_ID": user_id}
        )
        await server.connect()
        # Use server with agents
        # Return structured response
    finally:
        if server:
            await server.cleanup()
```

**Alternatives Considered**:
- Static server (rejected - violates Constitution III)
- Connection pooling (rejected - overcomplicated for current scope)

---

### 3. Urdu Language Detection
**Question**: How to detect Urdu content and route to Urdu agent?

**Decision**: Unicode range detection + keyword matching
**Rationale**:
- Urdu uses Arabic script with specific characters (U+0600-U+06FF, U+FB50-U+FDFF, U+FE70-U+FEFF)
- Simple, fast detection without external dependencies
- Fallback to orchestrator for mixed content
- Cultural context preservation

**Implementation Pattern**:
```python
def is_urdu_content(text: str) -> bool:
    urdu_ranges = [(0x0600, 0x06FF), (0xFB50, 0xFDFF), (0xFE70, 0xFEFF)]
    urdu_keywords = ["کیا", "ہے", "ہیں", "کریں", "ہو"]  # Common Urdu words

    has_urdu_chars = any(
        any(start <= ord(char) <= end for start, end in urdu_ranges)
        for char in text
    )

    has_urdu_keywords = any(keyword in text for keyword in urdu_keywords)

    return has_urdu_chars or has_urdu_keywords
```

**Alternatives Considered**:
- External NLP library (rejected - adds complexity)
- Manual routing (rejected - poor UX)

---

### 4. MCP Tool User Isolation
**Question**: How to enforce user isolation at MCP tool level?

**Decision**: Pass user_id as required parameter to all MCP tools
**Rationale**:
- FR-005 requires user isolation at tool level
- Constitution V mandates zero-trust multi-tenancy
- Prevents cross-user data access
- Aligns with existing backend user scoping

**Implementation Pattern**:
```python
@mcp.tool()
def create_task(user_id: str, title: str, priority: str, category: str) -> dict:
    """Create a task for specific user"""
    try:
        # Use existing TaskService with user_id
        service = TaskService(session)
        task = service.create_task(user_id, task_data)
        return {"success": True, "data": task}
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**Alternatives Considered**:
- Session-based isolation (rejected - violates statelessness)
- JWT in tool context (rejected - too implicit)

---

### 5. Frontend Chatbot Integration
**Question**: How to connect frontend to backend agent endpoint?

**Decision**: Use existing apiClient with JWT authentication
**Rationale**:
- Leverages existing authentication infrastructure
- Consistent with current frontend patterns
- Reuses error handling and loading states
- Maintains type safety

**Implementation Pattern**:
```typescript
// In new chatbot page
const sendMessage = async (message: string) => {
  const token = await getAuthToken();
  const response = await apiClient<{
    response: string;
    agent: "orchestrator" | "urdu"
  }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  }, token);
  return response;
};
```

**Alternatives Considered**:
- Direct WebSocket (rejected - not specified in requirements)
- Server-Sent Events (rejected - complex for current scope)

---

### 6. Agent Attribution Display
**Question**: How to show which agent generated each response in UI?

**Decision**: Return agent metadata in API response, display in UI
**Rationale**:
- FR-008 requires agent attribution
- Simple API response structure
- Clear visual distinction in UI
- Consistent with existing toast/notification patterns

**Implementation Pattern**:
```python
# Backend response
{
    "response": "Task created successfully",
    "agent": "orchestrator",
    "timestamp": "2026-01-13T10:00:00Z"
}

# Frontend display
<div className="agent-attribution">
  <span className={`agent-badge ${agent}`}>
    {agent === 'urdu' ? ' Urdu Specialist' : 'Orchestrator'}
  </span>
  <p>{response}</p>
</div>
```

**Alternatives Considered**:
- Separate API calls per agent (rejected - complex)
- Hidden attribution (rejected - violates FR-008)

---

### 7. Structured Response Format
**Question**: What exact format for MCP tool responses?

**Decision**: `{success: boolean, data?: any, error?: string}` format
**Rationale**:
- FR-010 requires structured responses
- Consistent error handling across all tools
- Frontend can parse uniformly
- Aligns with MCP Integration Skill patterns

**Implementation Pattern**:
```python
# Success case
{"success": True, "data": {"id": "123", "title": "Task"}}

# Error case
{"success": False, "error": "Task not found"}

# Validation error
{"success": False, "error": "Invalid priority: must be low/medium/high"}
```

**Alternatives Considered**:
- Direct exceptions (rejected - inconsistent)
- HTTP status codes (rejected - MCP tools don't use HTTP)

---

### 8. FastAPI + Agent Integration
**Question**: How to integrate agents into existing FastAPI app?

**Decision**: Add `/api/chat` endpoint that starts agent system per request
**Rationale**:
- Maintains existing FastAPI structure
- No persistent agent state (Constitution III)
- Single entry point (FR-001)
- Reuses existing auth and error handling

**Implementation Pattern**:
```python
@app.post("/api/chat")
async def chat_endpoint(
    request: ChatRequest,
    user_payload: dict = Depends(validate_and_get_user),
    session: Session = Depends(get_session)
):
    user_id = get_user_id_from_token(user_payload)

    # Create MCP server with user context
    # Initialize agents
    # Route message
    # Return response with attribution

    return {"response": result, "agent": agent_name}
```

**Alternatives Considered**:
- Persistent agent instances (rejected - violates statelessness)
- Separate agent service (rejected - violates single entry point)

---

## Technology Stack Validation

### ✅ Constitution Compliance
- **Python 3.13+**: ✅ Already in use
- **FastAPI**: ✅ Already in use
- **SQLModel**: ✅ Already in use
- **OpenAI Agents SDK**: ✅ Authorized
- **Xiaomi mimo-v2-flash**: ✅ Authorized
- **MCP SDK**: ✅ Authorized

### ✅ Security Requirements
- **JWT validation**: ✅ Existing infrastructure
- **User isolation**: ✅ Will use user_id parameter
- **Input validation**: ✅ Pydantic schemas
- **No hardcoded secrets**: ✅ Environment variables

### ✅ Operational Requirements
- **Structured logging**: ✅ Existing logging setup
- **Observability**: ✅ Will use existing patterns
- **Statelessness**: ✅ Dynamic server creation

---

## Risk Mitigation

### Risk 1: Agent Coordination Complexity
**Mitigation**: Clear routing logic with fallback to orchestrator
**Test**: Validate with sample Urdu and English queries

### Risk 2: MCP Server Resource Leaks
**Mitigation**: Try/finally cleanup pattern
**Test**: Monitor memory usage during load testing

### Risk 3: Urdu Detection Accuracy
**Mitigation**: Unicode + keyword detection with manual override
**Test**: Validate with diverse Urdu/English mixed content

### Risk 4: Performance Impact
**Mitigation**: Async operations, per-request server creation
**Test**: Measure p95 latency for chat endpoint

---

## Implementation Prerequisites

### Backend Prerequisites
1. ✅ **Existing**: FastAPI app with JWT auth
2. ✅ **Existing**: TaskService with CRUD operations
3. ✅ **Existing**: Database connection
4. ❌ **Missing**: OpenAI Agents SDK dependency
5. ❌ **Missing**: MCP server tools file
6. ❌ **Missing**: Agent orchestration logic

### Frontend Prerequisites
1. ✅ **Existing**: Next.js App Router setup
2. ✅ **Existing**: Authentication context
3. ✅ **Existing**: API client utilities
4. ✅ **Existing**: UI components and styling
5. ❌ **Missing**: Chatbot page and components

---

## Next Steps

Based on this research, the implementation plan will proceed with:

1. **Phase 1**: Agent foundation (agents.py + main.py updates)
2. **Phase 2**: MCP integration (tools file + security)
3. **Phase 3**: Frontend chatbot (UI + integration)

All technical unknowns have been resolved. Ready for detailed implementation planning.