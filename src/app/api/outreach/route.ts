/**
 * Outreach API Routes
 * POST: Create a new outreach sequence
 * GET: List all outreach sequences
 */

import { createOutreachAutomationAgent, type OutreachSequence } from '@/lib/agents/outreach-automation-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/outreach
 * Create a new outreach sequence
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { leadId, companyName, templateName, recipientEmail, recipientName, industry } = body;

    if (!leadId || !companyName || !templateName || !recipientEmail || !recipientName || !industry) {
      return Response.json(
        {
          success: false,
          error:
            'Missing required fields: leadId, companyName, templateName, recipientEmail, recipientName, industry',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createOutreachAutomationAgent();
    const sequence = await agent.createSequence(
      leadId,
      companyName,
      templateName,
      recipientEmail,
      recipientName,
      industry
    );

    return Response.json(
      {
        success: true,
        data: sequence,
        timestamp: new Date(),
      } as ApiResponse<OutreachSequence>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating outreach sequence:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create outreach sequence',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/outreach
 * List all outreach sequences with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const leadId = url.searchParams.get('leadId');

    const agent = createOutreachAutomationAgent();
    let sequences = agent.getSequences();

    if (status) {
      sequences = agent.getSequencesByStatus(status as any);
    }

    if (leadId) {
      sequences = agent.getSequencesByLead(leadId);
    }

    // Run agent to update metrics
    await agent.run();
    const metrics = inMemoryStore.getOutreachMetrics();

    return Response.json(
      {
        success: true,
        data: {
          sequences,
          metrics,
          count: sequences.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        sequences: OutreachSequence[];
        metrics?: any;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching outreach sequences:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch outreach sequences',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
