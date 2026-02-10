import type { ControlMapping, FrameworkMapping } from './types';

/**
 * Map controls between different frameworks
 * Helps align controls across different GRC standards (ISO 27001, NIST, etc.)
 */
export class ControlMapper {
  /**
   * Map source controls to target framework controls
   * Uses semantic similarity to find matches
   */
  static mapControls(
    sourceControls: string[],
    targetControls: string[]
  ): ControlMapping[] {
    const mappings: ControlMapping[] = [];

    for (const sourceControl of sourceControls) {
      const targetMatches = this.findBestMatches(sourceControl, targetControls);

      if (targetMatches.length > 0) {
        mappings.push({
          sourceControlId: sourceControl,
          sourceControlTitle: sourceControl,
          targetControlIds: targetMatches.map((m) => m.id),
          targetControlTitles: targetMatches.map((m) => m.title),
          confidenceScore: targetMatches[0].score,
          reasoning: `Matched based on semantic similarity to control scope`,
        });
      }
    }

    return mappings;
  }

  /**
   * Find best matching controls using keyword similarity
   */
  private static findBestMatches(
    sourceControl: string,
    targetControls: string[],
    limit = 3
  ) {
    const sourceKeywords = this.extractKeywords(sourceControl);

    const matches = targetControls.map((target) => {
      const targetKeywords = this.extractKeywords(target);
      const score = this.calculateSimilarity(sourceKeywords, targetKeywords);
      return {
        id: target,
        title: target,
        score,
      };
    });

    return matches
      .filter((m) => m.score > 0.3) // Only matches above 30% similarity
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Extract keywords from control description
   */
  private static extractKeywords(text: string): Set<string> {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .map((w) => w.replace(/[^a-z0-9]/g, ''));

    // Remove common words
    const stopwords = new Set([
      'shall', 'must', 'should', 'implement', 'establish',
      'maintain', 'ensure', 'monitor', 'review', 'control'
    ]);

    return new Set(words.filter((w) => !stopwords.has(w)));
  }

  /**
   * Calculate Jaccard similarity between two keyword sets
   */
  private static calculateSimilarity(set1: Set<string>, set2: Set<string>): number {
    if (set1.size === 0 && set2.size === 0) {
      return 1.0;
    }

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.size / union.size;
  }

  /**
   * Create framework mapping
   */
  static createFrameworkMapping(
    sourceFramework: string,
    targetFramework: string,
    controlMappings: ControlMapping[]
  ): FrameworkMapping {
    const completeness =
      controlMappings.length > 0
        ? controlMappings.reduce((sum, m) => sum + m.confidenceScore, 0) /
          controlMappings.length
        : 0;

    return {
      sourceFramework,
      targetFramework,
      mappings: controlMappings,
      completeness: Math.round(completeness * 100) / 100,
      timestamp: new Date(),
    };
  }
}

/**
 * Pre-defined mappings between common frameworks
 * (ISO 27001, NIST CSF, CIS Controls, etc.)
 */
export const COMMON_FRAMEWORK_MAPPINGS = {
  'ISO 27001': {
    'NIST CSF': 0.85,
    'CIS Controls': 0.78,
    SOC2: 0.82,
  },
  'NIST CSF': {
    'ISO 27001': 0.85,
    'CIS Controls': 0.80,
    SOC2: 0.88,
  },
  'CIS Controls': {
    'ISO 27001': 0.78,
    'NIST CSF': 0.80,
    SOC2: 0.75,
  },
};

/**
 * Get framework mapping compatibility score
 */
export function getFrameworkCompatibility(
  sourceFramework: string,
  targetFramework: string
): number {
  const mapping =
    COMMON_FRAMEWORK_MAPPINGS[
      sourceFramework as keyof typeof COMMON_FRAMEWORK_MAPPINGS
    ];
  if (!mapping) {
    return 0.5; // Default medium compatibility
  }

  return (
    mapping[targetFramework as keyof typeof mapping] ?? 0.5
  );
}
