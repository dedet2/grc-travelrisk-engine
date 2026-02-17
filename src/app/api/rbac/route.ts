import { NextRequest, NextResponse } from 'next/server';
import RBACEngine, { Role, Entity, Action } from '@/lib/rbac/rbac-engine';

const rbacEngine = new RBACEngine();

/**
 * GET /api/rbac
 * Returns all role definitions and the complete permission matrix
 */
export async function GET() {
  try {
    const roleDefinitions = rbacEngine.getAllRoleDefinitions();
    const permissionMatrix = rbacEngine.getPermissionMatrix();

    return NextResponse.json(
      {
        success: true,
        data: {
          roles: roleDefinitions,
          matrix: permissionMatrix,
          entities: ['frameworks', 'assessments', 'risks', 'agents', 'reports', 'settings', 'audit_logs', 'crm'],
          actions: ['read', 'write', 'delete', 'approve', 'export'],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve RBAC configuration',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rbac
 * Validate access for a user action
 * Body: { userId: string, role: Role, entity: Entity, action: Action }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, entity, action } = body as {
      userId?: string;
      role?: Role;
      entity?: Entity;
      action?: Action;
    };

    // Validate required fields
    if (!userId || !role || !entity || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, role, entity, action',
        },
        { status: 400 }
      );
    }

    // Validate role value
    const validRoles: Role[] = ['admin', 'compliance_officer', 'risk_analyst', 'auditor', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate entity value
    const validEntities: Entity[] = ['frameworks', 'assessments', 'risks', 'agents', 'reports', 'settings', 'audit_logs', 'crm'];
    if (!validEntities.includes(entity)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid entity: ${entity}. Valid entities are: ${validEntities.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate action value
    const validActions: Action[] = ['read', 'write', 'delete', 'approve', 'export'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid action: ${action}. Valid actions are: ${validActions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate access
    const result = rbacEngine.validateAccess(userId, role, entity, action);

    return NextResponse.json(
      {
        success: true,
        data: {
          allowed: result.allowed,
          reason: result.reason,
          userId,
          role,
          entity,
          action,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate access',
      },
      { status: 500 }
    );
  }
}
