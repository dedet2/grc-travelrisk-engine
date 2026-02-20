/**
 * Risk Scoring Agent (A-02)
 * Orchestrates the risk scoring process with the following lifecycle:
 * - collectData(): Gathers assessment responses
 * - processData(): Runs scoring engine
 * - updateDashboard(): Stores results
 *
 * Extends BaseAgent and provides on-demand scoring via scoreAssessment()
 */

import { BaseAgent, type AgentConfig, type AgentRunResult } from './base-agent';
import { calculateRiskScore, calculateAssessmentMetrics } from '@/lib/scoring/engine';
import type { ControlScore, ScoringInput, ScoringOutput, CategoryScore } from '@/lib/scoring/types';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface RiskScoringAgentInput {
  assessmentId: string;
  controls: ControlScore[];
}

export interface RiskScoringOutput {
  assessmentId: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categoryScores: CategoryScore[];
  compliancePercentage: number;
  recommendations: string[];
  metrics: {
    totalControls: number;
    implementedControls: number;
    compliancePercentage: number;
  };
  timestamp: Date;
}

/**
 * Risk Scoring Agent
 * Extends BaseAgent to provide structured risk assessment and scoring
 */
export class RiskScoringAgent extends BaseAgent<RiskScoringAgentInput, RiskScoringOutput> {
  private mockData: Map<string, ControlScore[]> = new Map();
  private lastScoringInput?: ScoringInput;
  private lastScoringOutput?: ScoringOutput;

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Risk Scoring Agent (A-02)',
      description: 'Runs GRC risk scoring engine on assessment responses',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  /**
   * Initialize mock data for testing/demo purposes
   */
  private initializeMockData(): void {
    // Create sample control data for testing
    const sampleControls: ControlScore[] = [
      {
        controlId: 'A.5.1',
        controlIdStr: 'A.5.1',
        title: 'Access Control Policy',
        response: 'implemented',
        score: 0,
        category: 'Access Control',
        weight: 0.15,
      },
      {
        controlId: 'A.5.2',
        controlIdStr: 'A.5.2',
        title: 'User Registration',
        response: 'partially-implemented',
        score: 50,
        category: 'Access Control',
        weight: 0.15,
      },
      {
        controlId: 'A.8.1',
        controlIdStr: 'A.8.1',
        title: 'Asset Management',
        response: 'implemented',
        score: 0,
        category: 'Asset Management',
        weight: 0.1,
      },
      {
        controlId: 'A.10.1',
        controlIdStr: 'A.10.1',
        title: 'Encryption',
        response: 'not-implemented',
        score: 100,
        category: 'Cryptography',
        weight: 0.12,
      },
      {
        controlId: 'A.11.1',
        controlIdStr: 'A.11.1',
        title: 'Physical Security',
        response: 'partially-implemented',
        score: 50,
        category: 'Physical Security',
        weight: 0.08,
      },
      {
        controlId: 'A.12.1',
        controlIdStr: 'A.12.1',
        title: 'Configuration Management',
        response: 'implemented',
        score: 0,
        category: 'Operations',
        weight: 0.08,
      },
      {
        controlId: 'A.16.1',
        controlIdStr: 'A.16.1',
        title: 'Incident Management',
        response: 'partially-implemented',
        score: 50,
        category: 'Incident Management',
        weight: 0.15,
      },
      {
        controlId: 'A.17.1',
        controlIdStr: 'A.17.1',
        title: 'Business Continuity',
        response: 'not-implemented',
        score: 100,
        category: 'Business Continuity',
        weight: 0.12,
      },
    ];

    this.mockData.set('default', sampleControls);
    this.mockData.set('assessment-001', sampleControls);
  }

  /**
   * Collect assessment data from storage or mock data
   * Implements abstract method from BaseAgent
   */
  async collectData(): Promise<RiskScoringAgentInput> {
    // Simulating data collection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real scenario, this would fetch from the database
    // For now, we use mock data
    const assessmentId = 'assessment-001';
    const controls = this.mockData.get(assessmentId) || this.mockData.get('default') || [];

    return {
      assessmentId,
      controls,
    };
  }

  /**
   * Process collected data through the scoring engine
   * Implements abstract method from BaseAgent
   */
  async processData(rawData: RiskScoringAgentInput): Promise<RiskScoringOutput> {
    const { assessmentId, controls } = rawData;

    // Build scoring input
    const scoringInput: ScoringInput = {
      assessmentId,
      frameworkId: 'iso-27001',
      controls,
    };

    // Run the core scoring engine
    const scoringOutput = calculateRiskScore(scoringInput);
    this.lastScoringInput = scoringInput;
    this.lastScoringOutput = scoringOutput;

    // Calculate metrics
    const metrics = calculateAssessmentMetrics(scoringOutput.categoryScores);

    // Generate recommendations based on category scores
    const recommendations = this.generateRecommendations(scoringOutput.categoryScores);

    return {
      assessmentId,
      overallScore: scoringOutput.overallScore,
      riskLevel: scoringOutput.riskLevel,
      categoryScores: scoringOutput.categoryScores,
      compliancePercentage: metrics.compliancePercentage,
      recommendations,
      metrics,
      timestamp: scoringOutput.timestamp,
    };
  }

  /**
   * Update dashboard by storing results
   * Implements abstract method from BaseAgent
   */
  async updateDashboard(processedData: RiskScoringOutput): Promise<void> {
    // Store results in in-memory store
    if (this.lastScoringOutput) {
      supabaseStore.storeScoringResult(this.lastScoringOutput, this.lastScoringInput?.controls);
    }

    // Simulate dashboard update delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log(`[RiskScoringAgent] Dashboard updated for assessment ${processedData.assessmentId}`);
  }

  /**
   * Score a specific assessment on-demand
   * Can be called directly without triggering the full agent lifecycle
   */
  async scoreAssessment(assessmentId: string): Promise<RiskScoringOutput> {
    const controls = this.mockData.get(assessmentId) || this.mockData.get('default') || [];

    const rawData: RiskScoringAgentInput = {
      assessmentId,
      controls,
    };

    const processedData = await this.processData(rawData);
    await this.updateDashboard(processedData);

    return processedData;
  }

  /**
   * Generate actionable recommendations based on category scores
   * Maps weak categories to specific recommendations
   */
  private generateRecommendations(categoryScores: CategoryScore[]): string[] {
    const recommendations: string[] = [];
    const weakCategories = categoryScores.filter((c) => c.score > 50).sort((a, b) => b.score - a.score);

    for (const category of weakCategories.slice(0, 3)) {
      switch (category.category) {
        case 'Access Control':
          if (category.score > 50) {
            recommendations.push(
              'Implement Multi-Factor Authentication (MFA) across all systems',
              'Conduct Role-Based Access Control (RBAC) review and update privilege levels',
              'Establish quarterly access review and recertification process'
            );
          }
          break;

        case 'Cryptography':
          if (category.score > 50) {
            recommendations.push(
              'Conduct encryption audit for data at rest and in transit',
              'Implement TLS 1.2+ for all network communications',
              'Establish cryptographic key management and rotation procedures'
            );
          }
          break;

        case 'Physical Security':
          if (category.score > 50) {
            recommendations.push(
              'Conduct facility assessment and install access controls',
              'Deploy CCTV monitoring in data centers and server rooms',
              'Implement environmental monitoring (temperature, humidity) systems'
            );
          }
          break;

        case 'Incident Management':
          if (category.score > 50) {
            recommendations.push(
              'Develop and document incident response procedures',
              'Establish incident response team with defined roles',
              'Conduct quarterly incident response drills and tabletop exercises'
            );
          }
          break;

        case 'Business Continuity':
          if (category.score > 50) {
            recommendations.push(
              'Conduct business impact analysis (BIA) and define RTO/RPO',
              'Develop comprehensive disaster recovery plan (DRP)',
              'Test backup and recovery procedures quarterly'
            );
          }
          break;

        case 'Asset Management':
          if (category.score > 50) {
            recommendations.push(
              'Create and maintain complete IT asset inventory',
              'Implement asset tracking system with unique identifiers',
              'Establish asset disposal and end-of-life management procedures'
            );
          }
          break;

        case 'Operations':
          if (category.score > 50) {
            recommendations.push(
              'Establish configuration management baselines',
              'Implement patch management program with defined schedules',
              'Deploy vulnerability management and scanning tools'
            );
          }
          break;

        case 'Risk Assessment':
          if (category.score > 50) {
            recommendations.push(
              'Conduct comprehensive risk assessment across all business areas',
              'Develop risk register with identified threats and mitigations',
              'Establish risk monitoring and review procedures'
            );
          }
          break;

        case 'Compliance':
          if (category.score > 50) {
            recommendations.push(
              'Map controls to applicable regulations and standards',
              'Conduct compliance gap assessment',
              'Develop and track remediation plan for identified gaps'
            );
          }
          break;
      }
    }

    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Get the last scoring output
   */
  getLastScoringOutput(): ScoringOutput | undefined {
    return this.lastScoringOutput;
  }

  /**
   * Add mock data for testing
   */
  setMockData(assessmentId: string, controls: ControlScore[]): void {
    this.mockData.set(assessmentId, controls);
  }

  /**
   * Get agent status with scoring details
   */
  override getMetrics() {
    const baseMetrics = super.getMetrics();
    return {
      ...baseMetrics,
      lastScoringResult: this.lastScoringOutput
        ? {
            overallScore: this.lastScoringOutput.overallScore,
            riskLevel: this.lastScoringOutput.riskLevel,
          }
        : undefined,
    };
  }
}
