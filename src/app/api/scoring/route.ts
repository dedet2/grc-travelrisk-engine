import { auth } from '@clerk/nextjs/server';
import { calculateRiskScore } from '@/lib/scoring/engine';
import type { ApiResponse, RiskScore } from '@/types';

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
    const { assessmentId, frameworkId, controls } = body;

    if (!assessmentId || !frameworkId || !controls) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: assessmentId, frameworkId, controls',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Calculate risk score
    const scoringInput = {
      assessmentId,
      frameworkId,
      controls,
    };

    const result = calculateRiskScore(scoringInput);

    const response: RiskScore = {
      overall: result.overallScore,
      categories: Object.fromEntries(
        result.categoryScores.map((c) => [c.category, c.score])
      ),
      riskLevel: result.riskLevel,
      timestamp: result.timestamp,
    };

    return Response.json(
      {
        success: true,
        data: response,
        timestamp: new Date(),
      } as ApiResponse<RiskScore>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating risk score:', error);
    return Response.json(
      { success: false, error: 'Failed to calculate risk score' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
