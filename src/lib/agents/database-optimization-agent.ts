/**
 * Database Optimization Agent (D-02)
 * Analyzes database patterns, suggests optimizations, detects slow queries
 * Tracks query performance, identifies bottlenecks
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface QueryMetrics {
  queryId: string;
  query: string;
  executionTimeMs: number;
  rowsAffected: number;
  timestamp: Date;
  slow: boolean;
}

export interface TableStats {
  tableName: string;
  rowCount: number;
  sizeBytes: number;
  indexCount: number;
  lastAnalyzedAt: Date;
}

export interface OptimizationRecommendation {
  recommendationId: string;
  type: 'index' | 'query_rewrite' | 'denormalization' | 'partitioning' | 'archive';
  target: string; // table or query name
  description: string;
  estimatedImpact: number; // percentage improvement
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffortHours: number;
  timestamp: Date;
}

export interface DatabaseMetrics {
  timestamp: Date;
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  maxQueryTime: number;
  slowQueryPercentage: number;
  tableStats: TableStats[];
  topSlowQueries: QueryMetrics[];
  recommendations: OptimizationRecommendation[];
}

export interface DatabaseOptimizationRawData {
  queries: QueryMetrics[];
  tables: TableStats[];
  timestamp: Date;
}

/**
 * Database Optimization Agent
 * Analyzes database patterns and suggests optimizations
 */
export class DatabaseOptimizationAgent extends BaseAgent<DatabaseOptimizationRawData, DatabaseMetrics> {
  private tables = ['users', 'assessments', 'frameworks', 'controls', 'reports'];
  private queryHistoryMetrics: QueryMetrics[] = [];
  private tableStatsMap: Map<string, TableStats> = new Map();
  private recommendations: OptimizationRecommendation[] = [];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Database Optimization (D-02)',
      description: 'Analyzes database patterns, suggests optimizations, detects slow queries',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    for (const table of this.tables) {
      this.tableStatsMap.set(table, {
        tableName: table,
        rowCount: Math.floor(Math.random() * 1000000) + 10000,
        sizeBytes: Math.floor(Math.random() * 100000000) + 1000000,
        indexCount: Math.floor(Math.random() * 5) + 1,
        lastAnalyzedAt: new Date(),
      });
    }
  }

  /**
   * Collect query patterns and table statistics
   */
  async collectData(): Promise<DatabaseOptimizationRawData> {
    const queries: QueryMetrics[] = [];
    const tables = Array.from(this.tableStatsMap.values());

    // Simulate query metrics collection
    const queryCount = Math.floor(Math.random() * 50) + 30;
    for (let i = 0; i < queryCount; i++) {
      const executionTime = Math.floor(Math.random() * 5000) + 10;
      const isSlow = executionTime > 1000;

      const query: QueryMetrics = {
        queryId: `query-${i}`,
        query: this.generateMockQuery(),
        executionTimeMs: executionTime,
        rowsAffected: Math.floor(Math.random() * 10000),
        timestamp: new Date(Date.now() - Math.random() * 60000), // Last minute
        slow: isSlow,
      };

      queries.push(query);
      this.queryHistoryMetrics.push(query);
    }

    // Keep history limited
    if (this.queryHistoryMetrics.length > 1000) {
      this.queryHistoryMetrics = this.queryHistoryMetrics.slice(-1000);
    }

    return {
      queries,
      tables,
      timestamp: new Date(),
    };
  }

  /**
   * Process data to identify optimization opportunities
   */
  async processData(rawData: DatabaseOptimizationRawData): Promise<DatabaseMetrics> {
    const queries = rawData.queries;
    const tables = rawData.tables;

    // Calculate query metrics
    const totalQueries = queries.length;
    const slowQueries = queries.filter((q) => q.slow).length;
    const slowQueryPercentage = totalQueries > 0 ? (slowQueries / totalQueries) * 100 : 0;

    const queryTimes = queries.map((q) => q.executionTimeMs);
    const averageQueryTime = queryTimes.length > 0 ? queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length : 0;
    const maxQueryTime = queryTimes.length > 0 ? Math.max(...queryTimes) : 0;

    const topSlowQueries = queries.filter((q) => q.slow).sort((a, b) => b.executionTimeMs - a.executionTimeMs).slice(0, 5);

    // Generate recommendations
    const recommendations = this.generateRecommendations(queries, tables, slowQueryPercentage);

    return {
      timestamp: new Date(),
      totalQueries,
      slowQueries,
      averageQueryTime: Math.round(averageQueryTime),
      maxQueryTime,
      slowQueryPercentage: Math.round(slowQueryPercentage * 100) / 100,
      tableStats: tables,
      topSlowQueries,
      recommendations,
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    queries: QueryMetrics[],
    tables: TableStats[],
    slowQueryPercentage: number
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Recommend indexes for slow queries
    if (slowQueryPercentage > 10) {
      for (const query of queries.filter((q) => q.slow).slice(0, 3)) {
        recommendations.push({
          recommendationId: `rec-${Date.now()}-${Math.random()}`,
          type: 'index',
          target: this.extractTableFromQuery(query.query),
          description: `Create composite index to optimize slow query: ${query.queryId}`,
          estimatedImpact: Math.floor(Math.random() * 40) + 20,
          priority: slowQueryPercentage > 20 ? 'high' : 'medium',
          estimatedEffortHours: Math.floor(Math.random() * 2) + 1,
          timestamp: new Date(),
        });
      }
    }

    // Recommend query rewrites for very slow queries
    for (const query of queries.filter((q) => q.executionTimeMs > 2000).slice(0, 2)) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}-${Math.random()}`,
        type: 'query_rewrite',
        target: query.queryId,
        description: `Rewrite complex join to improve performance`,
        estimatedImpact: Math.floor(Math.random() * 30) + 15,
        priority: 'high',
        estimatedEffortHours: Math.floor(Math.random() * 3) + 2,
        timestamp: new Date(),
      });
    }

    // Recommend partitioning for large tables
    for (const table of tables.filter((t) => t.rowCount > 500000).slice(0, 2)) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}-${Math.random()}`,
        type: 'partitioning',
        target: table.tableName,
        description: `Partition ${table.tableName} by date for better query performance`,
        estimatedImpact: 25,
        priority: 'medium',
        estimatedEffortHours: 8,
        timestamp: new Date(),
      });
    }

    // Recommend archiving for large tables with old data
    for (const table of tables.filter((t) => t.sizeBytes > 50000000).slice(0, 1)) {
      recommendations.push({
        recommendationId: `rec-${Date.now()}-${Math.random()}`,
        type: 'archive',
        target: table.tableName,
        description: `Archive old data from ${table.tableName} to improve performance`,
        estimatedImpact: 30,
        priority: 'medium',
        estimatedEffortHours: 12,
        timestamp: new Date(),
      });
    }

    return recommendations.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
  }

  private extractTableFromQuery(query: string): string {
    const match = query.match(/FROM\s+(\w+)/i);
    return match ? match[1] : 'unknown';
  }

  private generateMockQuery(): string {
    const tables = ['users', 'assessments', 'frameworks', 'controls'];
    const table = tables[Math.floor(Math.random() * tables.length)];
    return `SELECT * FROM ${table} WHERE id = ? LIMIT ?`;
  }

  /**
   * Store optimization metrics in the data store
   */
  async updateDashboard(processedData: DatabaseMetrics): Promise<void> {
    inMemoryStore.storeDbOptimizationMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[DatabaseOptimizationAgent] Dashboard updated with database metrics');
  }

  /**
   * Get database optimization metrics
   */
  getDatabaseMetrics(): DatabaseMetrics | undefined {
    return inMemoryStore.getDbOptimizationMetrics();
  }

  /**
   * Get all recommendations
   */
  getRecommendations(): OptimizationRecommendation[] {
    const metrics = inMemoryStore.getDbOptimizationMetrics();
    return metrics ? metrics.recommendations : [];
  }

  /**
   * Get recommendations by priority
   */
  getRecommendationsByPriority(priority: 'low' | 'medium' | 'high' | 'critical'): OptimizationRecommendation[] {
    const metrics = inMemoryStore.getDbOptimizationMetrics();
    return metrics ? metrics.recommendations.filter((r) => r.priority === priority) : [];
  }
}

/**
 * Factory function to create a DatabaseOptimizationAgent instance
 */
export function createDatabaseOptimizationAgent(config?: Partial<AgentConfig>): DatabaseOptimizationAgent {
  return new DatabaseOptimizationAgent(config);
}
