/**
 * Uptime & Health Monitor Agent (D-01)
 * Monitors system health, API endpoint availability, response times
 * Tracks uptime percentages, latency stats, and generates health alerts
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  statusCode?: number;
  responseTimeMs: number;
  timestamp: Date;
  message?: string;
}

export interface HealthMetrics {
  endpoint: string;
  uptime: number; // percentage
  averageLatencyMs: number;
  lastCheckAt: Date;
  status: 'healthy' | 'degraded' | 'down';
  checksPerformed: number;
  failureCount: number;
}

export interface HealthReport {
  reportId: string;
  timestamp: Date;
  totalEndpoints: number;
  healthyEndpoints: number;
  degradedEndpoints: number;
  downEndpoints: number;
  overallUptime: number;
  averageLatency: number;
  metrics: HealthMetrics[];
  alerts: HealthAlert[];
}

export interface HealthAlert {
  alertId: string;
  endpoint: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved?: boolean;
}

export interface HealthCheckRawData {
  checks: HealthCheckResult[];
  timestamp: Date;
}

/**
 * Uptime & Health Monitor Agent
 * Monitors API endpoints and system health
 */
export class UptimeHealthAgent extends BaseAgent<HealthCheckRawData, HealthReport> {
  private endpoints = [
    '/api/health',
    '/api/leads',
    '/api/assessments',
    '/api/frameworks',
    '/api/agents',
  ];
  private healthMetricsMap: Map<string, HealthMetrics> = new Map();
  private alertsHistory: HealthAlert[] = [];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Uptime & Health Monitor (D-01)',
      description: 'Monitors system health, API endpoint availability, and response times',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockMetrics();
  }

  private initializeMockMetrics(): void {
    for (const endpoint of this.endpoints) {
      this.healthMetricsMap.set(endpoint, {
        endpoint,
        uptime: 99.8,
        averageLatencyMs: Math.floor(Math.random() * 200) + 50,
        lastCheckAt: new Date(),
        status: 'healthy',
        checksPerformed: 0,
        failureCount: 0,
      });
    }
  }

  /**
   * Collect health data from API endpoints
   */
  async collectData(): Promise<HealthCheckRawData> {
    const checks: HealthCheckResult[] = [];

    for (const endpoint of this.endpoints) {
      try {
        const startTime = Date.now();
        // Simulate endpoint health check
        const responseTime = Math.floor(Math.random() * 300) + 10;
        const isHealthy = Math.random() > 0.05; // 95% healthy

        const check: HealthCheckResult = {
          endpoint,
          status: isHealthy ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'down',
          statusCode: isHealthy ? 200 : 500,
          responseTimeMs: responseTime,
          timestamp: new Date(),
          message: isHealthy ? 'OK' : 'Service temporarily unavailable',
        };

        checks.push(check);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 10));
      } catch (error) {
        checks.push({
          endpoint,
          status: 'down',
          responseTimeMs: -1,
          timestamp: new Date(),
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      checks,
      timestamp: new Date(),
    };
  }

  /**
   * Process health data to calculate metrics and detect anomalies
   */
  async processData(rawData: HealthCheckRawData): Promise<HealthReport> {
    const checks = rawData.checks;
    const metrics: HealthMetrics[] = [];
    const alerts: HealthAlert[] = [];

    // Update metrics for each endpoint
    for (const check of checks) {
      const existing = this.healthMetricsMap.get(check.endpoint) || {
        endpoint: check.endpoint,
        uptime: 100,
        averageLatencyMs: 0,
        lastCheckAt: new Date(),
        status: 'healthy',
        checksPerformed: 0,
        failureCount: 0,
      };

      // Update checks and failures
      existing.checksPerformed += 1;
      if (check.status !== 'healthy') {
        existing.failureCount += 1;
      }

      // Calculate uptime percentage
      const healthyChecks = existing.checksPerformed - existing.failureCount;
      existing.uptime = (healthyChecks / existing.checksPerformed) * 100;

      // Update average latency
      const previousLatency = existing.averageLatencyMs;
      if (check.responseTimeMs > 0) {
        existing.averageLatencyMs =
          (previousLatency * (existing.checksPerformed - 1) + check.responseTimeMs) /
          existing.checksPerformed;
      }

      existing.status = check.status;
      existing.lastCheckAt = check.timestamp;

      this.healthMetricsMap.set(check.endpoint, existing);
      metrics.push(existing);

      // Generate alerts for issues
      if (check.status === 'down') {
        const alertId = `alert-${check.endpoint}-${Date.now()}`;
        alerts.push({
          alertId,
          endpoint: check.endpoint,
          severity: 'critical',
          message: `${check.endpoint} is down. ${check.message || ''}`,
          timestamp: check.timestamp,
        });
        this.alertsHistory.push(alerts[alerts.length - 1]);
      } else if (check.status === 'degraded') {
        const alertId = `alert-${check.endpoint}-${Date.now()}`;
        alerts.push({
          alertId,
          endpoint: check.endpoint,
          severity: 'high',
          message: `${check.endpoint} is degraded (${check.responseTimeMs}ms response time)`,
          timestamp: check.timestamp,
        });
        this.alertsHistory.push(alerts[alerts.length - 1]);
      }

      // Alert on high latency
      if (check.responseTimeMs > 500) {
        const alertId = `alert-latency-${check.endpoint}-${Date.now()}`;
        alerts.push({
          alertId,
          endpoint: check.endpoint,
          severity: 'medium',
          message: `High latency detected on ${check.endpoint}: ${check.responseTimeMs}ms`,
          timestamp: check.timestamp,
        });
        this.alertsHistory.push(alerts[alerts.length - 1]);
      }
    }

    // Calculate overall health
    const healthyCount = metrics.filter((m) => m.status === 'healthy').length;
    const degradedCount = metrics.filter((m) => m.status === 'degraded').length;
    const downCount = metrics.filter((m) => m.status === 'down').length;

    const overallUptime = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.uptime, 0) / metrics.length : 0;
    const averageLatency = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.averageLatencyMs, 0) / metrics.length : 0;

    const reportId = `health-report-${Date.now()}`;
    return {
      reportId,
      timestamp: new Date(),
      totalEndpoints: metrics.length,
      healthyEndpoints: healthyCount,
      degradedEndpoints: degradedCount,
      downEndpoints: downCount,
      overallUptime: Math.round(overallUptime * 100) / 100,
      averageLatency: Math.round(averageLatency),
      metrics,
      alerts,
    };
  }

  /**
   * Store health report in the data store
   */
  async updateDashboard(processedData: HealthReport): Promise<void> {
    inMemoryStore.storeHealthReport(processedData);

    // Store alerts
    for (const alert of processedData.alerts) {
      inMemoryStore.addHealthAlert(alert);
    }

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[UptimeHealthAgent] Dashboard updated with health report');
  }

  /**
   * Get health status of all endpoints
   */
  getHealthStatus(): HealthMetrics[] {
    return Array.from(this.healthMetricsMap.values());
  }

  /**
   * Get health status for a specific endpoint
   */
  getEndpointHealth(endpoint: string): HealthMetrics | undefined {
    return this.healthMetricsMap.get(endpoint);
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 10): HealthAlert[] {
    return this.alertsHistory.slice(-limit);
  }

  /**
   * Get critical alerts
   */
  getCriticalAlerts(): HealthAlert[] {
    return this.alertsHistory.filter((a) => a.severity === 'critical' && !a.resolved);
  }
}

/**
 * Factory function to create an UptimeHealthAgent instance
 */
export function createUptimeHealthAgent(config?: Partial<AgentConfig>): UptimeHealthAgent {
  return new UptimeHealthAgent(config);
}
