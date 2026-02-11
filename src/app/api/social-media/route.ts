/**
 * Social Media API Routes
 * POST: Create social post or add mention
 * GET: Retrieve social media metrics and posts
 */

import { createSocialMediaAgent, type SocialPost, type SocialMention } from '@/lib/agents/social-media-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/social-media
 * Create social post or add mention
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { action, platform, content, contentType, author, sentiment } = body;

    if (!action || !platform || !content) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: action, platform, content',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createSocialMediaAgent();
    let result: SocialPost | SocialMention | null = null;

    if (action === 'post' && contentType) {
      result = await agent.createPost(
        platform as 'twitter' | 'linkedin' | 'facebook' | 'instagram',
        content,
        contentType
      );
    } else if (action === 'mention' && author && sentiment) {
      result = await agent.addMention(platform, author, content, sentiment);
    }

    if (!result) {
      return Response.json(
        {
          success: false,
          error: 'Invalid action or missing required fields',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        data: result,
        timestamp: new Date(),
      } as ApiResponse<SocialPost | SocialMention>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating social media content:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create social media content',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/social-media
 * Retrieve social media metrics and posts
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const platform = url.searchParams.get('platform');
    const type = url.searchParams.get('type'); // 'posts' or 'mentions'

    const agent = createSocialMediaAgent();

    // Run agent to update metrics
    await agent.run();
    const metrics = inMemoryStore.getSocialMediaMetrics();

    let posts = agent.getPosts();
    if (platform) {
      posts = agent.getPostsByPlatform(platform);
    }

    const mentions = agent.getMentions();

    return Response.json(
      {
        success: true,
        data: {
          posts: type === 'mentions' ? undefined : posts,
          mentions: type === 'posts' ? undefined : mentions,
          metrics,
          postsCount: posts.length,
          mentionsCount: mentions.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        posts?: any[];
        mentions?: any[];
        metrics?: any;
        postsCount: number;
        mentionsCount: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching social media data:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch social media data',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
