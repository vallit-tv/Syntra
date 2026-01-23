-- Create chat_appointments table
CREATE TABLE IF NOT EXISTS public.chat_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    chat_session_id TEXT, -- Can be UUID or string key
    customer_name TEXT,
    customer_email TEXT,
    appointment_date TEXT,
    purpose TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_appointments_company_id ON public.chat_appointments(company_id);

-- RLS
ALTER TABLE public.chat_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.chat_appointments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.chat_appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.chat_appointments FOR UPDATE USING (true);
