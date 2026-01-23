-- Database Migration for Password-Based Authentication
-- Run this in your Supabase SQL Editor

-- Update users table to support password-based auth
-- First, add new columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_password_set BOOLEAN DEFAULT FALSE;

-- Optional: Migrate existing token_hash to password_hash if needed
-- Uncomment the next line if you want to migrate existing users
-- UPDATE users SET password_hash = token_hash, is_password_set = TRUE WHERE token_hash IS NOT NULL AND password_hash IS NULL;

-- Drop old token_hash column if you want to fully migrate (be careful!)
-- ALTER TABLE users DROP COLUMN IF EXISTS token_hash;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_password_set ON users(is_password_set);

