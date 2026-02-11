/**
 * Assessment Detail API Route
 * GET: Return specific assessment with full score breakdown
 */

import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { computeGRCScore } from '@/lib/scoring/risk-engine';
import type { ApiResponse, Control } from '@/types';
import type {
  AssessmentResponseInput,
  AssessmentResult,
  AssessmentResultWithMetrics,
} from '@/types/assessment';

/**
 * GET /api/assessments/[id]
 * Return specific assessment with full score breakdown
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const assessmentId = params.id;
    const supabase = await createServerSideClient();

    // Fetch assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('userId', userId)
      .single();

    if (assessmentError || !assessment) {
      return Response.json(
        { success: false, error: 'Assessment not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Fetch all controls for the framework
    const { data: controls, error: controlsError } = await supabase
      .from('controls')
      .select('*')
      .eq('frameworkId', assessment.frameworkId);

    if (controlsError || !controls) {
      return Response.json(
        { success: false, error: 'Failed to fetch controls' } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Fetch assessment responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessmentId', assessmentId);

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return Response.json(
        {
          success: false,
          error: 'Failed to fetch assessment responses',
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Convert responses to Map for scoring engine
    const responsesMap = new Map<string, AssessmentResponseInput>();
    if (responses && responses.length > 0) {
      for (const response of responses) {
        responsesMap.set(response.controlId, {
          controlId: response.controlId,
          status: response.response,
          notes: response.notes,
          evidence: response.evidence,
        });
      }
    }

    // Recompute score to get detailed breakdown
    const scoreResult = computeGRCScore(responsesMap, controls as Control[]);

    // Calculate additional metrics
    const metrics = {
      averageScore:
        scoreResult.categoryScores.length > 0
          ? Math.round(
              scoreResult.categoryScores.reduce((sum, cat) => sum + cat.score, 0) /
                scoreResult.categoryScores.length
            )
          : 0,
      highestRiskCategory:
        scoreResult.categoryScores.length > 0
          ? scoreResult.categoryScores.reduce((max, cat) =>
              cat.score > max.score ? cat : max
            ).category
          : 'N/A',
      lowestRiskCategory:
        scoreResult.categoryScores.length > 0
          ? scoreResult.categoryScores.reduce((min, cat) =>
              cat.score < min.score ? cat : min
            ).category
          : 'N/A',
      criticalFindingsCount: scoreResult.keyFindings.filter(
        (f) => f.criticality === 'critical'
      ).length,
      highFindingsCount: scoreResult.keyFindings.filter(
        (f) => f.criticality === 'high'
      ).length,
    };

    const resultWithMetrics: AssessmentResultWithMetrics = {
      ...scoreResult,
      assessmentId,
      metrics,
    };

    return Response.json(
      {
        success: true,
        data: {
          assessment,
          scoreBreakdown: resultWithMetrics,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        assessment: typeof assessment;
        scoreBreakdown: AssessmentResultWithMetrics;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch assessment' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
