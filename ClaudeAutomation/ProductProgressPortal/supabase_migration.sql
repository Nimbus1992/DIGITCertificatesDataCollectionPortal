-- Run this once in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/icyliohsxqhvslvxrqtt/sql/new

CREATE TABLE IF NOT EXISTS portal_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anon read/write (internal tool — no auth required)
ALTER TABLE portal_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all" ON portal_data;
CREATE POLICY "allow_all" ON portal_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
