# Quickstart: Microservices Event-Driven Deployment

**Feature**: 013-microservices-dapr
**Date**: 2026-02-04
**Phase**: Phase 1 - Quickstart Guide

## Overview

This guide provides step-by-step instructions for deploying the event-driven microservices architecture locally (docker-compose) and on Minikube (Kubernetes).

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 20.10+ | Container runtime |
| kubectl | 1.27+ | Kubernetes CLI |
| Minikube | 1.31+ | Local Kubernetes |
| Helm | 3.12+ | Package manager |
| Dapr CLI | 1.14+ | Dapr management |
| psql (PostgreSQL client) | 15+ | Database access |

### Verify Installation

```bash
docker --version
kubectl version --client
minikube version
helm version
dapr version
psql --version
```

---

## Option 1: Local Development (Docker Compose)

Best for: Rapid development, testing microservices locally.

### Step 1: Start Infrastructure

```bash
cd phase-5

# Start Redpanda (Kafka) and all microservices
docker-compose up -d

# Verify all services are running
docker-compose ps
```

**Expected Output**:
```
NAME                    STATUS    PORTS
redpanda                running   0.0.0.0:9092->9092/tcp
backend-api             running   0.0.0.0:8000->8000/tcp
dapr-backend            running
recurring-service       running
dapr-recurring          running
notification-service    running
dapr-notification       running
audit-service           running
dapr-audit              running
websocket-service       running
dapr-websocket          running
frontend                running   0.0.0.0:3000->3000/tcp
```

### Step 2: Create Kafka Topics

```bash
# Access Redpanda container
docker exec -it phase-5-redpanda-1 bash

# Create topics
rpk topic create task-created
rpk topic create task-completed
rpk topic create task-updated
rpk topic create task-deleted
rpk topic create reminder-due
rpk topic create task-updates

# Verify
rpk topic list
```

### Step 3: Run Database Migration

```bash
# Set database URL
export DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Run migration for Dapr State Store table
psql $DATABASE_URL -f backend/migrations/003_dapr_state.sql
```

### Step 4: Test the System

```bash
# 1. Check health endpoints
curl http://localhost:8000/health
curl http://localhost:8001/health  # recurring-service
curl http://localhost:8002/health  # notification-service
curl http://localhost:8003/health  # audit-service
curl http://localhost:8004/health  # websocket-service

# 2. Create a task (via frontend)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "title": "Test Task",
    "priority": "high"
  }'

# 3. Check audit logs
docker-compose logs audit-service | grep "task-created"

# 4. Check events in Kafka
docker exec -it phase-5-redpanda-1 rpk topic consume task-created --num 1
```

### Step 5: View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-api
docker-compose logs -f recurring-service

# Dapr sidecar logs
docker-compose logs -f dapr-backend
```

### Step 6: Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Option 2: Minikube Deployment

Best for: Production-like testing, Kubernetes deployment validation.

### Step 1: Start Minikube

```bash
# Start Minikube with adequate resources
minikube start --cpus=4 --memory=8192 --disk-size=50gb

# Verify
minikube status
```

### Step 2: Configure Docker Environment

**CRITICAL**: This step is required so Docker builds images in Minikube's registry.

```bash
eval $(minikube docker-env)

# Verify
docker info | grep "Name: minikube"
```

### Step 3: Install Dapr

```bash
# Initialize Dapr in Kubernetes
dapr init -k

# Verify Dapr pods
kubectl get pods -n dapr-system

# Expected: dapr-sidecar-injector, dapr-sentry, dapr-placement, dapr-scheduler, dapr-dashboard
```

### Step 4: Deploy Redpanda

```bash
# Add Redpanda Helm repo
helm repo add redpanda https://charts.redpanda.com
helm repo update

# Install Redpanda with resource limits
helm install redpanda redpanda/redpanda \
  --set resources.cpu.cores=1 \
  --set resources.memory.container.max=1Gi \
  --namespace default

# Wait for Redpanda to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=redpanda --timeout=300s

# Verify
kubectl get pods -l app.kubernetes.io/name=redpanda
```

### Step 5: Create Kafka Topics

```bash
# Create all 6 topics
kubectl exec -it redpanda-0 -- rpk topic create \
  task-created \
  task-completed \
  task-updated \
  task-deleted \
  reminder-due \
  task-updates

# Verify topics
kubectl exec -it redpanda-0 -- rpk topic list
```

### Step 6: Apply Dapr Components

```bash
# Apply Pub/Sub component
kubectl apply -f phase-5/k8s-dapr/components/pubsub.yaml

# Apply Cron binding
kubectl apply -f phase-5/k8s-dapr/bindings/cron-binding.yaml

# Verify components
kubectl get components

# Describe pubsub component
kubectl describe component pubsub
```

### Step 7: Build Service Images

```bash
# Build backend image (contains all microservices)
docker build -t phase5-backend:v1 phase-5/backend

# Build frontend image
docker build -t phase5-frontend:v1 phase-5/frontend

# Verify images
docker images | grep phase5
```

### Step 8: Create Kubernetes Secrets

```bash
# Create secret for database and JWT
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require" \
  --from-literal=JWT_SECRET="your-secret-here"

# Verify secret
kubectl get secret app-secrets
```

### Step 9: Deploy Services via Helm

```bash
# Deploy backend-api
helm install backend phase-5/helm-charts/backend

# Deploy frontend
helm install frontend phase-5/helm-charts/frontend

# Deploy microservices
helm install recurring-service phase-5/helm-charts/recurring-service
helm install notification-service phase-5/helm-charts/notification-service
helm install audit-service phase-5/helm-charts/audit-service
helm install websocket-service phase-5/helm-charts/websocket-service

# Verify all deployments
kubectl get deployments
```

### Step 10: Verify Pods

```bash
# Check all pods
kubectl get pods

# Expected output (6 pods, each with 2/2 containers):
# NAME                                    READY   STATUS    RESTARTS   AGE
# backend-xxx-yyy                         2/2     Running   0          1m
# frontend-xxx-yyy                        2/2     Running   0          1m
# recurring-service-xxx-yyy               2/2     Running   0          1m
# notification-service-xxx-yyy            2/2     Running   0          1m
# audit-service-xxx-yyy                   2/2     Running   0          1m
# websocket-service-xxx-yyy               2/2     Running   0          1m

# Each pod should have 2 containers:
# - app container
# - daprd (Dapr sidecar)
```

### Step 11: Expose Services

```bash
# Start tunnel for LoadBalancer services
minikube tunnel

# In another terminal, get service URLs
kubectl get svc

# Access frontend at the EXTERNAL-IP
# Example: http://192.168.49.2:3000
```

### Step 12: Run Database Migration

```bash
# Port-forward to backend for direct access
kubectl port-forward svc/backend 8000:8000

# Run migration for Dapr State Store table (from local machine)
psql $DATABASE_URL -f phase-5/backend/migrations/003_dapr_state.sql
```

### Step 13: End-to-End Test

```bash
# Get frontend external IP
export FRONTEND_IP=$(kubectl get svc frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# 1. Create a task
curl -X POST http://$FRONTEND_IP:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "title": "Minikube Test Task",
    "priority": "high"
  }'

# 2. Verify audit service received event
kubectl logs -l app=audit-service --tail=20

# 3. Verify Kafka has the event
kubectl exec -it redpanda-0 -- rpk topic consume task-created --num 1

# 4. Create a recurring task and complete it
TASK_ID=$(curl -X POST http://$FRONTEND_IP:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "title": "Daily standup", "recurringRule": "daily"}' \
  | jq -r '.id')

curl -X PATCH http://$FRONTEND_IP:3000/api/tasks/$TASK_ID/complete \
  -H "Content-Type: application/json"

# 5. Verify recurring service created next task
kubectl logs -l app=recurring-service --tail=20
```

### Step 14: Access Dapr Dashboard

```bash
# Port-forward dashboard
kubectl port-forward svc/dapr-dashboard 8080:8080 -n dapr-system

# Open browser
# http://localhost:8080
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Pods not starting (CrashLoopBackOff)

```bash
# Describe pod to see errors
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
kubectl logs <pod-name> -c daprd  # Dapr sidecar logs

# Common causes:
# - Database connection failed (check DATABASE_URL secret)
# - Dapr sidecar not injected (check annotations)
# - Port conflicts (check dapr.appPort matches app port)
```

#### Issue 2: Dapr sidecar not injected

```bash
# Verify Dapr injector is running
kubectl get pods -n dapr-system | grep injector

# Check pod annotations
kubectl get pod <pod-name> -o jsonpath='{.metadata.annotations}' | jq

# Should include:
# "dapr.io/enabled": "true"
# "dapr.io/app-id": "..."
# "dapr.io/app-port": "..."
```

#### Issue 3: Events not being delivered

```bash
# Check Dapr component configuration
kubectl get component pubsub -o yaml

# Check component logs
kubectl logs -l app=dapr-sidecar-injector -n dapr-system

# Verify Kafka topics exist
kubectl exec -it redpanda-0 -- rpk topic list

# Consume from topic to see messages
kubectl exec -it redpanda-0 -- rpk topic consume task-created
```

#### Issue 4: Docker build fails with Minikube

```bash
# Make sure Docker environment is configured
eval $(minikube docker-env)

# Verify Docker is using Minikube daemon
docker info | grep "Name: minikube"

# Build again
docker build -t phase5-backend:v1 phase-5/backend
```

#### Issue 5: Frontend can't connect to backend

```bash
# Verify backend service exists
kubectl get svc backend

# Check service endpoints
kubectl get endpoints backend

# Test from frontend pod
kubectl exec -it <frontend-pod> -- curl http://backend:8000/health
```

### Useful Commands

```bash
# Restart a deployment
kubectl rollout restart deployment/backend

# Redeploy from Helm
helm upgrade backend phase-5/helm-charts/backend

# Delete and reinstall
helm uninstall backend
helm install backend phase-5/helm-charts/backend

# Port forward for debugging
kubectl port-forward svc/backend 8000:8000

# Get pod shell
kubectl exec -it <pod-name> -- sh

# Monitor pod events
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods

# Get Dapr logs
dapr logs -k --pod-name <pod-name> --app-id backend-api
```

---

## Development Workflow

### Local Development Cycle

1. **Make code changes** in `phase-5/backend/` or `phase-5/frontend/`

2. **Rebuild containers**:
   ```bash
   docker-compose build backend-api frontend
   ```

3. **Restart affected services**:
   ```bash
   docker-compose up -d backend-api
   ```

4. **Test changes** via API or browser

5. **Check logs**:
   ```bash
   docker-compose logs -f backend-api
   ```

### Minikube Development Cycle

1. **Make code changes**

2. **Rebuild image**:
   ```bash
   eval $(minikube docker-env)
   docker build -t phase5-backend:v1 phase-5/backend
   ```

3. **Restart deployment**:
   ```bash
   kubectl rollout restart deployment/backend
   ```

4. **Wait for new pod**:
   ```bash
   kubectl get pods -w
   ```

5. **Test changes**

---

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | Neon PostgreSQL connection string |
| `JWT_SECRET` | Yes | - | Shared JWT secret (must match frontend) |
| `ENVIRONMENT` | No | `development` | Deployment environment |
| `DAPR_HTTP_PORT` | No | `3500` | Dapr HTTP API port |
| `API_PORT` | No | `8000` | Backend API port |

### Dapr Annotations

| Annotation | Required | Default | Description |
|------------|----------|---------|-------------|
| `dapr.io/enabled` | Yes | - | Enable Dapr sidecar |
| `dapr.io/app-id` | Yes | - | Unique service identifier |
| `dapr.io/app-port` | Yes | - | Application port |
| `dapr.io/app-protocol` | No | `http` | Protocol (http/https/grpc/grpcs) |
| `dapr.io/log-level` | No | `info` | Dapr log verbosity |
| `dapr.io/enable-app-health-check` | No | `false` | Enable health checks |

---

## Next Steps

1. **Monitor the system**: Set up Dapr dashboard and logs aggregation
2. **Configure alerts**: Set up alerts for pod failures and event delivery failures
3. **Scale services**: Test horizontal scaling with `kubectl scale`
4. **Add tracing**: Implement OpenTelemetry for distributed tracing
5. **Optimize resources**: Adjust CPU/memory limits based on usage

---

## References

- [Dapr Documentation](https://docs.dapr.io/)
- [Redpanda Documentation](https://docs.redpanda.com/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Project Constitution](../../.specify/memory/constitution.md)
