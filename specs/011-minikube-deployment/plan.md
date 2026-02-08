# Implementation Plan: Minikube Deployment

**Branch**: `011-minikube-deployment` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-minikube-deployment/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deploy the Phase-4 full-stack application (Next.js 16.1.1 frontend + FastAPI backend with AI agents) to a local Minikube cluster using Docker multi-stage builds and Helm charts. This delivers a production-like Kubernetes environment with proper service separation (ClusterIP for backend, LoadBalancer for frontend), secret management via Kubernetes Secrets, and health check probes for self-healing.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x, Node.js 20-alpine
- Backend: Python 3.13+, FastAPI 0.128.0

**Primary Dependencies**:
- Frontend: Next.js 16.1.1, React 19.2.3, better-auth 1.4.9, @openai/chatkit-react 1.4.1
- Backend: FastAPI, SQLModel, OpenAI Agents SDK, openai-chatkit 1.5.3, asyncpg, uvicorn
- Infrastructure: Docker, Minikube, Helm 3.x, kubectl

**Storage**: Neon Serverless PostgreSQL (external cloud database, SSL required)

**Testing**: pytest (backend), manual testing (frontend), kubectl verification commands

**Target Platform**: Local Minikube cluster (Kubernetes), portable to production clouds (Oracle OKE, AWS EKS)

**Project Type**: Web application (full-stack with frontend + backend)

**Performance Goals**:
- First Docker build: <10 minutes (downloading + compiling)
- Cached rebuild: <3 minutes
- Pod startup: <60 seconds
- Frontend image size: <200MB (with standalone output)
- Backend image size: <300MB

**Constraints**:
- Must use `eval $(minikube docker-env)` before building (build images in Minikube's daemon)
- No external registry push for local deployment
- `imagePullPolicy: IfNotPresent` (not `Always`)
- No hardcoded secrets in values.yaml
- Health checks required for both services

**Scale/Scope**:
- Single developer environment
- 2 services (frontend + backend)
- 2 Helm charts
- 1 Kubernetes Secret for environment variables
- 2 Docker images (phase4-frontend:v1, phase4-backend:v1)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Evolution of Todo Constitution v1.1.0 Compliance:**

- [x] **I. Universal Logic Decoupling**: Business logic decoupled from presentation layer - Phase-4 backend maintains service layer separation; deployment does not change this
- [x] **II. AI-Native Interoperability**: MCP tools defined with strict typing - Existing MCP tools (7 tools) preserved; deployment adds containerization
- [x] **III. Strict Statelessness**: No in-memory session storage, all state persisted - Phase-4 already uses Neon PostgreSQL for persistence; no state changes
- [x] **IV. Event-Driven Decoupling**: Async operations use event streams (not direct HTTP) - Not applicable to deployment infrastructure (Phase V concern)
- [x] **V. Zero-Trust Multi-Tenancy**: All queries scoped to user_id - Existing JWT-based user isolation preserved; secrets managed via Kubernetes Secrets
- [x] **VI. Technology Stack**: Authorized libraries only (Python 3.13+, FastAPI, SQLModel, etc.) - No new dependencies added; containerization uses approved bases (node:20-alpine, python:3.13-slim)
- [x] **VII. Security**: JWT validation, input validation, no hardcoded secrets - Secrets stored in Kubernetes Secrets, not in values.yaml or git
- [x] **VIII. Observability**: Structured logging, metrics, audit trail requirements met - Health checks (/health, /api/health) configured for Kubernetes probes

**Status**: ✅ All gates passed - No constitution violations. This is infrastructure deployment work that preserves existing application architecture.

## Project Structure

### Documentation (this feature)

```text
specs/011-minikube-deployment/
├── spec.md              # Feature specification (already exists)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command - K8s manifests)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-4/
├── frontend/              # Existing Next.js 16.1.1 application
│   ├── Dockerfile        # NEW: Multi-stage Dockerfile for Next.js
│   ├── .dockerignore     # NEW: Docker build exclusions
│   ├── next.config.ts    # MODIFY: Add output: 'standalone'
│   ├── src/
│   │   ├── app/
│   │   │   └── api/health/route.ts  # NEW: Health check endpoint
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   └── package.json
│
├── backend/               # Existing FastAPI application
│   ├── Dockerfile        # NEW: Multi-stage Dockerfile for FastAPI
│   ├── .dockerignore     # NEW: Docker build exclusions
│   ├── src/backend/
│   │   ├── main.py       # Existing: Has /health endpoint
│   │   ├── config.py
│   │   ├── routers/
│   │   ├── models/
│   │   ├── agents.py     # Existing: Dual-agent system
│   │   └── api/
│   │       └── chatkit.py
│   └── pyproject.toml
│
└── helm-charts/           # NEW: Helm charts directory
    ├── frontend/          # NEW: Generated via helm create
    │   ├── Chart.yaml
    │   ├── values.yaml    # Customize: image, port, env, API_URL
    │   └── templates/
    │       ├── deployment.yaml
    │       ├── service.yaml    # LoadBalancer type
    │       └── ...
    │
    └── backend/           # NEW: Generated via helm create
        ├── Chart.yaml
        ├── values.yaml    # Customize: image, port, secrets, envFrom
        └── templates/
            ├── deployment.yaml
            ├── service.yaml    # ClusterIP type
            └── ...
```

**Structure Decision**: Web application (Option 2) - Full-stack Next.js + FastAPI. This feature adds containerization and Kubernetes deployment artifacts without modifying existing application logic. The frontend/backend directories already exist in `phase-4/`; this plan adds Dockerfiles, .dockerignore files, Helm charts, and modifies next.config.ts for standalone output.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No constitution violations | All gates passed; deployment infrastructure preserves existing architecture |

---

## Phase 0: Research & Technology Decisions

### Completed Research (from spec.md and skill patterns)

**Decision 1: Docker Build Pattern**
- **Selected**: Multi-stage builds for both frontend and backend
- **Rationale**: Reduces final image size, separates build dependencies from runtime, follows production best practices
- **Alternatives considered**: Single-stage builds (rejected due to larger images), distroless bases (rejected due to debugging complexity)

**Decision 2: Next.js Standalone Output**
- **Selected**: Add `output: 'standalone'` to next.config.ts
- **Rationale**: Reduces frontend Docker image from ~500MB to <200MB, enables minimal production runtime
- **Alternatives considered**: Standard output (rejected - larger images), static export (rejected - loses SSR capabilities)

**Decision 3: Service Types for Minikube**
- **Selected**: Frontend = LoadBalancer, Backend = ClusterIP
- **Rationale**: Simulates production architecture (public frontend, private backend), enables minikube tunnel for external access
- **Alternatives considered**: Both LoadBalancer (rejected - unnecessary cost in production), Both NodePort (rejected - not production-like)

**Decision 4: Secret Management**
- **Selected**: Kubernetes Secrets with `envFrom: secretRef`
- **Rationale**: Keeps secrets out of git, works identically for local Minikube and production clouds (Oracle/AWS)
- **Alternatives considered**: Hardcoded in values.yaml (rejected - security risk), ConfigMap (rejected - not for sensitive data)

**Decision 5: Image Registry Strategy**
- **Selected**: Build directly in Minikube's Docker daemon (no registry push)
- **Rationale**: Eliminates registry setup complexity for local development, faster iteration
- **Alternatives considered**: Local registry (rejected - adds complexity), Docker Hub (rejected - unnecessary for local)

**Decision 6: Health Check Strategy**
- **Selected**: Kubernetes liveness/readiness probes using existing endpoints
- **Rationale**: Enables self-healing, graceful pod lifecycle management
- **Implementation**: Frontend uses `/api/health`, Backend uses `/health` (already exists in main.py)

### Technology Choices Confirmed

| Component | Technology | Version | Justification |
|-----------|------------|---------|---------------|
| Frontend Base | node | 20-alpine | Minimal base, matches project requirements |
| Backend Base | python | 3.13-slim | Matches Constitution VI requirement |
| Package Manager (Frontend) | npm | builtin | Standard for Next.js projects |
| Package Manager (Backend) | uv | latest | Fast Python package manager, already in use |
| Container Runtime | Docker | builtin | Minikube default |
| Kubernetes Cluster | Minikube | latest | Local development standard |
| Package Manager (K8s) | Helm | 3.x | Standard for Kubernetes deployments |

---

## Phase 1: Design & Contracts

### Data Model

This is an infrastructure deployment feature - no new data models are introduced. The existing Phase-4 data models are preserved:

**Existing Entities (from Phase-4):**
- `users` - Better Auth user accounts (Neon PostgreSQL)
- `tasks` - Task management (SQLModel)
- `chat_sessions` - ChatKit conversation history (PostgreSQL)
- `chat_messages` - ChatKit message persistence (PostgreSQL)

**New Infrastructure Entities (Kubernetes):**
- `Pod` - Smallest deployable unit (frontend/backend containers)
- `Deployment` - Manages pod replicas and updates
- `Service` - Network abstraction (ClusterIP for backend, LoadBalancer for frontend)
- `Secret` - Encrypted storage for environment variables

### Environment Variables (Contracts)

**Backend Environment Variables (from .env):**

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| `DATABASE_URL` | Secret | Yes | Neon PostgreSQL connection string (SSL required) |
| `BETTER_AUTH_SECRET` | Secret | Yes | JWT secret for Better Auth (must match frontend) |
| `CORS_ORIGINS` | values.yaml | Yes | Comma-separated allowed origins |
| `API_HOST` | values.yaml | No | Bind address (default: 0.0.0.0) |
| `API_PORT` | values.yaml | No | Bind port (default: 8000) |
| `BETTER_AUTH_URL` | values.yaml | Yes | Frontend URL for JWT verification |
| `DEBUG` | values.yaml | No | Debug mode flag |
| `ENVIRONMENT` | values.yaml | No | Environment name |
| `OPENAI_API_KEY` | Secret | Yes | OpenAI API key for ChatKit session management |
| `XIAOMI_API_KEY` | Secret | Yes | Xiaomi API key for AI model |

**Frontend Environment Variables (from .env.local):**

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| `NEXT_PUBLIC_AUTH_BYPASS` | values.yaml | No | Auth bypass flag for testing |
| `DATABASE_URL` | Secret | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret | Yes | JWT secret (must match backend) |
| `NEXT_PUBLIC_AUTH_URL` | values.yaml | Yes | Frontend URL for auth callbacks |
| `NEXT_PUBLIC_BACKEND_URL` | values.yaml | Yes | Backend API URL (Kubernetes DNS) |
| `OPENAI_API_KEY` | Secret | Yes | OpenAI API key |
| `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` | values.yaml | No | ChatKit domain configuration |

**Kubernetes Secret Structure:**

```bash
# Secret name: phase4-secrets
kubectl create secret generic phase4-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=BETTER_AUTH_SECRET='...' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=XIAOMI_API_KEY='sk-...'
```

### API Contracts (Health Endpoints)

**Frontend Health Check:**

```
GET /api/health
Response: 200 OK
{
  "status": "ok",
  "timestamp": "2026-01-25T10:00:00Z"
}
```

**Backend Health Check (already exists):**

```
GET /health
Response: 200 OK
{
  "status": "healthy",
  "timestamp": "ok"
}
```

### Helm Chart Contracts

**Frontend Helm Chart (`phase4-frontend`):**

```yaml
# Key values.yaml fields
image:
  repository: phase4-frontend
  tag: "v1"
  pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 3000

env:
  NEXT_PUBLIC_BACKEND_URL: "http://backend:8000"
  NEXT_PUBLIC_AUTH_URL: "http://<EXTERNAL-IP>:3000"
  NEXT_PUBLIC_AUTH_BYPASS: "false"

# Health probes
livenessProbe:
  httpGet:
    path: /api/health
    port: http
readinessProbe:
  httpGet:
    path: /api/health
    port: http
```

**Backend Helm Chart (`phase4-backend`):**

```yaml
# Key values.yaml fields
image:
  repository: phase4-backend
  tag: "v1"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8000

# Load secrets
envFrom:
  - secretRef:
      name: phase4-secrets

# Additional non-sensitive env vars
env:
  CORS_ORIGINS: "http://localhost:3000,http://<EXTERNAL-IP>:3000"
  API_HOST: "0.0.0.0"
  API_PORT: "8000"
  BETTER_AUTH_URL: "http://frontend:3000"
  DEBUG: "false"
  ENVIRONMENT: "development"

# Health probes
livenessProbe:
  httpGet:
    path: /health
    port: http
readinessProbe:
  httpGet:
    path: /health
    port: http
```

---

## Deployment Architecture

### Kubernetes Network Topology

```
                    Internet
                       |
                       v
              [Minikube Tunnel]
                       |
                       v
            +---------------------+
            | LoadBalancer Service|
            |   (phase4-frontend) |
            +----------+----------+
                       |
                       v
            +---------------------+
            |  Frontend Pod(s)    |
            |  (Next.js 16.1.1)   |
            |  Port: 3000         |
            +----------+----------+
                       |
        Internal DNS:  |
        backend:8000   |
                       v
            +---------------------+
            | ClusterIP Service   |
            |   (phase4-backend)  |
            +----------+----------+
                       |
                       v
            +---------------------+
            |  Backend Pod(s)     |
            |  (FastAPI + Agents) |
            |  Port: 8000         |
            +----------+----------+
                       |
                       v
            +---------------------+
            |  Neon PostgreSQL    |
            |  (External Cloud)   |
            +---------------------+
```

### Service DNS Resolution

- **Frontend → Backend**: Uses Kubernetes internal DNS: `http://backend:8000`
- **Backend → Database**: Direct connection to Neon PostgreSQL (external)
- **External → Frontend**: Via LoadBalancer EXTERNAL-IP from `minikube tunnel`
- **External → Backend**: Not accessible (ClusterIP is internal-only, by design)

### Image Build Flow

```
1. eval $(minikube docker-env)
   └─> Configures Docker CLI to use Minikube's Docker daemon

2. docker build -t phase4-frontend:v1 ./phase-4/frontend
   └─> Builds in Minikube's Docker (not Docker Desktop)
   └─> Multi-stage: deps → build → runner
   └─> Result: ~150-200MB image

3. docker build -t phase4-backend:v1 ./phase-4/backend
   └─> Builds in Minikube's Docker (not Docker Desktop)
   └─> Multi-stage: builder → production
   └─> Result: ~250-300MB image

4. helm install backend ./phase-4/helm-charts/backend
   └─> Kubernetes pulls from local Minikube registry
   └─> No external push needed (IfNotPresent policy)

5. helm install frontend ./phase-4/helm-charts/frontend
   └─> Kubernetes pulls from local Minikube registry
   └─> No external push needed (IfNotPresent policy)
```

---

## Implementation Sequence

### Prerequisites
1. Minikube installed and running (`minikube start`)
2. Docker installed
3. kubectl installed
4. helm installed
5. Existing Phase-4 frontend and backend

### Step 1: Configure Next.js for Standalone Output
- **File**: `phase-4/frontend/next.config.ts`
- **Change**: Add `output: 'standalone'` to config
- **Validation**: Run `npm run build` and verify `.next/standalone` directory exists

### Step 2: Create Dockerfiles
- **Files**:
  - `phase-4/frontend/Dockerfile` (multi-stage: deps → build → runner)
  - `phase-4/backend/Dockerfile` (multi-stage: builder → production)
- **Templates**: From minikube-deployment skill examples
- **Validation**: `docker build` produces images without errors

### Step 3: Create .dockerignore Files
- **Files**:
  - `phase-4/frontend/.dockerignore`
  - `phase-4/backend/.dockerignore`
- **Purpose**: Exclude node_modules, .git, .env files, cache

### Step 4: Add Frontend Health Endpoint
- **File**: `phase-4/frontend/src/app/api/health/route.ts`
- **Purpose**: Kubernetes liveness/readiness probes
- **Response**: JSON with status and timestamp

### Step 5: Start Minikube and Configure Docker
- **Commands**:
  ```bash
  minikube start
  eval $(minikube docker-env)  # CRITICAL STEP
  ```
- **Validation**: `docker ps` shows Minikube containers

### Step 6: Build Docker Images
- **Commands**:
  ```bash
  docker build -t phase4-frontend:v1 ./phase-4/frontend
  docker build -t phase4-backend:v1 ./phase-4/backend
  ```
- **Expected time**: First build 5-8 minutes, cached rebuild 2-3 minutes

### Step 7: Create Kubernetes Secrets
- **Command**:
  ```bash
  kubectl create secret generic phase4-secrets \
    --from-literal=DATABASE_URL='...' \
    --from-literal=BETTER_AUTH_SECRET='...' \
    --from-literal=OPENAI_API_KEY='...' \
    --from-literal=XIAOMI_API_KEY='...'
  ```
- **Security**: Start with space to prevent shell history

### Step 8: Generate Helm Charts
- **Commands**:
  ```bash
  mkdir -p phase-4/helm-charts
  cd phase-4/helm-charts
  helm create frontend
  helm create backend
  cd ../..
  ```
- **Output**: Two Helm chart directories with templates

### Step 9: Customize Helm values.yaml
- **Files**:
  - `phase-4/helm-charts/frontend/values.yaml`
  - `phase-4/helm-charts/backend/values.yaml`
- **Changes**: Image names, ports, service types, env vars, secrets reference

### Step 10: Deploy to Minikube
- **Commands**:
  ```bash
  helm install backend ./phase-4/helm-charts/backend
  helm install frontend ./phase-4/helm-charts/frontend
  ```
- **Validation**: `kubectl get pods` shows Running status

### Step 11: Start Minikube Tunnel
- **Command**: `minikube tunnel` (in separate terminal)
- **Purpose**: Expose LoadBalancer with external IP
- **Validation**: `kubectl get services` shows EXTERNAL-IP

### Step 12: Verify Deployment
- **Checks**:
  - `kubectl get pods` - Both pods Running
  - `kubectl get services` - Frontend has EXTERNAL-IP
  - `helm list` - Both releases deployed
  - Browser access to `http://<EXTERNAL-IP>:3000`
  - Frontend can communicate with backend

---

## Success Criteria Verification

### Automated Checks
- [ ] Docker images built successfully in Minikube's Docker daemon
- [ ] `docker images` shows phase4-frontend and phase4-backend
- [ ] Helm charts generated without errors
- [ ] `helm list` shows both releases as deployed
- [ ] `kubectl get pods` shows both pods in Running state
- [ ] `kubectl get services` shows frontend LoadBalancer with EXTERNAL-IP

### Manual Checks
- [ ] Frontend accessible at `http://<EXTERNAL-IP>:3000`
- [ ] Frontend can reach backend via internal DNS
- [ ] User can log in (Better Auth working)
- [ ] User can create/view tasks
- [ ] AI chatbot responds (Xiaomi model working)
- [ ] Health check endpoints return 200 OK
- [ ] No secrets hardcoded in values.yaml or git

### Performance Validation
- [ ] First build time <10 minutes
- [ ] Cached rebuild time <3 minutes
- [ ] Pod startup time <60 seconds
- [ ] Frontend image size <200MB
- [ ] Backend image size <300MB

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| `ImagePullBackOff` error | Medium | High | Always run `eval $(minikube docker-env)` before building |
| Build timeout on first run | High | Low | Document expected 5-8 minute build time |
| Tunnel permission issues | Low | Medium | Document sudo requirement, provide fallback with `minikube service` |
| Next.js standalone missing | Medium | High | Add `output: 'standalone'` to next.config.ts as first step |
| Health check missing | Low | Medium | Add /api/health endpoint to frontend before deployment |
| Secrets in git | Medium | High | Use .dockerignore, create secrets via kubectl, never hardcode |
| CORS issues | Low | Medium | Update CORS_ORIGINS to include Minikube EXTERNAL-IP |

---

## Related Documentation

- **Spec**: [spec.md](./spec.md) - Full feature specification with user stories
- **Minikube Deployment Skill**: [.claude/skills/minikube-deployment/SKILL.md](../../.claude/skills/minikube-deployment/SKILL.md)
- **Workflow**: [.claude/skills/minikube-deployment/patterns/WORKFLOW.md](../../.claude/skills/minikube-deployment/patterns/WORKFLOW.md)
- **Dockerfile Patterns**: [.claude/skills/minikube-deployment/patterns/DOCKERFILE_PATTERNS.md](../../.claude/skills/minikube-deployment/patterns/DOCKERFILE_PATTERNS.md)
- **Helm Patterns**: [.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md](../../.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md)
- **Next.js Example**: [.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.nextjs](../../.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.nextjs)
- **FastAPI Example**: [.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.fastapi](../../.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.fastapi)
- **Phase-4 README**: [phase-4/README.md](../../phase-4/README.md)
- **Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Plan Status**: ✅ Complete - Ready for task generation (Phase 2 via `/sp.tasks`)
