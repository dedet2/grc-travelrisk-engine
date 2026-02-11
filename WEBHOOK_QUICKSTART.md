# Webhook Infrastructure - Quick Start

Get the webhook infrastructure up and running in 15 minutes.

## 1. Environment Setup (5 minutes)

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Airtable (get from https://airtable.com/account)
AIRTABLE_API_KEY=pat_your_token
AIRTABLE_BASE_ID=app_your_base_id

# Slack (create at https://api.slack.com/apps)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Make.com (generate in Make scenario)
MAKE_SIGNING_SECRET=your_make_secret

# Podia (generate in Podia settings)
PODIA_WEBHOOK_SECRET=your_podia_secret
```

## 2. Verify Setup (5 minutes)

Test the health endpoint:

```bash
npm run dev
```

Then in another terminal:

```bash
# Check all integrations
curl http://localhost:3000/api/admin/integrations/health \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "healthy": true,
  "integrations": [
    { "name": "Airtable", "configured": true, "working": true },
    { "name": "Slack", "configured": true, "working": true },
    { "name": "Make.com", "configured": true, "working": true },
    { "name": "Podia", "configured": true, "working": true }
  ]
}
```

## 3. Test Webhooks (5 minutes)

### Test Podia Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/podia \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "customer": {
        "email": "test@example.com",
        "name": "Test User"
      },
      "product_name": "Pro Plan"
    }
  }'
```

Expected: Customer appears in Airtable + Slack notification

### Test Make.com Webhook

First, generate the signature:

```bash
# In Node.js:
const crypto = require('crypto');
const secret = process.env.MAKE_SIGNING_SECRET;
const body = JSON.stringify({type:"agent.update",id:"agent-1",status:"Active",roi:5.2});
const sig = crypto.createHmac('sha256', secret).update(body).digest('hex');
console.log(sig);
```

Then test:

```bash
curl -X POST http://localhost:3000/api/webhooks/make \
  -H "Content-Type: application/json" \
  -H "X-Make-Signature: <paste_signature>" \
  -d '{
    "type": "agent.update",
    "id": "agent-123",
    "status": "Active",
    "roi": 5.2,
    "tasksCompleted": 10,
    "qualityScore": 0.95
  }'
```

Expected: Agent updated + Slack notification

## 4. Manage Roles

### List roles

```bash
curl http://localhost:3000/api/admin/roles \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Assign role

```bash
curl -X POST http://localhost:3000/api/admin/roles \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "role": "analyst"
  }'
```

### Available roles

- `admin` - Full access
- `analyst` - Can create/edit frameworks and assessments
- `viewer` - Read-only access

## 5. View Audit Logs

```bash
# Get user activity
curl "http://localhost:3000/api/admin/audit-log?type=user&userId=user_123" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Get resource audit
curl "http://localhost:3000/api/admin/audit-log?type=resource&resourceType=assessment&resourceId=abc123" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## API Quick Reference

### Webhooks

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/webhooks/podia | POST | Signature | Podia purchase events |
| /api/webhooks/make | POST | Signature | Make.com agent updates |

### Admin

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/admin/roles | GET | Clerk+Admin | List roles |
| /api/admin/roles | POST | Clerk+Admin | Assign role |
| /api/admin/audit-log | GET | Clerk+Admin | Get audit logs |
| /api/admin/audit-log | POST | Clerk+Admin | Create audit entry |
| /api/admin/integrations/health | GET | Clerk+Admin | Check integration status |

## Troubleshooting

### "Invalid signature" error

- Check `MAKE_SIGNING_SECRET` and `PODIA_WEBHOOK_SECRET` are set correctly
- For Podia, signature is optional if secret not configured
- Verify you're using the raw request body for signature calculation

### "Not authorized" error

- Ensure you have valid Clerk token
- For admin endpoints, you need admin role
- Check role assignment: `GET /api/admin/roles`

### "Integration not configured" in health check

- Set the corresponding environment variables
- Verify values are correct (not example values)
- For Podia, webhook works even without secret

### No Slack notifications

- Check `SLACK_WEBHOOK_URL` is correct
- Test manually: `curl -X POST $SLACK_WEBHOOK_URL -H "Content-Type: application/json" -d '{"text":"test"}'`
- Verify webhook is active in Slack admin

## Documentation

For detailed documentation, see:

- **Full Setup Guide**: `WEBHOOK_INTEGRATION_GUIDE.md`
- **Architecture Overview**: `WEBHOOK_INTEGRATION_SUMMARY.md`
- **Deployment Guide**: `WEBHOOK_DEPLOYMENT_CHECKLIST.md`

## What's Included

✓ Role-Based Access Control (RBAC)
✓ Webhook signature verification
✓ Airtable customer sync
✓ Slack notifications
✓ Audit logging
✓ Health checks
✓ Admin API endpoints

## Next Steps

1. Configure all environment variables
2. Set up external services (Airtable, Slack, etc.)
3. Test webhooks locally
4. Deploy to staging
5. Update webhook URLs in external services
6. Deploy to production

## Support

If issues occur:

1. Check health endpoint: `/api/admin/integrations/health`
2. Review logs for error messages
3. Verify environment variables are set
4. Check WEBHOOK_INTEGRATION_GUIDE.md troubleshooting section
5. Look for error notifications in Slack

---

**Ready to go!** Start with the health check and work through each step.
