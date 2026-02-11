import { NextRequest, NextResponse } from 'next/server';
import { assessTrip, getTripRiskSummary, isTripSafeForTravel } from '@/lib/travel/trip-assessor';
import { TripLeg, TripAssessment, ApiResponse } from '@/types/index';

export const dynamic = 'force-dynamic';

interface TripAssessmentRequest {
  legs: TripLeg[];
}

interface TripAssessmentResponse extends TripAssessment {
  riskSummary: {
    lowRiskLegs: number;
    mediumRiskLegs: number;
    highRiskLegs: number;
    criticalRiskLegs: number;
    overallRiskLevel: string;
  };
  travelApprovalStatus: {
    safe: boolean;
    reason?: string;
  };
}

// In-memory storage for demo purposes (in production, use database)
const tripAssessmentHistory: Map<string, TripAssessmentResponse> = new Map();

/**
 * POST /api/travel/trips
 * Submit trip assessment request with array of legs
 * Request body should include legs array with:
 *   - origin: departure location
 *   - destination: country code or name
 *   - departureDate: ISO date string
 *   - returnDate: ISO date string
 *   - purpose: trip purpose (business, tourism, etc.)
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<TripAssessmentResponse>>> {
  try {
    const body = (await request.json()) as TripAssessmentRequest;

    // Validate request
    if (!body.legs || !Array.isArray(body.legs)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request must include legs array',
          timestamp: new Date(),
        },
        { status: 400 },
      );
    }

    if (body.legs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one trip leg is required',
          timestamp: new Date(),
        },
        { status: 400 },
      );
    }

    // Convert date strings to Date objects
    const processedLegs: TripLeg[] = body.legs.map((leg) => ({
      ...leg,
      departureDate: new Date(leg.departureDate),
      returnDate: new Date(leg.returnDate),
    }));

    // Validate legs
    for (let i = 0; i < processedLegs.length; i++) {
      const leg = processedLegs[i];
      if (!leg.destination) {
        return NextResponse.json(
          {
            success: false,
            error: `Leg ${i + 1}: destination is required`,
            timestamp: new Date(),
          },
          { status: 400 },
        );
      }

      if (!leg.departureDate || !leg.returnDate) {
        return NextResponse.json(
          {
            success: false,
            error: `Leg ${i + 1}: departureDate and returnDate are required`,
            timestamp: new Date(),
          },
          { status: 400 },
        );
      }

      if (isNaN(leg.departureDate.getTime()) || isNaN(leg.returnDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: `Leg ${i + 1}: invalid date format. Use ISO 8601 format (YYYY-MM-DD)`,
            timestamp: new Date(),
          },
          { status: 400 },
        );
      }

      if (leg.departureDate >= leg.returnDate) {
        return NextResponse.json(
          {
            success: false,
            error: `Leg ${i + 1}: departureDate must be before returnDate`,
            timestamp: new Date(),
          },
          { status: 400 },
        );
      }

      if (!leg.purpose) {
        return NextResponse.json(
          {
            success: false,
            error: `Leg ${i + 1}: purpose is required`,
            timestamp: new Date(),
          },
          { status: 400 },
        );
      }
    }

    // Assess trip
    const assessment = assessTrip(processedLegs);

    // Get risk summary and approval status
    const riskSummary = getTripRiskSummary(assessment);
    const travelApprovalStatus = isTripSafeForTravel(assessment);

    // Create response
    const response: TripAssessmentResponse = {
      ...assessment,
      riskSummary,
      travelApprovalStatus,
    };

    // Store in history with generated ID
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const storedAssessment = { ...response, tripId };
    tripAssessmentHistory.set(tripId, storedAssessment);

    return NextResponse.json({
      success: true,
      data: storedAssessment,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error assessing trip:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assess trip',
        timestamp: new Date(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/travel/trips
 * List previous trip assessments
 * In production, this would fetch from a database
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<(TripAssessmentResponse & { tripId: string })[]>>> {
  try {
    // Get optional limit parameter
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '50', 10),
      100,
    );

    // Return stored assessments in reverse order (most recent first)
    const assessments = Array.from(tripAssessmentHistory.values()).reverse().slice(0, limit);

    return NextResponse.json({
      success: true,
      data: assessments,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error retrieving trip assessments:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve trip assessments',
        timestamp: new Date(),
        data: [],
      },
      { status: 500 },
    );
  }
}
