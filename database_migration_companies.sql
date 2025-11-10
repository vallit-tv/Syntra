-- Migration: Add Companies and Multi-Company Support
-- Run this in your Supabase SQL Editor

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add company_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Add company_id to workflow_activations
ALTER TABLE workflow_activations ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_workflow_activations_company ON workflow_activations(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Trigger for companies updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Admins can see all companies, CEOs/Workers can see only their company
DROP POLICY IF EXISTS "Users can read own company" ON companies;
CREATE POLICY "Users can read own company"
    ON companies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.company_id = companies.id 
            AND users.id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Only admins can insert/update/delete companies
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;
CREATE POLICY "Admins can manage companies"
    ON companies FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Update workflow_activations to be company-specific
-- Drop old unique constraint
ALTER TABLE workflow_activations DROP CONSTRAINT IF EXISTS workflow_activations_workflow_id_user_id_key;

-- Add new unique constraint for company + workflow
CREATE UNIQUE INDEX IF NOT EXISTS workflow_activations_company_workflow_unique 
    ON workflow_activations(company_id, workflow_id) 
    WHERE company_id IS NOT NULL;

-- Update RLS policy for workflow_activations to be company-aware
DROP POLICY IF EXISTS "Users can manage own activations" ON workflow_activations;
CREATE POLICY "Users can manage own activations"
    ON workflow_activations FOR ALL
    USING (
        -- Admins can see all
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
        OR
        -- Users can see their company's activations
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.company_id = workflow_activations.company_id
        )
    );

-- Comments
COMMENT ON TABLE companies IS 'Companies/Organizations in the system';
COMMENT ON COLUMN users.company_id IS 'Company the user belongs to (NULL for admins)';
COMMENT ON COLUMN workflow_activations.company_id IS 'Company that activated this workflow';

