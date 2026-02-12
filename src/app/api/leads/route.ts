/**
 * Leads API Routes
 * POST: Create a new lead
 * GET: List all leads with optional filtering
 */

import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// Mock leads for immediate response (no agent calls)
const mockLeads = [
  {
    leadId: 'lead-001',
    companyName: 'CloudTech Solutions',
    industry: 'Technology',
    companySize: 'medium' as const,
    contactEmail: 'sales@cloudtech.io',
    contactName: 'John Smith',
    revenue: 5000000,
    employees: 150,
    website: 'https://cloudtech.io',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    score: 85,
    icpFit: 90,
    industrySuitability: 85,
    sizeMatch: 80,
    stage: 'hot' as const,
    scoredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    leadId: 'lead-002',
    companyName: 'FinServ Corp',
    industry: 'Finance',
    companySize: 'enterprise' as const,
    contactEmail: 'contact@finserv.com',
    contactName: 'Sarah Johnson',
    revenue: 500000000,
    employees: 5000,
    website: 'https://finserv.com',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    score: 92,
    icpFit: 95,
    industrySuitability: 90,
    sizeMatch: 90,
    stage: 'qualified' as const,
    scoredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

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

    // Create a mock scored lead directly without async operations
    const lead = {
      leadId: `lead-${Date.now()}`,
      companyName,
      industry,
      companySize: companySize as 'startup' | 'small' | 'medium' | 'enterprise',
      contactEmail,
      contactName,
      revenue,
      employees,
      website,
      createdAt: new Date(),
      updatedAt: new Date(),
      score: Math.floor(Math.random() * 30 + 70), // Random 70-100
      icpFit: Math.floor(Math.random() * 30 + 70),
      industrySuitability: Math.floor(Math.random() * 30 + 70),
      sizeMatch: Math.floor(Math.random() * 30 + 70),
      stage: 'cold' as const,
      scoredAt: new Date(),
    };

    return Response.json(
      {
        success: true,
        data: lead,
        timestamp: new Date(),
      } as ApiResponse<any>,
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

    // Start with mock leads
    let leads = [...mockLeads];

    // Apply filters
    if (stage) {
      leads = leads.filter((l) => l.stage === stage);
    }

    if (industry) {
      leads = leads.filter((l) => l.industry === industry);
    }

    if (minScore) {
      const score = parseInt(minScore, 10);
      leads = leads.filter((l) => l.score >= score);
    }

    // Generate mock metrics from leads
    const metrics = {
      totalLeads: leads.length,
      coldLeads: leads.filter((l) => l.stage === 'cold').length,
      warmLeads: leads.filter((l) => l.stage === 'warm').length,
      hotLeads: leads.filter((l) => l.stage === 'hot').length,
      qualifiedLeads: leads.filter((l) => l.stage === 'qualified').length,
      nurtureCampaignLeads: leads.filter((l) => l.stage === 'nurture').length,
      averageScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
      conversionRate: leads.length > 0 ? (leads.filter((l) => l.stage === 'qualified').length / leads.length) * 100 : 0,
      topIndustries: Array.from(
        new Map(leads.map((l) => [l.industry, (leads.filter((x) => x.industry === l.industry).length)])).entries()
      ).map(([industry, count]) => ({ industry, count })),
      topCompanySizes: Array.from(
        new Map(leads.map((l) => [l.companySize, (leads.filter((x) => x.companySize === l.companySize).length)])).entries()
      ).map(([size, count]) => ({ size, count })),
      timestamp: new Date(),
    };

    return Response.json(
      {
        success: true,
        data: {
          leads,
          metrics,
          count: leads.length,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
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
