/**
 * API Route: Competitive Intelligence Agent
 * GET: Retrieve competitive intelligence report
 * POST: Trigger competitive intelligence analysis
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAgentManager } from '@/lib/agents/agent-manager';
import { initializeAgents } from '@/lib/agents/bootstrap';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export async function GET(request: NextRequest) {
  try {
    initializeAgents();

    const report = inMemoryStore.getCompetitiveIntelligenceReport();

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: 'No competitive intelligence report available. Run POST to generate.',
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Competitive intelligence report retrieved successfully',
      data: report,
    });
  } catch (error) {
    console.error('[/api/competitive-intel] Error:', error);
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
    const agent = manager.getAgent('Competitive Intelligence (F-01)');

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          message: 'Competitive Intelligence agent not found',
        },
        { status: 404 }
      );
    }

    const result = await agent.run();

    const report = inMemoryStore.getCompetitiveIntelligenceReport();

    return NextResponse.json({
      success: result.status === 'completed',
      message: `Agent execution ${result.status}`,
      executionResult: result,
      data: report,
    });
  } catch (error) {
    console.error('[/api/competitive-intel POST] Error:', error);
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
