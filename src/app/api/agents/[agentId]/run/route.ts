/**
 * Run Individual Agent Endpoint
 * POST /api/agents/[agentId]/run
 * Triggers execution of a specific agent by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { getOrchestrator } from '@/lib/agents/orchestrator';
import { getAgentManager } from '@/lib/agents';
import { initializeAgents } from '@/lib/agents/bootstrap';

export const dynamic = 'force-dynamic';

// Ensure agents are registered on first API call
initializeAgents();

export interface RunAgentResponse {
  agentId: string;
  agentName: string;
  category: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  estimatedCompletionTime?: string;
  result?: {
    status: string;
    tasksCompleted: number;
    totalTasks: number;
    error?: string;
  };
  error?: string;
}

/**
 * POST /api/agents/[agentId]/run
 * Trigger execution of a specific agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
): Promise<NextResponse> {
  try {
    const { agentId } = params;

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID is required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const orchestrator = getOrchestrator();
    const agentManager = getAgentManager();

    // Get agent info from orchestrator
    const agentInfo = orchestrator.getAgentInfo(agentId);
    if (!agentInfo) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent with ID "${agentId}" not found`,
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Check if agent is enabled
    if (!agentInfo.enabled) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent "${agentId}" is disabled`,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get the agent instance from manager
    const agent = agentManager.getAgent(agentInfo.name);
    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent instance for "${agentId}" is not registered`,
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Register agent with orchestrator if not already done
    orchestrator.registerAgent(agentId, agent);

    // Execute the agent
    const tracker = await orchestrator.runAgent(agentId);

    const response: RunAgentResponse = {
      agentId: tracker.agentId,
      agentName: tracker.agentName,
      category: tracker.category,
      status: tracker.status,
      startTime: tracker.startTime || new Date(),
      endTime: tracker.endTime,
      durationMs: tracker.estimatedDurationMs,
      estimatedCompletionTime: getEstimatedCompletionTime(tracker.estimatedDurationMs),
      error: tracker.error,
    };

    if (tracker.result) {
      response.result = {
        status: tracker.result.status,
        tasksCompleted: tracker.result.tasksCompleted,
        totalTasks: tracker.result.totalTasks,
        error: tracker.result.error,
      };
    }

    return NextResponse.json(
      {
        success: tracker.status === 'success',
        data: response,
        timestamp: new Date(),
      } as any,
      { status: tracker.status === 'success' ? 200 : 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[Agent Run API] Error executing agent:`, errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to run agent: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/[agentId]/run
 * Get execution status of a specific agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
): Promise<NextResponse> {
  try {
    const { agentId } = params;

    if (!agentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agent ID is required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const orchestrator = getOrchestrator();

    // Get agent info
    const agentInfo = orchestrator.getAgentInfo(agentId);
    if (!agentInfo) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent with ID "${agentId}" not found`,
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get execution history for this agent
    const history = orchestrator.getHistory({ agentId, limit: 1 });
    const lastRun = history[0];

    const response: RunAgentResponse = {
      agentId: agentInfo.id,
      agentName: agentInfo.name,
      category: agentInfo.category,
      status: lastRun?.status || 'pending',
      startTime: lastRun?.startTime || new Date(),
      endTime: lastRun?.endTime,
      durationMs: lastRun?.estimatedDurationMs,
      estimatedCompletionTime: getEstimatedCompletionTime(lastRun?.estimatedDurationMs),
      error: lastRun?.error,
    };

    if (lastRun?.result) {
      response.result = {
        status: lastRun.result.status,
        tasksCompleted: lastRun.result.tasksCompleted,
        totalTasks: lastRun.result.totalTasks,
        error: lastRun.result.error,
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: response,
        timestamp: new Date(),
      } as any,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`[Agent Status API] Error fetching agent status:`, errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch agent status: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * Helper function to calculate estimated completion time
 */
function getEstimatedCompletionTime(durationMs?: number): string | undefined {
  if (!durationMs) return undefined;

  if (durationMs < 1000) {
    return 'Completed immediately';
  } else if (durationMs < 60000) {
    return `~${Math.round(durationMs / 1000)}s`;
  } else {
    const minutes = Math.round(durationMs / 60000);
    return `~${minutes}m`;
  }
}
