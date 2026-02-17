/**
 * Audit Log API Routes
 * GET: Retrieve audit logs with advanced filtering
 * POST: Create audit log entries
 */

import { AuditLogger, type AuditEntry, type AuditSeverity, type AuditActionCategory } from '@/lib/audit-logger';
import { dataService } from '@/lib/supabase/data-service';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Realistic audit log entries for demonstration
 * Spanning the last 7 days with various GRC and business events
 */
const generateMockAuditLogs = (): AuditEntry[] => {
  const now = new Date();
  const logs: AuditEntry[] = [];

  // Helper to create date X hours ago
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

  // 1. User completed SOC 2 assessment
  logs.push({
    id: 'audit-001',
    timestamp: hoursAgo(2),
    userId: 'user-john-doe',
    userEmail: 'john.doe@company.com',
    action: 'assessment.complete',
    category: 'assessment',
    severity: 'info',
    entityType: 'assessment',
    entityId: 'assess-soc2-001',
    entityName: 'SOC 2 Type II Assessment',
    description: 'User completed SOC 2 Type II assessment',
    metadata: {
      frameworkId: 'fw-soc2',
      assessmentScore: 87,
      totalControls: 52,
      completedControls: 52,
      compliancePercentage: 87,
    },
    source: 'ui',
  });

  // 2. Framework imported
  logs.push({
    id: 'audit-002',
    timestamp: hoursAgo(6),
    userId: 'user-admin-sarah',
    userEmail: 'sarah.admin@company.com',
    action: 'framework.import',
    category: 'framework',
    severity: 'info',
    entityType: 'framework',
    entityId: 'fw-nist-csf-2',
    entityName: 'NIST Cybersecurity Framework 2.0',
    description: 'Framework NIST CSF 2.0 imported into system',
    metadata: {
      sourceUrl: 'https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf',
      totalControls: 103,
      categories: ['Govern', 'Protect', 'Detect', 'Respond', 'Recover'],
    },
    source: 'ui',
  });

  // 3. Travel advisory updated
  logs.push({
    id: 'audit-003',
    timestamp: hoursAgo(12),
    userId: 'user-system',
    userEmail: 'system@company.com',
    action: 'advisory.update',
    category: 'advisory',
    severity: 'warning',
    entityType: 'advisory',
    entityId: 'country-il',
    entityName: 'Israel',
    description: 'Travel advisory updated for Israel',
    changes: {
      advisoryLevel: { before: 2, after: 3 },
      status: { before: 'moderate', after: 'reconsider' },
    },
    metadata: {
      countryCode: 'IL',
      reason: 'Escalated security concerns',
      affectedTravelPolicies: ['executive-travel', 'employee-trips'],
    },
    source: 'automation',
  });

  // 4. Agent executed GRC Framework assessment
  logs.push({
    id: 'audit-004',
    timestamp: hoursAgo(18),
    userId: 'user-system',
    userEmail: 'system@company.com',
    action: 'agent.run',
    category: 'agent',
    severity: 'info',
    entityType: 'agent',
    entityId: 'agent-a-01',
    entityName: 'GRC Framework Assessment Agent A-01',
    description: 'Agent A-01 GRC Framework scored risk at 42',
    metadata: {
      agentName: 'GRC Framework Assessment Agent A-01',
      taskTitle: 'Assess Framework Coverage',
      riskScore: 42,
      riskLevel: 'medium',
      tasksCompleted: 52,
      totalTasks: 52,
      latencyMs: 3245,
      inputTokens: 8500,
      outputTokens: 2100,
      costUsd: 0.11,
      autonomyLevel: 'medium',
      humanReviewed: true,
      outputInRange: true,
    },
    source: 'agent',
  });

  // 5. User exported compliance report
  logs.push({
    id: 'audit-005',
    timestamp: hoursAgo(24),
    userId: 'user-jane-smith',
    userEmail: 'jane.smith@company.com',
    action: 'report.export',
    category: 'report',
    severity: 'info',
    entityType: 'report',
    entityId: 'report-compliance-001',
    entityName: 'Compliance Dashboard Report',
    description: 'User exported compliance report',
    metadata: {
      reportType: 'compliance-dashboard',
      format: 'pdf',
      fileSize: '2.4 MB',
      includeData: ['assessments', 'controls', 'remediation_items'],
      recipientCount: 1,
    },
    source: 'ui',
  });

  // 6. Control marked as compliant
  logs.push({
    id: 'audit-006',
    timestamp: hoursAgo(30),
    userId: 'user-john-doe',
    userEmail: 'john.doe@company.com',
    action: 'control.update',
    category: 'control',
    severity: 'info',
    entityType: 'control',
    entityId: 'ctrl-ac-01',
    entityName: 'AC-01: Access Control Policy',
    description: 'Control AC-01 marked compliant',
    changes: {
      status: { before: 'partially-implemented', after: 'implemented' },
      score: { before: 65, after: 100 },
    },
    metadata: {
      framework: 'NIST CSF',
      category: 'Access Control',
      evidence: 'Policy document uploaded, review completed',
    },
    source: 'ui',
  });

  // 7. New prospect added to CRM
  logs.push({
    id: 'audit-007',
    timestamp: hoursAgo(36),
    userId: 'user-sales-mike',
    userEmail: 'mike.sales@company.com',
    action: 'crm.create',
    category: 'crm',
    severity: 'info',
    entityType: 'prospect',
    entityId: 'prospect-001',
    entityName: 'Acme Corporation',
    description: 'New prospect added to pipeline',
    metadata: {
      companyName: 'Acme Corporation',
      industry: 'Technology',
      employeeCount: 2500,
      estimatedAnnualRevenue: '$500M+',
      stage: 'initial-contact',
      icpMatch: 92,
    },
    source: 'ui',
  });

  // 8. RBAC permissions updated
  logs.push({
    id: 'audit-008',
    timestamp: hoursAgo(42),
    userId: 'user-admin-sarah',
    userEmail: 'sarah.admin@company.com',
    action: 'rbac.update',
    category: 'rbac',
    severity: 'warning',
    entityType: 'user',
    entityId: 'user-new-analyst',
    entityName: 'New Security Analyst',
    description: 'Admin changed RBAC permissions',
    changes: {
      roles: {
        before: ['viewer'],
        after: ['analyst', 'assessor'],
      },
      permissions: {
        before: ['read:assessments', 'read:frameworks'],
        after: ['read:assessments', 'read:frameworks', 'write:responses', 'write:evidence'],
      },
    },
    metadata: {
      changedBy: 'sarah.admin@company.com',
      justification: 'New team member onboarding - security assessment team',
    },
    source: 'ui',
  });

  // 9. User logged in
  logs.push({
    id: 'audit-009',
    timestamp: hoursAgo(48),
    userId: 'user-john-doe',
    userEmail: 'john.doe@company.com',
    action: 'auth.login',
    category: 'auth',
    severity: 'info',
    entityType: 'user',
    entityId: 'user-john-doe',
    description: 'User logged in',
    metadata: {
      mfaUsed: true,
      sessionDuration: 14400,
      browserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    },
    ipAddress: '203.0.113.45',
    source: 'ui',
  });

  // 10. Framework assessment completed
  logs.push({
    id: 'audit-010',
    timestamp: hoursAgo(54),
    userId: 'user-jane-smith',
    userEmail: 'jane.smith@company.com',
    action: 'assessment.complete',
    category: 'assessment',
    severity: 'info',
    entityType: 'assessment',
    entityId: 'assess-nist-csf-001',
    entityName: 'NIST CSF 2.0 Assessment',
    description: 'User completed NIST CSF 2.0 assessment',
    metadata: {
      frameworkId: 'fw-nist-csf',
      assessmentScore: 73,
      totalControls: 103,
      completedControls: 103,
      criticalGaps: 12,
      immediateActions: 5,
    },
    source: 'ui',
  });

  // 11. Travel risk assessment
  logs.push({
    id: 'audit-011',
    timestamp: hoursAgo(60),
    userId: 'user-system',
    userEmail: 'system@company.com',
    action: 'risk.assessed',
    category: 'advisory',
    severity: 'info',
    entityType: 'advisory',
    entityId: 'travel-assessment-001',
    entityName: 'Executive Travel - Europe Trip',
    description: 'Risk assessment completed for executive travel',
    metadata: {
      destination: 'France',
      riskScore: 18,
      riskLevel: 'low',
      factors: ['stable-government', 'low-crime', 'good-infrastructure'],
      recommendations: ['standard-precautions', 'travel-insurance'],
    },
    source: 'automation',
  });

  // 12. Failed login attempt
  logs.push({
    id: 'audit-012',
    timestamp: hoursAgo(66),
    userId: 'unknown-user',
    action: 'auth.failed_login',
    category: 'auth',
    severity: 'warning',
    entityType: 'user',
    description: 'Failed login attempt',
    metadata: {
      attemptCount: 3,
      reason: 'Invalid credentials',
      email: 'hacker@external.com',
    },
    ipAddress: '198.51.100.89',
    source: 'ui',
  });

  // 13. Password changed
  logs.push({
    id: 'audit-013',
    timestamp: hoursAgo(72),
    userId: 'user-mike-wilson',
    userEmail: 'mike.wilson@company.com',
    action: 'auth.password_change',
    category: 'auth',
    severity: 'info',
    entityType: 'user',
    entityId: 'user-mike-wilson',
    description: 'User changed password',
    metadata: {
      previousPasswordAge: '89 days',
      enforceReason: 'Regular security policy',
    },
    source: 'ui',
  });

  // 14. MFA enabled
  logs.push({
    id: 'audit-014',
    timestamp: hoursAgo(78),
    userId: 'user-alex-turner',
    userEmail: 'alex.turner@company.com',
    action: 'auth.mfa_enabled',
    category: 'auth',
    severity: 'info',
    entityType: 'user',
    entityId: 'user-alex-turner',
    description: 'Multi-factor authentication enabled',
    metadata: {
      mfaMethod: 'authenticator-app',
      backupCodesGenerated: 10,
    },
    source: 'ui',
  });

  // 15. CRM prospect updated
  logs.push({
    id: 'audit-015',
    timestamp: hoursAgo(84),
    userId: 'user-sales-mike',
    userEmail: 'mike.sales@company.com',
    action: 'crm.update',
    category: 'crm',
    severity: 'info',
    entityType: 'prospect',
    entityId: 'prospect-001',
    entityName: 'Acme Corporation',
    description: 'Prospect moved to next stage in pipeline',
    changes: {
      stage: { before: 'initial-contact', after: 'needs-analysis' },
      nextAction: { before: 'waiting', after: 'schedule-demo' },
    },
    metadata: {
      companyName: 'Acme Corporation',
      daysInCurrentStage: 5,
    },
    source: 'ui',
  });

  // 16. Control response evidence submitted
  logs.push({
    id: 'audit-016',
    timestamp: hoursAgo(90),
    userId: 'user-compliance-bob',
    userEmail: 'bob.compliance@company.com',
    action: 'control.update',
    category: 'control',
    severity: 'info',
    entityType: 'control',
    entityId: 'ctrl-sc-07',
    entityName: 'SC-07: Boundary Protection',
    description: 'Control SC-07 evidence submitted',
    changes: {
      status: { before: 'not-addressed', after: 'partially-implemented' },
      score: { before: 0, after: 45 },
    },
    metadata: {
      framework: 'NIST 800-53',
      evidence: [
        'network-architecture-diagram.pdf',
        'firewall-rules-audit.xlsx',
        'ips-configuration.docx',
      ],
      submittedBy: 'bob.compliance@company.com',
    },
    source: 'ui',
  });

  // 17. Report shared with stakeholders
  logs.push({
    id: 'audit-017',
    timestamp: hoursAgo(96),
    userId: 'user-jane-smith',
    userEmail: 'jane.smith@company.com',
    action: 'report.export',
    category: 'report',
    severity: 'info',
    entityType: 'report',
    entityId: 'report-executive-summary-001',
    entityName: 'Executive Summary - Compliance Status',
    description: 'User exported compliance report for stakeholder review',
    metadata: {
      reportType: 'executive-summary',
      format: 'pptx',
      recipients: 5,
      confidentialLevel: 'internal-only',
    },
    source: 'ui',
  });

  // 18. Agent completed travel risk scoring
  logs.push({
    id: 'audit-018',
    timestamp: hoursAgo(102),
    userId: 'user-system',
    userEmail: 'system@company.com',
    action: 'agent.run',
    category: 'agent',
    severity: 'info',
    entityType: 'agent',
    entityId: 'agent-travel-risk-01',
    entityName: 'Travel Risk Scoring Agent',
    description: 'Travel Risk Scoring Agent completed assessment of 45 destinations',
    metadata: {
      agentName: 'Travel Risk Scoring Agent',
      taskTitle: 'Score Travel Destinations',
      destinationsProcessed: 45,
      tasksCompleted: 45,
      totalTasks: 45,
      latencyMs: 12500,
      averageRiskScore: 35,
      inputTokens: 22000,
      outputTokens: 8900,
      costUsd: 0.31,
    },
    source: 'agent',
  });

  // 19. Framework updated
  logs.push({
    id: 'audit-019',
    timestamp: hoursAgo(108),
    userId: 'user-admin-sarah',
    userEmail: 'sarah.admin@company.com',
    action: 'framework.import',
    category: 'framework',
    severity: 'info',
    entityType: 'framework',
    entityId: 'fw-iso-27001',
    entityName: 'ISO/IEC 27001:2022',
    description: 'Framework ISO/IEC 27001:2022 updated to latest version',
    changes: {
      version: { before: '2013', after: '2022' },
      totalControls: { before: 114, after: 93 },
    },
    metadata: {
      releaseDate: '2022-10-18',
      majorChanges: [
        'Governance consolidation',
        'Enhanced scope of applicability',
        'Risk assessment changes',
      ],
    },
    source: 'automation',
  });

  // 20. Compliance certificate generated
  logs.push({
    id: 'audit-020',
    timestamp: hoursAgo(114),
    userId: 'user-jane-smith',
    userEmail: 'jane.smith@company.com',
    action: 'report.export',
    category: 'report',
    severity: 'info',
    entityType: 'report',
    entityId: 'report-certificate-001',
    entityName: 'Compliance Certificate - SOC 2',
    description: 'User exported compliance certificate for SOC 2 certification',
    metadata: {
      reportType: 'certification-certificate',
      format: 'pdf',
      validFrom: '2024-02-17',
      validUntil: '2026-02-17',
      certificationBody: 'AICPA',
    },
    source: 'ui',
  });

  return logs;
};

/**
 * GET /api/audit
 * Retrieve audit logs with advanced filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);

    // Extract query parameters
    const userId = url.searchParams.get('userId');
    const action = url.searchParams.get('action');
    const entityType = url.searchParams.get('entityType');
    const severity = url.searchParams.get('severity') as AuditSeverity | null;
    const category = url.searchParams.get('category') as AuditActionCategory | null;
    const sinceHours = url.searchParams.get('sinceHours');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get audit logs from multiple sources
    const mockLogs = generateMockAuditLogs();
    const inMemoryLogs = AuditLogger.getInMemoryLogs({
      userId: userId || undefined,
      category: category || undefined,
      severity: severity || undefined,
      limit: 1000,
    });

    // Combine logs (prefer in-memory first, then mock data)
    const allLogs = [...inMemoryLogs, ...mockLogs];

    // Filter logs
    let filteredLogs = allLogs;

    if (userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === userId);
    }

    if (action) {
      filteredLogs = filteredLogs.filter((log) => log.action === action);
    }

    if (entityType) {
      filteredLogs = filteredLogs.filter((log) => log.entityType === entityType);
    }

    if (severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === severity);
    }

    if (category) {
      filteredLogs = filteredLogs.filter((log) => log.category === category);
    }

    if (sinceHours) {
      const since = new Date(Date.now() - parseInt(sinceHours) * 60 * 60 * 1000);
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= since);
    }

    // Sort by timestamp descending
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const total = filteredLogs.length;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Get statistics
    const stats = AuditLogger.getInMemoryStatistics();

    return Response.json(
      {
        success: true,
        data: {
          logs: paginatedLogs,
          pagination: {
            limit,
            offset,
            total,
            hasMore: offset + limit < total,
          },
          filters: {
            userId: userId || null,
            action: action || null,
            entityType: entityType || null,
            severity: severity || null,
            category: category || null,
            sinceHours: sinceHours || null,
          },
          statistics: stats,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit
 * Create a new audit log entry
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    // Validate required fields
    const { userId, action, category, entityType, description, severity = 'info', ...rest } = body;

    if (!userId || !action || !category || !entityType || !description) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: userId, action, category, entityType, description',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create audit log entry
    const auditEntry = await AuditLogger.log({
      userId,
      action,
      category,
      entityType,
      description,
      severity: severity as AuditSeverity,
      source: rest.source || 'api',
      ...rest,
    });

    return Response.json(
      {
        success: true,
        data: auditEntry,
        timestamp: new Date(),
      } as ApiResponse<AuditEntry>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating audit log:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create audit log',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
