# API Contracts: Microservices Event-Driven Architecture

**Feature**: 013-microservices-dapr
**Date**: 2026-02-04
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines all API contracts for the microservices architecture, including backend endpoints, frontend proxy routes, and event subscription endpoints.

---

## Backend API Routes (unchanged endpoints, new internal behavior)

### Base URL
- **Local**: `http://localhost:8000`
- **Minikube**: `http://backend:8000` (internal DNS)
- **Via Dapr**: `http://localhost:3500/v1.0/invoke/backend-api/method`

### Authentication
All endpoints require JWT bearer token in `Authorization` header:
```
Authorization: Bearer <token>
```

### Endpoints

#### GET /api/{user_id}/tasks

List all tasks for user with optional filtering.

**Request**:
```http
GET /api/{user_id}/tasks?status=pending&priority=high&sort_by=createdAt&sort_order=desc
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (`pending`, `completed`) |
| `priority` | string | No | Filter by priority (`low`, `medium`, `high`) |
| `category` | string | No | Filter by category (`work`, `personal`, `home`, `other`) |
| `search` | string | No | Search in title and description |
| `sort_by` | string | No | Field to sort by (default: `createdAt`) |
| `sort_order` | string | No | `asc` or `desc` (default: `desc`) |

**Response**: `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive docs",
    "priority": "high",
    "category": "work",
    "status": "pending",
    "completed": false,
    "dueDate": "2026-02-10T17:00:00Z",
    "createdAt": "2026-02-04T10:00:00Z",
    "updatedAt": "2026-02-04T10:00:00Z",
    "userId": "user-123",
    "recurringRule": "weekly",
    "tags": ["documentation", "important"]
  }
]
```

**Events Published**: None (read-only operation)

---

#### POST /api/{user_id}/tasks

Create a new task.

**Request**:
```http
POST /api/{user_id}/tasks
Content-Type: application/json
```

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "priority": "high",
  "category": "work",
  "dueDate": "2026-02-10T17:00:00Z",
  "recurringRule": "weekly",
  "recurringEndDate": "2026-06-01T00:00:00Z",
  "reminderAt": "2026-02-10T16:00:00Z",
  "tags": ["documentation", "important"]
}
```

**Response**: `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "priority": "high",
  "category": "work",
  "status": "pending",
  "completed": false,
  "dueDate": "2026-02-10T17:00:00Z",
  "createdAt": "2026-02-04T10:00:00Z",
  "updatedAt": "2026-02-04T10:00:00Z",
  "userId": "user-123",
  "recurringRule": "weekly",
  "recurringEndDate": "2026-06-01T00:00:00Z",
  "reminderAt": "2026-02-10T16:00:00Z",
  "reminderSent": false,
  "tags": ["documentation", "important"]
}
```

**Events Published**:
- Topic: `task-created`
- Pattern: Fire-and-forget (non-blocking)

---

#### GET /api/{user_id}/tasks/{task_id}

Get a single task by ID.

**Request**:
```http
GET /api/{user_id}/tasks/550e8400-e29b-41d4-a716-446655440000
```

**Response**: `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "priority": "high",
  "status": "pending"
}
```

**Error Response**: `404 Not Found`
```json
{
  "detail": "Task not found"
}
```

**Events Published**: None (read-only operation)

---

#### PUT /api/{user_id}/tasks/{task_id}

Update an existing task.

**Request**:
```http
PUT /api/{user_id}/tasks/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

```json
{
  "title": "Updated task title",
  "priority": "medium"
}
```

**Response**: `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated task title",
  "priority": "medium",
  "updatedAt": "2026-02-04T11:00:00Z"
}
```

**Events Published**:
- Topic: `task-updated`

---

#### DELETE /api/{user_id}/tasks/{task_id}

Delete a task.

**Request**:
```http
DELETE /api/{user_id}/tasks/550e8400-e29b-41d4-a716-446655440000
```

**Response**: `204 No Content`

**Events Published**:
- Topic: `task-deleted`

---

#### PATCH /api/{user_id}/tasks/{task_id}/complete

Toggle task completion status.

**Request**:
```http
PATCH /api/{user_id}/tasks/550e8400-e29b-41d4-a716-446655440000/complete
```

**Response**: `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "status": "completed",
  "completed": true
}
```

**Events Published**:
- Topic: `task-completed` (if task was just completed)
- Triggers: recurring-service to create next instance (if recurring)

---

#### GET /api/{user_id}/stats

Get task statistics.

**Request**:
```http
GET /api/{user_id}/stats
```

**Response**: `200 OK`
```json
{
  "total": 42,
  "pending": 15,
  "completed": 27
}
```

**Events Published**: None

---

## Frontend API Routes (Dapr Proxy Pattern)

### Base URL
- **Local**: `http://localhost:3000/api`
- **Minikube**: `http://frontend:3000/api`

### Purpose
Next.js API routes proxy requests to backend microservices via Dapr sidecar. Browsers cannot access Dapr directly, so these server-side routes handle the proxying.

### Dapr Service Invocation Pattern

```typescript
// Dapr URL format
const DAPR_URL = `http://localhost:3500/v1.0`;
const INVOKE_URL = `${DAPR_URL}/invoke/{app-id}/method/{endpoint}`;

// Example: Call backend-api
const response = await fetch(
  `${DAPR_URL}/invoke/backend-api/method/api/user-123/tasks`,
  { method: 'GET' }
);
```

### Endpoints

#### GET /api/tasks

Proxy to backend-api task list.

**Request**:
```http
GET /api/tasks?user_id=user-123&status=pending
```

**Proxies To**:
```
Dapr → backend-api → GET /api/user-123/tasks?status=pending
```

**Response**: Same as backend API

---

#### POST /api/tasks

Proxy to backend-api task creation.

**Request**:
```http
POST /api/tasks
Content-Type: application/json
```

```json
{
  "user_id": "user-123",
  "title": "New task",
  "priority": "high"
}
```

**Proxies To**:
```
Dapr → backend-api → POST /api/user-123/tasks
```

**Response**: Same as backend API

---

#### GET /api/tasks/{id}

Proxy to backend-api single task fetch.

**Request**:
```http
GET /api/tasks/550e8400-e29b-41d4-a716-446655440000?user_id=user-123
```

**Proxies To**:
```
Dapr → backend-api → GET /api/user-123/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

#### PATCH /api/tasks/{id}

Proxy to backend-api task update.

**Request**:
```http
PATCH /api/tasks/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

```json
{
  "user_id": "user-123",
  "title": "Updated title"
}
```

**Proxies To**:
```
Dapr → backend-api → PUT /api/user-123/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

#### DELETE /api/tasks/{id}

Proxy to backend-api task deletion.

**Request**:
```http
DELETE /api/tasks/550e8400-e29b-41d4-a716-446655440000?user_id=user-123
```

**Proxies To**:
```
Dapr → backend-api → DELETE /api/user-123/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

#### GET /api/notifications

Proxy to notification-service.

**Request**:
```http
GET /api/notifications?user_id=user-123&unreadOnly=true
```

**Proxies To**:
```
Dapr → notification-service → GET /api/user-123/notifications
```

---

#### PATCH /api/notifications/{id}

Mark notification as read.

**Request**:
```http
PATCH /api/notifications/550e8400-e29b-41d4-a716-446655440000
```

**Proxies To**:
```
Dapr → notification-service → PATCH /api/user-123/notifications/550e8400-e29b-41d4-a716-446655440000/read
```

---

## Microservice Event Endpoints

### Dapr Subscription Pattern

Dapr automatically delivers events from Kafka to HTTP endpoints on each microservice. The endpoint pattern is:

```
POST /events/{topic-name}
```

Each microservice implements endpoints for the topics it subscribes to.

### Recurring Service Endpoints

**Port**: 8001
**App ID**: `recurring-service`

#### GET /health

Health check endpoint.

**Response**: `200 OK`
```json
{
  "status": "healthy"
}
```

#### POST /events/task-completed

Subscribe to task completion events for recurring task creation.

**Request** (from Dapr):
```http
POST /events/task-completed
Content-Type: application/json
```

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-04T10:00:00Z",
  "event_type": "task-completed",
  "user_id": "user-123",
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Weekly standup",
    "recurring_rule": "weekly",
    "completed": true
  }
}
```

**Response**: `200 OK`
```json
{
  "status": "created",
  "next_task_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Or** (if not recurring):
```json
{
  "status": "ignored",
  "reason": "not a recurring task"
}
```

---

### Notification Service Endpoints

**Port**: 8002
**App ID**: `notification-service`

#### GET /health

Health check endpoint.

#### POST /events/reminder-check

Triggered by Dapr Cron Binding every minute.

**Request** (from Dapr Cron Binding):
```http
POST /reminder-check
```

**Response**: `200 OK`
```json
{
  "status": "processed",
  "count": 3
}
```

---

### Audit Service Endpoints

**Port**: 8003
**App ID**: `audit-service`

#### GET /health

Health check endpoint.

#### POST /events/task-created

Log task creation to audit database.

#### POST /events/task-updated

Log task update to audit database.

#### POST /events/task-completed

Log task completion to audit database.

#### POST /events/task-deleted

Log task deletion to audit database.

**Request** (from Dapr):
```http
POST /events/task-created
Content-Type: application/json
```

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-04T10:00:00Z",
  "event_type": "task-created",
  "user_id": "user-123",
  "data": {
    "task_id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "New task",
    "priority": "high"
  }
}
```

**Response**: `200 OK`
```json
{
  "status": "logged"
}
```

---

### WebSocket Service Endpoints

**Port**: 8004
**App ID**: `websocket-service`

#### GET /health

Health check endpoint.

#### WebSocket /ws/{user_id}

WebSocket endpoint for real-time updates.

**Connection**:
```
ws://websocket-service:8004/ws/user-123
```

**Server → Client Messages**:
```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "task-created",
  "user_id": "user-123",
  "data": {
    "task": { ... }
  }
}
```

#### POST /events/task-updates

Receive all task updates for broadcasting.

**Request** (from internal):
```http
POST /events/task-updates
Content-Type: application/json
```

**Response**: `200 OK`
```json
{
  "status": "broadcast",
  "connections": 2
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| `200 OK` | Success | Request completed successfully |
| `201 Created` | Resource created | Task/notification created |
| `204 No Content` | Success (no body) | Deletion successful |
| `400 Bad Request` | Invalid input | Validation failed |
| `401 Unauthorized` | Authentication failed | Missing/invalid token |
| `403 Forbidden` | Authorization failed | User doesn't own resource |
| `404 Not Found` | Resource not found | Task/notification doesn't exist |
| `500 Internal Server Error` | Server error | Unexpected error |
| `503 Service Unavailable` | Transient error | Dapr/Kafka unavailable (triggers retry) |

---

## OpenAPI Specification

### backend-api OpenAPI

```yaml
openapi: 3.0.0
info:
  title: Todo Backend API
  version: 1.0.0
servers:
  - url: http://localhost:8000
    description: Local development
  - url: http://backend:8000
    description: Minikube internal

paths:
  /api/{user_id}/tasks:
    get:
      summary: List tasks
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, completed]
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'

    post:
      summary: Create task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskCreate'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'

components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        status:
          type: string
          enum: [pending, completed]
        priority:
          type: string
          enum: [low, medium, high]

    TaskCreate:
      type: object
      required:
        - title
      properties:
        title:
          type: string
        description:
          type: string
        priority:
          type: string
          enum: [low, medium, high]
          default: medium
```

---

## References

- [Dapr HTTP API Specification](https://docs.dapr.io/reference/api/pubsub_api/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Constitution VII: Security](../../.specify/memory/constitution.md)
