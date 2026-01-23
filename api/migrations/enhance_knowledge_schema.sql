-- Run this in your Supabase SQL Editor to enhance the knowledge base table

ALTER TABLE company_knowledge_base 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS type text DEFAULT 'text',
ADD COLUMN IF NOT EXISTS description text;

-- Optional: Enable vector extension if you plan to use semantic search
-- create extension if not exists vector;
-- ALTER TABLE company_knowledge_base ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON company_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON company_knowledge_base USING GIN(tags);
