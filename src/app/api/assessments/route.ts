/**
 * Assessment API Routes
 * POST: Submit assessment responses and compute risk score
 * GET: List all assessments for authenticated user's organization
 */

import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
import { computeGRCScore, validateAssessmentResponses } from '@/lib/scoring/risk-engine';
import type { Assessment, Control, ApiResponse } from '@/types';
import type {
  AssessmentResponseInput,
  AssessmentResult,
} from '@/types/assessment';

/**
 * POST /api/assessments
 * Submit assessment responses and compute risk score
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
    const {
      frameworkId,
      name,
      responses,
    }: {
      frameworkId: string;
      name?: string;
      responses: Array<{
        controlId: string;
        status: string;
        notes?: string;
        evidence?: string;
      }>;
    } = body;

    // Validate required fields
    if (!frameworkId || !responses || !Array.isArray(responses)) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: frameworkId, responses',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (responses.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'At least one assessment response is required',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const supabase = await createServerSideClient();

    // Fetch framework and controls
    const { data: framework, error: frameworkError } = await supabase
      .from('frameworks')
      .select('id, name')
      .eq('id', frameworkId)
      .single();

    if (frameworkError || !framework) {
      return Response.json(
        { success: false, error: 'Framework not found' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const { data: controls, error: controlsError } = await supabase
      .from('controls')
      .select('*')
      .eq('frameworkId', frameworkId);

    if (controlsError || !controls) {
      return Response.json(
        { success: false, error: 'Failed to fetch controls' } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Convert responses array to Map for processing
    const responsesMap = new Map<string, AssessmentResponseInput>();
    for (const response of responses) {
      if (!response.controlId) {
        return Response.json(
          { success: false, error: 'Each response must include controlId' } as ApiResponse<null>,
          { status: 400 }
        );
      }
      responsesMap.set(response.controlId, {
        controlId: response.controlId,
        status: response.status,
        notes: response.notes,
        evidence: response.evidence,
      });
    }

    // Validate all control IDs exist
    const validation = validateAssessmentResponses(responsesMap, controls as Control[]);
    if (!validation.valid) {
      return Response.json(
        {
          success: false,
          error: `Invalid control IDs: ${validation.errors.join(', ')}`,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Compute GRC score
    const scoreResult = computeGRCScore(responsesMap, controls as Control[]);

    // Create assessment record in database
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        userId,
        frameworkId,
        name: name || `${framework.name} Assessment - ${new Date().toLocaleDateString()}`,
        status: 'completed',
        overallScore: scoreResult.overallScore,
      })
      .select()
      .single();

    if (assessmentError || !assessment) {
      console.error('Error creating assessment:', assessmentError);
      return Response.json(
        { success: false, error: 'Failed to create assessment record' } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Store individual assessment responses
    const responsesToInsert = responses.map((response) => ({
      assessmentId: assessment.id,
      controlId: response.controlId,
      response: response.status,
      evidence: response.evidence,
      notes: response.notes,
      score: 0, // Score handled at assessment level
    }));

    const { error: responsesInsertError } = await supabase
      .from('assessment_responses')
      .insert(responsesToInsert);

    if (responsesInsertError) {
      console.error('Error storing responses:', responsesInsertError);
      // Assessment was created but responses failed - still return success
      // The score is already stored in the assessment
    }

    // Return the complete result
    const resultWithId: AssessmentResult = {
      ...scoreResult,
      assessmentId: assessment.id,
    };

    return Response.json(
      {
        success: true,
        data: resultWithId,
        timestamp: new Date(),
      } as ApiResponse<AssessmentResult>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return Response.json(
      { success: false, error: 'Failed to submit assessment' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/assessments
 * List all assessments for authenticated user's organization
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const supabase = await createServerSideClient();

    // Get query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const frameworkId = searchParams.get('frameworkId');
    const status = searchParams.get('status');

    let query = supabase
      .from('assessments')
      .select('*, frameworks(name)', { count: 'exact' })
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (frameworkId) {
      query = query.eq('frameworkId', frameworkId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: assessments, error, count } = await query;

    if (error) {
      console.error('Error fetching assessments:', error);
      return Response.json(
        { success: false, error: 'Failed to fetch assessments' } as ApiResponse<null>,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: {
          assessments,
          pagination: {
            total: count || 0,
            limit,
            offset,
            hasMore: (offset + limit) < (count || 0),
          },
        },
        timestamp: new Date(),
      } as ApiResponse<{
        assessments: Assessment[];
        pagination: {
          total: number;
          limit: number;
          offset: number;
          hasMore: boolean;
        };
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch assessments' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
