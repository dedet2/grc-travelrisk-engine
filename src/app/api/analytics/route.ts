/**
 * Analytics Dashboard API Routes
 * POST: Update channel metrics or add trend data
 * GET: Retrieve aggregated analytics and KPIs
 */

import { createAnalyticsDashboardAgent, type ChannelMetrics } from '@/lib/agents/analytics-dashboard-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/analytics
 * Update channel metrics or add trend data
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { action, channel, impressions, clicks, conversions, revenue } = body;

    if (!action || !impressions !== undefined || !clicks !== undefined) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: action, impressions, clicks',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createAnalyticsDashboardAgent();
    let result: ChannelMetrics | any = null;

    if (action === 'update-channel' && channel) {
      result = await agent.updateChannelMetrics(
        channel,
        impressions,
        clicks,
        conversions || 0,
        revenue || 0
      );
    } else if (action === 'add-trend') {
      result = await agent.addTrendDataPoint(
        impressions,
        clicks,
        conversions || 0,
        revenue || 0
      );
    }

    if (!result) {
      return Response.json(
        {
          success: false,
          error: 'Invalid action or missing required fields',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        data: result,
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error updating analytics:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update analytics',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics
 * Retrieve aggregated analytics and KPIs
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const metric = url.searchParams.get('metric'); // 'revenue', 'conversions', 'roi'
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    const agent = createAnalyticsDashboardAgent();

    // Run agent to update metrics
    await agent.run();
    const dashboardMetrics = inMemoryStore.getDashboardMetrics();
    const channelMetrics = agent.getChannelMetrics();

    let topChannels = channelMetrics;
    if (metric) {
      topChannels = agent.getTopPerformingChannels(metric as 'revenue' | 'conversions' | 'roi');
    }

    const trends = agent.getHistoricalTrends(days);

    return Response.json(
      {
        success: true,
        data: {
          dashboard: dashboardMetrics,
          channels: topChannels,
        trends,
          topChannelsCount: topChannels.length,
          trendsCount: trends.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        dashboard?: any;
        channels: ChannelMetrics[];
        trends: any[];
        topChannelsCount: number;
        trendsCount: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
