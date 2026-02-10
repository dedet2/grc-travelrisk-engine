-- Create frameworks table
CREATE TABLE public.frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create controls table
CREATE TABLE public.controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  control_id_str TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  control_type TEXT NOT NULL CHECK (control_type IN ('technical', 'operational', 'management')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'archived')),
  overall_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment_responses table
CREATE TABLE public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  control_id UUID NOT NULL REFERENCES public.controls(id) ON DELETE RESTRICT,
  response TEXT NOT NULL CHECK (response IN ('implemented', 'partially-implemented', 'not-implemented')),
  evidence TEXT,
  score NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel_advisories table
CREATE TABLE public.travel_advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  advisory_level INTEGER NOT NULL CHECK (advisory_level BETWEEN 1 AND 4),
  description TEXT,
  source TEXT NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create trip_risk_reports table
CREATE TABLE public.trip_risk_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  destination_country TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  grc_score NUMERIC NOT NULL,
  travel_score NUMERIC NOT NULL,
  combined_score NUMERIC NOT NULL,
  report_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_runs table
CREATE TABLE public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  workflow TEXT NOT NULL,
  task_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  latency_ms INTEGER NOT NULL,
  tasks_completed INTEGER NOT NULL,
  total_tasks INTEGER NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd NUMERIC NOT NULL,
  error_message TEXT,
  autonomy_level TEXT NOT NULL CHECK (autonomy_level IN ('low', 'medium', 'high')),
  human_reviewed BOOLEAN DEFAULT FALSE,
  output_in_range BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_frameworks_status ON public.frameworks(status);
CREATE INDEX idx_controls_framework_id ON public.controls(framework_id);
CREATE INDEX idx_controls_category ON public.controls(category);
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_framework_id ON public.assessments(framework_id);
CREATE INDEX idx_assessments_status ON public.assessments(status);
CREATE INDEX idx_assessment_responses_assessment_id ON public.assessment_responses(assessment_id);
CREATE INDEX idx_assessment_responses_control_id ON public.assessment_responses(control_id);
CREATE INDEX idx_travel_advisories_country_code ON public.travel_advisories(country_code);
CREATE INDEX idx_trip_risk_reports_user_id ON public.trip_risk_reports(user_id);
CREATE INDEX idx_trip_risk_reports_created_at ON public.trip_risk_reports(created_at);
CREATE INDEX idx_agent_runs_status ON public.agent_runs(status);
CREATE INDEX idx_agent_runs_created_at ON public.agent_runs(created_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_risk_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Frameworks: public read, authenticated create
CREATE POLICY "frameworks_select" ON public.frameworks
  FOR SELECT USING (true);

-- Assessments: users can only see their own
CREATE POLICY "assessments_select" ON public.assessments
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "assessments_insert" ON public.assessments
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "assessments_update" ON public.assessments
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Assessment responses: linked to user assessments
CREATE POLICY "assessment_responses_select" ON public.assessment_responses
  FOR SELECT USING (
    assessment_id IN (
      SELECT id FROM public.assessments
      WHERE user_id = auth.jwt() ->> 'sub'
    )
  );

-- Trip risk reports: users can only see their own
CREATE POLICY "trip_risk_reports_select" ON public.trip_risk_reports
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "trip_risk_reports_insert" ON public.trip_risk_reports
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Audit logs: read access for admins only, insert for service role
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (false); -- Admins only

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_frameworks_updated_at BEFORE UPDATE ON public.frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.frameworks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.assessment_responses TO authenticated;
GRANT SELECT ON public.travel_advisories TO anon, authenticated;
GRANT SELECT, INSERT ON public.trip_risk_reports TO authenticated;
GRANT SELECT ON public.agent_runs TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated, service_role;
