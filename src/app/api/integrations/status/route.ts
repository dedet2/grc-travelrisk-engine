import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface IntegrationStatus {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: string | null;
  healthCheck: {
    ok: boolean;
    latency: number;
    lastCheck: string;
  };
  configuredAt: string;
  features: string[];
}

interface IntegrationResponse extends ApiResponse<{
  integrations: IntegrationStatus[];
  summary: {
    total: number;
    connected: number;
    disconnected: number;
    errors: number;
    pending: number;
  };
}> {}

interface SyncRequest {
  integrationId: string;
}

const integrations: IntegrationStatus[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    type: 'database',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 42,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-15T10:30:00Z',
    features: ['real-time-sync', 'auth-integration', 'storage'],
  },
  {
    id: 'clerk',
    name: 'Clerk',
    type: 'authentication',
    status: 'connected',
    lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 28,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-10T08:00:00Z',
    features: ['user-management', 'mfa', 'oauth'],
  },
  {
    id: 'airtable',
    name: 'Airtable',
    type: 'crm',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 156,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-02-01T14:20:00Z',
    features: ['contact-sync', 'deal-tracking', 'automation'],
  },
  {
    id: 'apollo',
    name: 'Apollo.io',
    type: 'prospecting',
    status: 'connected',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 234,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-25T09:15:00Z',
    features: ['lead-enrichment', 'email-search', 'account-discovery'],
  },
  {
    id: 'weconnect',
    name: 'WeConnect',
    type: 'outreach',
    status: 'error',
    lastSync: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: false,
      latency: 5000,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-20T11:45:00Z',
    features: ['campaign-management', 'email-tracking', 'analytics'],
  },
  {
    id: 'slack',
    name: 'Slack',
    type: 'notifications',
    status: 'connected',
    lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 85,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-05T16:30:00Z',
    features: ['alerts', 'notifications', 'bot-integration'],
  },
  {
    id: 'github',
    name: 'GitHub',
    type: 'code',
    status: 'connected',
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 112,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-08T13:00:00Z',
    features: ['repo-sync', 'webhook-support', 'ci-cd'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    type: 'hosting',
    status: 'connected',
    lastSync: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 178,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-12T10:00:00Z',
    features: ['deployment', 'analytics', 'preview-urls'],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    type: 'email',
    status: 'pending',
    lastSync: null,
    healthCheck: {
      ok: false,
      latency: 0,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-02-15T09:00:00Z',
    features: ['email-delivery', 'templates', 'analytics'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'billing',
    status: 'connected',
    lastSync: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    healthCheck: {
      ok: true,
      latency: 198,
      lastCheck: new Date().toISOString(),
    },
    configuredAt: '2024-01-03T12:30:00Z',
    features: ['payment-processing', 'subscriptions', 'billing'],
  },
];

export async function GET(
  request: NextRequest
): Promise<NextResponse<IntegrationResponse>> {
  try {
    const summary = {
      total: integrations.length,
      connected: integrations.filter((i) => i.status === 'connected').length,
      disconnected: integrations.filter((i) => i.status === 'disconnected')
        .length,
      errors: integrations.filter((i) => i.status === 'error').length,
      pending: integrations.filter((i) => i.status === 'pending').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        integrations,
        summary,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch integration status',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ message: string; integrationId: string }>>> {
  try {
    const body: SyncRequest = await request.json();

    if (!body.integrationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'integrationId is required',
        },
        { status: 400 }
      );
    }

    const integration = integrations.find((i) => i.id === body.integrationId);

    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
        },
        { status: 404 }
      );
    }

    if (integration.status !== 'connected') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot sync integration with status: ${integration.status}`,
        },
        { status: 400 }
      );
    }

    integration.lastSync = new Date().toISOString();

    return NextResponse.json({
      success: true,
      data: {
        message: `Sync initiated for ${integration.name}`,
        integrationId: body.integrationId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to trigger integration sync',
      },
      { status: 500 }
    );
  }
}
