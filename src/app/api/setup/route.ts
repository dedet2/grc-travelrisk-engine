/**
 * Setup API Route - Initialize Supabase Tables
 * POST /api/setup
 *
 * Creates all required Supabase tables for the agent store persistence layer
 * Protected by a simple secret key check
 *
 * Usage:
 * curl -X POST http://localhost:3000/api/setup \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret": "your-setup-secret"}'
 */

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruiphgtxyazqlasbchiv.supabase.co';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBoZ3R4eWF6cWxhc2JjaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM3OTQ4MywiZXhwIjoyMDg2OTU1NDgzfQ.8lkVo2g2POIPyJ1CcfMn6CJyCceAis6jyph0Mz2z3Pc';

// Use environment variable for setup secret, fallback to 'dev-secret'
const SETUP_SECRET = process.env.SETUP_SECRET || 'dev-secret';

/**
 * Execute raw SQL via Supabase
 */
async function executeSql(sql: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create tables via SQL
 */
async function createTables() {
  const tables = [
    // Scoring Results Table
    `CREATE TABLE IF NOT EXISTS scoring_results (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      assessment_id TEXT NOT NULL UNIQUE,
      result JSONB NOT NULL,
      controls JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );`,

    // Frameworks Table
    `CREATE TABLE IF NOT EXISTS frameworks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      source_url TEXT,
      status TEXT CHECK (status IN ('draft', 'published', 'archived')),
      control_count INTEGER DEFAULT 0,
      categories JSONB,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );`,

    // Controls Table
    `CREATE TABLE IF NOT EXISTS controls (
      id TEXT PRIMARY KEY,
      framework_id TEXT NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
      control_id_str TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      control_type TEXT CHECK (control_type IN ('technical', 'operational', 'management')),
      criticality TEXT CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      UNIQUE(framework_id, control_id_str)
    );`,

    // Assessments Table
    `CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      framework_id TEXT NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      status TEXT CHECK (status IN ('in-progress', 'completed', 'archived')),
      overall_score NUMERIC(5,2),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL
    );`,

    // Agent Runs Table
    `CREATE TABLE IF NOT EXISTS agent_runs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      agent_name TEXT NOT NULL,
      agent_id TEXT,
      run_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      result JSONB,
      error TEXT,
      started_at TIMESTAMP WITH TIME ZONE,
      completed_at TIMESTAMP WITH TIME ZONE,
      duration_ms INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );`,

    // Combined Risk Reports Table
    `CREATE TABLE IF NOT EXISTS combined_risk_reports (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      report_id TEXT NOT NULL UNIQUE,
      assessment_id TEXT NOT NULL,
      report JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL
    );`,

    // Monitoring Alerts Table
    `CREATE TABLE IF NOT EXISTS monitoring_alerts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      alert_id TEXT NOT NULL UNIQUE,
      alert JSONB NOT NULL,
      acknowledged BOOLEAN DEFAULT false,
      acknowledged_at TIMESTAMP WITH TIME ZONE,
      acknowledged_by TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );`,

    // Contact Submissions Table
    `CREATE TABLE IF NOT EXISTS contact_submissions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT NOT NULL,
      name TEXT,
      message TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );`,

    // Leads Table
    `CREATE TABLE IF NOT EXISTS leads (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      company TEXT,
      score NUMERIC(5,2),
      status TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );`,
  ];

  const results = [];

  for (const sql of tables) {
    const result = await executeSql(sql);
    results.push(result);
    if (!result.success) {
      console.error('SQL Error:', result.error);
    }
  }

  return results;
}

/**
 * Create indexes for better query performance
 */
async function createIndexes() {
  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_scoring_results_assessment_id ON scoring_results(assessment_id);`,
    `CREATE INDEX IF NOT EXISTS idx_frameworks_name ON frameworks(name);`,
    `CREATE INDEX IF NOT EXISTS idx_controls_framework_id ON controls(framework_id);`,
    `CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_assessments_framework_id ON assessments(framework_id);`,
    `CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_name ON agent_runs(agent_name);`,
    `CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);`,
    `CREATE INDEX IF NOT EXISTS idx_combined_risk_reports_assessment_id ON combined_risk_reports(assessment_id);`,
    `CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_acknowledged ON monitoring_alerts(acknowledged);`,
    `CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);`,
  ];

  const results = [];

  for (const sql of indexes) {
    const result = await executeSql(sql);
    results.push(result);
  }

  return results;
}

/**
 * Setup RLS (Row Level Security) policies
 */
async function setupRLSPolicies() {
  const policies = [
    // Enable RLS on all tables
    `ALTER TABLE scoring_results ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE controls ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE combined_risk_reports ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`,

    // Allow service role full access (no policies restrict it)
    // Public policies for reading data
    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON scoring_results;`,
    `CREATE POLICY "Allow read for authenticated users" ON scoring_results
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON frameworks;`,
    `CREATE POLICY "Allow read for authenticated users" ON frameworks
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON controls;`,
    `CREATE POLICY "Allow read for authenticated users" ON controls
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON assessments;`,
    `CREATE POLICY "Allow read for authenticated users" ON assessments
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON agent_runs;`,
    `CREATE POLICY "Allow read for authenticated users" ON agent_runs
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON combined_risk_reports;`,
    `CREATE POLICY "Allow read for authenticated users" ON combined_risk_reports
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON monitoring_alerts;`,
    `CREATE POLICY "Allow read for authenticated users" ON monitoring_alerts
      FOR SELECT USING (true);`,

    `DROP POLICY IF EXISTS "Allow read for authenticated users" ON leads;`,
    `CREATE POLICY "Allow read for authenticated users" ON leads
      FOR SELECT USING (true);`,
  ];

  const results = [];

  for (const sql of policies) {
    const result = await executeSql(sql);
    results.push(result);
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Verify setup secret
    if (secret !== SETUP_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid setup secret' },
        { status: 401 }
      );
    }

    console.log('[Setup] Starting Supabase table initialization...');

    // Create tables
    console.log('[Setup] Creating tables...');
    const tableResults = await createTables();

    // Create indexes
    console.log('[Setup] Creating indexes...');
    const indexResults = await createIndexes();

    // Setup RLS policies
    console.log('[Setup] Setting up RLS policies...');
    const rlsResults = await setupRLSPolicies();

    const allResults = [...tableResults, ...indexResults, ...rlsResults];
    const failedResults = allResults.filter((r) => !r.success);

    if (failedResults.length > 0) {
      console.warn('[Setup] Some operations failed:', failedResults);
      return NextResponse.json(
        {
          success: false,
          message: `${failedResults.length} operations failed`,
          details: failedResults,
        },
        { status: 500 }
      );
    }

    console.log('[Setup] Supabase setup completed successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Supabase tables created successfully',
        tablesCreated: tableResults.length,
        indexesCreated: indexResults.length,
        policiesCreated: rlsResults.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Setup] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Setup endpoint - POST with secret parameter to initialize Supabase tables',
      example: {
        method: 'POST',
        url: '/api/setup',
        body: { secret: 'your-setup-secret' },
      },
    },
    { status: 200 }
  );
}
