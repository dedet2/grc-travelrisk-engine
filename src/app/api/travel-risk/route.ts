import { auth } from '@clerk/nextjs/server';
import { getAdvisoryClient } from '@/lib/travel-risk/advisory-client';
import { calculateTravelRiskScore } from '@/lib/travel-risk/scorer';
import { dataService } from '@/lib/supabase/data-service';
import type { ApiResponse, TravelRiskScore } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/travel-risk
 * Calculate travel risk score for a destination
 * Uses DataService to fetch travel advisories from Supabase (with fallback)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const body = await request.json();
    const { destination, countryCode } = body;

    if (!destination || !countryCode) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: destination, countryCode',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Try to fetch travel advisory from DataService (Supabase first, fallback gracefully)
    let advisory;
    try {
      advisory = await dataService.getTravelAdvisory(countryCode);
    } catch (error) {
      console.warn('Failed to fetch advisory from DataService, using client:', error);
      // Fallback to advisory client
      const advisoryClient = getAdvisoryClient();
      advisory = await advisoryClient.getAdvisory(countryCode);
    }

    // If no advisory from DataService, try the advisory client
    if (!advisory) {
      const advisoryClient = getAdvisoryClient();
      advisory = await advisoryClient.getAdvisory(countryCode);
    }

    // Calculate travel risk score
    const result = calculateTravelRiskScore(destination, advisory);

    const response: TravelRiskScore = {
      score: result.score,
      riskLevel: result.riskLevel,
      factors: [result.factors.advisoryLevel, ...result.factors.healthFactors],
    };

    return Response.json(
      {
        success: true,
        data: response,
        timestamp: new Date(),
      } as ApiResponse<TravelRiskScore>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating travel risk:', error);
    return Response.json(
      { success: false, error: 'Failed to calculate travel risk' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
