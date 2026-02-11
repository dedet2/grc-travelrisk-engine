/**
 * SEO Intelligence API Routes
 * POST: Add keyword or update ranking
 * GET: Retrieve SEO metrics and keyword rankings
 */

import { createSEOIntelligenceAgent, type KeywordRanking } from '@/lib/agents/seo-intelligence-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/seo
 * Add or update keyword ranking
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { keyword, currentRank, searchVolume, difficulty, url } = body;

    if (!keyword) {
      return Response.json(
        {
          success: false,
          error: 'Missing required field: keyword',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createSEOIntelligenceAgent();
    let result: KeywordRanking | null = null;

    if (currentRank !== undefined) {
      result = await agent.updateKeywordRanking(keyword, currentRank);
    } else if (searchVolume !== undefined && difficulty !== undefined && url) {
      result = await agent.addKeyword(keyword, searchVolume, difficulty, url);
    }

    if (!result) {
      return Response.json(
        {
          success: false,
          error: 'Failed to update keyword ranking',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        data: result,
        timestamp: new Date(),
      } as ApiResponse<KeywordRanking>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error updating keyword ranking:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update keyword ranking',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/seo
 * Retrieve SEO metrics and keyword rankings
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const topOnly = url.searchParams.get('topOnly') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const agent = createSEOIntelligenceAgent();

    // Run agent to update metrics
    await agent.run();
    const metrics = inMemoryStore.getSEOMetrics();

    let keywords = agent.getKeywords();
    if (topOnly) {
      keywords = agent.getTopRankingKeywords(limit);
    }

    return Response.json(
      {
        success: true,
        data: {
          keywords,
          metrics,
          count: keywords.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        keywords: KeywordRanking[];
        metrics?: any;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch SEO data',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
