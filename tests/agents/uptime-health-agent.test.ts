/**
 * Uptime & Health Monitor Agent Tests (D-01)
 * Tests for agent instantiation, data collection, processing, and factory function
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  UptimeHealthAgent,
  type HealthCheckRawData,
  type HealthReport,
} from '@/lib/agents/uptime-health-agent';

describe('UptimeHealthAgent', () => {
  let agent: UptimeHealthAgent;

  beforeEach(() => {
    agent = new UptimeHealthAgent();
  });

  describe('Agent Instantiation', () => {
    it('should create an instance with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getConfig().name).toBe('Uptime & Health Monitor (D-01)');
      expect(agent.getConfig().enabled).toBe(true);
    });

    it('should create an instance with custom config', () => {
      const customAgent = new UptimeHealthAgent({
        maxRetries: 1,
        timeoutMs: 25000,
      });
      expect(customAgent.getConfig().maxRetries).toBe(1);
      expect(customAgent.getConfig().timeoutMs).toBe(25000);
    });

    it('should have idle status on creation', () => {
      expect(agent.getStatus()).toBe('idle');
    });
  });

  describe('collectData()', () => {
    it('should return expected data shape', async () => {
      const data = await agent.collectData();

      expect(data).toBeDefined();
      expect(data).toHaveProperty('checks');
      expect(data).toHaveProperty('timestamp');
    });

    it('should return valid health check data', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.checks)).toBe(true);
      expect(data.checks.length).toBeGreaterThan(0);

      const check = data.checks[0];
      expect(check).toHaveProperty('endpoint');
      expect(check).toHaveProperty('status');
      expect(check).toHaveProperty('responseTimeMs');
      expect(check).toHaveProperty('timestamp');
      expect(['healthy', 'degraded', 'down']).toContain(check.status);
    });

    it('should have valid timestamp', async () => {
      const data = await agent.collectData();

      expect(data.timestamp).toBeInstanceOf(Date);
    });

    it('should have positive response times', async () => {
      const data = await agent.collectData();

      data.checks.forEach((check) => {
        expect(check.responseTimeMs).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('processData()', () => {
    let rawData: HealthCheckRawData;

    beforeEach(async () => {
      rawData = await agent.collectData();
    });

    it('should transform raw data correctly', async () => {
      const report = await agent.processData(rawData);

      expect(report).toHaveProperty('reportId');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('totalEndpoints');
      expect(report).toHaveProperty('healthyEndpoints');
      expect(report).toHaveProperty('degradedEndpoints');
      expect(report).toHaveProperty('downEndpoints');
      expect(report).toHaveProperty('overallUptime');
      expect(report).toHaveProperty('averageLatency');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('alerts');
    });

    it('should calculate health metrics correctly', async () => {
      const report = await agent.processData(rawData);

      expect(report.totalEndpoints).toBe(rawData.checks.length);
      const endpointSum =
        report.healthyEndpoints + report.degradedEndpoints + report.downEndpoints;
      expect(endpointSum).toBe(report.totalEndpoints);
    });

    it('should have valid uptime percentage', async () => {
      const report = await agent.processData(rawData);

      expect(report.overallUptime).toBeGreaterThanOrEqual(0);
      expect(report.overallUptime).toBeLessThanOrEqual(100);
    });

    it('should have valid average latency', async () => {
      const report = await agent.processData(rawData);

      expect(report.averageLatency).toBeGreaterThanOrEqual(0);
    });

    it('should generate health metrics for each endpoint', async () => {
      const report = await agent.processData(rawData);

      expect(Array.isArray(report.metrics)).toBe(true);
      expect(report.metrics.length).toBe(rawData.checks.length);

      report.metrics.forEach((metric) => {
        expect(metric).toHaveProperty('endpoint');
        expect(metric).toHaveProperty('uptime');
        expect(metric).toHaveProperty('averageLatencyMs');
        expect(metric).toHaveProperty('lastCheckAt');
        expect(metric).toHaveProperty('status');
        expect(metric.uptime).toBeGreaterThanOrEqual(0);
        expect(metric.uptime).toBeLessThanOrEqual(100);
      });
    });

    it('should generate alerts array', async () => {
      const report = await agent.processData(rawData);

      expect(Array.isArray(report.alerts)).toBe(true);
      report.alerts.forEach((alert) => {
        expect(alert).toHaveProperty('alertId');
        expect(alert).toHaveProperty('endpoint');
        expect(alert).toHaveProperty('severity');
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
      });
    });

    it('should have timestamp in report', async () => {
      const report = await agent.processData(rawData);

      expect(report.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Agent Configuration', () => {
    it('should have correct agent name', () => {
      expect(agent.getConfig().name).toBe('Uptime & Health Monitor (D-01)');
    });

    it('should have description', () => {
      const config = agent.getConfig();
      expect(config.description).toBeDefined();
      expect(config.description.length).toBeGreaterThan(0);
    });

    it('should have reasonable timeout settings', () => {
      const config = agent.getConfig();
      expect(config.timeoutMs).toBeGreaterThan(0);
      expect(config.maxRetries).toBeGreaterThanOrEqual(0);
    });
  });
});
