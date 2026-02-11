/**
 * Agent Run API Routes
 * POST: Trigger execution of a specific agent by name
 */

import { getAgentManager } from '@/lib/agents';
import { initializeAgents } from '@/lib/agents/bootstrap';
import type { AgentRunResult } from '@/lib/agents';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// Ensure agents are registered
initializeAgents();

/**
 * POST /api/agents/[name]/run
 * Trigger a specific agent to run and return the result
 */
export async function POST(
  request: Request,
  { params }: { params: { name: string } }
): Promise<Response> {
  try {
    const { name } = params;

    if (!name) {
      return Response.json(
        {
          success: false,
          error: 'Agent name is required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agentManager = getAgentManager();

    // Check if agent exists
    if (!agentManager.hasAgent(name)) {
      return Response.json(
        {
          success: false,
          error: `Agent "${name}" not found. Available agents: ${agentManager.getAgentNames().join(', ') || 'None registered'}`,
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Run the agent
    const result = await agentManager.runAgent(name);

    // Return appropriate status code based on result
    const statusCode = result.status === 'completed' ? 200 : 500;

    return Response.json(
      {
        success: result.status === 'completed',
        data: result as AgentRunResult,
        timestamp: new Date(),
      } as ApiResponse<AgentRunResult>,
      { status: statusCode }
    );
  } catch (error) {
    console.error(`Error running agent:`, error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run agent',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/[name]/run
 * Get the last run result for a specific agent
 */
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
): Promise<Response> {
  try {
    const { name } = params;

    if (!name) {
      return Response.json(
        {
          success: false,
          error: 'Agent name is required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agentManager = getAgentManager();

    // Check if agent exists
    if (!agentManager.hasAgent(name)) {
      return Response.json(
        {
          success: false,
          error: `Agent "${name}" not found`,
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Get the last run result
    const lastRun = agentManager.getLastRun(name);
    const runHistory = agentManager.getRunHistory(name);

    if (!lastRun) {
      return Response.json(
        {
          success: true,
          data: {
            agentName: name,
            lastRun: null,
            runHistory: [],
            totalRuns: 0,
            timestamp: new Date(),
          },
        } as ApiResponse<{
          agentName: string;
          lastRun: null;
          runHistory: unknown[];
          totalRuns: number;
          timestamp: Date;
        }>,
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        data: {
          agentName: name,
          lastRun,
          runHistory: runHistory.slice(-10), // Return last 10 runs
          totalRuns: runHistory.length,
          timestamp: new Date(),
        },
      } as ApiResponse<{
        agentName: string;
        lastRun: AgentRunResult | null;
        runHistory: AgentRunResult[];
        totalRuns: number;
        timestamp: Date;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error fetching agent run results:`, error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch run results',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
