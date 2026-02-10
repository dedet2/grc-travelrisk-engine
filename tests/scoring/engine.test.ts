import { describe, it, expect } from 'vitest';
import { calculateRiskScore, calculateAssessmentMetrics } from '@/lib/scoring/engine';
import type { ControlScore, ScoringInput } from '@/lib/scoring/types';

describe('Scoring Engine', () => {
  const createTestControl = (
    id: string,
    response: 'implemented' | 'partially-implemented' | 'not-implemented',
    category: string
  ): ControlScore => ({
    controlId: id,
    controlIdStr: id,
    title: `Control ${id}`,
    response,
    score: response === 'implemented' ? 0 : response === 'partially-implemented' ? 0.5 : 1.0,
    category,
  });

  describe('calculateRiskScore', () => {
    it('should calculate low risk for all implemented controls', () => {
      const input: ScoringInput = {
        assessmentId: 'test-1',
        frameworkId: 'framework-1',
        controls: [
          createTestControl('ctrl-1', 'implemented', 'Access Control'),
          createTestControl('ctrl-2', 'implemented', 'Access Control'),
          createTestControl('ctrl-3', 'implemented', 'Incident Management'),
        ],
      };

      const result = calculateRiskScore(input);

      expect(result.overallScore).toBeLessThanOrEqual(25);
      expect(result.riskLevel).toBe('low');
      expect(result.categoryScores.length).toBe(2);
    });

    it('should calculate high risk for no implemented controls', () => {
      const input: ScoringInput = {
        assessmentId: 'test-2',
        frameworkId: 'framework-1',
        controls: [
          createTestControl('ctrl-1', 'not-implemented', 'Access Control'),
          createTestControl('ctrl-2', 'not-implemented', 'Access Control'),
          createTestControl('ctrl-3', 'not-implemented', 'Incident Management'),
        ],
      };

      const result = calculateRiskScore(input);

      expect(result.overallScore).toBeGreaterThanOrEqual(75);
      expect(result.riskLevel).toBe('critical');
    });

    it('should calculate medium risk for mixed implementation', () => {
      const input: ScoringInput = {
        assessmentId: 'test-3',
        frameworkId: 'framework-1',
        controls: [
          createTestControl('ctrl-1', 'implemented', 'Access Control'),
          createTestControl('ctrl-2', 'partially-implemented', 'Access Control'),
          createTestControl('ctrl-3', 'not-implemented', 'Incident Management'),
        ],
      };

      const result = calculateRiskScore(input);

      expect(result.overallScore).toBeGreaterThan(25);
      expect(result.overallScore).toBeLessThan(75);
      expect(['medium', 'high'].includes(result.riskLevel)).toBe(true);
    });

    it('should handle empty controls array', () => {
      const input: ScoringInput = {
        assessmentId: 'test-4',
        frameworkId: 'framework-1',
        controls: [],
      };

      const result = calculateRiskScore(input);

      expect(result.overallScore).toBe(0);
      expect(result.riskLevel).toBe('low');
      expect(result.categoryScores.length).toBe(0);
    });

    it('should handle single control', () => {
      const input: ScoringInput = {
        assessmentId: 'test-5',
        frameworkId: 'framework-1',
        controls: [createTestControl('ctrl-1', 'implemented', 'Access Control')],
      };

      const result = calculateRiskScore(input);

      expect(result.overallScore).toBeLessThanOrEqual(25);
      expect(result.riskLevel).toBe('low');
      expect(result.categoryScores.length).toBe(1);
      expect(result.categoryScores[0].controlCount).toBe(1);
      expect(result.categoryScores[0].implementedCount).toBe(1);
    });

    it('should properly weight categories', () => {
      const input: ScoringInput = {
        assessmentId: 'test-6',
        frameworkId: 'framework-1',
        controls: [
          createTestControl('ctrl-1', 'implemented', 'Access Control'),
          createTestControl('ctrl-2', 'implemented', 'Incident Management'),
          createTestControl('ctrl-3', 'not-implemented', 'Access Control'),
        ],
      };

      const result = calculateRiskScore(input);

      // Access Control (15%) has 1 implemented, 1 not = 50
      // Incident Management (15%) has 1 implemented = 0
      // Overall should be weighted average
      expect(result.categoryScores.length).toBe(2);
      const acCategory = result.categoryScores.find(
        (c) => c.category === 'Access Control'
      );
      expect(acCategory?.weight).toBe(0.15);
    });
  });

  describe('calculateAssessmentMetrics', () => {
    it('should calculate compliance percentage correctly', () => {
      const categoryScores = [
        {
          category: 'Access Control',
          score: 0,
          weight: 0.15,
          controlCount: 5,
          implementedCount: 5,
        },
        {
          category: 'Incident Management',
          score: 50,
          weight: 0.15,
          controlCount: 4,
          implementedCount: 2,
        },
      ];

      const metrics = calculateAssessmentMetrics(categoryScores);

      expect(metrics.totalControls).toBe(9);
      expect(metrics.implementedControls).toBe(7);
      expect(metrics.compliancePercentage).toBe(78); // 7/9 = 77.77%
    });

    it('should handle empty category scores', () => {
      const metrics = calculateAssessmentMetrics([]);

      expect(metrics.totalControls).toBe(0);
      expect(metrics.implementedControls).toBe(0);
      expect(metrics.compliancePercentage).toBe(0);
    });

    it('should handle 100% implementation', () => {
      const categoryScores = [
        {
          category: 'Access Control',
          score: 0,
          weight: 0.5,
          controlCount: 10,
          implementedCount: 10,
        },
      ];

      const metrics = calculateAssessmentMetrics(categoryScores);

      expect(metrics.compliancePercentage).toBe(100);
    });

    it('should handle 0% implementation', () => {
      const categoryScores = [
        {
          category: 'Access Control',
          score: 100,
          weight: 0.5,
          controlCount: 10,
          implementedCount: 0,
        },
      ];

      const metrics = calculateAssessmentMetrics(categoryScores);

      expect(metrics.compliancePercentage).toBe(0);
    });
  });
});
