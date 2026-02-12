/**
 * Workflows API Routes
 * GET: List all workflows with optional filtering
 * POST: Create a new workflow
 */

import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'Lead Gen' | 'Outreach' | 'Content Creation' | 'Job Search' | 'Board Search';
  status: 'active' | 'paused' | 'draft';
  triggerType: 'manual' | 'scheduled' | 'webhook' | 'event';
  successRate: number; // 0-100
  executionCount: number;
  lastRun?: Date;
}

export interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
}

// Mock workflows for Dr. Dédé's GRC consulting empire
const mockWorkflows: Workflow[] = [
  // Lead Gen (4 workflows)
  {
    id: 'wf-001',
    name: 'LinkedIn Lead Scraper',
    description: 'Automatically identify and extract GRC decision makers from LinkedIn',
    category: 'Lead Gen',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 94,
    executionCount: 342,
    lastRun: new Date(Date.now() - 2 * 60000),
  },
  {
    id: 'wf-002',
    name: 'Conference Attendee Qualification',
    description: 'Qualify leads from recent compliance and risk conferences',
    category: 'Lead Gen',
    status: 'active',
    triggerType: 'webhook',
    successRate: 87,
    executionCount: 156,
    lastRun: new Date(Date.now() - 15 * 60000),
  },
  {
    id: 'wf-003',
    name: 'Referral Pipeline Builder',
    description: 'Track and nurture referral sources from existing clients',
    category: 'Lead Gen',
    status: 'paused',
    triggerType: 'scheduled',
    successRate: 91,
    executionCount: 89,
    lastRun: new Date(Date.now() - 7 * 24 * 3600000),
  },
  {
    id: 'wf-004',
    name: 'Website Visitor Identification',
    description: 'Identify high-value visitors and companies browsing GRC services',
    category: 'Lead Gen',
    status: 'active',
    triggerType: 'event',
    successRate: 78,
    executionCount: 512,
    lastRun: new Date(Date.now() - 8 * 60000),
  },

  // Outreach (4 workflows)
  {
    id: 'wf-005',
    name: 'Personalized Cold Email Campaign',
    description: 'Send personalized cold emails to risk management executives',
    category: 'Outreach',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 12,
    executionCount: 1024,
    lastRun: new Date(Date.now() - 1 * 60000),
  },
  {
    id: 'wf-006',
    name: 'Sales Follow-up Sequence',
    description: 'Multi-touch email sequence for qualified prospects',
    category: 'Outreach',
    status: 'active',
    triggerType: 'event',
    successRate: 34,
    executionCount: 678,
    lastRun: new Date(Date.now() - 4 * 60000),
  },
  {
    id: 'wf-007',
    name: 'LinkedIn InMail Blitz',
    description: 'Coordinated LinkedIn InMail outreach to C-suite executives',
    category: 'Outreach',
    status: 'draft',
    triggerType: 'manual',
    successRate: 8,
    executionCount: 234,
    lastRun: new Date(Date.now() - 3 * 24 * 3600000),
  },
  {
    id: 'wf-008',
    name: 'Event Invitation Delivery',
    description: 'Send exclusive GRC summit invitations to key prospects',
    category: 'Outreach',
    status: 'paused',
    triggerType: 'webhook',
    successRate: 22,
    executionCount: 145,
    lastRun: new Date(Date.now() - 14 * 24 * 3600000),
  },

  // Content Creation (4 workflows)
  {
    id: 'wf-009',
    name: 'Weekly Blog Post Generator',
    description: 'AI-generated blog posts on compliance trends and GRC best practices',
    category: 'Content Creation',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 96,
    executionCount: 52,
    lastRun: new Date(Date.now() - 1 * 24 * 3600000),
  },
  {
    id: 'wf-010',
    name: 'Whitepaper Automation',
    description: 'Generate industry whitepapers from research data and frameworks',
    category: 'Content Creation',
    status: 'active',
    triggerType: 'manual',
    successRate: 89,
    executionCount: 18,
    lastRun: new Date(Date.now() - 5 * 24 * 3600000),
  },
  {
    id: 'wf-011',
    name: 'Case Study Content Pipeline',
    description: 'Convert successful projects into compelling case studies',
    category: 'Content Creation',
    status: 'active',
    triggerType: 'event',
    successRate: 92,
    executionCount: 34,
    lastRun: new Date(Date.now() - 2 * 24 * 3600000),
  },
  {
    id: 'wf-012',
    name: 'Social Media Content Repurposing',
    description: 'Automatically adapt long-form content for LinkedIn, Twitter, and email',
    category: 'Content Creation',
    status: 'draft',
    triggerType: 'event',
    successRate: 88,
    executionCount: 156,
    lastRun: new Date(Date.now() - 4 * 24 * 3600000),
  },

  // Job Search (4 workflows)
  {
    id: 'wf-013',
    name: 'GRC Talent Intelligence',
    description: 'Monitor job postings for GRC talent and competitive hiring trends',
    category: 'Job Search',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 85,
    executionCount: 280,
    lastRun: new Date(Date.now() - 3 * 60000),
  },
  {
    id: 'wf-014',
    name: 'Competitor Sales Hire Tracking',
    description: 'Track new hires at competing GRC firms for market intelligence',
    category: 'Job Search',
    status: 'paused',
    triggerType: 'webhook',
    successRate: 79,
    executionCount: 98,
    lastRun: new Date(Date.now() - 8 * 24 * 3600000),
  },
  {
    id: 'wf-015',
    name: 'Risk Officer Promotion Alert',
    description: 'Identify when Chief Risk Officers or GRC leaders get promoted',
    category: 'Job Search',
    status: 'active',
    triggerType: 'event',
    successRate: 83,
    executionCount: 167,
    lastRun: new Date(Date.now() - 6 * 60000),
  },
  {
    id: 'wf-016',
    name: 'Contract Compliance Specialist Search',
    description: 'Source contract and compliance specialists in growth markets',
    category: 'Job Search',
    status: 'draft',
    triggerType: 'scheduled',
    successRate: 81,
    executionCount: 45,
    lastRun: new Date(Date.now() - 10 * 24 * 3600000),
  },

  // Board Search (4 workflows)
  {
    id: 'wf-017',
    name: 'Board Vacancy Scanner',
    description: 'Monitor board vacancies and governance announcements',
    category: 'Board Search',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 93,
    executionCount: 198,
    lastRun: new Date(Date.now() - 12 * 60000),
  },
  {
    id: 'wf-018',
    name: 'Executive Search Board Leads',
    description: 'Identify board candidates from executive search results',
    category: 'Board Search',
    status: 'active',
    triggerType: 'webhook',
    successRate: 76,
    executionCount: 134,
    lastRun: new Date(Date.now() - 9 * 60000),
  },
  {
    id: 'wf-019',
    name: 'Fortune 500 Board Monitoring',
    description: 'Track board changes and governance at enterprise accounts',
    category: 'Board Search',
    status: 'paused',
    triggerType: 'scheduled',
    successRate: 88,
    executionCount: 76,
    lastRun: new Date(Date.now() - 21 * 24 * 3600000),
  },
  {
    id: 'wf-020',
    name: 'Board Orientation Follow-up',
    description: 'Automated follow-up sequence for newly appointed board members',
    category: 'Board Search',
    status: 'draft',
    triggerType: 'manual',
    successRate: 71,
    executionCount: 32,
    lastRun: new Date(Date.now() - 5 * 24 * 3600000),
  },
];

/**
 * GET /api/workflows
 * List all workflows with optional filtering by category and status
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');

    let workflows = [...mockWorkflows];

    if (category) {
      workflows = workflows.filter((w) => w.category === category);
    }

    if (status) {
      workflows = workflows.filter((w) => w.status === status);
    }

    // Calculate metrics
    const metrics: WorkflowMetrics = {
      totalWorkflows: mockWorkflows.length,
      activeWorkflows: mockWorkflows.filter((w) => w.status === 'active').length,
      totalExecutions: mockWorkflows.reduce((sum, w) => sum + w.executionCount, 0),
      successRate: Math.round(
        mockWorkflows.reduce((sum, w) => sum + w.successRate, 0) / mockWorkflows.length
      ),
    };

    return Response.json(
      {
        success: true,
        data: {
          workflows,
          metrics,
          count: workflows.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        workflows: Workflow[];
        metrics: WorkflowMetrics;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflows',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows
 * Create a new workflow
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { name, description, category, status, triggerType } = body;

    // Validate required fields
    if (!name || !description || !category || !status || !triggerType) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: name, description, category, status, triggerType',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create new workflow
    const newWorkflow: Workflow = {
      id: `wf-${String(mockWorkflows.length + 1).padStart(3, '0')}`,
      name,
      description,
      category,
      status,
      triggerType,
      successRate: 0,
      executionCount: 0,
    };

    // In a real implementation, this would be saved to a database
    mockWorkflows.push(newWorkflow);

    return Response.json(
      {
        success: true,
        data: newWorkflow,
        timestamp: new Date(),
      } as ApiResponse<Workflow>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating workflow:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workflow',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
