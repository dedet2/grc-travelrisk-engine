/**
 * SIEM Integration API
 * GET: List configured SIEM connectors with status
 * POST: Add/configure a new SIEM connector
 * PUT: Test connection
 */

import { auth } from '@clerk/nextjs/server';
import { requireTenant } from '@/lib/tenancy/middleware-helpers';
import {
  siemManager,
  SplunkConnector,
  QRadarConnector,
  SentinelConnector,
  type SIEMType,
  type SIEMConnectorConfig,
} from '@/lib/integrations/siem-connector';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// In-memory storage for SIEM configurations (would be database in production)
const siemConfigs = new Map<string, any>();

/**
 * GET /api/integrations/siem
 * List all configured SIEM connectors with their status
 */
export async function GET(): Promise<Response> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Get status of all registered connectors
    const status = siemManager.getStatus();

    return Response.json(
      {
        success: true,
        data: status,
        timestamp: new Date(),
      } as ApiResponse<SIEMConnectorConfig[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching SIEM integrations:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch integrations',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/siem
 * Add or configure a new SIEM connector
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { tenant } = await requireTenant(request);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const { type, config, name } = body;

    // Validate required fields
    if (!type || !config) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: type, config',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate SIEM type
    const validTypes: SIEMType[] = ['splunk', 'qradar', 'sentinel'];
    if (!validTypes.includes(type)) {
      return Response.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Create connector based on type
    let connector;
    const connectorId = `${type}-${tenant.id}-${Date.now()}`;
    const connectorName = name || `${type.charAt(0).toUpperCase() + type.slice(1)} Connector`;

    try {
      switch (type) {
        case 'splunk':
          connector = new SplunkConnector(config);
          break;
        case 'qradar':
          connector = new QRadarConnector(config);
          break;
        case 'sentinel':
          connector = new SentinelConnector(config);
          break;
        default:
          throw new Error(`Unsupported SIEM type: ${type}`);
      }

      // Store configuration
      siemConfigs.set(connectorId, {
        id: connectorId,
        tenantId: tenant.id,
        type,
        name: connectorName,
        config,
        createdAt: new Date(),
      });

      // Register connector
      siemManager.registerConnector(connectorId, connector);

      // Get initial status
      const status = connector.getStatus();

      return Response.json(
        {
          success: true,
          data: {
            ...status,
            id: connectorId,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating connector:', error);
      return Response.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create connector',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating SIEM integration:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create integration',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/integrations/siem
 * Test connection to a SIEM connector
 */
export async function PUT(request: Request): Promise<Response> {
  try {
    const { tenant } = await requireTenant(request);

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const { connectorId } = body;

    if (!connectorId) {
      return Response.json(
        {
          success: false,
          error: 'Missing required field: connectorId',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get connector
    const connector = siemManager.getConnector(connectorId);
    if (!connector) {
      return Response.json(
        {
          success: false,
          error: 'Connector not found',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Verify tenant ownership
    const config = siemConfigs.get(connectorId);
    if (!config || config.tenantId !== tenant.id) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Test connection
    const isConnected = await siemManager.testConnector(connectorId);

    const status = connector.getStatus();

    return Response.json(
      {
        success: isConnected,
        data: {
          ...status,
          id: connectorId,
          testResult: isConnected ? 'success' : 'failed',
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error testing SIEM integration:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
