# Quick Start: Supabase Database Setup

## Executive Summary

The GRC TravelRisk Engine is a full-stack application that requires a Supabase PostgreSQL database. This document provides step-by-step instructions to get your database up and running in under 10 minutes.

## What You Need

1. **Supabase Account** (Free): https://supabase.com
2. **Environment Variables**: Database credentials (URL, keys)
3. **A Web Browser**: To access Supabase dashboard

## 5-Minute Quick Start

### Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Project name**: `grc-travelrisk-engine`
   - **Database password**: (create a strong password)
   - **Region**: `us-east-1` (or your preferred region)
4. Click "Create new project" and wait for initialization

### Step 2: Get Your Credentials (1 minute)

Once initialized:
1. Go to **Project Settings** (⚙️ icon)
2. Click **"API"** tab
3. Copy these three values:
   ```
   Project URL:           https://xxxxx.supabase.co
   anon key:              ey...
   service_role key:      ey...
   ```

### Step 3: Configure Environment (1 minute)

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
SUPABASE_SERVICE_ROLE_KEY=ey...
```

### Step 4: Deploy Database Schema (1 minute)

**Easy Method - Using Supabase Dashboard:**

1. In your Supabase project, go to **SQL Editor**
2. Click **"New query"**
3. Open the file: `/supabase/migrations/001_initial_schema.sql`
4. Copy and paste the entire SQL into the editor
5. Click **"Run"** button
6. ✅ Done! Your database is ready

**Advanced Method - Using CLI:**

```bash
supabase link --project-ref your-project-id
supabase db push
```

### Step 5: Verify (No time needed - it's instant)

Run this SQL query in Supabase to confirm:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
```

You should see 8 tables:
- ✅ assessment_responses
- ✅ assessments
- ✅ audit_logs
- ✅ controls
- ✅ frameworks
- ✅ agent_runs
- ✅ travel_advisories
- ✅ trip_risk_reports

## Database Overview

### What Gets Created

The migration creates a complete GRC and travel risk assessment system:

| Table | Purpose | Rows | Notes |
|-------|---------|------|-------|
| **frameworks** | Compliance frameworks (NIST, CIS, ISO) | ~5-10 | Reference data |
| **controls** | Security controls | ~200-500 | Linked to frameworks |
| **assessments** | User assessments | User-created | 1 per evaluation |
| **assessment_responses** | Control responses | Variable | ~50+ per assessment |
| **travel_advisories** | Country risk data | ~195 | Updated regularly |
| **trip_risk_reports** | Combined risk reports | User-created | Output of engine |
| **agent_runs** | AI workflow tracking | Auto-logged | Observability data |
| **audit_logs** | Security audit trail | Auto-logged | Compliance logging |

### Security Features

✅ **Row Level Security** - Users see only their own data
✅ **Authentication** - Integrated with Clerk auth provider
✅ **Audit Logging** - All actions tracked for compliance
✅ **Automated Timestamps** - created_at and updated_at auto-managed
✅ **Indexes** - Optimized for query performance

## File Structure

```
grc-travelrisk-engine/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    ← Database schema
├── src/
│   └── lib/
│       └── supabase/
│           ├── client.ts              ← Browser client
│           ├── server.ts              ← Server client
│           └── types.ts               ← TypeScript types
├── .env.local                         ← Your credentials (create this)
├── SUPABASE_SETUP.md                 ← Detailed guide
└── scripts/
    └── setup-db.sh                    ← Automated setup script
```

## Troubleshooting

### "Cannot connect to database"

1. ✅ Verify `.env.local` has correct credentials
2. ✅ Check Supabase project is running (green checkmark)
3. ✅ Ensure URL matches your project (not another project's)

### "Permission denied" errors

1. ✅ Log in to your app (Clerk authentication required)
2. ✅ Check user_id is properly set from auth token
3. ✅ Use service_role key for server-side operations

### "Table doesn't exist"

1. ✅ Re-run the SQL migration
2. ✅ Check all queries ran successfully (no red errors)
3. ✅ Refresh browser and check Supabase dashboard

### "RLS policy denying access"

This is expected! RLS policies ensure data isolation:
- Frameworks: Public read ✅
- Assessments: User-specific ✅
- Trip reports: User-specific ✅

For debugging, temporarily use service_role key or check auth token.

## Production Checklist

Before deploying to production:

- [ ] Choose appropriate Supabase plan (Pro tier recommended)
- [ ] Enable database backups (automatic daily)
- [ ] Set up connection pooling (for high traffic)
- [ ] Enable SSL enforcement
- [ ] Configure custom domain
- [ ] Set up monitoring and alerts
- [ ] Test failover procedures
- [ ] Document backup/restore procedures
- [ ] Configure logging retention
- [ ] Set up audit log archival

See SUPABASE_SETUP.md for detailed production configuration.

## Cost Breakdown

### Free Tier
- **Storage**: 500 MB
- **Bandwidth**: 2 GB/month
- **Perfect for**: Development, testing, prototyping
- **Cost**: $0

### Pro Tier ($25/month)
- **Storage**: 8 GB
- **Bandwidth**: 50 GB/month
- **Perfect for**: Production use
- **Includes**: Priority support

### Enterprise
- **Custom**: Contact sales
- **Perfect for**: High-volume production

For this project, free tier is perfect for development.

## Next Steps After Setup

1. **Seed Data**
   ```bash
   npm run db:seed  # (if you create this script)
   ```

2. **Start Development**
   ```bash
   npm install
   npm run dev
   ```

3. **Test Connection**
   - Open http://localhost:3000
   - Sign up with Clerk
   - Create a new assessment

4. **Monitor**
   - Watch database queries in Supabase Dashboard
   - Check audit logs for user actions
   - Monitor agent_runs for AI workflow performance

## Support Resources

- 📚 **Supabase Docs**: https://supabase.com/docs
- 🐛 **Report Issues**: GitHub issues
- 💬 **Community**: Supabase Discord
- 📧 **Email Support**: support@supabase.com (Pro+ only)

## Quick Command Reference

```bash
# View environment variables
cat .env.local

# Start development server
npm install && npm run dev

# Check database connection
npm run test  # (runs tests against DB)

# View migrations
ls supabase/migrations/

# Create new migration
npm run db:migrate

# View Supabase project
open https://app.supabase.com/project/your-project-id
```

## What's Next?

After your database is running:

1. Review SUPABASE_SETUP.md for detailed configuration
2. Check src/lib/supabase/ for client setup examples
3. Explore the schema in Supabase SQL Editor
4. Start building API routes in src/app/api/
5. Create components in src/components/

Happy coding! 🚀
