-- Add missing columns to public.users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'member';

-- Sync existing data (optional but recommended)
-- Only assumes users exist in auth.users and we want to populate public.users email?
-- This part is tricky via SQL without access to auth schema easily differently.
-- But at least adding columns allows the app to Work.

-- Force schema reload so API sees new columns
NOTIFY pgrst, 'reload config';
