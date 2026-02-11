/**
 * API Route: Revenue Forecasting Agent
 * GET: Retrieve revenue forecast report
 * POST: Trigger revenue forecasting analysis
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAgentManager } from '@/lib/agents/agent-manager';
import { initializeAgents } from '@/lib/agents/bootstrap';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export async function GET(request: NextRequest) {
  try {
    initializeAgents();

    const report = inMemoryStore.getRevenueForecastingReport();

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: 'No revenue forecast report available. Run POST to generate.',
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Revenue forecast report retrieved successfully',
      data: report,
    });
  } catch (error) {
    console.error('[/api/revenue-forecast] Error:', error);
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
    const agent = manager.getAgent('Revenue Forecasting (F-02)');

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          message: 'Revenue Forecasting agent not found',
        },
        { status: 404 }
      );
    }

    const result = await agent.run();

    const report = inMemoryStore.getRevenueForecastingReport();

    return NextResponse.json({
      success: result.status === 'completed',
      message: `Agent execution ${result.status}`,
      executionResult: result,
      data: report,
    });
  } catch (error) {
    console.error('[/api/revenue-forecast POST] Error:', error);
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
