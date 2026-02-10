/**
 * AgentManager - Orchestrates registration, execution, and monitoring of agents
 */

import { BaseAgent, AgentRunResult, AgentConfig } from './base-agent';

export interface AgentMetrics {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRunAt?: Date;
  latencyMs?: number;
  successCount: number;
  failureCount: number;
  averageLatencyMs: number;
  enabled: boolean;
}

export interface AgentManagerStatus {
  totalAgents: number;
  runningCount: number;
  completedCount: number;
  failedCount: number;
  agents: AgentMetrics[];
}

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private runHistory: Map<string, AgentRunResult[]> = new Map();
  private maxHistorySize = 50; // Keep last 50 runs per agent

  /**
   * Register an agent with the manager
   */
  registerAgent(agent: BaseAgent): void {
    const config = agent.getConfig();
    if (!config.name) {
      throw new Error('Agent must have a name in config');
    }

    if (this.agents.has(config.name)) {
      throw new Error(`Agent with name "${config.name}" is already registered`);
    }

    this.agents.set(config.name, agent);
    this.runHistory.set(config.name, []);
  }

  /**
   * Register multiple agents at once
   */
  registerAgents(agents: BaseAgent[]): void {
    agents.forEach((agent) => this.registerAgent(agent));
  }

  /**
   * Get a registered agent by name
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Run a specific agent by name
   */
  async runAgent(name: string): Promise<AgentRunResult> {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent "${name}" not found`);
    }

    const result = await agent.run();
    this.recordRunHistory(name, result);
    return result;
  }

  /**
   * Run all registered agents sequentially
   */
  async runAllAgents(): Promise<AgentRunResult[]> {
    const results: AgentRunResult[] = [];

    const agentEntries = Array.from(this.agents.entries());
    for (const [name, agent] of agentEntries) {
      try {
        const result = await agent.run();
        this.recordRunHistory(name, result);
        results.push(result);
      } catch (error) {
        results.push({
          agentName: name,
          status: 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          latencyMs: 0,
          tasksCompleted: 0,
          totalTasks: 1,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Run all registered agents in parallel
   */
  async runAllAgentsParallel(): Promise<AgentRunResult[]> {
    const promises = Array.from(this.agents.entries()).map(async ([name, agent]) => {
      try {
        const result = await agent.run();
        this.recordRunHistory(name, result);
        return result;
      } catch (error) {
        const result: AgentRunResult = {
          agentName: name,
          status: 'failed',
          startedAt: new Date(),
          completedAt: new Date(),
          latencyMs: 0,
          tasksCompleted: 0,
          totalTasks: 1,
          error: error instanceof Error ? error.message : String(error),
        };
        this.recordRunHistory(name, result);
        return result;
      }
    });

    return Promise.all(promises);
  }

  /**
   * Get the last run result for an agent
   */
  getLastRun(name: string): AgentRunResult | undefined {
    const agent = this.agents.get(name);
    return agent?.getLastRun();
  }

  /**
   * Get run history for an agent
   */
  getRunHistory(name: string): AgentRunResult[] {
    return this.runHistory.get(name) || [];
  }

  /**
   * Get metrics for all agents
   */
  getAgentMetrics(): AgentMetrics[] {
    return Array.from(this.agents.entries()).map(([name, agent]) => {
      const baseMetrics = agent.getMetrics();
      const config = agent.getConfig();

      return {
        name: baseMetrics.name,
        status: baseMetrics.status,
        lastRunAt: baseMetrics.lastRunAt,
        latencyMs: baseMetrics.latencyMs,
        successCount: baseMetrics.successCount,
        failureCount: baseMetrics.failureCount,
        averageLatencyMs: baseMetrics.averageLatencyMs,
        enabled: config.enabled ?? true,
      };
    });
  }

  /**
   * Get overall manager status
   */
  getStatus(): AgentManagerStatus {
    const metrics = this.getAgentMetrics();
    const runningCount = metrics.filter((m) => m.status === 'running').length;
    const completedCount = metrics.filter((m) => m.status === 'completed').length;
    const failedCount = metrics.filter((m) => m.status === 'failed').length;

    return {
      totalAgents: this.agents.size,
      runningCount,
      completedCount,
      failedCount,
      agents: metrics,
    };
  }

  /**
   * Get agent names registered with the manager
   */
  getAgentNames(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Check if an agent is registered
   */
  hasAgent(name: string): boolean {
    return this.agents.has(name);
  }

  /**
   * Get configuration for a specific agent
   */
  getAgentConfig(name: string): AgentConfig | undefined {
    return this.agents.get(name)?.getConfig();
  }

  /**
   * Get all agent configurations
   */
  getAllAgentConfigs(): AgentConfig[] {
    return Array.from(this.agents.values()).map((agent) => agent.getConfig());
  }

  /**
   * Record a run result in history
   */
  private recordRunHistory(agentName: string, result: AgentRunResult): void {
    const history = this.runHistory.get(agentName) || [];
    history.push(result);

    // Trim history to max size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }

    this.runHistory.set(agentName, history);
  }

  /**
   * Clear run history for a specific agent
   */
  clearHistory(name: string): void {
    this.runHistory.set(name, []);
  }

  /**
   * Clear all run histories
   */
  clearAllHistories(): void {
    const agentNames = Array.from(this.agents.keys());
    for (const name of agentNames) {
      this.runHistory.set(name, []);
    }
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(name: string): boolean {
    const removed = this.agents.delete(name);
    if (removed) {
      this.runHistory.delete(name);
    }
    return removed;
  }

  /**
   * Unregister all agents
   */
  unregisterAllAgents(): void {
    this.agents.clear();
    this.runHistory.clear();
  }
}

// Global singleton instance
let globalAgentManager: AgentManager | null = null;

/**
 * Get or create the global agent manager instance
 */
export function getAgentManager(): AgentManager {
  if (!globalAgentManager) {
    globalAgentManager = new AgentManager();
  }
  return globalAgentManager;
}

/**
 * Reset the global agent manager (useful for testing)
 */
export function resetAgentManager(): void {
  globalAgentManager = null;
}
