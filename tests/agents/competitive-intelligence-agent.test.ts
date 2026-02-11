/**
 * Competitive Intelligence Agent Tests (F-01)
 * Tests for agent instantiation, data collection, processing, and factory function
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CompetitiveIntelligenceAgent,
  type CompetitiveIntelligenceRawData,
  type CompetitiveIntelligenceReport,
} from '@/lib/agents/competitive-intelligence-agent';

describe('CompetitiveIntelligenceAgent', () => {
  let agent: CompetitiveIntelligenceAgent;

  beforeEach(() => {
    agent = new CompetitiveIntelligenceAgent();
  });

  describe('Agent Instantiation', () => {
    it('should create an instance with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getConfig().name).toBe('Competitive Intelligence Agent (F-01)');
      expect(agent.getConfig().enabled).toBe(true);
    });

    it('should create an instance with custom config', () => {
      const customAgent = new CompetitiveIntelligenceAgent({
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
      expect(data).toHaveProperty('competitors');
      expect(data).toHaveProperty('marketTrends');
    });

    it('should return valid competitor data', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.competitors)).toBe(true);
      expect(data.competitors.length).toBeGreaterThan(0);

      const competitor = data.competitors[0];
      expect(competitor).toHaveProperty('competitorId');
      expect(competitor).toHaveProperty('name');
      expect(competitor).toHaveProperty('industry');
      expect(competitor).toHaveProperty('marketShare');
      expect(competitor).toHaveProperty('strengths');
      expect(competitor).toHaveProperty('weaknesses');
    });

    it('should have valid market share values', async () => {
      const data = await agent.collectData();

      data.competitors.forEach((competitor) => {
        expect(competitor.marketShare).toBeGreaterThanOrEqual(0);
        expect(competitor.marketShare).toBeLessThanOrEqual(100);
      });
    });

    it('should return market trends', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.marketTrends)).toBe(true);
    });
  });

  describe('processData()', () => {
    let rawData: CompetitiveIntelligenceRawData;

    beforeEach(async () => {
      rawData = await agent.collectData();
    });

    it('should transform raw data correctly', async () => {
      const report = await agent.processData(rawData);

      expect(report).toHaveProperty('reportId');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('competitorAnalysis');
      expect(report).toHaveProperty('marketGaps');
      expect(report).toHaveProperty('opportunities');
      expect(report).toHaveProperty('threats');
    });

    it('should generate competitor analysis', async () => {
      const report = await agent.processData(rawData);

      expect(Array.isArray(report.competitorAnalysis)).toBe(true);
      expect(report.competitorAnalysis.length).toBe(rawData.competitors.length);

      report.competitorAnalysis.forEach((analysis) => {
        expect(analysis).toHaveProperty('competitorId');
        expect(analysis).toHaveProperty('strengths');
        expect(analysis).toHaveProperty('weaknesses');
        expect(analysis).toHaveProperty('opportunities');
        expect(analysis).toHaveProperty('threats');
      });
    });

    it('should identify market gaps', async () => {
      const report = await agent.processData(rawData);

      expect(Array.isArray(report.marketGaps)).toBe(true);
      if (report.marketGaps.length > 0) {
        const gap = report.marketGaps[0];
        expect(gap).toHaveProperty('gapId');
        expect(gap).toHaveProperty('description');
        expect(gap).toHaveProperty('potentialSize');
      }
    });

    it('should identify opportunities', async () => {
      const report = await agent.processData(rawData);

      expect(Array.isArray(report.opportunities)).toBe(true);
    });

    it('should identify threats', async () => {
      const report = await agent.processData(rawData);

      expect(Array.isArray(report.threats)).toBe(true);
    });

    it('should have timestamp in report', async () => {
      const report = await agent.processData(rawData);

      expect(report.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Agent Configuration', () => {
    it('should have correct agent name', () => {
      expect(agent.getConfig().name).toBe('Competitive Intelligence Agent (F-01)');
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
