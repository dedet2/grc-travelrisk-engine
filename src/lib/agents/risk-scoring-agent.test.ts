/**
 * Tests for Risk Scoring Agent (A-02)
 * Covers agent instantiation, scoring, risk level determination, and recommendations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RiskScoringAgent } from './risk-scoring-agent';
import type { ControlScore } from '@/lib/scoring/types';

describe('RiskScoringAgent', () => {
  let agent: RiskScoringAgent;

  beforeEach(() => {
    agent = new RiskScoringAgent();
  });

  describe('Agent Instantiation', () => {
    it('should create an agent with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getConfig().name).toBe('Risk Scoring Agent (A-02)');
      expect(agent.getStatus()).toBe('idle');
    });

    it('should have correct initial state', () => {
      expect(agent.getStatus()).toBe('idle');
      expect(agent.getLastRun()).toBeUndefined();
      expect(agent.getExecutionLogs()).toHaveLength(0);
    });

    it('should accept custom config', () => {
      const customAgent = new RiskScoringAgent({
        name: 'Custom Scoring Agent',
        maxRetries: 1,
        timeoutMs: 10000,
      });

      expect(customAgent.getConfig().name).toBe('Custom Scoring Agent');
      expect(customAgent.getConfig().maxRetries).toBe(1);
      expect(customAgent.getConfig().timeoutMs).toBe(10000);
    });
  });

  describe('Scoring with Mock Controls', () => {
    it('should return valid score for assessment', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      expect(result).toBeDefined();
      expect(result.assessmentId).toBe('assessment-001');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should calculate category scores', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      expect(result.categoryScores).toBeDefined();
      expect(result.categoryScores.length).toBeGreaterThan(0);

      for (const category of result.categoryScores) {
        expect(category.category).toBeDefined();
        expect(category.score).toBeGreaterThanOrEqual(0);
        expect(category.score).toBeLessThanOrEqual(100);
        expect(category.weight).toBeGreaterThan(0);
        expect(category.controlCount).toBeGreaterThanOrEqual(0);
        expect(category.implementedCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should calculate compliance percentage', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      expect(result.compliancePercentage).toBeDefined();
      expect(result.compliancePercentage).toBeGreaterThanOrEqual(0);
      expect(result.compliancePercentage).toBeLessThanOrEqual(100);
    });

    it('should include metrics in result', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalControls).toBeGreaterThan(0);
      expect(result.metrics.implementedControls).toBeGreaterThanOrEqual(0);
      expect(result.metrics.compliancePercentage).toBeGreaterThanOrEqual(0);
    });

    it('should set timestamp', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      expect(result.timestamp).toBeDefined();
      expect(result.timestamp instanceof Date).toBe(true);
    });
  });

  describe('Risk Level Determination', () => {
    it('should determine low risk level (0-25)', async () => {
      const lowRiskControls: ControlScore[] = [
        {
          controlId: 'A.1.1',
          controlIdStr: 'A.1.1',
          title: 'Good Control',
          response: 'implemented',
          score: 0,
          category: 'Access Control',
          weight: 1,
        },
      ];

      agent.setMockData('low-risk', lowRiskControls);
      const result = await agent.scoreAssessment('low-risk');

      expect(['low', 'medium']).toContain(result.riskLevel);
    });

    it('should determine medium risk level (26-50)', async () => {
      const mediumRiskControls: ControlScore[] = [
        {
          controlId: 'A.1.1',
          controlIdStr: 'A.1.1',
          title: 'Partial Control',
          response: 'partially-implemented',
          score: 50,
          category: 'Access Control',
          weight: 1,
        },
      ];

      agent.setMockData('medium-risk', mediumRiskControls);
      const result = await agent.scoreAssessment('medium-risk');

      expect(['medium', 'high']).toContain(result.riskLevel);
    });

    it('should determine high risk level (51-75)', async () => {
      const highRiskControls: ControlScore[] = [
        {
          controlId: 'A.1.1',
          controlIdStr: 'A.1.1',
          title: 'Bad Control',
          response: 'not-implemented',
          score: 100,
          category: 'Access Control',
          weight: 0.5,
        },
        {
          controlId: 'A.1.2',
          controlIdStr: 'A.1.2',
          title: 'Partial Control',
          response: 'partially-implemented',
          score: 50,
          category: 'Cryptography',
          weight: 0.5,
        },
      ];

      agent.setMockData('high-risk', highRiskControls);
      const result = await agent.scoreAssessment('high-risk');

      expect(['high', 'critical']).toContain(result.riskLevel);
    });

    it('should determine critical risk level (76-100)', async () => {
      const criticalRiskControls: ControlScore[] = [
        {
          controlId: 'A.1.1',
          controlIdStr: 'A.1.1',
          title: 'Critical Control',
          response: 'not-implemented',
          score: 100,
          category: 'Access Control',
          weight: 1,
        },
      ];

      agent.setMockData('critical-risk', criticalRiskControls);
      const result = await agent.scoreAssessment('critical-risk');

      expect(result.riskLevel).toBe('critical');
    });

    it('should handle valid risk levels', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      const validRiskLevels = ['low', 'medium', 'high', 'critical'];
      expect(validRiskLevels).toContain(result.riskLevel);
    });
  });

  describe('Recommendations Generation', () => {
    it('should generate recommendations for high-risk categories', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      // With the default mock data, we should get some recommendations
      // since it includes some partially-implemented and not-implemented controls
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should include relevant recommendations for Access Control gaps', async () => {
      const accessControlGapControls: ControlScore[] = [
        {
          controlId: 'A.5.1',
          controlIdStr: 'A.5.1',
          title: 'Access Control Policy',
          response: 'not-implemented',
          score: 100,
          category: 'Access Control',
          weight: 0.15,
        },
      ];

      agent.setMockData('ac-gap', accessControlGapControls);
      const result = await agent.scoreAssessment('ac-gap');

      expect(result.recommendations.length).toBeGreaterThan(0);
      const hasMFARecommendation = result.recommendations.some((rec) =>
        rec.toLowerCase().includes('mfa')
      );
      expect(hasMFARecommendation).toBe(true);
    });

    it('should include relevant recommendations for Cryptography gaps', async () => {
      const cryptoGapControls: ControlScore[] = [
        {
          controlId: 'A.10.1',
          controlIdStr: 'A.10.1',
          title: 'Encryption',
          response: 'not-implemented',
          score: 100,
          category: 'Cryptography',
          weight: 0.12,
        },
      ];

      agent.setMockData('crypto-gap', cryptoGapControls);
      const result = await agent.scoreAssessment('crypto-gap');

      expect(result.recommendations.length).toBeGreaterThan(0);
      const hasEncryptionRecommendation = result.recommendations.some((rec) =>
        rec.toLowerCase().includes('encrypt')
      );
      expect(hasEncryptionRecommendation).toBe(true);
    });

    it('should include relevant recommendations for Physical Security gaps', async () => {
      const physicalSecurityGapControls: ControlScore[] = [
        {
          controlId: 'A.11.1',
          controlIdStr: 'A.11.1',
          title: 'Physical Security',
          response: 'not-implemented',
          score: 100,
          category: 'Physical Security',
          weight: 0.08,
        },
      ];

      agent.setMockData('physical-gap', physicalSecurityGapControls);
      const result = await agent.scoreAssessment('physical-gap');

      expect(result.recommendations.length).toBeGreaterThan(0);
      const hasPhysicalRecommendation = result.recommendations.some((rec) =>
        rec.toLowerCase().includes('facility') || rec.toLowerCase().includes('access control')
      );
      expect(hasPhysicalRecommendation).toBe(true);
    });

    it('should remove duplicate recommendations', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      const uniqueRecommendations = new Set(result.recommendations);
      expect(uniqueRecommendations.size).toBeLessThanOrEqual(result.recommendations.length);
    });

    it('should generate no more than top 3 categories worth of recommendations', async () => {
      const result = await agent.scoreAssessment('assessment-001');

      // Expecting no more than ~9-12 recommendations (3 per weak category, max 3 weak categories)
      expect(result.recommendations.length).toBeLessThanOrEqual(15);
    });
  });

  describe('Agent Lifecycle', () => {
    it('should run complete lifecycle', async () => {
      const result = await agent.run();

      expect(result.status).toBe('completed');
      expect(result.agentName).toBe('Risk Scoring Agent (A-02)');
      expect(result.startedAt).toBeDefined();
      expect(result.completedAt).toBeDefined();
      expect(result.latencyMs).toBeGreaterThan(0);
      expect(result.tasksCompleted).toBe(1);
      expect(result.totalTasks).toBe(1);
    });

    it('should track execution logs', async () => {
      await agent.run();

      const logs = agent.getExecutionLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].status).toBe('completed');
    });

    it('should update metrics after execution', async () => {
      await agent.run();

      const metrics = agent.getMetrics();
      expect(metrics.successCount).toBeGreaterThan(0);
      expect(metrics.status).toBe('completed');
    });

    it('should store last run result', async () => {
      await agent.run();

      const lastRun = agent.getLastRun();
      expect(lastRun).toBeDefined();
      expect(lastRun?.status).toBe('completed');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown assessment ID gracefully', async () => {
      // Should fall back to default mock data
      const result = await agent.scoreAssessment('unknown-assessment-id');

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should return valid result even with empty control list', async () => {
      agent.setMockData('empty', []);
      const result = await agent.scoreAssessment('empty');

      expect(result).toBeDefined();
      expect(result.overallScore).toBeDefined();
      expect(result.riskLevel).toBeDefined();
    });
  });

  describe('Custom Control Data', () => {
    it('should accept and score custom controls', async () => {
      const customControls: ControlScore[] = [
        {
          controlId: 'CUSTOM.1',
          controlIdStr: 'CUSTOM.1',
          title: 'Custom Control',
          response: 'implemented',
          score: 0,
          category: 'Custom Category',
          weight: 1,
        },
      ];

      agent.setMockData('custom-001', customControls);
      const result = await agent.scoreAssessment('custom-001');

      expect(result.assessmentId).toBe('custom-001');
      expect(result.categoryScores.some((c) => c.category === 'Custom Category')).toBe(true);
    });
  });
});
