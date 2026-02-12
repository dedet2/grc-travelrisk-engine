/**
 * Integrations API Endpoint
 * Called by the Integrations dashboard page
 * GET: Retrieve all integration services and their status
 * POST: Connect/disconnect a service
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface IntegrationService {
  id: string;
  name: string;
  category: 'crm' | 'outreach' | 'automation' | 'analytics' | 'payment' | 'health' | 'communication' | 'scheduling';
  status: 'connected' | 'pending' | 'inactive';
  lastSync: string;
  eventsProcessed: number;
  icon: string;
}

interface IntegrationsData {
  services: IntegrationService[];
  stats: {
    total: number;
    connected: number;
    pending: number;
    inactive: number;
  };
}

/**
 * GET /api/integrations
 * Retrieve all integration services
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const services: IntegrationService[] = [
      {
        id: 'apollo',
        name: 'Apollo.io',
        category: 'crm',
        status: 'connected',
        lastSync: new Date(Date.now() - 5 * 60000).toISOString(),
        eventsProcessed: 1247,
        icon: '🚀',
      },
      {
        id: 'linkedin-sales-nav',
        name: 'LinkedIn Sales Nav',
        category: 'outreach',
        status: 'connected',
        lastSync: new Date(Date.now() - 15 * 60000).toISOString(),
        eventsProcessed: 892,
        icon: '💼',
      },
      {
        id: 'make',
        name: 'Make.com',
        category: 'automation',
        status: 'connected',
        lastSync: new Date(Date.now() - 3 * 60000).toISOString(),
        eventsProcessed: 3456,
        icon: '⚙️',
      },
      {
        id: 'airtable',
        name: 'Airtable',
        category: 'analytics',
        status: 'connected',
        lastSync: new Date(Date.now() - 10 * 60000).toISOString(),
        eventsProcessed: 2134,
        icon: '📊',
      },
      {
        id: 'slack',
        name: 'Slack',
        category: 'communication',
        status: 'connected',
        lastSync: new Date(Date.now() - 2 * 60000).toISOString(),
        eventsProcessed: 5678,
        icon: '💬',
      },
      {
        id: 'podia',
        name: 'Podia',
        category: 'crm',
        status: 'connected',
        lastSync: new Date(Date.now() - 20 * 60000).toISOString(),
        eventsProcessed: 456,
        icon: '🎓',
      },
      {
        id: 'weconnect',
        name: 'WeConnect',
        category: 'outreach',
        status: 'connected',
        lastSync: new Date(Date.now() - 8 * 60000).toISOString(),
        eventsProcessed: 1876,
        icon: '🔗',
      },
      {
        id: 'perplexity',
        name: 'Perplexity AI',
        category: 'analytics',
        status: 'connected',
        lastSync: new Date(Date.now() - 7 * 60000).toISOString(),
        eventsProcessed: 2345,
        icon: '🤖',
      },
      {
        id: 'stripe',
        name: 'Stripe',
        category: 'payment',
        status: 'pending',
        lastSync: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
        eventsProcessed: 0,
        icon: '💳',
      },
      {
        id: 'fitbit',
        name: 'Fitbit',
        category: 'health',
        status: 'inactive',
        lastSync: new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString(),
        eventsProcessed: 0,
        icon: '❤️',
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        category: 'communication',
        status: 'pending',
        lastSync: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
        eventsProcessed: 0,
        icon: '📧',
      },
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        category: 'scheduling',
        status: 'connected',
        lastSync: new Date(Date.now() - 1 * 60000).toISOString(),
        eventsProcessed: 4210,
        icon: '📅',
      },
    ];

    // Calculate stats
    const stats = {
      total: services.length,
      connected: services.filter((s) => s.status === 'connected').length,
      pending: services.filter((s) => s.status === 'pending').length,
      inactive: services.filter((s) => s.status === 'inactive').length,
    };

    const responseData: IntegrationsData = {
      services,
      stats,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
      } as ApiResponse<IntegrationsData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Integrations API] Error retrieving integrations:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve integrations: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations
 * Connect or disconnect a service
 *
 * Request body:
 * {
 *   "serviceId": "stripe",
 *   "action": "connect" | "disconnect"
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));
    const { serviceId, action } = body;

    if (!serviceId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: serviceId and action',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!['connect', 'disconnect'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "connect" or "disconnect"',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Mock update service status
    const newStatus = action === 'connect' ? 'connected' : 'inactive';
    const lastSync = action === 'connect' ? new Date().toISOString() : new Date(Date.now() - 30 * 24 * 60 * 60000).toISOString();

    const responseData = {
      serviceId,
      action,
      newStatus,
      lastSync,
      message: `Service ${action === 'connect' ? 'connected' : 'disconnected'} successfully`,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Integrations API] Error updating integration:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to update integration: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
