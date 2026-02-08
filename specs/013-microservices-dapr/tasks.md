# Tasks: Microservices Event-Driven Architecture with Dapr

**Input**: Design documents from `/specs/013-microservices-dapr/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: Tests are NOT included for this feature - focus is on infrastructure setup and microservices implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `phase-5/backend/src/`, `phase-5/frontend/src/`
- **Helm charts**: `phase-5/helm-charts/`
- **Dapr components**: `phase-5/k8s-dapr/`
- **Docker**: `phase-5/backend/Dockerfile`, `phase-5/docker-compose.yml`

---

## Phase 1: Infrastructure Setup (Shared Infrastructure)

**Purpose**: Initialize Minikube, install Dapr, deploy Redpanda message broker

- [X] T001 Start Minikube with adequate resources (4 CPUs, 8GB memory, 50GB disk)
- [X] T002 Configure Docker daemon to use Minikube registry (`eval $(minikube docker-env)`)
- [X] T003 Verify Docker is using Minikube daemon (`docker info | grep "Name: minikube"`)
- [X] T004 Install Dapr CLI if not already present
- [X] T005 Initialize Dapr in Kubernetes (`dapr init -k`)
- [X] T006 Verify Dapr system pods are running (`kubectl get pods -n dapr-system`)
- [X] T007 Add Redpanda Helm repository (`helm repo add redpanda https://charts.redpanda.com`)
- [X] T008 Update Helm repositories (`helm repo update`)
- [X] T009 Install Redpanda with resource limits (1 CPU core, 1.5GB memory max for proper operation)
- [X] T010 Wait for Redpanda pod to be ready (`kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s`)
- [X] T011 Create Kafka topic `task-created` in Redpanda
- [X] T012 Create Kafka topic `task-completed` in Redpanda
- [X] T013 Create Kafka topic `task-updated` in Redpanda
- [X] T014 Create Kafka topic `task-deleted` in Redpanda
- [X] T015 Create Kafka topic `reminder-due` in Redpanda
- [X] T016 Create Kafka topic `task-updates` in Redpanda
- [X] T017 Verify all 6 Kafka topics exist (`kubectl exec -it redpanda-0 -- rpk topic list`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Dapr Components Configuration

- [X] T018 Create `phase-5/k8s-dapr/components/` directory
- [X] T019 Create Dapr Pub/Sub component in `phase-5/k8s-dapr/components/pubsub.yaml` (Kafka with Redpanda brokers)
- [X] T020 Create Dapr State Store component in `phase-5/k8s-dapr/components/statestore.yaml` (PostgreSQL for distributed state)
- [X] T021 Create Dapr Secret Store component in `phase-5/k8s-dapr/components/secrets.yaml` (Kubernetes secrets)
- [X] T022 Create `phase-5/k8s-dapr/bindings/` directory
- [X] T023 Create Dapr Cron Binding in `phase-5/k8s-dapr/bindings/cron-binding.yaml` (@every 1m for reminders)
- [X] T024 Apply all Dapr components to Kubernetes (`kubectl apply -f phase-5/k8s-dapr/components/`)
- [X] T025 Apply Dapr bindings to Kubernetes (`kubectl apply -f phase-5/k8s-dapr/bindings/`)
- [X] T026 Verify Dapr components are registered (`kubectl get components`)

### Event Publisher Utility

- [X] T027 Create `phase-5/backend/src/backend/utils/` directory
- [X] T028 Create event publisher utility in `phase-5/backend/src/backend/utils/event_publisher.py`
- [X] T029 Add httpx dependency to pyproject.toml if not present (already present)
- [X] T030 Implement `publish_event()` async function with Dapr HTTP API calls
- [X] T031 Add event envelope generation (event_id, timestamp, correlation_id)
- [X] T032 Add error handling for Dapr publish failures (fire-and-forget pattern)

### Dapr State Store Setup (Migration + Helper for Idempotency)

**⚠️ IMPORTANT**: Idempotency uses Dapr State Store. Do NOT create a `processed_events` SQL table.

- [X] T033 Create migration `phase-5/backend/migrations/003_dapr_state.sql` with `state` table (key TEXT PRIMARY KEY, value JSONB, isbinary BOOLEAN, insertdate TIMESTAMP, updatedate TIMESTAMP)
- [X] T034 Run migration against Neon PostgreSQL database
- [X] T035 Create Dapr state helper in `phase-5/backend/src/backend/utils/dapr_state.py`
- [X] T036 Implement `dapr_save_state(key, value)` async function using httpx POST to `http://localhost:{DAPR_HTTP_PORT}/v1.0/state/statestore`
- [X] T037 Implement `dapr_get_state(key)` async function using httpx GET from `http://localhost:{DAPR_HTTP_PORT}/v1.0/state/statestore/{key}`
- [X] T038 Implement `dapr_delete_state(key)` async function + add DAPR_HTTP_PORT env var handling (default 3500)

### Microservices Directory Structure

- [X] T039 Create `phase-5/backend/src/backend/microservices/` directory
- [X] T040 Create `phase-5/backend/src/backend/microservices/__init__.py`

### Docker Multi-Entrypoint Support

- [X] T041 Modify `phase-5/backend/Dockerfile` to add ENV SERVICE="backend-api"
- [X] T042 Update Dockerfile CMD to support multiple service entrypoints via SERVICE env var
- [X] T043 Verify Dockerfile builds successfully with `docker build -t phase5-backend:v1 ./phase-5/backend`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel
**Constitution Check**: All Phase 2 tasks align with Constitution gates (IV: Event-Driven Decoupling, VII: Observability)

---

## Phase 3: User Story 1 - Real-Time Task Updates Across Devices (Priority: P1) 🎯 MVP

**Goal**: Deliver real-time synchronization of task changes across all connected user sessions via WebSocket broadcasts

**Independent Test**: Open two browser tabs to the same user account, create a task in Tab A, verify it appears in Tab B within 2 seconds without manual refresh

### Implementation for User Story 1

- [X] T044 [P] [US1] Create WebSocket microservice in `phase-5/backend/src/backend/microservices/websocket_service.py`
- [X] T045 [US1] Add WebSocket endpoint `/ws/{user_id}` in `phase-5/backend/src/backend/microservices/websocket_service.py`
- [X] T046 [US1] Implement active connections tracking per user_id in `phase-5/backend/src/backend/microservices/websocket_service.py`
- [X] T047 [US1] Add `/health` endpoint in `phase-5/backend/src/backend/microservices/websocket_service.py`
- [X] T048 [US1] Implement event handler POST `/events/task-updates` in `phase-5/backend/src/backend/microservices/websocket_service.py`
- [X] T049 [US1] Add event broadcasting logic to all connected user sessions in `phase-5/backend/src/backend/microservices/websocket_service.py`
- [X] T050 [US1] Add connection cleanup on WebSocket disconnect in `phase-5/backend/src/backend/microservices/websocket_service.py`
- [X] T051 [P] [US1] Create Helm chart directory `phase-5/helm-charts/websocket-service/`
- [X] T052 [P] [US1] Create `phase-5/helm-charts/websocket-service/Chart.yaml`
- [X] T053 [P] [US1] Create `phase-5/helm-charts/websocket-service/values.yaml` with dapr.appId="websocket-service", dapr.appPort="8004"
- [X] T054 [P] [US1] Create `phase-5/helm-charts/websocket-service/templates/deployment.yaml` with Dapr annotations
- [X] T055 [P] [US1] Create `phase-5/helm-charts/websocket-service/templates/service.yaml` (ClusterIP, port 8004)
- [X] T056 [US1] Update backend-api to publish task-created events with user_id for partitioning
- [X] T057 [US1] Update backend-api to publish task-updated events in `phase-5/backend/src/backend/routers/tasks.py`
- [X] T058 [US1] Update backend-api to publish task-deleted events in `phase-5/backend/src/backend/routers/tasks.py`
- [X] T059 [US1] Update backend-api to publish task-completed events in `phase-5/backend/src/backend/routers/tasks.py`
- [X] T060 [US1] Modify `phase-5/backend/src/backend/routers/tasks.py` to import and use `publish_event()` from utils

**Checkpoint**: Real-time updates should work - tasks created in one tab appear in other tabs within 2 seconds

---

## Phase 4: User Story 2 - Automatic Recurring Task Generation (Priority: P1) 🎯 MVP

**Goal**: Automatically create the next occurrence when a recurring task is completed

**Independent Test**: Create a daily recurring task, mark it complete, verify a new task for tomorrow is created within 5 seconds

### Implementation for User Story 2

- [X] T061 [P] [US2] Create Recurring microservice in `phase-5/backend/src/backend/microservices/recurring_service.py`
- [X] T062 [US2] Add `/health` endpoint in `phase-5/backend/src/backend/microservices/recurring_service.py`
- [X] T063 [US2] Implement event handler POST `/events/task-completed` in `phase-5/backend/src/backend/microservices/recurring_service.py`
- [X] T064 [US2] Add logic to check if task has recurring_rule in event payload
- [X] T065 [US2] Add TaskService import in `phase-5/backend/src/backend/microservices/recurring_service.py`
- [X] T066 [US2] Call `task_service._create_next_recurring_instance()` for recurring tasks
- [X] T067 [US2] Return "ignored" status if task is not recurring in `phase-5/backend/src/backend/microservices/recurring_service.py`
- [X] T068 [P] [US2] Create Helm chart directory `phase-5/helm-charts/recurring-service/`
- [X] T069 [P] [US2] Create `phase-5/helm-charts/recurring-service/Chart.yaml`
- [X] T070 [P] [US2] Create `phase-5/helm-charts/recurring-service/values.yaml` with dapr.appId="recurring-service", dapr.appPort="8001"
- [X] T071 [P] [US2] Create `phase-5/helm-charts/recurring-service/templates/deployment.yaml` with Dapr annotations
- [X] T072 [P] [US2] Create `phase-5/helm-charts/recurring-service/templates/service.yaml` (ClusterIP, port 8001)
- [X] T073 [US2] Ensure task-completed event includes recurring_rule in published data from backend-api

**Checkpoint**: Recurring task completion should automatically create next instance within 5 seconds

---

## Phase 5: User Story 3 - Timely Reminder Notifications (Priority: P2)

**Goal**: Deliver notifications when task reminders are due via scheduled checks

**Independent Test**: Set a reminder for 1 minute in the future, verify notification appears at the correct time

### Implementation for User Story 3

- [X] T074 [P] [US3] Create Notification microservice in `phase-5/backend/src/backend/microservices/notification_service.py`
- [X] T075 [US3] Add `/health` endpoint in `phase-5/backend/src/backend/microservices/notification_service.py`
- [X] T076 [US3] Implement cron handler POST `/reminder-check` for Dapr Cron Binding in `phase-5/backend/src/backend/microservices/notification_service.py`
- [X] T077 [US3] Add query logic to find tasks where reminder_at <= NOW() and reminder_sent = False
- [X] T078 [US3] Add NotificationService import in `phase-5/backend/src/backend/microservices/notification_service.py`
- [X] T079 [US3] Call `notification_service.create_notification()` for each due reminder
- [X] T080 [US3] Update reminder_sent flag to True after notification created
- [X] T081 [US3] Return processed count in `phase-5/backend/src/backend/microservices/notification_service.py`
- [X] T082 [P] [US3] Create Helm chart directory `phase-5/helm-charts/notification-service/`
- [X] T083 [P] [US3] Create `phase-5/helm-charts/notification-service/Chart.yaml`
- [X] T084 [P] [US3] Create `phase-5/helm-charts/notification-service/values.yaml` with dapr.appId="notification-service", dapr.appPort="8002"
- [X] T085 [P] [US3] Create `phase-5/helm-charts/notification-service/templates/deployment.yaml` with Dapr annotations
- [X] T086 [P] [US3] Create `phase-5/helm-charts/notification-service/templates/service.yaml` (ClusterIP, port 8002)

**Checkpoint**: Reminders should trigger notifications within 60 seconds of due time

---

## Phase 6: User Story 4 - Complete Audit Trail (Priority: P2)

**Goal**: Deliver complete audit logging of all task events to the database

**Independent Test**: Perform CRUD operations on tasks, verify all events are logged with timestamps and user IDs

### Implementation for User Story 4

- [X] T087 [P] [US4] Create Audit microservice in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T088 [US4] Add `/health` endpoint in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T089 [P] [US4] Implement event handler POST `/events/task-created` in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T090 [P] [US4] Implement event handler POST `/events/task-updated` in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T091 [P] [US4] Implement event handler POST `/events/task-completed` in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T092 [P] [US4] Implement event handler POST `/events/task-deleted` in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T093 [US4] Add AuditService import in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T094 [US4] Call `audit_service.log_event()` with event_type, entity_type, entity_id, user_id, data
- [X] T095 [US4] Convert event_type from kebab-case to camelCase (task-created -> created)
- [X] T096 [US4] Return {"status": "logged"} in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T097 [P] [US4] Create Helm chart directory `phase-5/helm-charts/audit-service/`
- [X] T098 [P] [US4] Create `phase-5/helm-charts/audit-service/Chart.yaml`
- [X] T099 [P] [US4] Create `phase-5/helm-charts/audit-service/values.yaml` with dapr.appId="audit-service", dapr.appPort="8003"
- [X] T100 [P] [US4] Create `phase-5/helm-charts/audit-service/templates/deployment.yaml` with Dapr annotations
- [X] T101 [P] [US4] Create `phase-5/helm-charts/audit-service/templates/service.yaml` (ClusterIP, port 8003)

**Checkpoint**: All task events should be logged to audit_logs table with full context

---

## Phase 7: User Story 5 - Resilient Service Operation (Priority: P3)

**Goal**: Ensure individual services fail gracefully without bringing down the entire application

**Independent Test**: Stop the audit-service pod, verify task creation still works, restart service and verify events are processed

### Implementation for User Story 5

**⚠️ IMPORTANT**: Idempotency uses Dapr State Store (dapr_state.py), NOT a database table or SQLModel.

- [X] T102 [US5] Create idempotency utility in `phase-5/backend/src/backend/utils/idempotency.py` using dapr_state helpers
- [X] T103 [US5] Implement `check_and_mark_processed(event_id, service_name)` function using `dapr_get_state()` and `dapr_save_state()` with key format `processed-{event_id}-{service_name}`
- [X] T104 [US5] Add idempotency checks to recurring_service event handler in `phase-5/backend/src/backend/microservices/recurring_service.py`
- [X] T105 [US5] Add idempotency checks to notification_service event handler in `phase-5/backend/src/backend/microservices/notification_service.py` (notification_service uses cron binding, not direct events) - N/A, cron binding doesn't use event subscription
- [X] T106 [US5] Add idempotency checks to audit_service event handlers in `phase-5/backend/src/backend/microservices/audit_service.py`
- [X] T107 [US5] Add idempotency checks to websocket_service event handler in `phase-5/backend/src/backend/microservices/websocket_service.py` (websocket uses push from Dapr, no need for idempotency on consumer side) - N/A, push model doesn't require idempotency
- [X] T108 [US5] Verify dapr_state.py helper is imported correctly in idempotency.py (NO ProcessedEvent model needed)
- [X] T109 [US5] Test idempotency by calling same event handler twice, verify second call returns early without processing
- [X] T110 [P] [US5] Add resource limits (CPU, memory) to all Helm chart values.yaml files
- [X] T111 [P] [US5] Add Dapr sidecar resource limits in all Helm charts via annotations
- [X] T112 [P] [US5] Configure Dapr retry policies in pubsub component (redeliverInterval, processingTimeout) - already configured in pubsub.yaml
- [X] T113 [US5] Add graceful shutdown handling in all microservices in `phase-5/backend/src/backend/microservices/` - FastAPI/uvicorn handles SIGTERM by default

**Checkpoint**: Services should continue operating when any single microservice is unavailable

---

## Phase 8: Modify Existing Services (Backend API & Frontend)

**Purpose**: Update existing monolithic services to publish events and proxy through Dapr

### Backend API Modifications

- [X] T114 Remove direct AuditService import from `phase-5/backend/src/backend/services/task_service.py` (lines 10-11)
- [X] T115 Remove direct NotificationService import from `phase-5/backend/src/backend/services/task_service.py` (lines 10-11)
- [X] T116 Remove AuditService initialization from `phase-5/backend/src/backend/services/task_service.py` (lines 20-21)
- [X] T117 Remove NotificationService initialization from `phase-5/backend/src/backend/services/task_service.py` (lines 20-21)
- [X] T118 Delete audit logging call in `create_task()` method in `phase-5/backend/src/backend/services/task_service.py` (lines 122-137)
- [X] T119 Delete audit logging call in `update_task()` method in `phase-5/backend/src/backend/services/task_service.py` (lines 189-199)
- [X] T120 Delete audit logging call in `delete_task()` method in `phase-5/backend/src/backend/services/task_service.py` (lines 219-231)
- [X] T121 Delete audit logging call in `toggle_complete()` method in `phase-5/backend/src/backend/services/task_service.py` (lines 266-288)
- [X] T122 Keep `_create_next_recurring_instance()` method intact in `phase-5/backend/src/backend/services/task_service.py` (will be used by recurring-service)
- [X] T123 Add event_publisher import to `phase-5/backend/src/backend/routers/tasks.py`
- [X] T124 Add `await publish_event()` call in create_task endpoint in `phase-5/backend/src/backend/routers/tasks.py` (topic: task-created)
- [X] T125 Add `await publish_event()` call in update_task endpoint in `phase-5/backend/src/backend/routers/tasks.py` (topic: task-updated)
- [X] T126 Add `await publish_event()` call in delete_task endpoint in `phase-5/backend/src/backend/routers/tasks.py` (topic: task-deleted)
- [X] T127 Add `await publish_event()` call in toggle_complete endpoint in `phase-5/backend/src/backend/routers/tasks.py` (topic: task-completed if completed)
- [X] T128 Verify no direct service-to-service calls remain in backend-api

### Frontend API Routes (Dapr Proxy)

- [X] T129 Create `phase-5/frontend/src/app/api/tasks/` directory
- [X] T130 [P] Create GET route in `phase-5/frontend/src/app/api/tasks/route.ts` (proxies to backend-api via Dapr)
- [X] T131 [P] Create POST route in `phase-5/frontend/src/app/api/tasks/route.ts` (proxies to backend-api via Dapr)
- [X] T132 Create `phase-5/frontend/src/app/api/tasks/[id]/` directory
- [X] T133 [P] Create GET route in `phase-5/frontend/src/app/api/tasks/[id]/route.ts` (proxies to backend-api via Dapr)
- [X] T134 [P] Create PATCH route in `phase-5/frontend/src/app/api/tasks/[id]/route.ts` (proxies to backend-api via Dapr)
- [X] T135 [P] Create DELETE route in `phase-5/frontend/src/app/api/tasks/[id]/route.ts` (proxies to backend-api via Dapr)
- [X] T136 Create `phase-5/frontend/src/app/api/notifications/` directory
- [X] T137 [P] Create GET route in `phase-5/frontend/src/app/api/notifications/route.ts` (proxies to notification-service via Dapr)
- [X] T138 Create `phase-5/frontend/src/app/api/notifications/[id]/` directory
- [X] T139 [P] Create PATCH route in `phase-5/frontend/src/app/api/notifications/[id]/route.ts` (proxies to notification-service via Dapr)
- [X] T140 [P] Create DELETE route in `phase-5/frontend/src/app/api/notifications/[id]/route.ts` (proxies to notification-service via Dapr)
- [X] T141 Add DAPR_HOST and DAPR_HTTP_PORT environment variables to frontend env configuration
- [X] T142 Add JWT token forwarding in all frontend API routes

### Helm Chart Updates

- [X] T143 [P] Add dapr section to `phase-5/helm-charts/backend/values.yaml`
- [X] T144 [P] Add dapr section to `phase-5/helm-charts/frontend/values.yaml`
- [X] T145 Update `phase-5/helm-charts/backend/templates/deployment.yaml` with Dapr pod annotations
- [X] T146 Update `phase-5/helm-charts/frontend/templates/deployment.yaml` with Dapr pod annotations
- [X] T147 Add conditional Dapr annotation logic using {{- if .Values.dapr.enabled }} in both charts

---

## Phase 9: Docker Compose for Local Development

**Purpose**: Enable local development without Minikube using docker-compose

**SKIPPED per user request** - All tasks T148-T165 skipped

- [ ] T148 Create `phase-5/docker-compose.yml` file
- [ ] T149 Add Redpanda service in `phase-5/docker-compose.yml` with Kafka ports 9092, 9644
- [ ] T150 Add backend-api service in `phase-5/docker-compose.yml` with DAPR_HTTP_PORT=3500
- [ ] T151 Add dapr-backend sidecar service in `phase-5/docker-compose.yml`
- [ ] T152 Add recurring-service service in `phase-5/docker-compose.yml`
- [ ] T153 Add dapr-recurring sidecar service in `phase-5/docker-compose.yml`
- [ ] T154 Add notification-service service in `phase-5/docker-compose.yml`
- [ ] T155 Add dapr-notification sidecar service in `phase-5/docker-compose.yml`
- [ ] T156 Add audit-service service in `phase-5/docker-compose.yml`
- [ ] T157 Add dapr-audit sidecar service in `phase-5/docker-compose.yml`
- [ ] T158 Add websocket-service service in `phase-5/docker-compose.yml`
- [ ] T159 Add dapr-websocket sidecar service in `phase-5/docker-compose.yml`
- [ ] T160 Add frontend service in `phase-5/docker-compose.yml` depends on backend-api
- [ ] T161 Add .dockerignore file to `phase-5/backend/` if not exists
- [ ] T162 Add .dockerignore file to `phase-5/frontend/` if not exists
- [ ] T163 Test docker-compose build runs successfully
- [ ] T164 Test docker-compose up -d starts all services
- [ ] T165 Verify docker-compose ps shows all services as healthy

---

## Phase 10: Build and Deployment Preparation

**Purpose**: Build container images and prepare for Minikube deployment

- [X] T166 Build backend image with `docker build -t phase5-backend:v1 phase-5/backend`
- [X] T167 Build frontend image with `docker build -t phase5-frontend:v1 phase-5/frontend`
- [X] T168 Tag backend image for microservices (same image, different SERVICE env var)
- [X] T169 Verify backend image exists in Docker daemon (`docker images | grep phase5`)
- [X] T170 Create Kubernetes secret for app-secrets with DATABASE_URL, JWT_SECRET, BETTER_AUTH_SECRET, OPENAI_API_KEY, XIAOMI_API_KEY
- [X] T171 Verify app-secrets secret exists (`kubectl get secret app-secrets`)

---

## Phase 11: Minikube Deployment

**Purpose**: Deploy all microservices to Minikube via Helm

- [X] T172 Deploy backend-api via Helm: `helm install backend phase-5/helm-charts/backend`
- [X] T173 Deploy frontend via Helm: `helm install frontend phase-5/helm-charts/frontend`
- [X] T174 Deploy recurring-service via Helm: `helm install recurring-service phase-5/helm-charts/recurring-service`
- [X] T175 Deploy notification-service via Helm: `helm install notification-service phase-5/helm-charts/notification-service`
- [X] T176 Deploy audit-service via Helm: `helm install audit-service phase-5/helm-charts/audit-service`
- [X] T177 Deploy websocket-service via Helm: `helm install websocket-service phase-5/helm-charts/websocket-service`
- [X] T178 Verify all 5 backend deployments are running (`kubectl get deployments`)
- [X] T179 Verify all pods show 2/2 or 1/2 containers (app + Dapr sidecar) (`kubectl get pods`)
- [X] T180 Verify all pods are in Running status (`kubectl get pods`)
- [X] T181 Start minikube tunnel for LoadBalancer access
- [X] T182 Get frontend external IP from `kubectl get svc frontend` (127.0.0.1)
- [X] T183 Test frontend accessibility at http://<EXTERNAL-IP>:3000

---

## Phase 12: Testing & Validation

**Purpose**: End-to-end testing of the microservices architecture

### Infrastructure Validation

- [X] T184 [P] Verify Dapr components are registered (`kubectl get components`)
- [X] T185 [P] Verify Redpanda has all 6 topics (`kubectl exec -it redpanda-0 -- rpk topic list`)
- [X] T186 [P] Verify all pods are healthy (`kubectl get pods`)
- [X] T187 [P] Verify all services have endpoints (`kubectl get endpoints`)

### Event Flow Testing

- [X] T188 Create a test task via API: `curl -X POST http://<frontend-ip>:3000/api/tasks -H "Content-Type: application/json" -d '{"title": "Test Task"}'`
- [X] T189 Verify audit-service received task-created event (`kubectl logs -l app=audit-service --tail=50`)
- [X] T190 Verify websocket-service received task-created event (`kubectl logs -l app=websocket-service --tail=50`)
- [X] T191 Create a recurring daily task and complete it
- [X] T192 Verify recurring-service created next task (`kubectl logs -l app=recurring-service --tail=50`)
- [X] T193 Set a reminder for 1 minute in the future
- [X] T194 Verify notification-service processes reminder and creates notification
- [X] T195 Verify websocket-service broadcasts reminder notification
- [X] T196 Check Redpanda topic has messages: `kubectl exec -it redpanda-0 -- rpk topic consume task-created --num 1`

### Resilience Testing

- [X] T197 Stop audit-service pod: `kubectl scale deployment audit-service --replicas=0`
- [X] T198 Verify task creation still works without audit-service
- [X] T199 Restart audit-service: `kubectl scale deployment audit-service --replicas=1`
- [X] T200 Verify audit-service processes pending events when back online

### Quickstart Validation

- [X] T201 Run Local Docker Testing steps from `specs/013-microservices-dapr/quickstart.md` (Phase A)
- [X] T202 Run Minikube Deployment Testing steps from `specs/013-microservices-dapr/quickstart.md` (Phase B)
- [X] T203 Run End-to-End Event Flow Testing from `specs/013-microservices-dapr/quickstart.md` (Phase C)

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and validation

- [X] T204 [P] Update README.md in phase-5/ with microservices architecture overview
- [X] T205 [P] Create architecture diagram showing event flow between services
- [X] T206 [P] Add troubleshooting section to README.md
- [X] T207 [P] Document environment variables in phase-5/backend/.env.example
- [X] T208 [P] Document environment variables in phase-5/frontend/.env.example
- [X] T209 [P] Update .gitignore to exclude phase-5/backend/.env and phase-5/frontend/.env.local
- [X] T210 Remove or archive `phase-5/backend/src/backend/services/reminder_service.py` (replaced by Dapr cron binding) - SKIPPED (kept for reference)
- [X] T211 Remove direct service integration tests that are now obsolete - SKIPPED
- [X] T212 Run quickstart.md validation steps to ensure deployment guide is accurate
- [X] T213 Update CLAUDE.md or project documentation with microservices architecture details
- [X] T214 Validate all constitution compliance checks pass (I, II, III, IV, V, VI, VII, VIII)
- [X] T215 Verify all user stories are independently testable per spec.md requirements

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
- **Backend Modifications (Phase 8)**: Can run in parallel with user story implementation
- **Docker Compose (Phase 9)**: Can run in parallel after foundational setup
- **Build & Deploy (Phase 10-11)**: Depends on all implementation phases
- **Testing (Phase 12)**: Depends on deployment completion
- **Polish (Phase 13)**: Depends on all testing passing

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

**All user stories are INDEPENDENT** and can be implemented in parallel by different team members.

### Within Each User Story

- Helm chart creation tasks [P] can run in parallel
- Event handler implementation can run in parallel
- Database schema changes must complete before event handler implementation
- Event publishing in backend-api must complete before event consumption can be validated

### Parallel Opportunities

- All Helm chart creation tasks marked [P] can run in parallel
- All microservice entry point creation tasks marked [P] can run in parallel
- All frontend API route creation tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- Infrastructure validation tests marked [P] can run in parallel

---

## Parallel Example: User Story 1 (Real-Time Updates)

```bash
# Launch all Helm chart creation together:
Task: "Create helm chart directory phase-5/helm-charts/websocket-service/"
Task: "Create phase-5/helm-charts/websocket-service/Chart.yaml"
Task: "Create phase-5/helm-charts/websocket-service/values.yaml"
Task: "Create phase-5/helm-charts/websocket-service/templates/deployment.yaml"

# Launch all frontend API route creation together:
Task: "Create GET route in phase-5/frontend/src/app/api/tasks/route.ts"
Task: "Create POST route in phase-5/frontend/src/app/api/tasks/route.ts"
Task: "Create GET route in phase-5/frontend/src/app/api/tasks/[id]/route.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Both P1)

1. Complete Phase 1: Setup (Infrastructure)
2. Complete Phase 2: Foundational (Dapr components, event publisher, migration)
3. Complete Phase 3: User Story 1 (Real-Time Updates)
4. Complete Phase 4: User Story 2 (Recurring Tasks)
5. Complete Phase 8: Backend Modifications & Frontend Routes (partial)
6. **STOP and VALIDATE**: Test User Stories 1 and 2 independently
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Infrastructure ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP Part 1!)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP Part 2!)
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (WebSocket Service)
   - Developer B: User Story 2 (Recurring Service)
   - Developer C: User Story 3 (Notification Service)
   - Developer D: User Story 4 (Audit Service)
3. Stories complete and integrate independently

---

## Task Summary

**Total Task Count**: 215 tasks

**Tasks per User Story**:
- Setup: 17 tasks
- Foundational: 23 tasks
- User Story 1 (Real-Time Updates): 28 tasks
- User Story 2 (Recurring Tasks): 13 tasks
- User Story 3 (Reminders): 13 tasks
- User Story 4 (Audit Trail): 15 tasks
- User Story 5 (Resilience): 10 tasks
- Backend Modifications: 15 tasks
- Frontend Routes: 14 tasks
- Docker Compose: 18 tasks
- Build & Deploy: 12 tasks
- Testing: 20 tasks
- Polish: 12 tasks

**Parallel Opportunities**: 70+ tasks marked with [P] can be executed in parallel

**MVP Scope** (User Stories 1 & 2): 91 tasks (Setup + Foundational + US1 + US2)

**Independent Test Criteria**:
- US1: Open two browser tabs, create task in Tab A, verify appears in Tab B within 2 seconds
- US2: Complete recurring task, verify next instance created within 5 seconds
- US3: Set reminder for 1 minute future, verify notification appears
- US4: Perform CRUD operations, verify audit logs are complete
- US5: Stop a service, verify others continue operating, restart verifies event processing

**Format Validation**: All 215 tasks follow the checklist format `- [ ] [ID] [P?] [Story?] Description` with exact file paths
