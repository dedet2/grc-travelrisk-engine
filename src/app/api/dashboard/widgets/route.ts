import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface WidgetConfig {
  id: string;
  title: string;
  type: string;
  size: 'small' | 'medium' | 'large';
  position: {
    row: number;
    col: number;
  };
  dataSource: string;
  refreshInterval: number;
  config: Record<string, unknown>;
  visible: boolean;
}

interface WidgetResponse extends ApiResponse<{
  widgets: WidgetConfig[];
}> {}

interface UpdateWidgetRequest {
  widgets: Partial<WidgetConfig>[];
}

const defaultWidgets: WidgetConfig[] = [
  {
    id: 'risk-gauge',
    title: 'Risk Score Gauge',
    type: 'gauge',
    size: 'medium',
    position: { row: 0, col: 0 },
    dataSource: '/api/dashboard/kpis',
    refreshInterval: 300000,
    config: {
      metric: 'overallRiskScore',
      maxValue: 100,
      zones: [
        { min: 0, max: 30, color: 'green' },
        { min: 30, max: 70, color: 'yellow' },
        { min: 70, max: 100, color: 'red' },
      ],
    },
    visible: true,
  },
  {
    id: 'compliance-heatmap',
    title: 'Compliance Heatmap',
    type: 'heatmap',
    size: 'large',
    position: { row: 0, col: 1 },
    dataSource: '/api/dashboard/kpis',
    refreshInterval: 600000,
    config: {
      metric: 'complianceByFramework',
      dimensions: ['NIST', 'ISO 27001', 'SOC 2', 'GDPR'],
    },
    visible: true,
  },
  {
    id: 'agent-timeline',
    title: 'Agent Activity Timeline',
    type: 'timeline',
    size: 'large',
    position: { row: 1, col: 0 },
    dataSource: '/api/agents/activity',
    refreshInterval: 120000,
    config: {
      timeRange: 24,
      unit: 'hours',
      showEvents: true,
    },
    visible: true,
  },
  {
    id: 'incident-tracker',
    title: 'Incident Tracker',
    type: 'table',
    size: 'medium',
    position: { row: 1, col: 1 },
    dataSource: '/api/incidents',
    refreshInterval: 180000,
    config: {
      columns: ['id', 'title', 'severity', 'status', 'created'],
      pageSize: 10,
      sortBy: 'created',
      sortOrder: 'desc',
    },
    visible: true,
  },
  {
    id: 'vendor-matrix',
    title: 'Vendor Risk Matrix',
    type: 'scatter',
    size: 'large',
    position: { row: 2, col: 0 },
    dataSource: '/api/vendors',
    refreshInterval: 900000,
    config: {
      xAxis: 'exposure',
      yAxis: 'likelihood',
      bubbleSize: 'impact',
    },
    visible: true,
  },
  {
    id: 'travel-map',
    title: 'Travel Advisory Map',
    type: 'map',
    size: 'large',
    position: { row: 2, col: 1 },
    dataSource: '/api/travel-risk',
    refreshInterval: 300000,
    config: {
      showLegend: true,
      showControls: true,
    },
    visible: true,
  },
  {
    id: 'pipeline-funnel',
    title: 'Pipeline Funnel',
    type: 'funnel',
    size: 'medium',
    position: { row: 3, col: 0 },
    dataSource: '/api/pipeline',
    refreshInterval: 600000,
    config: {
      stages: ['lead', 'qualified', 'proposal', 'negotiation', 'won'],
    },
    visible: true,
  },
  {
    id: 'control-effectiveness',
    title: 'Control Effectiveness Chart',
    type: 'bar',
    size: 'medium',
    position: { row: 3, col: 1 },
    dataSource: '/api/dashboard/kpis',
    refreshInterval: 300000,
    config: {
      metric: 'controlEffectiveness',
      showTrend: true,
    },
    visible: true,
  },
];

export async function GET(
  request: NextRequest
): Promise<NextResponse<WidgetResponse>> {
  try {
    return NextResponse.json({
      success: true,
      data: {
        widgets: defaultWidgets,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch widget configuration',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<WidgetResponse>> {
  try {
    const body: UpdateWidgetRequest = await request.json();

    if (!body.widgets || !Array.isArray(body.widgets)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: widgets array is required',
        },
        { status: 400 }
      );
    }

    const updatedWidgets = defaultWidgets.map((widget) => {
      const update = body.widgets.find((w) => w.id === widget.id);
      return update ? { ...widget, ...update } : widget;
    });

    return NextResponse.json({
      success: true,
      data: {
        widgets: updatedWidgets,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update widgets',
      },
      { status: 500 }
    );
  }
}
