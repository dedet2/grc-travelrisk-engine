-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization ID
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
SELECT org_id
FROM public.org_members
WHERE user_id = auth.uid()
LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Organizations table policies
CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Org members policies
CREATE POLICY "org_members_select" ON public.org_members
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "org_members_insert" ON public.org_members
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "org_members_update" ON public.org_members
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Frameworks table policies
CREATE POLICY "frameworks_select" ON public.frameworks
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "frameworks_insert" ON public.frameworks
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "frameworks_update" ON public.frameworks
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "frameworks_delete" ON public.frameworks
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Controls table policies
CREATE POLICY "controls_select" ON public.controls
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "controls_insert" ON public.controls
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "controls_update" ON public.controls
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "controls_delete" ON public.controls
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Assessments table policies
CREATE POLICY "assessments_select" ON public.assessments
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "assessments_insert" ON public.assessments
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "assessments_update" ON public.assessments
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "assessments_delete" ON public.assessments
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Vendors table policies
CREATE POLICY "vendors_select" ON public.vendors
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "vendors_insert" ON public.vendors
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "vendors_update" ON public.vendors
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "vendors_delete" ON public.vendors
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Incidents table policies
CREATE POLICY "incidents_select" ON public.incidents
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "incidents_insert" ON public.incidents
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "incidents_update" ON public.incidents
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "incidents_delete" ON public.incidents
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Travel advisories table policies (public read)
CREATE POLICY "travel_advisories_select" ON public.travel_advisories
  FOR SELECT USING (true);

-- Travel trips table policies
CREATE POLICY "travel_trips_select" ON public.travel_trips
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    ) OR traveler_id = auth.uid()
  );

CREATE POLICY "travel_trips_insert" ON public.travel_trips
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "travel_trips_update" ON public.travel_trips
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    ) OR traveler_id = auth.uid()
  );

CREATE POLICY "travel_trips_delete" ON public.travel_trips
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Agent runs table policies
CREATE POLICY "agent_runs_select" ON public.agent_runs
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "agent_runs_insert" ON public.agent_runs
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Audit logs table policies
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Compliance gaps table policies
CREATE POLICY "compliance_gaps_select" ON public.compliance_gaps
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "compliance_gaps_insert" ON public.compliance_gaps
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "compliance_gaps_update" ON public.compliance_gaps
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "compliance_gaps_delete" ON public.compliance_gaps
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Policies table policies
CREATE POLICY "policies_select" ON public.policies
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "policies_insert" ON public.policies
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "policies_update" ON public.policies
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "policies_delete" ON public.policies
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Reports table policies
CREATE POLICY "reports_select" ON public.reports
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "reports_delete" ON public.reports
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Notifications table policies
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Integrations table policies
CREATE POLICY "integrations_select" ON public.integrations
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "integrations_insert" ON public.integrations
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "integrations_update" ON public.integrations
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "integrations_delete" ON public.integrations
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Workflows table policies
CREATE POLICY "workflows_select" ON public.workflows
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workflows_insert" ON public.workflows
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workflows_update" ON public.workflows
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workflows_delete" ON public.workflows
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Regulatory events table policies
CREATE POLICY "regulatory_events_select" ON public.regulatory_events
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "regulatory_events_insert" ON public.regulatory_events
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "regulatory_events_update" ON public.regulatory_events
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "regulatory_events_delete" ON public.regulatory_events
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Leads table policies
CREATE POLICY "leads_select" ON public.leads
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "leads_insert" ON public.leads
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "leads_update" ON public.leads
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "leads_delete" ON public.leads
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Deals table policies
CREATE POLICY "deals_select" ON public.deals
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "deals_insert" ON public.deals
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "deals_update" ON public.deals
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "deals_delete" ON public.deals
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
    )
  );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.frameworks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.controls TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incidents TO authenticated;
GRANT SELECT ON public.travel_advisories TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.travel_trips TO authenticated;
GRANT SELECT, INSERT ON public.agent_runs TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_gaps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policies TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.regulatory_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
