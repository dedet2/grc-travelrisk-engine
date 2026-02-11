/**
 * Security Audit API Routes
 * POST: Run security audit scan
 * GET: Get audit results and vulnerabilities
 */

import { createSecurityAuditAgent } from '@/lib/agents/security-audit-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/security-audit
 * Run security audit scan
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const agent = createSecurityAuditAgent();
    const result = await agent.run();

    return Response.json(
      {
        success: result.status === 'completed',
        data: {
          agentRun: result,
          securityReport: inMemoryStore.getSecurityAuditReport(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: result.status === 'completed' ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error running security audit:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run security audit',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/security-audit
 * Get security audit results
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const severity = url.searchParams.get('severity');

    const agent = createSecurityAuditAgent();
    const securityReport = inMemoryStore.getSecurityAuditReport();

    let vulnerabilities = agent.getCriticalVulnerabilities();
    if (severity) {
      vulnerabilities = securityReport
        ? securityReport.vulnerabilities.filter((v) => v.severity === severity)
        : [];
    }

    const failingChecks = agent.getFailingChecks();

    return Response.json(
      {
        success: true,
        data: {
          report: securityReport,
          vulnerabilities,
          failingChecks,
          criticalsCount: agent.getCriticalVulnerabilities().length,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching security audit:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch security audit',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
