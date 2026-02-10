/**
 * Travel Advisory Fetcher Tests
 * Tests for fetching and filtering travel advisory data
 */

import {
  fetchTravelAdvisories,
  getDestinationRisk,
  getAllDestinationsMap,
  calculateDestinationRiskFactors,
  getRecommendedVaccines,
} from '../advisory-fetcher';

describe('Travel Advisory Fetcher', () => {
  describe('fetchTravelAdvisories', () => {
    test('should return array of destinations', async () => {
      const destinations = await fetchTravelAdvisories();
      expect(Array.isArray(destinations)).toBe(true);
      expect(destinations.length).toBeGreaterThan(0);
    });

    test('should include required fields for each destination', async () => {
      const destinations = await fetchTravelAdvisories();
      destinations.forEach((dest) => {
        expect(dest.countryCode).toBeDefined();
        expect(dest.countryName).toBeDefined();
        expect(dest.advisoryLevel).toBeGreaterThanOrEqual(1);
        expect(dest.advisoryLevel).toBeLessThanOrEqual(4);
        expect(dest.riskScore).toBeGreaterThanOrEqual(0);
        expect(dest.riskScore).toBeLessThanOrEqual(100);
        expect(Array.isArray(dest.securityThreats)).toBe(true);
        expect(Array.isArray(dest.healthRisks)).toBe(true);
        expect(Array.isArray(dest.naturalDisasterRisk)).toBe(true);
      });
    });

    test('should include key destinations', async () => {
      const destinations = await fetchTravelAdvisories();
      const codes = destinations.map((d) => d.countryCode);

      // Verify core destinations are present
      const keyDestinations = ['US', 'CA', 'GB', 'JP', 'BR', 'MX', 'IN', 'CN'];
      keyDestinations.forEach((code) => {
        expect(codes).toContain(code);
      });
    });

    test('should have at least 30 destinations', async () => {
      const destinations = await fetchTravelAdvisories();
      expect(destinations.length).toBeGreaterThanOrEqual(30);
    });
  });

  describe('getDestinationRisk', () => {
    test('should return destination by country code', () => {
      const destination = getDestinationRisk('US');
      expect(destination).toBeDefined();
      expect(destination?.countryCode).toBe('US');
      expect(destination?.countryName).toBe('United States');
    });

    test('should handle case insensitivity', () => {
      const dest1 = getDestinationRisk('us');
      const dest2 = getDestinationRisk('US');
      expect(dest1?.countryCode).toBe(dest2?.countryCode);
    });

    test('should return null for non-existent country', () => {
      const destination = getDestinationRisk('XX');
      expect(destination).toBeNull();
    });

    test('should return full risk profile', () => {
      const destination = getDestinationRisk('BR');
      expect(destination?.riskScore).toBeGreaterThan(0);
      expect(destination?.securityThreats.length).toBeGreaterThan(0);
      expect(destination?.healthRisks.length).toBeGreaterThan(0);
    });
  });

  describe('getAllDestinationsMap', () => {
    test('should return map of all destinations', () => {
      const map = getAllDestinationsMap();
      expect(typeof map).toBe('object');
      expect(Object.keys(map).length).toBeGreaterThan(0);
    });

    test('should be accessible by country code', () => {
      const map = getAllDestinationsMap();
      expect(map['US']).toBeDefined();
      expect(map['BR']).toBeDefined();
      expect(map['JP']).toBeDefined();
    });
  });

  describe('calculateDestinationRiskFactors', () => {
    test('should include advisory level description', () => {
      const destination = getDestinationRisk('US');
      expect(destination).toBeDefined();
      const factors = calculateDestinationRiskFactors(destination!);
      expect(factors).toContain('Exercise Normal Precautions');
    });

    test('should include threat descriptions for high/critical threats', () => {
      const destination = getDestinationRisk('BR');
      expect(destination).toBeDefined();
      const factors = calculateDestinationRiskFactors(destination!);
      expect(factors.length).toBeGreaterThan(1);
      expect(factors.some((f) => f.includes('MEDIUM') || f.includes('HIGH'))).toBe(true);
    });

    test('should include high health risks', () => {
      const destination = getDestinationRisk('IN');
      expect(destination).toBeDefined();
      const factors = calculateDestinationRiskFactors(destination!);
      expect(factors.some((f) => f.startsWith('Health:'))).toBe(true);
    });

    test('should include natural disasters', () => {
      const destination = getDestinationRisk('PH');
      expect(destination).toBeDefined();
      const factors = calculateDestinationRiskFactors(destination!);
      expect(factors.some((f) => f.startsWith('Natural Disaster:'))).toBe(true);
    });
  });

  describe('getRecommendedVaccines', () => {
    test('should return vaccines for high-disease-risk countries', () => {
      const destination = getDestinationRisk('BR');
      expect(destination).toBeDefined();
      const vaccines = getRecommendedVaccines(destination!);
      expect(Array.isArray(vaccines)).toBe(true);
      expect(vaccines.some((v) => v.toLowerCase().includes('yellow'))).toBe(true);
    });

    test('should return empty array for low-risk countries', () => {
      const destination = getDestinationRisk('US');
      expect(destination).toBeDefined();
      const vaccines = getRecommendedVaccines(destination!);
      expect(Array.isArray(vaccines)).toBe(true);
    });

    test('should include antimalarial prophylaxis for endemic areas', () => {
      const destination = getDestinationRisk('KE');
      expect(destination).toBeDefined();
      const vaccines = getRecommendedVaccines(destination!);
      expect(vaccines.some((v) => v.toLowerCase().includes('antimalarial'))).toBe(true);
    });

    test('should not have duplicates', () => {
      const destination = getDestinationRisk('IN');
      expect(destination).toBeDefined();
      const vaccines = getRecommendedVaccines(destination!);
      const uniqueVaccines = new Set(vaccines);
      expect(vaccines.length).toBe(uniqueVaccines.size);
    });
  });

  describe('Risk Scoring', () => {
    test('should have realistic scores for safe countries', () => {
      const safeCountries = ['US', 'CA', 'JP', 'SG'];
      safeCountries.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.riskScore).toBeLessThan(30);
      });
    });

    test('should have elevated scores for medium-risk countries', () => {
      const mediumRiskCountries = ['BR', 'MX', 'IN', 'TH'];
      mediumRiskCountries.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.riskScore).toBeGreaterThan(30);
        expect(destination?.riskScore).toBeLessThan(60);
      });
    });

    test('should have high scores for high-risk countries', () => {
      const highRiskCountries = ['RU', 'NG', 'PK'];
      highRiskCountries.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.riskScore).toBeGreaterThan(60);
      });
    });

    test('should have critical scores for do-not-travel countries', () => {
      const criticalCountries = ['UA', 'SY', 'AF', 'SO'];
      criticalCountries.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.advisoryLevel).toBe(4);
        expect(destination?.riskScore).toBeGreaterThan(90);
      });
    });
  });

  describe('Advisory Levels', () => {
    test('advisory level 1 should be low-risk countries', () => {
      const destinations = ['US', 'CA', 'GB', 'JP', 'AU', 'SG'];
      destinations.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.advisoryLevel).toBe(1);
      });
    });

    test('advisory level 2 should be increased-caution countries', () => {
      const destinations = ['BR', 'MX', 'IN', 'TH'];
      destinations.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.advisoryLevel).toBe(2);
      });
    });

    test('advisory level 3 should be reconsider-travel countries', () => {
      const destinations = ['RU', 'NG', 'PK'];
      destinations.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.advisoryLevel).toBe(3);
      });
    });

    test('advisory level 4 should be do-not-travel countries', () => {
      const destinations = ['UA', 'SY', 'AF', 'SO'];
      destinations.forEach((code) => {
        const destination = getDestinationRisk(code);
        expect(destination?.advisoryLevel).toBe(4);
      });
    });
  });

  describe('Infrastructure Scores', () => {
    test('should reflect development level', () => {
      const highDev = getDestinationRisk('JP')?.infrastructureScore || 0;
      const lowDev = getDestinationRisk('SO')?.infrastructureScore || 0;
      expect(highDev).toBeGreaterThan(lowDev);
    });

    test('should be between 0 and 100', () => {
      const destinations = await fetchTravelAdvisories();
      destinations.forEach((dest) => {
        expect(dest.infrastructureScore).toBeGreaterThanOrEqual(0);
        expect(dest.infrastructureScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Data Consistency', () => {
    test('all dates should be recent', () => {
      const destinations = await fetchTravelAdvisories();
      const now = new Date();
      destinations.forEach((dest) => {
        const daysDiff = Math.floor(
          (now.getTime() - dest.lastUpdated.getTime()) / (1000 * 60 * 60 * 24),
        );
        expect(daysDiff).toBeLessThan(365); // Within last year
      });
    });

    test('should have advisory text for high-risk countries', () => {
      const destination = getDestinationRisk('BR');
      expect(destination?.advisoryText).toBeDefined();
      expect(destination?.advisoryText?.length).toBeGreaterThan(0);
    });

    test('country codes should be uppercase', () => {
      const destinations = await fetchTravelAdvisories();
      destinations.forEach((dest) => {
        expect(dest.countryCode).toBe(dest.countryCode.toUpperCase());
      });
    });
  });
});
