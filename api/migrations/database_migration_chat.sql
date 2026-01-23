-- ============================================================================
-- Chat Widget Database Migration
-- ============================================================================
-- Run this in Supabase SQL Editor to create chat tables
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Chat Sessions Table
-- ============================================================================
-- Stores chat widget sessions (can be anonymous or linked to users)

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_key VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    widget_id VARCHAR(100),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    page_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_key ON chat_sessions(session_key);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_widget_id ON chat_sessions(widget_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- ============================================================================
-- Chat Messages Table
-- ============================================================================
-- Stores individual messages in conversations

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens_used INTEGER,
    model VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    n8n_execution_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient retrieval
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- ============================================================================
-- Widget Configurations Table
-- ============================================================================
-- Stores widget configurations for different deployments

CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    widget_id VARCHAR(100) UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    theme VARCHAR(50) DEFAULT 'glassmorphism',
    position VARCHAR(50) DEFAULT 'bottom-right',
    system_prompt TEXT,
    welcome_message TEXT DEFAULT 'Hi! How can I help you today?',
    placeholder_text VARCHAR(255) DEFAULT 'Type your message...',
    primary_color VARCHAR(20) DEFAULT '#6366f1',
    allowed_domains TEXT[], -- Array of allowed domains for CORS
    rate_limit_per_minute INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_widget_configs_widget_id ON widget_configs(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_configs_company_id ON widget_configs(company_id);

-- ============================================================================
-- Helper function to update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_widget_configs_updated_at ON widget_configs;
CREATE TRIGGER update_widget_configs_updated_at
    BEFORE UPDATE ON widget_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for backend API)
CREATE POLICY "Service role has full access to chat_sessions"
    ON chat_sessions FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to chat_messages"
    ON chat_messages FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to widget_configs"
    ON widget_configs FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================================
-- Sample Widget Configuration (optional)
-- ============================================================================

-- INSERT INTO widget_configs (widget_id, name, theme, system_prompt, welcome_message)
-- VALUES (
--     'default',
--     'Default Widget',
--     'glassmorphism',
--     'You are a helpful AI assistant for Syntra. Be concise and friendly.',
--     'Hi! 👋 I''m your AI assistant. How can I help you today?'
-- );
