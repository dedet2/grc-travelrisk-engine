/**
 * Content Calendar Agent Tests (E-01)
 * Tests for agent instantiation, data collection, processing, and factory function
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  ContentCalendarAgent,
  type ContentCalendarRawData,
  type ContentCalendarMetrics,
} from '@/lib/agents/content-calendar-agent';

describe('ContentCalendarAgent', () => {
  let agent: ContentCalendarAgent;

  beforeEach(() => {
    agent = new ContentCalendarAgent();
  });

  describe('Agent Instantiation', () => {
    it('should create an instance with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getConfig().name).toBe('Content Calendar Agent (E-01)');
      expect(agent.getConfig().enabled).toBe(true);
    });

    it('should create an instance with custom config', () => {
      const customAgent = new ContentCalendarAgent({
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
      expect(data).toHaveProperty('contentItems');
      expect(data).toHaveProperty('channels');
    });

    it('should return valid content items', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.contentItems)).toBe(true);
      expect(data.contentItems.length).toBeGreaterThan(0);

      const item = data.contentItems[0];
      expect(item).toHaveProperty('contentId');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('channel');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('scheduledDate');
    });

    it('should return valid channels', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.channels)).toBe(true);
      expect(data.channels.length).toBeGreaterThan(0);
    });

    it('should have valid content status values', async () => {
      const data = await agent.collectData();

      const validStatuses = ['draft', 'scheduled', 'published', 'archived'];
      data.contentItems.forEach((item) => {
        expect(validStatuses).toContain(item.status);
      });
    });
  });

  describe('processData()', () => {
    let rawData: ContentCalendarRawData;

    beforeEach(async () => {
      rawData = await agent.collectData();
    });

    it('should transform raw data correctly', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics).toHaveProperty('totalContentScheduled');
      expect(metrics).toHaveProperty('publishedContent');
      expect(metrics).toHaveProperty('draftContent');
      expect(metrics).toHaveProperty('channelBreakdown');
      expect(metrics).toHaveProperty('contentTopics');
    });

    it('should calculate content metrics correctly', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.totalContentScheduled).toBeGreaterThanOrEqual(0);
      expect(metrics.publishedContent).toBeGreaterThanOrEqual(0);
      expect(metrics.draftContent).toBeGreaterThanOrEqual(0);
    });

    it('should track channel breakdown', async () => {
      const metrics = await agent.processData(rawData);

      expect(Array.isArray(metrics.channelBreakdown)).toBe(true);
      if (metrics.channelBreakdown.length > 0) {
        const channel = metrics.channelBreakdown[0];
        expect(channel).toHaveProperty('channel');
        expect(channel).toHaveProperty('count');
      }
    });

    it('should track content topics', async () => {
      const metrics = await agent.processData(rawData);

      expect(Array.isArray(metrics.contentTopics)).toBe(true);
      if (metrics.contentTopics.length > 0) {
        const topic = metrics.contentTopics[0];
        expect(topic).toHaveProperty('topic');
        expect(topic).toHaveProperty('frequency');
      }
    });

    it('should have timestamp in processed data', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Agent Configuration', () => {
    it('should have correct agent name', () => {
      expect(agent.getConfig().name).toBe('Content Calendar Agent (E-01)');
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
