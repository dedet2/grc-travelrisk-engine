/**
 * Email Triage API Routes
 * POST: Analyze and triage an email
 * GET: Get triage queue and metrics
 */

import { createEmailTriageAgent, type TriagedEmail, type TriageMetrics } from '@/lib/agents/email-triage-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/email-triage
 * Analyze an email and add it to the triage queue
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { from, subject, body: emailBody } = body;

    if (!from || !subject || !emailBody) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: from, subject, body',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createEmailTriageAgent();
    const analysis = await agent.analyzeEmail(from, subject, emailBody);

    return Response.json(
      {
        success: true,
        data: {
          from,
          subject,
          category: analysis.category,
          priority: analysis.priority,
          suggestedResponse: analysis.suggestedResponse,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error analyzing email:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze email',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/email-triage
 * Get triage queue and metrics
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const priority = url.searchParams.get('priority');
    const queueOnly = url.searchParams.get('queueOnly') === 'true';

    const agent = createEmailTriageAgent();

    // Run the agent to collect and process data
    const result = await agent.run();

    if (result.status !== 'completed') {
      throw new Error(result.error || 'Failed to generate triage metrics');
    }

    const metrics = inMemoryStore.getTriageMetrics();
    const allEmails = inMemoryStore.getTriagedEmails();

    let queue = agent.getTriageQueue();

    if (category) {
      queue = agent.getEmailsByCategory(category);
    }

    if (priority) {
      queue = agent.getEmailsByPriority(priority as any);
    }

    const data = queueOnly
      ? { queue, count: queue.length }
      : {
          queue,
          metrics,
          allEmails,
          count: queue.length,
          totalCount: allEmails.length,
          agentExecutionTime: result.latencyMs,
        };

    return Response.json(
      {
        success: true,
        data,
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching triage queue:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch triage queue',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
