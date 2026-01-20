-- Migration: Admin Setup and Company Linkage
-- Run this in Supabase SQL Editor

-- 1. Ensure Companies Table Exists (Idempotent)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure Users Table has company_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_id') THEN
        ALTER TABLE users ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Create 'Syntra' Company if it doesn't exist
INSERT INTO companies (name, slug)
VALUES ('Syntra', 'syntra')
ON CONFLICT (slug) DO NOTHING;

-- 4. Function to automatically create public.users record on auth.users insert
--    This attempts to extract company_id from user_metadata if present
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    target_company_id UUID;
BEGIN
    -- Try to get company_id from metadata
    target_company_id := (new.raw_user_meta_data->>'company_id')::UUID;

    INSERT INTO public.users (id, name, company_id, created_at, updated_at)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email), -- Fallback to email as name
        target_company_id,
        new.created_at,
        new.created_at
    )
    ON CONFLICT (id) DO UPDATE
    SET
        name = EXCLUDED.name,
        company_id = EXCLUDED.company_id,
        updated_at = EXCLUDED.updated_at;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for New User Creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Verification
DO $$
DECLARE
    syntra_id UUID;
BEGIN
    SELECT id INTO syntra_id FROM companies WHERE slug = 'syntra';
    IF syntra_id IS NOT NULL THEN
        RAISE NOTICE '✅ Syntra company exists with ID: %', syntra_id;
    ELSE
        RAISE EXCEPTION '❌ Syntra company was not created';
    END IF;
END $$;
