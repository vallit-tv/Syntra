-- Fix Migration for Daily Summary System
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. Fix ai_advice_history table
-- ============================================================================
-- Add user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_advice_history' AND column_name = 'user_id') THEN
        ALTER TABLE ai_advice_history ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add conversation_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_advice_history' AND column_name = 'conversation_id') THEN
        ALTER TABLE ai_advice_history ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add other potential missing columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_advice_history' AND column_name = 'advice_text') THEN
        ALTER TABLE ai_advice_history ADD COLUMN advice_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_advice_history' AND column_name = 'metadata') THEN
        ALTER TABLE ai_advice_history ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_advice_history' AND column_name = 'source') THEN
        ALTER TABLE ai_advice_history ADD COLUMN source TEXT;
    END IF;
END $$;

-- Create index on user_id (safe to run if index doesn't exist)
CREATE INDEX IF NOT EXISTS idx_advice_user_id ON ai_advice_history(user_id);
CREATE INDEX IF NOT EXISTS idx_advice_conversation_id ON ai_advice_history(conversation_id);

-- ============================================================================
-- 2. Create integrations table (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  api_key TEXT,
  service_url TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_type)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_service ON integrations(user_id, service_type);

-- ============================================================================
-- 3. Ensure conversations table has user_id (just in case)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'user_id') THEN
        ALTER TABLE conversations ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- 4. Triggers and Policies
-- ============================================================================

-- Trigger for integrations
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE ai_advice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can read own advice" ON ai_advice_history;
CREATE POLICY "Users can read own advice" ON ai_advice_history FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can read own integrations" ON integrations;
CREATE POLICY "Users can read own integrations" ON integrations FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
CREATE POLICY "Users can update own integrations" ON integrations FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
CREATE POLICY "Users can insert own integrations" ON integrations FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
CREATE POLICY "Users can delete own integrations" ON integrations FOR DELETE USING (auth.uid()::text = user_id::text);
