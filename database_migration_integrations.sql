-- Migration: Add Integrations table for n8n and other service connections
-- Run this in your Supabase SQL Editor

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Nullable for system-wide integrations (n8n)
    service_type VARCHAR(50) NOT NULL, -- 'n8n', 'notion', 'openai', etc.
    service_url TEXT,
    api_key TEXT, -- Encrypted/stored securely
    config JSONB DEFAULT '{}', -- Additional configuration
    is_active BOOLEAN DEFAULT TRUE,
    last_connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service_type)
);

-- Update existing table if it exists (make user_id nullable)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'integrations' AND column_name = 'user_id' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE integrations ALTER COLUMN user_id DROP NOT NULL;
        -- Drop and recreate unique constraint to allow NULL user_id
        ALTER TABLE integrations DROP CONSTRAINT IF EXISTS integrations_user_id_service_type_key;
        CREATE UNIQUE INDEX IF NOT EXISTS integrations_user_service_unique 
            ON integrations(user_id, service_type) 
            WHERE user_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS integrations_service_unique 
            ON integrations(service_type) 
            WHERE user_id IS NULL;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_service_type ON integrations(service_type);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);

-- Add comment
COMMENT ON TABLE integrations IS 'External service integrations (n8n, Notion, etc.)';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_integrations_updated_at ON integrations;
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (if using anon key)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own integrations" ON integrations;
CREATE POLICY "Users can read own integrations"
    ON integrations FOR SELECT
    USING (user_id IS NULL OR auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own integrations" ON integrations;
CREATE POLICY "Users can insert own integrations"
    ON integrations FOR INSERT
    WITH CHECK (user_id IS NULL OR auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
CREATE POLICY "Users can update own integrations"
    ON integrations FOR UPDATE
    USING (user_id IS NULL OR auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
CREATE POLICY "Users can delete own integrations"
    ON integrations FOR DELETE
    USING (user_id IS NULL OR auth.uid()::text = user_id::text);

