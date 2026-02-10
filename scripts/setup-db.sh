#!/bin/bash
# Database setup script for GRC TravelRisk Engine
# This script helps initialize the Supabase database

set -e

echo "🚀 GRC TravelRisk Engine - Database Setup"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    echo ""
    exit 1
fi

echo "✅ .env.local file found"
echo ""

# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Validate required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required Supabase credentials in .env.local"
    exit 1
fi

echo "✅ Supabase credentials loaded"
echo ""

# Extract project ID from URL
PROJECT_ID=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://(.+)\.supabase\.co|\\1|')
echo "📦 Project ID: $PROJECT_ID"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "🔗 Linking to Supabase project..."
supabase link --project-ref "$PROJECT_ID" --no-prompt 2>/dev/null || echo "Project already linked or CLI unavailable"
echo ""

echo "📊 Running database migrations..."
echo "This will:"
echo "  - Create all required tables"
echo "  - Set up Row Level Security policies"
echo "  - Create indexes for performance"
echo "  - Enable audit logging"
echo ""

# Run migrations
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db push --no-prompt || {
        echo ""
        echo "⚠️  CLI migration method unavailable"
        echo "Please apply the migration manually:"
        echo "  1. Go to https://app.supabase.com/project/$PROJECT_ID/sql/new"
        echo "  2. Copy contents of supabase/migrations/001_initial_schema.sql"
        echo "  3. Paste and execute in the SQL Editor"
        exit 1
    }
else
    echo "⚠️  Supabase CLI not available"
    echo "Please apply the migration manually:"
    echo "  1. Go to https://app.supabase.com/project/$PROJECT_ID/sql/new"
    echo "  2. Copy contents of supabase/migrations/001_initial_schema.sql"
    echo "  3. Paste and execute in the SQL Editor"
    exit 1
fi

echo ""
echo "✅ Database migration completed!"
echo ""

# Verify tables were created
echo "🔍 Verifying database schema..."
TABLES_QUERY="SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"

echo ""
echo "Expected tables:"
echo "  - assessment_responses"
echo "  - assessments"
echo "  - audit_logs"
echo "  - controls"
echo "  - frameworks"
echo "  - agent_runs"
echo "  - travel_advisories"
echo "  - trip_risk_reports"
echo ""

echo "To verify, run this query in your Supabase SQL Editor:"
echo "  $TABLES_QUERY"
echo ""

echo "=========================================="
echo "✅ Database setup completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Install dependencies: npm install"
echo "  2. Start development server: npm run dev"
echo "  3. Open http://localhost:3000 in your browser"
echo ""
echo "Documentation:"
echo "  - See SUPABASE_SETUP.md for detailed configuration"
echo "  - See README.md for application overview"
echo ""
