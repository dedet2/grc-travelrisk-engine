# Database Schema Reference

Complete documentation of the GRC TravelRisk Engine database schema.

## Tables Overview

### 1. frameworks
Compliance and security frameworks reference data.

```sql
id UUID PRIMARY KEY
name TEXT                          -- Framework name
version TEXT                       -- Version (e.g., "2023.1")
description TEXT                  -- Full description
source_url TEXT                    -- Link to official documentation
status TEXT                        -- 'draft', 'published', 'archived'
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**Indexes**: status
**RLS**: Public read access
**Sample Data**:
- NIST Cybersecurity Framework
- CIS Critical Security Controls
- ISO/IEC 27001:2022

---

### 2. controls
Individual security controls within frameworks.

```sql
id UUID PRIMARY KEY
framework_id UUID                  -- References frameworks(id)
control_id_str TEXT               -- Human-readable ID (e.g., "NIST-AC-2")
title TEXT                        -- Control title
description TEXT                 -- Control description
category TEXT                     -- Category (e.g., "Access Control")
control_type TEXT                -- 'technical', 'operational', 'management'
created_at TIMESTAMP WITH TIME ZONE
```

**Indexes**: framework_id, category
**RLS**: Public read access
**Relationships**: Many-to-one with frameworks
**Constraints**:
- control_type IN ('technical', 'operational', 'management')
- Cascade delete when framework is deleted

**Example**:
```json
{
  "control_id_str": "NIST-AC-2",
  "title": "Account Management",
  "category": "Access Control",
  "control_type": "organizational"
}
```

---

### 3. assessments
User-initiated security assessments.

```sql
id UUID PRIMARY KEY
user_id TEXT                      -- Clerk user ID
framework_id UUID                 -- References frameworks(id)
name TEXT                         -- Assessment name (e.g., "Q4 2024 Audit")
status TEXT                       -- 'in-progress', 'completed', 'archived'
overall_score NUMERIC             -- 0-100 score
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

**Indexes**: user_id, framework_id, status
**RLS**: Users can only view/create their own
**Constraints**:
- status IN ('in-progress', 'completed', 'archived')
- overall_score auto-calculated from responses

**Example**:
```json
{
  "user_id": "user_12345",
  "framework_id": "framework-nist-id",
  "name": "Annual Security Assessment 2024",
  "status": "in-progress",
  "overall_score": 72.5
}
```

---

### 4. assessment_responses
Individual responses to controls within an assessment.

```sql
id UUID PRIMARY KEY
assessment_id UUID                -- References assessments(id)
control_id UUID                   -- References controls(id)
response TEXT                     -- Implementation status
evidence TEXT                     -- Supporting evidence/documentation
score NUMERIC                     -- 0-100 for this control
notes TEXT                        -- Assessor notes
created_at TIMESTAMP WITH TIME ZONE
```

**Indexes**: assessment_id, control_id
**RLS**: Users can only view responses from their assessments
**Constraints**:
- response IN ('implemented', 'partially-implemented', 'not-implemented')
- Cascade delete when assessment is deleted
- Restrict delete when control is deleted (maintain history)

**Example**:
```json
{
  "assessment_id": "assessment-id",
  "control_id": "control-id",
  "response": "partially-implemented",
  "evidence": "Access control policy documented but not fully deployed",
  "score": 65.0,
  "notes": "Will be fully implemented by Q2 2025"
}
```

---

### 5. travel_advisories
Travel risk data for countries/regions.

```sql
id UUID PRIMARY KEY
country_code TEXT                 -- ISO-3166-1 alpha-2 code (UNIQUE)
country_name TEXT                 -- Full country name
advisory_level INTEGER            -- 1 (Low) to 4 (Do Not Travel)
description TEXT                 -- Risk description
source TEXT                       -- Data source (e.g., "US State Dept")
fetched_at TIMESTAMP WITH TIME ZONE  -- When data was fetched
expires_at TIMESTAMP WITH TIME ZONE  -- Data freshness deadline
```

**Indexes**: country_code
**RLS**: Public read access
**Constraints**:
- country_code is UNIQUE
- advisory_level BETWEEN 1 AND 4

**Advisory Levels**:
- 1: Exercise Normal Precautions
- 2: Exercise Increased Caution
- 3: Reconsider Travel
- 4: Do Not Travel

**Example**:
```json
{
  "country_code": "US",
  "country_name": "United States",
  "advisory_level": 1,
  "description": "No current travel advisories",
  "source": "US State Department",
  "fetched_at": "2024-02-10T10:30:00Z",
  "expires_at": "2024-02-17T10:30:00Z"
}
```

---

### 6. trip_risk_reports
Combined GRC and travel risk reports for trips.

```sql
id UUID PRIMARY KEY
user_id TEXT                      -- Clerk user ID
assessment_id UUID                -- References assessments(id)
destination_country TEXT          -- Country code or name
departure_date DATE               -- Trip start date
return_date DATE                  -- Trip end date
grc_score NUMERIC                 -- GRC/compliance score
travel_score NUMERIC              -- Travel risk score
combined_score NUMERIC            -- Weighted combination
report_data JSONB                 -- Flexible data storage
created_at TIMESTAMP WITH TIME ZONE
```

**Indexes**: user_id, created_at
**RLS**: Users can only view/create their own reports
**Constraints**:
- return_date >= departure_date
- Scores typically 0-100

**report_data Schema** (flexible JSONB):
```json
{
  "risk_factors": [
    "High political instability",
    "Limited medical facilities"
  ],
  "recommendations": [
    "Register with embassy",
    "Obtain travel insurance"
  ],
  "compliance_gaps": [
    "Missing incident response plan for travel"
  ],
  "detailed_advisories": { ... },
  "approval_status": "pending",
  "reviewer_notes": ""
}
```

---

### 7. agent_runs
AI agent workflow execution logs for observability.

```sql
id UUID PRIMARY KEY
agent_name TEXT                   -- Agent name (e.g., "risk-scorer")
workflow TEXT                     -- Workflow type
task_title TEXT                   -- Task being performed
status TEXT                       -- 'pending', 'running', 'completed', 'failed'
latency_ms INTEGER                -- Execution time in milliseconds
tasks_completed INTEGER           -- Number of subtasks completed
total_tasks INTEGER               -- Total subtasks
input_tokens INTEGER              -- Claude input tokens used
output_tokens INTEGER             -- Claude output tokens used
cost_usd NUMERIC                  -- API cost for this run
error_message TEXT                -- Error details if failed
autonomy_level TEXT               -- 'low', 'medium', 'high'
human_reviewed BOOLEAN            -- Whether output was reviewed
output_in_range BOOLEAN           -- Whether output was valid
created_at TIMESTAMP WITH TIME ZONE
```

**Indexes**: status, created_at
**RLS**: Authenticated users can view (typically read-only)

**Example**:
```json
{
  "agent_name": "risk-scorer",
  "workflow": "assess-grc-compliance",
  "task_title": "Calculate overall risk score",
  "status": "completed",
  "latency_ms": 2340,
  "tasks_completed": 8,
  "total_tasks": 10,
  "input_tokens": 4250,
  "output_tokens": 890,
  "cost_usd": 0.0156,
  "autonomy_level": "high",
  "human_reviewed": false,
  "output_in_range": true
}
```

---

### 8. audit_logs
Complete audit trail for compliance and security.

```sql
id UUID PRIMARY KEY
user_id TEXT                      -- Clerk user ID (nullable for system actions)
action TEXT                       -- Action performed (e.g., "created", "updated")
resource_type TEXT                -- Resource type (e.g., "assessment")
resource_id TEXT                  -- ID of affected resource
details JSONB                     -- Additional context
ip_address TEXT                   -- Client IP address
created_at TIMESTAMP WITH TIME ZONE
```

**Indexes**: user_id, action, resource_type, created_at
**RLS**: Admin-only read access, service_role can insert

**Example**:
```json
{
  "user_id": "user_12345",
  "action": "created",
  "resource_type": "assessment",
  "resource_id": "assessment-uuid",
  "details": {
    "framework": "NIST CSF",
    "name": "Q4 2024 Assessment"
  },
  "ip_address": "203.0.113.42"
}
```

---

## Relationships Diagram

```
frameworks
  ├─ (1:N) → controls
  ├─ (1:N) → assessments
  └─ (1:N) → trip_risk_reports

assessments
  ├─ (1:N) → assessment_responses
  └─ (1:N) → trip_risk_reports

controls
  └─ (1:N) → assessment_responses

travel_advisories
  └─ (referenced by) trip_risk_reports (destination_country)

assessment_responses
  └─ (used by) agent_runs

[All tables] ← audit_logs (audit trail)
[All tables] ← agent_runs (observability)
```

---

## Data Types Reference

### TIMESTAMP WITH TIME ZONE
- Always stored in UTC
- Automatically converted to client's timezone
- Example: `2024-02-10T15:30:45.123Z`

### UUID
- PostgreSQL `uuid` type
- Generated with `gen_random_uuid()`
- Format: `550e8400-e29b-41d4-a716-446655440000`

### NUMERIC
- Exact decimal numbers (not floating point)
- Format: `NUMERIC(precision, scale)`
- Example: `NUMERIC(5,2)` = 999.99 max

### JSONB
- Binary JSON storage
- Indexed for efficient queries
- Supports nested objects and arrays
- Query example: `report_data->>'risk_factors'`

---

## Indexes Performance Guide

| Index | Purpose | Typical Query |
|-------|---------|---|
| idx_frameworks_status | Filter by framework status | WHERE status = 'published' |
| idx_controls_framework_id | Find controls in framework | WHERE framework_id = ... |
| idx_assessments_user_id | List user's assessments | WHERE user_id = auth.uid() |
| idx_assessments_status | Filter assessments | WHERE status = 'completed' |
| idx_assessment_responses_assessment_id | Get assessment responses | WHERE assessment_id = ... |
| idx_travel_advisories_country_code | Lookup country data | WHERE country_code = 'US' |
| idx_trip_risk_reports_user_id | List user's reports | WHERE user_id = auth.uid() |
| idx_agent_runs_status | Monitor agent status | WHERE status = 'running' |
| idx_audit_logs_user_id | User activity log | WHERE user_id = ... |
| idx_audit_logs_created_at | Recent audit entries | ORDER BY created_at DESC |

---

## Row Level Security (RLS) Policies

### Public Access Tables
- **frameworks**: All authenticated users can read
- **controls**: All authenticated users can read
- **travel_advisories**: All authenticated users can read

### User-Scoped Tables
- **assessments**: Users can only read/write their own (user_id = auth.uid())
- **assessment_responses**: Inherits from parent assessment
- **trip_risk_reports**: Users can only read/write their own (user_id = auth.uid())

### Admin/System Tables
- **agent_runs**: Authenticated users can read (read-only)
- **audit_logs**: Read-only (admin access), insert via service_role

---

## Writing Queries

### Example: Get User's Assessments
```sql
SELECT
  a.id,
  a.name,
  a.status,
  a.overall_score,
  f.name as framework_name
FROM assessments a
JOIN frameworks f ON a.framework_id = f.id
WHERE a.user_id = auth.uid()
ORDER BY a.created_at DESC;
```

### Example: Assessment with Control Responses
```sql
SELECT
  c.control_id_str,
  c.title,
  ar.response,
  ar.score,
  ar.notes
FROM assessment_responses ar
JOIN controls c ON ar.control_id = c.id
WHERE ar.assessment_id = $1
ORDER BY c.category, c.control_id_str;
```

### Example: Trip Risk Report
```sql
SELECT
  destination_country,
  combined_score,
  travel_advisories.advisory_level
FROM trip_risk_reports
LEFT JOIN travel_advisories
  ON travel_advisories.country_code = trip_risk_reports.destination_country
WHERE user_id = auth.uid()
  AND created_at > NOW() - INTERVAL '30 days';
```

---

## Constraints and Validation

### NOT NULL Constraints
Enforced at database level for critical fields:
- frameworks: name, version
- controls: framework_id, control_id_str, title, category, control_type
- assessments: user_id, framework_id, name
- assessment_responses: assessment_id, control_id, response
- travel_advisories: country_code, country_name, advisory_level
- trip_risk_reports: user_id, destination_country, grc_score, travel_score

### CHECK Constraints
Domain validation built into schema:
- status fields limited to valid values
- advisory_level between 1-4
- response options enumerated
- autonomy_level limited options

### Referential Integrity
Cascading and restricted deletes:
- Delete framework: Cascade to controls, assessments, responses
- Delete assessment: Cascade to responses, trip reports
- Delete control: Restrict (preserve historical data)

---

## Performance Tips

1. **Always include indexes in WHERE clauses**
   ```sql
   -- Good (indexed)
   WHERE user_id = auth.uid() AND created_at > NOW() - INTERVAL '30 days'

   -- Bad (sequential scan)
   WHERE EXTRACT(MONTH FROM created_at) = 2
   ```

2. **Use JSONB operators efficiently**
   ```sql
   -- Good (creates index-friendly query)
   WHERE report_data->>'status' = 'pending'

   -- Bad (requires full scan)
   WHERE report_data::text LIKE '%pending%'
   ```

3. **Batch operations**
   ```sql
   -- Insert multiple responses at once
   INSERT INTO assessment_responses (...) VALUES
     (...), (...), (...)
   ```

4. **Limit result sets**
   ```sql
   SELECT ... LIMIT 100 OFFSET 0  -- Pagination
   ```

---

## Migration Strategy

### Development
- Migrations applied automatically with `supabase db push`
- Test against free tier PostgreSQL database
- Keep migration files version controlled

### Production
- Review migration SQL before applying
- Apply during low-traffic windows
- Have rollback plan ready
- Test on staging environment first
- Monitor database logs during migration

---

## Backup and Recovery

Supabase automatic backups:
- **Free tier**: 7-day retention
- **Pro tier**: 30-day retention
- **Enterprise**: Configurable retention

Point-in-time recovery available with Pro+ plans.

---

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for deployment and configuration details.
