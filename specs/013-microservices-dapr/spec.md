# Feature Specification: Microservices Event-Driven Architecture with Dapr

**Feature Branch**: `013-microservices-dapr`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "name the new branch "013-microservices-dapr" and here are the specs..."

## Overview

Transform the existing monolithic todo application into a resilient event-driven microservices architecture using Dapr. The system will process task operations asynchronously and broadcast updates in real-time across all connected devices, while maintaining complete audit trails and supporting automated recurring task generation.

**Scope**: This feature introduces event-driven patterns to replace direct service-to-service calls, enabling independent service deployment, resilience to failures, and real-time user experiences.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Task Updates Across Devices (Priority: P1)

As a user managing tasks across multiple devices, I want my task changes to appear instantly on all my connected sessions so I never work with stale data.

**Why this priority**: Core value proposition - real-time synchronization is the primary benefit of the event-driven architecture. Without this, there's no visible improvement over the monolith.

**Independent Test**: Create a task on Device A while having Device B open; verify the task appears on Device B within 2 seconds without manual refresh.

**Acceptance Scenarios**:

1. **Given** I have two browser tabs open, **When** I create a task in Tab A, **Then** the task appears in Tab B within 2 seconds
2. **Given** I complete a task on mobile, **When** I check my desktop, **Then** the task shows as completed without refresh
3. **Given** I delete a task, **When** other sessions receive the event, **Then** the task is removed from all views

---

### User Story 2 - Automatic Recurring Task Generation (Priority: P1)

As a user with recurring tasks (daily standup, weekly reports), I want the system to automatically create the next occurrence when I complete the current one, so I never miss a scheduled task.

**Why this priority**: Automation of repetitive task management is a key productivity feature that directly benefits users and demonstrates microservices independence.

**Independent Test**: Complete a recurring task and verify a new task with the next due date is created within 5 seconds.

**Acceptance Scenarios**:

1. **Given** I have a daily recurring task, **When** I mark it complete, **Then** a new task for tomorrow is automatically created
2. **Given** I have a weekly recurring task due Monday, **When** I complete it, **Then** a new task for next Monday appears
3. **Given** the recurring service is temporarily unavailable, **When** it comes back online, **Then** it processes any missed completions

---

### User Story 3 - Timely Reminder Notifications (Priority: P2)

As a busy user, I want to receive notifications when my task reminders are due, so I don't miss important deadlines.

**Why this priority**: Reminders enhance task management but are secondary to core task operations. Users can still manage tasks without reminders.

**Independent Test**: Set a reminder for 1 minute in the future; verify notification appears at the correct time.

**Acceptance Scenarios**:

1. **Given** I set a reminder for a task at 3:00 PM, **When** the time reaches 3:00 PM, **Then** I receive a notification
2. **Given** I'm actively using the app, **When** a reminder is due, **Then** I see an in-app notification immediately
3. **Given** multiple reminders are due at the same time, **When** processed, **Then** all notifications are delivered

---

### User Story 4 - Complete Audit Trail (Priority: P2)

As a team lead or compliance officer, I want a complete history of all task changes, so I can track who did what and when for accountability purposes.

**Why this priority**: Audit logging is essential for enterprise use cases but doesn't block core functionality for individual users.

**Independent Test**: Perform CRUD operations on tasks; verify all events are logged with timestamps and user IDs.

**Acceptance Scenarios**:

1. **Given** a user creates a task, **When** the audit service receives the event, **Then** a log entry is recorded with user ID, timestamp, and task details
2. **Given** a task is updated, **When** querying audit logs, **Then** both old and new values are visible
3. **Given** a task is deleted, **When** reviewing audit history, **Then** the deletion event and who deleted it are recorded

---

### User Story 5 - Resilient Service Operation (Priority: P3)

As a system administrator, I want individual services to fail gracefully without bringing down the entire application, so users experience minimal disruption.

**Why this priority**: Infrastructure resilience is important for production readiness but users don't directly interact with this capability.

**Independent Test**: Stop the audit-service; verify task creation still works and events are processed when service recovers.

**Acceptance Scenarios**:

1. **Given** the notification-service is down, **When** I create tasks, **Then** task creation succeeds and notifications are queued
2. **Given** a service crashes and restarts, **When** it comes back online, **Then** it processes pending events without duplicates
3. **Given** high load on one service, **When** events are published, **Then** other services continue operating normally

---

### Edge Cases

- What happens when the message broker is unavailable?
- How does the system handle duplicate events (idempotency)?
- What happens when a reminder is set in the past?
- How does the system behave when database connection fails mid-transaction?
- What happens when a user completes a task while offline?
- What happens when the cron service misses a scheduled check?
- How does the system handle events with malformed payloads?
- What happens when WebSocket connection drops during event broadcast?

## Requirements *(mandatory)*

**Constitution Alignment**: All requirements MUST comply with Evolution of Todo Constitution v1.1.0

### Functional Requirements

**Event Publishing and Delivery**
- **FR-001**: System MUST publish events when tasks are created, updated, completed, or deleted
- **FR-002**: System MUST process events asynchronously without blocking the main API response
- **FR-003**: System MUST guarantee at-least-once delivery of events to all subscribed services
- **FR-004**: System MUST deduplicate events using unique identifiers to prevent duplicate processing

**Task Management**
- **FR-005**: System MUST automatically create next recurring task when a recurring task is completed
- **FR-006**: System MUST check for due reminders every minute using scheduled triggers

**Real-Time Communication**
- **FR-007**: System MUST broadcast task updates to connected clients in real-time

**Audit and Compliance**
- **FR-008**: System MUST log all task events with full context including actor, timestamp, and changes

**Security and Authentication**
- **FR-009**: System MUST maintain authentication across all microservices using shared token validation

**Client Integration**
- **FR-010**: Frontend MUST route all API calls through the application's backend layer

### Architecture Requirements

- **AR-001**: System MUST use event-driven patterns for all cross-service communication
- **AR-002**: System MUST maintain zero direct service-to-service calls (only event publishing)
- **AR-003**: System MUST enforce multi-tenancy at query level across all services
- **AR-004**: System MUST ensure individual service failures don't crash the entire application
- **AR-005**: System MUST process all state changes asynchronously

### Non-Functional Requirements

**Performance**
- **NFR-001**: Task creation completes within 500ms regardless of background event processing
- **NFR-002**: Real-time updates appear on connected clients within 2 seconds of the originating action
- **NFR-003**: Recurring tasks are created within 5 seconds of completing the parent task
- **NFR-004**: Reminders are processed within 60 seconds of their due time

**Reliability**
- **NFR-005**: System continues operating when any single microservice is unavailable
- **NFR-006**: Zero duplicate processing when the same event is delivered multiple times
- **NFR-007**: All task events are captured in audit logs with 100% accuracy

**Operational**
- **NFR-008**: Each service can be deployed independently via single deployment command
- **NFR-009**: System health can be monitored at both service and infrastructure levels

### Key Entities

- **Task**: Core entity representing a user's todo item with title, description, priority, due date, reminder time, recurrence pattern, and completion status
- **Event**: Message published to the event system containing event type, payload data, timestamp, user identifier, and unique event identifier
- **Notification**: Alert generated for users containing message content, type identifier, read status, and link to related task
- **AuditLog**: Immutable record of system changes containing actor identifier, action type, entity reference, previous values, new values, and timestamp
- **ProcessedEvent**: Tracking record for idempotency stored in Dapr State Store (key format: `processed-{event_id}-{service_name}`) containing processing timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Deployment and Operations**
- **SC-001**: All services start successfully with the expected container configuration
- **SC-010**: Deployment succeeds with a single command per service

**Performance**
- **SC-002**: Task creation returns success response within 500ms while events are processed asynchronously
- **SC-003**: Real-time updates appear on connected clients within 2 seconds of the originating action
- **SC-004**: Recurring tasks are created within 5 seconds of completing the parent task
- **SC-005**: Reminders are processed within 60 seconds of their due time

**Architecture Compliance**
- **SC-006**: No direct service-to-service calls exist in the API layer (only event publishing)

**Resilience and Reliability**
- **SC-007**: System continues operating when any single microservice is unavailable
- **SC-008**: Zero duplicate processing when the same event is delivered multiple times
- **SC-009**: All task events are captured in audit logs with 100% accuracy

## Assumptions

1. The message broker will be deployed as part of the infrastructure
2. All services share access to a common database for audit and idempotency tracking
3. The existing authentication mechanism can be extended to validate tokens across services
4. Frontend clients support WebSocket connections for real-time updates
5. The infrastructure supports scheduled job execution for reminder checking
6. Network policies allow communication between services via the sidecar proxy

## Dependencies

- Existing monolithic todo application with task CRUD operations
- Shared database accessible by all microservices
- Message broker infrastructure
- Authentication service or shared JWT validation mechanism
- Container orchestration platform

## Out of Scope

- Mobile push notifications (only in-app notifications)
- Advanced recurring patterns (beyond daily, weekly, monthly)
- Multi-user task collaboration
- Task attachments or file handling
- Advanced reporting or analytics dashboards
