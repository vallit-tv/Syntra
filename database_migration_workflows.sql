-- Migration: Add Workflows, Workflow Activations, Workflow API Keys, and Workflow Executions
-- Run this in your Supabase SQL Editor

-- Workflows table (synced from n8n, managed by admin)
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n8n_workflow_id INTEGER NOT NULL UNIQUE, -- n8n's workflow ID
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'automation', 'data-processing', 'notifications'
    is_active BOOLEAN DEFAULT TRUE, -- Admin can enable/disable
    is_public BOOLEAN DEFAULT FALSE, -- Whether users can activate it
    required_services JSONB DEFAULT '[]', -- e.g., ['notion', 'google-docs', 'openai']
    config_schema JSONB DEFAULT '{}', -- Schema for workflow-specific config
    metadata JSONB DEFAULT '{}', -- Additional workflow metadata from n8n
    created_by UUID REFERENCES users(id), -- Admin who synced it
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow activations (user activations of available workflows)
CREATE TABLE IF NOT EXISTS workflow_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}', -- User-specific workflow configuration
    last_executed_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workflow_id, user_id)
);

-- Workflow API keys (user API keys for specific workflows)
CREATE TABLE IF NOT EXISTS workflow_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_activation_id UUID NOT NULL REFERENCES workflow_activations(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL, -- 'notion', 'google-docs', 'openai', etc.
    api_key TEXT NOT NULL,
    config JSONB DEFAULT '{}', -- Service-specific configuration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions (execution logs and history)
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_activation_id UUID NOT NULL REFERENCES workflow_activations(id) ON DELETE CASCADE,
    n8n_execution_id TEXT, -- n8n's execution ID
    status TEXT NOT NULL, -- 'success', 'error', 'running', 'waiting'
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_active ON workflows(is_active, is_public);
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_n8n_id ON workflows(n8n_workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_activations_user ON workflow_activations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_activations_workflow ON workflow_activations(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_api_keys_activation ON workflow_api_keys(workflow_activation_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_activation ON workflow_executions(workflow_activation_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status, started_at);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_activations_updated_at ON workflow_activations;
CREATE TRIGGER update_workflow_activations_updated_at
    BEFORE UPDATE ON workflow_activations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_api_keys_updated_at ON workflow_api_keys;
CREATE TRIGGER update_workflow_api_keys_updated_at
    BEFORE UPDATE ON workflow_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Workflows: Admins can manage all, users can read public ones
DROP POLICY IF EXISTS "Users can read public workflows" ON workflows;
CREATE POLICY "Users can read public workflows"
    ON workflows FOR SELECT
    USING (is_public = TRUE OR created_by = auth.uid()::text);

-- Workflow activations: Users can manage their own
DROP POLICY IF EXISTS "Users can manage own activations" ON workflow_activations;
CREATE POLICY "Users can manage own activations"
    ON workflow_activations FOR ALL
    USING (auth.uid()::text = user_id::text);

-- Workflow API keys: Users can manage their own
DROP POLICY IF EXISTS "Users can manage own workflow api keys" ON workflow_api_keys;
CREATE POLICY "Users can manage own workflow api keys"
    ON workflow_api_keys FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM workflow_activations 
            WHERE workflow_activations.id = workflow_api_keys.workflow_activation_id 
            AND workflow_activations.user_id::text = auth.uid()::text
        )
    );

-- Workflow executions: Users can view their own
DROP POLICY IF EXISTS "Users can view own executions" ON workflow_executions;
CREATE POLICY "Users can view own executions"
    ON workflow_executions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workflow_activations 
            WHERE workflow_activations.id = workflow_executions.workflow_activation_id 
            AND workflow_activations.user_id::text = auth.uid()::text
        )
    );

-- Comments
COMMENT ON TABLE workflows IS 'Workflows synced from n8n, managed by admins';
COMMENT ON TABLE workflow_activations IS 'User activations of available workflows';
COMMENT ON TABLE workflow_api_keys IS 'User API keys for workflow-specific services';
COMMENT ON TABLE workflow_executions IS 'Workflow execution logs and history';

