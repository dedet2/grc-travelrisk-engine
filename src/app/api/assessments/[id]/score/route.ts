/**
 * Assessment Score API Route
 * GET: Return just the risk score for an assessment (lightweight dashboard polling)
 */

import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';

interface ScoreResponse {
  assessmentId: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  completionPercentage: number;
  lastUpdated: string;
}

/**
 * GET /api/assessments/[id]/score
 * Return just the risk score for dashboard polling
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

    // Fetch only the score fields we need
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('id, overallScore, updatedAt')
      .eq('id', assessmentId)
      .eq('userId', userId)
      .single();

    if (error || !assessment) {
      return Response.json(
        { success: false, error: 'Assessment not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Determine risk level from score
    const riskLevel = determineRiskLevel(assessment.overallScore);

    // For completion percentage, we need to count assessed responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('id')
      .eq('assessmentId', assessmentId);

    if (responsesError) {
      console.error('Error fetching responses:', responsesError);
      return Response.json(
        { success: false, error: 'Failed to fetch assessment' } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Get total control count for completion percentage
    const { data: assessmentData } = await supabase
      .from('assessments')
      .select('frameworks(controls(id))')
      .eq('id', assessmentId)
      .single();

    let completionPercentage = 0;
    if (assessmentData && responses) {
      // Simple estimate: responses count / estimated control count
      // For accurate calculation, would need framework controls count
      completionPercentage = Math.min(100, (responses.length / 50) * 100); // Assume ~50 controls per framework
    }

    const scoreResponse: ScoreResponse = {
      assessmentId,
      overallScore: assessment.overallScore,
      riskLevel,
      completionPercentage: Math.round(completionPercentage),
      lastUpdated: new Date(assessment.updatedAt).toISOString(),
    };

    return Response.json(
      {
        success: true,
        data: scoreResponse,
        timestamp: new Date(),
      } as ApiResponse<ScoreResponse>,
      {
        status: 200,
        headers: {
          'Cache-Control': 'max-age=60', // Cache for 60 seconds
        },
      }
    );
  } catch (error) {
    console.error('Error fetching assessment score:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch assessment score' } as ApiResponse<null>,
      { status: 500 }
    );
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
