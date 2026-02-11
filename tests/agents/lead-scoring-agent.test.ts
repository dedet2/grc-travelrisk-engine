/**
 * Lead Scoring Agent Tests (C-01)
 * Tests for agent instantiation, data collection, processing, and factory function
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  LeadScoringAgent,
  type LeadScoringRawData,
  type LeadPipelineMetrics,
} from '@/lib/agents/lead-scoring-agent';

describe('LeadScoringAgent', () => {
  let agent: LeadScoringAgent;

  beforeEach(() => {
    agent = new LeadScoringAgent();
  });

  describe('Agent Instantiation', () => {
    it('should create an instance with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getConfig().name).toBe('Lead Scoring Agent (C-01)');
      expect(agent.getConfig().enabled).toBe(true);
    });

    it('should create an instance with custom config', () => {
      const customAgent = new LeadScoringAgent({
        maxRetries: 1,
        timeoutMs: 20000,
      });
      expect(customAgent.getConfig().maxRetries).toBe(1);
      expect(customAgent.getConfig().timeoutMs).toBe(20000);
    });

    it('should have idle status on creation', () => {
      expect(agent.getStatus()).toBe('idle');
    });
  });

  describe('collectData()', () => {
    it('should return expected data shape', async () => {
      const data = await agent.collectData();

      expect(data).toBeDefined();
      expect(data).toHaveProperty('leads');
    });

    it('should return valid lead data', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.leads)).toBe(true);
      expect(data.leads.length).toBeGreaterThan(0);

      const lead = data.leads[0];
      expect(lead).toHaveProperty('leadId');
      expect(lead).toHaveProperty('companyName');
      expect(lead).toHaveProperty('industry');
      expect(lead).toHaveProperty('companySize');
      expect(lead).toHaveProperty('contactEmail');
      expect(lead).toHaveProperty('contactName');
    });

    it('should have valid company size values', async () => {
      const data = await agent.collectData();

      data.leads.forEach((lead) => {
        expect(['startup', 'small', 'medium', 'enterprise']).toContain(lead.companySize);
      });
    });
  });

  describe('processData()', () => {
    let rawData: LeadScoringRawData;

    beforeEach(async () => {
      rawData = await agent.collectData();
    });

    it('should transform raw data correctly', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics).toHaveProperty('totalLeads');
      expect(metrics).toHaveProperty('coldLeads');
      expect(metrics).toHaveProperty('warmLeads');
      expect(metrics).toHaveProperty('hotLeads');
      expect(metrics).toHaveProperty('qualifiedLeads');
      expect(metrics).toHaveProperty('averageScore');
      expect(metrics).toHaveProperty('conversionRate');
    });

    it('should calculate pipeline metrics correctly', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.totalLeads).toBe(rawData.leads.length);
      const stageSum =
        metrics.coldLeads +
        metrics.warmLeads +
        metrics.hotLeads +
        metrics.qualifiedLeads +
        metrics.nurtureCampaignLeads;
      expect(stageSum).toBe(metrics.totalLeads);
    });

    it('should have valid conversion rate', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.conversionRate).toBeLessThanOrEqual(100);
    });

    it('should have valid average score', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.averageScore).toBeGreaterThanOrEqual(0);
      expect(metrics.averageScore).toBeLessThanOrEqual(100);
    });

    it('should track industry distribution', async () => {
      const metrics = await agent.processData(rawData);

      expect(Array.isArray(metrics.topIndustries)).toBe(true);
      if (metrics.topIndustries.length > 0) {
        const industry = metrics.topIndustries[0];
        expect(industry).toHaveProperty('industry');
        expect(industry).toHaveProperty('count');
      }
    });

    it('should track company size distribution', async () => {
      const metrics = await agent.processData(rawData);

      expect(Array.isArray(metrics.topCompanySizes)).toBe(true);
      if (metrics.topCompanySizes.length > 0) {
        const size = metrics.topCompanySizes[0];
        expect(size).toHaveProperty('size');
        expect(size).toHaveProperty('count');
      }
    });

    it('should have timestamp in processed data', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Agent Configuration', () => {
    it('should have correct agent name', () => {
      expect(agent.getConfig().name).toBe('Lead Scoring Agent (C-01)');
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
