-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create notion_events table
CREATE TABLE IF NOT EXISTS notion_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  page_id text NOT NULL,
  received_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notion_events ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow service_role access
CREATE POLICY "Only service_role can access notion_events" ON notion_events
  FOR ALL USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notion_events_page_id ON notion_events(page_id);
CREATE INDEX IF NOT EXISTS idx_notion_events_type ON notion_events(type);
CREATE INDEX IF NOT EXISTS idx_notion_events_received_at ON notion_events(received_at);
