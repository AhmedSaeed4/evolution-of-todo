# Deployment Access

Phase-4 Minikube deployment access information.

## Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://127.0.0.1:3000 | Next.js web application |
| **Backend** | http://127.0.0.1:8000 | FastAPI backend |

## Requirements

- **minikube tunnel** must be running in a separate terminal
- Run `minikube tunnel` before accessing the applications

## Service Details

```
NAME      TYPE           EXTERNAL-IP   PORT(S)
frontend  LoadBalancer   127.0.0.1     3000:31270/TCP
backend   LoadBalancer   127.0.0.1     8000:32266/TCP
```

## Quick Start

1. Start tunnel: `minikube tunnel`
2. Open browser: http://127.0.0.1:3000
3. Login and test the application

---

**Last Updated**: 2026-01-28
**Minikube Status**: Running
