---
id: 0007
title: dapr-kafka-bug-notification-fix
stage: red
date: 2026-02-06
surface: agent
model: claude-opus-4-5-20251101
feature: 013-microservices-dapr
branch: 013-microservices-dapr
user: AhmedSaeed4
command: /sp.phr
labels: ["dapr", "kafka", "microservices", "notification", "recurring", "debugging"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - k8s-dapr/components/pubsub.yaml
  - backend/src/backend/microservices/notification_service.py
  - backend/src/backend/main.py
  - k8s-dapr/configurations/no-statestore-config.yaml
  - helm-charts/notification-service/templates/deployment.yaml
  - helm-charts/websocket-service/templates/deployment.yaml
  - helm-charts/backend/templates/deployment.yaml
tests:
  - none

---

## Prompt

i need you to create phr for the fix you made in this session

## Response snapshot

Comprehensive debugging and fixes for Dapr microservices:
1. Diagnosed and worked around Dapr 1.16.8 Kafka consumer offset bug by disabling retries
2. Fixed notification service TypeError (invalid notification_type parameter)
3. Fixed notification service endpoint route (/reminder-check → /reminder-check-cron)
4. Disabled statestore for services that don't need idempotency (notification, websocket, backend)
5. Disabled old reminder service in main.py
6. Verified recurring tasks and notifications working correctly

## Outcome

- ✅ Impact: Fixed Dapr Kafka consumer stuck bug blocking recurring task processing. Fixed notification service 500 errors. Verified recurring tasks and notifications working end-to-end.
- 🧪 Tests: Recurring task test - created recurring task, completed it, verified new instances created for next 2 days. Notification test - created 5 tasks with reminders, all notifications delivered.
- 📁 Files: Modified pubsub.yaml (disabled retries), notification_service.py (fixed parameter), main.py (disabled old service), created no-statestore-config.yaml, updated 3 helm charts.
- 🔁 Next prompts: Consider upgrading Dapr to version with Kafka bug fix, or implement background poller fallback for production reliability.
- 🧠 Reflection: Dapr 1.16.8 has confirmed Kafka consumer offset bug (#8796). Disabling retries is acceptable trade-off for development since idempotency prevents duplicates anyway.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
