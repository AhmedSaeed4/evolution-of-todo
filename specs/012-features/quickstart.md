# Quickstart: Branch 012 Features

**Feature**: Recurring Tasks, Reminders, Notifications & Audit Logging
**Branch**: 012-features

## Prerequisites

- Python 3.13+
- Node.js 20+
- Neon PostgreSQL database
- Phase 4 codebase (Better Auth + JWT already configured)

## Setup Steps

### 1. Database Migration

```bash
# Navigate to backend directory
cd phase-5/backend

# Run the migration
psql $DATABASE_URL -f migrations/002_phase5_features.sql

# Verify migration
psql $DATABASE_URL -c "\d tasks"
psql $DATABASE_URL -c "\d audit_logs"
psql $DATABASE_URL -c "\d notifications"
```

### 2. Backend Setup

```bash
# Install new dependencies
cd phase-5/backend
uv add python-dateutil

# Verify installation
uv run python -c "from dateutil.relativedelta import relativedelta; print('OK')"
```

### 3. Frontend Setup

```bash
# No new dependencies required
cd phase-5/frontend
npm install  # Just to ensure lockfile is current
```

### 4. Start Services

```bash
# Terminal 1: Start backend
cd phase-5/backend
uv run uvicorn src.backend.main:app --reload --port 8000

# Terminal 2: Start frontend
cd phase-5/frontend
npm run dev
```

## Feature Usage

### Creating a Recurring Task

1. Navigate to Tasks page
2. Click "+ New Task"
3. Fill in title, description, etc.
4. **NEW**: Select "Recurring" dropdown → Choose "Daily", "Weekly", "Monthly", or "Yearly"
5. **NEW**: Optionally set "Recurring End Date"
6. Click "Create Task"

**Result**: Task created with visual recurring indicator. When completed, next instance appears automatically.

### Setting a Reminder

1. Create or edit a task
2. **NEW**: Click "Set Reminder" date/time picker
3. Select reminder date and time
4. Save task

**Result**: At the reminder time, a notification appears in the bell icon (within 60s polling window).

### Viewing Notifications

1. Look at the bell icon in the navbar (upper right)
2. Badge shows unread count
3. Click bell to open notification dropdown
4. Click "Mark as read" to dismiss individual notifications
5. Click "Mark all as read" to clear all

**Result**: Notifications are polled every 30 seconds, keeping the list current.

### Viewing Audit Log

1. Navigate to `/audit` page (new page in dashboard)
2. See chronological list of all task operations
3. Filter by event type (created, updated, deleted, completed)
4. Click task ID to navigate to that task

**Result**: Complete audit trail of all actions with timestamps and user IDs.

### Using Tags

1. Create or edit a task
2. **NEW**: Enter tags in the "Tags" input field
3. Press Enter to add multiple tags
4. Save task

**Result**: Tags appear on task cards. Use tags filter to find tagged tasks.

## API Endpoints

### New Endpoints

```bash
# Notifications
GET    /api/{user_id}/notifications
PATCH  /api/{user_id}/notifications/{id}/read
PATCH  /api/{user_id}/notifications/read-all

# Audit Log
GET    /api/{user_id}/audit?event_type=completed&limit=50
```

### Modified Endpoints

```bash
# Tasks (now accepts additional fields)
POST   /api/{user_id}/tasks
       Body: { title, ..., recurring_rule, reminder_at, tags }

PUT    /api/{user_id}/tasks/{id}
       Body: { ..., recurring_rule, reminder_at, tags }

PATCH  /api/{user_id}/tasks/{id}/complete
       → Now creates next recurring instance if applicable
```

## Testing

### Manual Test Checklist

- [ ] Create daily recurring task
- [ ] Complete task → verify next day's task appears
- [ ] Create task with reminder 2 min in future → wait → verify notification
- [ ] Mark notification as read → verify count decreases
- [ ] Perform CRUD → verify audit log entries
- [ ] Create monthly task on Jan 31 → verify Feb 28/29 handling

### Unit Tests

```bash
# Backend tests
cd phase-5/backend
uv run pytest tests/unit/test_reminder_service.py
uv run pytest tests/unit/test_audit_service.py

# Frontend tests
cd phase-5/frontend
npm test -- test_recurring_logic.test.ts
```

## Troubleshooting

### Migration Fails

**Error**: `relation "tasks" does not exist`

**Solution**: Run Phase 4 migration first to create tasks table.

### Reminders Not Appearing

**Check**:
1. Backend reminder service is running (check logs for "Starting reminder service")
2. Reminder time is in the future (not past)
3. Task is not already completed

### Notifications Not Updating

**Check**:
1. Frontend polling is active (Network tab shows requests every 30s)
2. Backend is returning notifications (check `/api/{user_id}/notifications`)

### Audit Log Empty

**Check**:
1. AuditService is integrated in TaskService methods
2. Database has audit_logs table with data

## Rollback

If issues occur:

```bash
# Database rollback (Neon point-in-time recovery)
# See Neon dashboard for recovery options

# Code rollback
git reset --hard origin/011-minikube-deployment
```

## Next Steps

After this quickstart:
1. Review [spec.md](./spec.md) for full requirements
2. Review [plan.md](./plan.md) for implementation details
3. Execute `/sp.tasks` to generate task list
4. Begin implementation per plan.md phases
