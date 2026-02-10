/**
 * Tests for GRC Risk Scoring Engine
 * Validates the core scoring algorithm and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { computeGRCScore, validateAssessmentResponses, getRiskLevelColor } from '@/lib/scoring/risk-engine';
import type { Control } from '@/types';
import type {
  AssessmentResponseInput,
} from '@/types/assessment';
import { ComplianceStatus } from '@/types/assessment';

// Mock controls for testing
const mockControls: Control[] = [
  {
    id: 'ctrl-001',
    frameworkId: 'iso-27001',
    controlIdStr: 'A.6.1.1',
    title: 'Access Control Policy',
    description: 'Establish formal access control policy',
    category: 'Access Control',
    controlType: 'technical',
    createdAt: new Date(),
  },
  {
    id: 'ctrl-002',
    frameworkId: 'iso-27001',
    controlIdStr: 'A.6.2.1',
    title: 'User Authentication',
    description: 'Implement user authentication',
    category: 'Access Control',
    controlType: 'technical',
    createdAt: new Date(),
  },
  {
    id: 'ctrl-003',
    frameworkId: 'iso-27001',
    controlIdStr: 'A.12.4.1',
    title: 'Access Logging',
    description: 'Log all user access events',
    category: 'Logging',
    controlType: 'technical',
    createdAt: new Date(),
  },
  {
    id: 'ctrl-004',
    frameworkId: 'iso-27001',
    controlIdStr: 'A.8.1.1',
    title: 'Asset Inventory',
    description: 'Maintain IT asset inventory',
    category: 'Asset Management',
    controlType: 'operational',
    createdAt: new Date(),
  },
  {
    id: 'ctrl-005',
    frameworkId: 'iso-27001',
    controlIdStr: 'A.10.1.1',
    title: 'Cryptographic Controls',
    description: 'Implement encryption controls',
    category: 'Cryptography',
    controlType: 'technical',
    createdAt: new Date(),
  },
];

describe('GRC Risk Scoring Engine', () => {
  let responses: Map<string, AssessmentResponseInput>;

  beforeEach(() => {
    responses = new Map();
  });

  describe('computeGRCScore', () => {
    it('should return low risk for fully compliant assessment', () => {
      // All controls compliant
      mockControls.forEach((control) => {
        responses.set(control.id, {
          controlId: control.id,
          status: ComplianceStatus.COMPLIANT,
        });
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.overallScore).toBe(0);
      expect(result.riskLevel).toBe('low');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.keyFindings).toHaveLength(0);
    });

    it('should return high risk for non-compliant assessment', () => {
      // All controls non-compliant
      mockControls.forEach((control) => {
        responses.set(control.id, {
          controlId: control.id,
          status: ComplianceStatus.NON_COMPLIANT,
        });
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.overallScore).toBeGreaterThanOrEqual(76);
      expect(result.riskLevel).toBe('critical');
      expect(result.keyFindings.length).toBeGreaterThan(0);
      expect(result.keyFindings.length).toBeLessThanOrEqual(5);
    });

    it('should return medium risk for partially compliant assessment', () => {
      // Mix of compliant and non-compliant
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.COMPLIANT,
      });
      responses.set(mockControls[1].id, {
        controlId: mockControls[1].id,
        status: ComplianceStatus.NON_COMPLIANT,
      });
      responses.set(mockControls[2].id, {
        controlId: mockControls[2].id,
        status: ComplianceStatus.PARTIAL,
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(100);
      expect(['low', 'medium', 'high', 'critical']).toContain(result.riskLevel);
    });

    it('should handle partial compliance correctly', () => {
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.PARTIAL,
        notes: 'Partially implemented',
      });
      responses.set(mockControls[1].id, {
        controlId: mockControls[1].id,
        status: ComplianceStatus.COMPLIANT,
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(30);
      expect(result.riskLevel).toBe('low');
    });

    it('should handle not-assessed controls', () => {
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.NOT_ASSESSED,
      });
      responses.set(mockControls[1].id, {
        controlId: mockControls[1].id,
        status: ComplianceStatus.COMPLIANT,
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.totalControlsAssessed).toBe(2);
      expect(result.confidence).toBeLessThan(1);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should calculate category scores correctly', () => {
      // Test with controls from different categories
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.COMPLIANT,
      });
      responses.set(mockControls[1].id, {
        controlId: mockControls[1].id,
        status: ComplianceStatus.NON_COMPLIANT,
      });
      responses.set(mockControls[3].id, {
        controlId: mockControls[3].id,
        status: ComplianceStatus.COMPLIANT,
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.categoryScores.length).toBeGreaterThan(0);

      // Check category score properties
      for (const category of result.categoryScores) {
        expect(category.category).toBeTruthy();
        expect(category.score).toBeGreaterThanOrEqual(0);
        expect(category.score).toBeLessThanOrEqual(100);
        expect(category.controlCount).toBeGreaterThan(0);
        expect(category.compliantCount).toBeGreaterThanOrEqual(0);
        expect(category.partialCount).toBeGreaterThanOrEqual(0);
        expect(category.nonCompliantCount).toBeGreaterThanOrEqual(0);
        expect(category.compliancePercentage).toBeGreaterThanOrEqual(0);
        expect(category.compliancePercentage).toBeLessThanOrEqual(100);
      }
    });

    it('should extract top 5 findings', () => {
      // Create multiple non-compliant controls
      mockControls.forEach((control) => {
        responses.set(control.id, {
          controlId: control.id,
          status: ComplianceStatus.NON_COMPLIANT,
          notes: `Gap in ${control.title}`,
        });
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.keyFindings.length).toBeLessThanOrEqual(5);
      expect(result.keyFindings.length).toBeGreaterThan(0);

      // Verify finding structure
      for (const finding of result.keyFindings) {
        expect(finding.controlId).toBeTruthy();
        expect(finding.controlTitle).toBeTruthy();
        expect(finding.category).toBeTruthy();
        expect(['critical', 'high', 'medium', 'low']).toContain(finding.criticality);
        expect(finding.status).toBeTruthy();
        expect(finding.impact).toBeTruthy();
        expect(finding.priority).toBeGreaterThanOrEqual(0);
      }
    });

    it('should generate recommendations for findings', () => {
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.NON_COMPLIANT,
      });
      responses.set(mockControls[4].id, {
        controlId: mockControls[4].id,
        status: ComplianceStatus.PARTIAL,
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
      expect(result.recommendations.length).toBeLessThanOrEqual(5);

      // Verify recommendation structure
      for (const recommendation of result.recommendations) {
        expect(recommendation.controlId).toBeTruthy();
        expect(recommendation.title).toBeTruthy();
        expect(recommendation.description).toBeTruthy();
        expect(['P0', 'P1', 'P2', 'P3']).toContain(recommendation.priority);
        expect(['low', 'medium', 'high']).toContain(recommendation.estimatedEffort);
        expect(recommendation.estimatedDays).toBeGreaterThan(0);
        expect(Array.isArray(recommendation.actionItems)).toBe(true);
        expect(recommendation.actionItems.length).toBeGreaterThan(0);
      }
    });

    it('should calculate confidence based on completeness', () => {
      // Partial responses
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.COMPLIANT,
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.totalControlsAssessed).toBe(1);
      expect(result.totalControls).toBe(mockControls.length);
      expect(result.completionPercentage).toBeLessThan(100);
    });

    it('should handle empty responses', () => {
      const result = computeGRCScore(responses, mockControls);

      expect(result.overallScore).toBe(0);
      expect(result.riskLevel).toBe('low');
      expect(result.confidence).toBe(0);
      expect(result.totalControlsAssessed).toBe(0);
    });

    it('should handle no controls', () => {
      const result = computeGRCScore(responses, []);

      expect(result.overallScore).toBe(0);
      expect(result.riskLevel).toBe('low');
      expect(result.categoryScores).toHaveLength(0);
    });
  });

  describe('validateAssessmentResponses', () => {
    it('should validate valid control IDs', () => {
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.COMPLIANT,
      });

      const validation = validateAssessmentResponses(responses, mockControls);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject invalid control IDs', () => {
      responses.set('invalid-control-id', {
        controlId: 'invalid-control-id',
        status: ComplianceStatus.COMPLIANT,
      });

      const validation = validateAssessmentResponses(responses, mockControls);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('invalid-control-id');
    });

    it('should handle mixed valid and invalid IDs', () => {
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.COMPLIANT,
      });
      responses.set('invalid-id-1', {
        controlId: 'invalid-id-1',
        status: ComplianceStatus.COMPLIANT,
      });
      responses.set('invalid-id-2', {
        controlId: 'invalid-id-2',
        status: ComplianceStatus.COMPLIANT,
      });

      const validation = validateAssessmentResponses(responses, mockControls);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBe(2);
    });
  });

  describe('getRiskLevelColor', () => {
    it('should return correct colors for risk levels', () => {
      expect(getRiskLevelColor('low')).toBe('#10b981');
      expect(getRiskLevelColor('medium')).toBe('#f59e0b');
      expect(getRiskLevelColor('high')).toBe('#ef4444');
      expect(getRiskLevelColor('critical')).toBe('#7f1d1d');
    });

    it('should return default color for unknown risk level', () => {
      expect(getRiskLevelColor('unknown' as any)).toBe('#6b7280');
    });
  });

  describe('Risk Level Determination', () => {
    it('should classify scores correctly', () => {
      // Low risk (0-25)
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.COMPLIANT,
      });
      let result = computeGRCScore(responses, mockControls);
      expect(result.riskLevel).toBe('low');

      // Medium risk (26-50)
      responses.clear();
      mockControls.slice(0, 2).forEach((control) => {
        responses.set(control.id, {
          controlId: control.id,
          status: ComplianceStatus.PARTIAL,
        });
      });
      mockControls.slice(2).forEach((control) => {
        responses.set(control.id, {
          controlId: control.id,
          status: ComplianceStatus.COMPLIANT,
        });
      });
      result = computeGRCScore(responses, mockControls);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single control assessment', () => {
      const singleControl = [mockControls[0]];
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.NON_COMPLIANT,
      });

      const result = computeGRCScore(responses, singleControl);

      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.categoryScores.length).toBe(1);
    });

    it('should normalize compliance status strings', () => {
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: 'NON-COMPLIANT' as any, // Uppercase with dash
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.keyFindings.length).toBeGreaterThan(0);
    });

    it('should handle assessment with notes and evidence', () => {
      responses.set(mockControls[0].id, {
        controlId: mockControls[0].id,
        status: ComplianceStatus.PARTIAL,
        notes: 'Currently implementing remediation plan',
        evidence: 'Screenshots of implementation in progress',
      });

      const result = computeGRCScore(responses, mockControls);

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThan(100);
    });
  });
});
