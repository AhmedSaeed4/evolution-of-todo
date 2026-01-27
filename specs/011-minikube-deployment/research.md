# Research: Minikube Deployment for Phase-4

**Feature**: 011-minikube-deployment
**Date**: 2026-01-25
**Status**: Complete

## Overview

This document captures research findings for deploying the Phase-4 full-stack application (Next.js frontend + FastAPI backend with AI agents) to a local Minikube cluster. All decisions are based on the minikube-deployment skill patterns and existing Phase-4 architecture.

---

## Decision 1: Docker Build Pattern

**Decision**: Use multi-stage Docker builds for both frontend and backend

**Rationale**:
- Reduces final image size by separating build dependencies from runtime
- Follows production best practices
- Enables layer caching for faster rebuilds
- Example: Frontend ~500MB → ~200MB with standalone + multi-stage

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Single-stage build | Simpler Dockerfile | Larger images (2x+), includes build tools | Unnecessary resource consumption |
| Distroless base | Minimal attack surface | Difficult debugging, no shell | Development complexity |
| Alpine for Python | Smaller image | Many wheels require musl, potential compatibility issues | Not worth the compatibility risk |

**Selected Approach**:
- **Frontend**: 3-stage (deps → build → runner) using node:20-alpine
- **Backend**: 2-stage (builder → production) using python:3.13-slim

**References**: `.claude/skills/minikube-deployment/patterns/DOCKERFILE_PATTERNS.md`

---

## Decision 2: Next.js Standalone Output

**Decision**: Add `output: 'standalone'` to `phase-4/frontend/next.config.ts`

**Rationale**:
- Enables minimal production runtime (only necessary files)
- Reduces Docker image from ~500MB to <200MB
- Required for multi-stage Dockerfile pattern
- No functionality loss - all features preserved

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Standard output | No config change | Larger images (~500MB), copies node_modules | Wasted resources |
| Static export | Smallest output | Loses SSR, API routes, image optimization | Breaks Phase-4 features |

**Implementation**:
```typescript
// phase-4/frontend/next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',
};
export default nextConfig;
```

**Validation**: After `npm run build`, verify `.next/standalone` directory exists.

**References**: Next.js documentation, minikube-deployment skill examples

---

## Decision 3: Kubernetes Service Types

**Decision**: Frontend = LoadBalancer, Backend = ClusterIP

**Rationale**:
- **Frontend (LoadBalancer)**: Public-facing, needs external access via minikube tunnel
- **Backend (ClusterIP)**: Internal only, security best practice (not exposed externally)
- Simulates production cloud architecture (Oracle OKE, AWS EKS)
- Frontend reaches backend via Kubernetes internal DNS

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Both LoadBalancer | Simple, both accessible | Unnecessary cost in production ($$$ per service), security risk | Backend should be internal |
| Both NodePort | Simple for Minikube | Not production-like, random ports | Doesn't teach production pattern |
| Ingress for both | Nice URLs | More complex, adds ingress layer | Out of scope for this phase |

**Service Discovery**:
- Frontend → Backend: `http://backend:8000` (Kubernetes internal DNS)
- Backend service name = Helm release name (keep it simple: `helm install backend`)

**References**: `.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md` → "Service Types"

---

## Decision 4: Secret Management Strategy

**Decision**: Use Kubernetes Secrets with `envFrom: secretRef`

**Rationale**:
- Keeps secrets out of git (security best practice)
- Works identically for local Minikube AND production clouds (Oracle/AWS)
- Single source of truth for environment variables
- Easy to update (delete + recreate secret, restart deployment)

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Hardcoded in values.yaml | Simple, no setup | Secrets in git, security risk | Security violation |
| ConfigMap | Easy to update | Not encrypted, visible in plaintext | Not for sensitive data |
| External secrets operator | Production-grade | Overkill for local, adds complexity | Unnecessary complexity |

**Implementation**:
```bash
# Create secret (note: space before kubectl prevents shell history)
kubectl create secret generic phase4-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=BETTER_AUTH_SECRET='...' \
  --from-literal=OPENAI_API_KEY='sk-...' \
  --from-literal=XIAOMI_API_KEY='sk-...'

# Reference in backend/values.yaml
envFrom:
  - secretRef:
      name: phase4-secrets
```

**References**: `.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md` → "Secrets Pattern"

---

## Decision 5: Image Registry Strategy

**Decision**: Build images directly in Minikube's Docker daemon (no registry push)

**Rationale**:
- Eliminates registry setup complexity for local development
- Faster iteration (no push/pull delays)
- Images available immediately to Minikube cluster
- Standard pattern for local Kubernetes development

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| Docker Hub | Industry standard | Slow (push/pull), requires account, public by default | Unnecessary for local |
| Local registry | More production-like | Adds complexity (registry setup, certs), slower | Adds no value for local dev |
| GitHub Container Registry | Free private repos | Push/pull overhead, network latency | Unnecessary for local |

**Critical Workflow**:
```bash
# Step 1: Configure Docker to use Minikube's daemon
eval $(minikube docker-env)

# Step 2: Build images (they go directly to Minikube)
docker build -t phase4-frontend:v1 ./phase-4/frontend
docker build -t phase4-backend:v1 ./phase-4/backend

# Step 3: Deploy with imagePullPolicy: IfNotPresent
helm install backend ./phase-4/helm-charts/backend
helm install frontend ./phase-4/helm-charts/frontend
```

**Common Pitfall**: Skipping `eval $(minikube docker-env)` causes images to be built in Docker Desktop instead of Minikube, resulting in `ImagePullBackOff` errors.

**References**: `.claude/skills/minikube-deployment/patterns/WORKFLOW.md` → "Step 4: Configure Docker"

---

## Decision 6: Health Check Strategy

**Decision**: Use Kubernetes liveness and readiness probes with existing endpoints

**Rationale**:
- Enables self-healing (restart unhealthy pods)
- Graceful pod lifecycle management (no traffic to not-ready pods)
- Production-ready pattern
- Minimal code changes (add frontend health endpoint)

**Implementation**:

**Backend** (already exists in `phase-4/backend/src/backend/main.py:61-67`):
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "ok"}
```

**Frontend** (needs to be created):
```typescript
// phase-4/frontend/src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
```

**Kubernetes Probe Configuration**:
```yaml
livenessProbe:
  httpGet:
    path: /health       # Backend: /health, Frontend: /api/health
    port: http
  initialDelaySeconds: 10
  periodSeconds: 30
readinessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 5
  periodSeconds: 10
```

**Alternatives Considered**:
| Alternative | Pros | Cons | Rejected Because |
|-------------|------|------|------------------|
| TCP probe | Simple, no endpoint needed | Less accurate (port open != app ready) | HTTP probe is more reliable |
| Exec probe | Full control | Requires script/container modifications | Unnecessary complexity |
| No probes | Simplest | No self-healing, ready pods may get traffic | Production risk |

---

## Technology Stack Confirmation

| Component | Technology | Version | Source |
|-----------|------------|---------|--------|
| **Frontend Runtime** | Node.js | 20-alpine | Phase-4 package.json |
| **Frontend Framework** | Next.js | 16.1.1 | Phase-4 package.json |
| **Backend Runtime** | Python | 3.13-slim | Constitution VI requirement |
| **Backend Framework** | FastAPI | 0.128.0 | Phase-4 pyproject.toml |
| **Container Engine** | Docker | builtin | Minikube default |
| **Kubernetes Cluster** | Minikube | latest | Spec requirement |
| **Package Manager (K8s)** | Helm | 3.x | Spec requirement |
| **Database** | Neon PostgreSQL | external | Existing from Phase-4 |

**Compliance Check**:
- ✅ Python 3.13+ (Constitution VI)
- ✅ No unauthorized dependencies
- ✅ Authorized base images (node:20-alpine, python:3.13-slim)

---

## Performance Benchmarks

Based on minikube-deployment skill patterns and typical project sizes:

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| **First Docker build (frontend)** | 4-6 minutes | Downloading npm deps, compiling Next.js |
| **First Docker build (backend)** | 1-2 minutes | Downloading Python deps |
| **Total first build** | 5-8 minutes | Parallel builds possible |
| **Cached rebuild (frontend)** | 1-2 minutes | Docker layer caching |
| **Cached rebuild (backend)** | 30-60 seconds | Docker layer caching |
| **Helm install** | 1-2 minutes | Per service |
| **Pod startup** | 30-60 seconds | From `helm install` to `READY 1/1` |
| **Tunnel IP assignment** | <30 seconds | From `minikube tunnel` start to EXTERNAL-IP |

**Image Size Targets**:
- Frontend: <200MB (with standalone output)
- Backend: <300MB (with python:3.13-slim base)

**Factors Affecting Build Time**:
- CPU speed and available RAM
- Network speed (downloading dependencies)
- .dockerignore quality (excludes unnecessary files)
- Docker layer cache hits

---

## Phase-4 Environment Variables Analysis

**Backend** (`phase-4/backend/.env`):

| Variable | Sensitive | Source | Kubernetes Method |
|----------|-----------|--------|-------------------|
| `DATABASE_URL` | Yes | Secret | `--from-literal` |
| `BETTER_AUTH_SECRET` | Yes | Secret | `--from-literal` |
| `CORS_ORIGINS` | No | values.yaml | `env:` direct |
| `API_HOST` | No | values.yaml | `env:` direct |
| `API_PORT` | No | values.yaml | `env:` direct |
| `BETTER_AUTH_URL` | No | values.yaml | `env:` direct |
| `DEBUG` | No | values.yaml | `env:` direct |
| `ENVIRONMENT` | No | values.yaml | `env:` direct |
| `OPENAI_API_KEY` | Yes | Secret | `--from-literal` |
| `XIAOMI_API_KEY` | Yes | Secret | `--from-literal` |

**Frontend** (`phase-4/frontend/.env.local`):

| Variable | Sensitive | Source | Kubernetes Method |
|----------|-----------|--------|-------------------|
| `NEXT_PUBLIC_AUTH_BYPASS` | No | values.yaml | `env:` direct |
| `DATABASE_URL` | Yes | Secret | `--from-literal` (if needed) |
| `BETTER_AUTH_SECRET` | Yes | Secret | `--from-literal` (if needed) |
| `NEXT_PUBLIC_AUTH_URL` | No | values.yaml | `env:` direct |
| `NEXT_PUBLIC_BACKEND_URL` | No | values.yaml | `env:` direct |
| `OPENAI_API_KEY` | Yes | Secret | `--from-literal` (if needed) |
| `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` | No | values.yaml | `env:` direct |

**Note**: Frontend may not need all secrets if it only communicates with backend. This will be validated during implementation.

---

## Known Edge Cases

From spec.md edge cases, with mitigation strategies:

| Edge Case | Mitigation |
|-----------|------------|
| Minikube Docker daemon not configured | Document `eval $(minikube docker-env)` as critical step |
| `ImagePullBackOff` errors | Verify images exist in Minikube's Docker (`docker images`) |
| `minikube tunnel` stopped | Document that EXTERNAL-IP returns to `<pending>` |
| Next.js standalone not configured | Add to next.config.ts as Step 1 |
| Neon DB connection failures | Verify DATABASE_URL has `?sslmode=require` |
| Helm release name changes | Document DNS naming convention explicitly |
| First build timeout | Document expected 5-8 minute build time |
| Missing .dockerignore | Create alongside Dockerfiles |

---

## Open Questions (Resolutions)

All questions from initial analysis have been resolved:

1. **Q**: Should we use Ingress for domain-based routing?
   **A**: No - Out of scope per spec.md. Using LoadBalancer + tunnel only.

2. **Q**: Should we push images to external registry?
   **A**: No - Build directly in Minikube's Docker daemon.

3. **Q**: What Node.js version for frontend?
   **A**: node:20-alpine (matches existing Phase-4 runtime).

4. **Q**: What Python version for backend?
   **A**: python:3.13-slim (Constitution VI requirement).

5. **Q**: Should backend be accessible externally?
   **A**: No - ClusterIP only, internal-only for security.

6. **Q**: How to handle CORS in Kubernetes?
   **A**: Update `CORS_ORIGINS` in backend values.yaml to include Minikube EXTERNAL-IP.

---

## References

- **Minikube Deployment Skill**: `.claude/skills/minikube-deployment/SKILL.md`
- **Workflow Pattern**: `.claude/skills/minikube-deployment/patterns/WORKFLOW.md`
- **Dockerfile Patterns**: `.claude/skills/minikube-deployment/patterns/DOCKERFILE_PATTERNS.md`
- **Helm Patterns**: `.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md`
- **Next.js Example**: `.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.nextjs`
- **FastAPI Example**: `.claude/skills/minikube-deployment/examples/nextjs-fastapi/Dockerfile.fastapi`
- **Phase-4 README**: `phase-4/README.md`
- **Feature Spec**: `specs/011-minikube-deployment/spec.md`

---

**Research Status**: ✅ Complete - All unknowns resolved, ready for Phase 1 design
