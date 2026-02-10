# Supabase Integration Guide

This guide shows how to use Supabase clients in the GRC TravelRisk Engine application.

## Overview

The project uses two Supabase clients:

1. **Browser Client** (`src/lib/supabase/client.ts`) - Client-side queries with auth
2. **Server Client** (`src/lib/supabase/server.ts`) - Server-side queries with auth
3. **Service Role Client** (`src/lib/supabase/server.ts`) - Server-side with elevated permissions

## Client Setup

### Browser Client (Client-Side)

Use in React components (SSR-safe):

```typescript
import { createClient } from '@/lib/supabase/client';

export default function MyComponent() {
  const supabase = createClient();

  const fetchAssessments = async () => {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error:', error);
    return data;
  };

  return <div>{/* Component JSX */}</div>;
}
```

### Server Client (Server-Side)

Use in API routes and server components:

```typescript
import { createServerSideClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createServerSideClient();

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
```

### Service Role Client (Elevated Permissions)

Use for admin operations that bypass RLS:

```typescript
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function seedFrameworks() {
  const supabase = await createServiceRoleClient();

  // Can insert/update even without being the authenticated user
  const { data, error } = await supabase
    .from('frameworks')
    .insert([
      {
        name: 'NIST Cybersecurity Framework',
        version: '2.0',
        description: 'Industry standard...',
        status: 'published'
      }
    ]);

  return { data, error };
}
```

## Common Operations

### Create Assessment

```typescript
import { createClient } from '@/lib/supabase/client';

async function createAssessment(name: string, frameworkId: string) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: user.data?.user?.id || '',
      framework_id: frameworkId,
      name: name,
      status: 'in-progress',
      overall_score: 0
    })
    .select();

  if (error) throw error;
  return data[0];
}
```

### Fetch User's Assessments

```typescript
async function getUserAssessments() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      id,
      name,
      status,
      overall_score,
      created_at,
      frameworks(name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### Add Assessment Response

```typescript
async function submitControlResponse(
  assessmentId: string,
  controlId: string,
  response: 'implemented' | 'partially-implemented' | 'not-implemented',
  evidence: string,
  score: number
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('assessment_responses')
    .upsert(
      {
        assessment_id: assessmentId,
        control_id: controlId,
        response: response,
        evidence: evidence,
        score: score
      },
      { onConflict: 'assessment_id,control_id' }
    )
    .select();

  if (error) throw error;
  return data[0];
}
```

### Fetch Assessment with Responses

```typescript
async function getAssessmentDetail(assessmentId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      frameworks(
        id,
        name,
        version,
        description
      ),
      assessment_responses(
        *,
        controls(
          id,
          control_id_str,
          title,
          category,
          description
        )
      )
    `)
    .eq('id', assessmentId)
    .single();

  if (error) throw error;
  return data;
}
```

### Create Trip Risk Report

```typescript
async function createTripReport(
  destinationCountry: string,
  departureDate: string,
  returnDate: string,
  assessmentId: string | null,
  grcScore: number,
  travelScore: number
) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  const combinedScore = (grcScore + travelScore) / 2;

  const { data, error } = await supabase
    .from('trip_risk_reports')
    .insert({
      user_id: user.data?.user?.id || '',
      destination_country: destinationCountry,
      departure_date: departureDate,
      return_date: returnDate,
      assessment_id: assessmentId,
      grc_score: grcScore,
      travel_score: travelScore,
      combined_score: combinedScore,
      report_data: {
        generated_at: new Date().toISOString(),
        version: '1.0'
      }
    })
    .select();

  if (error) throw error;
  return data[0];
}
```

### Get Travel Advisory for Country

```typescript
async function getTravelAdvisory(countryCode: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('travel_advisories')
    .select('*')
    .eq('country_code', countryCode)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}
```

### Log Agent Run

```typescript
async function logAgentRun(
  agentName: string,
  workflow: string,
  taskTitle: string,
  latencyMs: number,
  tasksCompleted: number,
  totalTasks: number,
  inputTokens: number,
  outputTokens: number,
  costUsd: number,
  autonomyLevel: 'low' | 'medium' | 'high',
  status: 'completed' | 'failed' = 'completed',
  errorMessage?: string
) {
  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase
    .from('agent_runs')
    .insert({
      agent_name: agentName,
      workflow: workflow,
      task_title: taskTitle,
      status: status,
      latency_ms: latencyMs,
      tasks_completed: tasksCompleted,
      total_tasks: totalTasks,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costUsd,
      autonomy_level: autonomyLevel,
      human_reviewed: false,
      output_in_range: true,
      error_message: errorMessage || null
    })
    .select();

  if (error) throw error;
  return data[0];
}
```

## Authentication

### Get Current User

```typescript
async function getCurrentUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;
  return data.user;
}
```

### Handle Auth State Changes

```typescript
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAuthListener(callback: (user: any) => void) {
  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, [callback]);
}
```

## Error Handling

### Handle Common Errors

```typescript
async function safeQuery<T>(
  query: Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await query;

  if (error) {
    // RLS policy denied access
    if (error.code === 'PGRST' && error.message.includes('policy')) {
      throw new Error('You do not have permission to access this resource');
    }

    // Row not found
    if (error.code === 'PGRST116') {
      throw new Error('Resource not found');
    }

    // Database connection error
    if (error.code === 'CONN') {
      throw new Error('Database connection failed');
    }

    throw new Error(`Database error: ${error.message}`);
  }

  if (!data) {
    throw new Error('No data returned from query');
  }

  return data;
}

// Usage
try {
  const assessment = await safeQuery(
    supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()
  );
} catch (error) {
  console.error('Error fetching assessment:', error);
  // Show error to user
}
```

## Real-Time Subscriptions

### Listen for Assessment Changes

```typescript
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useAssessmentUpdates(assessmentId: string) {
  useEffect(() => {
    const supabase = createClient();

    const subscription = supabase
      .from(`assessments:id=eq.${assessmentId}`)
      .on('*', (payload) => {
        console.log('Assessment updated:', payload);
        // Handle update in UI
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [assessmentId]);
}
```

## Advanced: Batch Operations

### Bulk Insert Control Responses

```typescript
async function bulkInsertResponses(
  assessmentId: string,
  responses: Array<{
    controlId: string;
    response: string;
    evidence: string;
    score: number;
  }>
) {
  const supabase = createClient();

  const insertData = responses.map(r => ({
    assessment_id: assessmentId,
    control_id: r.controlId,
    response: r.response,
    evidence: r.evidence,
    score: r.score
  }));

  const { data, error } = await supabase
    .from('assessment_responses')
    .insert(insertData)
    .select();

  if (error) throw error;
  return data;
}
```

## TypeScript Types

The project includes TypeScript types from the database schema:

```typescript
import type { Database } from '@/lib/supabase/types';

type Assessment = Database['public']['Tables']['assessments']['Row'];
type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
type AssessmentUpdate = Database['public']['Tables']['assessments']['Update'];

// Type-safe queries
async function getAssessment(id: string): Promise<Assessment> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Assessment;
}
```

## Performance Tips

### Use Select to Limit Columns

```typescript
// Good: Only fetch needed columns
const { data } = await supabase
  .from('assessments')
  .select('id, name, status')
  .limit(10);

// Bad: Fetch all columns
const { data } = await supabase
  .from('assessments')
  .select('*')
  .limit(10);
```

### Use Count for Pagination

```typescript
const { data, count } = await supabase
  .from('assessments')
  .select('*', { count: 'exact' })
  .range(0, 9); // First 10 rows

console.log(`Showing 10 of ${count} total`);
```

### Filter on Server, Not Client

```typescript
// Good: Filter in database
const { data } = await supabase
  .from('assessments')
  .select('*')
  .eq('status', 'completed');

// Bad: Fetch all and filter in JS
const { data: all } = await supabase
  .from('assessments')
  .select('*');
const filtered = all.filter(a => a.status === 'completed');
```

## Testing

### Mock Supabase Client

```typescript
import { createClient } from '@/lib/supabase/client';
import { vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue({
      data: [],
      error: null
    })
  }))
}));
```

## Debugging

### Enable Debug Logging

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Enable debug mode
supabase.postgrest.headers = {
  'Prefer': 'params=single-object'
};

// Log all requests
if (process.env.NODE_ENV === 'development') {
  supabase.on('*', (event) => {
    console.log('Supabase event:', event);
  });
}
```

## Useful Resources

- **Supabase JS Docs**: https://supabase.com/docs/reference/javascript/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Database Schema**: See DATABASE_SCHEMA.md
- **Setup Guide**: See SUPABASE_SETUP.md

## Next Steps

1. Review the TypeScript types in `src/lib/supabase/types.ts`
2. Check the client implementations in `src/lib/supabase/`
3. Start building API routes in `src/app/api/`
4. Create components that use the clients
5. Set up real-time subscriptions for live updates
