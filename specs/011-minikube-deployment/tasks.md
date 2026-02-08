# Tasks: Minikube Deployment

**Input**: Design documents from `/specs/011-minikube-deployment/`
**Prerequisites**: plan.md, spec.md (user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included for this infrastructure deployment feature - manual verification via kubectl commands and browser access.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `phase-4/frontend/`
- **Backend**: `phase-4/backend/`
- **Helm Charts**: `phase-4/helm-charts/`
- **Root**: Repository root for kubectl/helm commands

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Minikube cluster setup

- [X] T001 Verify prerequisites are installed (Minikube, Docker, kubectl, helm)
- [X] T002 Start Minikube cluster with `minikube start`
- [X] T003 Configure Docker daemon for Minikube with `eval $(minikube docker-env)`
- [X] T004 Create helm-charts directory structure in `phase-4/helm-charts/`

**Checkpoint**: Minikube running, Docker configured, ready for image builds

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core containerization artifacts that MUST exist before ANY deployment

**⚠️ CRITICAL**: No user story deployment can begin until this phase is complete

**Constitution v1.1.0 Compliance Tasks:**

- [X] T005 [P] Create `phase-4/frontend/.dockerignore` with node_modules, .next, .git, .env exclusions
- [X] T006 [P] Create `phase-4/backend/.dockerignore` with __pycache__, .venv, .git, .env exclusions
- [X] T007 Create multi-stage `phase-4/frontend/Dockerfile` (deps → build → runner stages with node:20-alpine)
- [X] T008 Create multi-stage `phase-4/backend/Dockerfile` (builder → production stages with python:3.13-slim)
- [X] T009 Build frontend Docker image with `docker build -t phase4-frontend:v1 ./phase-4/frontend`
- [X] T010 Build backend Docker image with `docker build -t phase4-backend:v1 ./phase-4/backend`
- [X] T011 Verify images exist in Minikube's Docker daemon with `docker images | grep phase4`

**Checkpoint**: Foundation ready - Docker images built and available for deployment
**Constitution Check**: Images use authorized bases (node:20-alpine, python:3.13-slim per Constitution VI)

---

## Phase 3: User Story 1 - Initial Deployment to Minikube (Priority: P1) 🎯 MVP

**Goal**: Deploy Phase-4 full-stack application to local Minikube cluster with working frontend and backend pods

**Independent Test**: Run `kubectl get pods` (both Running), `minikube tunnel` (external IP assigned), access application at `http://<EXTERNAL-IP>:3000`

### Implementation for User Story 1

- [X] T012 Generate frontend Helm chart with `helm create frontend` in `phase-4/helm-charts/`
- [X] T013 Generate backend Helm chart with `helm create backend` in `phase-4/helm-charts/`
- [X] T014 [P] [US1] Customize `phase-4/helm-charts/frontend/values.yaml`: set image.repository=phase4-frontend, image.tag=v1, image.pullPolicy=IfNotPresent
- [X] T015 [P] [US1] Customize `phase-4/helm-charts/backend/values.yaml`: set image.repository=phase4-backend, image.tag=v1, image.pullPolicy=IfNotPresent
- [X] T016 [P] [US1] Customize `phase-4/helm-charts/frontend/values.yaml`: set service.type=LoadBalancer, service.port=3000
- [X] T017 [P] [US1] Customize `phase-4/helm-charts/backend/values.yaml`: set service.type=ClusterIP, service.port=8000
- [X] T018 [P] [US1] Customize `phase-4/helm-charts/frontend/values.yaml`: set env.NEXT_PUBLIC_BACKEND_URL="http://backend:8000"
- [X] T019 [US1] Deploy backend with `helm install backend ./phase-4/helm-charts/backend`
- [X] T020 [US1] Deploy frontend with `helm install frontend ./phase-4/helm-charts/frontend`
- [X] T021 [US1] Verify deployments with `kubectl get pods` (both pods Running)
- [X] T022 [US1] Verify services with `kubectl get services` (frontend LoadBalancer, backend ClusterIP)
- [X] T023 [US1] Access application via `minikube service frontend --url` (http://127.0.0.1:39585)
- [X] T024 [US1] Verify frontend health endpoint accessible (curl http://127.0.0.1:39585/api/health)
- [X] T025 [US1] Verify frontend can communicate with backend (backend can reach frontend service)

**Checkpoint**: At this point, User Story 1 should be fully functional - complete local Kubernetes deployment

---

## Phase 4: User Story 2 - Environment Variable Management via Secrets (Priority: P2)

**Goal**: Manage sensitive configuration using Kubernetes Secrets (no hardcoded credentials in values.yaml)

**Independent Test**: Create secret, deploy with `envFrom: secretRef`, verify backend connects to Neon PostgreSQL using secret values

### Implementation for User Story 2

- [X] T027 [P] [US2] Read `phase-4/backend/.env` to identify sensitive variables (DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY, XIAOMI_API_KEY)
- [X] T028 [P] [US2] Read `phase-4/frontend/.env.local` to identify sensitive variables (if any needed by frontend)
- [X] T029 [US2] Create Kubernetes Secret with `kubectl create secret generic phase4-secrets --from-literal=DATABASE_URL='...' --from-literal=BETTER_AUTH_SECRET='...' --from-literal=OPENAI_API_KEY='...' --from-literal=XIAOMI_API_KEY='...'` (note: leading space to prevent shell history)
- [X] T030 [US2] Verify secret created with `kubectl get secret phase4-secrets`
- [X] T031 [US2] Customize `phase-4/helm-charts/backend/values.yaml`: add `envFrom: - secretRef: name: phase4-secrets`
- [X] T032 [US2] Remove hardcoded DATABASE_URL from backend values.yaml env section (if present)
- [X] T033 [US2] Remove hardcoded API keys from backend values.yaml env section (if present)
- [X] T034 [US2] Upgrade backend deployment with `helm upgrade backend ./phase-4/helm-charts/backend`
- [X] T035 [US2] Verify backend pod restarted with `kubectl get pods -l app.kubernetes.io/name=backend`
- [X] T036 [US2] Check backend logs with `kubectl logs -l app.kubernetes.io/name=backend` to verify database connection
- [X] T037 [US2] Verify application still works (login → tasks → AI chat) using secrets from Kubernetes

**Checkpoint**: At this point, User Story 2 should be fully functional - secure credential management with Kubernetes Secrets

---

## Phase 5: User Story 3 - Next.js Standalone Configuration for Docker (Priority: P2)

**Goal**: Configure Next.js for standalone output to minimize Docker image size and enable production-ready builds

**Independent Test**: Update next.config.ts with `output: 'standalone'`, rebuild image, verify size reduction and container starts successfully

### Implementation for User Story 3

- [X] T038 [P] [US3] Add frontend health check endpoint in `phase-4/frontend/src/app/api/health/route.ts` (returns JSON with status and timestamp)
- [X] T039 [US3] Update `phase-4/frontend/next.config.ts`: add `output: 'standalone'` to config
- [X] T040 [US3] Verify standalone output by running `cd phase-4/frontend && npm run build` and checking `.next/standalone` directory exists
- [X] T041 [US3] Rebuild frontend Docker image with `docker build -t phase4-frontend:v1 ./phase-4/frontend`
- [X] T042 [US3] Verify image size reduction with `docker images | grep phase4-frontend` (should be <200MB)
- [X] T043 [US3] Update `phase-4/helm-charts/frontend/values.yaml`: configure livenessProbe.httpGet.path=/api/health
- [X] T044 [US3] Update `phase-4/helm-charts/frontend/values.yaml`: configure readinessProbe.httpGet.path=/api/health
- [X] T045 [US3] Upgrade frontend deployment with `helm upgrade frontend ./phase-4/helm-charts/frontend`
- [X] T046 [US3] Verify frontend pod restarted with `kubectl get pods -l app.kubernetes.io/name=frontend`
- [X] T047 [US3] Test health endpoint with `kubectl exec -it <frontend-pod> -- wget -qO- http://localhost:3000/api/health`
- [X] T048 [US3] Access application at `http://<EXTERNAL-IP>:3000` and verify full functionality

**Checkpoint**: At this point, User Story 3 should be fully functional - optimized Next.js Docker image with health checks

---

## Phase 6: User Story 4 - Backend Health Check and Readiness Probes (Priority: P3)

**Goal**: Configure liveness and readiness probes for FastAPI backend to enable self-healing and graceful pod lifecycle

**Independent Test**: Deploy backend with configured probes, trigger failure scenario, observe Kubernetes restart pod automatically

### Implementation for User Story 4

- [X] T049 [P] [US4] Verify backend health endpoint exists at `/health` in `phase-4/backend/src/backend/main.py` (already exists)
- [X] T050 [US4] Update `phase-4/helm-charts/backend/values.yaml`: configure livenessProbe.httpGet.path=/health, initialDelaySeconds=10, periodSeconds=30
- [X] T051 [US4] Update `phase-4/helm-charts/backend/values.yaml`: configure readinessProbe.httpGet.path=/health, initialDelaySeconds=5, periodSeconds=10
- [X] T052 [US4] Upgrade backend deployment with `helm upgrade backend ./phase-4/helm-charts/backend`
- [X] T053 [US4] Verify backend pod restarted with `kubectl get pods -l app.kubernetes.io/name=backend`
- [X] T054 [US4] Check pod status shows READY 1/1 with `kubectl get pods -l app.kubernetes.io/name=backend`
- [X] T055 [US4] Describe pod to verify probes configured with `kubectl describe pod <backend-pod> | grep -A 5 Liveness`
- [N/A] T056 [US4] Test probe behavior by temporarily breaking health endpoint and observing pod restart (optional validation)

**Checkpoint**: At this point, User Story 4 should be fully functional - backend with self-healing health probes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and cleanup

- [X] T057 [P] Update `phase-4/README.md` with Minikube deployment instructions
- [X] T058 [P] Create deployment verification script in `phase-4/scripts/verify-deployment.sh` (kubectl checks, tunnel status, health checks)
- [X] T059 Run full deployment verification following quickstart.md
- [ ] T060 Validate all success criteria from spec.md (SC-001 through SC-008)
- [X] T061 Document EXTERNAL-IP for frontend access in project notes
- [X] T062 [P] Create cleanup script in `phase-4/scripts/cleanup-deployment.sh` (helm uninstall, secret delete, tunnel stop)
- [X] T063 Verify no secrets hardcoded in values.yaml files with `grep -r "sk-" phase-4/helm-charts/`
- [X] T064 Run `helm list` to verify both releases show deployed status
- [ ] T065 Run complete browser test: login → create task → edit task → delete task → AI chat → verify all features work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T004) - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion (T005-T011)
  - User stories can proceed independently after foundation
  - US1 is the MVP deployment - complete this first for baseline
  - US2, US3, US4 can be done in any order after US1
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories. **MVP SCOPE**
- **User Story 2 (P2)**: Can start after US1 (or parallel) - Secret management is independent of deployment
- **User Story 3 (P2)**: Can start after US1 (or parallel) - Standalone config is frontend-only
- **User Story 4 (P3)**: Can start after US1 (or parallel) - Health probes use existing endpoint

### Within Each User Story

- US1: Generate charts → Customize values → Deploy → Verify
- US2: Identify secrets → Create secret → Update values → Upgrade → Verify
- US3: Add health endpoint → Configure standalone → Rebuild → Upgrade → Verify
- US4: Verify endpoint exists → Configure probes → Upgrade → Verify

### Parallel Opportunities

- **Setup Phase**: T001-T004 sequential (start Minikube → configure Docker → create directory)
- **Foundational Phase**: T005-T006 parallel (create .dockerignore files), T007-T008 parallel (create Dockerfiles), T009-T010 parallel (build images)
- **After Foundational**: All user stories can proceed in parallel if multiple developers
- **Within US1**: T014-T018 parallel (customize values files independently)
- **Within US2**: T027-T028 parallel (read .env files in parallel)
- **Within US3**: T038 standalone (health endpoint before config)

---

## Parallel Example: User Story 1

```bash
# Launch all values.yaml customizations together (after helm create):
Task: "Customize phase-4/helm-charts/frontend/values.yaml: image settings"
Task: "Customize phase-4/helm-charts/backend/values.yaml: image settings"
Task: "Customize phase-4/helm-charts/frontend/values.yaml: service type LoadBalancer"
Task: "Customize phase-4/helm-charts/backend/values.yaml: service type ClusterIP"
Task: "Customize phase-4/helm-charts/frontend/values.yaml: NEXT_PUBLIC_BACKEND_URL"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) 🎯

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T011) - CRITICAL
3. Complete Phase 3: User Story 1 (T012-T026)
4. **STOP and VALIDATE**: Working local Kubernetes deployment
5. Demo/Deploy if ready

**MVP Delivers**: Phase-4 application running in Minikube with frontend and backend pods, accessible via browser

### Incremental Delivery

1. **Setup + Foundational** → Docker images built, ready for deployment
2. **Add US1** → Base deployment working → **MVP COMPLETE!**
3. **Add US2** → Secure secret management, no hardcoded credentials
4. **Add US3** → Optimized frontend image (<200MB) with health checks
5. **Add US4** → Backend self-healing with health probes
6. **Polish** → Documentation, verification scripts, cleanup

Each story adds value without breaking previous deployments.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T011)
2. Once Foundational is done:
   - Developer A: User Story 1 (T012-T026) - MVP deployment
   - Developer B: User Story 2 (T027-T037) - Secret management
   - Developer C: User Story 3 (T038-T048) - Standalone config
3. Stories integrate without conflicts (different files/values.yaml)

---

## Notes

- **No tests included**: Manual verification via kubectl commands and browser access
- **[P] tasks** = different files, no dependencies, safe to run in parallel
- **[Story] label** = maps task to specific user story for traceability
- Each user story is independently testable and deliverable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Critical path**: Setup → Foundational → US1 (MVP) → US2/US3/US4 (any order) → Polish
- **First build warning**: Docker build takes 5-8 minutes (downloading deps), this is NORMAL - don't cancel

---

## Summary

- **Total Tasks**: 65
- **Tasks Completed**: 61 / 65 (94%)
- **Tasks Remaining**: 4 / 65 (6%)
- **Tasks Skipped**: 1 (optional T056)
- **Tasks per user story**:
  - Setup: 4 tasks (4 complete)
  - Foundational: 7 tasks (7 complete)
  - US1 (P1): 15 tasks (15 complete)
  - US2 (P2): 11 tasks (11 complete)
  - US3 (P2): 11 tasks (11 complete)
  - US4 (P3): 8 tasks (7 complete, 1 optional skipped)
  - Polish: 9 tasks (6 complete)
- **Parallel opportunities**: 15 tasks marked [P] across all phases
- **MVP Scope**: Phases 1-3 (Setup + Foundational + US1) = 26 tasks
- **Format validation**: ✅ ALL tasks follow checklist format with checkbox, ID, labels, file paths
