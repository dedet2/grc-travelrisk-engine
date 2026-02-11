/**
 * Role Management API Endpoint
 * Allows admins to assign and manage user roles
 * Requires admin role and Clerk authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, setUserRole, getUserRole, getAllUserRoles } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/roles
 * List all user roles (admin only)
 */
export async function GET(req: NextRequest) {
  try {
    // Require admin role
    await requireRole('admin');

    const roles = getAllUserRoles();

    return NextResponse.json({
      success: true,
      data: roles,
      count: roles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('Roles list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 403 }
    );
  }
}

/**
 * POST /api/admin/roles
 * Assign or update a user role (admin only)
 * Body:
 *   - userId: string (required) - Clerk user ID
 *   - role: 'admin' | 'analyst' | 'viewer' (required)
 */
export async function POST(req: NextRequest) {
  try {
    // Require admin role
    await requireRole('admin');

    // Parse request body
    const body = await req.json();
    const { userId, role } = body;

    // Validate required fields
    if (!userId || !role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'userId and role are required',
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'analyst', 'viewer'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role',
          message: 'role must be one of: admin, analyst, viewer',
        },
        { status: 400 }
      );
    }

    // Set user role
    setUserRole(userId, role);
    const updatedRole = getUserRole(userId);

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      userId,
      role: updatedRole,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('Role assignment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 403 }
    );
  }
}

/**
 * GET /api/admin/roles/:userId
 * Get a specific user's role (admin only)
 */
export async function getSpecificUserRole(req: NextRequest, userId: string) {
  try {
    // Require admin role
    await requireRole('admin');

    const role = getUserRole(userId);

    return NextResponse.json({
      success: true,
      userId,
      role,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('Get user role error:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 403 }
    );
  }
}
