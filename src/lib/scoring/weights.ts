import type { ScoringWeights } from './types';

/**
 * Default scoring weights for GRC framework assessment
 * Weights are normalized from 0 to 1
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  categories: {
    'Access Control': 0.15,
    'Asset Management': 0.1,
    'Cryptography': 0.12,
    'Physical Security': 0.08,
    'Incident Management': 0.15,
    'Business Continuity': 0.12,
    'Risk Assessment': 0.1,
    'Compliance': 0.1,
    'Operations': 0.08,
  },
  controlTypeWeights: {
    technical: 0.5,
    operational: 0.3,
    management: 0.2,
  },
};

/**
 * Get category weight
 */
export function getCategoryWeight(category: string): number {
  return DEFAULT_SCORING_WEIGHTS.categories[category] ?? 0.1;
}

/**
 * Get control type weight
 */
export function getControlTypeWeight(
  controlType: 'technical' | 'operational' | 'management'
): number {
  return DEFAULT_SCORING_WEIGHTS.controlTypeWeights[controlType];
}

/**
 * Get default score for control response
 * Implemented = 0 (best), Partially = 0.5, Not Implemented = 1.0 (worst)
 */
export function getResponseScore(response: string): number {
  switch (response) {
    case 'implemented':
      return 0;
    case 'partially-implemented':
      return 0.5;
    case 'not-implemented':
      return 1.0;
    default:
      return 1.0;
  }
}
