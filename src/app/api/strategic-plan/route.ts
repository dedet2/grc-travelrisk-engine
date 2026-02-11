/**
 * API Route: Strategic Planning Agent
 * GET: Retrieve strategic plan
 * POST: Trigger strategic planning analysis
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAgentManager } from '@/lib/agents/agent-manager';
import { initializeAgents } from '@/lib/agents/bootstrap';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export async function GET(request: NextRequest) {
  try {
    initializeAgents();

    const plan = inMemoryStore.getStrategicPlan();

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: 'No strategic plan available. Run POST to generate.',
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Strategic plan retrieved successfully',
      data: plan,
    });
  } catch (error) {
    console.error('[/api/strategic-plan] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeAgents();

    const manager = getAgentManager();
    const agent = manager.getAgent('Strategic Planning (F-03)');

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          message: 'Strategic Planning agent not found',
        },
        { status: 404 }
      );
    }

    const result = await agent.run();

    const plan = inMemoryStore.getStrategicPlan();

    return NextResponse.json({
      success: result.status === 'completed',
      message: `Agent execution ${result.status}`,
      executionResult: result,
      data: plan,
    });
  } catch (error) {
    console.error('[/api/strategic-plan POST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error,
      },
      { status: 500 }
    );
  }
}
