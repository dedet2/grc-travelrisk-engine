/**
 * Agent Orchestrator - Manages execution of all 34 agents (28 GRC + 6 Life agents)
 * Handles dependency graph, parallel execution within categories, and results aggregation
 */

import { BaseAgent, AgentRunResult } from './base-agent';

export type AgentCategory = 'Compliance' | 'Risk' | 'Business' | 'Infrastructure' | 'Content' | 'Strategic' | 'Life';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  dependencies: string[]; // IDs of agents this depends on
  enabled: boolean;
}

export interface ExecutionTracker {
  agentId: string;
  agentName: string;
  category: AgentCategory;
  startTime?: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'success' | 'failed';
  result?: AgentRunResult;
  error?: string;
  estimatedDurationMs?: number;
}

export interface CategoryExecutionResult {
  category: AgentCategory;
  totalAgents: number;
  completedAgents: number;
  failedAgents: number;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  successRate: number;
  agents: ExecutionTracker[];
}

export interface OrchestrationResult {
  executionId: string;
  startTime: Date;
  endTime: Date;
  totalDurationMs: number;
  summary: {
    totalAgents: number;
    successCount: number;
    failureCount: number;
    successRate: number;
  };
  categories: CategoryExecutionResult[];
  history: ExecutionTracker[];
}

/**
 * All 34 agents with their categories and dependencies
 */
const AGENT_REGISTRY: AgentInfo[] = [
  // GRC Agents (28 total)
  // Compliance Category (8 agents)
  {
    id: 'grc-ingestion-a01',
    name: 'GRC Framework Ingestion (A-01)',
    description: 'Ingests and manages compliance frameworks',
    category: 'Compliance',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'risk-scoring-a02',
    name: 'Risk Scoring (A-02)',
    description: 'Calculates risk scores from assessment data',
    category: 'Risk',
    dependencies: ['grc-ingestion-a01'],
    enabled: true,
  },
  {
    id: 'travel-risk-a03',
    name: 'Travel Risk Assessment (A-03)',
    description: 'Assesses travel-related risks',
    category: 'Risk',
    dependencies: ['risk-scoring-a02'],
    enabled: true,
  },
  {
    id: 'continuous-monitoring-a04',
    name: 'Continuous Monitoring (A-04)',
    description: 'Continuous security and compliance monitoring',
    category: 'Compliance',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'unified-risk-combiner-a05',
    name: 'Unified Risk Combiner (A-05)',
    description: 'Combines multiple risk assessments',
    category: 'Risk',
    dependencies: ['risk-scoring-a02', 'travel-risk-a03', 'continuous-monitoring-a04'],
    enabled: true,
  },
  {
    id: 'invoice-billing-b01',
    name: 'Invoice & Billing (B-01)',
    description: 'Manages invoice generation and billing',
    category: 'Business',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'calendar-scheduling-b02',
    name: 'Calendar Scheduling (B-02)',
    description: 'Manages calendar and meeting scheduling',
    category: 'Business',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'email-triage-b03',
    name: 'Email Triage (B-03)',
    description: 'Triages and categorizes incoming emails',
    category: 'Business',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'document-management-b04',
    name: 'Document Management (B-04)',
    description: 'Manages compliance and business documents',
    category: 'Compliance',
    dependencies: ['grc-ingestion-a01'],
    enabled: true,
  },
  {
    id: 'task-project-b05',
    name: 'Task & Project Management (B-05)',
    description: 'Manages tasks and projects',
    category: 'Business',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'lead-scoring-c01',
    name: 'Lead Scoring (C-01)',
    description: 'Scores and qualifies leads',
    category: 'Business',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'outreach-automation-c02',
    name: 'Outreach Automation (C-02)',
    description: 'Automates sales outreach campaigns',
    category: 'Business',
    dependencies: ['lead-scoring-c01'],
    enabled: true,
  },
  {
    id: 'crm-sync-c03',
    name: 'CRM Sync (C-03)',
    description: 'Synchronizes CRM data',
    category: 'Business',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'proposal-generator-c04',
    name: 'Proposal Generator (C-04)',
    description: 'Generates sales proposals',
    category: 'Business',
    dependencies: ['lead-scoring-c01'],
    enabled: true,
  },
  {
    id: 'uptime-health-d01',
    name: 'Uptime & Health (D-01)',
    description: 'Monitors system uptime and health',
    category: 'Infrastructure',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'database-optimization-d02',
    name: 'Database Optimization (D-02)',
    description: 'Optimizes database performance',
    category: 'Infrastructure',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'security-audit-d03',
    name: 'Security Audit (D-03)',
    description: 'Performs security audits',
    category: 'Infrastructure',
    dependencies: ['continuous-monitoring-a04'],
    enabled: true,
  },
  {
    id: 'backup-recovery-d04',
    name: 'Backup & Recovery (D-04)',
    description: 'Manages backups and disaster recovery',
    category: 'Infrastructure',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'cost-optimization-d05',
    name: 'Cost Optimization (D-05)',
    description: 'Identifies cost optimization opportunities',
    category: 'Infrastructure',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'content-calendar-e01',
    name: 'Content Calendar (E-01)',
    description: 'Manages content calendar and planning',
    category: 'Content',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'seo-intelligence-e02',
    name: 'SEO Intelligence (E-02)',
    description: 'Analyzes SEO performance and opportunities',
    category: 'Content',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'social-media-e03',
    name: 'Social Media (E-03)',
    description: 'Manages social media presence',
    category: 'Content',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'brand-voice-e04',
    name: 'Brand Voice (E-04)',
    description: 'Ensures brand voice consistency',
    category: 'Content',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'analytics-dashboard-e05',
    name: 'Analytics Dashboard (E-05)',
    description: 'Aggregates analytics metrics',
    category: 'Content',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'competitive-intelligence-f01',
    name: 'Competitive Intelligence (F-01)',
    description: 'Analyzes competitive landscape',
    category: 'Strategic',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'revenue-forecasting-f02',
    name: 'Revenue Forecasting (F-02)',
    description: 'Forecasts future revenue',
    category: 'Strategic',
    dependencies: ['crm-sync-c03'],
    enabled: true,
  },
  {
    id: 'strategic-planning-f03',
    name: 'Strategic Planning (F-03)',
    description: 'Creates strategic plans',
    category: 'Strategic',
    dependencies: ['competitive-intelligence-f01', 'revenue-forecasting-f02'],
    enabled: true,
  },

  // Life Agents (6 total)
  {
    id: 'life-health-g01',
    name: 'Health & Wellness (G-01)',
    description: 'Monitors personal health metrics',
    category: 'Life',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'life-fitness-g02',
    name: 'Fitness Tracker (G-02)',
    description: 'Tracks fitness activities',
    category: 'Life',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'life-nutrition-g03',
    name: 'Nutrition Optimizer (G-03)',
    description: 'Optimizes nutrition and diet',
    category: 'Life',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'life-sleep-g04',
    name: 'Sleep Analyzer (G-04)',
    description: 'Analyzes sleep patterns',
    category: 'Life',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'life-mental-g05',
    name: 'Mental Wellness (G-05)',
    description: 'Supports mental health and wellness',
    category: 'Life',
    dependencies: [],
    enabled: true,
  },
  {
    id: 'life-lifestyle-g06',
    name: 'Lifestyle Coach (G-06)',
    description: 'Provides lifestyle coaching',
    category: 'Life',
    dependencies: ['life-health-g01', 'life-fitness-g02', 'life-nutrition-g03'],
    enabled: true,
  },
];

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private executionHistory: ExecutionTracker[] = [];
  private categoryStats: Map<AgentCategory, { total: number; success: number; failed: number }> = new Map();

  constructor() {
    // Initialize category stats
    const categories: AgentCategory[] = ['Compliance', 'Risk', 'Business', 'Infrastructure', 'Content', 'Strategic', 'Life'];
    categories.forEach((cat) => {
      this.categoryStats.set(cat, { total: 0, success: 0, failed: 0 });
    });
  }

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(agentId: string, agent: BaseAgent): void {
    if (!agentId || !agent) {
      throw new Error('Agent ID and instance are required');
    }
    this.agents.set(agentId, agent);
  }

  /**
   * Register multiple agents at once
   */
  registerAgents(agentsMap: Map<string, BaseAgent>): void {
    agentsMap.forEach((agent, agentId) => {
      this.registerAgent(agentId, agent);
    });
  }

  /**
   * Get agent info from registry
   */
  getAgentInfo(agentId: string): AgentInfo | undefined {
    return AGENT_REGISTRY.find((a) => a.id === agentId);
  }

  /**
   * Get all agent registry info
   */
  getAllAgentInfo(): AgentInfo[] {
    return [...AGENT_REGISTRY];
  }

  /**
   * Get agents by category
   */
  getAgentsByCategory(category: AgentCategory): AgentInfo[] {
    return AGENT_REGISTRY.filter((a) => a.category === category && a.enabled);
  }

  /**
   * Run a single agent by ID
   */
  async runAgent(agentId: string): Promise<ExecutionTracker> {
    const agentInfo = this.getAgentInfo(agentId);
    if (!agentInfo) {
      throw new Error(`Agent ${agentId} not found in registry`);
    }

    if (!agentInfo.enabled) {
      return {
        agentId,
        agentName: agentInfo.name,
        category: agentInfo.category,
        status: 'pending',
        error: 'Agent is disabled',
      };
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      return {
        agentId,
        agentName: agentInfo.name,
        category: agentInfo.category,
        status: 'pending',
        error: 'Agent not registered',
      };
    }

    const tracker: ExecutionTracker = {
      agentId,
      agentName: agentInfo.name,
      category: agentInfo.category,
      startTime: new Date(),
      status: 'running',
    };

    try {
      const result = await agent.run();
      tracker.endTime = new Date();
      tracker.status = result.status === 'completed' ? 'success' : 'failed';
      tracker.result = result;
      tracker.error = result.error;
      tracker.estimatedDurationMs = result.latencyMs;
    } catch (error) {
      tracker.endTime = new Date();
      tracker.status = 'failed';
      tracker.error = error instanceof Error ? error.message : String(error);
    }

    this.executionHistory.push(tracker);
    this.updateCategoryStats(agentInfo.category, tracker.status);

    return tracker;
  }

  /**
   * Run all agents in a specific category (parallel within category)
   */
  async runCategory(category: AgentCategory): Promise<CategoryExecutionResult> {
    const agents = this.getAgentsByCategory(category);
    const startTime = new Date();

    const results = await Promise.all(
      agents.map(async (agentInfo) => {
        // Check dependencies
        const dependenciesMet = await this.checkDependencies(agentInfo.id);
        if (!dependenciesMet) {
          return {
            agentId: agentInfo.id,
            agentName: agentInfo.name,
            category: agentInfo.category,
            status: 'failed' as const,
            error: 'Dependencies not satisfied',
          };
        }

        return this.runAgent(agentInfo.id);
      })
    );

    const endTime = new Date();

    const categoryResult: CategoryExecutionResult = {
      category,
      totalAgents: results.length,
      completedAgents: results.filter((r) => r.status === 'success').length,
      failedAgents: results.filter((r) => r.status === 'failed').length,
      startTime,
      endTime,
      durationMs: endTime.getTime() - startTime.getTime(),
      successRate: results.length > 0 ? (results.filter((r) => r.status === 'success').length / results.length) * 100 : 0,
      agents: results,
    };

    return categoryResult;
  }

  /**
   * Run all agents with dependency management and category-based parallelization
   */
  async runAll(): Promise<OrchestrationResult> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const startTime = new Date();

    const enabledAgents = AGENT_REGISTRY.filter((a) => a.enabled);
    const categories: AgentCategory[] = ['Compliance', 'Risk', 'Business', 'Infrastructure', 'Content', 'Strategic', 'Life'];

    const categoryResults: CategoryExecutionResult[] = [];

    // Execute categories sequentially to respect dependencies
    for (const category of categories) {
      const categoryAgents = enabledAgents.filter((a) => a.category === category);

      if (categoryAgents.length === 0) continue;

      const categoryResult = await this.runCategory(category);
      categoryResults.push(categoryResult);

      // Small delay between categories
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const endTime = new Date();

    // Calculate summary stats
    const successCount = this.executionHistory.filter((t) => t.status === 'success').length;
    const failureCount = this.executionHistory.filter((t) => t.status === 'failed').length;

    const result: OrchestrationResult = {
      executionId,
      startTime,
      endTime,
      totalDurationMs: endTime.getTime() - startTime.getTime(),
      summary: {
        totalAgents: enabledAgents.length,
        successCount,
        failureCount,
        successRate: enabledAgents.length > 0 ? (successCount / enabledAgents.length) * 100 : 0,
      },
      categories: categoryResults,
      history: [...this.executionHistory],
    };

    return result;
  }

  /**
   * Check if all dependencies for an agent are satisfied
   */
  private async checkDependencies(agentId: string): Promise<boolean> {
    const agentInfo = this.getAgentInfo(agentId);
    if (!agentInfo || agentInfo.dependencies.length === 0) {
      return true;
    }

    for (const depId of agentInfo.dependencies) {
      const depHistory = this.executionHistory.find((t) => t.agentId === depId);
      if (!depHistory || depHistory.status !== 'success') {
        return false;
      }
    }

    return true;
  }

  /**
   * Get current execution status
   */
  getStatus(): {
    totalAgents: number;
    completed: number;
    running: number;
    failed: number;
    pending: number;
    byCategory: Record<AgentCategory, { total: number; completed: number; failed: number }>;
  } {
    const completed = this.executionHistory.filter((t) => t.status === 'success').length;
    const running = this.executionHistory.filter((t) => t.status === 'running').length;
    const failed = this.executionHistory.filter((t) => t.status === 'failed').length;
    const pending = AGENT_REGISTRY.length - this.executionHistory.length;

    const byCategory: Record<AgentCategory, { total: number; completed: number; failed: number }> = {
      Compliance: { total: 0, completed: 0, failed: 0 },
      Risk: { total: 0, completed: 0, failed: 0 },
      Business: { total: 0, completed: 0, failed: 0 },
      Infrastructure: { total: 0, completed: 0, failed: 0 },
      Content: { total: 0, completed: 0, failed: 0 },
      Strategic: { total: 0, completed: 0, failed: 0 },
      Life: { total: 0, completed: 0, failed: 0 },
    };

    AGENT_REGISTRY.forEach((agent) => {
      if (byCategory[agent.category]) {
        byCategory[agent.category].total++;
      }
    });

    this.executionHistory.forEach((tracker) => {
      const agentInfo = this.getAgentInfo(tracker.agentId);
      if (agentInfo && byCategory[agentInfo.category]) {
        if (tracker.status === 'success') {
          byCategory[agentInfo.category].completed++;
        } else if (tracker.status === 'failed') {
          byCategory[agentInfo.category].failed++;
        }
      }
    });

    return {
      totalAgents: AGENT_REGISTRY.length,
      completed,
      running,
      failed,
      pending,
      byCategory,
    };
  }

  /**
   * Get execution history with optional filtering
   */
  getHistory(filter?: { agentId?: string; status?: ExecutionTracker['status']; limit?: number }): ExecutionTracker[] {
    let history = [...this.executionHistory];

    if (filter?.agentId) {
      history = history.filter((t) => t.agentId === filter.agentId);
    }

    if (filter?.status) {
      history = history.filter((t) => t.status === filter.status);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Get execution statistics
   */
  getStatistics(): {
    totalRuns: number;
    totalSuccesses: number;
    totalFailures: number;
    averageExecutionTimeMs: number;
    successRate: number;
    byCategory: Record<AgentCategory, { total: number; success: number; failure: number; successRate: number; avgTimeMs: number }>;
  } {
    const successfulRuns = this.executionHistory.filter((t) => t.status === 'success');
    const totalRuns = this.executionHistory.length;

    const avgTime =
      successfulRuns.length > 0
        ? successfulRuns.reduce((sum, t) => sum + (t.estimatedDurationMs || 0), 0) / successfulRuns.length
        : 0;

    const byCategory: Record<AgentCategory, { total: number; success: number; failure: number; successRate: number; avgTimeMs: number }> = {
      Compliance: { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 },
      Risk: { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 },
      Business: { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 },
      Infrastructure: { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 },
      Content: { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 },
      Strategic: { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 },
      Life: { total: 0, success: 0, failure: 0, successRate: 0, avgTimeMs: 0 },
    };

    this.executionHistory.forEach((tracker) => {
      const agentInfo = this.getAgentInfo(tracker.agentId);
      if (agentInfo && byCategory[agentInfo.category]) {
        byCategory[agentInfo.category].total++;
        if (tracker.status === 'success') {
          byCategory[agentInfo.category].success++;
          byCategory[agentInfo.category].avgTimeMs += tracker.estimatedDurationMs || 0;
        } else if (tracker.status === 'failed') {
          byCategory[agentInfo.category].failure++;
        }
      }
    });

    // Calculate category averages
    Object.keys(byCategory).forEach((key) => {
      const cat = key as AgentCategory;
      if (byCategory[cat].success > 0) {
        byCategory[cat].avgTimeMs /= byCategory[cat].success;
      }
      if (byCategory[cat].total > 0) {
        byCategory[cat].successRate = (byCategory[cat].success / byCategory[cat].total) * 100;
      }
    });

    return {
      totalRuns,
      totalSuccesses: successfulRuns.length,
      totalFailures: this.executionHistory.filter((t) => t.status === 'failed').length,
      averageExecutionTimeMs: Math.round(avgTime),
      successRate: totalRuns > 0 ? (successfulRuns.length / totalRuns) * 100 : 0,
      byCategory,
    };
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
    const categories: AgentCategory[] = ['Compliance', 'Risk', 'Business', 'Infrastructure', 'Content', 'Strategic', 'Life'];
    categories.forEach((cat) => {
      this.categoryStats.set(cat, { total: 0, success: 0, failed: 0 });
    });
  }

  /**
   * Update category statistics
   */
  private updateCategoryStats(category: AgentCategory, status: ExecutionTracker['status']): void {
    const stats = this.categoryStats.get(category);
    if (stats) {
      stats.total++;
      if (status === 'success') {
        stats.success++;
      } else if (status === 'failed') {
        stats.failed++;
      }
      this.categoryStats.set(category, stats);
    }
  }
}

// Global singleton instance
let globalOrchestrator: AgentOrchestrator | null = null;

/**
 * Get or create the global orchestrator instance
 */
export function getOrchestrator(): AgentOrchestrator {
  if (!globalOrchestrator) {
    globalOrchestrator = new AgentOrchestrator();
  }
  return globalOrchestrator;
}

/**
 * Reset the global orchestrator (useful for testing)
 */
export function resetOrchestrator(): void {
  globalOrchestrator = null;
}
