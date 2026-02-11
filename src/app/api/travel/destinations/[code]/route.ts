import { NextRequest, NextResponse } from 'next/server';
import { getDestinationRisk, calculateDestinationRiskFactors, getRecommendedVaccines } from '@/lib/travel/advisory-fetcher';
import { TravelDestination, ApiResponse } from '@/types/index';

export const dynamic = 'force-dynamic';

interface DestinationResponse extends TravelDestination {
  riskFactors: string[];
  recommendedVaccines: string[];
}

/**
 * GET /api/travel/destinations/[code]
 * Get detailed risk profile for a specific country
 * @param code ISO 3166-1 alpha-2 country code (e.g., US, BR, JP)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } },
): Promise<NextResponse<ApiResponse<DestinationResponse | null>>> {
  try {
    const { code } = params;

    if (!code || code.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid country code. Must be a 2-letter ISO code (e.g., US, BR)',
          timestamp: new Date(),
        },
        { status: 400 },
      );
    }

    // Get destination risk profile
    const destination = getDestinationRisk(code);

    if (!destination) {
      return NextResponse.json(
        {
          success: false,
          error: `No travel advisory data found for country code: ${code.toUpperCase()}`,
          timestamp: new Date(),
          data: null,
        },
        { status: 404 },
      );
    }

    // Calculate risk factors and vaccines
    const riskFactors = calculateDestinationRiskFactors(destination);
    const recommendedVaccines = getRecommendedVaccines(destination);

    // Construct response with additional analysis
    const response: DestinationResponse = {
      ...destination,
      riskFactors,
      recommendedVaccines,
    };

    return NextResponse.json({
      success: true,
      data: response,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching destination:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch destination details',
        timestamp: new Date(),
        data: null,
      },
      { status: 500 },
    );
  }
}
