import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface KPIMetrics {
  overallRiskScore: number;
  complianceRate: number;
  activeAgents: number;
  pipelineValue: string;
  openIncidents: number;
  vendorRiskScore: number;
  controlEffectiveness: number;
  upcomingAssessments: number;
}

interface RiskTrendPoint {
  date: string;
  score: number;
}

interface ComplianceFramework {
  framework: string;
  score: number;
  status: 'compliant' | 'partial' | 'non-compliant';
}

interface IncidentStatus {
  status: 'open' | 'in-review' | 'resolved';
  count: number;
}

interface ActivityItem {
  id: string;
  type: 'incident' | 'assessment' | 'vendor-update' | 'policy-change';
  title: string;
  timestamp: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

interface DashboardKPIResponse extends ApiResponse<{
  metrics: KPIMetrics;
  riskTrend: RiskTrendPoint[];
  complianceByFramework: ComplianceFramework[];
  incidentsByStatus: IncidentStatus[];
  recentActivity: ActivityItem[];
  lastUpdated: string;
}> {}

export async function GET(
  request: NextRequest
): Promise<NextResponse<DashboardKPIResponse>> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const riskTrend: RiskTrendPoint[] = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        score: 40 + Math.floor(Math.random() * 10),
      };
    });

    const metrics: KPIMetrics = {
      overallRiskScore: 42,
      complianceRate: 68,
      activeAgents: 34,
      pipelineValue: '$2.85M',
      openIncidents: 4,
      vendorRiskScore: 75,
      controlEffectiveness: 82,
      upcomingAssessments: 3,
    };

    const complianceByFramework: ComplianceFramework[] = [
      {
        framework: 'NIST',
        score: 78,
        status: 'compliant',
      },
      {
        framework: 'ISO 27001',
        score: 85,
        status: 'compliant',
      },
      {
        framework: 'SOC 2',
        score: 72,
        status: 'partial',
      },
      {
        framework: 'GDPR',
        score: 81,
        status: 'compliant',
      },
    ];

    const incidentsByStatus: IncidentStatus[] = [
      {
        status: 'open',
        count: 4,
      },
      {
        status: 'in-review',
        count: 2,
      },
      {
        status: 'resolved',
        count: 18,
      },
    ];

    const recentActivity: ActivityItem[] = [
      {
        id: 'activity-001',
        type: 'incident',
        title: 'Critical vulnerability detected in vendor assessment',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'critical',
      },
      {
        id: 'activity-002',
        type: 'assessment',
        title: 'SOC 2 compliance assessment completed',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-003',
        type: 'vendor-update',
        title: 'Vendor risk profile updated for Acme Corp',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-004',
        type: 'policy-change',
        title: 'Data retention policy updated',
        timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-005',
        type: 'incident',
        title: 'Access control anomaly flagged',
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        severity: 'high',
      },
      {
        id: 'activity-006',
        type: 'assessment',
        title: 'ISO 27001 audit scheduled',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-007',
        type: 'vendor-update',
        title: 'New vendor onboarded: SecureCloud Inc',
        timestamp: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-008',
        type: 'incident',
        title: 'User permission escalation detected',
        timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
        severity: 'medium',
      },
      {
        id: 'activity-009',
        type: 'policy-change',
        title: 'Password policy enforcement updated',
        timestamp: new Date(now.getTime() - 60 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'activity-010',
        type: 'assessment',
        title: 'GDPR compliance review initiated',
        timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        riskTrend,
        complianceByFramework,
        incidentsByStatus,
        recentActivity,
        lastUpdated: now.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch KPIs',
      },
      { status: 500 }
    );
  }
}
