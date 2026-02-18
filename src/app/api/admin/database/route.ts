import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateSchema } from "@/lib/supabase/schema-validator";

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  return await handleDatabaseGet(request);
}

export async function POST(request: NextRequest) {
  return await handleDatabasePost(request);
}

async function handleDatabaseGet(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "health") {
    return await getHealthStatus();
  }

  if (action === "tables") {
    return await getTableInfo();
  }

  if (action === "validate") {
    return await validateDatabase();
  }

  if (action === "stats") {
    return await getDatabaseStats();
  }

  return NextResponse.json({
    status: "error",
    message: "Unknown action. Valid actions: health, tables, validate, stats",
  });
}

async function handleDatabasePost(request: NextRequest) {
  const body = await request.json();
  const action = body.action;

  if (action === "reset") {
    return await resetDatabase();
  }

  if (action === "seed") {
    return await seedDatabase();
  }

  return NextResponse.json({
    status: "error",
    message: "Unknown action. Valid actions: reset, seed",
  });
}

async function getHealthStatus() {
  const adminSupabase = getAdminClient();
  const { data, error } = await adminSupabase
    .from("organizations")
    .select("count")
    .limit(1);

  if (error) {
    return NextResponse.json({
      status: "error",
      connected: false,
      error: error.message,
    });
  }

  return NextResponse.json({
    status: "ok",
    connected: true,
    timestamp: new Date().toISOString(),
  });
}

async function getTableInfo() {
  const adminSupabase = getAdminClient();
  const tables = [
    "users",
    "organizations",
    "org_members",
    "frameworks",
    "controls",
    "assessments",
    "vendors",
    "incidents",
    "travel_advisories",
    "travel_trips",
    "agent_runs",
    "audit_logs",
    "compliance_gaps",
    "policies",
    "reports",
    "notifications",
    "integrations",
    "workflows",
    "regulatory_events",
    "leads",
    "deals",
  ];

  const tableInfo: { [key: string]: { count: number; exists: boolean } } = {};

  for (const table of tables) {
    const { count, error } = await adminSupabase
      .from(table)
      .select("*", { count: "exact", head: true });

    tableInfo[table] = {
      count: count || 0,
      exists: !error,
    };
  }

  return NextResponse.json({
    status: "ok",
    tables: tableInfo,
    totalTables: tables.length,
    timestamp: new Date().toISOString(),
  });
}

async function validateDatabase() {
  const report = await validateSchema();

  return NextResponse.json({
    status: "ok",
    validation: report,
  });
}

async function getDatabaseStats() {
  const adminSupabase = getAdminClient();
  const tables = [
    "users",
    "organizations",
    "org_members",
    "frameworks",
    "controls",
    "assessments",
    "vendors",
    "incidents",
    "travel_advisories",
    "travel_trips",
    "agent_runs",
    "audit_logs",
    "compliance_gaps",
    "policies",
    "reports",
    "notifications",
    "integrations",
    "workflows",
    "regulatory_events",
    "leads",
    "deals",
  ];

  const stats: {
    [key: string]: {
      rows: number;
      estimatedSize?: string;
    };
  } = {};

  let totalRows = 0;

  for (const table of tables) {
    const { count, error } = await adminSupabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (!error && count !== null) {
      stats[table] = {
        rows: count,
      };
      totalRows += count;
    }
  }

  return NextResponse.json({
    status: "ok",
    stats,
    totalRows,
    timestamp: new Date().toISOString(),
  });
}

async function resetDatabase() {
  const adminSupabase = getAdminClient();
  const resetQueries = [
    "DELETE FROM public.deals CASCADE;",
    "DELETE FROM public.leads CASCADE;",
    "DELETE FROM public.regulatory_events CASCADE;",
    "DELETE FROM public.workflows CASCADE;",
    "DELETE FROM public.integrations CASCADE;",
    "DELETE FROM public.notifications CASCADE;",
    "DELETE FROM public.reports CASCADE;",
    "DELETE FROM public.policies CASCADE;",
    "DELETE FROM public.compliance_gaps CASCADE;",
    "DELETE FROM public.audit_logs CASCADE;",
    "DELETE FROM public.agent_runs CASCADE;",
    "DELETE FROM public.travel_trips CASCADE;",
    "DELETE FROM public.travel_advisories CASCADE;",
    "DELETE FROM public.incidents CASCADE;",
    "DELETE FROM public.vendors CASCADE;",
    "DELETE FROM public.assessments CASCADE;",
    "DELETE FROM public.controls CASCADE;",
    "DELETE FROM public.frameworks CASCADE;",
    "DELETE FROM public.org_members CASCADE;",
    "DELETE FROM public.organizations CASCADE;",
    "DELETE FROM public.users CASCADE;",
  ];

  const results = [];

  for (const query of resetQueries) {
    const { error } = await adminSupabase.rpc("exec_sql", {
      sql: query,
    });

    results.push({
      query,
      success: !error,
      error: error?.message,
    });
  }

  return NextResponse.json({
    status: "ok",
    message: "Database reset completed",
    results,
    timestamp: new Date().toISOString(),
  });
}

async function seedDatabase() {
  const adminSupabase = getAdminClient();
  const orgId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const userId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

  const seedResults = [];

  const { error: orgError } = await adminSupabase.from("organizations").insert([
    {
      id: orgId,
      name: "Incluu Global",
      slug: "incluu-global",
      plan: "enterprise",
      billing_email: "dede@incluu.us",
    },
  ]);

  seedResults.push({
    table: "organizations",
    success: !orgError,
    error: orgError?.message,
  });

  const { error: userError } = await adminSupabase.from("users").insert([
    {
      id: userId,
      clerk_id: "clerk_dede_001",
      email: "dede@incluu.us",
      name: "Dr. Dédé",
      role: "admin",
    },
  ]);

  seedResults.push({
    table: "users",
    success: !userError,
    error: userError?.message,
  });

  const { error: memberError } = await adminSupabase
    .from("org_members")
    .insert([
      {
        org_id: orgId,
        user_id: userId,
        role: "owner",
        joined_at: new Date().toISOString(),
      },
    ]);

  seedResults.push({
    table: "org_members",
    success: !memberError,
    error: memberError?.message,
  });

  return NextResponse.json({
    status: "ok",
    message: "Database seeding completed",
    results: seedResults,
    timestamp: new Date().toISOString(),
  });
}
