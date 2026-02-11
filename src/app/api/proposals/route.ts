/**
 * Proposals API Routes
 * POST: Create a new proposal
 * GET: List all proposals with optional filtering
 */

import { createProposalGeneratorAgent, type ProposalDocument } from '@/lib/agents/proposal-generator-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/proposals
 * Create a new proposal
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { dealId, companyName, companyId, contactName, contactEmail, templateName } = body;

    if (!dealId || !companyName || !companyId || !contactName || !contactEmail || !templateName) {
      return Response.json(
        {
          success: false,
          error:
            'Missing required fields: dealId, companyName, companyId, contactName, contactEmail, templateName',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createProposalGeneratorAgent();
    const proposal = await agent.generateProposal(
      dealId,
      companyName,
      companyId,
      contactName,
      contactEmail,
      templateName
    );

    return Response.json(
      {
        success: true,
        data: proposal,
        timestamp: new Date(),
      } as ApiResponse<ProposalDocument>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating proposal:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create proposal',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/proposals
 * List all proposals with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const dealId = url.searchParams.get('dealId');

    const agent = createProposalGeneratorAgent();
    let proposals = agent.getProposals();

    if (status) {
      proposals = agent.getProposalsByStatus(status as any);
    }

    if (dealId) {
      proposals = agent.getProposalsByDeal(dealId);
    }

    // Run agent to update metrics
    await agent.run();
    const metrics = inMemoryStore.getProposalMetrics();

    return Response.json(
      {
        success: true,
        data: {
          proposals,
          metrics,
          count: proposals.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        proposals: ProposalDocument[];
        metrics?: any;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch proposals',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
