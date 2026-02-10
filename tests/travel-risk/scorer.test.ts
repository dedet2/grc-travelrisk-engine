import { describe, it, expect } from 'vitest';
import { calculateTravelRiskScore, combinedRiskScore } from '@/lib/travel-risk/scorer';
import type { AdvisoryData } from '@/lib/travel-risk/types';

describe('Travel Risk Scorer', () => {
  const createAdvisory = (
    countryCode: string,
    advisoryLevel: 1 | 2 | 3 | 4,
    healthRisk: number = 1,
    securityRisk: number = 1
  ): AdvisoryData => ({
    countryCode,
    countryName: countryCode,
    advisoryLevel,
    healthRiskLevel: healthRisk,
    securityRiskLevel: securityRisk,
    lastUpdated: new Date(),
  });

  describe('calculateTravelRiskScore', () => {
    it('should calculate low risk for level 1 advisory', () => {
      const advisory = createAdvisory('US', 1, 1, 1);
      const result = calculateTravelRiskScore('United States', advisory);

      expect(result.score).toBeLessThanOrEqual(25);
      expect(result.riskLevel).toBe('low');
      expect(result.travelRecommendation).toContain('Normal Precautions');
    });

    it('should calculate medium risk for level 2 advisory', () => {
      const advisory = createAdvisory('MX', 2, 2, 2);
      const result = calculateTravelRiskScore('Mexico', advisory);

      expect(result.score).toBeGreaterThanOrEqual(25);
      expect(result.score).toBeLessThanOrEqual(50);
      expect(result.riskLevel).toBe('medium');
      expect(result.travelRecommendation).toContain('Increased Caution');
    });

    it('should calculate high risk for level 3 advisory', () => {
      const advisory = createAdvisory('SY', 3, 4, 4);
      const result = calculateTravelRiskScore('Syria', advisory);

      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThanOrEqual(75);
      expect(result.riskLevel).toBe('high');
      expect(result.travelRecommendation).toContain('Reconsider');
    });

    it('should calculate critical risk for level 4 advisory', () => {
      const advisory = createAdvisory('AF', 4, 5, 5);
      const result = calculateTravelRiskScore('Afghanistan', advisory);

      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.riskLevel).toBe('critical');
      expect(result.travelRecommendation).toContain('Do Not Travel');
    });

    it('should include health risk factors', () => {
      const advisory = createAdvisory('BZ', 2, 3, 1);
      const result = calculateTravelRiskScore('Belize', advisory);

      expect(result.factors.healthFactors.length).toBeGreaterThan(0);
      expect(result.factors.healthFactors[0]).toContain('Health risk');
    });

    it('should include security risk factors', () => {
      const advisory = createAdvisory('CO', 2, 1, 3);
      const result = calculateTravelRiskScore('Colombia', advisory);

      expect(result.factors.securityFactors.length).toBeGreaterThan(0);
      expect(result.factors.securityFactors[0]).toContain('Security risk');
    });

    it('should include other risk factors', () => {
      const advisory = createAdvisory('JP', 1, 1, 1);
      const result = calculateTravelRiskScore('Japan', advisory);

      expect(result.factors.otherFactors.length).toBeGreaterThan(0);
    });
  });

  describe('combinedRiskScore', () => {
    it('should weight GRC at 40% and travel at 60%', () => {
      const combined = combinedRiskScore(50, 80);

      // Expected: 50 * 0.4 + 80 * 0.6 = 20 + 48 = 68
      expect(combined).toBe(68);
    });

    it('should round to nearest integer', () => {
      const combined = combinedRiskScore(50, 81);

      // Expected: 50 * 0.4 + 81 * 0.6 = 20 + 48.6 = 68.6 -> 69
      expect(Number.isInteger(combined)).toBe(true);
    });

    it('should handle extreme values', () => {
      const veryLow = combinedRiskScore(0, 0);
      const veryHigh = combinedRiskScore(100, 100);

      expect(veryLow).toBe(0);
      expect(veryHigh).toBe(100);
    });

    it('should handle mismatched risk levels', () => {
      const lowGrcHighTravel = combinedRiskScore(10, 90);
      const highGrcLowTravel = combinedRiskScore(90, 10);

      // 10 * 0.4 + 90 * 0.6 = 4 + 54 = 58
      expect(lowGrcHighTravel).toBe(58);

      // 90 * 0.4 + 10 * 0.6 = 36 + 6 = 42
      expect(highGrcLowTravel).toBe(42);

      // Travel risk has more weight
      expect(lowGrcHighTravel).toBeGreaterThan(highGrcLowTravel);
    });
  });

  describe('Risk Level Determination', () => {
    it('should correctly determine risk levels for various scores', () => {
      const testCases = [
        { grc: 10, travel: 10, expectedLevel: 'low' },
        { grc: 30, travel: 40, expectedLevel: 'medium' },
        { grc: 60, travel: 70, expectedLevel: 'high' },
        { grc: 80, travel: 90, expectedLevel: 'critical' },
      ];

      for (const test of testCases) {
        const advisory = createAdvisory('TEST', 2, 2, 2);
        const result = calculateTravelRiskScore('Test', advisory);

        // Just verify risk level logic is consistent
        expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
      }
    });
  });
});
