/**
 * Roadmap API
 *
 * Returns quarterly roadmap and OKR tracking data
 * Based on Incluu Q3/Q4 Airtable Roadmap Tracker
 */

export const dynamic = 'force-dynamic';

export interface RoadmapMonth {
  month: string;
  focus: string;
  keyActions: string;
  metricTargets: string;
  status: 'planned' | 'in-progress' | 'completed';
  completionPercent?: number;
  notes?: string;
}

export interface RoadmapQuarter {
  quarter: string;
  months: RoadmapMonth[];
  okrs: Array<{
    objective: string;
    keyResults: string[];
    owner?: string;
    status: 'not-started' | 'in-progress' | 'at-risk' | 'complete';
  }>;
}

const roadmapData: RoadmapQuarter[] = [
  {
    quarter: 'Q3 (July - September)',
    months: [
      {
        month: 'Month 7 (July)',
        focus: 'Launch retainer offerings, build landing page, outreach to past clients',
        keyActions:
          'Launch retainer page; email past clients; announce on LinkedIn',
        metricTargets: 'Retainer funnel launched',
        status: 'in-progress',
        completionPercent: 65,
        notes: 'Landing page design in review, past client list compiled',
      },
      {
        month: 'Month 8 (August)',
        focus: 'Secure 2-3 retainer clients, maintain workshop/consulting cadence',
        keyActions: 'Close 2-3 retainers; maintain keynotes/workshops',
        metricTargets: '2-3 retainers closed',
        status: 'planned',
        completionPercent: 0,
      },
      {
        month: 'Month 9 (September)',
        focus: 'System audit, refine all agents for reduced manual input',
        keyActions: 'Run agent workflow audit; refine prompts and automations',
        metricTargets: 'Agent workflows optimized',
        status: 'planned',
        completionPercent: 0,
      },
    ],
    okrs: [
      {
        objective: 'Launch Retainer Business Model',
        keyResults: [
          'Create retainer landing page and value prop',
          'Convert 3+ past clients into retainer agreements',
          'Establish recurring revenue baseline of $5k/month',
        ],
        owner: 'Dr. Dédé',
        status: 'in-progress',
      },
      {
        objective: 'Optimize Agent System Efficiency',
        keyResults: [
          'Reduce manual workflow interventions by 40%',
          'Document 10+ agent workflows',
          'Build agent performance dashboard',
        ],
        owner: 'Operations',
        status: 'not-started',
      },
      {
        objective: 'Expand Speaking & Authority',
        keyResults: [
          'Deliver 3+ keynotes/workshops',
          'Generate 50+ qualified leads from speaking',
          'Establish thought leadership presence',
        ],
        owner: 'Dr. Dédé',
        status: 'in-progress',
      },
    ],
  },
  {
    quarter: 'Q4 (October - December)',
    months: [
      {
        month: 'Month 10 (October)',
        focus: 'Document SOPs for VA or ops assistant delegation',
        keyActions: 'Record SOPs; draft delegation plans',
        metricTargets: 'SOP library created',
        status: 'planned',
        completionPercent: 0,
      },
      {
        month: 'Month 11 (November)',
        focus: 'Prepare licensing evergreen funnel for year-end push',
        keyActions: 'Prepare licensing funnel; marketing push',
        metricTargets: 'Licensing funnel live',
        status: 'planned',
        completionPercent: 0,
      },
      {
        month: 'Month 12 (December)',
        focus: 'Q4 revenue review and system recalibration for Year 2',
        keyActions: 'Full review; refine dashboards; adjust for Year 2 scaling',
        metricTargets: 'Year-end system recalibration complete',
        status: 'planned',
        completionPercent: 0,
      },
    ],
    okrs: [
      {
        objective: 'Scale Operations & Delegation',
        keyResults: [
          'Create comprehensive SOP library (15+ documents)',
          'Delegate 30% of recurring tasks',
          'Prepare for VA or ops assistant onboarding',
        ],
        owner: 'Operations',
        status: 'planned',
      },
      {
        objective: 'Launch Licensing Evergreen Funnel',
        keyResults: [
          'Build automated licensing enrollment funnel',
          'Achieve 20+ enrollments in Q4',
          'Create monthly $3k+ licensing revenue',
        ],
        owner: 'Product',
        status: 'planned',
      },
      {
        objective: 'Execute Year-End Revenue Push',
        keyResults: [
          'Close $50k+ in consulting/retainer deals',
          'Achieve 120% of annual revenue target',
          'Build foundation for 2x growth in Year 2',
        ],
        owner: 'Dr. Dédé',
        status: 'planned',
      },
    ],
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const quarter = url.searchParams.get('quarter')?.toUpperCase();

    let data = roadmapData;
    if (quarter) {
      data = roadmapData.filter(q => q.quarter.includes(quarter));
      if (data.length === 0) {
        return Response.json(
          {
            error: `Quarter '${quarter}' not found`,
            available: roadmapData.map(q => q.quarter),
          },
          { status: 404 }
        );
      }
    }

    // Calculate aggregate metrics
    const allMonths = data.flatMap(q => q.months);
    const completedCount = allMonths.filter(m => m.status === 'completed').length;
    const inProgressCount = allMonths.filter(
      m => m.status === 'in-progress'
    ).length;
    const averageCompletion =
      allMonths.reduce((sum, m) => sum + (m.completionPercent || 0), 0) /
      allMonths.length;

    return Response.json(
      {
        success: true,
        data: {
          quarters: data,
          summary: {
            totalMonths: allMonths.length,
            completedMonths: completedCount,
            inProgressMonths: inProgressCount,
            plannedMonths: allMonths.filter(m => m.status === 'planned').length,
            averageCompletion: Math.round(averageCompletion),
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Roadmap API error:', error);
    return Response.json(
      {
        error: 'Failed to fetch roadmap',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { month, field, value } = body;

    if (!month || !field) {
      return Response.json(
        {
          error: 'month and field are required',
        },
        { status: 400 }
      );
    }

    // In a real implementation, this would persist to a database
    return Response.json(
      {
        success: true,
        message: `Updated ${month} ${field}`,
        updated: {
          month,
          [field]: value,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Roadmap PATCH error:', error);
    return Response.json(
      {
        error: 'Failed to update roadmap',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
