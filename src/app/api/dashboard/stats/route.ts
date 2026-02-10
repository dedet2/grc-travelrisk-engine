import type { ApiResponse } from '@/types';

export interface DashboardStatsResponse {
  riskScore: { overall: number; level: string; trend: 'up' | 'down' | 'stable' };
  compliance: { rate: number; total: number; implemented: number };
  assessments: { active: number; completed: number; total: number };
  travelRisks: { destinations: number; highRisk: number; alerts: number };
  agentRuns: { last24h: number; successRate: number; totalRuns: number };
  criticalFindings: { count: number; resolved: number; pending: number };
  categoryScores: Array<{ category: string; score: number; controlCount: number }>;
  recentActivity: Array<{
    agent: string;
    action: string;
    timestamp: string;
    status: string;
    latencyMs: number;
  }>;
  topRiskDestinations: Array<{ country: string; code: string; score: number; level: string }>;
}

/**
 * GET /api/dashboard/stats
 * Returns aggregated dashboard statistics
 * For now, returns impressive DEMO DATA that shows the system capabilities
 */
export async function GET(): Promise<Response> {
  try {
    // DEMO DATA - Replace with real data from Supabase when integrated
    const demoStats: DashboardStatsResponse = {
      riskScore: {
        overall: 42,
        level: 'Medium',
        trend: 'down',
      },
      compliance: {
        rate: 68,
        total: 114,
        implemented: 77,
      },
      assessments: {
        active: 3,
        completed: 12,
        total: 15,
      },
      travelRisks: {
        destinations: 30,
        highRisk: 5,
        alerts: 2,
      },
      agentRuns: {
        last24h: 12,
        successRate: 91.67,
        totalRuns: 156,
      },
      criticalFindings: {
        count: 5,
        resolved: 3,
        pending: 2,
      },
      categoryScores: [
        {
          category: 'Organization of Information Security',
          score: 72,
          controlCount: 6,
        },
        {
          category: 'Asset Management',
          score: 85,
          controlCount: 8,
        },
        {
          category: 'Access Control',
          score: 64,
          controlCount: 14,
        },
        {
          category: 'Cryptography',
          score: 78,
          controlCount: 5,
        },
        {
          category: 'Physical & Environmental Security',
          score: 68,
          controlCount: 11,
        },
        {
          category: 'Operations Security',
          score: 71,
          controlCount: 18,
        },
        {
          category: 'Communications Security',
          score: 62,
          controlCount: 7,
        },
        {
          category: 'System Acquisition, Development & Maintenance',
          score: 75,
          controlCount: 13,
        },
        {
          category: 'Supplier Relationships',
          score: 55,
          controlCount: 6,
        },
        {
          category: 'Information Security Incident Management',
          score: 81,
          controlCount: 7,
        },
        {
          category: 'Business Continuity Management',
          score: 59,
          controlCount: 4,
        },
        {
          category: 'Compliance',
          score: 67,
          controlCount: 8,
        },
      ],
      recentActivity: [
        {
          agent: 'GRC Framework Ingestion',
          action: 'Imported ISO 27001:2022 framework with 114 controls',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          status: 'success',
          latencyMs: 1240,
        },
        {
          agent: 'Risk Scoring Engine',
          action: 'Evaluated 15 assessments against framework controls',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          status: 'success',
          latencyMs: 2156,
        },
        {
          agent: 'Travel Risk Assessment',
          action: 'Scanned 30 destinations, 5 flagged as high-risk',
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
          status: 'success',
          latencyMs: 3421,
        },
        {
          agent: 'Compliance Gap Analysis',
          action: 'Identified 37 compliance gaps across 8 categories',
          timestamp: new Date(Date.now() - 2.5 * 3600000).toISOString(),
          status: 'success',
          latencyMs: 1834,
        },
        {
          agent: 'Critical Finding Detection',
          action: 'Found 5 critical issues requiring immediate attention',
          timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(),
          status: 'success',
          latencyMs: 945,
        },
        {
          agent: 'Trend Analysis',
          action: 'Detected improving trend in Access Control compliance',
          timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
          status: 'success',
          latencyMs: 1523,
        },
      ],
      topRiskDestinations: [
        {
          country: 'Somalia',
          code: 'SO',
          score: 95,
          level: 'CRITICAL',
        },
        {
          country: 'Afghanistan',
          code: 'AF',
          score: 92,
          level: 'CRITICAL',
        },
        {
          country: 'Syria',
          code: 'SY',
          score: 88,
          level: 'CRITICAL',
        },
        {
          country: 'Yemen',
          code: 'YE',
          score: 85,
          level: 'CRITICAL',
        },
        {
          country: 'South Sudan',
          code: 'SS',
          score: 82,
          level: 'CRITICAL',
        },
      ],
    };

    return Response.json(
      {
        success: true,
        data: demoStats,
        timestamp: new Date(),
      } as ApiResponse<DashboardStatsResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
