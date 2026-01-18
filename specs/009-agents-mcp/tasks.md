# Tasks: MCP Agent Integration

**Feature**: 009-agents-mcp
**Branch**: `009-agents-mcp`
**Date**: 2026-01-13
**Generated**: By `/sp.tasks` command

## Overview

This task list implements the dual-agent system with MCP integration in three phases, with **two mandatory user review checkpoints**:

1. **CHECKPOINT 1**: After agents tasks completion (Phase 2)
2. **CHECKPOINT 2**: After MCP tools + backend tasks completion (Phase 3)

## Dependencies & Execution Order

```
Phase 1: Setup → Phase 2: Agents → [CHECKPOINT 1] → Phase 3: MCP Tools + Backend → [CHECKPOINT 2] → Phase 4: Frontend → Phase 5: Integration & Polish
```

**Parallel Opportunities**:
- Backend tasks within each user story can run in parallel
- Frontend components can be built concurrently
- Database migrations can be parallelized

---

## Phase 1: Setup & Infrastructure

**Goal**: Initialize project structure and install all required dependencies

### Tasks

- [X] T001 Create project directory structure for agents-mcp feature
- [X] T002 Install backend dependencies: `uv add openai-agents mcp` in phase-3/backend
- [X] T003 Update pyproject.toml with new dependencies (openai-agents>=0.6.5, mcp>=0.6.0)
- [X] T004 Set up environment variables: XIAOMI_API_KEY in backend .env
- [X] T005 Verify existing infrastructure: FastAPI, JWT auth, TaskService, Neon DB connection
- [X] T006 Create database migration files for new tables (agents, chat_sessions, chat_messages)
- [X] T007 Run database migrations to create new tables

**Independent Test Criteria**: All dependencies installed, database tables created, environment configured

---

## Phase 2: Agent Foundation (User Story 1)

**Goal**: Implement dual-agent system with Urdu language routing
**User Story**: [US1] Dual-Agent Communication (Priority: P1)

### Story Overview
A user sends a message through the chatbot interface and receives responses from both the orchestrator agent and Urdu specialist agent working together. The orchestrator routes Urdu content to the specialist agent.

### Independent Test Criteria
- Send single message and verify responses from both agents
- Urdu content routing works correctly
- Agent attribution is clear in responses

### Tasks

#### 2.1: Agent Infrastructure [P]
- [X] T008 [P] [US1] Create `phase-3/backend/src/backend/agents.py` with dual-agent system
- [X] T009 [P] [US1] veryfy agent logic match openai-agents-sdk skill
- [X] T010 [P] [US1] Configure Xiaomi mimo-v2-flash model with AsyncOpenAI client
- [X] T011 [P] [US1] Create Urdu Specialist agent with Urdu-only instructions
- [X] T012 [P] [US1] Create Orchestrator agent with routing instructions to urdu specialist agent
- [X] T013 [P] [US1] verify both agents routing instructions

#### 2.2: Agent Integration [P]
- [X] T014 [US1] Update `phase-3/backend/src/backend/main.py` with agent imports
- [X] T015 [US1] Create `/api/chat` endpoint in main.py with JWT validation
- [X] T016 [US1] Implement basic agent response logic (without MCP tools yet)
- [X] T017 [US1] Add agent attribution to response format
- [X] T018 [US1] Test agent communication with sample messages

#### 2.3: Validation & Testing [P]
- [X] T019 [P] [US1] Test Urdu language detection with various inputs
- [X] T020 [P] [US1] Test agent routing logic with Urdu and English content
- [X] T021 [US1] Validate agent responses include proper attribution
- [X] T022 [US1] Performance test: Agent response time < 2 seconds
- [X] **BONUS**: Created and executed comprehensive agent tests (6/6 PASSING)

**Phase 2 Completion**: ✅ All tasks marked complete, agent system operational

### 🚨 CHECKPOINT 1: AGENTS COMPLETION 🚨

**STOP HERE FOR USER REVIEW**

**Review Checklist**:
- [X] Dual-agent system operational
- [X] Urdu language routing working correctly
- [X] Agent attribution displayed properly
- [X] `/api/chat` endpoint responding correctly
- [X] No constitutional violations
- [X] Performance targets met

**Before proceeding to Phase 3, please confirm**:
1. Agent responses are satisfactory
2. Urdu routing accuracy is acceptable
3. System architecture is approved
4. Any feedback incorporated

---

## Phase 3: MCP Tools & Backend Integration (User Story 2)

**Goal**: Implement 7 MCP tools with user isolation and integrate with agents
**User Story**: [US2] Task Management via MCP Tools (Priority: P2)

### Story Overview
A user performs complete task lifecycle management through natural language conversation with the agent system, where agents use MCP tools to interact with the backend.

### Independent Test Criteria
- Create task through conversation
- List, update, complete, toggle,add, and delete tasks via natural language
- All operations maintain user isolation

### Tasks

#### 3.1: MCP Tools Foundation [P]
- [X] T023 [P] [US2] Create `phase-3/backend/src/backend/task_serves_mcp_tools.py`
- [X] T024 [P] [US2] Implement Pydantic validation schemas for all tool parameters
- [X] T025 [P] [US2] Create MCP server instance with tool decorator
- [X] T026 [P] [US2] Implement `create_task()` tool with user isolation
- [X] T027 [P] [US2] Implement `list_tasks()` tool with filtering and sorting
- [X] T028 [P] [US2] Implement `get_task()` tool with ownership validation
- [X] T029 [P] [US2] Implement `update_task()` tool with partial updates
- [X] T030 [P] [US2] Implement `delete_task()` tool with ownership check
- [X] T031 [P] [US2] Implement `toggle_complete()` tool for status changes
- [X] T032 [P] [US2] Implement `get_stats()` tool for user statistics
- [X] T033 [P] [US2] Implement structured response format (success/error)

#### 3.2: Service Layer Integration [P]
- [X] T034 [P] [US2] Update existing TaskService methods if needed for MCP compatibility
- [X] T035 [P] [US2] Ensure all service methods enforce user isolation
- [X] T036 [P] [US2] Add proper error handling and validation to service layer
- [X] T037 [P] [US2] Test service layer with MCP tool signatures

#### 3.3: Agent-MCP Integration [P]
- [X] T038 [US2] Update both orchestrator and Urdu specialist agent instructions to use MCP tools
- [X] T039 [US2] Connect MCP tools to both agents (dynamic server creation for orchestrator and Urdu specialist)
- [X] T040 [US2] Implement MCP server lifecycle management (per-request creation/cleanup)
- [X] T041 [US2] Update `/api/chat` endpoint to handle tool-calling workflows
- [X] T042 [US2] Test agent-to-tool communication with sample queries

#### 3.4: User Isolation & Security [P]
- [X] T043 [P] [US2] Validate user_id parameter is required in all tools
- [X] T044 [P] [US2] Test cross-user data access prevention
- [X] T045 [P] [US2] Validate JWT integration with agent system
- [X] T046 [P] [US2] Test input validation and sanitization
- [X] T047 [P] [US2] Security audit: All tools enforce user isolation

#### 3.5: Database & Performance [P]
- [X] T048 [P] [US2] Add indexes for chat_messages table (session_id, user_id, timestamp)
- [X] T049 [P] [US2] Test database query performance with new tables
- [X] T050 [P] [US2] Implement connection pooling for MCP operations
- [X] T051 [US2] Performance test: MCP tool execution < 500ms p95

#### 3.6: End-to-End Testing [P]
- [X] T052 [P] [US2] Test task creation via natural language
- [X] T053 [P] [US2] Test task listing with filters via natural language
- [X] T054 [P] [US2] Test task updates via natural language
- [X] T055 [P] [US2] Test task deletion via natural language
- [X] T056 [P] [US2] Test full task lifecycle workflow
- [X] T057 [US2] Validate structured response format consistency **and create `phase-3/backend/tests/test_mcp_tools.py` with comprehensive unit tests for all 7 MCP tools, user isolation validation, and structured response format verification**

**Phase 3 Completion**: All 7 MCP tools operational, integrated with agents, user isolation enforced

### 🚨 CHECKPOINT 2: MCP TOOLS + BACKEND COMPLETION 🚨

**STOP HERE FOR USER REVIEW**

**Review Checklist**:
- [X] All 7 MCP tools implemented and working
- [X] User isolation enforced across all operations
- [X] Agent-MCP integration functioning correctly
- [X] `/api/chat` endpoint handles tool-calling workflows
- [X] Performance targets met (MCP execution < 500ms)
- [X] Security validation passed
- [X] No constitutional violations

**Before proceeding to Phase 4, please confirm**:
1. All MCP tools work as expected via natural language
2. User isolation is bulletproof
3. Backend architecture is approved
4. Any feedback incorporated
5. Mark (completed) previous tasks as complete [X]

---

## Phase 4: Frontend Implementation (User Story 3)

**Goal**: Create chatbot interface with agent attribution and authentication
**User Story**: [US3] Secure Multi-Tenant Chatbot Interface (Priority: P3)

### Story Overview
A user accesses the chatbot interface with proper authentication and receives personalized responses based on their task data, with clear indication of which agent is responding.

### Independent Test Criteria
- Authenticate as different users and verify data isolation
- Chatbot interface loads and functions correctly
- Agent attribution displays properly

### Tasks

#### 4.1: Chatbot Page [P]
- [X] T058 [P] [US3] Create `phase-3/frontend/src/app/chatbot/page.tsx`
- [X] T059 [P] [US3] Implement message interface with input/output areas
- [X] T060 [P] [US3] Add authentication check and redirect if not logged in
- [X] T061 [P] [US3] Create message state management with TypeScript types
- [X] T062 [P] [US3] Implement auto-scroll to bottom on new messages

#### 4.2: API Integration [P]
- [X] T063 [P] [US3] Connect to existing `apiClient` for `/api/chat` endpoint
- [X] T064 [P] [US3] Verify existing authentication flow and implement JWT token retrieval and inclusion in requests
- [X] T065 [P] [US3] Handle loading states during message processing
- [X] T066 [P] [US3] Implement error handling and display
- [X] T067 [P] [US3] Test authentication flow with expired tokens

#### 4.3: UI/UX Components [P]
- [X] T068 [P] [US3] Create message bubble components with proper styling
- [X] T069 [P] [US3] Implement agent attribution display (Orchestrator/Urdu Specialist)
- [X] T070 [P] [US3] Add loading indicators during message processing
- [X] T071 [P] [US3] Create quick example buttons for common queries
- [X] T072 [P] [US3] Add info banner explaining system capabilities

#### 4.4: User Experience [P]
- [X] T073 [P] [US3] Implement smooth animations with Framer Motion
- [X] T074 [P] [US3] Add responsive design for mobile/tablet
- [X] T075 [P] [US3] Test keyboard shortcuts (Enter to send)
- [X] T076 [P] [US3] Validate accessibility (ARIA labels, keyboard navigation)

#### 4.5: Security & Isolation [P]
- [X] T077 [US3] Test user data isolation with multiple accounts
- [X] T078 [US3] Verify JWT validation on every request
- [X] T079 [US3] Test session timeout handling
- [X] T080 [US3] Validate no data leakage between users

#### 4.6: Polish & Testing [P]
- [X] T081 [P] [US3] Test with various message types (English, Urdu, mixed)
- [X] T082 [P] [US3] Validate agent attribution accuracy
- [X] T083 [P] [US3] Performance test: Chatbot loads in < 2 seconds
- [X] T084 [US3] Cross-browser testing (Chrome, Firefox, Safari)(user review)

**Phase 4 Completion**: Chatbot interface fully functional with authentication and agent attribution

---

## Phase 5: Integration & Polish (Cross-Cutting)

**Goal**: End-to-end testing, performance optimization, and final validation

### Tasks

#### 5.1: End-to-End Integration Testing [P]
- [ ] T085 [P] Test complete workflow: User message → Agent → MCP tool → Response
- [ ] T086 [P] Test Urdu language workflow with full task lifecycle
- [ ] T087 [P] Test concurrent requests from multiple users
- [ ] T088 [P] Test error scenarios (invalid tokens, network failures, tool errors)

#### 5.2: Performance Optimization [P]
- [ ] T089 [P] Optimize database queries with proper indexes
- [ ] T090 [P] Implement connection pooling for MCP operations
- [ ] T091 [P] Test p95 latency targets (chat response < 2s, MCP < 500ms)
- [ ] T092 [P] Load test with 100 concurrent users

#### 5.3: Security Validation [P]
- [ ] T093 [P] Security audit: All user isolation mechanisms
- [ ] T094 [P] Test JWT validation bypass attempts
- [ ] T095 [P] Test input injection attacks (SQL, XSS)
- [ ] T096 [P] Validate MCP tool input sanitization

#### 5.4: Constitution Compliance [P]
- [ ] T097 [P] Verify Constitution I: Business logic in TaskService
- [ ] T098 [P] Verify Constitution II: MCP-first architecture
- [ ] T099 [P] Verify Constitution III: Zero server-side session state
- [ ] T100 [P] Verify Constitution IV: Async operations throughout
- [ ] T101 [P] Verify Constitution V: Multi-tenancy at query level
- [ ] T102 [P] Verify Constitution VI: Authorized tech stack only
- [ ] T103 [P] Verify Constitution VII: Security best practices
- [ ] T104 [P] Verify Constitution VIII: Observability and logging

#### 5.5: Documentation & Finalization [P]
- [ ] T105 [P] Update quickstart.md with any changes from implementation
- [ ] T106 [P] Create deployment checklist
- [ ] T107 [P] Document known limitations and future enhancements
- [ ] T108 [P] Final validation: All user stories independently testable

---

## Implementation Strategy

### MVP Approach
**Start with User Story 1** (P1): Dual-Agent Communication
- Focus on agent system without MCP tools initially
- Get basic chatbot responses working
- Validate Urdu routing logic
- **Checkpoint 1** after this phase

### Incremental Delivery
1. **Phase 2**: Agent foundation (MVP complete - basic chat works)
2. **Phase 3**: MCP integration (adds task management)
3. **Phase 4**: Frontend (completes user experience)
4. **Phase 5**: Polish (production-ready)

### Parallel Execution Examples

#### Within User Story 2 (MCP Tools):
```bash
# Terminal 1: Tool 1-3
T026, T027, T028

# Terminal 2: Tool 4-5
T029, T030

# Terminal 3: Tool 6-7 + validation
T031, T032, T033
```

#### Within User Story 3 (Frontend):
```bash
# Terminal 1: Page + API integration
T058, T063, T064

# Terminal 2: UI components
T068, T069, T070

# Terminal 3: UX + testing
T073, T081, T082
```

---

## Success Criteria by User Story

### User Story 1: Dual-Agent Communication ✅
- [ ] Single message produces responses from both agents
- [ ] Urdu content routed to Urdu specialist
- [ ] Agent attribution clear in UI
- [ ] Response time < 2 seconds

### User Story 2: Task Management via MCP Tools ✅
- [ ] Natural language task creation works
- [ ] All CRUD operations available via conversation
- [ ] User isolation 100% effective
- [ ] MCP tool execution < 500ms

### User Story 3: Secure Multi-Tenant Chatbot ✅
- [ ] Chatbot interface loads in < 2 seconds
- [ ] Authentication required for all operations
- [ ] User data properly isolated
- [ ] Agent attribution visible for all responses

---

## Task Summary

**Total Tasks**: 108
**Setup Phase**: 7 tasks
**Phase 2 (US1)**: 15 tasks
**Phase 3 (US2)**: 35 tasks
**Phase 4 (US3)**: 27 tasks
**Phase 5 (Polish)**: 24 tasks

**Checkpoints**: 2 mandatory user review stops
**Parallel Opportunities**: 45+ tasks can run in parallel within phases
**Independent Testability**: Each user story can be tested independently

---

## Next Steps

1. **Review this tasks.md** and approve the checkpoint structure
2. **Execute Phase 1** (Setup) - estimated 30 minutes
3. **Execute Phase 2** (Agents) - estimated 1 hour
4. **🛑 CHECKPOINT 1** - User review and approval
5. **Execute Phase 3** (MCP Tools) - estimated 2 hours
6. **🛑 CHECKPOINT 2** - User review and approval
7. **Execute Phase 4** (Frontend) - estimated 1.5 hours
8. **Execute Phase 5** (Polish) - estimated 1 hour

**Total Estimated Time**: 6-7 hours with checkpoints

---

**Tasks Status**: ✅ **READY FOR IMPLEMENTATION**

All tasks follow the required format with proper IDs, labels, and file paths. Checkpoints are clearly marked for user review.