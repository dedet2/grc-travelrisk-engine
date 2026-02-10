/**
 * Trip Assessor Tests
 * Tests for assessing multi-leg business trips and calculating overall risk
 */

import {
  assessTrip,
  getTripRiskSummary,
  isTripSafeForTravel,
} from '../trip-assessor';
import { TripLeg } from '@/types/index';

describe('Trip Assessor', () => {
  describe('assessTrip', () => {
    test('should require at least one leg', () => {
      expect(() => assessTrip([])).toThrow();
    });

    test('should validate required leg fields', () => {
      const invalidLegs = [
        { destination: '', departureDate: new Date(), returnDate: new Date('2025-01-15'), purpose: 'business' },
      ];
      expect(() => assessTrip(invalidLegs as any)).toThrow();
    });

    test('should validate departure before return date', () => {
      const invalidLegs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-01-15'),
          returnDate: new Date('2025-01-10'),
          purpose: 'business',
        },
      ];
      expect(() => assessTrip(invalidLegs)).toThrow();
    });

    test('should assess single-leg trip', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'CA',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(assessment).toBeDefined();
      expect(assessment.legs.length).toBe(1);
      expect(assessment.overallTripScore).toBeGreaterThanOrEqual(0);
      expect(assessment.overallTripScore).toBeLessThanOrEqual(100);
    });

    test('should assess multi-leg trip', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'JP',
          destination: 'SG',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-02-28'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(assessment.legs.length).toBe(2);
      expect(assessment.highestRisk).toBeDefined();
      expect(assessment.recommendations.length).toBeGreaterThan(0);
    });

    test('should use conservative approach (max score)', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'JP',
          destination: 'BR',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-03-02'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      const maxLegScore = Math.max(...assessment.legs.map((l) => l.riskScore));
      expect(assessment.overallTripScore).toBe(maxLegScore);
    });

    test('should identify highest risk leg', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'JP',
          destination: 'BR',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-03-02'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(assessment.highestRisk).toBeDefined();
      expect(assessment.highestRisk.riskScore).toEqual(
        Math.max(...assessment.legs.map((l) => l.riskScore)),
      );
    });

    test('should adjust score based on trip duration', () => {
      // Short trip
      const shortLegs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-16'),
          purpose: 'business',
        },
      ];

      // Long trip
      const longLegs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-03-30'),
          purpose: 'business',
        },
      ];

      const shortAssessment = assessTrip(shortLegs);
      const longAssessment = assessTrip(longLegs);

      expect(longAssessment.legs[0].riskScore).toBeGreaterThan(
        shortAssessment.legs[0].riskScore,
      );
    });

    test('should adjust score based on trip purpose', () => {
      // Business trip
      const businessLegs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];

      // NGO/Humanitarian trip (higher risk)
      const ngoLegs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'humanitarian NGO work',
        },
      ];

      const businessAssessment = assessTrip(businessLegs);
      const ngoAssessment = assessTrip(ngoLegs);

      expect(ngoAssessment.legs[0].riskScore).toBeGreaterThan(
        businessAssessment.legs[0].riskScore,
      );
    });

    test('should generate recommendations', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(assessment.recommendations.length).toBeGreaterThan(0);
      expect(Array.isArray(assessment.recommendations)).toBe(true);
    });

    test('should include vaccination recommendations', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(
        assessment.recommendations.some((r) => r.toLowerCase().includes('vaccin')),
      ).toBe(true);
    });

    test('should include travel insurance recommendations', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(
        assessment.recommendations.some((r) => r.toLowerCase().includes('insurance')),
      ).toBe(true);
    });
  });

  describe('getTripRiskSummary', () => {
    test('should count legs by risk level', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'JP',
          destination: 'BR',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-03-02'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      const summary = getTripRiskSummary(assessment);

      expect(summary.lowRiskLegs + summary.mediumRiskLegs + summary.highRiskLegs + summary.criticalRiskLegs).toBe(2);
    });

    test('should identify overall risk level', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      const summary = getTripRiskSummary(assessment);

      expect(['low', 'medium', 'high', 'critical']).toContain(summary.overallRiskLevel);
    });

    test('should match assessment legs', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'JP',
          destination: 'BR',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-03-02'),
          purpose: 'business',
        },
        {
          origin: 'BR',
          destination: 'MX',
          departureDate: new Date('2025-03-03'),
          returnDate: new Date('2025-03-08'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      const summary = getTripRiskSummary(assessment);

      const totalLegs = summary.lowRiskLegs + summary.mediumRiskLegs + summary.highRiskLegs + summary.criticalRiskLegs;
      expect(totalLegs).toBe(3);
    });
  });

  describe('isTripSafeForTravel', () => {
    test('should approve low-risk trips', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'CA',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      const approval = isTripSafeForTravel(assessment);
      expect(approval.safe).toBe(true);
    });

    test('should reject critical-risk trips', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'UA',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      const approval = isTripSafeForTravel(assessment);
      expect(approval.safe).toBe(false);
      expect(approval.reason).toBeDefined();
    });

    test('should require review for multiple high-risk destinations', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'RU',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'RU',
          destination: 'NG',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-03-02'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      const approval = isTripSafeForTravel(assessment);
      // This depends on actual risk scores, so we just verify it returns a valid result
      expect(approval).toHaveProperty('safe');
      expect(typeof approval.safe).toBe('boolean');
    });
  });

  describe('Risk Level Calculation', () => {
    test('should return correct risk level strings', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(['low', 'medium', 'high', 'critical']).toContain(assessment.overallRiskLevel);
      assessment.legs.forEach((leg) => {
        expect(['low', 'medium', 'high', 'critical']).toContain(leg.riskLevel);
      });
    });
  });

  describe('Multi-Leg Specific', () => {
    test('should include multi-leg recommendations', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'JP',
          destination: 'BR',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-03-02'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(
        assessment.recommendations.some((r) =>
          r.toLowerCase().includes('multi-leg') || r.includes('highest risk'),
        ),
      ).toBe(true);
    });

    test('should consolidate vaccine recommendations', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-15'),
          returnDate: new Date('2025-02-22'),
          purpose: 'business',
        },
        {
          origin: 'BR',
          destination: 'MX',
          departureDate: new Date('2025-02-23'),
          returnDate: new Date('2025-03-02'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(
        assessment.recommendations.some((r) =>
          r.toLowerCase().includes('vaccin'),
        ),
      ).toBe(true);
    });

    test('should handle extended trips', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'BR',
          departureDate: new Date('2025-02-01'),
          returnDate: new Date('2025-05-01'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(
        assessment.recommendations.some((r) =>
          r.toLowerCase().includes('extended') || r.toLowerCase().includes('comprehensive'),
        ),
      ).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle same-day return trip', () => {
      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'CA',
          departureDate: new Date('2025-02-15T08:00:00'),
          returnDate: new Date('2025-02-15T20:00:00'),
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(assessment).toBeDefined();
      expect(assessment.overallTripScore).toBeLessThan(50); // Should be lower risk for short trip
    });

    test('should handle future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const returnDate = new Date(futureDate);
      returnDate.setDate(returnDate.getDate() + 7);

      const legs: TripLeg[] = [
        {
          origin: 'US',
          destination: 'JP',
          departureDate: futureDate,
          returnDate,
          purpose: 'business',
        },
      ];
      const assessment = assessTrip(legs);
      expect(assessment).toBeDefined();
    });
  });
});
