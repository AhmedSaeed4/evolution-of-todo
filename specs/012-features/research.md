# Research: Phase 5 Features (Branch 012)

**Feature**: Recurring Tasks, Reminders, Notifications & Audit Logging
**Date**: 2025-02-02
**Status**: Complete

## Overview

This document captures research findings and technical decisions for Branch 012 features. All research items have been resolved with clear decisions.

## Research Topics

### 1. Recurring Task Date Calculation

**Question**: How to handle edge cases (Feb 29, Jan 31) when calculating recurring task dates?

**Options Considered**:
- Manual calculation using datetime.timedelta
- Python `dateutil.relativedelta` library
- Custom business logic with month/year tables

**Decision**: Use `dateutil.relativedelta`

**Rationale**:
- Handles month/year edge cases correctly (Feb 29 → Feb 28, Jan 31 → last day of month)
- Well-maintained library with extensive test coverage
- Industry standard for date arithmetic
- Minimal dependency impact

**Alternatives Rejected**:
- `timedelta`: Cannot handle variable month lengths
- Custom logic: Reinventing well-solved problem

---

### 2. Reminder Polling Strategy

**Question**: How often should the backend poll for due reminders?

**Options Considered**:
- 30 seconds: More responsive, higher DB load
- 60 seconds: Balance of responsiveness and load
- 120 seconds: Lower load, less responsive

**Decision**: 60 second polling interval

**Rationale**:
- 60s is reasonable for non-critical notifications
- DB impact minimal with proper indexing
- Frontend polling (30s) provides better UX anyway
- Can be tuned later based on metrics

**Alternatives Rejected**:
- 30s: Unnecessary DB load for reminder use case
- 120s: Users might notice delay

---

### 3. Notification Storage Duration

**Question**: How long should notifications be retained in the database?

**Options Considered**:
- 30 days: Minimal storage, users might lose history
- 90 days: Matches audit log retention in constitution
- 365 days: Long retention, more storage

**Decision**: 90 days retention

**Rationale**:
- Aligns with constitution audit retention (90 days minimum)
- Provides reasonable historical context
- Keeps storage requirements predictable
- Industry standard for notification retention

**Alternatives Rejected**:
- 30s: Too short for useful history
- 365 days: Unnecessary storage cost

---

### 4. Audit Log Performance

**Question**: What indexing strategy ensures efficient audit log queries?

**Options Considered**:
- Single index on timestamp only
- Composite index on (user_id, timestamp)
- Composite index on (user_id, timestamp, event_type)

**Decision**: Composite index on (user_id, timestamp DESC) + secondary index on (entity_type, entity_id)

**Rationale**:
- Primary queries filter by user_id and sort by timestamp
- DESC order matches typical "recent first" access pattern
- Secondary index supports entity lookup for detail views
- Follows PostgreSQL index best practices

**Alternatives Rejected**:
- Timestamp only: Would require full table scans for user queries
- Three-column index: Overkill, event_type filtering is low-cardinality

---

### 5. Tags Storage Format

**Question**: How to store tags in PostgreSQL?

**Options Considered**:
- JSONB: Flexible, schema-less, heavier
- TEXT[] array: Native type, indexable, lightweight
- Separate table: Normalized, complex queries

**Decision**: PostgreSQL TEXT[] array type with GIN index

**Rationale**:
- Native PostgreSQL array type with built-in operators
- GIN index provides efficient containment queries (@>, &&)
- Simple to use with SQLModel/SQLAlchemy
- No foreign key complexity
- Perfect fit for "list of strings" use case

**Alternatives Rejected**:
- JSONB: Overkill for simple string array, larger storage
- Separate table: Unnecessary complexity for tags use case

---

## Technical Decisions Summary

| Decision | Choice | Justification |
|----------|--------|----------------|
| Date arithmetic | `dateutil.relativedelta` | Handles month/year edge cases correctly |
| Reminder polling | 60s asyncio task | Simple, no external dependencies, balance of responsiveness |
| Notification retention | 90 days | Matches constitution audit retention |
| Audit log indexing | (user_id, timestamp DESC) + (entity_type, entity_id) | Efficient for typical query patterns |
| Tags storage | PostgreSQL TEXT[] with GIN index | Native, indexable, simple |
| Leap year handling | Last day of month fallback | Standard business logic pattern via relativedelta |
| Audit writes | Synchronous in transaction | Simple, consistent (async upgrade in branch 014) |
| Notification poll | Frontend 30s interval | Better UX than backend 60s, minimal client overhead |

## Dependencies

### New Python Dependencies
```toml
python-dateutil = "^2.8.2"  # For robust date arithmetic
```

### No New TypeScript Dependencies
- Using existing browser APIs (setInterval for polling)
- No additional npm packages required

## Open Questions

**None** - All research items resolved.

## Next Steps

1. Create data-model.md with complete entity definitions
2. Create API contracts in contracts/ directory
3. Generate tasks.md via `/sp.tasks` command
4. Begin implementation per plan.md
