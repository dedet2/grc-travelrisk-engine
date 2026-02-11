/**
 * Combined Risk API Routes
 * POST: Run risk combiner for assessment + destination
 * GET: Retrieve combined risk report
 */

import { createUnifiedRiskCombinerAgent } from '@/lib/agents/unified-risk-combiner-agent';
import { store } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';
import type { CombinedRiskReport } from '@/lib/agents/unified-risk-combiner-agent';

export const dynamic = 'force-dynamic';

/**
 * POST /api/combined-risk
 * Run the risk combiner agent and return combined report
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { assessmentId, destination, tripId, grcWeight, travelWeight } = body;

    if (!assessmentId) {
      return Response.json(
        {
          success: false,
          error: 'assessmentId is required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create agent with optional custom weights
    const agentConfig: any = {};
    if (grcWeight !== undefined && travelWeight !== undefined) {
      agentConfig.grcWeight = grcWeight;
      agentConfig.travelWeight = travelWeight;
    }

    const agent = createUnifiedRiskCombinerAgent(agentConfig);

    // Combine risks
    const report = await agent.combineRisks(assessmentId, tripId, destination);

    return Response.json(
      {
        success: true,
        data: report,
        timestamp: new Date(),
      } as ApiResponse<CombinedRiskReport>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error running risk combiner:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to combine risks',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/combined-risk?reportId=...&assessmentId=...
 * Retrieve a combined risk report by ID or latest for assessment
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');
    const assessmentId = searchParams.get('assessmentId');

    let report: CombinedRiskReport | undefined;

    if (reportId) {
      // Get specific report by ID
      report = store.getCombinedRiskReport(reportId);

      if (!report) {
        return Response.json(
          {
            success: false,
            error: `Report "${reportId}" not found`,
          } as ApiResponse<null>,
          { status: 404 }
        );
      }
    } else if (assessmentId) {
      // Get latest report for assessment
      const reports = store.getCombinedRiskReportsByAssessment(assessmentId);
      report = reports.length > 0 ? reports[reports.length - 1] : undefined;

      if (!report) {
        return Response.json(
          {
            success: false,
            error: `No reports found for assessment "${assessmentId}"`,
          } as ApiResponse<null>,
          { status: 404 }
        );
      }
    } else {
      // Get most recent report
      report = store.getLastCombinedRiskReport();

      if (!report) {
        return Response.json(
          {
            success: false,
            error: 'No reports available',
          } as ApiResponse<null>,
          { status: 404 }
        );
      }
    }

    return Response.json(
      {
        success: true,
        data: report,
        timestamp: new Date(),
      } as ApiResponse<CombinedRiskReport>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching combined risk report:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
