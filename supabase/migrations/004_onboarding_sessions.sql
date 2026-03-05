-- Migration 004: Create onboarding_sessions table
-- Required by: /app/onboarding/page.tsx (MVP 9 - Platform Onboarding Wizard)
-- Source: COWORK-LAUNCH-GUIDE.md Step 1

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name text NOT NULL,
  systems jsonb DEFAULT '[]',
  apis jsonb DEFAULT '[]',
  frameworks jsonb DEFAULT '[]',
  invites jsonb DEFAULT '[]',
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON onboarding_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read" ON onboarding_sessions
  FOR SELECT USING (true);

-- Add index for faster queries by status and creation date
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_created ON onboarding_sessions(created_at DESC);
