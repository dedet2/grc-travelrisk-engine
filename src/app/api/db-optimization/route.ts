/**
 * Database Optimization API Routes
 * POST: Run database optimization analysis
 * GET: Get optimization recommendations and metrics
 */

import { createDatabaseOptimizationAgent } from '@/lib/agents/database-optimization-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/db-optimization
 * Run database optimization analysis
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const agent = createDatabaseOptimizationAgent();
    const result = await agent.run();

    return Response.json(
      {
        success: result.status === 'completed',
        data: {
          agentRun: result,
          dbMetrics: inMemoryStore.getDbOptimizationMetrics(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: result.status === 'completed' ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error running database optimization:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run database optimization',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/db-optimization
 * Get database metrics and optimization recommendations
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const priority = url.searchParams.get('priority');

    const agent = createDatabaseOptimizationAgent();
    const dbMetrics = inMemoryStore.getDbOptimizationMetrics();

    let recommendations = agent.getRecommendations();
    if (priority) {
      recommendations = agent.getRecommendationsByPriority(priority as any);
    }

    return Response.json(
      {
        success: true,
        data: {
          metrics: dbMetrics,
          recommendations,
          topSlowQueries: dbMetrics?.topSlowQueries,
          tableStats: dbMetrics?.tableStats,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching database optimization:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch database optimization',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
