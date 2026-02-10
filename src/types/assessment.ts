/**
 * Assessment and Risk Scoring Types
 * Defines data structures for GRC assessments and risk score computations
 */

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  PARTIAL = 'partial',
  NON_COMPLIANT = 'non_compliant',
  NOT_ASSESSED = 'not_assessed',
}

export interface AssessmentResponseInput {
  controlId: string;
  status: ComplianceStatus | string;
  notes?: string;
  evidence?: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  weight: number;
  controlCount: number;
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  notAssessedCount: number;
  compliancePercentage: number;
}

export interface Finding {
  controlId: string;
  controlTitle: string;
  category: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  status: ComplianceStatus;
  impact: string;
  priority: number;
}

export interface Recommendation {
  findingId: string;
  controlId: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  estimatedEffort: 'low' | 'medium' | 'high';
  estimatedDays: number;
  actionItems: string[];
}

export interface AssessmentResult {
  assessmentId: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categoryScores: CategoryScore[];
  keyFindings: Finding[];
  recommendations: Recommendation[];
  confidence: number;
  totalControlsAssessed: number;
  totalControls: number;
  completionPercentage: number;
  computedAt: Date;
}

export interface AssessmentResultWithMetrics extends AssessmentResult {
  metrics: {
    averageScore: number;
    highestRiskCategory: string;
    lowestRiskCategory: string;
    criticalFindingsCount: number;
    highFindingsCount: number;
  };
}
