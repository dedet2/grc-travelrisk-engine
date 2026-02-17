/**
 * Risk Scoring Engine
 * Calculates risk scores based on inherent risk, control effectiveness, and residual risk
 */

export type RiskCategory = 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';

export interface RiskEntity {
  id: string;
  name: string;
  type: 'system' | 'vendor' | 'department' | 'process' | 'data';
  inherentRisk: number; // 0-100
  controlEffectiveness: number; // 0-100 (higher is better)
  description?: string;
}

export interface RiskScore {
  entityId: string;
  entityName: string;
  inherentRisk: number;
  controlEffectiveness: number;
  residualRisk: number;
  riskScore: number;
  category: RiskCategory;
  recommendations: string[];
}

export interface TravelRiskScore {
  destination: string;
  riskScore: number;
  category: RiskCategory;
  factors: {
    securityRating: number;
    healthRisk: number;
    politicalInstability: number;
    infrastructureQuality: number;
  };
  recommendations: string[];
}

export interface PortfolioRiskSummary {
  portfolioRiskScore: number;
  entitiesCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  minimalCount: number;
  avgInherentRisk: number;
  avgControlEffectiveness: number;
  avgResidualRisk: number;
  topRisks: RiskScore[];
  recommendations: string[];
}

export class RiskScoringEngine {
  /**
   * Calculate residual risk: Inherent Risk × (1 - Control Effectiveness / 100)
   */
  private calculateResidualRisk(inherentRisk: number, controlEffectiveness: number): number {
    const riskMitigation = controlEffectiveness / 100;
    const residual = inherentRisk * (1 - riskMitigation);
    return Math.round(residual * 100) / 100;
  }

  /**
   * Categorize risk score
   */
  private categorizeRisk(score: number): RiskCategory {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Minimal';
  }

  /**
   * Get recommendations based on risk score
   */
  getRecommendations(score: number): string[] {
    const recommendations: string[] = [];

    if (score >= 80) {
      recommendations.push('URGENT: Immediate action required to mitigate critical risks');
      recommendations.push('Escalate to executive leadership and risk committee');
      recommendations.push('Develop detailed remediation plan with immediate milestones');
      recommendations.push('Consider temporary controls or process changes to reduce exposure');
      recommendations.push('Establish daily monitoring and reporting');
    } else if (score >= 60) {
      recommendations.push('High risk: Develop comprehensive mitigation strategy');
      recommendations.push('Assign dedicated resources to address top risk drivers');
      recommendations.push('Increase control effectiveness and testing frequency');
      recommendations.push('Escalate to management for resource allocation');
      recommendations.push('Schedule monthly risk reviews');
    } else if (score >= 40) {
      recommendations.push('Medium risk: Develop action plan to reduce exposure');
      recommendations.push('Enhance existing controls or add new compensating controls');
      recommendations.push('Review and strengthen third-party oversight');
      recommendations.push('Conduct quarterly risk assessments');
    } else if (score >= 20) {
      recommendations.push('Low risk: Maintain current controls and monitoring');
      recommendations.push('Document control design and effectiveness');
      recommendations.push('Schedule semi-annual reviews');
    } else {
      recommendations.push('Minimal risk: Maintain current control environment');
      recommendations.push('Continue routine monitoring and annual assessments');
    }

    return recommendations;
  }

  /**
   * Calculate risk score for a single entity
   */
  calculateEntityRisk(entity: RiskEntity): RiskScore {
    const residualRisk = this.calculateResidualRisk(entity.inherentRisk, entity.controlEffectiveness);
    const riskScore = Math.round(residualRisk);
    const category = this.categorizeRisk(riskScore);
    const recommendations = this.getRecommendations(riskScore);

    return {
      entityId: entity.id,
      entityName: entity.name,
      inherentRisk: entity.inherentRisk,
      controlEffectiveness: entity.controlEffectiveness,
      residualRisk,
      riskScore,
      category,
      recommendations,
    };
  }

  /**
   * Calculate travel risk score for a destination
   * Factors: Security (0-100), Health (0-100), Political (0-100), Infrastructure (0-100)
   */
  calculateTravelRisk(
    destination: string,
    securityRating: number = 50,
    healthRisk: number = 50,
    politicalInstability: number = 50,
    infrastructureQuality: number = 50
  ): TravelRiskScore {
    // Normalize inputs to 0-100
    const normalizedSecurity = Math.max(0, Math.min(100, securityRating));
    const normalizedHealth = Math.max(0, Math.min(100, healthRisk));
    const normalizedPolitical = Math.max(0, Math.min(100, politicalInstability));
    const normalizedInfra = Math.max(0, Math.min(100, infrastructureQuality));

    // Calculate weighted risk score
    const riskScore =
      normalizedSecurity * 0.35 +
      normalizedHealth * 0.25 +
      normalizedPolitical * 0.25 +
      (100 - normalizedInfra) * 0.15; // Lower infra quality = higher risk

    const roundedScore = Math.round(riskScore);
    const category = this.categorizeRisk(roundedScore);
    const recommendations = this.getRecommendations(roundedScore);

    return {
      destination,
      riskScore: roundedScore,
      category,
      factors: {
        securityRating: normalizedSecurity,
        healthRisk: normalizedHealth,
        politicalInstability: normalizedPolitical,
        infrastructureQuality: normalizedInfra,
      },
      recommendations,
    };
  }

  /**
   * Calculate aggregated portfolio risk from multiple entities
   */
  calculatePortfolioRisk(entities: RiskEntity[]): PortfolioRiskSummary {
    if (entities.length === 0) {
      return {
        portfolioRiskScore: 0,
        entitiesCount: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        minimalCount: 0,
        avgInherentRisk: 0,
        avgControlEffectiveness: 0,
        avgResidualRisk: 0,
        topRisks: [],
        recommendations: ['No entities to assess'],
      };
    }

    // Calculate individual risk scores
    const riskScores = entities.map((entity) => this.calculateEntityRisk(entity));

    // Sort by risk score (highest first)
    riskScores.sort((a, b) => b.riskScore - a.riskScore);

    // Count by category
    const categoryCounts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Minimal: 0,
    };

    let totalInherentRisk = 0;
    let totalControlEffectiveness = 0;
    let totalResidualRisk = 0;

    riskScores.forEach((score) => {
      categoryCounts[score.category]++;
      totalInherentRisk += score.inherentRisk;
      totalControlEffectiveness += score.controlEffectiveness;
      totalResidualRisk += score.residualRisk;
    });

    const avgInherentRisk = Math.round((totalInherentRisk / entities.length) * 100) / 100;
    const avgControlEffectiveness = Math.round((totalControlEffectiveness / entities.length) * 100) / 100;
    const avgResidualRisk = Math.round((totalResidualRisk / entities.length) * 100) / 100;

    // Portfolio risk is the average of residual risks
    const portfolioRiskScore = Math.round(avgResidualRisk);

    // Get top 5 risks
    const topRisks = riskScores.slice(0, 5);

    // Generate portfolio recommendations
    const portfolioRecommendations = this.getRecommendations(portfolioRiskScore);
    if (categoryCounts.Critical > 0) {
      portfolioRecommendations.unshift(
        `${categoryCounts.Critical} critical risk(s) identified - immediate executive attention required`
      );
    }
    if (categoryCounts.High > 0) {
      portfolioRecommendations.unshift(
        `${categoryCounts.High} high risk(s) identified - prioritize mitigation efforts`
      );
    }

    return {
      portfolioRiskScore,
      entitiesCount: entities.length,
      criticalCount: categoryCounts.Critical,
      highCount: categoryCounts.High,
      mediumCount: categoryCounts.Medium,
      lowCount: categoryCounts.Low,
      minimalCount: categoryCounts.Minimal,
      avgInherentRisk,
      avgControlEffectiveness,
      avgResidualRisk,
      topRisks,
      recommendations: portfolioRecommendations,
    };
  }
}

export default RiskScoringEngine;
