# Supabase Database Setup Guide for GRC TravelRisk Engine

## Overview
This guide walks you through setting up the Supabase database for the "AI GRC & TravelRisk Engine" project. The project uses Supabase for authentication, data storage, and row-level security (RLS).

## Prerequisites
- A Supabase account (https://supabase.com)
- The Supabase CLI installed locally
- Node.js and npm installed

## Step 1: Create or Access Your Supabase Organization

1. Go to https://supabase.com/dashboard
2. Log in with your account
3. If you don't have an organization yet, create one
4. Note your **Organization ID** from the dashboard

## Step 2: Create a New Supabase Project

### Option A: Using Supabase Dashboard (Recommended for Getting Started)

1. In your Supabase dashboard, click **"New project"**
2. Configure the project:
   - **Project name**: `grc-travelrisk-engine`
   - **Database password**: Create a strong password (save this securely)
   - **Region**: Select `us-east-1` (or nearest region to your users)
   - **Pricing plan**: Select your preferred plan (Free tier works for development)

3. Click **"Create new project"** and wait for initialization (2-3 minutes)

### Option B: Using Supabase CLI

```bash
supabase projects create --name grc-travelrisk-engine --region us-east-1
```

## Step 3: Get Your Project Credentials

Once your project is created:

1. Go to **Project Settings** (⚙️ icon in the bottom left)
2. Click **"API"** in the left sidebar
3. Copy the following credentials:
   - **Project URL**: (e.g., `https://your-project-id.supabase.co`)
   - **anon key**: (public key for client-side requests)
   - **service_role key**: (private key for server-side operations)

## Step 4: Apply Database Migration

The database schema is defined in `/supabase/migrations/001_initial_schema.sql`

### Option A: Using Supabase Dashboard SQL Editor

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `/supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** to execute the migration

### Option B: Using Supabase CLI

```bash
# Link your local project to your Supabase project
supabase link --project-ref your-project-id

# Deploy migrations
supabase db push
```

### Option C: Manual SQL Execution

If you prefer to run the SQL manually through psql:

```bash
psql postgresql://postgres:password@your-project-id.supabase.co:5432/postgres < supabase/migrations/001_initial_schema.sql
```

## Step 5: Verify Database Setup

Run this query in the Supabase SQL Editor to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- assessment_responses
- assessments
- audit_logs
- controls
- frameworks
- agent_runs
- travel_advisories
- trip_risk_reports

## Step 6: Configure Environment Variables

Create or update your `.env.local` file with the credentials from Step 3:

```env
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Other required variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
ANTHROPIC_API_KEY=your_anthropic_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Step 7: Verify Database Connection

To verify everything is working:

1. Start the development server:
   ```bash
   npm install
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. The application should be able to connect to your Supabase instance

## Database Schema Summary

### Core Tables

**frameworks** - GRC compliance frameworks (CIS, NIST, ISO 27001, etc.)
- UUID primary key
- Name, version, description
- Status: draft, published, archived
- Timestamps

**controls** - Individual controls within frameworks
- UUID primary key
- References framework_id
- Control metadata: control_id_str, title, category, control_type
- Control types: technical, operational, management

**assessments** - User security assessments
- UUID primary key
- References user_id and framework_id
- Status: in-progress, completed, archived
- overall_score field
- Timestamps

**assessment_responses** - Individual responses to controls
- UUID primary key
- References assessment_id and control_id
- Response options: implemented, partially-implemented, not-implemented
- Evidence text, score, notes

**travel_advisories** - Travel risk data by country
- UUID primary key
- country_code (UNIQUE), country_name
- advisory_level (1-4 scale)
- Source, fetched_at, expires_at timestamps

**trip_risk_reports** - Combined GRC + travel risk reports
- UUID primary key
- References user_id and assessment_id
- Trip details: destination_country, departure_date, return_date
- Scores: grc_score, travel_score, combined_score
- report_data (JSONB for flexible data storage)

**agent_runs** - Observability for AI agents
- UUID primary key
- Agent/workflow metadata
- Status: pending, running, completed, failed
- Performance metrics: latency_ms, token counts, cost_usd
- autonomy_level, human_reviewed flags

**audit_logs** - Security audit trail
- UUID primary key
- user_id, action, resource_type, resource_id
- Details (JSONB), ip_address
- created_at timestamp

### Row Level Security (RLS) Policies

The schema includes RLS policies to ensure data isolation:

- **frameworks & travel_advisories**: Public read access (reference data)
- **assessments & trip_risk_reports**: Users can only see their own records
- **assessment_responses**: Users can only see responses from their own assessments
- **audit_logs**: Read access restricted (admin only), insert access for service role

### Indexes

Performance indexes are created on frequently queried columns:
- Foreign keys (framework_id, assessment_id, control_id, user_id)
- Status fields (for filtering)
- Timestamps (for sorting)
- Country codes (for travel advisories lookup)

## Cost Considerations

### Free Tier
- Up to 500MB storage
- 2GB bandwidth
- Perfect for development and prototyping

### Pro Tier ($25/month)
- 8GB storage
- 50GB bandwidth
- For production use

### Enterprise
Contact Supabase sales for custom requirements

## Troubleshooting

### "Connection refused" errors
- Verify your project URL is correct
- Ensure your IP address is not blocked by Supabase firewall
- Check that your API keys are correct

### RLS policy denying access
- Verify the user is authenticated
- Check that user_id in your data matches `auth.jwt() ->> 'sub'`
- Test with the service_role key to bypass RLS

### Migration fails
- Check for syntax errors in the SQL
- Ensure all schema names are lowercase
- Drop and recreate the table if there are constraint conflicts

### Performance issues
- Verify indexes are created: `SELECT * FROM pg_indexes WHERE schemaname = 'public'`
- Check for missing indexes on frequently queried columns
- Monitor query performance in Supabase analytics

## Next Steps

1. **Seed framework data**: Load NIST, CIS, ISO 27001 frameworks into the database
2. **Configure authentication**: Set up Clerk integration with Supabase RLS
3. **Implement API routes**: Create Next.js API routes for CRUD operations
4. **Add travel risk data**: Populate travel_advisories with real data
5. **Deploy**: When ready, deploy to production with environment variables

## Support Resources

- Supabase Documentation: https://supabase.com/docs
- Supabase SQL Editor: https://supabase.com/docs/tools/sql
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Community Help: https://supabase.com/community

## Additional Notes

- The project uses Supabase's JavaScript client library (`@supabase/ssr`)
- Authentication is handled by Clerk (auth.jwt() ->> 'sub' references Clerk user IDs)
- The database uses PostgreSQL with UUID primary keys
- JSONB columns allow flexible data storage for reports and metadata
- Updated_at triggers automatically track modification timestamps
