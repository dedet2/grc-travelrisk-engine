import {
  TripLeg,
  TripAssessment,
  TripLegAssessment,
  TravelDestination,
  AdvisoryLevel,
} from '@/types/index';
import {
  getDestinationRisk,
  calculateDestinationRiskFactors,
  getRecommendedVaccines,
} from './advisory-fetcher';

/**
 * Convert numeric risk score (0-100) to risk level
 */
function scoreToRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

/**
 * Get duration of trip leg in days
 */
function getTripDuration(departureDate: Date, returnDate: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((returnDate.getTime() - departureDate.getTime()) / msPerDay);
}

/**
 * Generate travel-specific recommendations based on destination risk profile
 */
function generateTravelRecommendations(destination: TravelDestination): string[] {
  const recommendations: string[] = [];

  // Advisory level recommendations
  switch (destination.advisoryLevel) {
    case 4:
      recommendations.push('CRITICAL: Travel not recommended - consult embassy before travel');
      recommendations.push('Register with your embassy before departure');
      recommendations.push('Maintain constant situational awareness');
      break;
    case 3:
      recommendations.push('Obtain comprehensive travel insurance including evacuation coverage');
      recommendations.push('Register travel plans with your embassy');
      recommendations.push('Avoid travel to affected regions if possible');
      break;
    case 2:
      recommendations.push('Obtain travel insurance with medical coverage');
      recommendations.push('Stay informed of local conditions');
      break;
    case 1:
      recommendations.push('Standard travel precautions apply');
      break;
  }

  // Security-based recommendations
  const criticalThreats = destination.securityThreats.filter(
    (t) => t.severity === 'critical',
  );
  const highThreats = destination.securityThreats.filter((t) => t.severity === 'high');

  if (criticalThreats.length > 0) {
    recommendations.push(
      `Critical security threat: ${criticalThreats[0].type} - strongly reconsider travel`,
    );
  }

  if (highThreats.length > 0) {
    recommendations.push(`Elevated security risk: ${highThreats[0].type}`);
  }

  // Health recommendations
  const vaccines = getRecommendedVaccines(destination);
  if (vaccines.length > 0) {
    recommendations.push(`Recommended vaccinations: ${vaccines.join(', ')}`);
  }

  const highHealthRisks = destination.healthRisks.filter((r) => r.severity === 'high');
  if (highHealthRisks.length > 0) {
    recommendations.push(`Health risks present: ${highHealthRisks.map((r) => r.disease).join(', ')}`);
    recommendations.push('Consult travel medicine specialist 4-6 weeks before departure');
  }

  // Natural disaster recommendations
  const highDisasters = destination.naturalDisasterRisk.filter(
    (d) => d.probability === 'high',
  );
  if (highDisasters.length > 0) {
    const disasters = highDisasters.map((d) => `${d.type}${d.season ? ` (${d.season})` : ''}`);
    recommendations.push(`Natural disaster risk: ${disasters.join(', ')}`);
  }

  // Infrastructure recommendations
  if (destination.infrastructureScore < 60) {
    recommendations.push('Limited infrastructure - ensure adequate travel insurance');
    recommendations.push('Medical facilities may be limited - bring essential medications');
  }

  return recommendations;
}

/**
 * Assess a single trip leg and return risk assessment
 */
function assessLeg(leg: TripLeg): TripLegAssessment {
  const destination = getDestinationRisk(leg.destination);

  if (!destination) {
    return {
      destination: leg.destination,
      riskScore: 50,
      riskLevel: 'medium',
      advisoryLevel: 2,
      recommendations: ['Destination information not available - verify current travel status'],
    };
  }

  // Base score is the destination risk score
  let adjustedScore = destination.riskScore;

  // Adjust score based on trip duration (longer trips = higher risk)
  const duration = getTripDuration(leg.departureDate, leg.returnDate);
  if (duration > 30) {
    adjustedScore = Math.min(adjustedScore + 10, 100);
  } else if (duration > 14) {
    adjustedScore = Math.min(adjustedScore + 5, 100);
  }

  // Adjust score based on purpose
  const highRiskPurposes = ['journalism', 'humanitarian', 'ngο', 'political'];
  if (highRiskPurposes.some((p) => leg.purpose.toLowerCase().includes(p))) {
    adjustedScore = Math.min(adjustedScore + 15, 100);
  }

  const riskLevel = scoreToRiskLevel(adjustedScore);
  const recommendations = generateTravelRecommendations(destination);

  // Add purpose-specific recommendations
  if (leg.purpose.toLowerCase().includes('business')) {
    recommendations.push('Brief security team on destination before departure');
    recommendations.push('Maintain low profile in public');
  }

  return {
    destination: destination.countryName,
    riskScore: adjustedScore,
    riskLevel,
    advisoryLevel: destination.advisoryLevel,
    recommendations,
  };
}

/**
 * Assess a multi-leg business trip and return comprehensive risk assessment
 * @param legs Array of trip legs with origin, destination, dates, and purpose
 * @returns Comprehensive trip assessment with per-leg scores and overall score
 */
export function assessTrip(legs: TripLeg[]): TripAssessment {
  if (!legs || legs.length === 0) {
    throw new Error('At least one trip leg is required');
  }

  // Validate trip legs
  legs.forEach((leg, index) => {
    if (!leg.destination) {
      throw new Error(`Leg ${index + 1}: destination is required`);
    }
    if (!leg.departureDate || !leg.returnDate) {
      throw new Error(`Leg ${index + 1}: departure and return dates are required`);
    }
    if (leg.departureDate >= leg.returnDate) {
      throw new Error(`Leg ${index + 1}: departure date must be before return date`);
    }
  });

  // Assess each leg
  const legAssessments = legs.map((leg) => assessLeg(leg));

  // Overall score is the maximum of all leg scores (conservative approach)
  const overallTripScore = Math.max(...legAssessments.map((l) => l.riskScore));
  const overallRiskLevel = scoreToRiskLevel(overallTripScore);

  // Find highest risk leg
  const highestRisk = legAssessments.reduce((prev, current) =>
    current.riskScore > prev.riskScore ? current : prev,
  );

  // Consolidate recommendations from all legs
  const uniqueRecommendations = new Set<string>();

  // Add high-priority recommendations first
  legAssessments.forEach((leg) => {
    leg.recommendations.forEach((rec) => {
      if (rec.includes('CRITICAL') || rec.includes('critical')) {
        uniqueRecommendations.add(rec);
      }
    });
  });

  // Add other recommendations
  legAssessments.forEach((leg) => {
    leg.recommendations.forEach((rec) => {
      if (!rec.includes('CRITICAL') && !rec.includes('critical')) {
        uniqueRecommendations.add(rec);
      }
    });
  });

  // Add multi-leg specific recommendations
  if (legs.length > 1) {
    uniqueRecommendations.add(
      `Multi-leg trip: highest risk destination is ${highestRisk.destination} (${highestRisk.riskLevel})`,
    );
    uniqueRecommendations.add('Maintain consistent preventive measures across all destinations');

    const requiresVaccines = legAssessments.some((l) =>
      l.recommendations.some((r) => r.includes('vaccin')),
    );
    if (requiresVaccines) {
      uniqueRecommendations.add('Plan vaccines 4-6 weeks before earliest departure');
    }
  }

  // Add trip duration recommendations
  const totalDays = legs.reduce((sum, leg) => sum + getTripDuration(leg.departureDate, leg.returnDate), 0);
  if (totalDays > 30) {
    uniqueRecommendations.add('Extended trip duration - ensure comprehensive travel insurance');
  }

  return {
    legs: legAssessments,
    overallTripScore,
    overallRiskLevel,
    highestRisk,
    recommendations: Array.from(uniqueRecommendations),
    createdAt: new Date(),
  };
}

/**
 * Get risk summary statistics for a trip
 */
export function getTripRiskSummary(assessment: TripAssessment): {
  lowRiskLegs: number;
  mediumRiskLegs: number;
  highRiskLegs: number;
  criticalRiskLegs: number;
  overallRiskLevel: string;
} {
  const summary = {
    lowRiskLegs: 0,
    mediumRiskLegs: 0,
    highRiskLegs: 0,
    criticalRiskLegs: 0,
    overallRiskLevel: assessment.overallRiskLevel,
  };

  assessment.legs.forEach((leg) => {
    switch (leg.riskLevel) {
      case 'low':
        summary.lowRiskLegs++;
        break;
      case 'medium':
        summary.mediumRiskLegs++;
        break;
      case 'high':
        summary.highRiskLegs++;
        break;
      case 'critical':
        summary.criticalRiskLegs++;
        break;
    }
  });

  return summary;
}

/**
 * Validate if trip is suitable for travel based on risk assessment
 */
export function isTripSafeForTravel(assessment: TripAssessment): {
  safe: boolean;
  reason?: string;
} {
  // Critical risk destinations should require special approval
  if (assessment.overallRiskLevel === 'critical') {
    return {
      safe: false,
      reason: 'Trip involves critical risk destination - requires executive approval',
    };
  }

  // Multiple high-risk destinations is concerning
  const highRiskCount = assessment.legs.filter((l) => l.riskLevel === 'high').length;
  if (highRiskCount >= 2) {
    return {
      safe: false,
      reason: 'Multiple high-risk destinations - requires risk management review',
    };
  }

  return {
    safe: true,
  };
}
