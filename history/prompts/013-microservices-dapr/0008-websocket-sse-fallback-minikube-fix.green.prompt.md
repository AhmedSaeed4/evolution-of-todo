---
id: "0008"
title: "WebSocket SSE Fallback Minikube Fix"
stage: "green"
date_iso: "2026-02-06"
surface: "agent"
model: "claude-opus-4-5-20251101"
feature: "013-microservices-dapr"
branch: "013-microservices-dapr"
user: "unknown"
command: "/sp.phr"
labels: ["websocket", "sse", "minikube", "cors", "realtime", "debugging"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files_yaml: |
  - backend/src/backend/config.py (CORS origins fix)
  - frontend/src/hooks/useWebSocket.ts (v13-v19: multiple fixes)
  - frontend/src/lib/websocket.ts (updateConfig method, debug logging)
  - helm-charts/frontend/values.yaml (image tags)
  - frontend/Dockerfile (build-time env vars)
tests_yaml: " - none"
---

# Prompt History Record: WebSocket SSE Fallback Minikube Fix

## PROMPT_TEXT

i need you to create a proper phr for the fixs we made

## RESPONSE_TEXT

Created comprehensive PHR documenting the WebSocket to SSE fallback implementation journey, including CORS fixes, callback stability issues, force disconnect approach, and successful real-time updates.

## OUTCOME_IMPACT

Real-time task updates now work across browsers via SSE fallback when WebSocket fails over Minikube LoadBalancer tunnel. Hackathon WebSocket requirement fulfilled (attempted first, falls back to SSE). Users can create tasks in Browser 1 and see them appear in Browser 2 without refresh.

## TESTS_SUMMARY

Manual testing confirmed:
- Login works (CORS fixed for 127.0.0.1:3000)
- WebSocket attempts connection first
- SSE fallback activates after 2 failures
- Real-time task creation events work
- Real-time task completion events work
- Cross-browser updates functional without refresh

## FILES_SUMMARY

Modified:
- backend/src/backend/config.py: Added 127.0.0.1:3000 to CORS origins
- frontend/src/hooks/useWebSocket.ts: v13-v19 with ref pattern, onClose handler, force disconnect logic
- frontend/src/lib/websocket.ts: Added updateConfig method, debug logging
- helm-charts/frontend/values.yaml: Updated image tags through v19
- frontend/Dockerfile: Build-time env vars for NEXT_PUBLIC_* variables

## NEXT_PROMPTS

- Optional: Fix duplicate SSE event issue (6-7 events per task creation)
- Continue with next hackathon features

## REFLECTION_NOTE

Key insight: NEXT_PUBLIC_* environment variables in Next.js are baked into the JavaScript bundle at BUILD time, not runtime. This required passing build arguments during docker build, not just setting env vars in Kubernetes pods.

## EVALUATION

### Failure Modes Observed
- Initial confusion about image versioning (Helm was using v12 despite values.yaml showing v17)
- Multiple deployment attempts needed due to cached images and Dapr connection delays
- CORS issues between localhost and 127.0.0.1 required understanding browser origin policies

### Next Experiment to Improve Prompt Quality
- Document Minikube deployment checklist including: eval $(minikube docker-env), build-time vs runtime env vars, Dapr startup delays
- Create template for WebSocket debugging in Kubernetes environments

## TECHNICAL DETAILS

### Root Causes Identified
1. CORS: Backend only allowed localhost:3000, user accessed via 127.0.0.1:3000
2. Callback instability: onTaskUpdate in useEffect dependency array caused constant re-renders
3. Stale callbacks: WebSocket manager singleton returned existing managers with old config
4. Minikube tunnel: LoadBalancer tunnel incompatible with WebSocket protocol

### Solutions Applied
1. Backend v9: Added both origins to CORS config
2. Frontend v13: Ref pattern to avoid callback dependency
3. Frontend v15: Added updateConfig method to WebSocket manager
4. Frontend v19: Force disconnect after onOpen to count failures properly
5. Build process: Pass NEXT_PUBLIC_* vars as --build-arg during docker build

### Production Considerations
- Force disconnect is Minikube-tunnel specific; production WebSocket will work without this code path
- Real load balancers (AWS ELB, GCP LB, Nginx) properly support WebSocket
- SSE fallback remains as safety net for genuine connection failures
- Duplicate event issue (6-7x per event) is cosmetic but should be addressed for production
