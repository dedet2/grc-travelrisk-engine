import { createClient } from "@supabase/supabase-js";

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
}

interface TableSchema {
  name: string;
  columns: ColumnInfo[];
}

interface ValidationResult {
  table: string;
  exists: boolean;
  columnCount: number;
  missingColumns?: string[];
  typeErrors?: { column: string; expected: string; actual: string }[];
}

interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
}

interface HealthReport {
  timestamp: string;
  databaseConnected: boolean;
  tablesValidated: number;
  tablesOk: number;
  validationErrors: ValidationResult[];
  indexStatus: IndexInfo[];
  totalRows: { [key: string]: number };
  summary: string;
}

const EXPECTED_SCHEMA: { [key: string]: { [key: string]: string } } = {
  users: {
    id: "uuid",
    clerk_id: "text",
    email: "text",
    name: "text",
    role: "text",
    avatar_url: "text",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  organizations: {
    id: "uuid",
    name: "text",
    slug: "text",
    plan: "text",
    billing_email: "text",
    stripe_customer_id: "text",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  org_members: {
    org_id: "uuid",
    user_id: "uuid",
    role: "text",
    invited_at: "timestamp with time zone",
    joined_at: "timestamp with time zone",
  },
  frameworks: {
    id: "uuid",
    org_id: "uuid",
    name: "text",
    version: "text",
    description: "text",
    category: "text",
    control_count: "integer",
    compliance_score: "numeric",
    status: "text",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  controls: {
    id: "uuid",
    framework_id: "uuid",
    org_id: "uuid",
    control_number: "text",
    title: "text",
    description: "text",
    status: "text",
    evidence_count: "integer",
    last_assessed: "timestamp with time zone",
    owner_id: "uuid",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  assessments: {
    id: "uuid",
    org_id: "uuid",
    framework_id: "uuid",
    title: "text",
    status: "text",
    assigned_to: "uuid",
    score: "numeric",
    started_at: "timestamp with time zone",
    completed_at: "timestamp with time zone",
    due_date: "date",
    findings: "jsonb",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  vendors: {
    id: "uuid",
    org_id: "uuid",
    name: "text",
    category: "text",
    risk_tier: "text",
    risk_score: "numeric",
    contract_value: "numeric",
    contract_expiry: "date",
    status: "text",
    last_assessed: "timestamp with time zone",
    data_access_level: "text",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  incidents: {
    id: "uuid",
    org_id: "uuid",
    title: "text",
    description: "text",
    severity: "text",
    status: "text",
    reported_by: "uuid",
    assigned_to: "uuid",
    reported_at: "timestamp with time zone",
    resolved_at: "timestamp with time zone",
    root_cause: "text",
    remediation: "text",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  travel_advisories: {
    id: "uuid",
    country_code: "character",
    country_name: "text",
    risk_level: "text",
    risk_score: "numeric",
    advisory_text: "text",
    last_updated: "timestamp with time zone",
    source: "text",
    created_at: "timestamp with time zone",
  },
  travel_trips: {
    id: "uuid",
    org_id: "uuid",
    traveler_id: "uuid",
    destination_country: "character",
    departure_date: "date",
    return_date: "date",
    purpose: "text",
    risk_score: "numeric",
    status: "text",
    approval_status: "text",
    approved_by: "uuid",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  agent_runs: {
    id: "uuid",
    org_id: "uuid",
    agent_id: "text",
    agent_name: "text",
    category: "text",
    status: "text",
    started_at: "timestamp with time zone",
    completed_at: "timestamp with time zone",
    duration_ms: "integer",
    result: "jsonb",
    error: "text",
    triggered_by: "text",
    created_at: "timestamp with time zone",
  },
  audit_logs: {
    id: "uuid",
    org_id: "uuid",
    user_id: "uuid",
    action: "text",
    entity_type: "text",
    entity_id: "text",
    details: "jsonb",
    ip_address: "inet",
    severity: "text",
    created_at: "timestamp with time zone",
  },
  compliance_gaps: {
    id: "uuid",
    org_id: "uuid",
    framework_id: "uuid",
    control_id: "uuid",
    gap_description: "text",
    severity: "text",
    status: "text",
    remediation_plan: "text",
    due_date: "date",
    assigned_to: "uuid",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  policies: {
    id: "uuid",
    org_id: "uuid",
    title: "text",
    description: "text",
    version: "text",
    status: "text",
    framework_mappings: "jsonb",
    owner_id: "uuid",
    effective_date: "date",
    review_date: "date",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  reports: {
    id: "uuid",
    org_id: "uuid",
    type: "text",
    title: "text",
    generated_by: "uuid",
    data: "jsonb",
    format: "text",
    created_at: "timestamp with time zone",
  },
  notifications: {
    id: "uuid",
    org_id: "uuid",
    user_id: "uuid",
    type: "text",
    title: "text",
    message: "text",
    severity: "text",
    read: "boolean",
    action_url: "text",
    created_at: "timestamp with time zone",
  },
  integrations: {
    id: "uuid",
    org_id: "uuid",
    provider: "text",
    status: "text",
    config: "jsonb",
    last_sync: "timestamp with time zone",
    error_message: "text",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  workflows: {
    id: "uuid",
    org_id: "uuid",
    name: "text",
    description: "text",
    trigger_type: "text",
    status: "text",
    steps: "jsonb",
    last_run: "timestamp with time zone",
    next_run: "timestamp with time zone",
    execution_count: "integer",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  regulatory_events: {
    id: "uuid",
    org_id: "uuid",
    title: "text",
    framework: "text",
    deadline: "date",
    status: "text",
    description: "text",
    assigned_to: "uuid",
    created_at: "timestamp with time zone",
  },
  leads: {
    id: "uuid",
    org_id: "uuid",
    name: "text",
    email: "text",
    company: "text",
    title: "text",
    source: "text",
    status: "text",
    score: "numeric",
    assigned_to: "uuid",
    notes: "text",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
  deals: {
    id: "uuid",
    org_id: "uuid",
    lead_id: "uuid",
    title: "text",
    value: "numeric",
    stage: "text",
    probability: "numeric",
    expected_close: "date",
    assigned_to: "uuid",
    created_at: "timestamp with time zone",
    updated_at: "timestamp with time zone",
  },
};

const EXPECTED_INDEXES = [
  "idx_users_clerk_id",
  "idx_users_email",
  "idx_organizations_slug",
  "idx_organizations_plan",
  "idx_org_members_org_id",
  "idx_org_members_user_id",
  "idx_frameworks_org_id",
  "idx_frameworks_status",
  "idx_frameworks_created_at",
  "idx_controls_framework_id",
  "idx_controls_org_id",
  "idx_controls_status",
  "idx_controls_owner_id",
  "idx_assessments_org_id",
  "idx_assessments_framework_id",
  "idx_assessments_status",
  "idx_assessments_assigned_to",
  "idx_assessments_created_at",
  "idx_vendors_org_id",
  "idx_vendors_risk_tier",
  "idx_vendors_status",
  "idx_vendors_risk_score",
  "idx_incidents_org_id",
  "idx_incidents_severity",
  "idx_incidents_status",
  "idx_incidents_assigned_to",
  "idx_incidents_created_at",
  "idx_travel_advisories_country_code",
  "idx_travel_advisories_risk_level",
  "idx_travel_advisories_risk_score",
  "idx_travel_trips_org_id",
  "idx_travel_trips_traveler_id",
  "idx_travel_trips_status",
  "idx_travel_trips_approval_status",
  "idx_travel_trips_destination_country",
  "idx_agent_runs_org_id",
  "idx_agent_runs_status",
  "idx_agent_runs_created_at",
  "idx_audit_logs_org_id",
  "idx_audit_logs_user_id",
  "idx_audit_logs_action",
  "idx_audit_logs_severity",
  "idx_audit_logs_created_at",
  "idx_compliance_gaps_org_id",
  "idx_compliance_gaps_framework_id",
  "idx_compliance_gaps_control_id",
  "idx_compliance_gaps_severity",
  "idx_compliance_gaps_status",
  "idx_policies_org_id",
  "idx_policies_status",
  "idx_policies_owner_id",
  "idx_reports_org_id",
  "idx_reports_type",
  "idx_reports_created_at",
  "idx_notifications_org_id",
  "idx_notifications_user_id",
  "idx_notifications_read",
  "idx_notifications_created_at",
  "idx_integrations_org_id",
  "idx_integrations_provider",
  "idx_integrations_status",
  "idx_workflows_org_id",
  "idx_workflows_status",
  "idx_regulatory_events_org_id",
  "idx_regulatory_events_deadline",
  "idx_regulatory_events_status",
  "idx_leads_org_id",
  "idx_leads_status",
  "idx_leads_assigned_to",
  "idx_leads_score",
  "idx_deals_org_id",
  "idx_deals_lead_id",
  "idx_deals_stage",
  "idx_deals_assigned_to",
];

export async function validateSchema(): Promise<HealthReport> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const validationErrors: ValidationResult[] = [];
  let tablesOk = 0;
  const totalRows: { [key: string]: number } = {};
  const indexStatus: IndexInfo[] = [];

  for (const [tableName, expectedColumns] of Object.entries(EXPECTED_SCHEMA)) {
    const result: ValidationResult = {
      table: tableName,
      exists: false,
      columnCount: 0,
      missingColumns: [],
      typeErrors: [],
    };

    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type, is_nullable")
      .eq("table_schema", "public")
      .eq("table_name", tableName);

    if (columnsError || !columns) {
      result.exists = false;
      validationErrors.push(result);
      continue;
    }

    result.exists = true;
    result.columnCount = columns.length;

    const columnMap: { [key: string]: string } = {};
    for (const col of columns) {
      columnMap[col.column_name] = col.data_type;
    }

    for (const [colName, expectedType] of Object.entries(expectedColumns)) {
      if (!columnMap[colName]) {
        result.missingColumns?.push(colName);
      }
    }

    if (result.missingColumns!.length > 0 || Object.keys(columnMap).length === 0) {
      validationErrors.push(result);
    } else {
      tablesOk++;
    }

    const { count } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (count !== null) {
      totalRows[tableName] = count;
    }
  }

  const { data: indexes } = await supabase
    .from("pg_indexes")
    .select("indexname, tablename, indexdef")
    .eq("schemaname", "public");

  if (indexes) {
    for (const idx of indexes) {
      if (EXPECTED_INDEXES.includes(idx.indexname)) {
        const tableName = idx.tablename;
        const columnMatch = idx.indexdef.match(/\((.*?)\)/);
        const columns = columnMatch ? columnMatch[1].split(",").map((c) => c.trim()) : [];

        indexStatus.push({
          name: idx.indexname,
          table: tableName,
          columns,
        });
      }
    }
  }

  const summary =
    validationErrors.length === 0
      ? "All tables and columns validated successfully"
      : `${validationErrors.length} validation errors found`;

  return {
    timestamp: new Date().toISOString(),
    databaseConnected: true,
    tablesValidated: Object.keys(EXPECTED_SCHEMA).length,
    tablesOk,
    validationErrors,
    indexStatus,
    totalRows,
    summary,
  };
}

export async function getHealthReport(): Promise<HealthReport> {
  return validateSchema();
}
