/**
 * Leads API Routes
 * POST: Create a new lead
 * GET: List all leads with optional filtering
 */

import { createLeadScoringAgent, type ScoredLead } from '@/lib/agents/lead-scoring-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads
 * Create a new lead
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { companyName, industry, companySize, contactEmail, contactName, revenue, employees, website } = body;

    if (!companyName || !industry || !companySize || !contactEmail || !contactName) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: companyName, industry, companySize, contactEmail, contactName',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createLeadScoringAgent();
    const lead = await agent.createLead({
      companyName,
      industry,
      companySize,
      contactEmail,
      contactName,
      revenue,
      employees,
      website,
    });

    return Response.json(
      {
        success: true,
        data: lead,
        timestamp: new Date(),
      } as ApiResponse<ScoredLead>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create lead',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads
 * List all leads with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage');
    const industry = url.searchParams.get('industry');
    const minScore = url.searchParams.get('minScore');

    const agent = createLeadScoringAgent();
    let leads = agent.getLeads();

    if (stage) {
      leads = agent.getLeadsByStage(stage as any);
    }

    if (industry) {
      leads = agent.getLeadsByIndustry(industry);
    }

    if (minScore) {
      const score = parseInt(minScore, 10);
      leads = agent.getLeadsAboveScore(score);
    }

    // Run agent to update metrics
    await agent.run();
    const metrics = inMemoryStore.getLeadPipelineMetrics();

    return Response.json(
      {
        success: true,
        data: {
          leads,
          metrics,
          count: leads.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        leads: ScoredLead[];
        metrics?: any;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching leads:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leads',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
