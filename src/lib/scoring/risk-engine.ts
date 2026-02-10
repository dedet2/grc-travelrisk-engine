/**
 * Core GRC Risk Scoring Engine
 * Computes risk scores (0-100) based on assessment responses against framework controls
 * 0 = perfect compliance, 100 = critical risk
 */

import type { Control } from '@/types';
import type {
  AssessmentResponseInput,
  AssessmentResult,
  CategoryScore,
  ComplianceStatus,
  Finding,
  Recommendation,
} from '@/types/assessment';
import { ComplianceStatus as ComplianceStatusEnum } from '@/types/assessment';
import { generateRecommendations } from './recommendations';

/**
 * Control criticality weights
 */
const CRITICALITY_WEIGHTS: Record<string, number> = {
  critical: 3,
  high: 2,
  medium: 1.5,
  low: 1,
};

/**
 * Compliance status score multipliers
 * Applied per control: status_score * criticality_weight
 */
const COMPLIANCE_STATUS_SCORES: Record<string, number> = {
  [ComplianceStatusEnum.COMPLIANT]: 0,
  [ComplianceStatusEnum.PARTIAL]: 0.5,
  [ComplianceStatusEnum.NON_COMPLIANT]: 1,
  [ComplianceStatusEnum.NOT_ASSESSED]: 0.7,
};

/**
 * Map control types to criticality levels
 */
function getControlCriticality(controlType: string): string {
  switch (controlType) {
    case 'technical':
      return 'critical';
    case 'operational':
      return 'high';
    case 'management':
      return 'medium';
    default:
      return 'medium';
  }
}

/**
 * Normalize compliance status string to enum
 */
function normalizeComplianceStatus(status: string): ComplianceStatus {
  const normalized = status.toLowerCase().replace(/-/g, '_');
  if (Object.values(ComplianceStatusEnum).includes(normalized as ComplianceStatus)) {
    return normalized as ComplianceStatus;
  }
  return ComplianceStatusEnum.NOT_ASSESSED;
}

/**
 * Compute GRC Risk Score
 * Main function that orchestrates the entire scoring process
 */
export function computeGRCScore(
  assessmentResponses: Map<string, AssessmentResponseInput>,
  controls: Control[]
): AssessmentResult {
  if (!controls || controls.length === 0) {
    return createEmptyAssessmentResult();
  }

  // Validate and normalize assessment data
  const normalizedResponses = normalizeResponses(assessmentResponses);

  // Group controls by category
  const controlsByCategory = groupControlsByCategory(controls);

  // Calculate category-level scores
  const categoryScores = calculateCategoryScores(
    controlsByCategory,
    normalizedResponses,
    controls
  );

  // Calculate overall score
  const overallScore = calculateOverallScore(categoryScores);

  // Determine risk level
  const riskLevel = determineRiskLevel(overallScore);

  // Extract key findings (top 5 non-compliant controls)
  const keyFindings = extractKeyFindings(
    normalizedResponses,
    controls,
    controlsByCategory
  );

  // Generate recommendations
  const recommendations = generateRecommendations(keyFindings);

  // Calculate confidence based on assessment completeness
  const confidence = calculateConfidence(normalizedResponses, controls);

  // Calculate completion metrics
  const totalControlsAssessed = normalizedResponses.size;
  const totalControls = controls.length;
  const completionPercentage =
    totalControls > 0 ? (totalControlsAssessed / totalControls) * 100 : 0;

  return {
    assessmentId: '', // Will be set by caller
    overallScore: Math.round(overallScore),
    riskLevel,
    categoryScores,
    keyFindings,
    recommendations,
    confidence: Math.round(confidence * 100) / 100,
    totalControlsAssessed,
    totalControls,
    completionPercentage: Math.round(completionPercentage),
    computedAt: new Date(),
  };
}

/**
 * Create empty assessment result for edge case
 */
function createEmptyAssessmentResult(): AssessmentResult {
  return {
    assessmentId: '',
    overallScore: 0,
    riskLevel: 'low',
    categoryScores: [],
    keyFindings: [],
    recommendations: [],
    confidence: 0,
    totalControlsAssessed: 0,
    totalControls: 0,
    completionPercentage: 0,
    computedAt: new Date(),
  };
}

/**
 * Normalize assessment responses
 */
function normalizeResponses(
  responses: Map<string, AssessmentResponseInput>
): Map<string, AssessmentResponseInput> {
  const normalized = new Map<string, AssessmentResponseInput>();

  for (const [controlId, response] of responses.entries()) {
    normalized.set(controlId, {
      ...response,
      status: normalizeComplianceStatus(response.status as string),
    });
  }

  return normalized;
}

/**
 * Group controls by category
 */
function groupControlsByCategory(controls: Control[]): Map<string, Control[]> {
  const grouped = new Map<string, Control[]>();

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
 * Calculate category-level scores with weighted aggregation
 */
function calculateCategoryScores(
  controlsByCategory: Map<string, Control[]>,
  responses: Map<string, AssessmentResponseInput>,
  allControls: Control[]
): CategoryScore[] {
  const categoryScores: CategoryScore[] = [];

  for (const [category, controls] of controlsByCategory.entries()) {
    let totalWeightedScore = 0;
    let totalMaxWeight = 0;
    let compliantCount = 0;
    let partialCount = 0;
    let nonCompliantCount = 0;
    let notAssessedCount = 0;

    for (const control of controls) {
      const criticality = getControlCriticality(control.controlType);
      const weight = CRITICALITY_WEIGHTS[criticality];

      const response = responses.get(control.id);
      const status = response?.status || ComplianceStatusEnum.NOT_ASSESSED;
      const statusScore = COMPLIANCE_STATUS_SCORES[status];

      // Weighted score = compliance_status * criticality_weight
      totalWeightedScore += statusScore * weight;
      totalMaxWeight += weight;

      // Track compliance distribution
      if (status === ComplianceStatusEnum.COMPLIANT) compliantCount++;
      else if (status === ComplianceStatusEnum.PARTIAL) partialCount++;
      else if (status === ComplianceStatusEnum.NON_COMPLIANT) nonCompliantCount++;
      else notAssessedCount++;
    }

    // Normalize to 0-100 scale (0 = compliant, 100 = non-compliant)
    const categoryScore =
      totalMaxWeight > 0 ? (totalWeightedScore / totalMaxWeight) * 100 : 0;

    const compliancePercentage =
      controls.length > 0 ? (compliantCount / controls.length) * 100 : 0;

    categoryScores.push({
      category,
      score: Math.round(categoryScore),
      weight: controls.length / allControls.length,
      controlCount: controls.length,
      compliantCount,
      partialCount,
      nonCompliantCount,
      notAssessedCount,
      compliancePercentage: Math.round(compliancePercentage),
    });
  }

  return categoryScores.sort((a, b) => a.category.localeCompare(b.category));
}

/**
 * Calculate overall risk score from category scores
 * Uses weighted average where weight = proportion of controls in category
 */
function calculateOverallScore(categoryScores: CategoryScore[]): number {
  if (categoryScores.length === 0) {
    return 0;
  }

  let totalScore = 0;
  let totalWeight = 0;

  for (const category of categoryScores) {
    const weight = category.weight || 1 / categoryScores.length;
    totalScore += category.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
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
 * Extract top 5 key findings from non-compliant controls
 */
function extractKeyFindings(
  responses: Map<string, AssessmentResponseInput>,
  controls: Control[],
  controlsByCategory: Map<string, Control[]>
): Finding[] {
  const findings: Finding[] = [];
  const controlMap = new Map(controls.map((c) => [c.id, c]));

  for (const [controlId, response] of responses.entries()) {
    const control = controlMap.get(controlId);
    if (!control) continue;

    const status = response.status as ComplianceStatus;

    // Only include non-compliant and not-assessed findings
    if (
      status === ComplianceStatusEnum.NON_COMPLIANT ||
      status === ComplianceStatusEnum.NOT_ASSESSED
    ) {
      const criticality = getControlCriticality(control.controlType);
      const impact = getImpactDescription(criticality, status);

      findings.push({
        controlId: control.id,
        controlTitle: control.title,
        category: control.category,
        criticality: criticality as 'critical' | 'high' | 'medium' | 'low',
        status,
        impact,
        priority: getPriorityScore(criticality, status),
      });
    }
  }

  // Sort by priority (higher first) and return top 5
  return findings
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}

/**
 * Get impact description based on criticality and status
 */
function getImpactDescription(
  criticality: string,
  status: ComplianceStatus
): string {
  if (criticality === 'critical') {
    return 'Critical control gap - immediate remediation required';
  }
  if (criticality === 'high') {
    return 'High-risk control gap - significant security impact';
  }
  if (criticality === 'medium') {
    return 'Medium-risk control gap - moderate compliance risk';
  }
  return 'Low-risk control gap - minor compliance issue';
}

/**
 * Calculate priority score for sorting findings
 * Higher score = higher priority
 */
function getPriorityScore(
  criticality: string,
  status: ComplianceStatus
): number {
  const criticalityScore: Record<string, number> = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
  };

  const statusBonus: Record<ComplianceStatus, number> = {
    [ComplianceStatusEnum.NON_COMPLIANT]: 10,
    [ComplianceStatusEnum.PARTIAL]: 5,
    [ComplianceStatusEnum.NOT_ASSESSED]: 15, // Not assessed is actually high priority
    [ComplianceStatusEnum.COMPLIANT]: 0,
  };

  return (criticalityScore[criticality] || 0) + (statusBonus[status] || 0);
}

/**
 * Calculate assessment confidence based on completeness
 * Factors: percentage of controls assessed, assessment data quality
 */
function calculateConfidence(
  responses: Map<string, AssessmentResponseInput>,
  controls: Control[]
): number {
  if (controls.length === 0) {
    return 0;
  }

  // Base confidence on assessment completeness
  const completionRatio = Math.min(responses.size / controls.length, 1);

  // Quality adjustment: penalize if many are not_assessed
  let notAssessedCount = 0;
  for (const response of responses.values()) {
    if (response.status === ComplianceStatusEnum.NOT_ASSESSED) {
      notAssessedCount++;
    }
  }

  const notAssessedRatio =
    responses.size > 0 ? notAssessedCount / responses.size : 0;
  const qualityAdjustment = 1 - notAssessedRatio * 0.3; // Up to 30% penalty

  return completionRatio * qualityAdjustment;
}

/**
 * Get risk level color for UI display
 */
export function getRiskLevelColor(
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
): string {
  switch (riskLevel) {
    case 'low':
      return '#10b981'; // Green
    case 'medium':
      return '#f59e0b'; // Amber
    case 'high':
      return '#ef4444'; // Red
    case 'critical':
      return '#7f1d1d'; // Dark Red
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Validate assessment responses against controls
 */
export function validateAssessmentResponses(
  responses: Map<string, AssessmentResponseInput>,
  controls: Control[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validControlIds = new Set(controls.map((c) => c.id));

  for (const [controlId] of responses.entries()) {
    if (!validControlIds.has(controlId)) {
      errors.push(`Invalid control ID: ${controlId}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
