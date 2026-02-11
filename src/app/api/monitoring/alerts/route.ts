/**
 * Monitoring Alerts API Endpoint
 * GET: Retrieve alerts with filtering
 * POST: Acknowledge alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monitoring/alerts
 * Retrieve monitoring alerts with optional filtering
 * Query params:
 *   ?severity=critical|high|medium|low|info
 *   ?acknowledged=true|false
 *   ?source=advisory|scoring|framework|system
 *   ?limit=20 (default 50)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const acknowledged = searchParams.get('acknowledged');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let alerts = inMemoryStore.getAllMonitoringAlerts();

    // Filter by severity
    if (severity) {
      alerts = alerts.filter((a) => a.severity === severity);
    }

    // Filter by acknowledged status
    if (acknowledged !== null) {
      const isAcknowledged = acknowledged === 'true';
      alerts = alerts.filter((a) => a.acknowledged === isAcknowledged);
    }

    // Filter by source
    if (source) {
      alerts = alerts.filter((a) => a.source === source);
    }

    // Apply limit
    const limitedAlerts = alerts.slice(0, limit);

    const responseData = {
      alerts: limitedAlerts,
      total: alerts.length,
      returned: limitedAlerts.length,
      filters: {
        severity: severity || 'all',
        acknowledged: acknowledged || 'all',
        source: source || 'all',
        limit,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Alerts API] Error retrieving alerts:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve alerts: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitoring/alerts
 * Acknowledge or bulk-acknowledge alerts
 *
 * Request body:
 * {
 *   "action": "acknowledge" | "clear_acknowledged",
 *   "alertId": "string" (for single acknowledge),
 *   "alertIds": ["string"] (for bulk acknowledge),
 *   "acknowledgedBy": "string" (optional)
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, alertId, alertIds, acknowledgedBy } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: action (acknowledge | clear_acknowledged)',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (action === 'acknowledge') {
      const idsToAcknowledge = alertIds || (alertId ? [alertId] : []);

      if (idsToAcknowledge.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required field: alertId or alertIds',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const results: { alertId: string; acknowledged: boolean }[] = [];
      for (const id of idsToAcknowledge) {
        const success = inMemoryStore.acknowledgeMonitoringAlert(id, acknowledgedBy);
        results.push({ alertId: id, acknowledged: success });
      }

      const successCount = results.filter((r) => r.acknowledged).length;

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'acknowledge',
            total: idsToAcknowledge.length,
            acknowledged: successCount,
            failed: idsToAcknowledge.length - successCount,
            results,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (action === 'clear_acknowledged') {
      const cleared = inMemoryStore.clearAcknowledgedMonitoringAlerts();

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'clear_acknowledged',
            cleared,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Invalid action: ${action}. Must be 'acknowledge' or 'clear_acknowledged'`,
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Alerts API] Error processing alert action:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to process alert action: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
