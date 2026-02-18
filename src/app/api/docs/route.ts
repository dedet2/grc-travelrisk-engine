import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface QueryParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  queryParams?: QueryParam[];
  requestBody?: { type: string; properties: Record<string, unknown> };
  responseSchema: { type: string; properties: Record<string, unknown> };
  authRequired: boolean;
  rateLimit: string;
}

interface ApiDocumentation {
  version: string;
  title: string;
  description: string;
  baseUrl: string;
  endpoints: ApiEndpoint[];
}

export const dynamic = 'force-dynamic';

function getApiDocumentation(): ApiDocumentation {
  return {
    version: '1.0.0',
    title: 'GRC Travel Risk Engine API',
    description: 'Comprehensive API for GRC compliance and travel risk assessment',
    baseUrl: 'https://api.grc-travelrisk.com',
    endpoints: [
      {
        method: 'GET',
        path: '/api/health/check',
        description: 'Comprehensive health check endpoint',
        category: 'System',
        responseSchema: {
          type: 'object',
          properties: {
            overall: { type: 'string', enum: ['healthy', 'degraded', 'down'] },
            services: { type: 'array' },
            uptime: { type: 'number' },
          },
        },
        authRequired: false,
        rateLimit: '60 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/billing/subscriptions',
        description: 'Get current subscription details',
        category: 'Billing',
        responseSchema: {
          type: 'object',
          properties: {
            plan: { type: 'object' },
            usage: { type: 'object' },
            billing: { type: 'object' },
            invoices: { type: 'array' },
          },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/billing/subscriptions',
        description: 'Change subscription plan',
        category: 'Billing',
        requestBody: {
          type: 'object',
          properties: { planId: { type: 'string' }, interval: { type: 'string' } },
        },
        responseSchema: {
          type: 'object',
          properties: { message: { type: 'string' }, subscription: { type: 'object' } },
        },
        authRequired: true,
        rateLimit: '10 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/billing/pricing',
        description: 'Get all pricing tiers',
        category: 'Billing',
        responseSchema: {
          type: 'object',
          properties: {
            currency: { type: 'string' },
            tiers: { type: 'array' },
          },
        },
        authRequired: false,
        rateLimit: '200 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/dashboard/summary',
        description: 'Get dashboard summary metrics',
        category: 'Dashboard',
        responseSchema: {
          type: 'object',
          properties: {
            totalAssessments: { type: 'number' },
            riskScore: { type: 'number' },
            recentActivity: { type: 'array' },
          },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/compliance/frameworks',
        description: 'List all available GRC frameworks',
        category: 'Compliance',
        queryParams: [
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
          { name: 'limit', type: 'number', required: false, description: 'Max results' },
        ],
        responseSchema: {
          type: 'object',
          properties: { frameworks: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/compliance/assessments',
        description: 'List all compliance assessments',
        category: 'Compliance',
        queryParams: [
          { name: 'frameworkId', type: 'string', required: false, description: 'Filter by framework' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
        ],
        responseSchema: {
          type: 'object',
          properties: { assessments: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/compliance/assessments',
        description: 'Create new assessment',
        category: 'Compliance',
        requestBody: {
          type: 'object',
          properties: {
            frameworkId: { type: 'string' },
            name: { type: 'string' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: { assessmentId: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '10 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/risk/assessment/:assessmentId',
        description: 'Get risk assessment details',
        category: 'Risk',
        responseSchema: {
          type: 'object',
          properties: {
            assessmentId: { type: 'string' },
            riskScore: { type: 'number' },
            riskLevel: { type: 'string' },
          },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/risk/calculate',
        description: 'Calculate risk score for entity',
        category: 'Risk',
        requestBody: {
          type: 'object',
          properties: { entityType: { type: 'string' }, entityId: { type: 'string' } },
        },
        responseSchema: {
          type: 'object',
          properties: { riskScore: { type: 'number' } },
        },
        authRequired: true,
        rateLimit: '20 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/agents/list',
        description: 'List all AI agents',
        category: 'Agents',
        queryParams: [
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
        ],
        responseSchema: {
          type: 'object',
          properties: { agents: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/agents/run',
        description: 'Execute an agent workflow',
        category: 'Agents',
        requestBody: {
          type: 'object',
          properties: {
            agentName: { type: 'string' },
            parameters: { type: 'object' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: { runId: { type: 'string' }, status: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '10 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/agents/:agentId/status',
        description: 'Get agent execution status',
        category: 'Agents',
        responseSchema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            progress: { type: 'number' },
            results: { type: 'object' },
          },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/travel-risk/destinations',
        description: 'Get travel risk data for destinations',
        category: 'Risk',
        queryParams: [
          { name: 'country', type: 'string', required: false, description: 'Country code' },
          { name: 'includeAdvisories', type: 'boolean', required: false, description: 'Include advisories' },
        ],
        responseSchema: {
          type: 'object',
          properties: { destinations: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/travel-risk/assess',
        description: 'Assess travel risk for trip',
        category: 'Risk',
        requestBody: {
          type: 'object',
          properties: {
            destination: { type: 'string' },
            departureDate: { type: 'string' },
            returnDate: { type: 'string' },
          },
        },
        responseSchema: {
          type: 'object',
          properties: {
            riskScore: { type: 'number' },
            riskLevel: { type: 'string' },
            recommendations: { type: 'array' },
          },
        },
        authRequired: true,
        rateLimit: '20 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/crm/contacts',
        description: 'List all contacts',
        category: 'CRM',
        queryParams: [
          { name: 'search', type: 'string', required: false, description: 'Search query' },
          { name: 'limit', type: 'number', required: false, description: 'Pagination limit' },
        ],
        responseSchema: {
          type: 'object',
          properties: { contacts: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/crm/contacts',
        description: 'Create new contact',
        category: 'CRM',
        requestBody: {
          type: 'object',
          properties: { name: { type: 'string' }, email: { type: 'string' } },
        },
        responseSchema: {
          type: 'object',
          properties: { contactId: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '20 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/crm/deals',
        description: 'List all deals',
        category: 'CRM',
        queryParams: [
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
        ],
        responseSchema: {
          type: 'object',
          properties: { deals: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/reports/compliance',
        description: 'Generate compliance report',
        category: 'Reports',
        queryParams: [
          { name: 'assessmentId', type: 'string', required: true, description: 'Assessment ID' },
          { name: 'format', type: 'string', required: false, description: 'Output format (pdf/json)' },
        ],
        responseSchema: {
          type: 'object',
          properties: { reportId: { type: 'string' }, url: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '5 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/reports/risk',
        description: 'Generate risk report',
        category: 'Reports',
        queryParams: [
          { name: 'entityType', type: 'string', required: true, description: 'Entity type' },
          { name: 'dateRange', type: 'string', required: false, description: 'Date range' },
        ],
        responseSchema: {
          type: 'object',
          properties: { reportId: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '5 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/reports/list',
        description: 'List all generated reports',
        category: 'Reports',
        responseSchema: {
          type: 'object',
          properties: { reports: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/settings/organization',
        description: 'Get organization settings',
        category: 'Settings',
        responseSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            logo: { type: 'string' },
            settings: { type: 'object' },
          },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'PUT',
        path: '/api/settings/organization',
        description: 'Update organization settings',
        category: 'Settings',
        requestBody: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
        responseSchema: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '10 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/settings/users',
        description: 'List all users',
        category: 'Settings',
        responseSchema: {
          type: 'object',
          properties: { users: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/settings/users',
        description: 'Invite new user',
        category: 'Settings',
        requestBody: {
          type: 'object',
          properties: { email: { type: 'string' }, role: { type: 'string' } },
        },
        responseSchema: {
          type: 'object',
          properties: { userId: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '10 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/settings/integrations',
        description: 'List integrations',
        category: 'Settings',
        responseSchema: {
          type: 'object',
          properties: { integrations: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/audit/logs',
        description: 'Get audit logs',
        category: 'System',
        queryParams: [
          { name: 'limit', type: 'number', required: false, description: 'Max results' },
          { name: 'action', type: 'string', required: false, description: 'Filter by action' },
        ],
        responseSchema: {
          type: 'object',
          properties: { logs: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/monitoring/alerts',
        description: 'Get system alerts',
        category: 'System',
        responseSchema: {
          type: 'object',
          properties: { alerts: { type: 'array' } },
        },
        authRequired: true,
        rateLimit: '100 requests/minute',
      },
      {
        method: 'POST',
        path: '/api/monitoring/alerts/acknowledge',
        description: 'Acknowledge alert',
        category: 'System',
        requestBody: {
          type: 'object',
          properties: { alertId: { type: 'string' } },
        },
        responseSchema: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
        authRequired: true,
        rateLimit: '20 requests/minute',
      },
      {
        method: 'GET',
        path: '/api/system/status',
        description: 'Get system status',
        category: 'System',
        responseSchema: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            uptime: { type: 'number' },
          },
        },
        authRequired: false,
        rateLimit: '60 requests/minute',
      },
    ],
  };
}

export async function GET(): Promise<Response> {
  try {
    const documentation = getApiDocumentation();

    return NextResponse.json(
      {
        success: true,
        data: documentation,
        timestamp: new Date(),
      } as ApiResponse<ApiDocumentation>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching API documentation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch documentation',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
