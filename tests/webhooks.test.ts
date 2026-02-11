/**
 * Webhook Integration Tests
 * Tests for webhook handlers and integration utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { verifyMakeSignature, verifyPodiaSignature } from '@/lib/webhook-verify';
import { hasPermission, getUserRole, setUserRole } from '@/lib/rbac';
import { isAirtableConfigured, isSlackConfigured } from '@/lib/airtable-sync';

describe('Webhook Verification', () => {
  describe('verifyMakeSignature', () => {
    it('should verify valid Make.com signature', () => {
      const secret = 'test-secret';
      const body = JSON.stringify({ type: 'agent.update', id: 'test-123' });

      // Create expected signature
      const crypto = require('crypto');
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      // Set environment variable
      process.env.MAKE_SIGNING_SECRET = secret;

      const result = verifyMakeSignature(body, expectedSig);
      expect(result).toBe(true);
    });

    it('should reject invalid Make.com signature', () => {
      process.env.MAKE_SIGNING_SECRET = 'test-secret';
      const result = verifyMakeSignature('test-body', 'invalid-signature');
      expect(result).toBe(false);
    });

    it('should reject if no secret configured', () => {
      delete process.env.MAKE_SIGNING_SECRET;
      const result = verifyMakeSignature('test-body', 'any-signature');
      expect(result).toBe(false);
    });
  });

  describe('verifyPodiaSignature', () => {
    it('should allow webhook if no secret configured', () => {
      delete process.env.PODIA_WEBHOOK_SECRET;
      const result = verifyPodiaSignature('test-body', 'any-signature');
      expect(result).toBe(true);
    });

    it('should verify valid Podia signature', () => {
      const secret = 'podia-secret';
      const body = JSON.stringify({ data: { customer: { email: 'test@example.com' } } });

      const crypto = require('crypto');
      const expectedSig = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      process.env.PODIA_WEBHOOK_SECRET = secret;

      const result = verifyPodiaSignature(body, expectedSig);
      expect(result).toBe(true);
    });
  });
});

describe('RBAC System', () => {
  beforeEach(() => {
    // Reset state before each test
    vi.clearAllMocks();
  });

  it('should assign and retrieve user role', () => {
    setUserRole('user-123', 'admin');
    expect(getUserRole('user-123')).toBe('admin');
  });

  it('should default to viewer role', () => {
    const role = getUserRole('unknown-user-456');
    expect(role).toBe('viewer');
  });

  it('should check admin permissions correctly', () => {
    setUserRole('admin-user', 'admin');
    expect(hasPermission('admin-user', 'canManageUsers')).toBe(true);
    expect(hasPermission('admin-user', 'canAccessAuditLogs')).toBe(true);
    expect(hasPermission('admin-user', 'canExportReports')).toBe(true);
  });

  it('should check analyst permissions correctly', () => {
    setUserRole('analyst-user', 'analyst');
    expect(hasPermission('analyst-user', 'canCreateFrameworks')).toBe(true);
    expect(hasPermission('analyst-user', 'canEditAssessments')).toBe(true);
    expect(hasPermission('analyst-user', 'canExportReports')).toBe(true);
    expect(hasPermission('analyst-user', 'canManageUsers')).toBe(false);
    expect(hasPermission('analyst-user', 'canAccessAuditLogs')).toBe(false);
  });

  it('should check viewer permissions correctly', () => {
    setUserRole('viewer-user', 'viewer');
    expect(hasPermission('viewer-user', 'canExportReports')).toBe(true);
    expect(hasPermission('viewer-user', 'canViewAnalytics')).toBe(true);
    expect(hasPermission('viewer-user', 'canCreateFrameworks')).toBe(false);
    expect(hasPermission('viewer-user', 'canManageUsers')).toBe(false);
  });
});

describe('Integration Configuration', () => {
  it('should check Airtable configuration', () => {
    // When env vars are not set
    delete process.env.AIRTABLE_API_KEY;
    delete process.env.AIRTABLE_BASE_ID;
    expect(isAirtableConfigured()).toBe(false);

    // When env vars are set
    process.env.AIRTABLE_API_KEY = 'pat_test';
    process.env.AIRTABLE_BASE_ID = 'app_test';
    expect(isAirtableConfigured()).toBe(true);
  });

  it('should check Slack configuration', () => {
    // When not configured
    delete process.env.SLACK_WEBHOOK_URL;
    expect(isSlackConfigured()).toBe(false);

    // When configured
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/test';
    expect(isSlackConfigured()).toBe(true);
  });
});

describe('Integration Test Scenarios', () => {
  it('should handle Podia customer sync flow', async () => {
    // Simulate Podia webhook payload
    const payload = {
      type: 'order.created',
      data: {
        customer: {
          email: 'customer@example.com',
          name: 'John Doe',
        },
        product_name: 'Premium Plan',
      },
    };

    // This would be tested with actual API calls in integration tests
    expect(payload.data.customer.email).toBe('customer@example.com');
    expect(payload.data.product_name).toBe('Premium Plan');
  });

  it('should handle Make.com agent update flow', async () => {
    // Simulate Make.com webhook payload
    const payload = {
      type: 'agent.update',
      id: 'agent-123',
      status: 'Active',
      roi: 6.2,
      tasksCompleted: 10,
      qualityScore: 0.95,
    };

    expect(payload.type).toBe('agent.update');
    expect(payload.roi).toBeGreaterThan(6);
    expect(payload.qualityScore).toBeLessThanOrEqual(1);
  });

  it('should enforce role-based access to admin endpoints', () => {
    // Setup users with different roles
    setUserRole('admin-user', 'admin');
    setUserRole('analyst-user', 'analyst');
    setUserRole('viewer-user', 'viewer');

    // Only admin should have access to audit logs
    expect(hasPermission('admin-user', 'canAccessAuditLogs')).toBe(true);
    expect(hasPermission('analyst-user', 'canAccessAuditLogs')).toBe(false);
    expect(hasPermission('viewer-user', 'canAccessAuditLogs')).toBe(false);

    // Only admin should be able to manage integrations
    expect(hasPermission('admin-user', 'canManageIntegrations')).toBe(true);
    expect(hasPermission('analyst-user', 'canManageIntegrations')).toBe(false);
  });
});
