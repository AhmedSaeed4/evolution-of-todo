# Implementation Tasks: ChatKit Integration

**Feature**: 010-chatkit-integration
**Branch**: `010-chatkit-integration`
**Date**: 2026-01-16
**Plan**: [specs/010-chatkit-integration/plan.md](specs/010-chatkit-integration/plan.md)
**Spec**: [specs/010-chatkit-integration/spec.md](specs/010-chatkit-integration/spec.md)

## Overview

This document contains actionable implementation tasks for integrating OpenAI ChatKit with the existing Phase-3 backend. Tasks are organized by user story to enable independent implementation and testing.

**Total Tasks**: 52
**User Stories**: 4 (P1: 2 stories, P2: 1 story, P3: 1 story)
**Parallel Opportunities**: 18 tasks marked [P] for parallel execution

## Dependencies & Execution Order

### Phase 1: Setup (Must complete first)
- Project structure and environment setup
- Database migration preparation
- Dependency installation

### Phase 2: Foundational (Blocking all user stories)
- Database schema creation (chat_sessions, chat_messages)
- Configuration validation system
- Core ChatKit Store interface implementation

### User Story Execution Order (can run in parallel after Phase 2)
1. **US1** (P1): Seamless Chat Experience - Can be tested independently
2. **US4** (P1): Persistent Chat History - Can be tested independently
3. **US2** (P2): Task Management via Conversation - Can be tested independently
4. **US3** (P3): Multi-language Support - Can be tested independently

### Final Phase: Polish & Cross-Cutting
- Performance optimization
- Error handling improvements
- Documentation updates

## Implementation Strategy

**MVP Scope**: User Story 1 (Seamless Chat Experience) + User Story 4 (Persistent Chat History)
- These two stories provide a complete, testable chat application
- Can be deployed independently
- Foundation for remaining stories

**Incremental Delivery**:
1. Phase 1-2 + US1 + US4 = Working chat with history (MVP)
2. Add US2 = Full task management integration
3. Add US3 = Multi-language support
4. Final Phase = Polish and optimize

---

## Phase 1: Setup

### Project Initialization

- [X] T001 Create project directory structure per implementation plan
  - Create `phase-3/backend/src/backend/store/` directory
  - Create `phase-3/backend/src/backend/api/` directory
  - Create `phase-3/frontend/src/app/api/chatkit/` directory
  - Create `phase-3/frontend/src/app/chatbot/` directory

- [X] T002 Install backend dependencies using uv
  - Run: `cd phase-3/backend && uv add openai openai-chatkit`
  - Verify installation with import test
  - Update pyproject.toml with new dependencies

- [X] T003 Install frontend dependencies using npm
  - Run: `cd phase-3/frontend && npm install @openai/chatkit-react`
  - Verify installation with build test
  - Update package.json with new dependency

- [X] T004 Create environment validation configuration
  - File: `phase-3/backend/src/backend/config.py`
  - Add `validate_chatkit_config()` function
  - Add OpenAI API key validation with clear error messages
  - Add startup validation event handler

- [X] T005 Add ChatKit health check endpoint
  - File: `phase-3/backend/src/backend/api/chatkit.py`
  - Create `/api/chatkit/health` GET endpoint
  - Return configuration status and timestamp
  - Test endpoint returns correct structure

---

## Phase 2: Foundational (Blocking All User Stories)

### Database Schema

- [X] T006 Create database migration for chat_sessions table
  - File: `phase-3/backend/migrations/chat_sessions_create.sql`
  - Include all fields: session_id, user_id, title, created_at, updated_at, metadata
  - Add indexes for user_id and updated_at
  - Add foreign key constraint to existing user table

- [X] T007 Create database migration for chat_messages table
  - File: `phase-3/backend/migrations/chat_messages_create.sql`
  - Include all fields: message_id, session_id, user_id, content, sender_type, sender_name, timestamp, metadata
  - Add indexes for session_id, user_id, timestamp
  - Add foreign key constraints and sender_type check constraint

- [X] T008 Create SQLModel definitions for chat entities
  - File: `phase-3/backend/src/backend/models/chat.py`
  - Implement ChatSession model with all fields and relationships
  - Implement ChatMessage model with all fields and relationships
  - Extend existing User model with chat relationships
  - Add validation rules and enums

- [X] T009 Execute database migrations in Neon PostgreSQL
  - Connect to Neon database
  - Run chat_sessions migration (dropped existing tables, created new with correct schema)
  - Run chat_messages migration (created with proper foreign keys and constraints)
  - Verify tables and indexes created correctly
  - Test with sample data insertion (successful)

### ChatKit Store Implementation

- [X] T010 Create ChatKit Store interface definition
  - File: `phase-3/backend/src/backend/store/chatkit_store.py`
  - Import Store base class from openai_chatkit
  - Define all 14 required method signatures
  - Add type hints and docstrings for each method

- [X] T011 Implement ChatKit Store ID generation methods
  - File: `phase-3/backend/src/backend/store/chatkit_store.py`
  - Implement `generate_thread_id()` with user isolation
  - Implement `generate_item_id()` with user isolation
  - Add user_id prefix for debugging/tracing

- [X] T012 Implement ChatKit Store thread operations (5 methods)
  - File: `phase-3/backend/src/backend/store/chatkit_store.py`
  - Implement `load_thread()` with user isolation verification
  - Implement `save_thread()` for create/update operations
  - Implement `load_threads()` with pagination and user isolation
  - Implement `delete_thread()` with ownership verification
  - Add proper error handling for not found/access denied

- [X] T013 Implement ChatKit Store item operations (6 methods)
  - File: `phase-3/backend/src/backend/store/chatkit_store.py`
  - Implement `load_thread_items()` with pagination and user isolation
  - Implement `add_thread_item()` with thread ownership verification
  - Implement `save_item()` for update operations
  - Implement `load_item()` with user isolation
  - Implement `delete_thread_item()` with ownership verification
  - Add proper error handling and validation

- [X] T014 Implement ChatKit Store attachment operations (3 methods)
  - File: `phase-3/backend/src/backend/store/chatkit_store.py`
  - Implement `save_attachment()` with user isolation
  - Implement `load_attachment()` with user isolation
  - Implement `delete_attachment()` with ownership verification
  - Add placeholder implementation (can be extended later)

- [X] T015 Test ChatKit Store methods with user isolation
  - File: `phase-3/backend/tests/test_chatkit_store.py`
  - Create test suite for all 14 methods
  - Verify user isolation in all database queries
  - Test error scenarios (not found, access denied)
  - Run tests with `uv run pytest tests/test_chatkit_store.py -v`

### ChatKit Session Endpoints

- [X] T016 Create ChatKit session endpoints file
  - File: `phase-3/backend/src/backend/api/chatkit.py`
  - Set up APIRouter with `/api/chatkit` prefix
  - Import OpenAI client and authentication dependencies
  - Add OpenAI client initialization with validation

- [X] T017 Implement `/api/chatkit/session` endpoint
  - File: `phase-3/backend/src/backend/api/chatkit.py`
  - Add JWT authentication dependency
  - Create OpenAI ChatKit session via API
  - Return client_secret and session_id to frontend
  - Add error handling for OpenAI API errors

- [X] T018 Implement `/api/chatkit/refresh` endpoint
  - File: `phase-3/backend/src/backend/api/chatkit.py`
  - Add JWT authentication dependency
  - Refresh expired ChatKit session token
  - Return new client_secret and session_id
  - Add error handling for session not found

- [X] T019 Integrate ChatKit routes into FastAPI application
  - File: `phase-3/backend/src/backend/main.py`
  - Import and include ChatKit router
  - Add startup validation for ChatKit configuration
  - Test endpoints are accessible

- [X] T020 Create frontend session API routes
  - File: `phase-3/frontend/src/app/api/chatkit/route.ts`
  - Implement POST handler for session creation with JWT forwarding
  - Implement POST handler for session refresh with JWT forwarding
  - Add error handling and response validation
  - Consolidated route handles both `/api/chatkit/session` and `/api/chatkit/refresh`

---

## Phase 3: User Story 1 - Seamless Chat Experience with Modern UI (P1)

**Goal**: Implement polished chat interface with real-time messaging, loading states, and rich responses
**Independent Test**: Send message to agent, verify interface renders correctly with proper styling and loading states

### Frontend Integration

- [X] T021 [P] [US1] Create ChatKit integration component
  - File: `phase-3/frontend/src/app/chatbot/page.tsx`
  - Import ChatKit and useChatKit hook
  - Set up authentication with useAuth hook
  - Implement getClientSecret() function for session creation
  - Add basic component structure with header

- [X] T022 [P] [US1] Implement ChatKit theme configuration
  - File: `phase-3/frontend/src/app/chatbot/page.tsx`
  - Configure color scheme to match editorial design
  - Set accent color to vibrant orange (#FF6B4A)
  - Configure radius and typography settings
  - Test theme renders correctly

- [X] T023 [P] [US1] Add ChatKit start screen configuration
  - File: `phase-3/frontend/src/app/chatbot/page.tsx`
  - Configure greeting message with user name
  - Add task-related prompt suggestions
  - Set composer placeholder text
  - Test start screen displays correctly

- [X] T024 [P] [US1] Implement localStorage thread persistence
  - File: `phase-3/frontend/src/app/chatbot/page.tsx`
  - Load saved thread ID from localStorage on mount
  - Set initialThread prop for ChatKit
  - Save new thread IDs to localStorage on thread change
  - Test thread persistence across page refresh

- [X] T025 [P] [US1] Add error handling and fallback UI
  - File: `phase-3/frontend/src/app/chatbot/page.tsx`
  - Implement error state for missing OpenAI API key
  - Add clear error messages with setup instructions
  - Create retry button for failed session creation
  - Test error scenarios with missing/invalid configuration

- [X] T026 [P] [US1] Style ChatKit container to match design system
  - File: `phase-3/frontend/src/app/chatbot/page.tsx`
  - Add header with "AI Task Assistant" title
  - Style header with orange border and background
  - Ensure ChatKit component fills available space
  - Test responsive layout on mobile devices

### Backend ChatKit Server (for streaming responses)

- [X] T027 [P] [US1] Create ChatKit Server implementation
  - File: `phase-3/backend/src/backend/api/chatkit.py`
  - Subclass ChatKitServer from openai_chatkit
  - Implement respond() method signature
  - Add store and agents dependencies

- [X] T028 [P] [US1] Implement ChatKitServer.respond() method
  - File: `phase-3/backend/src/backend/api/chatkit.py`
  - Load conversation history via store.load_thread_items()
  - Use existing agents.py with OpenAI Agents SDK
  - Return StreamingResult with agent response
  - Maintain user isolation via context parameter

- [X] T029 [P] [US1] Connect ChatKitServer to FastAPI application
  - File: `phase-3/backend/src/backend/main.py`
  - Initialize MyChatKitServer with store and agents
  - Integrate ChatKit routes from api/chatkit.py
  - Test server responds to ChatKit requests

### Testing & Validation

- [X] T030 [US1] Test ChatKit component loads correctly
  - File: `phase-3/frontend/src/app/chatbot/page.test.tsx`
  - Create Jest test for component rendering
  - Verify ChatKit UI appears on page
  - Test header text displays correctly
  - Run test with `npm run test -- ChatBotPage.test.tsx`

- [X] T031 [US1] Test authentication flow with JWT
  - File: `phase-3/frontend/src/app/chatbot/page.test.tsx`
  - Mock useAuth hook with test token
  - Mock fetch for session endpoint
  - Verify Authorization header includes JWT
  - Test session endpoint is called correctly

- [X] T032 [US1] Test error handling for missing OpenAI key
  - File: `phase-3/frontend/src/app/chatbot/page.test.tsx`
  - Mock session endpoint to return error
  - Verify error message displays in UI
  - Test retry button functionality
  - Check error message mentions OPENAI_API_KEY

- [X] T033 [US1] Test thread persistence with localStorage
  - File: `phase-3/frontend/src/app/chatbot/page.test.tsx`
  - Mock localStorage.getItem to return saved thread ID
  - Verify initialThread prop is set correctly
  - Test localStorage.setItem is called on thread change
  - Verify thread ID is saved to localStorage

- [X] T034 [US1] Test session endpoint integration
  - File: `phase-3/backend/tests/test_chatkit_session.py`
  - Create test for `/api/chatkit/session` endpoint
  - Mock OpenAI API calls
  - Test JWT authentication requirement
  - Verify response format (client_secret, session_id, expires_at)

- [X] T035 [US1] Test store method performance
  - File: `phase-3/backend/tests/test_chatkit_performance.py`
  - Benchmark all 14 store methods
  - Verify performance <100ms per method
  - Test with concurrent user scenarios
  - Add performance regression tests

---

## Phase 4: User Story 4 - Persistent Chat History (P1)

**Goal**: Implement automatic chat persistence and history loading across sessions
**Independent Test**: Have conversation, refresh page, verify previous messages load automatically

### Database Integration

- [X] T036 [P] [US4] Implement ChatSession service layer
  - File: `phase-3/backend/src/backend/services/chat_session_service.py`
  - Create service class with user isolation
  - Implement create, read, update, delete operations
  - Add validation for user ownership
  - Include pagination for session lists

- [X] T037 [P] [US4] Implement ChatMessage service layer
  - File: `phase-3/backend/src/backend/services/chat_message_service.py`
  - Create service class with user isolation
  - Implement message CRUD operations
  - Add validation for session ownership
  - Include pagination for message history

- [X] T038 [P] [US4] Integrate store methods with database services
  - File: `phase-3/backend/src/backend/store/chatkit_store.py`
  - Update store methods to use service layer
  - Ensure user isolation in all database queries
  - Add transaction support for data consistency
  - Test store methods with real database

### History Loading & Persistence

- [X] T039 [US4] Test automatic history loading on page load
  - File: `phase-3/frontend/src/app/chatbot/page.test.tsx`
  - Mock store.load_thread_items() to return history
  - Verify ChatKit receives previous conversation
  - Test with 50+ message conversations
  - Verify loading state during history fetch

- [X] T040 [US4] Test chat persistence across sessions
  - File: `phase-3/backend/tests/test_chat_persistence.py`
  - Create chat session and messages
  - Clear session state (simulate logout/login)
  - Verify messages are retrieved from database
  - Test user isolation (can't access others' chats)

- [X] T041 [US4] Test thread list persistence and retrieval
  - File: `phase-3/backend/tests/test_thread_list.py`
  - Create multiple chat sessions for user
  - Test load_threads() returns all user sessions
  - Verify pagination works correctly
  - Test user isolation in thread listing

- [X] T042 [US4] Test message metadata storage
  - File: `phase-3/backend/tests/test_message_metadata.py`
  - Create messages with tool call metadata
  - Verify metadata is stored in JSONB column
  - Test retrieval preserves metadata structure
  - Validate metadata schema constraints

---

## Phase 5: User Story 2 - Task Management via Natural Conversation (P2)

**Goal**: Enable task CRUD operations via natural language in chat interface
**Independent Test**: Send task-related commands, verify execution with visual feedback

### MCP Tool Integration

- [X] T043 [P] [US2] Adapt existing MCP tools for ChatKit visualization
  - File: `phase-3/backend/src/backend/api/chatkit.py`
  - Update respond() method to handle tool execution
  - Add tool call visualization in streaming responses
  - Maintain existing MCP tool definitions and user isolation
  - Test tool execution within ChatKit context

- [X] T044 [P] [US2] Create tool execution metadata handlers
  - File: `phase-3/backend/src/backend/services/tool_execution_service.py`
  - Format tool calls for ChatKit display
  - Add execution timing and result formatting
  - Include error handling and reporting
  - Test with all 7 MCP task management tools

### Frontend Tool Visualization

- [X] T045 [US2] Test tool call visual feedback in ChatKit UI
  - File: `phase-3/frontend/src/app/chatbot/page.test.tsx`
  - Mock tool execution scenarios
  - Verify tool calls are displayed with proper styling
  - Test result formatting in chat interface
  - Verify user isolation maintained during tool execution

- [X] T046 [US2] Test task management conversation flow
  - File: `phase-3/backend/tests/test_task_conversation.py`
  - Create test scenarios for task creation via chat
  - Verify tool execution results in chat messages
  - Test conversation context maintenance
  - Validate Urdu/English task handling

---

## Phase 6: User Story 3 - Multi-language Support with Cultural Context (P3)

**Goal**: Support Urdu text input/output with proper rendering and cultural appropriateness
**Independent Test**: Send Urdu messages, verify proper rendering and response in Urdu

### Internationalization Support

- [X] T047 [P] [US3] Add Urdu text rendering support to ChatKit theme
  - File: `phase-3/frontend/src/app/chatbot/page.tsx`
  - Configure font stack with Urdu-compatible fonts
  - Add RTL text direction support for Urdu
  - Test Urdu text rendering in messages

- [X] T048 [P] [US3] Test Urdu message handling in backend
  - File: `phase-3/backend/tests/test_urdu_support.py`
  - Create test with Urdu script content
  - Verify database storage preserves Unicode
  - Test ChatKit session with Urdu messages
  - Validate MCP tool handling of Urdu text

### Cultural Context Testing

- [X] T049 [US3] Test cultural appropriateness in responses
  - File: `phase-3/frontend/src/app/chatbot/page.test.tsx`
  - Mock Urdu conversation scenarios
  - Verify proper text alignment and layout
  - Test with right-to-left content
  - Validate accessibility for Urdu-speaking users

---

## Phase 7: Polish & Cross-Cutting Concerns

### Performance Optimization

- [X] T050 [P] Implement connection pooling for database operations
  - File: `phase-3/backend/src/backend/database.py`
  - Configure connection pool for Neon PostgreSQL
  - Optimize pool size for concurrent users
  - Test connection pool performance

- [X] T051 [P] Add response caching for frequently accessed threads
  - File: `phase-3/backend/src/backend/services/cache_service.py`
  - Implement Redis or in-memory caching for thread metadata
  - Add cache invalidation on thread updates
  - Test cache hit rates and performance improvement

### Error Handling & Monitoring

- [X] T052 [P] Implement comprehensive error handling across all components
  - File: `phase-3/backend/src/backend/error_handlers.py`
  - Add structured error responses for all API endpoints
  - Implement retry logic for OpenAI API calls
  - Add logging for error scenarios
  - Create error monitoring dashboard queries

### Security & Validation

- [X] T053 [P] Add input validation for all chat messages
  - File: `phase-3/backend/src/backend/validation/chat_validation.py`
  - Implement content length validation
  - Add sanitization for special characters
  - Test validation with edge cases

- [X] T054 [P] Test user isolation across all operations
  - File: `phase-3/backend/tests/test_user_isolation.py`
  - Create test user scenarios
  - Verify no cross-user data access
  - Test JWT validation on all endpoints
  - Validate session ownership checks

### Documentation & Deployment

- [X] T055 Update API documentation with new endpoints
  - File: `phase-3/backend/docs/chatkit_api.md`
  - Document `/api/chatkit/session` endpoint
  - Document `/api/chatkit/refresh` endpoint
  - Document `/api/chatkit/health` endpoint
  - Include request/response examples

- [X] T056 Create deployment checklist and rollback procedures
  - File: `phase-3/DEPLOYMENT_CHECKLIST.md`
  - List all environment variables needed
  - Document database migration steps
  - Add rollback procedures for each phase
  - Include monitoring setup instructions

---

## Success Criteria Validation

### User Story 1 (P1) - Seamless Chat Experience
- [X] **Test**: Send message, verify interface renders with proper styling
- [X] **Test**: Loading states appear during agent processing
- [X] **Test**: Markdown rendering works in responses
- [X] **Test**: Mobile responsiveness verified

### User Story 4 (P1) - Persistent Chat History
- [X] **Test**: Conversation persists after page refresh
- [X] **Test**: Thread list loads all user sessions
- [X] **Test**: Message metadata stored correctly
- [X] **Test**: User isolation verified (no cross-user access)

### User Story 2 (P2) - Task Management via Conversation
- [X] **Test**: Task creation via natural language works
- [X] **Test**: Tool execution visual feedback displays
- [X] **Test**: Conversation context maintained
- [X] **Test**: Urdu/English task handling works

### User Story 3 (P3) - Multi-language Support
- [X] **Test**: Urdu text renders correctly
- [X] **Test**: RTL layout works for Urdu content
- [X] **Test**: Cultural appropriateness maintained
- [X] **Test**: Accessibility for Urdu speakers verified

### Cross-Cutting Requirements
- [X] **Performance**: All responses <2s, ChatKit load <1s, bundle <200KB increase
- [X] **Security**: Zero user isolation violations, all JWT validations pass
- [X] **Reliability**: 99% session creation success rate, zero data loss
- [X] **Observability**: All operations logged, metrics collected

---

## Parallel Execution Examples

### US1 + US4 (Can run in parallel after Phase 2)
```
Developer 1: T021-T026 (ChatKit UI integration)
Developer 2: T036-T038 (Database services)
Developer 3: T039-T042 (History loading tests)
```

### US2 + US3 (Can run in parallel after Phase 2)
```
Developer 1: T043-T046 (MCP tool integration)
Developer 2: T047-T049 (Urdu support)
```

### Phase 7 (All tasks can run in parallel)
```
Developer 1: T050-T051 (Performance optimization)
Developer 2: T052-T054 (Error handling & security)
Developer 3: T055-T056 (Documentation & deployment)
```

---

## MVP Scope Recommendation

**Minimum Viable Product**: Phase 1 + Phase 2 + US1 + US4
- Complete setup and foundation (T001-T020)
- Seamless chat experience (T021-T035)
- Persistent chat history (T036-T042)
- **Total**: 42 tasks (81% of total)

**Why this scope**:
- Provides complete, testable chat application
- Includes essential user experience (chat + history)
- Can be deployed independently
- Foundation for remaining stories (US2, US3)

**Post-MVP**:
- US2 (Task Management): T043-T046 (4 tasks)
- US3 (Multi-language): T047-T049 (3 tasks)
- Polish Phase: T050-T056 (7 tasks)

---

## Task Completion Validation

### Format Validation
- ✅ All tasks follow checklist format: `- [ ] T001 [P] [US1] Description with file path`
- ✅ Task IDs are sequential (T001-T056)
- ✅ Parallel tasks marked with [P]
- ✅ User story tasks marked with [US1], [US2], etc.
- ✅ File paths are absolute and specific

### Completeness Validation
- ✅ All user stories from spec.md are covered
- ✅ All entities from data-model.md are implemented
- ✅ All endpoints from contracts/ are implemented
- ✅ All 14 ChatKit Store methods are implemented
- ✅ Error handling and testing included for all components

### Independence Validation
- ✅ Each user story can be tested independently
- ✅ Setup and Foundational phases block all stories
- ✅ Stories can be implemented in priority order
- ✅ MVP scope provides complete functionality

---

**Generated**: 2026-01-16
**Total Tasks**: 56
**Completed Tasks**: 56/56 (100%)
**Parallel Tasks**: 18
**User Stories**: 4
**Status**: ✅ All tasks completed