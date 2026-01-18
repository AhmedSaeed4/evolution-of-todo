---
id: 0001
title: Create MCP Agent Integration Spec
stage: spec
date: 2026-01-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: 009-agents-mcp
branch: 009-agents-mcp
user: user
command: /sp.specify
labels: [specification, mcp, agents, phase-3]
links:
  spec: specs/009-agents-mcp/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-agents-mcp/spec.md (created)
  - specs/009-agents-mcp/checklists/requirements.md (created)
tests:
  - Specification quality validation (completed)
  - All checklist items passed
---

## Prompt

name the new branch "009-agents-mcp" and here are the specs:# Phase 3: MCP Agent Integration Specification

## Executive Summary
Build a dual-agent system with Urdu language specialization, integrate MCP tools for CRUD operations, and create a frontend chatbot interface. Three-phase approach: Agent foundation → MCP integration → UI development.

---

## Phase 1: Agent Foundation

### Business Objectives
- **Dual-Agent System**: Orchestrator agent + Urdu specialist agent
- **Single Entry Point**: One main.py file to start complete agent system
- **Agent Communication**: Orchestrator routes tasks to Urdu agent
- **Language Specialization**: Urdu agent responds exclusively in Urdu
- **API Ready**: Backend prepared for MCP integration

### Technical Architecture
- **Framework**: OpenAI Agents SDK with Xiaomi mimo-v2-flash model
- **Agent Structure**:
  - `agents.py`: Single file containing both orchestrator and Urdu agent
  - **Orchestrator Agent**: Main router with coordination logic
  - **Urdu Agent**: Urdu language specialist with cultural context
- **Main Entry**: `main.py` with FastAPI setup and agent registration
- **API Endpoint**: `/api/chat` for agent communication (placeholder for Phase 2)

### Success Criteria
- ✅ Single agents.py file created with both agents
- ✅ Orchestrator agent coordinates with Urdu agent collaboratively
- ✅ Urdu agent responds exclusively in Urdu language
- ✅ Single main.py starts complete agent system
- ✅ API endpoint structure ready for MCP integration

---

## Phase 2: MCP Integration

### Business Objectives
- **CRUD Operations**: All create, read, update, delete functionality
- **MCP Tools**: Single file containing all operational tools
- **Agent Enhancement**: Both agents gain tool-calling capabilities
- **User Isolation**: All operations scoped to individual users
- **Security**: JWT-based authentication and authorization

### Technical Architecture
- **MCP Server**: `task_serves_mcp_tools.py` with all CRUD operations
- **Tool Operations**:
  - **Create**: Add new items with user context
  - **Read**: Retrieve items with filtering and pagination
  - **Update**: Modify existing items
  - **Delete**: Remove items with validation
  - **List**: Search and filter user-specific items
- **Integration**: Connect MCP server to both agents
- **Security Layer**: JWT validation and user_id extraction

### Success Criteria
- ✅ MCP tools file contains all CRUD operations
- ✅ Both agents can call MCP tools
- ✅ User isolation works across all operations
- ✅ Structured responses with {success, data/error} format
- ✅ Main.py updated to include MCP server lifecycle

---

## Phase 3: Frontend UI Development

### Business Objectives
- **Chatbot Interface**: New page for user-agent interaction
- **Real-time Communication**: Connect to backend agent endpoint
- **User Experience**: Message input/output
- **Agent Visibility**: Show which agent is responding
- **Error Handling**: Graceful failure states and loading indicators

### Technical Architecture
- **Frontend**: Next.js App Router page at `/chatbot`
- **Integration**: Connects to `/api/chat` endpoint from Phase 1
- **Features**:
  - Message input component
  - Response display with agent attribution
  - Loading states and error boundaries
  - JWT authentication handling
- **Styling**: Consistent with existing project design

### Success Criteria
- ✅ New chatbot page created in frontend
- ✅ Successfully connects to backend agent endpoint
- ✅ Displays responses from both agents correctly
- ✅ Handles authentication and errors gracefully

---

## Implementation Roadmap

### Phase 1: Agent Foundation
1. Create `agents.py` with both orchestrator and Urdu agent
2. Build `main.py` with FastAPI + agent registration
3. Implement `/api/chat` endpoint structure
4. Test agent communication without tools

### Phase 2: MCP Integration
1. Create `task_serves_mcp_tools.py` with all CRUD operations
2. Update `main.py` to include MCP server lifecycle
3. Connect MCP tools to both agents
4. Implement JWT authentication and user isolation
5. Test CRUD operations through agents

### Phase 3: Frontend UI
1. Create `/chatbot` page in Next.js app
2. Build message input/output components
3. Connect to backend `/api/chat` endpoint
4. Implement agent response display
5. Add loading states and error handling

---

## File Structure

```
├── backend/
│   ├── main.py                    # Phase 1: API entry point
│   ├── agents.py                  # Phase 1: Both orchestrator + Urdu agent
│   └── task_serves_mcp_tools.py  # Phase 2: All CRUD operations
├── frontend/
    └── app/chatbot/page.tsx      # Phase 3: Chatbot interface
```

---

## Acceptance Criteria

### Phase 1 Complete When:
- [ ] `agents.py` created with both orchestrator and Urdu agent
- [ ] `main.py` starts complete agent system
- [ ] `/api/chat` endpoint responds with agent output
- [ ] Urdu agent responds exclusively in Urdu

### Phase 2 Complete When:
- [ ] `task_serves_mcp_tools.py` contains all CRUD operations
- [ ] MCP server integrated into main.py
- [ ] Both agents can perform CRUD via MCP tools
- [ ] User isolation works across all operations
- [ ] JWT authentication validates user context

### Phase 3 Complete When:
- [ ] `/chatbot` page created in frontend
- [ ] Page connects to backend `/api/chat` endpoint
- [ ] Message input/output interface functional
- [ ] Agent attribution displayed correctly
- [ ] Error handling and loading states implemented

---

## Key Business Requirements

### Single-File Backend
- **Constraint**: main.py must start complete system
- **Approach**: Import agents and MCP tools, register with FastAPI
- **Benefit**: Simplified deployment and debugging

### Dual-Agent Specialization
- **Orchestrator**: General purpose, task routing
- **Urdu Agent**: Language specialist, cultural context
- **Value**: Optimized responses for Urdu content

### MCP Tool Integration
- **Centralization**: All CRUD in single tools file
- **Reusability**: Both agents share same operations
- **Security**: User isolation at tool level

### Frontend Connectivity
- **Direct Connection**: Frontend → Backend API
- **Authentication**: JWT token handling
- **User Experience**: Real-time agent responses

---

## Risk Considerations

### Technical Risks
- **Agent Coordination**: Ensure proper routing between agents
- **MCP Lifecycle**: Manage server creation/cleanup per request
- **Language Quality**: Urdu agent output validation

### Mitigation Strategies
- **Testing**: Validate agent routing with sample queries
- **Monitoring**: Track MCP server instances and memory
- **Fallback**: Language detection and routing validation

---

## Next Steps
1. **Immediate**: Create Phase 1 agents.py and main.py
2. **Follow-up**: Implement Phase 2 MCP tools integration
3. **Final**: Build Phase 3 frontend chatbot interface
4. **Validation**: Test end-to-end user workflows

## Response snapshot

Created comprehensive specification for MCP Agent Integration feature (branch 009-agents-mcp). The specification includes:

1. **Three-phase implementation approach**:
   - Phase 1: Dual-agent system with Urdu specialization
   - Phase 2: MCP tools integration for CRUD operations
   - Phase 3: Frontend chatbot interface

2. **Complete SDD-compliant specification** with:
   - User stories (3 prioritized scenarios)
   - Functional requirements (10 requirements)
   - Architecture requirements (9 requirements)
   - Success criteria (7 measurable outcomes)
   - Edge cases (8 scenarios)
   - Technical glossary
   - FR-to-acceptance mapping
   - Assumptions section

3. **Quality validation**:
   - Created requirements checklist
   - Fixed all implementation details
   - Made specification technology-agnostic
   - Added stakeholder-friendly glossary
   - All checklist items pass

4. **Key features**:
   - Single-file backend architecture
   - Dual-agent coordination (Orchestrator + Urdu specialist)
   - User-isolated MCP tools for CRUD operations
   - JWT-based security
   - Chatbot UI with agent attribution

## Outcome

- ✅ Impact: Created production-ready specification for Phase-3 AI agent integration
- 🧪 Tests: Specification quality validation completed - all items pass
- 📁 Files:
  - specs/009-agents-mcp/spec.md (main specification)
  - specs/009-agents-mcp/checklists/requirements.md (quality checklist)
- 🔁 Next prompts: /sp.plan (create implementation plan)
- 🧠 Reflection: Successfully transformed feature description into comprehensive, testable specification following SDD methodology

## Evaluation notes (flywheel)

- Failure modes observed: Initial spec had implementation details (OpenAI SDK, FastAPI, etc.) - fixed by removing tech references
- Graders run and results (PASS/FAIL): PASS - all quality criteria met
- Prompt variant (if applicable): Standard SDD specification creation
- Next experiment (smallest change to try): Ready for /sp.plan to create detailed implementation tasks
