-- Complete Supabase Schema for Syntra AI Agent Platform
-- This extends the existing notion_events table and adds all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE workflow_run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE integration_type AS ENUM ('notion', 'openai', 'webhook', 'api_key');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL DEFAULT '{}',
  status workflow_status DEFAULT 'draft',
  trigger_type TEXT NOT NULL, -- 'notion', 'webhook', 'schedule', 'manual'
  trigger_config JSONB DEFAULT '{}',
  is_template BOOLEAN DEFAULT FALSE,
  template_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow runs table (execution history)
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status workflow_run_status DEFAULT 'pending',
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,
  execution_time_ms INTEGER,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table (user API keys for integrations)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type integration_type NOT NULL,
  encrypted_key TEXT NOT NULL, -- Encrypted API key
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events table (tracking user actions)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notion pages table (cached Notion data)
CREATE TABLE IF NOT EXISTS public.notion_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  notion_page_id TEXT UNIQUE NOT NULL,
  notion_database_id TEXT,
  title TEXT,
  content JSONB DEFAULT '{}',
  properties JSONB DEFAULT '{}',
  last_analyzed_at TIMESTAMPTZ,
  analysis_result JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend existing notion_events table
ALTER TABLE public.notion_events ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notion_events ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.notion_events ADD COLUMN IF NOT EXISTS workflow_triggered BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON public.workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON public.workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user_id ON public.workflow_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON public.workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_created_at ON public.workflow_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_type ON public.api_keys(type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_notion_pages_user_id ON public.notion_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_notion_pages_notion_page_id ON public.notion_pages(notion_page_id);
CREATE INDEX IF NOT EXISTS idx_notion_events_user_id ON public.notion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_notion_events_processed ON public.notion_events(processed);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notion_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for workflows
CREATE POLICY "Users can view own workflows" ON public.workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows" ON public.workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows" ON public.workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows" ON public.workflows
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workflow_runs
CREATE POLICY "Users can view own workflow runs" ON public.workflow_runs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflow runs" ON public.workflow_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for api_keys
CREATE POLICY "Users can view own API keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for analytics_events
CREATE POLICY "Users can view own analytics events" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notion_pages
CREATE POLICY "Users can view own notion pages" ON public.notion_pages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notion pages" ON public.notion_pages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notion pages" ON public.notion_pages
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for notion_events (updated)
DROP POLICY IF EXISTS "Only service_role can access notion_events" ON public.notion_events;
CREATE POLICY "Users can view own notion events" ON public.notion_events
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage notion events" ON public.notion_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notion_pages_updated_at
  BEFORE UPDATE ON public.notion_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION public.get_user_analytics_summary(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_workflows', COUNT(*),
    'active_workflows', COUNT(*) FILTER (WHERE status = 'active'),
    'total_runs', (SELECT COUNT(*) FROM public.workflow_runs WHERE user_id = user_uuid),
    'successful_runs', (SELECT COUNT(*) FROM public.workflow_runs WHERE user_id = user_uuid AND status = 'completed'),
    'total_cost', (SELECT COALESCE(SUM(cost_usd), 0) FROM public.workflow_runs WHERE user_id = user_uuid)
  ) INTO result
  FROM public.workflows
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get workflow execution stats
CREATE OR REPLACE FUNCTION public.get_workflow_stats(workflow_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_runs', COUNT(*),
    'successful_runs', COUNT(*) FILTER (WHERE status = 'completed'),
    'failed_runs', COUNT(*) FILTER (WHERE status = 'failed'),
    'avg_execution_time', AVG(execution_time_ms),
    'total_cost', COALESCE(SUM(cost_usd), 0),
    'last_run', MAX(created_at)
  ) INTO result
  FROM public.workflow_runs
  WHERE workflow_id = workflow_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
