# A-01 GRC Framework Ingestion Agent - Implementation Guide

## Overview

The GRC Framework Ingestion Agent is a comprehensive system for managing, parsing, and ingesting governance, risk, and compliance (GRC) frameworks into your Next.js 14 application. It supports the ISO 27001:2022 standard with 14 control categories and 30+ representative controls.

## Features

- Parse GRC frameworks from CSV, JSON, and plain text formats
- Claude API integration for intelligent parsing of unstructured documents
- Seed built-in ISO 27001:2022 framework with 30 representative controls
- RESTful API endpoints for framework and control management
- Full TypeScript support with comprehensive type definitions
- Supabase database integration for persistent storage
- Clerk authentication for secure access control

## Architecture

### Core Modules

#### 1. **src/lib/grc/frameworks.ts**
Contains the ISO 27001:2022 control catalog with:
- 14 control categories (A.5 through A.18)
- 30+ representative controls with real control IDs
- Functions to query, search, and filter controls
- Category management utilities

#### 2. **src/lib/grc/parser.ts**
Framework document parsing:
- CSV format parsing
- JSON format parsing
- Plain text parsing with Claude API
- PDF support (via Claude API for document understanding)
- Validation and normalization utilities

#### 3. **src/lib/grc/utils.ts**
Database utilities:
- Framework retrieval and management
- Control querying with filtering
- Category breakdown calculations
- Framework statistics and analytics

#### 4. **src/types/grc.ts**
Type definitions:
- `FrameworkResponse`, `DetailedControl`, `FrameworkCategory`
- Enums for `ComplianceStatus`, `RiskLevel`, `ControlCriticality`
- Assessment and risk assessment types

### API Endpoints

#### Framework Management

**List Frameworks**
```
GET /api/frameworks?status=published
```
Returns all frameworks with control counts and category breakdown.

**Create Framework**
```
POST /api/frameworks
Body: {
  "name": "Framework Name",
  "version": "1.0",
  "description": "Description",
  "controls": [...],
  "status": "draft|published|archived"
}
```

**Get Framework Details**
```
GET /api/frameworks/{id}
```
Returns framework with category breakdown and control statistics.

**Delete Framework**
```
DELETE /api/frameworks/{id}
```
Deletes framework and all associated controls.

#### Control Management

**List Controls**
```
GET /api/frameworks/{id}/controls?category=A.5&limit=20&offset=0
```
Supports filtering by:
- `category`: Filter by control category (e.g., "A.5")
- `controlType`: Filter by type (technical, operational, management)
- `limit`: Results per page (default: 100, max: 1000)
- `offset`: Pagination offset

**Add Controls**
```
POST /api/frameworks/{id}/controls
Body: {
  "controls": [
    {
      "id": "A.5.1.1",
      "title": "Control Title",
      "description": "Description",
      "category": "A.5",
      "controlType": "technical|operational|management"
    }
  ]
}
```

#### Framework Ingestion

**Parse and Ingest Document**
```
POST /api/frameworks/ingest
Body: {
  "format": "csv|json|text",
  "content": "file content as string",
  "frameworkName": "Framework Name",
  "version": "1.0",
  "description": "Optional description",
  "publish": false
}
```

Supported formats:
- **CSV**: Standard comma-separated format with columns: control_id, category, title, description, control_type
- **JSON**: Structured JSON with framework metadata and controls array
- **Text**: Unstructured text that Claude will parse (requires ANTHROPIC_API_KEY)

#### Seeding

**Seed ISO 27001:2022**
```
POST /api/frameworks/seed
Headers: {
  "Authorization": "Bearer {SEED_API_KEY}" // Production only
}
```

**Check Seed Status**
```
GET /api/frameworks/seed
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude API (optional, required for text parsing)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Optional: Seed endpoint protection
SEED_API_KEY=your_seed_api_key
```

### 2. Database Migrations

The required schema is already defined in:
```
supabase/migrations/001_initial_schema.sql
```

Tables needed:
- `frameworks`: Framework definitions
- `controls`: Control definitions linked to frameworks
- `assessments`: Assessment records
- `assessment_responses`: Assessment responses

### 3. Initialize ISO 27001:2022

After deploying, call the seed endpoint to populate the built-in framework:

```bash
curl -X POST https://your-domain.com/api/frameworks/seed \
  -H "Content-Type: application/json"
```

Or in TypeScript:

```typescript
const response = await fetch('/api/frameworks/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const data = await response.json();
console.log('Seeded frameworks:', data.data);
```

## Usage Examples

### Example 1: Upload CSV Framework

```typescript
const csvContent = `control_id,category,title,description,control_type
A.5.1.1,A.5,Policies for information security,Establish information security policies,management
A.5.1.2,A.5,Information security roles,Define IS responsibilities,management`;

const response = await fetch('/api/frameworks/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    format: 'csv',
    content: csvContent,
    frameworkName: 'Custom Framework',
    version: '1.0',
    publish: false
  })
});

const result = await response.json();
console.log('Framework created:', result.data.framework.id);
```

### Example 2: Query Controls by Category

```typescript
const response = await fetch('/api/frameworks/uuid-1/controls?category=A.5&limit=10');
const data = await response.json();

console.log(`Found ${data.data.total} controls in category A.5`);
data.data.controls.forEach(control => {
  console.log(`${control.controlIdStr}: ${control.title}`);
});
```

### Example 3: Use Built-in Framework Utilities

```typescript
import {
  getFramework,
  getControlsByCategory,
  searchControls,
  getFrameworkStats
} from '@/lib/grc/frameworks';

// Get the ISO 27001:2022 framework
const framework = getFramework('ISO 27001:2022');
console.log(`Framework has ${framework?.controls.length} controls`);

// Get controls in a category
const a5Controls = getControlsByCategory('A.5');
console.log(`Category A.5 has ${a5Controls.length} controls`);

// Search for specific controls
const accessControls = searchControls('access management');
console.log(`Found ${accessControls.length} access-related controls`);

// Get statistics
const stats = getFrameworkStats('ISO 27001:2022');
console.log('Control statistics:', stats);
// Output:
// {
//   totalControls: 30,
//   byCategory: { 'A.5': 8, 'A.6': 8, ... },
//   byType: { technical: 12, operational: 10, management: 8 },
//   byCriticality: { critical: 5, high: 15, medium: 10 }
// }
```

### Example 4: Parse Unstructured Text with Claude

```typescript
const textContent = `
Information Security Policy
A.5.1.1 - All organizations must establish formal information security policies
A.5.1.2 - Roles and responsibilities must be clearly defined
A.6.1.1 - Personnel screening requirements must be documented
`;

const response = await fetch('/api/frameworks/ingest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    format: 'text',
    content: textContent,
    publish: false
  })
});

// Claude will extract controls and create the framework
const result = await response.json();
console.log('Parsed controls:', result.data.framework.controlCount);
```

## Database Schema

### frameworks table
```sql
CREATE TABLE public.frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### controls table
```sql
CREATE TABLE public.controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID NOT NULL REFERENCES frameworks(id),
  control_id_str TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  control_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ISO 27001:2022 Control Categories

The framework includes controls across 14 categories:

- **A.5**: Organizational Controls (8 controls)
- **A.6**: People Controls (8 controls)
- **A.7**: Physical Controls (14 controls)
- **A.8**: Technological Controls (32 controls)
- **A.9**: Cryptographic Controls (4 controls)
- **A.10**: Physical and Cryptographic Controls (3 controls)
- **A.11**: Logical and Access Controls (9 controls)
- **A.12**: Operations and Communications Security (14 controls)
- **A.13**: System Acquisition, Development and Maintenance (13 controls)
- **A.14**: Communications Security (4 controls)
- **A.15**: System and Communications Protection (7 controls)
- **A.16**: Identity and Access Management (5 controls)
- **A.17**: Incident Management (5 controls)
- **A.18**: Business Continuity Management (8 controls)

## Error Handling

All endpoints return standardized API responses:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
```

Common error codes:
- `400`: Bad request (invalid input, missing fields)
- `401`: Unauthorized (authentication required)
- `404`: Not found (framework or control not found)
- `409`: Conflict (resource already exists)
- `413`: Payload too large (content exceeds 10MB)
- `500`: Server error

## Performance Considerations

- Control counts are cached with framework queries
- Use pagination (limit/offset) for large result sets
- Category filters reduce database query load
- ISO 27001:2022 data is seeded at startup for instant access

## Security

- All write operations require Clerk authentication
- Framework deletion cascades to controls
- Row-level security (RLS) policies enforce data isolation
- Sensitive data (API keys, credentials) should never be in control descriptions
- Service role client restricted to seed endpoint only

## Extending the Framework

To add custom frameworks:

1. Create framework data in `src/lib/grc/frameworks.ts`
2. Add to `getFramework()` function
3. Update `listFrameworks()` to include new framework
4. Implement framework-specific utilities as needed

Example:

```typescript
export const MY_FRAMEWORK_CONTROLS: ParsedControl[] = [
  {
    id: 'CUSTOM.1.1.1',
    category: 'CUSTOM.1',
    title: 'Custom Control Title',
    description: 'Control description',
    controlType: 'technical',
    criticality: 'high'
  }
];

export function getFramework(name: string) {
  if (name.toLowerCase() === 'my framework') {
    return {
      name: 'My Framework',
      version: '1.0',
      description: 'Custom framework',
      categories: MY_FRAMEWORK_CATEGORIES,
      controls: MY_FRAMEWORK_CONTROLS
    };
  }
  // ... existing frameworks
}
```

## Troubleshooting

### Claude API Errors
If text parsing fails:
- Verify `ANTHROPIC_API_KEY` is set
- Check API quota and rate limits
- Ensure content is properly formatted UTF-8

### Database Errors
- Verify Supabase credentials in `.env.local`
- Check migration has been applied
- Ensure RLS policies are correct

### Validation Errors
- Validate CSV headers: control_id, category, title, description, control_type
- Ensure control IDs are unique within framework
- Verify control types are: technical, operational, or management

## API Testing

Use curl to test endpoints:

```bash
# Seed framework
curl -X POST http://localhost:3000/api/frameworks/seed

# List frameworks
curl http://localhost:3000/api/frameworks

# Get framework details
curl http://localhost:3000/api/frameworks/{framework-id}

# Get controls
curl http://localhost:3000/api/frameworks/{framework-id}/controls?category=A.5
```

## Next Steps

1. Deploy migrations to Supabase
2. Set environment variables
3. Call `/api/frameworks/seed` to initialize ISO 27001:2022
4. Start using the ingestion API to manage frameworks
5. Build assessment UI on top of framework controls
6. Integrate with risk scoring engine

## Support

For issues or questions:
- Check the type definitions in `src/types/grc.ts`
- Review examples in `src/lib/grc/examples.ts`
- Examine test patterns in the codebase
