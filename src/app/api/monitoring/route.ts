/**
 * Monitoring API Endpoint
 * Integrates Continuous Monitoring Agent (A-06)
 * POST: Run a monitoring scan
 * GET: Retrieve monitoring status and alert summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { createContinuousMonitoringAgent } from '@/lib/agents/continuous-monitoring-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/monitoring
 * Run a monitoring scan and generate alerts
 *
 * Optional request body:
 * {
 *   "thresholds": {
 *     "scoreDriftThreshold": 10,
 *     "advisoryChangeThreshold": 1,
 *     "criticalAdvisoryLevel": 3
 *   }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { thresholds } = body;

    // Create monitoring agent with optional custom thresholds
    const agent = createContinuousMonitoringAgent(thresholds || {});

    // Run the monitoring scan
    const runResult = await agent.run();

    if (runResult.status === 'failed') {
      return NextResponse.json(
        {
          success: false,
          error: `Monitoring scan failed: ${runResult.error}`,
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Get alert summary
    const alertStats = inMemoryStore.getMonitoringStats();
    const runCount = inMemoryStore.incrementMonitoringRunCount();

    const responseData = {
      runId: (runResult.data as any)?.runId || `run-${Date.now()}`,
      status: 'completed',
      runNumber: runCount,
      alertsGenerated: (runResult.data as any)?.alertsGenerated || 0,
      alertSummary: alertStats,
      deviationsDetected: (runResult.data as any)?.deviationsDetected || [],
      frameworkUpdatesDetected: (runResult.data as any)?.frameworkUpdatesDetected || [],
      advisoryChanges: (runResult.data as any)?.advisoryChanges || [],
      latencyMs: runResult.latencyMs,
      completedAt: runResult.completedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Monitoring API] Error running monitoring scan:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to run monitoring scan: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/monitoring
 * Retrieve monitoring status and alert summary
 * Optional query: ?severity=critical|high|medium|low|info
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');

    const alertStats = inMemoryStore.getMonitoringStats();
    const runCount = inMemoryStore.getMonitoringRunCount();

    let alerts;
    if (severity) {
      alerts = inMemoryStore.getAlertsBySeverity(severity);
    } else {
      alerts = inMemoryStore.getAllMonitoringAlerts();
    }

    // Get recent alerts (last 20)
    const recentAlerts = alerts.slice(0, 20).map((alert) => ({
      alertId: alert.alertId,
      timestamp: alert.timestamp,
      severity: alert.severity,
      source: alert.source,
      title: alert.title,
      message: alert.message,
      acknowledged: alert.acknowledged,
      acknowledgedAt: alert.acknowledgedAt,
    }));

    const responseData = {
      status: 'active',
      totalRuns: runCount,
      alertSummary: alertStats,
      recentAlerts,
      thresholds: {
        scoreDriftThreshold: 10,
        advisoryChangeThreshold: 1,
        criticalAdvisoryLevel: 3,
        frameworkCheckInterval: 60,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Monitoring API] Error retrieving monitoring status:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve monitoring status: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
