import type { AdvisoryData, TravelRiskOutput, TravelRiskFactors } from './types';

/**
 * Calculate travel risk score based on advisory level and other factors
 * Scale: 0-100 (lower is better/lower risk)
 */
export function calculateTravelRiskScore(
  destination: string,
  advisory: AdvisoryData
): TravelRiskOutput {
  const baseScore = getBaseScoreFromAdvisoryLevel(advisory.advisoryLevel);
  const healthImpact = (advisory.healthRiskLevel || 0) * 10;
  const securityImpact = (advisory.securityRiskLevel || 0) * 10;

  const score = Math.min(100, baseScore + healthImpact + securityImpact);
  const riskLevel = determineRiskLevel(score);
  const factors = extractRiskFactors(advisory);
  const recommendation = getTravelRecommendation(advisory.advisoryLevel);

  return {
    destination,
    score: Math.round(score),
    riskLevel,
    factors,
    travelRecommendation: recommendation,
    lastUpdated: advisory.lastUpdated,
  };
}

/**
 * Get base score from US State Department advisory level
 */
function getBaseScoreFromAdvisoryLevel(advisoryLevel: 1 | 2 | 3 | 4): number {
  switch (advisoryLevel) {
    case 1: // Exercise Normal Precautions
      return 10;
    case 2: // Exercise Increased Caution
      return 40;
    case 3: // Reconsider Travel
      return 70;
    case 4: // Do Not Travel
      return 95;
    default:
      return 50;
  }
}

/**
 * Determine risk level based on score
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
 * Extract risk factors from advisory data
 */
function extractRiskFactors(advisory: AdvisoryData): TravelRiskFactors {
  const advisoryLevelNames = {
    1: 'Exercise Normal Precautions',
    2: 'Exercise Increased Caution',
    3: 'Reconsider Travel',
    4: 'Do Not Travel',
  };

  return {
    advisoryLevel: advisoryLevelNames[advisory.advisoryLevel],
    healthFactors: advisory.healthRiskLevel ? [`Health risk level: ${advisory.healthRiskLevel}/5`] : [],
    securityFactors: advisory.securityRiskLevel ? [`Security risk level: ${advisory.securityRiskLevel}/5`] : [],
    otherFactors: [
      'Check with local authorities',
      'Register travel itinerary',
      'Purchase travel insurance',
    ],
  };
}

/**
 * Get travel recommendation based on advisory level
 */
function getTravelRecommendation(advisoryLevel: 1 | 2 | 3 | 4): string {
  switch (advisoryLevel) {
    case 1:
      return 'Safe to travel. Follow normal precautions as you would in your home country.';
    case 2:
      return 'Travel is possible but exercise increased caution. Be aware of your surroundings.';
    case 3:
      return 'Consider postponing travel unless absolutely necessary. Reconsider any non-essential travel.';
    case 4:
      return 'Do not travel to this destination. The U.S. State Department advises against travel.';
    default:
      return 'Check current travel advisories before planning your trip.';
  }
}

/**
 * Get risk color for frontend display
 */
export function getTravelRiskColor(riskLevel: string): string {
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
 * Combine GRC assessment score with travel risk score
 */
export function combinedRiskScore(grcScore: number, travelScore: number): number {
  // Weight GRC at 40% and travel risk at 60% for overall trip risk
  const combined = grcScore * 0.4 + travelScore * 0.6;
  return Math.round(combined);
}
