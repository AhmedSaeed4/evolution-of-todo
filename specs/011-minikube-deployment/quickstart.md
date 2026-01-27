# Quickstart: Minikube Deployment

**Feature**: 011-minikube-deployment
**Prerequisites**: Minikube, Docker, kubectl, helm installed
**Estimated Time**: 15-20 minutes (first run), 5-10 minutes (cached builds)

## Overview

Deploy the Phase-4 full-stack application (Next.js + FastAPI) to a local Minikube cluster with Docker containers and Helm charts.

---

## Prerequisites Checklist

Before starting, verify you have the following installed:

```bash
# Check Minikube
minikube version
# Expected: minikube version: v1.x.x

# Check Docker
docker --version
# Expected: Docker version 24.x.x

# Check kubectl
kubectl version --client
# Expected: Client Version: v1.x.x

# Check Helm
helm version
# Expected: version.BuildInfo{...v3.x.x...}
```

**Installation Links** (if missing):
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/)

---

## Step-by-Step Deployment

### Step 1: Start Minikube

```bash
minikube start
```

**Expected output**:
```
😄  minikube v1.x.x on Ubuntu 22.04
✨  Automatically selected the docker driver
📌  Using Docker driver
🔥  Creating docker container ...
🐳  Preparing Kubernetes v1.x.x on Docker 24.x.x
🚀  Launching Kubernetes ...
🏄  Done! kubectl is now configured to use "minikube" cluster
```

**Verify**:
```bash
minikube status
# Expected: All shows "Running" or "Configured"
```

---

### Step 2: Configure Docker (CRITICAL!)

```bash
eval $(minikube docker-env)
```

**What this does**: Configures your Docker CLI to build images directly in Minikube's Docker daemon instead of Docker Desktop.

**Verify**:
```bash
docker ps
# Should show Minikube containers (not Docker Desktop)
```

**⚠️ IMPORTANT**: You MUST run this command before building images. If you skip this, you'll get `ImagePullBackOff` errors.

---

### Step 3: Create .dockerignore Files

**Frontend** (`phase-4/frontend/.dockerignore`):
```dockerignore
node_modules
.next
npm-debug.log
.env
.env.local
.git
.vscode
.DS_Store
*.log
```

**Backend** (`phase-4/backend/.dockerignore`):
```dockerignore
__pycache__
*.pyc
.venv
venv
.env
.git
.vscode
.DS_Store
.pytest_cache
*.log
```

---

### Step 4: Configure Next.js for Standalone

**File**: `phase-4/frontend/next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',  // ADD THIS LINE
};

export default nextConfig;
```

---

### Step 5: Create Dockerfiles

**Frontend** (`phase-4/frontend/Dockerfile`):
```dockerfile
# Dependencies Stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
RUN apk add --no-cache wget
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
WORKDIR /app
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
```

**Backend** (`phase-4/backend/Dockerfile`):
```dockerfile
# Builder Stage
FROM python:3.13-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project
COPY . .
RUN uv sync --frozen

# Production Stage
FROM python:3.13-slim AS production
RUN groupadd -g 1000 appgroup && useradd -u 1000 -g appgroup -m appuser
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
COPY --from=builder /app/pyproject.toml /app/pyproject.toml
RUN chown -R appuser:appgroup /app
USER appuser
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### Step 6: Add Frontend Health Endpoint

**File**: `phase-4/frontend/src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
```

---

### Step 7: Build Docker Images

```bash
# From project root
docker build -t phase4-frontend:v1 ./phase-4/frontend
docker build -t phase4-backend:v1 ./phase-4/backend
```

**⏱️ Expected time**: 5-8 minutes (first build), 2-3 minutes (cached)

**What's happening**:
- Downloading dependencies (npm install, uv sync)
- Compiling Next.js (takes 3-4 minutes)
- Building Python packages

**⚠️ IMPORTANT**: Be patient - first build takes time. Don't cancel if it seems slow.

**Verify**:
```bash
docker images | grep phase4
# Expected output:
# phase4-frontend    v1    abc123...    2 minutes ago    180MB
# phase4-backend     v1    def456...    1 minute ago     280MB
```

---

### Step 8: Create Kubernetes Secrets

```bash
# Create secret with your actual values
# SECURITY: Start with a space to prevent saving to shell history!
 kubectl create secret generic phase4-secrets \
  --from-literal=DATABASE_URL='postgresql://neondb_owner:password@ep-xxx.aws.neon.tech/neondb?sslmode=require' \
  --from-literal=BETTER_AUTH_SECRET='your-secret-key' \
  --from-literal=OPENAI_API_KEY='sk-proj-...' \
  --from-literal=XIAOMI_API_KEY='sk-skpuxlh2zyrktjbl4gb4emirg7vjcbx12beo4zc3j2wib86v'
```

**Verify**:
```bash
kubectl get secret phase4-secrets
# Expected: phase4-secrets   Opaque                                1      10s
```

---

### Step 9: Generate Helm Charts

```bash
# Create helm-charts directory
mkdir -p phase-4/helm-charts
cd phase-4/helm-charts

# Generate charts
helm create frontend
helm create backend

cd ../..
```

**Verify**:
```bash
ls -la phase-4/helm-charts/
# Expected: frontend/ and backend/ directories
```

---

### Step 10: Customize Helm Charts

**Backend** (`phase-4/helm-charts/backend/values.yaml`):

```yaml
replicaCount: 1

image:
  repository: phase4-backend
  pullPolicy: IfNotPresent
  tag: "v1"

service:
  type: ClusterIP
  port: 8000

env:
  CORS_ORIGINS: "http://localhost:3000,http://10.96.0.0:3000"
  API_HOST: "0.0.0.0"
  API_PORT: "8000"
  BETTER_AUTH_URL: "http://frontend:3000"
  DEBUG: "false"
  ENVIRONMENT: "development"

envFrom:
  - secretRef:
      name: phase4-secrets

resources: {}

livenessProbe:
  httpGet:
    path: /health
    port: http
readinessProbe:
  httpGet:
    path: /health
    port: http

autoscaling:
  enabled: false
```

**Frontend** (`phase-4/helm-charts/frontend/values.yaml`):

```yaml
replicaCount: 1

image:
  repository: phase4-frontend
  pullPolicy: IfNotPresent
  tag: "v1"

service:
  type: LoadBalancer
  port: 3000

env:
  NEXT_PUBLIC_BACKEND_URL: "http://backend:8000"
  NEXT_PUBLIC_AUTH_URL: "http://10.96.0.0:3000"  # Replace with EXTERNAL-IP later
  NEXT_PUBLIC_AUTH_BYPASS: "false"
  NEXT_PUBLIC_CHATKIT_DOMAIN_KEY: "yourdomain.com"

resources: {}

livenessProbe:
  httpGet:
    path: /api/health
    port: http
readinessProbe:
  httpGet:
    path: /api/health
    port: http

autoscaling:
  enabled: false
```

---

### Step 11: Deploy to Minikube

```bash
# Deploy backend first (frontend depends on it)
helm install backend ./phase-4/helm-charts/backend

# Deploy frontend
helm install frontend ./phase-4/helm-charts/frontend
```

**Expected output**:
```
NAME: backend
LAST DEPLOYED: [date]
NAMESPACE: default
STATUS: deployed
REVISION: 1

NAME: frontend
LAST DEPLOYED: [date]
NAMESPACE: default
STATUS: deployed
REVISION: 1
```

**Verify**:
```bash
kubectl get pods
# Expected: Both pods show "Running" status

helm list
# Expected: Both releases show "deployed" status
```

---

### Step 12: Start Minikube Tunnel

**Open a NEW terminal** and run:

```bash
minikube tunnel
```

**Note**: You may be prompted for your password (normal - tunnel requires network permissions).

**Keep this terminal open** - tunnel runs as long as this terminal is active.

---

### Step 13: Verify Deployment

```bash
# Check services
kubectl get services
```

**Expected output**:
```
NAME       TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)
backend    ClusterIP      10.96.100.50    <none>           8000/TCP
frontend   LoadBalancer   10.96.200.100   10.96.200.100    3000:xxxxx/TCP
```

**Get EXTERNAL-IP**:
```bash
kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
# Output: 10.96.200.100 (or similar)
```

---

### Step 14: Access Application

```bash
# Get EXTERNAL-IP
EXTERNAL_IP=$(kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Access in browser
echo "Access at: http://$EXTERNAL_IP:3000"
```

**Open in browser**: `http://10.96.200.100:3000` (use your actual EXTERNAL-IP)

**Test the application**:
1. Navigate to the application
2. Log in (or create account)
3. Create a task
4. Try the AI chatbot
5. Verify all features work

---

## Verification Checklist

- [ ] Minikube is running (`minikube status`)
- [ ] Docker configured for Minikube (`eval $(minikube docker-env)`)
- [ ] Docker images built (`docker images | grep phase4`)
- [ ] Kubernetes secrets created (`kubectl get secrets`)
- [ ] Helm charts generated (`ls phase-4/helm-charts/`)
- [ ] Backend deployed (`helm list | grep backend`)
- [ ] Frontend deployed (`helm list | grep frontend`)
- [ ] Pods running (`kubectl get pods`)
- [ ] Frontend has EXTERNAL-IP (`kubectl get svc frontend`)
- [ ] minikube tunnel running (separate terminal)
- [ ] Application accessible in browser
- [ ] Features work (login, tasks, AI chat)

---

## Troubleshooting

### Pods Not Starting

**Check pod status**:
```bash
kubectl get pods
```

**Check pod details**:
```bash
kubectl describe pod <pod-name>
```

**Check logs**:
```bash
kubectl logs <pod-name>
```

---

### ImagePullBackOff Error

**Cause**: Images not in Minikube's Docker daemon

**Solution**:
```bash
# Re-configure Docker daemon
eval $(minikube docker-env)

# Rebuild images
docker build -t phase4-frontend:v1 ./phase-4/frontend
docker build -t phase4-backend:v1 ./phase-4/backend

# Restart deployments
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

---

### EXTERNAL-IP Shows Pending

**Cause**: Tunnel not running

**Solution**: Start `minikube tunnel` in a separate terminal

---

### Frontend Can't Reach Backend

**Cause**: Wrong API_URL or backend service name

**Solution**:
```bash
# Check backend service
kubectl get svc backend

# Verify API_URL uses service name
# Should be: http://backend:8000

# Update frontend env var
kubectl set env deployment/frontend NEXT_PUBLIC_BACKEND_URL="http://backend:8000"
```

---

## Cleanup

```bash
# Uninstall Helm releases
helm uninstall frontend
helm uninstall backend

# Delete secrets
kubectl delete secret phase4-secrets

# Stop tunnel (press Ctrl+C in tunnel terminal)

# Stop Minikube (optional)
minikube stop

# Delete Minikube cluster (optional)
minikube delete
```

---

## Next Steps

1. **Monitor Application**: Check pod logs regularly
2. **Update Images**: Rebuild and redeploy when code changes
3. **Scale Up**: Increase replica count in values.yaml
4. **Production Deployment**: Adapt Helm charts for Oracle/AWS

---

## References

- **Full Workflow**: `.claude/skills/minikube-deployment/patterns/WORKFLOW.md`
- **Dockerfile Patterns**: `.claude/skills/minikube-deployment/patterns/DOCKERFILE_PATTERNS.md`
- **Helm Patterns**: `.claude/skills/minikube-deployment/patterns/HELM_PATTERNS.md`
- **Feature Spec**: `specs/011-minikube-deployment/spec.md`
- **Implementation Plan**: `specs/011-minikube-deployment/plan.md`

---

**Quickstart Status**: ✅ Complete - Follow steps to deploy
