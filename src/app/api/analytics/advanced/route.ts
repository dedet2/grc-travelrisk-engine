/**
 * Advanced Analytics API Routes
 * GET: Retrieve different analytics views
 * Query parameter: type = risk-trends | compliance-velocity | agent-performance | revenue-forecast | vendor-concentration | sla-adherence
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsEngine } from '@/lib/analytics/analytics-engine';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/advanced
 * Retrieve advanced analytics based on type parameter
 * Query parameters:
 *   - type: risk-trends | compliance-velocity | agent-performance | revenue-forecast | vendor-concentration | sla-adherence
 *   - period: 7d | 30d | 90d | 180d (depends on analytics type)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'risk-trends';
    const period = searchParams.get('period') || '30d';

    let data: any = null;
    let description = '';

    switch (type) {
      case 'risk-trends':
        data = analyticsEngine.getRiskTrendAnalysis(period as '7d' | '30d' | '90d');
        description = `Risk trend analysis for ${period}`;
        break;

      case 'compliance-velocity':
        data = analyticsEngine.getComplianceVelocity(period as '30d' | '90d');
        description = `Compliance gap closure velocity for ${period}`;
        break;

      case 'agent-performance':
        data = analyticsEngine.getAgentPerformanceMetrics();
        description = 'Agent performance metrics across all 34 agents';
        break;

      case 'revenue-forecast':
        data = analyticsEngine.getRevenueForecasting(period as '30d' | '90d' | '180d');
        description = `Revenue forecast for ${period}`;
        break;

      case 'vendor-concentration':
        data = analyticsEngine.getVendorRiskConcentration();
        description = 'Vendor risk concentration analysis';
        break;

      case 'sla-adherence':
        data = analyticsEngine.getSLAAdherence();
        description = 'SLA adherence tracking and breach analysis';
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid analytics type',
          } as ApiResponse<null>,
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          type,
          description,
          analytics: data,
          generatedAt: new Date(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
