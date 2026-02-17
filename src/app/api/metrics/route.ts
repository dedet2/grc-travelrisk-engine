import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface TopEndpoint {
  endpoint: string;
  calls: number;
  avgMs: number;
}

interface HourlyTrafficPoint {
  hour: number;
  requests: number;
}

interface ErrorBreakdown {
  code: number;
  count: number;
  percentage: number;
}

interface PlatformMetrics {
  apiCallsToday: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  storageUsed: string;
  agentRunsToday: number;
  complianceScansThisWeek: number;
  reportsGenerated: number;
  topEndpoints: TopEndpoint[];
  hourlyTraffic: HourlyTrafficPoint[];
  errorBreakdown: ErrorBreakdown[];
}

interface MetricsResponse extends ApiResponse<{
  metrics: PlatformMetrics;
  timestamp: string;
}> {}

export async function GET(
  request: NextRequest
): Promise<NextResponse<MetricsResponse>> {
  try {
    const topEndpoints: TopEndpoint[] = [
      {
        endpoint: '/api/dashboard/kpis',
        calls: 342,
        avgMs: 125,
      },
      {
        endpoint: '/api/vendors',
        calls: 287,
        avgMs: 178,
      },
      {
        endpoint: '/api/incidents',
        calls: 245,
        avgMs: 94,
      },
      {
        endpoint: '/api/travel-risk',
        calls: 198,
        avgMs: 234,
      },
      {
        endpoint: '/api/agents/activity',
        calls: 156,
        avgMs: 67,
      },
    ];

    const hourlyTraffic: HourlyTrafficPoint[] = Array.from(
      { length: 24 },
      (_, i) => ({
        hour: i,
        requests: Math.floor(40 + Math.random() * 80),
      })
    );

    const errorBreakdown: ErrorBreakdown[] = [
      {
        code: 400,
        count: 12,
        percentage: 32.4,
      },
      {
        code: 404,
        count: 8,
        percentage: 21.6,
      },
      {
        code: 500,
        count: 11,
        percentage: 29.7,
      },
      {
        code: 503,
        count: 6,
        percentage: 16.2,
      },
    ];

    const metrics: PlatformMetrics = {
      apiCallsToday: 1247,
      avgResponseTime: 145,
      errorRate: 0.3,
      activeUsers: 8,
      storageUsed: '2.4GB',
      agentRunsToday: 156,
      complianceScansThisWeek: 12,
      reportsGenerated: 34,
      topEndpoints,
      hourlyTraffic,
      errorBreakdown,
    };

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch platform metrics',
      },
      { status: 500 }
    );
  }
}
