/**
 * Agent Fleet Status Endpoint
 * GET /api/agents/status
 * Returns real-time status of all 34 agents grouped by category
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { getOrchestrator, AgentCategory } from '@/lib/agents/orchestrator';
import { getAgentManager } from '@/lib/agents';
import { initializeAgents } from '@/lib/agents/bootstrap';

export const dynamic = 'force-dynamic';

// Ensure agents are registered on first API call
initializeAgents();

export interface AgentStatusDetails {
  id: string;
  name: string;
  category: AgentCategory;
  enabled: boolean;
  currentStatus: 'idle' | 'running' | 'completed' | 'failed' | 'pending';
  lastRunTime?: Date;
  lastRunDurationMs?: number;
  successCount: number;
  failureCount: number;
  averageExecutionTimeMs: number;
  successRate: number;
  dependencies: string[];
}

export interface CategoryStatus {
  category: AgentCategory;
  totalAgents: number;
  activeAgents: number;
  successfulAgents: number;
  failedAgents: number;
  averageSuccessRate: number;
  averageExecutionTimeMs: number;
  agents: AgentStatusDetails[];
}

export interface AgentFleetStatus {
  timestamp: Date;
  summary: {
    totalAgents: number;
    activeAgents: number;
    completedAgents: number;
    failedAgents: number;
    pendingAgents: number;
    overallSuccessRate: number;
  };
  categories: CategoryStatus[];
  statistics: {
    totalRunsRecorded: number;
    totalSuccesses: number;
    totalFailures: number;
    averageExecutionTimeMs: number;
    successRate: number;
  };
}

/**
 * GET /api/agents/status
 * Returns the real-time status of all agents
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const orchestrator = getOrchestrator();
    const agentManager = getAgentManager();

    // Get status from orchestrator
    const orchestratorStatus = orchestrator.getStatus();
    const statistics = orchestrator.getStatistics();
    const allAgentInfo = orchestrator.getAllAgentInfo();

    // Group agents by category
    const categories: AgentCategory[] = ['Compliance', 'Risk', 'Business', 'Infrastructure', 'Content', 'Strategic', 'Life'];

    const categoryStatuses: CategoryStatus[] = categories.map((category) => {
      const categoryAgents = allAgentInfo.filter((a) => a.category === category);
      const categoryStats = statistics.byCategory[category] || { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 };

      const agents: AgentStatusDetails[] = categoryAgents.map((agentInfo) => {
        const agentManager_Agent = agentManager.getAgent(agentInfo.name);
        const agentMetrics = agentManager_Agent?.getMetrics();
        const executionHistory = orchestrator.getHistory({ agentId: agentInfo.id, limit: 1 });
        const lastExecution = executionHistory[0];

        return {
          id: agentInfo.id,
          name: agentInfo.name,
          category: agentInfo.category,
          enabled: agentInfo.enabled,
          currentStatus: lastExecution?.status === 'success' ? 'completed' : lastExecution?.status === 'failed' ? 'failed' : lastExecution?.status === 'running' ? 'running' : 'idle',
          lastRunTime: lastExecution?.endTime || agentMetrics?.lastRunAt,
          lastRunDurationMs: lastExecution?.estimatedDurationMs || agentMetrics?.latencyMs,
          successCount: agentMetrics?.successCount || 0,
          failureCount: agentMetrics?.failureCount || 0,
          averageExecutionTimeMs: agentMetrics?.averageLatencyMs || 0,
          successRate:
            agentMetrics && agentMetrics.successCount + agentMetrics.failureCount > 0
              ? (agentMetrics.successCount / (agentMetrics.successCount + agentMetrics.failureCount)) * 100
              : 0,
          dependencies: agentInfo.dependencies,
        };
      });

      return {
        category,
        totalAgents: categoryAgents.length,
        activeAgents: categoryAgents.filter((a) => {
          const history = orchestrator.getHistory({ agentId: a.id, limit: 1 });
          return history.length > 0 && (history[0].status === 'running' || history[0].status === 'pending');
        }).length,
        successfulAgents: categoryAgents.filter((a) => {
          const history = orchestrator.getHistory({ agentId: a.id, limit: 1 });
          return history.length > 0 && history[0].status === 'success';
        }).length,
        failedAgents: categoryAgents.filter((a) => {
          const history = orchestrator.getHistory({ agentId: a.id, limit: 1 });
          return history.length > 0 && history[0].status === 'failed';
        }).length,
        averageSuccessRate: categoryStats.successRate,
        averageExecutionTimeMs: Math.round(categoryStats.avgTimeMs),
        agents,
      };
    });

    const fleetStatus: AgentFleetStatus = {
      timestamp: new Date(),
      summary: {
        totalAgents: orchestratorStatus.totalAgents,
        activeAgents: orchestratorStatus.running,
        completedAgents: orchestratorStatus.completed,
        failedAgents: orchestratorStatus.failed,
        pendingAgents: orchestratorStatus.pending,
        overallSuccessRate:
          orchestratorStatus.completed + orchestratorStatus.failed > 0
            ? (orchestratorStatus.completed / (orchestratorStatus.completed + orchestratorStatus.failed)) * 100
            : 0,
      },
      categories: categoryStatuses,
      statistics: {
        totalRunsRecorded: statistics.totalRuns,
        totalSuccesses: statistics.totalSuccesses,
        totalFailures: statistics.totalFailures,
        averageExecutionTimeMs: statistics.averageExecutionTimeMs,
        successRate: statistics.successRate,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: fleetStatus,
        timestamp: new Date(),
      } as any,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Agent Fleet Status API] Error fetching fleet status:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch fleet status: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/status?category=Compliance
 * Returns status of agents in a specific category
 */
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    const category = request.nextUrl.searchParams.get('category') as AgentCategory | null;

    if (!category) {
      return GET(request);
    }

    const orchestrator = getOrchestrator();
    const agentManager = getAgentManager();

    const categoryAgents = orchestrator.getAgentsByCategory(category);

    const agents: AgentStatusDetails[] = categoryAgents.map((agentInfo) => {
      const agentManager_Agent = agentManager.getAgent(agentInfo.name);
      const agentMetrics = agentManager_Agent?.getMetrics();
      const executionHistory = orchestrator.getHistory({ agentId: agentInfo.id, limit: 1 });
      const lastExecution = executionHistory[0];

      return {
        id: agentInfo.id,
        name: agentInfo.name,
        category: agentInfo.category,
        enabled: agentInfo.enabled,
        currentStatus: lastExecution?.status === 'success' ? 'completed' : lastExecution?.status === 'failed' ? 'failed' : lastExecution?.status === 'running' ? 'running' : 'idle',
        lastRunTime: lastExecution?.endTime || agentMetrics?.lastRunAt,
        lastRunDurationMs: lastExecution?.estimatedDurationMs || agentMetrics?.latencyMs,
        successCount: agentMetrics?.successCount || 0,
        failureCount: agentMetrics?.failureCount || 0,
        averageExecutionTimeMs: agentMetrics?.averageLatencyMs || 0,
        successRate:
          agentMetrics && agentMetrics.successCount + agentMetrics.failureCount > 0
            ? (agentMetrics.successCount / (agentMetrics.successCount + agentMetrics.failureCount)) * 100
            : 0,
        dependencies: agentInfo.dependencies,
      };
    });

    const statistics = orchestrator.getStatistics();
    const categoryStats = statistics.byCategory[category];

    const categoryStatus: CategoryStatus = {
      category,
      totalAgents: categoryAgents.length,
      activeAgents: agents.filter((a) => a.currentStatus === 'running').length,
      successfulAgents: agents.filter((a) => a.currentStatus === 'completed').length,
      failedAgents: agents.filter((a) => a.currentStatus === 'failed').length,
      averageSuccessRate: categoryStats.successRate,
      averageExecutionTimeMs: Math.round(categoryStats.avgTimeMs),
      agents,
    };

    return NextResponse.json(
      {
        success: true,
        data: categoryStatus,
        timestamp: new Date(),
      } as any,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Agent Category Status API] Error fetching category status:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch category status: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
