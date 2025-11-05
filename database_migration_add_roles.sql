-- Migration: Add role support to users table
-- Run this in your Supabase SQL Editor

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'ceo'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'user' role if null
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Make Theo an admin/CEO (if exists)
UPDATE users SET role = 'ceo' WHERE name = 'Theo';

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: user, admin, or ceo';

