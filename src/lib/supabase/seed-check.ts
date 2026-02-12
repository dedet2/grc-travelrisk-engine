/**
 * Seed Check - Verify Supabase Connection and Schema
 *
 * This module provides utilities to check if Supabase is properly
 * connected and seeded with the initial schema.
 */

import { createServiceRoleClient } from './server';

export interface SupabaseConnectionStatus {
  connected: boolean;
  seeded: boolean;
  tables: string[];
  error?: string;
  missingTables?: string[];
  environment?: {
    url?: string;
    hasAnonKey?: boolean;
    hasServiceRole?: boolean;
  };
}

/**
 * Expected tables in the Supabase schema
 */
const EXPECTED_TABLES = [
  'frameworks',
  'controls',
  'assessments',
  'assessment_responses',
  'travel_advisories',
  'trip_risk_reports',
  'agent_runs',
  'audit_logs',
];

/**
 * Check Supabase connection and schema status
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  const status: SupabaseConnectionStatus = {
    connected: false,
    seeded: false,
    tables: [],
    missingTables: [],
    environment: {},
  };

  // Check environment variables
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  status.environment = {
    url: hasUrl ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined,
    hasAnonKey,
    hasServiceRole,
  };

  // Check if we have minimum required env vars
  if (!hasUrl || !hasAnonKey) {
    status.error = 'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY';
    return status;
  }

  // Try to connect to Supabase
  try {
    let client;

    // Try to use service role client if available (has full access)
    if (hasServiceRole) {
      try {
        client = await createServiceRoleClient();
      } catch (error) {
        console.warn('Service role client unavailable, falling back to connection check only');
      }
    }

    // If no service role client, we can still verify connection by checking tables
    // via information_schema (though RLS policies might restrict this)
    if (client) {
      status.connected = true;

      // Get list of tables in the public schema
      try {
        const { data: tables, error: tablesError } = await client
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .neq('table_type', 'VIEW');

        if (tablesError) {
          // This might fail due to RLS, but we know connection works
          console.warn('Could not query information_schema (may be restricted by RLS):', tablesError);

          // Try a different approach: check each expected table by querying
          console.log('Checking tables by direct query...');
          status.tables = await checkTablesDirectly(client);
        } else if (tables) {
          status.tables = tables.map((t: any) => t.table_name);
        }
      } catch (error) {
        console.warn('Error querying tables:', error);
        // Try direct approach
        status.tables = await checkTablesDirectly(client);
      }

      // Check if we have all expected tables
      const missingTables = EXPECTED_TABLES.filter((table) => !status.tables.includes(table));

      if (missingTables.length === 0) {
        status.seeded = true;
        status.missingTables = [];
      } else {
        status.seeded = false;
        status.missingTables = missingTables;
      }
    } else {
      status.error = 'Could not create Supabase client';
    }
  } catch (error: any) {
    status.connected = false;
    status.error = error?.message || String(error);
    console.error('Supabase connection check failed:', error);
  }

  return status;
}

/**
 * Attempt to check tables by direct query to each table
 */
async function checkTablesDirectly(client: any): Promise<string[]> {
  const foundTables: string[] = [];

  for (const tableName of EXPECTED_TABLES) {
    try {
      // Try a minimal select query with limit 0 to test table existence
      const { error } = await client
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(0);

      if (!error) {
        foundTables.push(tableName);
      }
    } catch (error) {
      // Table doesn't exist or is not accessible
      console.debug(`Table ${tableName} not found or not accessible:`, error);
    }
  }

  return foundTables;
}

/**
 * Check if Supabase is properly configured for production
 */
export async function checkProductionReadiness(): Promise<{
  ready: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check 1: Supabase connection
  const connectionStatus = await checkSupabaseConnection();

  if (!connectionStatus.connected) {
    issues.push('Supabase is not connected');
  }

  if (!connectionStatus.seeded) {
    issues.push(`Supabase schema is not seeded. Missing tables: ${connectionStatus.missingTables?.join(', ')}`);
  }

  // Check 2: Environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push('Missing SUPABASE_SERVICE_ROLE_KEY environment variable (needed for admin operations)');
  }

  // Check 3: Environment
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
      issues.push('Production environment is pointing to localhost Supabase');
    }

    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length === 0) {
      issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is empty in production');
    }
  } else {
    recommendations.push('Set NODE_ENV to "production" when deploying to production');
  }

  // Check 4: Table structure
  if (connectionStatus.seeded) {
    // Optionally verify table column structure here
    recommendations.push('Consider running schema validation tests to ensure column types');
  }

  return {
    ready: issues.length === 0,
    issues,
    warnings,
    recommendations,
  };
}

/**
 * Pretty-print connection status
 */
export function formatConnectionStatus(status: SupabaseConnectionStatus): string {
  const lines: string[] = [];

  lines.push('=== Supabase Connection Status ===');
  lines.push(`Connected: ${status.connected ? '✓ Yes' : '✗ No'}`);
  lines.push(`Seeded: ${status.seeded ? '✓ Yes' : '✗ No'}`);
  lines.push(`Tables found: ${status.tables.length}/${EXPECTED_TABLES.length}`);

  if (status.tables.length > 0) {
    lines.push('\nTables:');
    status.tables.forEach((table) => {
      const isExpected = EXPECTED_TABLES.includes(table);
      lines.push(`  ${isExpected ? '✓' : '○'} ${table}`);
    });
  }

  if (status.missingTables && status.missingTables.length > 0) {
    lines.push('\nMissing tables:');
    status.missingTables.forEach((table) => {
      lines.push(`  ✗ ${table}`);
    });
  }

  if (status.error) {
    lines.push(`\nError: ${status.error}`);
  }

  lines.push('\nEnvironment:');
  if (status.environment?.url) {
    lines.push(`  URL: ${status.environment.url}`);
  }
  lines.push(`  Has Anon Key: ${status.environment?.hasAnonKey ? 'Yes' : 'No'}`);
  lines.push(`  Has Service Role Key: ${status.environment?.hasServiceRole ? 'Yes' : 'No'}`);

  return lines.join('\n');
}

/**
 * Pretty-print production readiness status
 */
export function formatProductionReadiness(
  readiness: Awaited<ReturnType<typeof checkProductionReadiness>>
): string {
  const lines: string[] = [];

  lines.push('=== Production Readiness Check ===');
  lines.push(`Ready: ${readiness.ready ? '✓ Yes' : '✗ No'}`);

  if (readiness.issues.length > 0) {
    lines.push('\nIssues (must fix):');
    readiness.issues.forEach((issue) => {
      lines.push(`  ✗ ${issue}`);
    });
  }

  if (readiness.warnings.length > 0) {
    lines.push('\nWarnings:');
    readiness.warnings.forEach((warning) => {
      lines.push(`  ⚠ ${warning}`);
    });
  }

  if (readiness.recommendations.length > 0) {
    lines.push('\nRecommendations:');
    readiness.recommendations.forEach((rec) => {
      lines.push(`  ℹ ${rec}`);
    });
  }

  return lines.join('\n');
}
