-- Migration: Create chat_messages table with correct schema
-- Date: 2026-01-16
-- Description: Create ChatKit-compatible messages table (sessions table should be created first)

BEGIN;

-- Create chat_messages table with correct schema
CREATE TABLE chat_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender_type VARCHAR(50) NOT NULL,
    sender_name VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Add indexes for performance
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Add constraint for sender_type
ALTER TABLE chat_messages
ADD CONSTRAINT chk_sender_type
CHECK (sender_type IN ('user', 'assistant', 'tool'));

-- Verify existing data is intact
SELECT COUNT(*) FROM tasks;

COMMIT;