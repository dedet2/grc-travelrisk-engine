import { auth } from '@clerk/nextjs/server';
import { getAdvisoryClient } from '@/lib/travel-risk/advisory-client';
import { calculateTravelRiskScore } from '@/lib/travel-risk/scorer';
import type { ApiResponse, TravelRiskScore } from '@/types';

export const dynamic = 'force-dynamic';

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

    // Fetch travel advisory
    const advisoryClient = getAdvisoryClient();
    const advisory = await advisoryClient.getAdvisory(countryCode);

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
