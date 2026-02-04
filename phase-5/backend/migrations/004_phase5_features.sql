-- Migration: Phase 5 Features - Recurring Tasks, Reminders, Notifications, Audit Log
-- Date: 2025-02-02
-- Description: Add recurring task support, reminders, notifications, and audit logging
-- Branch: 012-features

BEGIN;

-- ========================================
-- Update tasks table with new fields
-- ========================================

-- Add recurring task fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_rule VARCHAR(20);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_end_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

-- Add reminder fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add tags field (PostgreSQL array type)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_rule ON tasks(recurring_rule) WHERE recurring_rule IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_at ON tasks(reminder_at) WHERE reminder_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_tags ON tasks USING GIN(tags);

-- Add check constraint for recurring_rule values
ALTER TABLE tasks ADD CONSTRAINT chk_recurring_rule
CHECK (recurring_rule IS NULL OR recurring_rule IN ('daily', 'weekly', 'monthly', 'yearly'));

-- ========================================
-- Create audit_logs table
-- ========================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'task',
    entity_id UUID NOT NULL,
    user_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB DEFAULT '{}'
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Add check constraint for event_type values
ALTER TABLE audit_logs ADD CONSTRAINT chk_event_type
CHECK (event_type IN ('created', 'updated', 'deleted', 'completed'));

-- ========================================
-- Create notifications table
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- Add comments for documentation
-- ========================================

COMMENT ON COLUMN tasks.recurring_rule IS 'Recurring frequency: daily, weekly, monthly, yearly';
COMMENT ON COLUMN tasks.recurring_end_date IS 'Stop recurring after this date';
COMMENT ON COLUMN tasks.parent_task_id IS 'Links recurring task instances to parent';
COMMENT ON COLUMN tasks.reminder_at IS 'When to send reminder notification';
COMMENT ON COLUMN tasks.reminder_sent IS 'Track if reminder has been sent';
COMMENT ON COLUMN tasks.tags IS 'Array of tag strings for categorization';

COMMENT ON TABLE audit_logs IS 'Complete audit trail of all task operations';
COMMENT ON TABLE notifications IS 'User notifications for task reminders';

COMMIT;

-- ========================================
-- Verification queries (run separately)
-- ========================================
-- \d tasks
-- \d audit_logs
-- \d notifications
-- SELECT COUNT(*) FROM audit_logs;
-- SELECT COUNT(*) FROM notifications;
