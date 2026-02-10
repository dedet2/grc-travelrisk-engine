import { getCategoryWeight, getResponseScore } from './weights';
import type { ControlScore, ScoringInput, ScoringOutput, CategoryScore } from './types';

/**
 * Core risk scoring engine
 * Calculates risk scores based on control implementation status
 * Scale: 0-100 (lower is better/lower risk)
 */
export function calculateRiskScore(input: ScoringInput): ScoringOutput {
  if (!input.controls || input.controls.length === 0) {
    return {
      assessmentId: input.assessmentId,
      overallScore: 0,
      riskLevel: 'low',
      categoryScores: [],
      timestamp: new Date(),
    };
  }

  // Group controls by category
  const controlsByCategory = groupControlsByCategory(input.controls);

  // Calculate category scores
  const categoryScores = calculateCategoryScores(controlsByCategory);

  // Calculate overall score
  const overallScore = calculateOverallScore(categoryScores);

  // Determine risk level
  const riskLevel = determineRiskLevel(overallScore);

  return {
    assessmentId: input.assessmentId,
    overallScore,
    riskLevel,
    categoryScores,
    timestamp: new Date(),
  };
}

/**
 * Group controls by category
 */
function groupControlsByCategory(controls: ControlScore[]): Map<string, ControlScore[]> {
  const grouped = new Map<string, ControlScore[]>();

  for (const control of controls) {
    const category = control.category || 'Uncategorized';
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(control);
  }

  return grouped;
}

/**
 * Calculate scores for each category
 */
function calculateCategoryScores(
  controlsByCategory: Map<string, ControlScore[]>
): CategoryScore[] {
  const categoryScores: CategoryScore[] = [];

  for (const [category, controls] of controlsByCategory.entries()) {
    const weight = getCategoryWeight(category);
    const implementedCount = controls.filter((c) => c.response === 'implemented').length;

    // Calculate average score for this category (0-100 scale)
    const categoryRiskScore =
      controls.reduce((sum, control) => {
        const responseScore = getResponseScore(control.response);
        return sum + responseScore;
      }, 0) / controls.length;

    const normalizedScore = categoryRiskScore * 100;

    categoryScores.push({
      category,
      score: Math.round(normalizedScore),
      weight,
      controlCount: controls.length,
      implementedCount,
    });
  }

  return categoryScores.sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Calculate overall score from category scores
 */
function calculateOverallScore(categoryScores: CategoryScore[]): number {
  if (categoryScores.length === 0) {
    return 0;
  }

  // Calculate weighted average
  let totalWeight = 0;
  let weightedSum = 0;

  for (const category of categoryScores) {
    const weight = category.weight || 0.1;
    weightedSum += category.score * weight;
    totalWeight += weight;
  }

  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return Math.round(overallScore);
}

/**
 * Determine risk level based on score
 * 0-25: Low, 26-50: Medium, 51-75: High, 76-100: Critical
 */
function determineRiskLevel(
  score: number
): 'low' | 'medium' | 'high' | 'critical' {
  if (score <= 25) {
    return 'low';
  }
  if (score <= 50) {
    return 'medium';
  }
  if (score <= 75) {
    return 'high';
  }
  return 'critical';
}

/**
 * Get risk color for frontend display
 */
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'low':
      return '#10b981';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    case 'critical':
      return '#7f1d1d';
    default:
      return '#6b7280';
  }
}

/**
 * Calculate metrics for display
 */
export function calculateAssessmentMetrics(categoryScores: CategoryScore[]) {
  const totalControls = categoryScores.reduce((sum, c) => sum + c.controlCount, 0);
  const implementedControls = categoryScores.reduce((sum, c) => sum + c.implementedCount, 0);
  const compliance = totalControls > 0 ? (implementedControls / totalControls) * 100 : 0;

  return {
    totalControls,
    implementedControls,
    compliancePercentage: Math.round(compliance),
  };
}
