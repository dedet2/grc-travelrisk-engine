/**
 * Health & Uptime Monitor API Routes
 * POST: Run health check scan
 * GET: Get health status and metrics
 */

import { createUptimeHealthAgent } from '@/lib/agents/uptime-health-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/health
 * Run a health check scan on all endpoints
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const agent = createUptimeHealthAgent();
    const result = await agent.run();

    return Response.json(
      {
        success: result.status === 'completed',
        data: {
          agentRun: result,
          healthReport: inMemoryStore.getHealthReport(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: result.status === 'completed' ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error running health check:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run health check',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/health
 * Get health status and uptime metrics
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');

    const agent = createUptimeHealthAgent();
    let healthMetrics = agent.getHealthStatus();

    if (endpoint) {
      const endpointHealth = agent.getEndpointHealth(endpoint);
      if (!endpointHealth) {
        return Response.json(
          {
            success: false,
            error: `Endpoint ${endpoint} not found`,
          } as ApiResponse<null>,
          { status: 404 }
        );
      }
      healthMetrics = [endpointHealth];
    }

    const healthReport = inMemoryStore.getHealthReport();
    const recentAlerts = agent.getRecentAlerts(10);

    return Response.json(
      {
        success: true,
        data: {
          endpoints: healthMetrics,
          report: healthReport,
          recentAlerts,
          criticalAlerts: agent.getCriticalAlerts(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching health status:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch health status',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
