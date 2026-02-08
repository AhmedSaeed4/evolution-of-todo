# Start Guide - Minikube Deployment

This guide explains how to start, build, and deploy the frontend and backend applications on Minikube with Kubernetes.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Starting Minikube](#starting-minikube)
3. [Configuring Docker](#configuring-docker)
4. [Starting Minikube Tunnel](#starting-minikube-tunnel)
5. [Building Frontend](#building-frontend)
6. [Building Backend](#building-backend)
7. [Kubernetes Secrets](#kubernetes-secrets)
8. [Deploying with Helm](#deploying-with-helm)
9. [CORS Settings](#cors-settings)
10. [Environment Variables](#environment-variables)
11. [Common Issues](#common-issues)

---

## Prerequisites

- **Minikube** installed
- **kubectl** installed
- **helm** installed
- **docker** installed
- **uv** (Python package manager) for backend

---

## Starting Minikube

```bash
# Start Minikube
minikube start
```

**Verify Minikube is running:**
```bash
minikube status
# Should show: Running
```

---

## Configuring Docker

**IMPORTANT:** Before building images, you MUST configure your Docker daemon to use Minikube's Docker daemon. This ensures images are built inside Minikube and don't need to be pushed to a registry.

```bash
# Configure Docker to use Minikube's daemon
eval $(minikube docker-env)

# Verify (should show minikube as the Docker server)
docker info | grep Server
```

**Note:** This command only affects the current terminal session. You need to run it in each new terminal where you build images.

---

## Starting Minikube Tunnel

The tunnel exposes LoadBalancer services via `127.0.0.1`. Run this in a **separate terminal** and keep it running:

```bash
# Run in separate terminal
minikube tunnel
```

**Keep this running** while you're developing. Press `Ctrl+C` to stop when done.

---

## Building Frontend

### Build Arguments (Build-time Variables)

The frontend requires these `--build-arg` values during build. These are **baked into** the client-side JavaScript bundle:

```bash
--build-arg NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
--build-arg NEXT_PUBLIC_AUTH_URL=http://127.0.0.1:3000
--build-arg NEXT_PUBLIC_AUTH_BYPASS="false"
--build-arg NEXT_PUBLIC_CHATKIT_DOMAIN_KEY="local-dev"
--build-arg NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8001
--build-arg NEXT_PUBLIC_SSE_URL=http://127.0.0.1:8001/api/sse
```

### Full Build Command

```bash
# From phase-5 directory
eval $(minikube docker-env)
docker build -t phase5-frontend:latest \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000 \
  --build-arg NEXT_PUBLIC_AUTH_URL=http://127.0.0.1:3000 \
  --build-arg NEXT_PUBLIC_AUTH_BYPASS="false" \
  --build-arg NEXT_PUBLIC_CHATKIT_DOMAIN_KEY="local-dev" \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8001 \
  --build-arg NEXT_PUBLIC_SSE_URL=http://127.0.0.1:8001/api/sse \
  -f frontend/Dockerfile frontend
```

**Build time:** ~30 seconds

---

## Building Backend

The backend uses **uv** (Python package manager). No build-time variables are required for the backend.

```bash
# From phase-5 directory
eval $(minikube docker-env)
docker build -t todo-backend:latest \
  -f backend/Dockerfile backend
```

**Build time:** ~30-60 seconds

---

## Kubernetes Secrets

### Required Secrets

The application needs a `app-secrets` Kubernetes secret with the following values:

| Key | Value | Purpose |
|-----|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Database connection |
| `BETTER_AUTH_SECRET` | Random string (min 32 chars) | Better Auth session encryption |
| `JWT_SECRET` | Random string (min 32 chars) | JWT token signing |
| `OPENAI_API_KEY` | `sk-...` | OpenAI Agents SDK for ChatKit |
| `KAFKA_BROKER` | `redpanda-0.redpanda:9092` | Kafka broker for Dapr pub/sub |

### Creating the Secret

```bash
# Create/update the secret
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@localhost/database" \
  --from-literal=BETTER_AUTH_SECRET="your-secret-key-min-32-chars" \
  --from-literal=JWT_SECRET="your-jwt-secret-key-min-32-chars" \
  --from-literal=OPENAI_API_KEY="sk-your-openai-api-key" \
  --from-literal=KAFKA_BROKER="redpanda-0.redpanda:9092" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Updating an Existing Secret

```bash
# Update specific value in existing secret
kubectl patch secret app-secrets \
  --from-literal=OPENAI_API_KEY="new-api-key"
```

### Viewing Current Secret Values

```bash
# Decode and view a secret value
kubectl get secret app-secrets -o jsonpath='{.data.OPENAI_API_KEY}' | base64 -d
```

---

## Dapr Infrastructure

### Redis (State Store)

Dapr uses Redis for state management (idempotency checking). Deploy Redis first:

```bash
# From phase-5 directory
kubectl apply -f k8s-dapr/redis-deployment.yaml

# Verify Redis is running
kubectl get pods -l app=redis
kubectl get svc redis
```

**Expected output:**
```
NAME          READY   STATUS    RESTARTS   AGE
redis-xxxxx   1/1     Running   0          30s
```

### Dapr Components

Deploy Dapr components (statestore, pubsub):

```bash
# From phase-5 directory
kubectl apply -f k8s-dapr/components/

# Verify components
kubectl get components
```

**Components deployed:**
| Component | Type | Purpose |
|-----------|------|---------|
| `statestore` | Redis | Idempotency checking for events |
| `pubsub` | Redpanda | Kafka for event streaming |

**Note:** These components must be deployed BEFORE the applications that use them.

---

## Deploying with Helm

### Deploy Backend

```bash
# From phase-5 directory
helm upgrade --install backend helm-charts/backend \
  --set image.tag=latest \
  --set image.repository=todo-backend
```

### Deploy Frontend

```bash
# From phase-5 directory
helm upgrade --install frontend helm-charts/frontend \
  --set image.tag=latest \
  --set image.repository=phase5-frontend
```

### Check Deployment Status

```bash
# Check all pods
kubectl get pods

# Check frontend pods only
kubectl get pods -l app.kubernetes.io/name=frontend

# Check backend pods only
kubectl get pods -l app.kubernetes.io/name=backend

# Watch pods starting up
kubectl get pods -w
```

### Expected Output

```
NAME                        READY   STATUS    RESTARTS   AGE
frontend-xxxxx-xxxxx        2/2     Running   0          1m
backend-xxxxx-xxxxx          2/2     Running   0          1m
```

**Note:** `2/2` means both the application container and the Dapr sidecar are running.

---

## CORS Settings

### Backend CORS Configuration

The backend CORS is configured in `backend/src/backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",  # Frontend via Minikube tunnel
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**No CORS changes needed** - the configuration is correct for Minikube tunnel setup.

### Frontend API URLs

The frontend connects to backend via:
- **Browser → Backend:** `http://127.0.0.1:8000` (via Minikube tunnel)
- **Frontend Server → Backend:** `http://backend:8000` (internal Kubernetes service)

---

## Environment Variables

### Frontend Build-time Variables (NEXT_PUBLIC_*)

These are set during Docker build using `--build-arg`:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_BACKEND_URL` | `http://127.0.0.1:8000` | Browser → Backend (tunnel) |
| `NEXT_PUBLIC_AUTH_URL` | `http://127.0.0.1:3000` | Frontend auth URL |
| `NEXT_PUBLIC_AUTH_BYPASS` | `false` | Set to `true` for local dev without login |
| `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` | `local-dev` | ChatKit domain key |
| `NEXT_PUBLIC_WEBSOCKET_URL` | `ws://127.0.0.1:8001` | WebSocket via websocket-service |
| `NEXT_PUBLIC_SSE_URL` | `http://127.0.0.1:8001/api/sse` | SSE via websocket-service |

**Important:** These CANNOT be changed at runtime. They are baked into the JavaScript bundle during build.

### Frontend Runtime Variables

Set in `helm-charts/frontend/values.yaml`:

```yaml
env:
  BACKEND_URL_INTERNAL: "http://backend:8000"
  AUTH_URL_INTERNAL: "http://frontend:3000"
  DAPR_HOST: "localhost"
  DAPR_HTTP_PORT: "3500"
```

### Backend Runtime Variables

Set via Kubernetes Secrets or `helm-charts/backend/values.yaml`:

```yaml
env:
  DAPR_HOST: "localhost"
  DAPR_HTTP_PORT: "3500"
  HOSTNAME: "0.0.0.0"
  PORT: "8000"
```

---

## Common Issues

### Issue: `ImagePullBackOff` or `ErrImageNeverPull`

**Cause:** Image not found in Minikube's Docker daemon.

**Solution:**
```bash
# Make sure you ran this before building
eval $(minikube docker-env)

# Rebuild the image
docker build -t phase5-frontend:latest -f frontend/Dockerfile frontend

# Redeploy
helm upgrade frontend helm-charts/frontend --set image.tag=latest
```

### Issue: Frontend shows "Failed to fetch"

**Cause:** Wrong backend URL in build args or Minikube tunnel not running.

**Solution:**
```bash
# 1. Make sure tunnel is running
minikube tunnel  # in separate terminal

# 2. Verify backend service is accessible
curl http://127.0.0.1:8000/api/health

# 3. If needed, rebuild frontend with correct URL
docker build -t phase5-frontend:latest \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000 \
  -f frontend/Dockerfile frontend
```

### Issue: Pod stuck in `CrashLoopBackOff`

**Cause:** Application error or missing secrets.

**Solution:**
```bash
# Check pod logs
kubectl logs <pod-name> -c frontend

# Check if secrets exist
kubectl get secret app-secrets

# Describe pod for events
kubectl describe pod <pod-name>
```

### Issue: CORS errors in browser console

**Cause:** Frontend trying to connect to wrong backend URL.

**Solution:**
```bash
# Verify the build-time URL was correct
grep NEXT_PUBLIC_BACKEND_URL .next/BUILD_ID  # Should show http://127.0.0.1:8000

# Rebuild if needed
docker build -t phase5-frontend:latest \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000 \
  -f frontend/Dockerfile frontend
```

### Issue: Real-time updates not working

**Cause:** WebSocket/SSE connection blocked by tunnel or wrong URL.

**Solution:**
```bash
# 1. Verify frontend was built with correct WebSocket URL
grep NEXT_PUBLIC_WEBSOCKET_URL .next/BUILD_ID  # Should show ws://127.0.0.1:8001

# 2. Verify WebSocket service is accessible
curl http://127.0.0.1:8001/health

# 3. Check browser console for [Realtime] logs
# Should see: [Realtime] Switching to SSE after 2 abnormal closures

# 4. If wrong URL, rebuild frontend with correct build arg
docker build -t phase5-frontend:latest \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8001 \
  -f frontend/Dockerfile frontend
```

---

## Quick Reference Commands

### First-Time Setup

Run these ONCE when starting fresh:

```bash
# 1. Start Minikube
minikube start

# 2. Start tunnel in separate terminal (keep running)
minikube tunnel

# 3. Configure Docker for Minikube
eval $(minikube docker-env)

# 4. Create secrets
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:password@localhost/database" \
  --from-literal=BETTER_AUTH_SECRET="your-secret-key-min-32-chars" \
  --from-literal=JWT_SECRET="your-jwt-secret-key-min-32-chars" \
  --from-literal=OPENAI_API_KEY="sk-your-openai-api-key" \
  --from-literal=KAFKA_BROKER="redpanda-0.redpanda:9092" \
  --dry-run=client -o yaml | kubectl apply -f -

# 5. Deploy Redis for Dapr statestore
kubectl apply -f k8s-dapr/redis-deployment.yaml

# 6. Deploy Dapr components
kubectl apply -f k8s-dapr/components/

# 7. Build and deploy
cd phase-5
docker build -t phase5-backend:latest -f backend/Dockerfile backend
docker build -t phase5-frontend:latest \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000 \
  --build-arg NEXT_PUBLIC_AUTH_URL=http://127.0.0.1:3000 \
  --build-arg NEXT_PUBLIC_AUTH_BYPASS="false" \
  --build-arg NEXT_PUBLIC_CHATKIT_DOMAIN_KEY="local-dev" \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8001 \
  --build-arg NEXT_PUBLIC_SSE_URL=http://127.0.0.1:8001/api/sse \
  -f frontend/Dockerfile frontend

# 8. Deploy all microservices
helm upgrade --install backend helm-charts/backend --set image.tag=latest
helm upgrade --install frontend helm-charts/frontend --set image.tag=latest
helm upgrade --install websocket-service helm-charts/websocket-service
helm upgrade --install audit-service helm-charts/audit-service
helm upgrade --install notification-service helm-charts/notification-service
helm upgrade --install recurring-service helm-charts/recurring-service
```

### Daily Start Sequence

```bash
# Terminal 1: Start tunnel (keep running)
minikube tunnel

# Terminal 2: Configure and build
eval $(minikube docker-env)
cd phase-5

# Build frontend (if needed)
docker build -t phase5-frontend:latest \
  --build-arg NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000 \
  --build-arg NEXT_PUBLIC_AUTH_URL=http://127.0.0.1:3000 \
  --build-arg NEXT_PUBLIC_AUTH_BYPASS="false" \
  --build-arg NEXT_PUBLIC_CHATKIT_DOMAIN_KEY="local-dev" \
  --build-arg NEXT_PUBLIC_WEBSOCKET_URL=ws://127.0.0.1:8001 \
  --build-arg NEXT_PUBLIC_SSE_URL=http://127.0.0.1:8001/api/sse \
  -f frontend/Dockerfile frontend

# Deploy
helm upgrade frontend helm-charts/frontend --set image.tag=latest
helm upgrade backend helm-charts/backend --set image.tag=latest

# Check status
kubectl get pods
```

### Checking Logs

```bash
# Frontend logs
kubectl logs -l app.kubernetes.io/name=frontend -c frontend --tail=50 -f

# Backend logs
kubectl logs -l app.kubernetes.io/name=backend -c backend --tail=50 -f

# Dapr logs
kubectl logs <pod-name> -c daprd
```

### Restart Services

```bash
# Restart frontend (forces new pod)
kubectl rollout restart deployment/frontend

# Restart backend
kubectl rollout restart deployment/backend

# Wait for restart
kubectl rollout status deployment/frontend
```

---

## Access URLs

After starting Minikube tunnel:

| Service | URL |
|---------|-----|
| Frontend | http://127.0.0.1:3000 |
| Backend API | http://127.0.0.1:8000 |
| Backend Health | http://127.0.0.1:8000/health |
| Backend Docs | http://127.0.0.1:8000/docs |
| WebSocket Service | http://127.0.0.1:8001/health |
| WebSocket Endpoint | ws://127.0.0.1:8001/ws?user_id={id} |
| SSE Endpoint | http://127.0.0.1:8001/api/sse/{user_id} |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v27 | 2026-02-07 | Fixed SSE duplicate connections & navigation bug |
| v26 | 2026-02-07 | Fixed navigation bug with ref resets |
| v25 | 2026-02-07 | Fixed duplicate code bug in useEffect |
| v22 | 2026-02-07 | Working version with correct backend URL |

---

## Support

For issues or questions, check:
- Browser console (F12) for client-side errors
- Pod logs for server-side errors: `kubectl logs <pod-name>`
- Kubernetes events: `kubectl describe pod <pod-name>`
