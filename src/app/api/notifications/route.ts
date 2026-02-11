/**
 * Notifications API Endpoint
 * GET: Retrieve alerts with optional filtering by priority
 * POST: Create new alert or dismiss existing
 * DELETE: Clear dismissed alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { alertManager } from '@/lib/notifications/alert-manager';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 * Retrieve alerts with optional filtering
 * Query params:
 *   ?priority=critical|high|medium|low|info
 *   ?type=risk_change|compliance_breach|travel_advisory|agent_failure|opportunity_found
 *   ?limit=20 (default 50)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let alerts = alertManager.getActiveAlerts();

    // Filter by priority
    if (priority) {
      alerts = alerts.filter((a) => a.priority === priority);
    }

    // Filter by type
    if (type) {
      alerts = alerts.filter((a) => a.type === type);
    }

    // Apply limit
    const limitedAlerts = alerts.slice(0, limit);

    const stats = alertManager.getStats();

    const responseData = {
      alerts: limitedAlerts,
      stats,
      total: alerts.length,
      returned: limitedAlerts.length,
      filters: {
        priority: priority || 'all',
        type: type || 'all',
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
    console.error('[Notifications API] Error retrieving alerts:', errorMessage);

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
 * POST /api/notifications
 * Create new alert or dismiss existing
 *
 * Request body for creating alert:
 * {
 *   "action": "create",
 *   "type": "risk_change|compliance_breach|travel_advisory|agent_failure|opportunity_found",
 *   "priority": "critical|high|medium|low|info",
 *   "title": "string",
 *   "message": "string",
 *   "actionUrl": "string (optional)"
 * }
 *
 * Request body for dismissing:
 * {
 *   "action": "dismiss" | "dismiss_by_priority" | "clear_dismissed",
 *   "alertId": "string" (for dismiss),
 *   "priority": "string" (for dismiss_by_priority)
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: action',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (action === 'create') {
      const { type, priority, title, message, actionUrl } = body;

      if (!type || !priority || !title || !message) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required fields for creating alert: type, priority, title, message',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const alert = alertManager.createAlert(type, priority, title, message, actionUrl);

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'create',
            alert,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 201 }
      );
    }

    if (action === 'dismiss') {
      const { alertId } = body;

      if (!alertId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required field: alertId',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const success = alertManager.dismissAlert(alertId);

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'dismiss',
            alertId,
            dismissed: success,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (action === 'dismiss_by_priority') {
      const { priority } = body;

      if (!priority) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required field: priority',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const count = alertManager.dismissAlertsByPriority(priority);

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'dismiss_by_priority',
            priority,
            dismissed: count,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (action === 'clear_dismissed') {
      const count = alertManager.clearDismissedAlerts();

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'clear_dismissed',
            cleared: count,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Invalid action: ${action}. Valid actions: create, dismiss, dismiss_by_priority, clear_dismissed`,
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Notifications API] Error processing action:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to process notification action: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Delete/clear specific alerts or all dismissed alerts
 * Query params:
 *   ?alertId=string (clear specific alert)
 *   ?all=true (clear all alerts)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    const all = searchParams.get('all') === 'true';

    if (all) {
      alertManager.clearAllAlerts();
      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'clear_all',
            cleared: true,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    if (alertId) {
      const success = alertManager.clearAlert(alertId);

      return NextResponse.json(
        {
          success: true,
          data: {
            action: 'delete_alert',
            alertId,
            deleted: success,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Must provide either alertId or all=true',
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Notifications API] Error deleting alerts:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete alerts: ${errorMessage}`,
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
