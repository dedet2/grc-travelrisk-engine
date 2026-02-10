/**
 * BaseAgent - Abstract base class for all agents in the system
 * Implements the core lifecycle: collectData → processData → updateDashboard
 * Provides error handling, retry logic, and execution tracking
 */

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface AgentRunResult {
  agentName: string;
  status: AgentStatus;
  startedAt: Date;
  completedAt: Date;
  latencyMs: number;
  tasksCompleted: number;
  totalTasks: number;
  error?: string;
  data?: unknown;
  tokensUsed?: number;
  retryCount?: number;
}

export interface AgentConfig {
  name: string;
  description: string;
  schedule?: string; // cron expression
  maxRetries?: number;
  timeoutMs?: number;
  enabled?: boolean;
}

export interface ExecutionLog {
  startTime: Date;
  endTime?: Date;
  latencyMs?: number;
  status: AgentStatus;
  error?: string;
  tokensUsed?: number;
}

/**
 * Abstract base class for all agents
 * Generic type parameters:
 * - TRaw: Type of raw data collected from data sources
 * - TProcessed: Type of processed data after transformation
 */
export abstract class BaseAgent<TRaw = unknown, TProcessed = unknown> {
  protected config: AgentConfig;
  protected status: AgentStatus = 'idle';
  protected lastRun?: AgentRunResult;
  protected executionLogs: ExecutionLog[] = [];
  protected retryCount = 0;

  constructor(config: AgentConfig) {
    this.config = {
      maxRetries: 3,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    };
  }

  /**
   * Collect raw data from external sources
   * Must be implemented by subclasses
   */
  abstract collectData(): Promise<TRaw>;

  /**
   * Process raw data into transformed format
   * Must be implemented by subclasses
   */
  abstract processData(rawData: TRaw): Promise<TProcessed>;

  /**
   * Update dashboard/UI with processed data
   * Must be implemented by subclasses
   */
  abstract updateDashboard(processedData: TProcessed): Promise<void>;

  /**
   * Main execution lifecycle with retry logic and error handling
   */
  async run(): Promise<AgentRunResult> {
    if (!this.config.enabled) {
      return this.createResult('idle', new Date(), new Date(), undefined, 'Agent is disabled');
    }

    const startedAt = new Date();
    this.status = 'running';
    this.retryCount = 0;

    const executionLog: ExecutionLog = {
      startTime: startedAt,
      status: 'running',
    };

    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt <= (this.config.maxRetries || 3); attempt++) {
      try {
        this.retryCount = attempt;

        // Wrap execution in timeout
        const result = await this.executeWithTimeout(async () => {
          const rawData = await this.collectData();
          const processedData = await this.processData(rawData);
          await this.updateDashboard(processedData);
          return processedData;
        });

        const completedAt = new Date();
        this.status = 'completed';
        executionLog.endTime = completedAt;
        executionLog.latencyMs = completedAt.getTime() - startedAt.getTime();
        executionLog.status = 'completed';

        this.executionLogs.push(executionLog);

        this.lastRun = {
          agentName: this.config.name,
          status: 'completed',
          startedAt,
          completedAt,
          latencyMs: executionLog.latencyMs,
          tasksCompleted: 1,
          totalTasks: 1,
          data: result,
          retryCount: attempt,
        };

        return this.lastRun;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < (this.config.maxRetries || 3)) {
          // Wait before retry with exponential backoff
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
      }
    }

    // All retries exhausted
    const completedAt = new Date();
    this.status = 'failed';
    executionLog.endTime = completedAt;
    executionLog.latencyMs = completedAt.getTime() - startedAt.getTime();
    executionLog.status = 'failed';
    executionLog.error = lastError?.message;

    this.executionLogs.push(executionLog);

    this.lastRun = {
      agentName: this.config.name,
      status: 'failed',
      startedAt,
      completedAt,
      latencyMs: executionLog.latencyMs,
      tasksCompleted: 0,
      totalTasks: 1,
      error: lastError?.message || 'Unknown error',
      retryCount: this.retryCount,
    };

    return this.lastRun;
  }

  /**
   * Execute a function with timeout protection
   */
  protected async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs?: number
  ): Promise<T> {
    const timeout = timeoutMs || this.config.timeoutMs || 30000;

    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Agent execution timeout after ${timeout}ms for agent: ${this.config.name}`
              )
            ),
          timeout
        )
      ),
    ]);
  }

  /**
   * Create a standardized run result
   */
  private createResult(
    status: AgentStatus,
    startedAt: Date,
    completedAt: Date,
    data?: unknown,
    error?: string
  ): AgentRunResult {
    return {
      agentName: this.config.name,
      status,
      startedAt,
      completedAt,
      latencyMs: completedAt.getTime() - startedAt.getTime(),
      tasksCompleted: status === 'completed' ? 1 : 0,
      totalTasks: 1,
      data,
      error,
    };
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentStatus {
    return this.status;
  }

  /**
   * Get last execution result
   */
  getLastRun(): AgentRunResult | undefined {
    return this.lastRun;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Get execution history
   */
  getExecutionLogs(): ExecutionLog[] {
    return [...this.executionLogs];
  }

  /**
   * Clear execution history
   */
  clearExecutionLogs(): void {
    this.executionLogs = [];
  }

  /**
   * Get agent metrics for monitoring
   */
  getMetrics(): {
    name: string;
    status: AgentStatus;
    lastRunAt?: Date;
    latencyMs?: number;
    successCount: number;
    failureCount: number;
    averageLatencyMs: number;
  } {
    const logs = this.executionLogs;
    const successLogs = logs.filter((log) => log.status === 'completed');
    const failureLogs = logs.filter((log) => log.status === 'failed');
    const latencies = successLogs
      .map((log) => log.latencyMs || 0)
      .filter((ms) => ms > 0);

    const averageLatencyMs =
      latencies.length > 0
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length
        : 0;

    return {
      name: this.config.name,
      status: this.status,
      lastRunAt: this.lastRun?.completedAt,
      latencyMs: this.lastRun?.latencyMs,
      successCount: successLogs.length,
      failureCount: failureLogs.length,
      averageLatencyMs: Math.round(averageLatencyMs),
    };
  }
}
