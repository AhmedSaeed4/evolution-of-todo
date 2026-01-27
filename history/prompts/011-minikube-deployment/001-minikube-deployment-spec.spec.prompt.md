---
id: 001
title: minikube-deployment-spec
stage: spec
date: 2026-01-25
surface: agent
model: claude-opus-4-5-20251101
feature: 011-minikube-deployment
branch: 011-minikube-deployment
user: developer
command: /sp.specify
labels: ["specification","minikube","kubernetes","deployment","docker","helm"]
links:
  spec: specs/011-minikube-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/011-minikube-deployment/spec.md (created)
  - specs/011-minikube-deployment/checklists/requirements.md (created)
tests:
  - Specification quality validation (PASS)
---

## Prompt

name the new branch "011-minikube-deployment" and here are my specs :

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial Deployment to Minikube (Priority: P1)

As a developer, I want to deploy the Phase-4 full-stack application (Next.js frontend + FastAPI backend) to a local Minikube cluster so that I can test the application in a Kubernetes environment that simulates production.

**Why this priority**: This is the foundational deployment capability. Without this, no other Minikube features can be tested. This delivers a production-like local environment.

**Independent Test**: Can be fully tested by deploying both frontend and backend pods, verifying they are running with `kubectl get pods`, and accessing the application via `minikube tunnel` at the external IP. Delivers a working local Kubernetes deployment.

**Acceptance Scenarios**:

1. **Given** Minikube is installed and running, **When** I run `eval $(minikube docker-env)` and build Docker images, **Then** images are built in Minikube's Docker daemon (not Docker Desktop)
2. **Given** Docker images are built in Minikube, **When** I deploy with Helm charts, **Then** pods start successfully and show `Running` status
3. **Given** pods are running, **When** I run `minikube tunnel` in a separate terminal, **Then** frontend LoadBalancer gets an external IP
4. **Given** external IP is assigned, **When** I access the application at `http://<EXTERNAL-IP>:3000`, **Then** the frontend loads and can communicate with backend

---

### User Story 2 - Environment Variable Management via Secrets (Priority: P2)

As a developer, I want to manage sensitive configuration (DATABASE_URL, API keys, JWT secrets) using Kubernetes Secrets so that credentials are never hardcoded in Helm values.yaml or committed to git.

**Why this priority**: Security best practice that prevents credentials from leaking into version control. This delivers a production-ready secret management pattern.

**Independent Test**: Can be fully tested by creating a Kubernetes Secret, deploying with `envFrom: secretRef`, and verifying the application connects to Neon PostgreSQL using the secret values. Delivers secure credential management.

**Acceptance Scenarios**:

1. **Given** Minikube is running, **When** I create a secret with ` kubectl create secret generic`, **Then** the secret is stored in Kubernetes (not in shell history due to leading space)
2. **Given** secret is created, **When** I reference it in backend values.yaml with `envFrom: - secretRef`, **Then** the backend pod has access to all environment variables from the secret
3. **Given** backend is deployed with secrets, **When** I check backend logs, **Then** backend successfully connects to Neon PostgreSQL using DATABASE_URL from the secret
4. **Given** secret needs updating, **When** I delete and recreate the secret, then restart the deployment, **Then** the new secret values are loaded by the pod

---

### User Story 3 - Next.js Standalone Configuration for Docker (Priority: P2)

As a developer, I want to configure Next.js for standalone output so that the Docker image is minimal and production-ready, following the multi-stage build pattern from the minikube-deployment skill.

**Why this priority**: Without standalone output, the Next.js Docker image would be significantly larger and slower to build. This delivers an optimized container image.

**Independent Test**: Can be fully tested by updating `next.config.ts` with `output: 'standalone'`, rebuilding the Docker image, and verifying the image size is reduced and the container starts successfully. Delivers an optimized production-ready Docker image.

**Acceptance Scenarios**:

1. **Given** Phase-4 frontend exists, **When** I add `output: 'standalone'` to next.config.ts, **Then** `npm run build` generates a `.next/standalone` directory
2. **Given** standalone output is configured, **When** I build the Dockerfile with multi-stage build, **Then** the final runner stage only copies necessary files (standalone, static, public)
3. **Given** Docker image is built, **When** I run the container, **Then** Next.js starts with `node server.js` and serves the application
4. **Given** container is running, **When** I access the health endpoint at `/api/health`, **Then** it returns 200 OK

---

### User Story 4 - Backend Health Check and Readiness Probes (Priority: P3)

As a developer, I want to configure liveness and readiness probes for the FastAPI backend so that Kubernetes can automatically restart unhealthy pods and only route traffic to ready pods.

**Why this priority**: This is a production reliability pattern that ensures self-healing and graceful pod lifecycle management. Delivers robust deployment health monitoring.

**Independent Test**: Can be fully tested by deploying backend with configured probes, triggering a failure (e.g., breaking database connection), and observing Kubernetes restart the pod automatically. Delivers self-healing capability.

**Acceptance Scenarios**:

1. **Given** backend is deployed, **When** I check pod status with `kubectl get pods`, **Then** pod shows `READY 1/1` and `STATUS Running`
2. **Given** backend health check is configured at `/health`, **When** the liveness probe runs, **Then** it returns 200 OK and the pod remains running
3. **Given** backend becomes unhealthy (e.g., database down), **When** the liveness probe fails, **Then** Kubernetes automatically restarts the pod
4. **Given** backend is starting up, **When** the readiness probe runs, **Then** traffic is only routed to the pod after it returns 200 OK

---

### Edge Cases

- What happens when Minikube Docker daemon is not configured (`eval $(minikube docker-env)` is skipped)?
- How does system handle `ImagePullBackOff` errors when images are built in Docker Desktop instead of Minikube?
- What happens when `minikube tunnel` is stopped while accessing the application?
- How does system handle secret updates while pods are running?
- What happens when Next.js standalone output is not configured but Dockerfile expects it?
- How does system handle Neon PostgreSQL connection failures during pod startup?
- What happens when Helm release name is changed (affects internal DNS for backend service)?
- How does system handle port conflicts (3000, 8000) with existing services in Minikube?
- What happens when `.dockerignore` files are missing (causes slow builds and potential security issues)?
- How does system handle first build timeout (5-8 minutes for dependencies download)?

## Requirements *(mandatory)*

**Constitution Alignment**: All requirements MUST comply with Evolution of Todo Constitution v1.1.0

### Functional Requirements

- **FR-001**: System MUST build Docker images directly in Minikube's Docker daemon using `eval $(minikube docker-env)`
- **FR-002**: System MUST create multi-stage Dockerfiles for both frontend (Next.js) and backend (FastAPI)
- **FR-003**: System MUST configure Next.js for standalone output in `next.config.ts` (add `output: 'standalone'`)
- **FR-004**: System MUST create `.dockerignore` files for both frontend and backend to exclude unnecessary files
- **FR-005**: System MUST create Helm charts in `phase-4/helm-charts/` directory using `helm create` for both frontend and backend
- **FR-006**: System MUST configure frontend service as LoadBalancer (external access via tunnel)
- **FR-007**: System MUST configure backend service as ClusterIP (internal only)
- **FR-008**: System MUST create Kubernetes Secrets for sensitive environment variables (DATABASE_URL, API keys, JWT secrets)
- **FR-009**: System MUST reference secrets in backend values.yaml using `envFrom: - secretRef`
- **FR-010**: System MUST configure frontend `API_URL` environment variable to point to backend service name (e.g., `http://backend:8000`)
- **FR-011**: System MUST set `imagePullPolicy: IfNotPresent` for local Minikube builds (not `Always`)
- **FR-012**: System MUST configure health checks (liveness and readiness probes) for both frontend and backend
- **FR-013**: System MUST use `minikube tunnel` to expose the frontend LoadBalancer service
- **FR-014**: System MUST verify deployment success with `kubectl get pods`, `kubectl get services`, and `helm list`

### Architecture Requirements

- **AR-001**: System MUST follow multi-stage Dockerfile pattern (deps → build → runner for Next.js, builder → production for FastAPI)
- **AR-002**: System MUST use non-root users in Docker containers (security best practice)
- **AR-003**: System MUST maintain separation of concerns: frontend uses LoadBalancer, backend uses ClusterIP
- **AR-004**: System MUST enforce Kubernetes DNS naming convention (Helm release name = service DNS name)
- **AR-005**: System MUST use only authorized technology stack (Python 3.13+, Node.js 20-alpine, per Constitution VI)
- **AR-006**: System MUST ensure frontend can reach backend via internal Kubernetes DNS (not external IP)
- **AR-007**: System MUST support same Helm chart patterns for local Minikube and production clouds (AWS, Oracle, etc.)

### Key Entities

- **Docker Image**: Container image built from Dockerfile, includes application code and dependencies
- **Helm Chart**: Kubernetes package manager template, defines deployment, service, ingress, configmap, secret resources
- **Kubernetes Secret**: Encrypted storage for sensitive data (DATABASE_URL, API keys, JWT secrets)
- **Service**: Kubernetes network abstraction, enables pod-to-pod communication (ClusterIP for internal, LoadBalancer for external)
- **Pod**: Smallest deployable Kubernetes unit, contains one or more containers
- **Deployment**: Kubernetes resource for managing pod replicas and updates
- **Ingress (Optional)**: Kubernetes API object for HTTP/HTTPS routing (not included in this spec - tunnel-only approach)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer can complete full deployment (build images + deploy with Helm) in under 15 minutes
- **SC-002**: All pods show `READY 1/1` and `STATUS Running` within 3 minutes of `helm install` command
- **SC-003**: Frontend LoadBalancer service receives an external IP within 30 seconds of starting `minikube tunnel`
- **SC-004**: Application is fully accessible at `http://<EXTERNAL-IP>:3000` with working backend communication
- **SC-005**: Zero secrets are hardcoded in values.yaml or committed to git
- **SC-006**: Docker images follow multi-stage build pattern with non-root users
- **SC-007**: Health checks pass for both frontend (/) and backend (/health) endpoints
- **SC-008**: Helm charts can be reused for production deployment (Oracle/AWS) with only image registry and domain changes

### Technical Validation

- **TV-001**: `docker images` shows images in Minikube's Docker daemon (not Docker Desktop)
- **TV-002**: `kubectl get pods` shows both frontend and backend pods in `Running` state
- **TV-003**: `kubectl get services` shows frontend as `LoadBalancer` and backend as `ClusterIP`
- **TV-004**: `kubectl get secrets` shows application secrets are created
- **TV-005**: `helm list` shows both releases as `deployed` status
- **TV-006**: `minikube tunnel` output shows active route to LoadBalancer services
- **TV-007**: Browser can access frontend at external IP and perform full user journey (login → create task → AI chat)
- **TV-008**: Backend logs show successful database connection using Neon PostgreSQL

### Performance Benchmarks

- **PB-001**: First Docker build (frontend + backend) completes in under 10 minutes (downloading dependencies + compiling)
- **PB-002**: Cached Docker rebuild completes in under 3 minutes (Docker layer caching)
- **PB-003**: Helm install completes in under 2 minutes per service
- **PB-004**: Pod startup time (from `helm install` to `READY 1/1`) is under 60 seconds
- **PB-005**: Frontend Docker image size is under 200MB (with standalone output)
- **PB-006**: Backend Docker image size is under 300MB (with Python slim base)

---

## Out of Scope

The following are explicitly excluded from this specification:

- **Ingress setup**: Domain-based routing (todo.local) is not included - using LoadBalancer with tunnel only
- **Production deployment**: Oracle/AWS/GKE deployment patterns are referenced but not implemented
- **TLS/HTTPS**: SSL certificates for local deployment are not configured
- **Monitoring**: Prometheus, Grafana, or other observability tools are not included
- **Auto-scaling**: Horizontal Pod Autoscaler (HPA) is not configured
- **CI/CD**: GitHub Actions or other automation pipelines are not included
- **Image registry**: No external registry (Docker Hub, ECR, etc.) - local Minikube builds only
- **kubectl-ai integration**: AI-powered Kubernetes operations are not included in this phase
- **kagent integration**: AI agent for Kubernetes operations is not included in this phase

---

## Dependencies

### External Dependencies

- **Minikube**: Local Kubernetes cluster (must be installed)
- **Docker**: Container engine (must be installed)
- **kubectl**: Kubernetes command-line tool (must be installed)
- **helm**: Helm package manager (must be installed)
- **Neon PostgreSQL**: Cloud database (existing from Phase-4)
- **Xiaomi API Key**: For AI chatbot functionality (existing from Phase-4)
- **OpenAI API Key**: For ChatKit session management (existing from Phase-4)

### Phase-4 Artifacts (Existing)

- `phase-4/frontend/`: Next.js 16.1.1 application with ChatKit
- `phase-4/backend/`: FastAPI backend with AI agents and MCP tools
- `phase-4/frontend/package.json`: Frontend dependencies
- `phase-4/backend/pyproject.toml`: Backend Python dependencies
- `phase-4/frontend/.env.local`: Frontend environment variables (reference only, use secrets)
- `phase-4/backend/.env`: Backend environment variables (reference only, use secrets)

### Phase-4 Artifacts (To Be Created)

- `phase-4/frontend/Dockerfile`: Multi-stage Dockerfile for Next.js
- `phase-4/frontend/.dockerignore`: Docker build exclusions for frontend
- `phase-4/frontend/next.config.ts`: Updated with `output: 'standalone'`
- `phase-4/backend/Dockerfile`: Multi-stage Dockerfile for FastAPI
- `phase-4/backend/.dockerignore`: Docker build exclusions for backend
- `phase-4/helm-charts/frontend/`: Helm chart for Next.js frontend
- `phase-4/helm-charts/backend/`: Helm chart for FastAPI backend

---

## Implementation Order

1. **Configure Next.js for standalone output** (Update `phase-4/frontend/next.config.ts`)
2. **Create .dockerignore files** (`phase-4/frontend/.dockerignore` and `phase-4/backend/.dockerignore`)
3. **Create Dockerfiles** (`phase-4/frontend/Dockerfile` and `phase-4/backend/Dockerfile`)
4. **Start Minikube and configure Docker daemon** (`minikube start` && `eval $(minikube docker-env)`)
5. **Build Docker images in Minikube** (from project root: `docker build -t phase4-frontend:v1 ./phase-4/frontend` && `docker build -t phase4-backend:v1 ./phase-4/backend`)
6. **Create Kubernetes Secrets** (DATABASE_URL, API keys, JWT secret)
7. **Generate Helm charts** (create `phase-4/helm-charts/` directory, run `helm create frontend` and `helm create backend`)
8. **Customize Helm values.yaml** (image, ports, env, secrets)
9. **Deploy to Minikube** (`helm install backend phase-4/helm-charts/backend` && `helm install frontend phase-4/helm-charts/frontend`)
10. **Start minikube tunnel** (expose LoadBalancer)
11. **Verify deployment** (pods, services, application access)

---

## Related Documentation

- **Minikube Deployment Skill**: [`.claude/skills/minikube-deployment/SKILL.md`](.claude/skills/minikube-deployment/SKILL.md)
- **Workflow Pattern**: [`.claude/skills/minikube-deployment/patterns/WORKFLOW.md`](.claude/skills/minikube-deployment/patterns/WORKFLOW.md)
- **Dockerfile Patterns**: [`.claude/skills/minikube-deployment/patterns/DOCKERFILE_PATTERNS.md`](.claude/skills/minikube-deployment/patterns/DOCKERFILE_PATTERNS.md)
- **Helm Patterns**: [`.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md`](.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md)
- **Next.js Example**: [`.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.nextjs`](.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.nextjs)
- **FastAPI Example**: [`.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.fastapi`](.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.fastapi)
- **Phase-4 README**: [`phase-4/README.md`](phase-4/README.md)

---

**Status**: Draft - Ready for review and implementation

## Response snapshot

Created feature specification for Minikube deployment with:
- Branch: `011-minikube-deployment` created and checked out
- Spec file: `specs/011-minikube-deployment/spec.md` written with comprehensive user stories, requirements, success criteria
- 4 prioritized user stories (P1: Initial Deployment, P2: Secrets Management, P2: Next.js Standalone, P3: Health Checks)
- 14 functional requirements, 7 architecture requirements
- 8 measurable outcomes, 8 technical validations, 6 performance benchmarks
- 10 edge cases identified
- All mandatory sections completed
- Quality checklist created and validated (ALL PASSED)
- Constitution v1.1.0 alignment verified

## Outcome

- ✅ Impact: Feature specification created for Minikube deployment capability, enabling local Kubernetes testing of Phase-4 full-stack application
- 🧪 Tests: Specification quality validation PASSED (all 15 criteria)
- 📁 Files: spec.md, checklists/requirements.md created
- 🔁 Next prompts: `/sp.plan` to create architectural plan, or `/sp.clarify` if needed
- 🧠 Reflection: User provided comprehensive specification with clear user stories, requirements, and acceptance criteria. No clarification needed. Ready for planning phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Specification quality validation PASSED
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to `/sp.plan` for architectural planning
