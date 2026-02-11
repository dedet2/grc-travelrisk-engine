/**
 * Unified Risk Combiner Agent (A-04)
 * Combines GRC risk score (from A-02) with travel risk score (from A-03)
 * using configurable weights to produce a unified risk assessment
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { store } from '@/lib/store/in-memory-store';

/**
 * Configuration for risk combination weights
 */
export interface RiskCombinerConfig {
  grcWeight: number; // Default 0.6 (60%)
  travelWeight: number; // Default 0.4 (40%)
}

/**
 * Raw data for combining risks
 */
interface RiskCombinerRawData {
  assessmentId: string;
  tripId?: string;
  destination?: string;
  grcScore?: number;
  travelScore?: number;
}

/**
 * Processed combined risk report
 */
export interface CombinedRiskReport {
  reportId: string;
  assessmentId: string;
  tripId?: string;
  destination?: string;
  grcScore: number;
  travelScore: number;
  combinedScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  executiveSummary: string;
  mitigations: string[];
  confidence: number; // 0-100, based on data freshness
  grcWeight: number;
  travelWeight: number;
  createdAt: Date;
  grcDataFreshness: 'fresh' | 'stale' | 'missing';
  travelDataFreshness: 'fresh' | 'stale' | 'missing';
}

/**
 * Unified Risk Combiner Agent
 * Extends BaseAgent to combine multiple risk sources into unified assessment
 */
export class UnifiedRiskCombinerAgent extends BaseAgent<
  RiskCombinerRawData,
  CombinedRiskReport
> {
  private combinerConfig: RiskCombinerConfig = {
    grcWeight: 0.6,
    travelWeight: 0.4,
  };

  constructor(config?: Partial<AgentConfig> & Partial<RiskCombinerConfig>) {
    super({
      name: 'Unified-Risk-Combiner-Agent',
      description:
        'Combines GRC and travel risk scores into unified risk assessment',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    if (config?.grcWeight !== undefined) this.combinerConfig.grcWeight = config.grcWeight;
    if (config?.travelWeight !== undefined) {
      this.combinerConfig.travelWeight = config.travelWeight;
    }
  }

  /**
   * Collect raw data from both GRC and travel risk sources
   */
  async collectData(): Promise<RiskCombinerRawData> {
    try {
      // Simulate data collection delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Default to last assessment and trip data
      const assessmentId = 'assessment-001';
      const tripId = 'trip-001';
      const destination = 'US';

      return {
        assessmentId,
        tripId,
        destination,
      };
    } catch (error) {
      throw new Error(
        `Failed to collect risk data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process data through risk combination formula
   */
  async processData(rawData: RiskCombinerRawData): Promise<CombinedRiskReport> {
    try {
      const { assessmentId, tripId, destination } = rawData;

      // Fetch GRC score from store
      const grcResult = store.getScoringResult(assessmentId);
      const grcScore = grcResult?.result.overallScore ?? 0;
      const grcDataFreshness = this.evaluateDataFreshness(grcResult?.storedAt);

      // Fetch travel risk score from store (this would come from A-03)
      // For now, using mock data
      const travelScore = this.fetchTravelRiskScore(destination || 'US');
      const travelDataFreshness = 'fresh' as const; // Placeholder

      // Apply weighted formula
      const combinedScore =
        grcScore * this.combinerConfig.grcWeight +
        travelScore * this.combinerConfig.travelWeight;

      // Determine risk level
      const riskLevel = this.determineRiskLevel(combinedScore);

      // Generate executive summary
      const executiveSummary = this.generateExecutiveSummary(
        grcScore,
        travelScore,
        combinedScore,
        riskLevel
      );

      // Generate mitigations
      const mitigations = this.generateMitigations(
        grcScore,
        travelScore,
        riskLevel
      );

      // Calculate confidence based on data freshness
      const confidence = this.calculateConfidence(
        grcDataFreshness,
        travelDataFreshness
      );

      const now = new Date();
      const reportId = this.generateReportId(assessmentId, tripId);

      return {
        reportId,
        assessmentId,
        tripId,
        destination,
        grcScore,
        travelScore,
        combinedScore: Math.round(combinedScore),
        riskLevel,
        executiveSummary,
        mitigations,
        confidence,
        grcWeight: this.combinerConfig.grcWeight,
        travelWeight: this.combinerConfig.travelWeight,
        createdAt: now,
        grcDataFreshness,
        travelDataFreshness,
      };
    } catch (error) {
      throw new Error(
        `Failed to process risk data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update dashboard by storing combined report
   */
  async updateDashboard(processedData: CombinedRiskReport): Promise<void> {
    try {
      // Store combined report in in-memory store
      store.storeCombinedRiskReport(processedData);

      // Simulate dashboard update delay
      await new Promise((resolve) => setTimeout(resolve, 50));

      console.log(
        `[UnifiedRiskCombinerAgent] Dashboard updated for assessment ${processedData.assessmentId} with combined score ${processedData.combinedScore}`
      );
    } catch (error) {
      throw new Error(
        `Failed to update dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Combine risks for a specific assessment
   */
  async combineRisks(
    assessmentId: string,
    tripId?: string,
    destination?: string
  ): Promise<CombinedRiskReport> {
    const rawData: RiskCombinerRawData = {
      assessmentId,
      tripId,
      destination,
    };

    const processedData = await this.processData(rawData);
    await this.updateDashboard(processedData);

    return processedData;
  }

  /**
   * Set custom risk weights
   */
  setWeights(grcWeight: number, travelWeight: number): void {
    if (grcWeight + travelWeight !== 1.0) {
      throw new Error('Weights must sum to 1.0');
    }
    this.combinerConfig.grcWeight = grcWeight;
    this.combinerConfig.travelWeight = travelWeight;
  }

  /**
   * Get current weights
   */
  getWeights(): RiskCombinerConfig {
    return { ...this.combinerConfig };
  }

  /**
   * Determine risk level from score (0-100 scale)
   */
  private determineRiskLevel(
    score: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (score <= 25) return 'low';
    if (score <= 50) return 'medium';
    if (score <= 75) return 'high';
    return 'critical';
  }

  /**
   * Evaluate data freshness
   */
  private evaluateDataFreshness(
    storedAt?: Date
  ): 'fresh' | 'stale' | 'missing' {
    if (!storedAt) return 'missing';

    const ageMinutes = (Date.now() - storedAt.getTime()) / (1000 * 60);
    if (ageMinutes < 30) return 'fresh';
    if (ageMinutes < 120) return 'stale';
    return 'stale';
  }

  /**
   * Fetch travel risk score (mock implementation)
   */
  private fetchTravelRiskScore(destination: string): number {
    // Mock travel risk scores for common destinations
    const travelRisks: Record<string, number> = {
      US: 25,
      CA: 20,
      UK: 20,
      DE: 15,
      FR: 20,
      MX: 45,
      IN: 50,
      CN: 40,
      RU: 75,
      KP: 95,
      SY: 90,
      default: 35,
    };

    return travelRisks[destination] || travelRisks.default;
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    grcScore: number,
    travelScore: number,
    combinedScore: number,
    riskLevel: string
  ): string {
    const grcStatus = grcScore <= 50 ? 'strong' : 'weak';
    const travelStatus =
      travelScore <= 50 ? 'favorable' : 'challenging';

    return `Unified risk assessment shows ${riskLevel.toUpperCase()} risk. ` +
      `GRC posture is ${grcStatus} (score: ${grcScore}), while travel conditions are ${travelStatus} (score: ${travelScore}). ` +
      `Combined risk index: ${combinedScore}. ` +
      `Recommend reviewing mitigations below before proceeding.`;
  }

  /**
   * Generate mitigation recommendations
   */
  private generateMitigations(
    grcScore: number,
    travelScore: number,
    riskLevel: string
  ): string[] {
    const mitigations: string[] = [];

    // GRC-based mitigations
    if (grcScore > 50) {
      mitigations.push(
        'Strengthen organizational security controls and compliance posture'
      );
      mitigations.push(
        'Conduct security awareness training for all personnel involved in travel'
      );
      mitigations.push(
        'Implement enhanced data protection measures during travel'
      );
    }

    // Travel-based mitigations
    if (travelScore > 50) {
      mitigations.push('Use secure VPN for all internet communications');
      mitigations.push(
        'Avoid public WiFi and use cellular data or corporate VPN only'
      );
      mitigations.push(
        'Maintain heightened awareness of physical security threats'
      );
      mitigations.push('Register travel with corporate security team');
    }

    // High/critical risk mitigations
    if (riskLevel === 'high' || riskLevel === 'critical') {
      mitigations.push('Require executive approval for this trip');
      mitigations.push('Assign security escort or buddy system');
      mitigations.push('Implement continuous monitoring and check-in protocols');
      mitigations.push(
        'Consider rescheduling or converting to remote participation'
      );
    }

    return mitigations;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(
    grcFreshness: string,
    travelFreshness: string
  ): number {
    let confidence = 100;

    // Reduce confidence for stale data
    if (grcFreshness === 'stale') confidence -= 15;
    if (grcFreshness === 'missing') confidence -= 30;

    if (travelFreshness === 'stale') confidence -= 15;
    if (travelFreshness === 'missing') confidence -= 30;

    return Math.max(0, confidence);
  }

  /**
   * Generate unique report ID
   */
  private generateReportId(assessmentId: string, tripId?: string): string {
    const timestamp = Date.now();
    return `report-${assessmentId}-${tripId || 'nottrip'}-${timestamp}`;
  }
}

/**
 * Create and export a default instance of the Unified Risk Combiner Agent
 */
export function createUnifiedRiskCombinerAgent(
  config?: Partial<AgentConfig> & Partial<RiskCombinerConfig>
): UnifiedRiskCombinerAgent {
  return new UnifiedRiskCombinerAgent(config);
}
