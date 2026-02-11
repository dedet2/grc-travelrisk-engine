# Webhook Integration Guide

This document describes the webhook infrastructure integrated into the GRC TravelRisk Engine.

## Overview

The application now includes production-ready webhook handlers for:
- **Podia** - Customer purchase events
- **Make.com** - Automation triggers and agent updates
- **Airtable** - Customer data synchronization
- **Slack** - Event notifications

## Architecture

### Components

1. **Role-Based Access Control (RBAC)** - `src/lib/rbac.ts`
   - Admin, Analyst, Viewer roles
   - Permission-based authorization
   - Clerk integration for authentication

2. **Airtable Sync** - `src/lib/airtable-sync.ts`
   - Upsert customers by email
   - Batch syncing capabilities
   - Configurable via environment variables

3. **Webhook Verification** - `src/lib/webhook-verify.ts`
   - HMAC SHA256 signature verification
   - Support for Make.com and Podia webhooks

4. **Slack Notifications** - `src/lib/slack-notify.ts`
   - Simple and formatted message support
   - Contextual notifications for events

5. **Webhook Handlers**
   - `/api/webhooks/podia/route.ts` - Podia purchase webhook
   - `/api/webhooks/make/route.ts` - Make.com automation webhook

6. **Admin APIs**
   - `/api/admin/audit-log/route.ts` - Audit log retrieval and creation
   - `/api/admin/roles/route.ts` - Role management
   - `/api/admin/integrations/health/route.ts` - Integration health checks

## Environment Configuration

Add these variables to your `.env.local`:

```bash
# Airtable Configuration
AIRTABLE_API_KEY=pat_your_api_key_here
AIRTABLE_BASE_ID=app_your_base_id_here
AIRTABLE_TABLE_CUSTOMERS=Customers

# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Make.com Configuration
MAKE_SIGNING_SECRET=your_make_signing_secret

# Podia Configuration
PODIA_WEBHOOK_SECRET=your_podia_webhook_secret
```

## Setup Instructions

### 1. Airtable Setup

1. Get your API key from Airtable Account Settings
2. Find your Base ID from the API documentation
3. Set environment variables:
   ```
   AIRTABLE_API_KEY=pat_xxx
   AIRTABLE_BASE_ID=app_xxx
   AIRTABLE_TABLE_CUSTOMERS=Customers
   ```

### 2. Slack Setup

1. Create an Incoming Webhook in your Slack workspace:
   - Go to api.slack.com/apps
   - Create New App → From scratch
   - Enable Incoming Webhooks
   - Add New Webhook to Workspace
2. Copy the webhook URL to environment:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
   ```

### 3. Make.com Setup

1. In your Make scenario:
   - Add "Make a request" module
   - Set URL to: `https://your-app.com/api/webhooks/make`
   - Set Method to: POST
   - Add header: `X-Make-Signature: [signature from webhook settings]`
2. Configure signing secret in environment:
   ```
   MAKE_SIGNING_SECRET=your_secret_from_make
   ```

### 4. Podia Setup

1. In Podia Webhooks settings:
   - Create webhook URL: `https://your-app.com/api/webhooks/podia`
   - Set webhook secret (optional but recommended)
2. Configure in environment:
   ```
   PODIA_WEBHOOK_SECRET=your_secret_from_podia
   ```

## API Endpoints

### Webhook Endpoints

All webhook endpoints return JSON and require `force-dynamic` mode.

#### POST /api/webhooks/podia

Receives Podia purchase events and syncs customers to Airtable.

Request Headers:
- `X-Podia-Signature` (optional, but recommended)

Response:
```json
{
  "ok": true,
  "action": "created" | "updated"
}
```

#### POST /api/webhooks/make

Receives Make.com automation events and updates agent states.

Request Headers:
- `X-Make-Signature` (required)

Request Body:
```json
{
  "type": "agent.update",
  "id": "agent-123",
  "status": "Active",
  "roi": 6.2,
  "tasksCompleted": 10,
  "qualityScore": 0.95
}
```

Response:
```json
{
  "ok": true,
  "message": "Agent agent-123 updated",
  "agent": { /* agent data */ }
}
```

### Admin Endpoints

All admin endpoints require Clerk authentication and admin role.

#### GET /api/admin/audit-log

Retrieve audit logs for a resource or user.

Query Parameters:
- `type`: 'resource' | 'user' (default: 'resource')
- `resourceType`: string (required if type='resource')
- `resourceId`: string (required if type='resource')
- `userId`: string (required if type='user')
- `limit`: number (default: 50, max: 500)

Example:
```
GET /api/admin/audit-log?type=resource&resourceType=assessment&resourceId=abc123&limit=50
```

#### POST /api/admin/audit-log

Create a manual audit log entry.

Request Body:
```json
{
  "action": "manual_review",
  "resourceType": "assessment",
  "resourceId": "abc123",
  "details": {
    "reviewer": "admin@example.com",
    "notes": "Annual compliance review"
  }
}
```

#### GET /api/admin/roles

List all user roles (admin only).

Response:
```json
{
  "success": true,
  "data": [
    { "userId": "user_123", "role": "admin" },
    { "userId": "user_456", "role": "analyst" }
  ]
}
```

#### POST /api/admin/roles

Assign a role to a user (admin only).

Request Body:
```json
{
  "userId": "user_123",
  "role": "analyst"
}
```

#### GET /api/admin/integrations/health

Check health of configured integrations.

Response:
```json
{
  "success": true,
  "healthy": true,
  "integrations": [
    {
      "name": "Airtable",
      "configured": true,
      "working": true,
      "testedAt": "2024-02-11T12:00:00Z"
    }
  ],
  "summary": {
    "total": 4,
    "configured": 4,
    "working": 4
  }
}
```

## RBAC (Role-Based Access Control)

### Roles

- **Admin**: Full access to all features
- **Analyst**: Can create/edit frameworks, run assessments, export reports
- **Viewer**: Read-only access to analytics and reports

### Permissions by Role

| Permission | Admin | Analyst | Viewer |
|-----------|-------|---------|--------|
| canManageUsers | ✓ | ✗ | ✗ |
| canManageIntegrations | ✓ | ✗ | ✗ |
| canAccessAuditLogs | ✓ | ✗ | ✗ |
| canCreateFrameworks | ✓ | ✓ | ✗ |
| canEditFrameworks | ✓ | ✓ | ✗ |
| canDeleteFrameworks | ✓ | ✗ | ✗ |
| canRunAssessments | ✓ | ✓ | ✗ |
| canEditAssessments | ✓ | ✓ | ✗ |
| canExportReports | ✓ | ✓ | ✓ |
| canAccessWebhooks | ✓ | ✗ | ✗ |
| canConfigureWebhooks | ✓ | ✗ | ✗ |
| canViewAnalytics | ✓ | ✓ | ✓ |
| canExecuteAutomations | ✓ | ✗ | ✗ |
| canModifyAirtable | ✓ | ✗ | ✗ |

### Usage in Code

```typescript
import {
  requireRole,
  requirePermission,
  hasPermission,
  getCurrentUserRole
} from '@/lib/rbac';

// Require specific role
try {
  await requireRole('admin');
  // User is admin
} catch (error) {
  // User doesn't have required role
}

// Require specific permission
try {
  const userId = await requirePermission('canAccessAuditLogs');
  // User has permission
} catch (error) {
  // User doesn't have permission
}

// Check permission
if (hasPermission(userId, 'canExportReports')) {
  // Allow export
}

// Get current user's role
const role = await getCurrentUserRole();
```

## Data Models

### Agent (In-Memory Store)

The Make.com webhook updates agent data stored in memory:

```typescript
{
  id: string;
  status: string;
  roi: number;
  tasksCompleted: number;
  qualityScore: number;
  lastUpdated: Date;
}
```

### Airtable Customer Record

Synced from Podia webhooks:

```
Email: string
Name: string
Product: string
Status: "Active" | "Inactive"
PodiaEventType: string
SyncedAt: ISO8601 timestamp
```

### Audit Log

Created by API calls and manual logging:

```typescript
{
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}
```

## Testing

### Test Webhook Signatures

```bash
# Make.com signature
curl -X POST http://localhost:3000/api/webhooks/make \
  -H "X-Make-Signature: <computed_hmac>" \
  -H "Content-Type: application/json" \
  -d '{"type":"agent.update","id":"test-123","status":"Active"}'

# Podia signature
curl -X POST http://localhost:3000/api/webhooks/podia \
  -H "X-Podia-Signature: <computed_hmac>" \
  -H "Content-Type: application/json" \
  -d '{"data":{"customer":{"email":"test@example.com","name":"Test"}}}'
```

### Test Admin APIs

```bash
# Check integration health
curl -H "Authorization: Bearer <clerk_token>" \
  http://localhost:3000/api/admin/integrations/health

# Get audit logs
curl -H "Authorization: Bearer <clerk_token>" \
  "http://localhost:3000/api/admin/audit-log?type=resource&resourceType=assessment&resourceId=abc123"

# Assign role
curl -X POST http://localhost:3000/api/admin/roles \
  -H "Authorization: Bearer <clerk_token>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","role":"analyst"}'
```

## Security Considerations

1. **Signature Verification**: Always enable HMAC verification for webhooks
2. **Rate Limiting**: Consider implementing rate limits on webhook endpoints
3. **Authentication**: All admin endpoints require Clerk authentication
4. **Audit Logging**: All sensitive operations are logged with timestamps and user info
5. **Environment Variables**: Never commit secrets to version control
6. **Webhook URLs**: Keep URLs secret and rotate signing secrets periodically

## Troubleshooting

### Airtable Connection Failed

- Check `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` are set
- Verify API key has appropriate permissions
- Test with: `GET /api/admin/integrations/health`

### Slack Messages Not Arriving

- Verify `SLACK_WEBHOOK_URL` is correct
- Check webhook is active in Slack admin panel
- Look for errors in application logs

### Webhook Signature Invalid

- Ensure signing secret is configured correctly
- Verify raw request body is used for signature verification
- Check webhook isn't transforming the payload before sending

### Podia Customer Not Syncing

- Verify Airtable is configured (`GET /api/admin/integrations/health`)
- Check customer email is valid
- Look for error notifications in Slack

## Production Deployment

1. Set all environment variables in your deployment platform
2. Test all webhooks in staging first
3. Configure webhook URLs in external services (Podia, Make.com)
4. Monitor webhook delivery logs
5. Set up alerts for webhook failures
6. Regularly review audit logs for suspicious activity

## Support

For issues or questions about the webhook infrastructure, refer to:
- Slack API docs: https://api.slack.com/
- Make.com docs: https://www.make.com/docs
- Podia docs: https://support.podia.com/
- Airtable API: https://airtable.com/developers
