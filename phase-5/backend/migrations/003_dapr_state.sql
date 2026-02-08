-- Migration: Create Dapr State Store table for idempotency tracking
-- Dapr uses this table for distributed state storage
-- Key format for idempotency: processed-{event_id}-{service_name}

CREATE TABLE IF NOT EXISTS state (
    key TEXT PRIMARY KEY,
    value JSONB,
    isbinary BOOLEAN DEFAULT FALSE,
    insertdate TIMESTAMP DEFAULT NOW(),
    updatedate TIMESTAMP DEFAULT NOW()
);

-- Optional: Index for TTL cleanup (if using TTL feature)
CREATE INDEX IF NOT EXISTS idx_state_expiredate ON state(updatedate);

-- Example query pattern for idempotency check:
-- SELECT value FROM state WHERE key = 'processed-550e8400-e29b-41d4-a716-446655440000-audit-service';
