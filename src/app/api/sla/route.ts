import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

type SLAStatus = 'met' | 'at_risk' | 'breached';
type Trend = 'improving' | 'stable' | 'declining';

interface SLAHistory {
  date: Date;
  value: number;
}

interface SLAMetric {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  status: SLAStatus;
  trend: Trend;
  lastMeasured: Date;
  history: SLAHistory[];
}

interface SLAResponse {
  total: number;
  metrics: SLAMetric[];
  overallStatus: SLAStatus;
}

const SAMPLE_SLA_METRICS: SLAMetric[] = [
  {
    id: 'sla-001',
    name: 'Assessment Completion',
    target: 95,
    current: 92,
    unit: '%',
    status: 'at_risk',
    trend: 'improving',
    lastMeasured: new Date(Date.now() - 24 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), value: 88 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 90 },
      { date: new Date(Date.now() - 24 * 60 * 60 * 1000), value: 92 },
    ],
  },
  {
    id: 'sla-002',
    name: 'Incident Response Time',
    target: 4,
    current: 3.2,
    unit: 'hours',
    status: 'met',
    trend: 'stable',
    lastMeasured: new Date(Date.now() - 12 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), value: 3.5 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 3.2 },
      { date: new Date(Date.now() - 12 * 60 * 60 * 1000), value: 3.2 },
    ],
  },
  {
    id: 'sla-003',
    name: 'Control Testing Frequency',
    target: 4,
    current: 4,
    unit: 'per year',
    status: 'met',
    trend: 'stable',
    lastMeasured: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 3 },
      { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), value: 4 },
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), value: 4 },
    ],
  },
  {
    id: 'sla-004',
    name: 'Risk Review Cycle',
    target: 12,
    current: 11,
    unit: 'per year',
    status: 'at_risk',
    trend: 'declining',
    lastMeasured: new Date(Date.now() - 48 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 12 },
      { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), value: 12 },
      { date: new Date(Date.now() - 48 * 60 * 60 * 1000), value: 11 },
    ],
  },
  {
    id: 'sla-005',
    name: 'Vendor Assessment Turnaround',
    target: 30,
    current: 28,
    unit: 'days',
    status: 'met',
    trend: 'improving',
    lastMeasured: new Date(Date.now() - 72 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 35 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 30 },
      { date: new Date(Date.now() - 72 * 60 * 60 * 1000), value: 28 },
    ],
  },
  {
    id: 'sla-006',
    name: 'Report Generation',
    target: 24,
    current: 22,
    unit: 'hours',
    status: 'met',
    trend: 'improving',
    lastMeasured: new Date(Date.now() - 6 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), value: 24 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 23 },
      { date: new Date(Date.now() - 6 * 60 * 60 * 1000), value: 22 },
    ],
  },
  {
    id: 'sla-007',
    name: 'Compliance Gap Remediation',
    target: 90,
    current: 85,
    unit: 'days',
    status: 'met',
    trend: 'improving',
    lastMeasured: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), value: 92 },
      { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), value: 88 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 85 },
    ],
  },
  {
    id: 'sla-008',
    name: 'Agent Uptime',
    target: 99.9,
    current: 99.85,
    unit: '%',
    status: 'at_risk',
    trend: 'declining',
    lastMeasured: new Date(Date.now() - 1 * 60 * 60 * 1000),
    history: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), value: 99.95 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 99.9 },
      { date: new Date(Date.now() - 1 * 60 * 60 * 1000), value: 99.85 },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');

    let metrics = SAMPLE_SLA_METRICS;

    if (statusFilter && statusFilter !== 'all') {
      metrics = metrics.filter(m => m.status === statusFilter);
    }

    const breachedCount = SAMPLE_SLA_METRICS.filter(m => m.status === 'breached').length;
    const atRiskCount = SAMPLE_SLA_METRICS.filter(m => m.status === 'at_risk').length;
    const overallStatus: SLAStatus =
      breachedCount > 0 ? 'breached' : atRiskCount > 0 ? 'at_risk' : 'met';

    const response: ApiResponse<SLAResponse> = {
      success: true,
      data: {
        total: metrics.length,
        metrics,
        overallStatus,
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch SLA metrics';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}
