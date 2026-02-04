-- Migration: Fix chat_sessions and chat_messages to use ChatKit schema
-- Date: 2026-02-02
-- Description: Drop wrong Agent schema tables and recreate with correct ChatKit schema
-- This matches the schema defined in models/chat.py and phase-4 database

BEGIN;

-- Drop existing tables (wrong schema from Agent model)
-- No data loss expected as these are newly created tables
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;

-- ========================================
-- Create chat_sessions table (ChatKit schema)
-- ========================================
CREATE TABLE chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Indexes for chat_sessions
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_sessions_updated_at_column();

-- ========================================
-- Create chat_messages table (ChatKit schema)
-- ========================================
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

-- Indexes for chat_messages
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Check constraint for sender_type
ALTER TABLE chat_messages
ADD CONSTRAINT chk_sender_type
CHECK (sender_type IN ('user', 'assistant', 'tool'));

COMMIT;

-- ========================================
-- Verification queries (run separately)
-- ========================================
-- SELECT COUNT(*) FROM chat_sessions;
-- SELECT COUNT(*) FROM chat_messages;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'chat%';
