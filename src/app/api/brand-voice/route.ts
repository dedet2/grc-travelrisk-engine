/**
 * Brand Voice API Routes
 * POST: Analyze content for brand consistency
 * GET: Retrieve brand voice metrics and analyses
 */

import { createBrandVoiceAgent, type ContentAnalysis } from '@/lib/agents/brand-voice-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/brand-voice
 * Analyze content for brand consistency
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { contentId, title, content, channel } = body;

    if (!contentId || !title || !content || !channel) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: contentId, title, content, channel',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createBrandVoiceAgent();
    const analysis = await agent.analyzeContent(contentId, title, content, channel);

    return Response.json(
      {
        success: true,
        data: analysis,
        timestamp: new Date(),
      } as ApiResponse<ContentAnalysis>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error analyzing content:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze content',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/brand-voice
 * Retrieve brand voice metrics and analyses
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'compliant', 'warning', 'non-compliant'
    const contentId = url.searchParams.get('contentId');

    const agent = createBrandVoiceAgent();

    // Run agent to update metrics
    await agent.run();
    const metrics = inMemoryStore.getBrandVoiceMetrics();

    let analyses = agent.getAnalyses();

    if (contentId) {
      const analysis = agent.getAnalysis(contentId);
      analyses = analysis ? [analysis] : [];
    } else if (status) {
      analyses = agent.getAnalysesByStatus(status as 'compliant' | 'warning' | 'non-compliant');
    }

    const guidelines = agent.getBrandGuidelines();

    return Response.json(
      {
        success: true,
        data: {
          analyses,
          metrics,
          guidelines,
          count: analyses.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        analyses: ContentAnalysis[];
        metrics?: any;
        guidelines: any;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching brand voice data:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch brand voice data',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
