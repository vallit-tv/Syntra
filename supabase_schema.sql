-- Complete Supabase Database Schema for Syntra
-- Run this ENTIRE file in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  is_password_set BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_password_set ON users(is_password_set);

-- Add comment
COMMENT ON TABLE users IS 'User accounts for Syntra platform';

-- ============================================================================
-- API KEYS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  key_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Add comment
COMMENT ON TABLE api_keys IS 'User API keys for external integrations';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on api_keys table
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can read their own data (service role bypasses this)
-- Note: Since we're using service_role key in Flask, RLS is bypassed
-- But we add policies for security if anon key is used elsewhere

-- Policy: Users can read their own data (if using anon key)
-- Note: IF NOT EXISTS is not supported for policies, so we drop first if exists
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Users can update their own password
DROP POLICY IF EXISTS "Users can update own password" ON users;
CREATE POLICY "Users can update own password"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Policy: Users can read their own API keys
DROP POLICY IF EXISTS "Users can read own API keys" ON api_keys;
CREATE POLICY "Users can read own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own API keys
DROP POLICY IF EXISTS "Users can insert own API keys" ON api_keys;
CREATE POLICY "Users can insert own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own API keys
DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;
CREATE POLICY "Users can delete own API keys"
  ON api_keys FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update updated_at on api_keys
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if tables were created
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE '✅ Users table created successfully';
    ELSE
        RAISE EXCEPTION '❌ Users table creation failed';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'api_keys') THEN
        RAISE NOTICE '✅ API keys table created successfully';
    ELSE
        RAISE EXCEPTION '❌ API keys table creation failed';
    END IF;
END $$;

