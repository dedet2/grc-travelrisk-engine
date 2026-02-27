/**
 * Governance Audit Agent (D-04)
 * Audits governance maturity, policy effectiveness, control implementation, and compliance gaps
 * Provides comprehensive governance scoring and board-ready reporting
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

// ==================== Policy Audit Interfaces ====================

export interface Policy {
  policyId: string;
  name: string;
  category: 'security' | 'compliance' | 'operational' | 'risk_management' | 'data_protection';
  version: string;
  createdDate: Date;
  lastReviewedDate: Date;
  nextReviewDueDate: Date;
  isUpToDate: boolean;
  approvalStatus: 'draft' | 'approved' | 'deprecated';
  ownerName: string;
  ownerEmail: string;
  description: string;
  complianceFrameworks: string[];
}

export interface PolicyAuditResult {
  policyId: string;
  policyName: string;
  exists: boolean;
  isUpToDate: boolean;
  isApproved: boolean;
  lastReviewAge: number; // days
  score: number; // 0-100
  issues: string[];
}

export interface PolicyEffectivenessAudit {
  totalPolicies: number;
  policiesReviewed: number;
  policiesUpToDate: number;
  policiesApproved: number;
  averageReviewAge: number; // days
  overallScore: number; // 0-100
  results: PolicyAuditResult[];
}

// ==================== Control Audit Interfaces ====================

export interface Control {
  controlId: string;
  controlName: string;
  framework: string;
  category: string;
  description: string;
  implementationStatus: 'not-implemented' | 'in-progress' | 'implemented' | 'optimized';
  lastTestDate?: Date;
  testResult?: 'pass' | 'fail' | 'inconclusive';
  lastRemediationDate?: Date;
  remediationInProgress: boolean;
  remediationDueDate?: Date;
  testCadence: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  ownerName: string;
  ownerEmail: string;
}

export interface ControlTestResult {
  testId: string;
  controlId: string;
  testDate: Date;
  result: 'pass' | 'fail' | 'inconclusive';
  evidence: string;
  tester: string;
  notes?: string;
}

export interface ControlAuditResult {
  controlId: string;
  controlName: string;
  framework: string;
  implementationStatus: string;
  daysSinceLastTest: number;
  lastTestResult?: string;
  remediationStatus: string;
  score: number; // 0-100
  issues: string[];
}

export interface ControlEffectivenessAudit {
  totalControls: number;
  implementedControls: number;
  optimizedControls: number;
  controlsNeedingRemediation: number;
  controlsOverdueForTesting: number;
  averageDaysSinceLastTest: number;
  overallScore: number; // 0-100
  results: ControlAuditResult[];
}

// ==================== Risk Assessment Audit Interfaces ====================

export interface RiskItem {
  riskId: string;
  riskName: string;
  riskCategory: 'operational' | 'compliance' | 'strategic' | 'technical' | 'reputational';
  inherentRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  residualRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  treatmentPlan: string;
  treatmentStatus: 'not-started' | 'in-progress' | 'completed';
  relatedControls: string[];
  lastAssessmentDate: Date;
  ownerName: string;
}

export interface RiskAssessmentAuditResult {
  riskId: string;
  riskName: string;
  registerComplete: boolean;
  treatmentPlanExists: boolean;
  treatmentPlanOnTrack: boolean;
  residualRiskAlignment: boolean;
  daysSinceLastAssessment: number;
  score: number; // 0-100
  issues: string[];
}

export interface RiskAssessmentAudit {
  totalRisks: number;
  risksWithTreatmentPlans: number;
  risksOnTrack: number;
  risksAlignedWithAppetite: number;
  lastComprehensiveReviewDate?: Date;
  daysSinceLastComprehensiveReview: number;
  overallScore: number; // 0-100
  results: RiskAssessmentAuditResult[];
}

// ==================== Compliance Gap Analysis Interfaces ====================

export interface ComplianceFrameworkRequirement {
  requirementId: string;
  framework: string;
  controlId: string;
  requirementName: string;
  mappedInternalControls: string[];
  isImplemented: boolean;
  gapStatus: 'no-gap' | 'gap-exists' | 'gap-addressed' | 'no-evidence';
  remediationPriority: 'low' | 'medium' | 'high' | 'critical';
  targetDate?: Date;
  daysOverdue?: number;
}

export interface ComplianceGapAnalysisResult {
  framework: string;
  totalRequirements: number;
  implementedRequirements: number;
  gapCount: number;
  criticalGaps: number;
  highGaps: number;
  remediationTrackingStatus: string;
  overallCompliancePercentage: number;
  gaps: ComplianceFrameworkRequirement[];
}

// ==================== Governance Maturity Interfaces ====================

export type GovernanceDimension =
  | 'leadership_culture'
  | 'strategy_planning'
  | 'risk_management'
  | 'compliance'
  | 'operations'
  | 'monitoring_improvement';

export interface DimensionScore {
  dimension: GovernanceDimension;
  dimensionName: string;
  score: number; // 1-5
  level: 'initial' | 'developing' | 'managing' | 'optimizing' | 'leading';
  keyFindings: string[];
  recommendations: string[];
}

export interface GovernanceMaturityScore {
  overallScore: number; // 1-5
  overallLevel: 'initial' | 'developing' | 'managing' | 'optimizing' | 'leading';
  dimensionScores: DimensionScore[];
  strengths: string[];
  improvements: string[];
  nextPriorities: string[];
}

// ==================== Board Reporting Interfaces ====================

export interface BoardReadyReport {
  reportId: string;
  reportDate: Date;
  executiveSummary: string;
  governanceMaturityScore: GovernanceMaturityScore;
  keyMetrics: {
    policyEffectivenessScore: number;
    controlEffectivenessScore: number;
    riskManagementScore: number;
    complianceScore: number;
  };
  riskIndicators: {
    criticalRisks: number;
    highRisks: number;
    overallRiskTrend: 'improving' | 'stable' | 'deteriorating';
  };
  complianceStatus: {
    frameworks: string[];
    overallCompliancePercentage: number;
    criticalGaps: number;
    remediationOnTrack: boolean;
  };
  improvementRecommendations: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    area: string;
    recommendation: string;
    estimatedImpact: string;
  }[];
  nextReviewDate: Date;
}

// ==================== Raw Data Interfaces ====================

export interface GovernanceAuditRawData {
  policies: Policy[];
  policyAuditResults: PolicyAuditResult[];
  controls: Control[];
  controlTestResults: ControlTestResult[];
  controlAuditResults: ControlAuditResult[];
  risks: RiskItem[];
  riskAssessmentResults: RiskAssessmentAuditResult[];
  complianceGaps: ComplianceGapAnalysisResult[];
  timestamp: Date;
}

// ==================== Processed Report Interfaces ====================

export interface GovernanceAuditReport {
  reportId: string;
  timestamp: Date;
  policyEffectiveness: PolicyEffectivenessAudit;
  controlEffectiveness: ControlEffectivenessAudit;
  riskAssessment: RiskAssessmentAudit;
  complianceAnalysis: ComplianceGapAnalysisResult[];
  governanceMaturity: GovernanceMaturityScore;
  boardReport: BoardReadyReport;
}

/**
 * Governance Audit Agent
 * Comprehensive governance auditing with policy, control, risk, and compliance assessment
 */
export class GovernanceAuditAgent extends BaseAgent<GovernanceAuditRawData, GovernanceAuditReport> {
  private frameworks = ['SOC 2', 'NIST CSF', 'ISO 27001', 'GDPR', 'HIPAA'];
  private policyCategories: Policy['category'][] = [
    'security',
    'compliance',
    'operational',
    'risk_management',
    'data_protection',
  ];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Governance Audit (D-04)',
      description:
        'Comprehensive governance auditing including policy effectiveness, control implementation, risk assessment, and compliance gaps',
      maxRetries: 2,
      timeoutMs: 45000,
      enabled: true,
      ...config,
    });
  }

  /**
   * Collect governance audit data
   */
  async collectData(): Promise<GovernanceAuditRawData> {
    const policies = this.generatePolicies();
    const policyAuditResults = this.auditPolicies(policies);

    const controls = this.generateControls();
    const controlTestResults = this.generateControlTestResults(controls);
    const controlAuditResults = this.auditControls(controls, controlTestResults);

    const risks = this.generateRisks();
    const riskAssessmentResults = this.auditRisks(risks);

    const complianceGaps = this.analyzeComplianceGaps(controls, controlAuditResults);

    return {
      policies,
      policyAuditResults,
      controls,
      controlTestResults,
      controlAuditResults,
      risks,
      riskAssessmentResults,
      complianceGaps,
      timestamp: new Date(),
    };
  }

  /**
   * Process governance data to create comprehensive audit report
   */
  async processData(rawData: GovernanceAuditRawData): Promise<GovernanceAuditReport> {
    // Calculate policy effectiveness
    const policyEffectiveness = this.calculatePolicyEffectiveness(rawData.policyAuditResults);

    // Calculate control effectiveness
    const controlEffectiveness = this.calculateControlEffectiveness(rawData.controlAuditResults);

    // Calculate risk assessment audit
    const riskAssessment = this.calculateRiskAssessment(rawData.riskAssessmentResults);

    // Compile compliance analysis
    const complianceAnalysis = rawData.complianceGaps;

    // Calculate governance maturity
    const governanceMaturity = this.calculateGovernanceMaturity(
      policyEffectiveness,
      controlEffectiveness,
      riskAssessment,
      complianceAnalysis
    );

    // Generate board-ready report
    const boardReport = this.generateBoardReport(
      policyEffectiveness,
      controlEffectiveness,
      riskAssessment,
      complianceAnalysis,
      governanceMaturity
    );

    const reportId = `governance-report-${Date.now()}`;

    return {
      reportId,
      timestamp: new Date(),
      policyEffectiveness,
      controlEffectiveness,
      riskAssessment,
      complianceAnalysis,
      governanceMaturity,
      boardReport,
    };
  }

  /**
   * Store governance audit results
   */
  async updateDashboard(processedData: GovernanceAuditReport): Promise<void> {
    supabaseStore.storeGovernanceAuditReport(processedData);
    await new Promise((resolve) => setTimeout(resolve, 50));
    console.log('[GovernanceAuditAgent] Dashboard updated with governance audit report');
  }

  // ==================== Private Helper Methods ====================

  private generatePolicies(): Policy[] {
    const policies: Policy[] = [];
    const now = new Date();

    for (const category of this.policyCategories) {
      for (let i = 0; i < 3; i++) {
        const createdDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        const lastReviewedDate = new Date(
          createdDate.getTime() + Math.random() * (now.getTime() - createdDate.getTime())
        );
        const reviewAgeMs = now.getTime() - lastReviewedDate.getTime();
        const reviewAgeMonths = Math.floor(reviewAgeMs / (30 * 24 * 60 * 60 * 1000));

        policies.push({
          policyId: `policy-${category}-${i}`,
          name: `${category.replace(/_/g, ' ')} Policy ${i + 1}`,
          category,
          version: `${Math.floor(Math.random() * 5) + 1}.0`,
          createdDate,
          lastReviewedDate,
          nextReviewDueDate: new Date(lastReviewedDate.getTime() + 365 * 24 * 60 * 60 * 1000),
          isUpToDate: reviewAgeMonths <= 12,
          approvalStatus: ['draft', 'approved', 'deprecated'][Math.floor(Math.random() * 3)] as any,
          ownerName: `Policy Owner ${i}`,
          ownerEmail: `owner${i}@company.com`,
          description: `Policy document for ${category.replace(/_/g, ' ')}`,
          complianceFrameworks: this.selectRandomFrameworks(),
        });
      }
    }

    return policies;
  }

  private auditPolicies(policies: Policy[]): PolicyAuditResult[] {
    const now = new Date();
    return policies.map((policy) => {
      const reviewAgeMs = now.getTime() - policy.lastReviewedDate.getTime();
      const reviewAgeDays = Math.floor(reviewAgeMs / (24 * 60 * 60 * 1000));
      const isUpToDate = policy.isUpToDate;
      const isApproved = policy.approvalStatus === 'approved';

      const issues: string[] = [];
      if (!isUpToDate) issues.push('Policy review is overdue');
      if (!isApproved) issues.push('Policy has not been formally approved');
      if (reviewAgeDays > 365) issues.push(`Policy review is ${Math.floor(reviewAgeDays / 365)} year(s) overdue`);

      const baseScore = 100;
      let score = baseScore;
      if (!isUpToDate) score -= 25;
      if (!isApproved) score -= 20;
      if (reviewAgeDays > 180) score -= 10;

      return {
        policyId: policy.policyId,
        policyName: policy.name,
        exists: true,
        isUpToDate,
        isApproved,
        lastReviewAge: reviewAgeDays,
        score: Math.max(0, score),
        issues,
      };
    });
  }

  private generateControls(): Control[] {
    const controls: Control[] = [];
    let controlIndex = 0;

    for (const framework of this.frameworks) {
      const controlCount = 8 + Math.floor(Math.random() * 5);
      for (let i = 0; i < controlCount; i++) {
        const now = new Date();
        const lastTestDate = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);

        controls.push({
          controlId: `ctrl-${framework.replace(/\s/g, '-').toLowerCase()}-${i}`,
          controlName: `${framework} Control ${i + 1}`,
          framework,
          category: ['Access Control', 'Encryption', 'Monitoring', 'Incident Response', 'Data Protection'][
            Math.floor(Math.random() * 5)
          ],
          description: `Control to ensure ${framework} compliance`,
          implementationStatus: [
            'not-implemented',
            'in-progress',
            'implemented',
            'optimized',
          ][Math.floor(Math.random() * 4)] as any,
          lastTestDate,
          testResult: ['pass', 'fail', 'inconclusive'][Math.floor(Math.random() * 3)] as any,
          remediationInProgress: Math.random() > 0.7,
          remediationDueDate: new Date(now.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000),
          testCadence: ['monthly', 'quarterly', 'semi-annual', 'annual'][Math.floor(Math.random() * 4)] as any,
          ownerName: `Control Owner ${controlIndex}`,
          ownerEmail: `control-owner${controlIndex}@company.com`,
        });
        controlIndex++;
      }
    }

    return controls;
  }

  private generateControlTestResults(controls: Control[]): ControlTestResult[] {
    const results: ControlTestResult[] = [];

    for (const control of controls.slice(0, Math.min(30, controls.length))) {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const testDate = new Date(now.getTime() - (i + 1) * 60 * 24 * 60 * 60 * 1000);
        results.push({
          testId: `test-${control.controlId}-${i}`,
          controlId: control.controlId,
          testDate,
          result: Math.random() > 0.15 ? 'pass' : 'fail',
          evidence: `Test performed and documented`,
          tester: `Tester ${Math.floor(Math.random() * 5)}`,
          notes: Math.random() > 0.6 ? 'No issues found' : 'Minor findings to address',
        });
      }
    }

    return results;
  }

  private auditControls(controls: Control[], testResults: ControlTestResult[]): ControlAuditResult[] {
    const now = new Date();
    const testsByControl = new Map<string, ControlTestResult[]>();

    testResults.forEach((test) => {
      if (!testsByControl.has(test.controlId)) {
        testsByControl.set(test.controlId, []);
      }
      testsByControl.get(test.controlId)!.push(test);
    });

    return controls.map((control) => {
      const tests = testsByControl.get(control.controlId) || [];
      const lastTest = tests.length > 0 ? tests[0] : null;
      const daysSinceLastTest = lastTest
        ? Math.floor((now.getTime() - lastTest.testDate.getTime()) / (24 * 60 * 60 * 1000))
        : 999;

      const issues: string[] = [];
      let score = 100;

      // Check implementation status
      if (control.implementationStatus === 'not-implemented') {
        issues.push('Control is not yet implemented');
        score -= 50;
      } else if (control.implementationStatus === 'in-progress') {
        issues.push('Control implementation is in progress');
        score -= 25;
      }

      // Check testing cadence
      const cadenceDays = { monthly: 30, quarterly: 90, 'semi-annual': 180, annual: 365 };
      const cadenceThreshold = cadenceDays[control.testCadence];
      if (daysSinceLastTest > cadenceThreshold) {
        issues.push(`Control is overdue for testing by ${daysSinceLastTest - cadenceThreshold} days`);
        score -= 15;
      }

      // Check test results
      if (lastTest && lastTest.result === 'fail') {
        issues.push('Last control test failed');
        score -= 20;
      }

      // Check remediation status
      if (control.remediationInProgress && control.remediationDueDate) {
        const daysUntilDue = Math.floor(
          (control.remediationDueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (daysUntilDue < 0) {
          issues.push('Remediation is overdue');
          score -= 10;
        }
      }

      return {
        controlId: control.controlId,
        controlName: control.controlName,
        framework: control.framework,
        implementationStatus: control.implementationStatus,
        daysSinceLastTest,
        lastTestResult: lastTest?.result,
        remediationStatus: control.remediationInProgress ? 'in-progress' : 'not-needed',
        score: Math.max(0, score),
        issues,
      };
    });
  }

  private generateRisks(): RiskItem[] {
    const risks: RiskItem[] = [];
    const now = new Date();

    const riskCategories: RiskItem['riskCategory'][] = [
      'operational',
      'compliance',
      'strategic',
      'technical',
      'reputational',
    ];

    for (const category of riskCategories) {
      for (let i = 0; i < 4; i++) {
        const lastAssessmentDate = new Date(
          now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000
        );

        risks.push({
          riskId: `risk-${category}-${i}`,
          riskName: `${category.charAt(0).toUpperCase() + category.slice(1)} Risk ${i + 1}`,
          riskCategory: category,
          inherentRiskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          residualRiskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          treatmentPlan: `Treatment plan for ${category} risk`,
          treatmentStatus: ['not-started', 'in-progress', 'completed'][
            Math.floor(Math.random() * 3)
          ] as any,
          relatedControls: [
            `ctrl-related-${i}`,
            `ctrl-related-${i + 1}`,
          ],
          lastAssessmentDate,
          ownerName: `Risk Owner ${i}`,
        });
      }
    }

    return risks;
  }

  private auditRisks(risks: RiskItem[]): RiskAssessmentAuditResult[] {
    const now = new Date();

    return risks.map((risk) => {
      const assessmentAgeMs = now.getTime() - risk.lastAssessmentDate.getTime();
      const assessmentAgeDays = Math.floor(assessmentAgeMs / (24 * 60 * 60 * 1000));

      const issues: string[] = [];
      let score = 100;

      // Check if risk register is complete
      const registerComplete = risk.riskName.length > 0 && risk.ownerName.length > 0;

      // Check treatment plan
      const treatmentPlanExists = risk.treatmentPlan.length > 0;
      if (!treatmentPlanExists) {
        issues.push('No treatment plan documented');
        score -= 25;
      }

      // Check if treatment plan is on track
      const treatmentPlanOnTrack = risk.treatmentStatus !== 'not-started' || assessmentAgeDays < 180;
      if (!treatmentPlanOnTrack) {
        issues.push('Treatment plan is stalled or not started');
        score -= 20;
      }

      // Check if residual risk aligns with appetite (assuming moderate risk appetite)
      const residualRiskAlignment =
        risk.residualRiskLevel !== 'critical' && risk.residualRiskLevel !== 'high';
      if (!residualRiskAlignment) {
        issues.push('Residual risk level exceeds appetite');
        score -= 20;
      }

      // Check assessment recency
      if (assessmentAgeDays > 180) {
        issues.push(`Risk assessment is ${Math.floor(assessmentAgeDays / 30)} months old`);
        score -= 15;
      }

      return {
        riskId: risk.riskId,
        riskName: risk.riskName,
        registerComplete,
        treatmentPlanExists,
        treatmentPlanOnTrack,
        residualRiskAlignment,
        daysSinceLastAssessment: assessmentAgeDays,
        score: Math.max(0, score),
        issues,
      };
    });
  }

  private analyzeComplianceGaps(
    controls: Control[],
    controlAuditResults: ControlAuditResult[]
  ): ComplianceGapAnalysisResult[] {
    const gapsByFramework = new Map<string, ComplianceGapAnalysisResult>();

    // Group controls by framework
    const controlsByFramework = new Map<string, ControlAuditResult[]>();
    controlAuditResults.forEach((result) => {
      if (!controlsByFramework.has(result.framework)) {
        controlsByFramework.set(result.framework, []);
      }
      controlsByFramework.get(result.framework)!.push(result);
    });

    // Analyze gaps for each framework
    for (const [framework, frameworkControls] of controlsByFramework) {
      const totalRequirements = frameworkControls.length;
      const implementedRequirements = frameworkControls.filter(
        (c) => c.implementationStatus !== 'not-implemented'
      ).length;
      const gaps = frameworkControls.filter((c) => c.score < 80);
      const criticalGaps = gaps.filter((c) => c.issues.some((i) => i.includes('not implemented')));
      const highGaps = gaps.filter(
        (c) => c.issues.some((i) => i.includes('overdue') || i.includes('failed'))
      );

      const requirementDetails: ComplianceFrameworkRequirement[] = frameworkControls.map(
        (control, idx) => ({
          requirementId: `req-${framework.replace(/\s/g, '-')}-${idx}`,
          framework,
          controlId: control.controlId,
          requirementName: control.controlName,
          mappedInternalControls: [control.controlId],
          isImplemented: control.implementationStatus !== 'not-implemented',
          gapStatus:
            control.score >= 90
              ? 'no-gap'
              : control.score >= 70
                ? 'gap-addressed'
                : 'gap-exists',
          remediationPriority:
            control.score < 50
              ? 'critical'
              : control.score < 70
                ? 'high'
                : 'medium',
          daysOverdue: control.issues.some((i) => i.includes('overdue'))
            ? 15 + Math.floor(Math.random() * 45)
            : undefined,
        })
      );

      gapsByFramework.set(framework, {
        framework,
        totalRequirements,
        implementedRequirements,
        gapCount: gaps.length,
        criticalGaps: criticalGaps.length,
        highGaps: highGaps.length,
        remediationTrackingStatus:
          gaps.length === 0
            ? 'all-compliant'
            : highGaps.length === 0
              ? 'gaps-being-addressed'
              : 'critical-gaps-exist',
        overallCompliancePercentage: Math.round((implementedRequirements / totalRequirements) * 100),
        gaps: requirementDetails,
      });
    }

    return Array.from(gapsByFramework.values());
  }

  private calculatePolicyEffectiveness(results: PolicyAuditResult[]): PolicyEffectivenessAudit {
    const totalPolicies = results.length;
    const policiesReviewed = results.filter((r) => r.exists).length;
    const policiesUpToDate = results.filter((r) => r.isUpToDate).length;
    const policiesApproved = results.filter((r) => r.isApproved).length;
    const averageReviewAge = Math.round(
      results.reduce((sum, r) => sum + r.lastReviewAge, 0) / Math.max(1, totalPolicies)
    );
    const overallScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / Math.max(1, totalPolicies)
    );

    return {
      totalPolicies,
      policiesReviewed,
      policiesUpToDate,
      policiesApproved,
      averageReviewAge,
      overallScore,
      results,
    };
  }

  private calculateControlEffectiveness(results: ControlAuditResult[]): ControlEffectivenessAudit {
    const totalControls = results.length;
    const implementedControls = results.filter(
      (r) => r.implementationStatus === 'implemented' || r.implementationStatus === 'optimized'
    ).length;
    const optimizedControls = results.filter((r) => r.implementationStatus === 'optimized').length;
    const controlsNeedingRemediation = results.filter((r) => r.issues.length > 0).length;
    const controlsOverdueForTesting = results.filter((r) =>
      r.issues.some((i) => i.includes('overdue'))
    ).length;
    const averageDaysSinceLastTest = Math.round(
      results.reduce((sum, r) => sum + r.daysSinceLastTest, 0) / Math.max(1, totalControls)
    );
    const overallScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / Math.max(1, totalControls)
    );

    return {
      totalControls,
      implementedControls,
      optimizedControls,
      controlsNeedingRemediation,
      controlsOverdueForTesting,
      averageDaysSinceLastTest,
      overallScore,
      results,
    };
  }

  private calculateRiskAssessment(results: RiskAssessmentAuditResult[]): RiskAssessmentAudit {
    const totalRisks = results.length;
    const risksWithTreatmentPlans = results.filter((r) => r.treatmentPlanExists).length;
    const risksOnTrack = results.filter((r) => r.treatmentPlanOnTrack).length;
    const risksAlignedWithAppetite = results.filter((r) => r.residualRiskAlignment).length;

    const assessmentDates = results
      .map((r) => new Date(Date.now() - r.daysSinceLastAssessment * 24 * 60 * 60 * 1000))
      .sort((a, b) => a.getTime() - b.getTime());
    const lastComprehensiveReviewDate = assessmentDates.length > 0 ? assessmentDates[0] : undefined;
    const daysSinceLastComprehensiveReview = lastComprehensiveReviewDate
      ? Math.floor((Date.now() - lastComprehensiveReviewDate.getTime()) / (24 * 60 * 60 * 1000))
      : 999;

    const overallScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / Math.max(1, totalRisks)
    );

    return {
      totalRisks,
      risksWithTreatmentPlans,
      risksOnTrack,
      risksAlignedWithAppetite,
      lastComprehensiveReviewDate,
      daysSinceLastComprehensiveReview,
      overallScore,
      results,
    };
  }

  private calculateGovernanceMaturity(
    policyEffectiveness: PolicyEffectivenessAudit,
    controlEffectiveness: ControlEffectivenessAudit,
    riskAssessment: RiskAssessmentAudit,
    complianceAnalysis: ComplianceGapAnalysisResult[]
  ): GovernanceMaturityScore {
    // Map 0-100 score to 1-5 scale
    const scoreToLevel = (score: number): 1 | 2 | 3 | 4 | 5 => {
      if (score >= 90) return 5;
      if (score >= 75) return 4;
      if (score >= 60) return 3;
      if (score >= 40) return 2;
      return 1;
    };

    const getLevelName = (score: 1 | 2 | 3 | 4 | 5): 'initial' | 'developing' | 'managing' | 'optimizing' | 'leading' => {
      const levels = ['initial', 'developing', 'managing', 'optimizing', 'leading'];
      return levels[score - 1] as any;
    };

    // Leadership & Culture (based on policy effectiveness)
    const leadershipScore = scoreToLevel(policyEffectiveness.overallScore);

    // Strategy & Planning (based on risk management)
    const strategyScore = scoreToLevel(riskAssessment.overallScore);

    // Risk Management (based on risk assessment)
    const riskMgmtScore = scoreToLevel(riskAssessment.overallScore);

    // Compliance (based on compliance gaps)
    const avgCompliancePercentage =
      complianceAnalysis.length > 0
        ? complianceAnalysis.reduce((sum, c) => sum + c.overallCompliancePercentage, 0) /
          complianceAnalysis.length
        : 0;
    const complianceScore = scoreToLevel(avgCompliancePercentage);

    // Operations (based on control effectiveness)
    const operationsScore = scoreToLevel(controlEffectiveness.overallScore);

    // Monitoring & Improvement (based on testing cadence and assessment recency)
    const monitoringScore = scoreToLevel(
      Math.min(
        100,
        100 - (controlEffectiveness.controlsOverdueForTesting / controlEffectiveness.totalControls) * 50
      )
    );

    const dimensions: DimensionScore[] = [
      {
        dimension: 'leadership_culture',
        dimensionName: 'Leadership & Culture',
        score: leadershipScore,
        level: getLevelName(leadershipScore),
        keyFindings: this.getLeadershipFindings(policyEffectiveness),
        recommendations: this.getLeadershipRecommendations(policyEffectiveness),
      },
      {
        dimension: 'strategy_planning',
        dimensionName: 'Strategy & Planning',
        score: strategyScore,
        level: getLevelName(strategyScore),
        keyFindings: this.getStrategyFindings(riskAssessment),
        recommendations: this.getStrategyRecommendations(riskAssessment),
      },
      {
        dimension: 'risk_management',
        dimensionName: 'Risk Management',
        score: riskMgmtScore,
        level: getLevelName(riskMgmtScore),
        keyFindings: this.getRiskFindings(riskAssessment),
        recommendations: this.getRiskRecommendations(riskAssessment),
      },
      {
        dimension: 'compliance',
        dimensionName: 'Compliance',
        score: complianceScore,
        level: getLevelName(complianceScore),
        keyFindings: this.getComplianceFindings(complianceAnalysis),
        recommendations: this.getComplianceRecommendations(complianceAnalysis),
      },
      {
        dimension: 'operations',
        dimensionName: 'Operations',
        score: operationsScore,
        level: getLevelName(operationsScore),
        keyFindings: this.getOperationsFindings(controlEffectiveness),
        recommendations: this.getOperationsRecommendations(controlEffectiveness),
      },
      {
        dimension: 'monitoring_improvement',
        dimensionName: 'Monitoring & Improvement',
        score: monitoringScore,
        level: getLevelName(monitoringScore),
        keyFindings: this.getMonitoringFindings(controlEffectiveness),
        recommendations: this.getMonitoringRecommendations(controlEffectiveness),
      },
    ];

    const overallScore = Math.round(
      (leadershipScore + strategyScore + riskMgmtScore + complianceScore + operationsScore + monitoringScore) / 6
    );
    const overallLevel = getLevelName(overallScore as 1 | 2 | 3 | 4 | 5);

    const strengths = [
      ...this.getStrengths(dimensions, controlEffectiveness, policyEffectiveness, riskAssessment),
    ];
    const improvements = [
      ...this.getImprovements(dimensions, controlEffectiveness, policyEffectiveness, riskAssessment),
    ];
    const nextPriorities = this.getNextPriorities(
      dimensions,
      controlEffectiveness,
      policyEffectiveness,
      riskAssessment
    );

    return {
      overallScore,
      overallLevel,
      dimensionScores: dimensions,
      strengths,
      improvements,
      nextPriorities,
    };
  }

  private generateBoardReport(
    policyEffectiveness: PolicyEffectivenessAudit,
    controlEffectiveness: ControlEffectivenessAudit,
    riskAssessment: RiskAssessmentAudit,
    complianceAnalysis: ComplianceGapAnalysisResult[],
    governanceMaturity: GovernanceMaturityScore
  ): BoardReadyReport {
    const reportId = `board-report-${Date.now()}`;
    const reportDate = new Date();

    const executiveSummary = this.generateExecutiveSummary(
      governanceMaturity,
      controlEffectiveness,
      complianceAnalysis
    );

    const criticalRisks = riskAssessment.results.filter((r) => r.issues.length > 2).length;
    const highRisks = riskAssessment.results.filter((r) => r.issues.length === 2).length;

    const avgCompliancePercentage =
      complianceAnalysis.length > 0
        ? complianceAnalysis.reduce((sum, c) => sum + c.overallCompliancePercentage, 0) /
          complianceAnalysis.length
        : 0;

    const totalCriticalGaps = complianceAnalysis.reduce((sum, c) => sum + c.criticalGaps, 0);

    const improvementRecommendations = this.generateImprovementRecommendations(
      governanceMaturity,
      controlEffectiveness,
      policyEffectiveness,
      complianceAnalysis
    );

    const nextReviewDate = new Date(reportDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

    return {
      reportId,
      reportDate,
      executiveSummary,
      governanceMaturityScore: governanceMaturity,
      keyMetrics: {
        policyEffectivenessScore: policyEffectiveness.overallScore,
        controlEffectivenessScore: controlEffectiveness.overallScore,
        riskManagementScore: riskAssessment.overallScore,
        complianceScore: Math.round(avgCompliancePercentage),
      },
      riskIndicators: {
        criticalRisks,
        highRisks,
        overallRiskTrend:
          controlEffectiveness.controlsOverdueForTesting > controlEffectiveness.totalControls * 0.2
            ? 'deteriorating'
            : riskAssessment.overallScore > 75
              ? 'improving'
              : 'stable',
      },
      complianceStatus: {
        frameworks: complianceAnalysis.map((c) => c.framework),
        overallCompliancePercentage: Math.round(avgCompliancePercentage),
        criticalGaps: totalCriticalGaps,
        remediationOnTrack: totalCriticalGaps === 0 || complianceAnalysis.every((c) => c.criticalGaps < 2),
      },
      improvementRecommendations,
      nextReviewDate,
    };
  }

  // ==================== Findings & Recommendations Generators ====================

  private getLeadershipFindings(policyEffectiveness: PolicyEffectivenessAudit): string[] {
    const findings: string[] = [];
    if (policyEffectiveness.policiesApproved > policyEffectiveness.totalPolicies * 0.8) {
      findings.push('Strong policy governance with majority of policies formally approved');
    } else {
      findings.push('Policy approval process needs strengthening');
    }
    if (policyEffectiveness.averageReviewAge > 12) {
      findings.push('Policy review cadence is not sufficiently frequent');
    }
    return findings;
  }

  private getLeadershipRecommendations(policyEffectiveness: PolicyEffectivenessAudit): string[] {
    return [
      'Establish annual policy review cycles with executive sponsorship',
      'Implement policy approval workflow with clear governance authority',
    ];
  }

  private getStrategyFindings(riskAssessment: RiskAssessmentAudit): string[] {
    return [
      `${riskAssessment.risksWithTreatmentPlans} of ${riskAssessment.totalRisks} risks have documented treatment plans`,
      riskAssessment.risksOnTrack > riskAssessment.totalRisks * 0.7
        ? 'Risk treatment execution is on track'
        : 'Several risk treatments are delayed or stalled',
    ];
  }

  private getStrategyRecommendations(riskAssessment: RiskAssessmentAudit): string[] {
    return [
      'Develop risk-based strategic planning process aligned with risk appetite',
      'Establish quarterly risk review meetings with executive leadership',
    ];
  }

  private getRiskFindings(riskAssessment: RiskAssessmentAudit): string[] {
    return [
      `${riskAssessment.risksAlignedWithAppetite} of ${riskAssessment.totalRisks} risks aligned with appetite`,
      riskAssessment.daysSinceLastComprehensiveReview > 180
        ? 'Comprehensive risk assessment review is overdue'
        : 'Risk assessment review is current',
    ];
  }

  private getRiskRecommendations(riskAssessment: RiskAssessmentAudit): string[] {
    return [
      'Implement formal risk appetite statement and monitoring dashboard',
      'Establish semi-annual comprehensive risk assessment reviews',
    ];
  }

  private getComplianceFindings(complianceAnalysis: ComplianceGapAnalysisResult[]): string[] {
    const avgCompliance =
      complianceAnalysis.length > 0
        ? complianceAnalysis.reduce((sum, c) => sum + c.overallCompliancePercentage, 0) /
          complianceAnalysis.length
        : 0;

    return [
      `Average framework compliance: ${Math.round(avgCompliance)}%`,
      complianceAnalysis.some((c) => c.criticalGaps > 2)
        ? 'Critical compliance gaps identified across frameworks'
        : 'No critical compliance gaps identified',
    ];
  }

  private getComplianceRecommendations(complianceAnalysis: ComplianceGapAnalysisResult[]): string[] {
    return [
      'Address critical compliance gaps with dedicated remediation projects',
      'Implement compliance tracking dashboard with monthly reviews',
    ];
  }

  private getOperationsFindings(controlEffectiveness: ControlEffectivenessAudit): string[] {
    return [
      `${controlEffectiveness.implementedControls} of ${controlEffectiveness.totalControls} controls implemented`,
      `${controlEffectiveness.controlsOverdueForTesting} controls overdue for testing`,
    ];
  }

  private getOperationsRecommendations(controlEffectiveness: ControlEffectivenessAudit): string[] {
    return [
      'Establish control testing calendar with clear ownership and accountability',
      'Implement control test management platform for tracking and evidence collection',
    ];
  }

  private getMonitoringFindings(controlEffectiveness: ControlEffectivenessAudit): string[] {
    const testingCompliance = Math.round(
      ((controlEffectiveness.totalControls - controlEffectiveness.controlsOverdueForTesting) /
        controlEffectiveness.totalControls) *
        100
    );
    return [
      `${testingCompliance}% of controls tested within schedule`,
      controlEffectiveness.averageDaysSinceLastTest > 120
        ? 'Average testing frequency needs improvement'
        : 'Testing frequency is sufficient',
    ];
  }

  private getMonitoringRecommendations(controlEffectiveness: ControlEffectivenessAudit): string[] {
    return [
      'Implement automated control monitoring and continuous testing where possible',
      'Establish escalation procedures for overdue control tests',
    ];
  }

  private getStrengths(
    dimensions: DimensionScore[],
    controlEffectiveness: ControlEffectivenessAudit,
    policyEffectiveness: PolicyEffectivenessAudit,
    riskAssessment: RiskAssessmentAudit
  ): string[] {
    const strengths: string[] = [];

    const topDimensions = dimensions
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    topDimensions.forEach((d) => {
      strengths.push(`Strong ${d.dimensionName.toLowerCase()} maturity (${d.level})`);
    });

    if (controlEffectiveness.implementedControls > controlEffectiveness.totalControls * 0.9) {
      strengths.push('High control implementation coverage');
    }

    if (policyEffectiveness.policiesUpToDate > policyEffectiveness.totalPolicies * 0.8) {
      strengths.push('Well-maintained and current policy framework');
    }

    return strengths;
  }

  private getImprovements(
    dimensions: DimensionScore[],
    controlEffectiveness: ControlEffectivenessAudit,
    policyEffectiveness: PolicyEffectivenessAudit,
    riskAssessment: RiskAssessmentAudit
  ): string[] {
    const improvements: string[] = [];

    const bottomDimensions = dimensions
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);
    bottomDimensions.forEach((d) => {
      improvements.push(`Improve ${d.dimensionName.toLowerCase()} (current: ${d.level})`);
    });

    if (controlEffectiveness.controlsOverdueForTesting > 0) {
      improvements.push('Catch up on overdue control tests');
    }

    if (riskAssessment.risksWithTreatmentPlans < riskAssessment.totalRisks * 0.9) {
      improvements.push('Document treatment plans for all identified risks');
    }

    return improvements;
  }

  private getNextPriorities(
    dimensions: DimensionScore[],
    controlEffectiveness: ControlEffectivenessAudit,
    policyEffectiveness: PolicyEffectivenessAudit,
    riskAssessment: RiskAssessmentAudit
  ): string[] {
    return [
      'Address highest-priority gaps in lowest-scoring governance dimension',
      'Establish automated control test scheduling and tracking system',
      'Implement quarterly board governance dashboard',
      'Develop multi-year governance maturity improvement roadmap',
    ];
  }

  private generateExecutiveSummary(
    governanceMaturity: GovernanceMaturityScore,
    controlEffectiveness: ControlEffectivenessAudit,
    complianceAnalysis: ComplianceGapAnalysisResult[]
  ): string {
    const avgCompliance =
      complianceAnalysis.length > 0
        ? complianceAnalysis.reduce((sum, c) => sum + c.overallCompliancePercentage, 0) /
          complianceAnalysis.length
        : 0;

    return `
Organization is operating at a ${governanceMaturity.overallLevel} maturity level in governance and risk management.
Overall control effectiveness is at ${controlEffectiveness.overallScore}% with ${controlEffectiveness.implementedControls} of ${controlEffectiveness.totalControls} controls implemented.
Compliance across key frameworks averages ${Math.round(avgCompliance)}%.
${controlEffectiveness.controlsOverdueForTesting === 0 ? 'All controls are current with testing requirements.' : `${controlEffectiveness.controlsOverdueForTesting} controls require immediate remediation.`}
Key focus areas include ${governanceMaturity.nextPriorities[0]} and addressing documented compliance gaps.
    `.trim();
  }

  private generateImprovementRecommendations(
    governanceMaturity: GovernanceMaturityScore,
    controlEffectiveness: ControlEffectivenessAudit,
    policyEffectiveness: PolicyEffectivenessAudit,
    complianceAnalysis: ComplianceGapAnalysisResult[]
  ): BoardReadyReport['improvementRecommendations'] {
    return [
      {
        priority: 'critical',
        area: 'Control Testing',
        recommendation:
          controlEffectiveness.controlsOverdueForTesting > 0
            ? `Remediate ${controlEffectiveness.controlsOverdueForTesting} controls overdue for testing within 30 days`
            : 'Maintain current control testing schedule',
        estimatedImpact: 'Ensure continued control effectiveness and compliance assurance',
      },
      {
        priority: 'high',
        area: 'Governance Maturity',
        recommendation: `Advance ${governanceMaturity.nextPriorities[0]} to improve governance maturity from ${governanceMaturity.overallLevel} to next level`,
        estimatedImpact: 'Strengthen organizational governance and decision-making',
      },
      {
        priority: 'high',
        area: 'Compliance',
        recommendation:
          complianceAnalysis.reduce((sum, c) => sum + c.criticalGaps, 0) > 0
            ? `Address ${complianceAnalysis.reduce((sum, c) => sum + c.criticalGaps, 0)} critical compliance gaps with prioritized remediation plan`
            : 'Maintain compliance monitoring quarterly',
        estimatedImpact: 'Reduce compliance risk and audit findings',
      },
      {
        priority: 'medium',
        area: 'Policy Management',
        recommendation: `Review and update ${policyEffectiveness.totalPolicies - policyEffectiveness.policiesUpToDate} overdue policies`,
        estimatedImpact: 'Ensure policy framework reflects current organizational practices',
      },
    ];
  }

  private selectRandomFrameworks(): string[] {
    const selectedCount = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...this.frameworks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, selectedCount);
  }

  // ==================== Public Methods ====================

  /**
   * Get governance audit report
   */
  getGovernanceReport(): GovernanceAuditReport | undefined {
    return supabaseStore.getGovernanceAuditReport();
  }

  /**
   * Get latest governance maturity score
   */
  getGovernanceMaturityScore(): GovernanceMaturityScore | undefined {
    const report = supabaseStore.getGovernanceAuditReport();
    return report ? report.governanceMaturity : undefined;
  }

  /**
   * Get board-ready report
   */
  getBoardReport(): BoardReadyReport | undefined {
    const report = supabaseStore.getGovernanceAuditReport();
    return report ? report.boardReport : undefined;
  }

  /**
   * Get critical gaps requiring attention
   */
  getCriticalGaps(): string[] {
    const report = supabaseStore.getGovernanceAuditReport();
    if (!report) return [];

    const gaps: string[] = [];

    // Control gaps
    const controlGaps = report.controlEffectiveness.results
      .filter((c) => c.score < 50)
      .map((c) => `Control ${c.controlName} has critical issues`);
    gaps.push(...controlGaps.slice(0, 3));

    // Compliance gaps
    const complianceGaps = report.complianceAnalysis
      .filter((c) => c.criticalGaps > 0)
      .flatMap((c) => c.gaps.filter((g) => g.gapStatus === 'gap-exists'))
      .map((g) => `${g.framework}: ${g.requirementName}`);
    gaps.push(...complianceGaps.slice(0, 3));

    return gaps;
  }
}

/**
 * Factory function to create a GovernanceAuditAgent instance
 */
export function createGovernanceAuditAgent(config?: Partial<AgentConfig>): GovernanceAuditAgent {
  return new GovernanceAuditAgent(config);
}
