/**
 * Strategic Planning Agent Tests (F-03)
 * Tests for agent instantiation, data collection, processing, and factory function
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  StrategicPlanningAgent,
  type StrategicPlanningRawData,
  type StrategicPlan,
} from '@/lib/agents/strategic-planning-agent';

describe('StrategicPlanningAgent', () => {
  let agent: StrategicPlanningAgent;

  beforeEach(() => {
    agent = new StrategicPlanningAgent();
  });

  describe('Agent Instantiation', () => {
    it('should create an instance with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getConfig().name).toBe('Strategic Planning Agent (F-03)');
      expect(agent.getConfig().enabled).toBe(true);
    });

    it('should create an instance with custom config', () => {
      const customAgent = new StrategicPlanningAgent({
        maxRetries: 1,
        timeoutMs: 30000,
      });
      expect(customAgent.getConfig().maxRetries).toBe(1);
      expect(customAgent.getConfig().timeoutMs).toBe(30000);
    });

    it('should have idle status on creation', () => {
      expect(agent.getStatus()).toBe('idle');
    });
  });

  describe('collectData()', () => {
    it('should return expected data shape', async () => {
      const data = await agent.collectData();

      expect(data).toBeDefined();
      expect(data).toHaveProperty('businessMetrics');
      expect(data).toHaveProperty('marketContext');
      expect(data).toHaveProperty('resourceAvailability');
    });

    it('should return valid business metrics', async () => {
      const data = await agent.collectData();

      expect(data.businessMetrics).toBeDefined();
      expect(data.businessMetrics).toHaveProperty('revenue');
      expect(data.businessMetrics).toHaveProperty('growth');
      expect(data.businessMetrics).toHaveProperty('marketShare');
    });

    it('should return market context', async () => {
      const data = await agent.collectData();

      expect(data.marketContext).toBeDefined();
      expect(Array.isArray(data.marketContext.trends)).toBe(true);
      expect(data.marketContext.trends.length).toBeGreaterThan(0);
    });

    it('should return resource availability', async () => {
      const data = await agent.collectData();

      expect(data.resourceAvailability).toBeDefined();
      expect(data.resourceAvailability).toHaveProperty('budget');
      expect(data.resourceAvailability).toHaveProperty('teamSize');
      expect(data.resourceAvailability).toHaveProperty('capabilities');
    });
  });

  describe('processData()', () => {
    let rawData: StrategicPlanningRawData;

    beforeEach(async () => {
      rawData = await agent.collectData();
    });

    it('should transform raw data correctly', async () => {
      const plan = await agent.processData(rawData);

      expect(plan).toHaveProperty('planId');
      expect(plan).toHaveProperty('timestamp');
      expect(plan).toHaveProperty('vision');
      expect(plan).toHaveProperty('mission');
      expect(plan).toHaveProperty('strategicGoals');
      expect(plan).toHaveProperty('initiatives');
      expect(plan).toHaveProperty('timeline');
    });

    it('should generate strategic goals', async () => {
      const plan = await agent.processData(rawData);

      expect(Array.isArray(plan.strategicGoals)).toBe(true);
      expect(plan.strategicGoals.length).toBeGreaterThan(0);

      plan.strategicGoals.forEach((goal) => {
        expect(goal).toHaveProperty('goalId');
        expect(goal).toHaveProperty('description');
        expect(goal).toHaveProperty('priority');
        expect(goal).toHaveProperty('timeframe');
        expect(['high', 'medium', 'low']).toContain(goal.priority);
      });
    });

    it('should generate initiatives', async () => {
      const plan = await agent.processData(rawData);

      expect(Array.isArray(plan.initiatives)).toBe(true);
      expect(plan.initiatives.length).toBeGreaterThan(0);

      plan.initiatives.forEach((initiative) => {
        expect(initiative).toHaveProperty('initiativeId');
        expect(initiative).toHaveProperty('name');
        expect(initiative).toHaveProperty('objectives');
        expect(initiative).toHaveProperty('budget');
        expect(initiative).toHaveProperty('timeline');
      });
    });

    it('should have vision statement', async () => {
      const plan = await agent.processData(rawData);

      expect(plan.vision).toBeDefined();
      expect(typeof plan.vision).toBe('string');
      expect(plan.vision.length).toBeGreaterThan(0);
    });

    it('should have mission statement', async () => {
      const plan = await agent.processData(rawData);

      expect(plan.mission).toBeDefined();
      expect(typeof plan.mission).toBe('string');
      expect(plan.mission.length).toBeGreaterThan(0);
    });

    it('should have timeline', async () => {
      const plan = await agent.processData(rawData);

      expect(plan.timeline).toBeDefined();
      expect(plan.timeline).toHaveProperty('startDate');
      expect(plan.timeline).toHaveProperty('endDate');
      expect(plan.timeline.startDate).toBeInstanceOf(Date);
      expect(plan.timeline.endDate).toBeInstanceOf(Date);
    });

    it('should have timestamp in plan', async () => {
      const plan = await agent.processData(rawData);

      expect(plan.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Agent Configuration', () => {
    it('should have correct agent name', () => {
      expect(agent.getConfig().name).toBe('Strategic Planning Agent (F-03)');
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
