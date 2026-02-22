/**
 * Setup API Route - Verify Supabase Tables
 * GET /api/setup - Returns status of tables
 * POST /api/setup - Verifies tables exist and provides SQL for missing ones
 *
 * Verifies all required Supabase tables for the agent store persistence layer
 * Protected by a simple secret key check for POST requests
 *
 * Usage:
 * curl http://localhost:3000/api/setup
 * curl -X POST http://localhost:3000/api/setup \
 *   -H "Content-Type: application/json" \
 *   -d '{"secret": "your-setup-secret"}'
 */

import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruiphgtxyazqlasbchiv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use environment variable for setup secret, fallback to 'dev-secret'
const SETUP_SECRET = process.env.SETUP_SECRET || 'dev-secret';

const TABLES_TO_VERIFY = [
  'scoring_results',
  'frameworks',
  'controls',
  'assessments',
  'agent_runs',
  'combined_risk_reports',
  'monitoring_alerts',
  'contact_submissions',
  'leads',
];

interface TableCheckResult {
  table: string;
  exists: boolean;
  error?: string;
}

interface SetupStatus {
  timestamp: string;
  supabaseUrl: string;
  tables: {
    existing: string[];
    missing: string[];
  };
  details: TableCheckResult[];
  creationSql?: string[];
}

/**
 * Check if a table exists by attempting a SELECT query
 */
async function checkTableExists(tableName: string): Promise<TableCheckResult> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${tableName}?limit=1`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
      }
    );

    // 200 or 206 (partial content) means table exists
    if (response.ok || response.status === 206) {
      return { table: tableName, exists: true };
    }

    // 404 means table doesn't exist
    if (response.status === 404) {
      return { table: tableName, exists: false };
    }

    // Other errors
    const errorText = await response.text();
    return {
      table: tableName,
      exists: false,
      error: `HTTP ${response.status}: ${errorText}`,
    };
  } catch (error) {
    return {
      table: tableName,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get SQL creation statements for all tables
 */
function getTableCreationSql(): string[] {
  return [
    `-- Scoring Results Table
CREATE TABLE IF NOT EXISTS scoring_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id TEXT NOT NULL UNIQUE,
  result JSONB NOT NULL,
  controls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`,

    `-- Frameworks Table
CREATE TABLE IF NOT EXISTS frameworks (
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

    `-- Controls Table
CREATE TABLE IF NOT EXISTS controls (
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

    `-- Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  framework_id TEXT NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('in-progress', 'completed', 'archived')),
  overall_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);`,

    `-- Agent Runs Table
CREATE TABLE IF NOT EXISTS agent_runs (
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

    `-- Combined Risk Reports Table
CREATE TABLE IF NOT EXISTS combined_risk_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id TEXT NOT NULL UNIQUE,
  assessment_id TEXT NOT NULL,
  report JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);`,

    `-- Monitoring Alerts Table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id TEXT NOT NULL UNIQUE,
  alert JSONB NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`,

    `-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`,

    `-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  score NUMERIC(5,2),
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`,

    `-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scoring_results_assessment_id ON scoring_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_name ON frameworks(name);
CREATE INDEX IF NOT EXISTS idx_controls_framework_id ON controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_framework_id ON assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_name ON agent_runs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_combined_risk_reports_assessment_id ON combined_risk_reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_acknowledged ON monitoring_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);`,

    `-- Enable RLS (Row Level Security) on all tables
ALTER TABLE scoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE combined_risk_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;`,

    `-- RLS Policies for authenticated users
DROP POLICY IF EXISTS "Allow read for authenticated users" ON scoring_results;
CREATE POLICY "Allow read for authenticated users" ON scoring_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for authenticated users" ON frameworks;
CREATE POLICY "Allow read for authenticated users" ON frameworks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for authenticated users" ON controls;
CREATE POLICY "Allow read for authenticated users" ON controls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for authenticated users" ON assessments;
CREATE POLICY "Allow read for authenticated users" ON assessments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for authenticated users" ON agent_runs;
CREATE POLICY "Allow read for authenticated users" ON agent_runs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for authenticated users" ON combined_risk_reports;
CREATE POLICY "Allow read for authenticated users" ON combined_risk_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for authenticated users" ON monitoring_alerts;
CREATE POLICY "Allow read for authenticated users" ON monitoring_alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read for authenticated users" ON leads;
CREATE POLICY "Allow read for authenticated users" ON leads FOR SELECT USING (true);`,
  ];
}

/**
 * Verify all required tables exist
 */
async function verifyTables(): Promise<SetupStatus> {
  const details: TableCheckResult[] = [];

  for (const tableName of TABLES_TO_VERIFY) {
    const result = await checkTableExists(tableName);
    details.push(result);
  }

  const existing = details.filter((d) => d.exists).map((d) => d.table);
  const missing = details.filter((d) => !d.exists).map((d) => d.table);

  const status: SetupStatus = {
    timestamp: new Date().toISOString(),
    supabaseUrl: SUPABASE_URL,
    tables: {
      existing,
      missing,
    },
    details,
  };

  // Only include SQL if there are missing tables
  if (missing.length > 0) {
    status.creationSql = getTableCreationSql();
  }

  return status;
}

export async function GET() {
  try {
    console.log('[Setup] Checking table status...');
    const status = await verifyTables();

    const existingCount = status.tables.existing.length;
    const missingCount = status.tables.missing.length;

    console.log(
      `[Setup] Status: ${existingCount} tables exist, ${missingCount} tables missing`
    );

    return NextResponse.json(
      {
        success: missingCount === 0,
        status,
        summary: {
          totalTables: TABLES_TO_VERIFY.length,
          existingTables: existingCount,
          missingTables: missingCount,
          allTablesReady: missingCount === 0,
        },
      },
      { status: missingCount === 0 ? 200 : 206 }
    );
  } catch (error) {
    console.error('[Setup] Error checking tables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
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

    console.log('[Setup] Verifying Supabase tables with secret authentication...');

    // Verify tables
    const status = await verifyTables();
    const existingCount = status.tables.existing.length;
    const missingCount = status.tables.missing.length;

    console.log(
      `[Setup] Verification complete: ${existingCount} existing, ${missingCount} missing`
    );

    if (missingCount > 0) {
      console.warn(
        `[Setup] Missing tables: ${status.tables.missing.join(', ')}`
      );
      console.warn('[Setup] SQL statements provided for manual creation');

      return NextResponse.json(
        {
          success: false,
          message: `${missingCount} tables are missing`,
          status,
          instructions: {
            title: 'Manual Table Creation Required',
            steps: [
              '1. Go to your Supabase dashboard',
              '2. Navigate to the SQL Editor',
              '3. Create a new query',
              '4. Copy and paste the SQL statements provided below',
              '5. Execute each statement in order',
            ],
            sqlStatements: status.creationSql,
          },
        },
        { status: 206 }
      );
    }

    console.log('[Setup] All tables verified successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'All required tables exist and are ready to use',
        status,
        summary: {
          totalTables: TABLES_TO_VERIFY.length,
          existingTables: existingCount,
          missingTables: 0,
          allTablesReady: true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Setup] Error during verification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
