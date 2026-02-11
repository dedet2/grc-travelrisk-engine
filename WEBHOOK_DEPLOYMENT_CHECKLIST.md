# Webhook Infrastructure Deployment Checklist

Use this checklist to ensure proper deployment of the webhook infrastructure.

## Pre-Deployment: Configuration

### Airtable Setup
- [ ] Create Airtable account or use existing workspace
- [ ] Create a new Base for customer management
- [ ] Create "Customers" table with fields:
  - [ ] Email (email field)
  - [ ] Name (single line text)
  - [ ] Product (single line text)
  - [ ] Status (select: Active, Inactive, Churn)
  - [ ] PodiaEventType (single line text)
  - [ ] SyncedAt (date)
- [ ] Generate API token in Account Settings
  - [ ] Copy API key to `AIRTABLE_API_KEY`
  - [ ] Copy Base ID to `AIRTABLE_BASE_ID`
- [ ] Test API access: `GET /api/admin/integrations/health`

### Slack Setup
- [ ] Create or use existing Slack workspace
- [ ] Go to https://api.slack.com/apps
- [ ] Create New App → From scratch
- [ ] Name: "GRC TravelRisk Engine"
- [ ] Select workspace
- [ ] Go to "Incoming Webhooks" in left sidebar
- [ ] Click "Add New Webhook to Workspace"
- [ ] Select channel (e.g., #webhooks or #notifications)
- [ ] Authorize app
- [ ] Copy webhook URL to `SLACK_WEBHOOK_URL`
- [ ] Test webhook: `GET /api/admin/integrations/health`

### Make.com Setup
- [ ] Create or use existing Make.com account
- [ ] Create a scenario that will send webhooks
- [ ] In scenario, add a "Make a request" module
- [ ] Configure webhook:
  - [ ] URL: `https://your-domain.com/api/webhooks/make`
  - [ ] Method: POST
  - [ ] Add Custom Header:
    - [ ] Header Name: `X-Make-Signature`
    - [ ] Header Value: (generate secret)
- [ ] Generate or copy signing secret
- [ ] Store in `MAKE_SIGNING_SECRET`
- [ ] Test webhook with sample payload

### Podia Setup
- [ ] Create or use existing Podia account
- [ ] Go to Integrations/Webhooks settings
- [ ] Create webhook:
  - [ ] URL: `https://your-domain.com/api/webhooks/podia`
  - [ ] Events: Select "Purchase" or "Order Created"
  - [ ] (Optional) Generate signing secret
- [ ] Store secret in `PODIA_WEBHOOK_SECRET` (optional)
- [ ] Test webhook delivery

## Deployment Steps

### Step 1: Environment Variables
- [ ] Update `.env.local` (or deployment platform secrets):
  ```
  AIRTABLE_API_KEY=pat_xxx
  AIRTABLE_BASE_ID=app_xxx
  AIRTABLE_TABLE_CUSTOMERS=Customers
  SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
  MAKE_SIGNING_SECRET=xxx
  PODIA_WEBHOOK_SECRET=xxx
  ```
- [ ] Verify no secrets are committed to git
- [ ] Use platform-specific secret management (Vercel, etc.)

### Step 2: Code Deployment
- [ ] Pull latest code from repository
- [ ] Verify all new files are present:
  - [ ] `src/lib/rbac.ts`
  - [ ] `src/lib/airtable-sync.ts`
  - [ ] `src/lib/webhook-verify.ts`
  - [ ] `src/lib/slack-notify.ts`
  - [ ] `src/app/api/webhooks/podia/route.ts`
  - [ ] `src/app/api/webhooks/make/route.ts`
  - [ ] `src/app/api/admin/audit-log/route.ts`
  - [ ] `src/app/api/admin/roles/route.ts`
  - [ ] `src/app/api/admin/integrations/health/route.ts`
- [ ] Run type check: `npm run type-check`
- [ ] Run tests: `npm run test`
- [ ] Build: `npm run build`

### Step 3: Deploy to Staging
- [ ] Deploy to staging environment
- [ ] Update webhook URLs in Podia/Make.com to staging domain
- [ ] Verify all services are accessible

## Testing: Staging Environment

### Integration Health Check
- [ ] Call: `GET /api/admin/integrations/health`
- [ ] Verify response shows all integrations
- [ ] Expected status for each:
  - [ ] Airtable: configured=true, working=true
  - [ ] Slack: configured=true, working=true
  - [ ] Make.com: configured=true, working=true
  - [ ] Podia: configured=true (working=true or working depends on secret)

### Airtable Integration
- [ ] Call Podia webhook manually with test data
- [ ] Verify customer appears in Airtable within 5 seconds
- [ ] Verify fields populated correctly
- [ ] Test update: Send webhook with same email again
- [ ] Verify record updated (not duplicated)

### Slack Integration
- [ ] Verify notification appears in Slack channel for each webhook
- [ ] Check message format and content
- [ ] Verify error notifications when API is misconfigured

### Make.com Integration
- [ ] Send test agent.update webhook with valid signature
- [ ] Verify agent state is updated in memory
- [ ] Call to `getAgent()` or check via logging
- [ ] Verify Slack notification received
- [ ] Test with invalid signature:
  - [ ] Verify webhook returns 401 Unauthorized

### Podia Integration
- [ ] Send test purchase webhook
- [ ] Verify signature verification works
- [ ] Test with and without signature (if optional)
- [ ] Verify customer synced to Airtable

### RBAC System
- [ ] Test role assignment: `POST /api/admin/roles`
  - [ ] Assign user as admin
  - [ ] Assign user as analyst
  - [ ] Assign user as viewer
- [ ] Test role retrieval: `GET /api/admin/roles`
  - [ ] Verify assigned roles returned
- [ ] Test permission enforcement
  - [ ] Try to access audit logs as viewer: should fail
  - [ ] Try to access audit logs as admin: should succeed

### Audit Logging
- [ ] Test audit log creation: `POST /api/admin/audit-log`
  - [ ] Create log entry with valid data
  - [ ] Verify entry stored
- [ ] Test audit log retrieval: `GET /api/admin/audit-log`
  - [ ] Query by resource
  - [ ] Query by user
  - [ ] Verify results returned

### Load Testing (Optional)
- [ ] Send 10 sequential Podia webhooks
- [ ] Send 10 sequential Make.com webhooks
- [ ] Monitor response times (should be <1s)
- [ ] Verify all data synced correctly
- [ ] Check for any errors in logs

## Pre-Production Review

### Security Review
- [ ] All environment variables are secrets (not hardcoded)
- [ ] Webhook signatures verified with timing-safe comparison
- [ ] Admin endpoints require Clerk authentication
- [ ] RBAC permissions properly enforced
- [ ] No sensitive data in error messages
- [ ] No sensitive data in logs
- [ ] Webhook URLs use HTTPS (not HTTP)

### Performance Review
- [ ] Webhook handlers respond in <1 second
- [ ] No N+1 queries to external APIs
- [ ] In-memory store is efficient
- [ ] Error handling doesn't block response

### Documentation Review
- [ ] All endpoints documented in guide
- [ ] Environment variables documented
- [ ] Example payloads provided
- [ ] Testing instructions clear
- [ ] Troubleshooting guide covers common issues

## Production Deployment

### Step 1: Final Pre-Flight
- [ ] All tests passing: `npm run test`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Build successful: `npm run build`
- [ ] Staging environment fully tested
- [ ] No rollback plan needed (new features)

### Step 2: Deploy to Production
- [ ] Set production secrets in deployment platform
- [ ] Deploy code to production
- [ ] Verify all endpoints accessible
- [ ] Run health check: `GET /api/admin/integrations/health`

### Step 3: Update External Services
- [ ] Update Podia webhook URL to production domain
- [ ] Update Make.com webhook URL to production domain
- [ ] Verify webhooks configured correctly
- [ ] Send test webhooks to verify

### Step 4: Enable Monitoring
- [ ] Set up error monitoring (Sentry, Datadog, etc.)
- [ ] Set up performance monitoring
- [ ] Set up audit log alerts for suspicious activity
- [ ] Set up Slack alerts for integration failures

### Step 5: Documentation
- [ ] Update runbooks with new endpoints
- [ ] Document incident response procedures
- [ ] Distribute guide to team members
- [ ] Conduct training if needed

## Post-Deployment: Monitoring (First 48 Hours)

### Hour 1-6: Active Monitoring
- [ ] Monitor error logs for any failures
- [ ] Monitor webhook delivery latency
- [ ] Monitor Airtable sync success rate
- [ ] Monitor Slack notification delivery
- [ ] Check audit logs for unexpected activity

### Hour 6-24: Continuous Monitoring
- [ ] Verify customer data quality in Airtable
- [ ] Monitor API response times
- [ ] Check for any webhook signature failures
- [ ] Review Slack notifications for errors

### Hour 24-48: Stability Check
- [ ] Run full integration health check
- [ ] Verify audit logs are complete
- [ ] Spot-check random customer records in Airtable
- [ ] Verify no spike in error rates
- [ ] Review performance metrics

### Issues During Deployment
If issues occur:
- [ ] Check environment variables are set correctly
- [ ] Verify external service connectivity
- [ ] Review error logs for specific issues
- [ ] Check webhook signature configuration
- [ ] Verify Clerk authentication working
- [ ] Check for any recent changes to external APIs

## Rollback Plan

If critical issues occur:
- [ ] Disable webhook endpoints (set to return 503)
- [ ] Restore previous deployment
- [ ] Investigate root cause
- [ ] Fix and re-test in staging
- [ ] Deploy again after verification

## Post-Deployment: Long-Term

### Weekly
- [ ] Review audit logs for anomalies
- [ ] Check integration health status
- [ ] Verify Airtable data quality
- [ ] Monitor webhook delivery rates

### Monthly
- [ ] Rotate webhook signing secrets (if applicable)
- [ ] Review and update documentation
- [ ] Analyze webhook payload trends
- [ ] Optimize slow endpoints

### Quarterly
- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Capacity planning review
- [ ] Update incident response procedures

## Support Contacts

- **Airtable Support**: https://airtable.com/support
- **Slack Support**: https://slack.com/help
- **Make.com Support**: https://www.make.com/support
- **Podia Support**: https://support.podia.com/
- **Clerk Support**: https://clerk.com/support

## Sign-Off

- [ ] Development Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______

## Notes

```
[Add any deployment notes or issues encountered]
```

---

**Deployment Date**: __________
**Deployed By**: __________
**Status**: [ ] Successful [ ] Rollback [ ] Partial (issues noted)
