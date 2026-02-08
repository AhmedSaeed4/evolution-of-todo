---
id: "0002"
title: "microservices-dapr-implementation-plan"
stage: "plan"
date: "2026-02-04"
surface: "agent"
model: "claude-opus-4-5-20251101"
feature: "013-microservices-dapr"
branch: "013-microservices-dapr"
user: "architext"
command: "/sp.plan"
labels: ["microservices", "dapr", "event-driven", "kafka", "redpanda"]
links:
  spec: "/mnt/d/F drive backup/coding Q4/hackathon-2/save-45-minikube/hackathon-todo/specs/013-microservices-dapr/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - /mnt/d/F drive backup/coding Q4/hackathon-2/save-45-minikube/hackathon-todo/specs/013-microservices-dapr/plan.md
  - /mnt/d/F drive backup/coding Q4/hackathon-2/save-45-minikube/hackathon-todo/specs/013-microservices-dapr/research.md
  - /mnt/d/F drive backup/coding Q4/hackathon-2/save-45-minikube/hackathon-todo/specs/013-microservices-dapr/data-model.md
  - /mnt/d/F drive backup/coding Q4/hackathon-2/save-45-minikube/hackathon-todo/specs/013-microservices-dapr/contracts/api-contracts.md
  - /mnt/d/F drive backup/coding Q4/hackathon-2/save-45-minikube/hackathon-todo/specs/013-microservices-dapr/quickstart.md
tests: []
---

## Prompt

Create a detailed implementation plan for Branch 013-microservices-dapr, which transforms the monolithic todo app into a true microservices architecture with Dapr event-driven communication.

## CRITICAL INSTRUCTIONS - DO THIS FIRST

Before creating ANY plan, you MUST:

1. EXAMINE existing codebase:
   - phase-5/backend/src/backend/ - Current monolithic structure
   - phase-5/backend/src/backend/models/ - Data models (Task, AuditLog, Notification)
   - phase-5/backend/src/backend/services/ - Current services (task_service.py, reminder_service.py)
   - phase-5/backend/
   - phase-5/backend/src/backend/routers/ - Current routes
   - phase-5/frontend/
   - phase-5/frontend/src/app/api/
   - phase-5/frontend/src/ - Frontend structure and API calls
   - phase-5/helm-charts/ - EXISTING Helm charts to extend

2. READ skill: `.claude/skills/minikube-deployment/` for deployment patterns
3. VERIFY all dependencies - FastAPI structure, Next.js patterns, PostgreSQL connections, JWT auth
4. CROSS-REFERENCE - Ensure your plan matches hackathon requirements exactly

DO NOT write code. DO NOT create files. ONLY create a detailed PLAN after thorough research.

---

## ⚠️ CRITICAL ARCHITECTURE REQUIREMENT #1: Event-Driven Services

### The Problem (Current Monolith )

Backend-api calls services DIRECTLY (synchronous, blocking):

```python
# ❌ CURRENT MONOLITH PATTERN - Must be changed
async def create_task(...):
    task = task_service.create_task(...)   # Save to DB ← KEEP THIS
    audit_service.log_event(...)           # Direct call - REMOVE
    notification_service.notify(...)       # Direct call - REMOVE
    return task
```

### The Solution (Microservices - Branch 013)

Backend-api publishes EVENTS, other services consume them INDEPENDENTLY:

```python
# ✅ NEW MICROSERVICES PATTERN
async def create_task(...):
    task = task_service.create_task(...)   # Save to DB ← KEEP
    await dapr_publish("task-created", task_data)  # Non-blocking event ← ADD
    return task  # Returns IMMEDIATELY
```

### What to Keep vs Remove in backend-api

| Service | Action | Reason |
|---------|--------|--------|
| `task_service.py` | ✅ **KEEP** | Core CRUD operations for tasks |
| `audit_service.py` calls | ❌ REMOVE | Replace with event publishing |
| `notification_service.py` calls | ❌ REMOVE | Replace with event publishing |
| `reminder_service.py` polling | ❌ REMOVE | Replace with Dapr cron binding |
| `task_serves_mcp_tools.py` | ✅ **KEEP** | MCP tools stay unchanged |

---

## ⚠️ CRITICAL ARCHITECTURE REQUIREMENT #2: Frontend Communication

Browsers CANNOT access Dapr sidecar directly (localhost:3500 is server-only).

```
Browser → Next.js API Route (Server) → Dapr Sidecar → Backend Service
```

---

## ⚠️ CRITICAL ARCHITECTURE REQUIREMENT #3: Helm Charts Structure

```
phase-5/
├── helm-charts/                    ← EXISTING folder
│   ├── frontend/                   ← UPDATE: add Dapr annotations
│   ├── backend/                    ← UPDATE: add Dapr annotations
│   ├── recurring-service/          ← NEW
│   ├── notification-service/       ← NEW
│   ├── audit-service/              ← NEW
│   └── websocket-service/          ← NEW
│
└── k8s-dapr/                       ← NEW folder
    ├── components/
    │   ├── pubsub.yaml             ← Points to Redpanda
    │   ├── statestore.yaml
    │   └── secrets.yaml
    ├── subscriptions/
    └── bindings/
        └── cron-binding.yaml
```

### Helm Chart Dapr Annotations

Each `deployment.yaml` template needs:
```yaml
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "{{ .Values.dapr.appId }}"
        dapr.io/app-port: "{{ .Values.dapr.appPort }}"
```

---

## SCOPE

### What to BUILD:

**6 Microservices:**
- frontend (3000), backend-api (8000)
- recurring-service (8001), notification-service (8002)
- audit-service (8003), websocket-service (8004)

**Infrastructure:**
- Redpanda (local Kafka replacement)
- Dapr sidecars on all pods
- 6 Kafka topics

**6 Kafka Topics:**
- task-created, task-completed, task-updated, task-deleted
- reminder-due, task-updates

**5 Dapr Building Blocks:**
- Pub/Sub, State Store, Service Invocation, Secrets, Bindings

---

### What is OUT OF SCOPE:

- ❌ Oracle OKE / Cloud deployment (branch 014)
- ❌ GitHub Actions CI/CD (branch 014)

---

## ARCHITECTURAL DECISIONS (Already Made)

| # | Question | Decision |
|---|----------|----------|
| 1 | Database | Single shared Neon PostgreSQL |
| 2 | Reminder | Dapr Cron Binding replaces asyncio |
| 3 | Auth | Shared auth/ folder |
| 4 | Frontend | API Routes → Dapr → Backend |
| 5 | Event Ordering | Partition by user_id |
| 6 | Failure Handling | Dapr retry + idempotency table |
| 7 | Deployment | Helm charts, NOT raw K8s YAML |
| 8 | Message Broker | Redpanda (Kafka-compatible) |

---

## IMPLEMENTATION PHASES (Correct Order)

### Phase 1: Infrastructure Setup (MUST DO FIRST)

```bash
# 1.1 Start Minikube
minikube start

# 1.2 Configure Docker to use Minikube
eval $(minikube docker-env)

# 1.3 Install Dapr
dapr init -k

# 1.4 Deploy Redpanda
helm repo add redpanda https://charts.redpanda.com
helm install redpanda redpanda/redpanda \
  --set resources.cpu.cores=1 \
  --set resources.memory.container.max=1Gi

# 1.5 Wait for Redpanda to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s

# 1.6 Create Kafka Topics
kubectl exec -it redpanda-0 -- rpk topic create \
  task-created \
  task-completed \
  task-updated \
  task-deleted \
  reminder-due \
  task-updates

# 1.7 Verify topics
kubectl exec -it redpanda-0 -- rpk topic list
```

[... rest of user prompt includes detailed phases 2-12 and testing sections ...]

## Response snapshot

Generated comprehensive implementation plan including:

**Plan Structure (plan.md)**:
- Technical Context: Python 3.13+, FastAPI, Dapr, Redpanda, Neon PostgreSQL
- Constitution Check: All 8 gates passed
- Project Structure: Detailed file tree for 6 microservices
- Implementation Phases 1-12: Infrastructure → Dapr Components → Event Publisher → Microservices → Backend Modification → Docker → Helm → Frontend Routes → Migration → Deployment
- Testing Section: Local Docker, Minikube, E2E Event Flow, Troubleshooting
- ADR Suggestions: 3 architectural decisions identified

**Research.md**:
- Direct service calls to remove (with line numbers)
- Event schema design (following Constitution IV.B)
- Dapr component specifications (Pub/Sub, Cron, State Store, Secrets)
- Helm annotation patterns
- Environment variables reference
- Technology choices trade-offs

**Data-model.md**:
- Existing models (Task, Notification, AuditLog)
- New model (ProcessedEvent for idempotency)
- Event schemas (6 event types with TypeScript interfaces)
- State machine diagram
- Data flow diagrams
- Entity relationship diagram

**Contracts/api-contracts.md**:
- Backend API routes (unchanged endpoints, new internal behavior)
- Frontend proxy routes (Dapr invocation pattern)
- Microservice event endpoints
- Error response standards
- OpenAPI specification

**Quickstart.md**:
- Local development with docker-compose
- Minikube deployment step-by-step
- Troubleshooting guide
- Development workflow

## Outcome

- ✅ Impact: Created detailed implementation plan for transforming monolithic Phase 5 into event-driven microservices with Dapr
- 🧪 Tests: No tests executed (planning phase)
- 📁 Files: Created plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md
- 🔁 Next prompts: Run `/sp.tasks` to generate actionable tasks, consider creating ADRs for architectural decisions
- 🧠 Reflection: Successfully completed thorough research of existing codebase, identified all direct service calls to remove, designed comprehensive event schemas, and created complete deployment guide for both local and Minikube environments

## Evaluation notes (flywheel)

- Failure modes observed: None - research phase completed successfully
- Graders run and results (PASS/FAIL): N/A (planning phase)
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Execute Phase 1 (Infrastructure Setup) to validate Redpanda and Dapr installation on Minikube
