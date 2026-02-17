/**
 * Agents API Routes
 * GET: List all registered agents and their last run status
 * POST: Create a new agent run (stores in Supabase or in-memory)
 */

import { getAgentManager } from '@/lib/agents';
import { initializeAgents } from '@/lib/agents/bootstrap';
import { dataService } from '@/lib/supabase/data-service';
import type { ApiResponse } from '@/types';
import type { AgentRun } from '@/lib/supabase/data-service';

export const dynamic = 'force-dynamic';

// Ensure agents are registered on first API call
initializeAgents();

export interface AgentListItem {
  name: string;
  description: string;
  enabled: boolean;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRunAt?: Date;
  latencyMs?: number;
  successCount: number;
  failureCount: number;
  averageLatencyMs: number;
  schedule?: string;
}

/**
 * GET /api/agents
 * Returns all registered agents and their current status
 * Also fetches recent agent runs from DataService (Supabase with in-memory fallback)
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const agentManager = getAgentManager();
    const status = agentManager.getStatus();
    const metrics = agentManager.getAgentMetrics();
    const configs = agentManager.getAllAgentConfigs();

    // Fetch recent agent runs using DataService (Supabase first, fallback to in-memory)
    const recentRuns = await dataService.getAgentRuns();

    // Map agent metrics with their configurations and recent run data
    const agents: AgentListItem[] = metrics.map((metric) => {
      const config = configs.find((c) => c.name === metric.name);
      const recentRun = recentRuns.find((r) => r.agentName === metric.name);

      return {
        name: metric.name,
        description: config?.description || '',
        enabled: metric.enabled,
        status: metric.status,
        lastRunAt: recentRun?.createdAt || metric.lastRunAt,
        latencyMs: recentRun?.latencyMs || metric.latencyMs,
        successCount: metric.successCount,
        failureCount: metric.failureCount,
        averageLatencyMs: metric.averageLatencyMs,
        schedule: config?.schedule,
      };
    });

    return Response.json(
      {
        success: true,
        data: {
          summary: {
            totalAgents: status.totalAgents,
            runningCount: status.runningCount,
            completedCount: status.completedCount,
            failedCount: status.failedCount,
          },
          agents,
          timestamp: new Date(),
        },
      } as ApiResponse<{
        summary: {
          totalAgents: number;
          runningCount: number;
          completedCount: number;
          failedCount: number;
        };
        agents: AgentListItem[];
        timestamp: Date;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching agents:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch agents',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 * Create a new agent run
 * Stores the run in Supabase (with in-memory fallback)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    const {
      agentName,
      workflow,
      taskTitle,
      status,
      latencyMs,
      tasksCompleted,
      totalTasks,
      inputTokens,
      outputTokens,
      costUsd,
      errorMessage,
      autonomyLevel,
      humanReviewed,
      outputInRange,
    } = body;

    // Validate required fields
    if (!agentName || !status || latencyMs === undefined) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: agentName, status, latencyMs',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create agent run using DataService (Supabase first, fallback to in-memory)
    const agentRun: Omit<AgentRun, 'id' | 'createdAt'> = {
      agentName,
      workflow: workflow || '',
      taskTitle: taskTitle || '',
      status: status as 'pending' | 'running' | 'completed' | 'failed',
      latencyMs,
      tasksCompleted: tasksCompleted || 0,
      totalTasks: totalTasks || 0,
      inputTokens: inputTokens || 0,
      outputTokens: outputTokens || 0,
      costUsd: costUsd || 0,
      errorMessage,
      autonomyLevel: autonomyLevel || 'medium',
      humanReviewed: humanReviewed || false,
      outputInRange: outputInRange !== false,
    };

    const createdRun = await dataService.createAgentRun(agentRun);

    if (!createdRun) {
      return Response.json(
        {
          success: false,
          error: 'Failed to create agent run',
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: createdRun,
        timestamp: new Date(),
      } as ApiResponse<AgentRun>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent run:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create agent run',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
