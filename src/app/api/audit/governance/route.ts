/**
 * Governance Audit API Routes
 * GET: Retrieve latest governance audit results or status
 * POST: Trigger a new governance audit
 */

import { createGovernanceAuditAgent, type GovernanceAuditReport, type BoardReadyReport } from '@/lib/agents/governance-audit-agent';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/audit/governance
 * Retrieve governance audit results and status
 *
 * Query parameters:
 * - type: 'latest' (default), 'board-summary', 'maturity-score', 'critical-gaps'
 * - includeDetails: 'true' or 'false' (default: true)
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const reportType = url.searchParams.get('type') || 'latest';
    const includeDetails = url.searchParams.get('includeDetails') !== 'false';

    const agent = createGovernanceAuditAgent();

    // Get the latest governance audit report
    const report = agent.getGovernanceReport();

    if (!report) {
      return Response.json(
        {
          success: false,
          error: 'No governance audit report available. Trigger a new audit using POST.',
          data: {
            status: 'no-data',
            message: 'Run a governance audit to generate initial report',
            lastRunAt: null,
          },
        } as ApiResponse<any>,
        { status: 404 }
      );
    }

    let responseData: any;

    switch (reportType) {
      case 'board-summary':
        responseData = {
          status: 'success',
          type: 'board-summary',
          data: {
            report: report.boardReport,
            generatedAt: report.timestamp,
          },
        };
        break;

      case 'maturity-score':
        responseData = {
          status: 'success',
          type: 'maturity-score',
          data: {
            overall: {
              score: report.governanceMaturity.overallScore,
              level: report.governanceMaturity.overallLevel,
            },
            dimensions: report.governanceMaturity.dimensionScores.map((d) => ({
              name: d.dimensionName,
              score: d.score,
              level: d.level,
              keyFindings: d.keyFindings,
            })),
            generatedAt: report.timestamp,
          },
        };
        break;

      case 'critical-gaps':
        responseData = {
          status: 'success',
          type: 'critical-gaps',
          data: {
            gaps: agent.getCriticalGaps(),
            policy: {
              count: report.policyEffectiveness.totalPolicies - report.policyEffectiveness.policiesUpToDate,
            },
            control: {
              overdueForTesting: report.controlEffectiveness.controlsOverdueForTesting,
              needingRemediation: report.controlEffectiveness.controlsNeedingRemediation,
            },
            compliance: {
              criticalGaps: report.complianceAnalysis.reduce(
                (sum, c) => sum + c.criticalGaps,
                0
              ),
            },
            generatedAt: report.timestamp,
          },
        };
        break;

      case 'latest':
      default:
        responseData = {
          status: 'success',
          type: 'full-report',
          data: includeDetails
            ? report
            : {
                reportId: report.reportId,
                timestamp: report.timestamp,
                governanceMaturity: {
                  overallScore: report.governanceMaturity.overallScore,
                  overallLevel: report.governanceMaturity.overallLevel,
                  dimensionCount: report.governanceMaturity.dimensionScores.length,
                },
                keyMetrics: report.boardReport.keyMetrics,
                riskIndicators: report.boardReport.riskIndicators,
                complianceStatus: report.boardReport.complianceStatus,
              },
        };
    }

    return Response.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching governance audit:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch governance audit',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/audit/governance
 * Trigger a new governance audit
 *
 * Request body (optional):
 * {
 *   "includeDetailedResults": true,
 *   "frameworks": ["SOC 2", "NIST CSF", "ISO 27001"]
 * }
 *
 * Returns:
 * - 202 Accepted with audit in progress
 * - 200 OK with completed audit results
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const agent = createGovernanceAuditAgent();

    const startTime = Date.now();
    console.log('[GovernanceAuditAPI] Starting governance audit...');

    // Run the audit
    const runResult = await agent.run();

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    if (runResult.status === 'completed') {
      // Get the generated report
      const report = agent.getGovernanceReport();

      if (!report) {
        return Response.json(
          {
            success: false,
            error: 'Audit completed but report could not be retrieved',
          } as ApiResponse<null>,
          { status: 500 }
        );
      }

      return Response.json(
        {
          success: true,
          data: {
            status: 'completed',
            auditId: report.reportId,
            durationMs,
            generatedAt: report.timestamp,
            summary: {
              governanceMaturityScore: report.governanceMaturity.overallScore,
              governanceMaturityLevel: report.governanceMaturity.overallLevel,
              keyMetrics: {
                policyEffectiveness: report.boardReport.keyMetrics.policyEffectivenessScore,
                controlEffectiveness: report.boardReport.keyMetrics.controlEffectivenessScore,
                riskManagement: report.boardReport.keyMetrics.riskManagementScore,
                compliance: report.boardReport.keyMetrics.complianceScore,
              },
              criticalGaps: agent.getCriticalGaps(),
            },
            reportId: report.reportId,
            boardReportSummary: {
              executiveSummary: report.boardReport.executiveSummary,
              nextReviewDate: report.boardReport.nextReviewDate,
              riskTrend: report.boardReport.riskIndicators.overallRiskTrend,
              remediationOnTrack: report.boardReport.complianceStatus.remediationOnTrack,
            },
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    } else {
      // Audit failed
      return Response.json(
        {
          success: false,
          error: `Audit failed: ${runResult.error || 'Unknown error'}`,
          data: {
            status: 'failed',
            durationMs,
            error: runResult.error,
            retryCount: runResult.retryCount,
          },
        } as ApiResponse<null>,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error running governance audit:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run governance audit',
        data: {
          status: 'error',
          message:
            error instanceof Error ? error.message : 'An unexpected error occurred during audit',
        },
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
