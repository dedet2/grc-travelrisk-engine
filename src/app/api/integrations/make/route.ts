import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface ScenarioData {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  runsToday: number;
  successRate: number;
  webhookUrl: string;
}

interface MakeStatus extends ApiResponse {
  connectedScenarios: number;
  scenarios: ScenarioData[];
  totalExecutionsToday: number;
  averageSuccessRate: number;
}

export async function GET(): Promise<NextResponse<MakeStatus>> {
  const scenarios: ScenarioData[] = [
    {
      id: 'scenario-001',
      name: 'Lead Enrichment',
      status: 'active',
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      runsToday: 127,
      successRate: 0.98,
      webhookUrl: 'https://grc-travelrisk.com/webhooks/make/lead-enrichment',
    },
    {
      id: 'scenario-002',
      name: 'Compliance Alert Routing',
      status: 'active',
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      runsToday: 45,
      successRate: 0.99,
      webhookUrl: 'https://grc-travelrisk.com/webhooks/make/compliance-alerts',
    },
    {
      id: 'scenario-003',
      name: 'Incident Escalation',
      status: 'active',
      lastRun: new Date(Date.now() - 1800000).toISOString(),
      runsToday: 8,
      successRate: 1.0,
      webhookUrl: 'https://grc-travelrisk.com/webhooks/make/incident-escalation',
    },
    {
      id: 'scenario-004',
      name: 'Vendor Assessment Trigger',
      status: 'active',
      lastRun: new Date(Date.now() - 10800000).toISOString(),
      runsToday: 3,
      successRate: 0.97,
      webhookUrl: 'https://grc-travelrisk.com/webhooks/make/vendor-assessment',
    },
    {
      id: 'scenario-005',
      name: 'Travel Advisory Sync',
      status: 'active',
      lastRun: new Date(Date.now() - 5400000).toISOString(),
      runsToday: 6,
      successRate: 0.95,
      webhookUrl: 'https://grc-travelrisk.com/webhooks/make/travel-advisories',
    },
    {
      id: 'scenario-006',
      name: 'Report Generation',
      status: 'active',
      lastRun: new Date(Date.now() - 21600000).toISOString(),
      runsToday: 1,
      successRate: 1.0,
      webhookUrl: 'https://grc-travelrisk.com/webhooks/make/report-generation',
    },
    {
      id: 'scenario-007',
      name: 'CRM Sync Pipeline',
      status: 'active',
      lastRun: new Date(Date.now() - 2700000).toISOString(),
      runsToday: 24,
      successRate: 0.96,
      webhookUrl: 'https://grc-travelrisk.com/webhooks/make/crm-sync',
    },
  ];

  const totalExecutions = scenarios.reduce(
    (sum, scenario) => sum + scenario.runsToday,
    0
  );
  const avgSuccessRate =
    scenarios.reduce((sum, s) => sum + s.successRate, 0) / scenarios.length;

  return NextResponse.json({
    success: true,
    message: 'Make automation scenarios retrieved',
    data: {
      connectedScenarios: scenarios.length,
      scenarios,
      totalExecutionsToday: totalExecutions,
      averageSuccessRate: Number(avgSuccessRate.toFixed(2)),
    },
  });
}

interface TriggerRequest {
  scenarioId: string;
  data: Record<string, unknown>;
}

interface TriggerResponse extends ApiResponse {
  executionId: string;
  scenarioId: string;
  status: string;
  triggeredAt: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<TriggerResponse>> {
  try {
    const body = (await request.json()) as TriggerRequest;
    const { scenarioId, data } = body;

    if (!scenarioId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required field: scenarioId',
        },
        { status: 400 }
      );
    }

    const validScenarios = [
      'scenario-001',
      'scenario-002',
      'scenario-003',
      'scenario-004',
      'scenario-005',
      'scenario-006',
      'scenario-007',
    ];

    if (!validScenarios.includes(scenarioId)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid scenario ID: ${scenarioId}`,
        },
        { status: 400 }
      );
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const response: TriggerResponse = {
      success: true,
      message: `Scenario ${scenarioId} triggered successfully`,
      data: {
        executionId,
        scenarioId,
        status: 'queued',
        triggeredAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error triggering Make scenario:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to trigger scenario',
      },
      { status: 500 }
    );
  }
}
