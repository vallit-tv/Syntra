-- Create company_knowledge_base table
CREATE TABLE IF NOT EXISTS public.company_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    source_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_company_knowledge_base_company_id ON public.company_knowledge_base(company_id);

-- Enable RLS
ALTER TABLE public.company_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for now as we don't have auth context in script easily, but adhering to general rules)
-- Allow read access to everyone (public knowledge base logic) or restricted? 
-- The bot script runs with service key usually (bypassing RLS), or anon key. 
-- If anon, we need policies.
CREATE POLICY "Enable read access for all users" ON public.company_knowledge_base FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.company_knowledge_base FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Enable update for authenticated users only" ON public.company_knowledge_base FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Enable delete for authenticated users only" ON public.company_knowledge_base FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
