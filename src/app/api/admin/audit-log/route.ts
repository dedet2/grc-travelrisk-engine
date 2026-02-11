/**
 * Audit Log API Endpoint
 * Provides access to audit logs for admin users
 * Requires admin role and Clerk authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, getAuthenticatedUserId } from '@/lib/rbac';
import { getAuditLogs, getUserActivityLogs } from '@/lib/audit/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/audit-log
 * Retrieve audit logs
 * Query params:
 *   - type: 'resource' or 'user' (default: 'resource')
 *   - resourceType: resource type to filter by (when type='resource')
 *   - resourceId: resource ID to filter by (when type='resource')
 *   - userId: user ID to filter by (when type='user')
 *   - limit: number of records to return (default: 50, max: 500)
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication and permission
    await requirePermission('canAccessAuditLogs');
    const userId = await getAuthenticatedUserId();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'resource';
    const resourceType = searchParams.get('resourceType') || '';
    const resourceId = searchParams.get('resourceId') || '';
    const targetUserId = searchParams.get('userId') || '';
    const limitStr = searchParams.get('limit') || '50';

    const limit = Math.min(Math.max(1, parseInt(limitStr, 10) || 50), 500);

    let logs = [];

    if (type === 'user' && targetUserId) {
      // Get user activity logs
      logs = await getUserActivityLogs(targetUserId, limit);
    } else if (type === 'resource' && resourceType && resourceId) {
      // Get resource-specific audit logs
      logs = await getAuditLogs(resourceType, resourceId, limit);
    } else {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          message: 'For type="resource", provide resourceType and resourceId. For type="user", provide userId.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
      requestedBy: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it's an authorization error
    if (errorMessage.includes('Unauthorized') || errorMessage.includes('Forbidden')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 403 }
      );
    }

    console.error('Audit log endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/audit-log
 * Create a manual audit log entry (admin only)
 * Body:
 *   - action: string (required)
 *   - resourceType: string (required)
 *   - resourceId: string (optional)
 *   - details: object (optional)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication and permission
    await requirePermission('canAccessAuditLogs');
    const userId = await getAuthenticatedUserId();

    // Parse request body
    const body = await req.json();
    const { action, resourceType, resourceId, details } = body;

    // Validate required fields
    if (!action || !resourceType) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'action and resourceType are required',
        },
        { status: 400 }
      );
    }

    // Import audit logger here to avoid circular dependencies
    const { logAction } = await import('@/lib/audit/logger');

    // Create audit log entry
    await logAction({
      userId,
      action,
      resourceType,
      resourceId,
      details: {
        ...details,
        createdVia: 'admin-api',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Audit log created',
      createdBy: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Check if it's an authorization error
    if (errorMessage.includes('Unauthorized') || errorMessage.includes('Forbidden')) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: 403 }
      );
    }

    console.error('Audit log creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
