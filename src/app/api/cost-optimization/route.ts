/**
 * Cost Optimization API Routes
 * POST: Run cost analysis
 * GET: Get cost metrics and savings recommendations
 */

import { createCostOptimizationAgent } from '@/lib/agents/cost-optimization-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/cost-optimization
 * Run cost optimization analysis
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const agent = createCostOptimizationAgent();
    const result = await agent.run();

    return Response.json(
      {
        success: result.status === 'completed',
        data: {
          agentRun: result,
          costReport: inMemoryStore.getCostOptimizationReport(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: result.status === 'completed' ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error running cost optimization:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run cost optimization',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/cost-optimization
 * Get cost metrics and savings recommendations
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const priority = url.searchParams.get('priority');
    const limit = url.searchParams.get('limit') || '10';

    const agent = createCostOptimizationAgent();
    const costReport = inMemoryStore.getCostOptimizationReport();

    let opportunities = agent.getTopSavingsOpportunities(parseInt(limit, 10));
    if (priority) {
      opportunities = agent.getSavingsByPriority(priority as any);
    }

    return Response.json(
      {
        success: true,
        data: {
          report: costReport,
          savingsOpportunities: opportunities,
          topExpensiveServices: costReport?.topExpensiveServices,
          underutilizedServices: costReport?.underutilizedServices,
          budgetStatus: costReport?.budgetTracking,
          monthlyTrend: costReport?.monthlyTrend,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching cost optimization:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cost optimization',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
