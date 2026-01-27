# Minikube Deployment Guide

Complete guide for deploying the Phase-4 full-stack application to local Kubernetes using Minikube.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Steps](#detailed-steps)
- [Environment Variables](#environment-variables)
- [Common Issues](#common-issues)
- [Cleanup](#cleanup)

---

## Prerequisites

Install the following tools:

```bash
# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Docker (should already be installed)
docker --version

# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

Verify installation:
```bash
minikube version
docker version
kubectl version --client
helm version
```

---

## Quick Start

### 1. Start Minikube

```bash
minikube start
```

### 2. Configure Docker for Minikube

```bash
eval $(minikube docker-env)
```

**⚠️ CRITICAL**: Run this in every new terminal before building images!

### 3. Create Kubernetes Secret

Get values from your `.env` files:
- Backend: `phase-4/backend/.env`
- Frontend: `phase-4/frontend/.env.local`

```bash
kubectl create secret generic phase4-secrets \
  --from-literal=DATABASE_URL='your-database-url' \
  --from-literal=BETTER_AUTH_SECRET='your-jwt-secret' \
  --from-literal=OPENAI_API_KEY='your-openai-key' \
  --from-literal=XIAOMI_API_KEY='your-xiaomi-key'
```

> **Note**: Replace the placeholder values with actual values from your `.env` files.

### 4. Build Docker Images

```bash
# Backend
docker build -t phase4-backend:v1 ./phase-4/backend

# Frontend
docker build -t phase4-frontend:v1 \
  --build-arg NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000" \
  --build-arg NEXT_PUBLIC_AUTH_URL="http://127.0.0.1:3000" \
  --build-arg NEXT_PUBLIC_AUTH_BYPASS="false" \
  --build-arg NEXT_PUBLIC_CHATKIT_DOMAIN_KEY="yourdomain.com" \
  ./phase-4/frontend
```

### 5. Deploy with Helm

```bash
# Backend
helm install backend ./phase-4/helm-charts/backend

# Frontend
helm install frontend ./phase-4/helm-charts/frontend
```

### 6. Start minikube Tunnel

Open a **new terminal** and run:

```bash
minikube tunnel
```

Keep this terminal open! The tunnel must stay running.

### 7. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://127.0.0.1:3000 |
| **Backend**  | http://127.0.0.1:8000 |

---

## Detailed Steps

### Understanding the Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Host Machine                         │
│                                                              │
│  Browser ──► http://127.0.0.1:3000 (Frontend)              │
│                  http://127.0.0.1:8000 (Backend)              │
│                                                              │
│  minikube tunnel ──► Routes 127.0.0.1:3000 to Frontend Pod   │
│                    Routes 127.0.0.1:8000 to Backend Pod     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  Frontend Pod ──► http://frontend:3000 (Internal)          │
│  Backend Pod  ──► http://backend:8000 (Internal)            │
│                                                              │
│  Server-side code uses internal URLs (frontend:3000)       │
│  Client-side code uses tunnel URLs (127.0.0.1:3000)        │
└─────────────────────────────────────────────────────────────┘
```

### Why `eval $(minikube docker-env)` is Critical

```bash
# Without it:
docker build -t phase4-frontend:v1 ./phase-4/frontend
# → Builds in Docker Desktop, Minikube can't see the image

# With it:
eval $(minikube docker-env)
docker build -t phase4-frontend:v1 ./phase-4/frontend
# → Builds in Minikube's Docker, Kubernetes can use it
```

### Why minikube tunnel is Needed

LoadBalancer services need external IPs. The tunnel provides:

```
Service           External-IP    Port
────────────────────────────────────
frontend           127.0.0.1      3000
backend            127.0.0.1      8000
```

Without tunnel: `EXTERNAL-IP` stays `<pending>` and services are inaccessible.

---

## Environment Variables

### Build-Time Variables (Frontend Dockerfile)

These are baked into the JavaScript bundle during `docker build`:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | `http://127.0.0.1:8000` | Browser → Backend (via tunnel) |
| `NEXT_PUBLIC_AUTH_URL` | `http://127.0.0.1:3000` | Frontend auth URL |
| `NEXT_PUBLIC_AUTH_BYPASS` | `false` | Disable auth for testing |
| `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` | `yourdomain.com` | ChatKit domain |

### Runtime Variables (Helm values.yaml)

**Frontend:**
| Variable | Value | Used By |
|----------|-------|---------|
| `BACKEND_URL_INTERNAL` | `http://backend:8000` | Server → Backend (internal) |
| `AUTH_URL_INTERNAL` | `http://frontend:3000` | Server → Auth (internal) |

**Backend:**
| Variable | Value | Purpose |
|----------|-------|---------|
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Allowed origins |
| `BETTER_AUTH_URL` | `http://frontend:3000` | JWKS endpoint URL |
| `API_HOST` | `0.0.0.0` | Bind address |
| `API_PORT` | `8000` | Bind port |

### Kubernetes Secrets

Sensitive data stored in Kubernetes Secrets (from `.env` files):

```bash
kubectl create secret generic phase4-secrets \
  --from-literal=DATABASE_URL='your-neon-url' \
  --from-literal=BETTER_AUTH_SECRET='your-jwt-secret' \
  --from-literal=OPENAI_API_KEY='sk-proj-...' \
  --from-literal=XIAOMI_API_KEY='sk-skpuxlh2...'
```

Reference in values.yaml:
```yaml
envFrom:
  - secretRef:
      name: phase4-secrets
```

---

## Common Issues

### Issue: "ImagePullBackOff" or "ErrImageNeverPull"

**Cause**: Image not found in Minikube's Docker daemon

**Fix**:
```bash
eval $(minikube docker-env)
docker build -t phase4-frontend:v1 ./phase-4/frontend
```

### Issue: "EXTERNAL-IP stays <pending>"

**Cause**: minikube tunnel not running

**Fix**:
```bash
# Open new terminal and run:
minikube tunnel
```

### Issue: "ERR_CONNECTION_REFUSED" on auth/tasks

**Cause**: Tunnel not running or pods not ready

**Fix**:
```bash
# Check tunnel is running
ps aux | grep "minikube tunnel"

# Check pods are running
kubectl get pods

# Restart tunnel if needed
minikube tunnel --cleanup
minikube tunnel
```

### Issue: "401 Unauthorized" on API calls

**Cause**: JWT validation failing or secrets not configured

**Fix**:
```bash
# Verify secret exists
kubectl get secret phase4-secrets

# Check backend logs
kubectl logs -l app.kubernetes.io/name=backend

# Rebuild backend with correct code (if JWT validation was changed)
docker build -t phase4-backend:v1 ./phase-4/backend
helm upgrade backend ./phase-4/helm-charts/backend
```

### Issue: "Connection closed" from AI chat

**Cause**: MCP server can't find README.md or internal URL mismatch

**Fix**:
```bash
# Verify README.md is in Docker image
docker run --rm phase4-backend:v1 ls /app/README.md

# If missing, rebuild backend
docker build -t phase4-backend:v1 ./phase-4/backend
helm upgrade backend ./phase-4/helm-charts/backend

# Check backend logs for errors
kubectl logs -l app.kubernetes.io/name=backend --tail=50
```

---

## Development Workflow

### Making Changes to Frontend

1. Edit code in `phase-4/frontend/`
2. Rebuild image:
   ```bash
   eval $(minikube docker-env)
   docker build -t phase4-frontend:v1 ./phase-4/frontend
   ```
3. Upgrade deployment:
   ```bash
   helm upgrade frontend ./phase-4/helm-charts/frontend
   ```

### Making Changes to Backend

1. Edit code in `phase-4/backend/`
2. Rebuild image:
   ```bash
   eval $(minikube docker-env)
   docker build -t phase4-backend:v1 ./phase-4/backend
   ```
3. Upgrade deployment:
   ```bash
   helm upgrade backend ./phase-4/helm-charts/backend
   ```

### Updating Environment Variables

**For build-time variables (NEXT_PUBLIC_*):**
1. Update `--build-arg` in docker build command
2. Rebuild image

**For runtime variables:**
1. Update `phase-4/helm-charts/*/values.yaml`
2. Run `helm upgrade`

**For secrets:**
1. Delete and recreate secret:
   ```bash
   kubectl delete secret phase4-secrets
   kubectl create secret generic phase4-secrets --from-literal=...
   ```
2. Restart pods:
   ```bash
   kubectl rollout restart deployment backend
   kubectl rollout restart deployment frontend
   ```

---

## Troubleshooting Commands

### Check Pod Status

```bash
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Services

```bash
kubectl get svc
kubectl describe svc <service-name>
```

### Check Tunnel Status

```bash
ps aux | grep "minikube tunnel"
```

### Clean Up and Start Fresh

```bash
# Stop tunnel
minikube tunnel --cleanup

# Uninstall releases
helm uninstall frontend
helm uninstall backend

# Delete secret
kubectl delete secret phase4-secrets

# Stop Minikube
minikube stop

# Start fresh
minikube start
eval $(minikube docker-env)
```

---

## Cleanup

When you're done working:

```bash
# 1. Stop tunnel (Ctrl+C in tunnel terminal)

# 2. Uninstall Helm releases
helm uninstall frontend
helm uninstall backend

# 3. Delete Kubernetes secret
kubectl delete secret phase4-secrets

# 4. Stop Minikube (optional)
minikube stop
```

To restore later, run through the Quick Start steps again.

---

## Summary

| Step | Command |
|------|---------|
| 1. Start Minikube | `minikube start` |
| 2. Configure Docker | `eval $(minikube docker-env)` |
| 3. Create Secret | `kubectl create secret generic phase4-secrets ...` |
| 4. Build Backend | `docker build -t phase4-backend:v1 ./phase-4/backend` |
| 5. Build Frontend | `docker build -t phase4-frontend:v1 --build-arg ... ./phase-4/frontend` |
| 6. Deploy Backend | `helm install backend ./phase-4/helm-charts/backend` |
| 7. Deploy Frontend | `helm install frontend ./phase-4/helm-charts/frontend` |
| 8. Start Tunnel | `minikube tunnel` (new terminal) |
| 9. Access App | http://127.0.0.1:3000 |

**Remember**:
- Run `eval $(minikube docker-env)` in every new terminal
- Keep tunnel terminal open
- URLs stay stable as long as tunnel is running
