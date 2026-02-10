# Database Setup Checklist

Use this checklist to track your progress through the Supabase database setup.

## Pre-Setup (5 minutes)

- [ ] Create a Supabase account at https://supabase.com
- [ ] Read SETUP_INSTRUCTIONS.md (quick start guide)
- [ ] Ensure you have a web browser ready
- [ ] Have a text editor open for environment variables

## Phase 1: Create Supabase Project (2 minutes)

### Create Project in Dashboard
- [ ] Go to https://supabase.com/dashboard
- [ ] Click "New Project"
- [ ] Enter project name: `grc-travelrisk-engine`
- [ ] Create a strong database password
- [ ] Select region: `us-east-1` (or preferred region)
- [ ] Click "Create new project"
- [ ] **Wait for project to initialize** (2-3 minutes)
  - Green checkmark appears when ready ✓

### Verify Project Created
- [ ] Project appears in dashboard
- [ ] Status shows "Active" or "Initializing"
- [ ] Database is accessible
- [ ] Connection details are displayed

## Phase 2: Obtain Credentials (1 minute)

### Access API Settings
- [ ] In Supabase dashboard, find your new project
- [ ] Click the project name to open it
- [ ] Click ⚙️ (Settings icon) in bottom left
- [ ] Click "API" in the left sidebar

### Copy Credentials
- [ ] Copy **Project URL** (looks like: https://xxxxx.supabase.co)
  - Save it here: `________________`

- [ ] Copy **anon key** (JWT token starting with ey...)
  - Save it here: `________________`

- [ ] Copy **service_role key** (JWT token starting with ey...)
  - Save it here: `________________`

## Phase 3: Configure Environment Variables (1 minute)

### Create .env.local File
- [ ] In your project root directory, create `.env.local`
- [ ] Copy this template:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
  SUPABASE_SERVICE_ROLE_KEY=ey...

  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
  CLERK_SECRET_KEY=sk_test_your_key_here
  ANTHROPIC_API_KEY=sk-ant-your_key_here
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  NODE_ENV=development
  ```

### Populate with Your Credentials
- [ ] Replace `https://xxxxx.supabase.co` with your Project URL
- [ ] Replace first `ey...` with your anon key
- [ ] Replace second `ey...` with your service_role key
- [ ] Add your Clerk and Anthropic credentials (create these if needed)
- [ ] Save the file

### Security Check
- [ ] **IMPORTANT**: Add `.env.local` to `.gitignore`
- [ ] Verify `.env.local` is not committed to git
- [ ] Never share these credentials publicly

## Phase 4: Deploy Database Schema (2 minutes)

### Open SQL Editor
- [ ] Go back to your Supabase project dashboard
- [ ] Click **"SQL Editor"** in the left sidebar
- [ ] Click **"New query"** button

### Paste Migration SQL
- [ ] Open file: `supabase/migrations/001_initial_schema.sql`
- [ ] Copy ALL contents of the file
- [ ] Paste into Supabase SQL Editor
- [ ] Review the SQL briefly (check for any syntax)

### Execute Migration
- [ ] Click the **"Run"** button (green button)
- [ ] Watch for the query to execute
- [ ] **Verify no red error messages** appear
- [ ] You should see a success notification

### Troubleshooting
- [ ] If error occurs:
  - Check SQL syntax in file
  - Verify file is not corrupted
  - Try running smaller chunks
  - Check Supabase documentation

## Phase 5: Verify Database (2 minutes)

### Run Verification Query
- [ ] Open a new SQL Editor query
- [ ] Copy this verification SQL:
  ```sql
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
  ORDER BY table_name;
  ```
- [ ] Click Run
- [ ] Verify you see these 8 tables (in order):
  - [ ] assessment_responses
  - [ ] assessments
  - [ ] audit_logs
  - [ ] controls
  - [ ] frameworks
  - [ ] agent_runs
  - [ ] travel_advisories
  - [ ] trip_risk_reports

### Check Table Counts
- [ ] Run this to check if any seed data exists:
  ```sql
  SELECT table_name,
    (SELECT COUNT(*) FROM information_schema.tables t2
     WHERE t2.table_name = t1.table_name) as row_count
  FROM information_schema.tables t1
  WHERE table_schema = 'public';
  ```

### Verify Indexes
- [ ] Run this to verify indexes were created:
  ```sql
  SELECT * FROM pg_indexes
  WHERE schemaname = 'public'
  ORDER BY tablename, indexname;
  ```
- [ ] Should see multiple indexes starting with `idx_`

## Phase 6: Test Database Connection (3 minutes)

### Install Dependencies
- [ ] Open terminal in project root
- [ ] Run: `npm install`
- [ ] Wait for all dependencies to install

### Start Development Server
- [ ] Run: `npm run dev`
- [ ] Wait for "Ready in" message
- [ ] Should see: `> ready - started server on 0.0.0.0:3000`

### Test in Browser
- [ ] Open http://localhost:3000
- [ ] Application should load
- [ ] No "Cannot connect to database" errors
- [ ] If prompted, sign up with Clerk
- [ ] Navigate to dashboard area (if available)

### Monitor Connection
- [ ] Open Supabase dashboard in another tab
- [ ] Go to your project's **SQL Editor**
- [ ] You should see recent queries in activity log
- [ ] This confirms your app is connecting

## Phase 7: Verify Row Level Security (2 minutes)

### Check RLS Policies
- [ ] In Supabase, go to **Authentication** > **Policies**
- [ ] Verify you see policies for these tables:
  - [ ] frameworks
  - [ ] controls
  - [ ] assessments
  - [ ] assessment_responses
  - [ ] travel_advisories
  - [ ] trip_risk_reports
  - [ ] audit_logs

### Test RLS Works
- [ ] In your app, create an assessment (or attempt to)
- [ ] Go to Supabase SQL Editor
- [ ] Run: `SELECT * FROM assessments;`
- [ ] Should return assessments (without RLS restrictions in SQL)
- [ ] In your app, you should only see your own

## Phase 8: Seed Initial Data (Optional - 5 minutes)

### Populate Reference Data
- [ ] (Optional) Load GRC frameworks into `frameworks` table
- [ ] (Optional) Load controls into `controls` table
- [ ] (Optional) Load travel advisories into `travel_advisories` table

**Note**: This can be done later through your application UI

Frameworks to load eventually:
- [ ] NIST Cybersecurity Framework
- [ ] CIS Critical Security Controls
- [ ] ISO/IEC 27001:2022
- [ ] SOC 2 Type II

## Phase 9: Production Readiness (Optional - Future)

These are for when you prepare for production:

### Before Going Live
- [ ] Review SUPABASE_SETUP.md production section
- [ ] Upgrade Supabase plan from Free to Pro
- [ ] Enable automated backups
- [ ] Configure connection pooling for high traffic
- [ ] Set up monitoring and alerts
- [ ] Test backup/restore procedures
- [ ] Enable SSL enforcement
- [ ] Configure custom domain
- [ ] Set up audit log archival
- [ ] Document disaster recovery procedures
- [ ] Load test the database
- [ ] Plan for scaling strategy

### Day Before Launch
- [ ] Final backup test
- [ ] Run integration tests
- [ ] Verify all environment variables
- [ ] Test failover procedures
- [ ] Confirm monitoring is working
- [ ] Brief team on incident response

## Phase 10: Complete!

✅ **Congratulations!** Your database is ready.

### What's Next?
1. Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) to understand your schema
2. Start building API routes in `src/app/api/`
3. Create React components in `src/components/`
4. Load frameworks and controls via admin panel or scripts
5. Configure Clerk authentication
6. Set up Anthropic Claude integration
7. Test end-to-end workflows

### Quick Links
- **Supabase Dashboard**: https://app.supabase.com/project/your-project-id
- **Project Documentation**: See SUPABASE_SETUP.md
- **Schema Reference**: See DATABASE_SCHEMA.md
- **Quick Start**: See SETUP_INSTRUCTIONS.md

### Support
- 📚 Docs: https://supabase.com/docs
- 💬 Community: https://supabase.com/community
- 🐛 Issues: Check GitHub issues

---

## Summary

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Create Supabase Project | 2 min | ⏳ |
| 2 | Get Credentials | 1 min | ⏳ |
| 3 | Configure .env.local | 1 min | ⏳ |
| 4 | Deploy Schema | 2 min | ⏳ |
| 5 | Verify Tables | 2 min | ⏳ |
| 6 | Test Connection | 3 min | ⏳ |
| 7 | Check RLS Policies | 2 min | ⏳ |
| 8 | (Optional) Seed Data | 5 min | ⏳ |
| **Total** | | **20 min** | ⏳ |

---

**Last Updated**: February 10, 2024
**Version**: 1.0
**Status**: Ready to use
