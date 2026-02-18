/**
 * Agent Handoff History API Routes
 * GET: Handoff history with optional filters
 * POST: Initiate new handoff
 */

import { NextResponse } from 'next/server';
import { agentCommunicationBus } from '@/lib/agents/agent-communication';
import type { ApiResponse } from '@/types';
import type { HandoffType, HandoffStatus } from '@/lib/agents/agent-communication';

export const dynamic = 'force-dynamic';

interface HandoffInitPayload {
  fromAgent: string;
  toAgent: string;
  type: HandoffType;
  context: Record<string, unknown>;
  reason?: string;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type') as HandoffType | null;
    const statusFilter = searchParams.get('status') as HandoffStatus | null;
    const agentFilter = searchParams.get('agent');

    const bus = agentCommunicationBus;
    const handoffs = bus.getHandoffHistory({
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      agentId: agentFilter || undefined,
    });

    const handoffResponses = handoffs.map((h) => ({
      id: h.id,
      fromAgent: h.fromAgentId,
      toAgent: h.toAgentId,
      type: h.type,
      status: h.status,
      context: h.context,
      reason: h.reason,
      initiatedAt: h.initiatedAt.toISOString(),
      acceptedAt: h.acceptedAt?.toISOString(),
      completedAt: h.completedAt?.toISOString(),
      result: h.result,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          handoffs: handoffResponses,
          totalCount: handoffResponses.length,
          filters: {
            type: typeFilter,
            status: statusFilter,
            agent: agentFilter,
          },
        },
        timestamp: new Date(),
      } as ApiResponse<Record<string, unknown>>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Handoff GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch handoff history',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as HandoffInitPayload;
    const { fromAgent, toAgent, type, context, reason } = body;

    if (!fromAgent || !toAgent || !type || !context) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: fromAgent, toAgent, type, context',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const validTypes: HandoffType[] = [
      'task_completion',
      'escalation',
      'data_dependency',
      'approval_required',
      'error_recovery',
    ];

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid handoff type. Must be one of: ${validTypes.join(', ')}`,
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const bus = agentCommunicationBus;
    const handoff = bus.requestHandoff(
      fromAgent,
      toAgent,
      context,
      reason,
      type
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          handoffId: handoff.id,
          fromAgent: handoff.fromAgentId,
          toAgent: handoff.toAgentId,
          type: handoff.type,
          status: handoff.status,
          reason: handoff.reason,
          context: handoff.context,
          initiatedAt: handoff.initiatedAt.toISOString(),
        },
        timestamp: new Date(),
      } as ApiResponse<Record<string, unknown>>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Handoff POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create handoff',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
