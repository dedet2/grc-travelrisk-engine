/**
 * Content Calendar API Routes
 * POST: Create scheduled content
 * GET: List scheduled content with optional filtering
 */

import { createContentCalendarAgent, type ScheduledContent } from '@/lib/agents/content-calendar-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/content-calendar
 * Create new scheduled content
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { title, description, topic, channels, scheduledDate, contentType } = body;

    if (!title || !description || !topic || !channels || !scheduledDate || !contentType) {
      return Response.json(
        {
          success: false,
          error:
            'Missing required fields: title, description, topic, channels, scheduledDate, contentType',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createContentCalendarAgent();
    const content = await agent.createContent(
      title,
      description,
      topic,
      channels,
      new Date(scheduledDate),
      contentType
    );

    return Response.json(
      {
        success: true,
        data: content,
        timestamp: new Date(),
      } as ApiResponse<ScheduledContent>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating scheduled content:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create scheduled content',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/content-calendar
 * List scheduled content with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    const agent = createContentCalendarAgent();
    let content = agent.getScheduledContent();

    if (status) {
      content = agent.getContentByStatus(status);
    }

    // Run agent to update metrics
    await agent.run();
    const metrics = inMemoryStore.getContentCalendarMetrics();

    return Response.json(
      {
        success: true,
        data: {
          content,
          metrics,
          count: content.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        content: ScheduledContent[];
        metrics?: any;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching scheduled content:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scheduled content',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
