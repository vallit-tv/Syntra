-- Migration to add persistent chat sessions and bot capabilities

-- 1. Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id),
    widget_id TEXT, -- identifier from the widget config
    user_identifier TEXT, -- hashed user ID or cookie ID
    messages JSONB DEFAULT '[]', -- Array of {role, content, timestamp}
    metadata JSONB DEFAULT '{}', -- Browser info, location, etc
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_company_id ON chat_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_identifier ON chat_sessions(user_identifier);

-- 2. Company Knowledge Base Table (Phase 3 preparation)
CREATE TABLE IF NOT EXISTS company_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    source_type TEXT NOT NULL, -- 'homepage', 'article', 'manual', 'pdf'
    source_url TEXT,
    title TEXT,
    content TEXT,
    scraped_data JSONB, -- Raw scraped data structure
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_company_id ON company_knowledge_base(company_id);

-- 3. Chat Appointments Table (Phase 4 preparation)
CREATE TABLE IF NOT EXISTS chat_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    chat_session_id UUID REFERENCES chat_sessions(id),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    purpose TEXT,
    status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_company_id ON chat_appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON chat_appointments(appointment_date);
