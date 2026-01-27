-- Fix jwks table schema for Better Auth JWT plugin
-- The JWT plugin requires specific column names

-- First, check if jwks table exists and drop it to recreate with correct schema
DROP TABLE IF EXISTS jwks;

-- Create jwks table with correct schema for Better Auth JWT plugin
CREATE TABLE jwks (
  id TEXT PRIMARY KEY,
  "publicKey" TEXT NOT NULL,
  "privateKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_jwks_created_at ON jwks("createdAt");
