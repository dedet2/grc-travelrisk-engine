/**
 * Agents API Routes
 * GET: List all registered agents and their last run status
 */

import { getAgentManager } from '@/lib/agents';
import { initializeAgents } from '@/lib/agents/bootstrap';
import type { ApiResponse } from '@/types';

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
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const agentManager = getAgentManager();
    const status = agentManager.getStatus();
    const metrics = agentManager.getAgentMetrics();
    const configs = agentManager.getAllAgentConfigs();

    // Map agent metrics with their configurations
    const agents: AgentListItem[] = metrics.map((metric) => {
      const config = configs.find((c) => c.name === metric.name);
      return {
        name: metric.name,
        description: config?.description || '',
        enabled: metric.enabled,
        status: metric.status,
        lastRunAt: metric.lastRunAt,
        latencyMs: metric.latencyMs,
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
