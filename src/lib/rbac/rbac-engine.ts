/**
 * Role-Based Access Control Engine
 * Manages 5 roles with granular permissions across 8 entities
 */

export type Role = 'admin' | 'compliance_officer' | 'risk_analyst' | 'auditor' | 'viewer';

export type Entity = 
  | 'frameworks' 
  | 'assessments' 
  | 'risks' 
  | 'agents' 
  | 'reports' 
  | 'settings' 
  | 'audit_logs' 
  | 'crm';

export type Action = 'read' | 'write' | 'delete' | 'approve' | 'export';

export interface Permission {
  entity: Entity;
  action: Action;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  description: string;
}

export interface AccessValidationResult {
  allowed: boolean;
  reason: string;
}

export class RBACEngine {
  private rolePermissionMatrix: Map<Role, Set<string>> = new Map();

  constructor() {
    this.initializeRoleMatrix();
  }

  /**
   * Initialize the role permission matrix
   */
  private initializeRoleMatrix(): void {
    // Admin: Full access to all entities and actions
    this.rolePermissionMatrix.set(
      'admin',
      new Set([
        'frameworks:read', 'frameworks:write', 'frameworks:delete', 'frameworks:approve', 'frameworks:export',
        'assessments:read', 'assessments:write', 'assessments:delete', 'assessments:approve', 'assessments:export',
        'risks:read', 'risks:write', 'risks:delete', 'risks:approve', 'risks:export',
        'agents:read', 'agents:write', 'agents:delete', 'agents:approve', 'agents:export',
        'reports:read', 'reports:write', 'reports:delete', 'reports:approve', 'reports:export',
        'settings:read', 'settings:write', 'settings:delete', 'settings:approve', 'settings:export',
        'audit_logs:read', 'audit_logs:export',
        'crm:read', 'crm:write', 'crm:delete', 'crm:approve', 'crm:export',
      ])
    );

    // Compliance Officer: Read, write, approve on compliance-related items
    this.rolePermissionMatrix.set(
      'compliance_officer',
      new Set([
        'frameworks:read', 'frameworks:write', 'frameworks:approve', 'frameworks:export',
        'assessments:read', 'assessments:write', 'assessments:approve', 'assessments:export',
        'risks:read', 'risks:write', 'risks:approve', 'risks:export',
        'reports:read', 'reports:write', 'reports:approve', 'reports:export',
        'audit_logs:read', 'audit_logs:export',
        'settings:read',
      ])
    );

    // Risk Analyst: Read, write on risks, assessments, reports
    this.rolePermissionMatrix.set(
      'risk_analyst',
      new Set([
        'assessments:read', 'assessments:write', 'assessments:export',
        'risks:read', 'risks:write', 'risks:export',
        'reports:read', 'reports:write', 'reports:export',
        'frameworks:read',
        'agents:read',
      ])
    );

    // Auditor: Read and export on everything
    this.rolePermissionMatrix.set(
      'auditor',
      new Set([
        'frameworks:read', 'frameworks:export',
        'assessments:read', 'assessments:export',
        'risks:read', 'risks:export',
        'agents:read', 'agents:export',
        'reports:read', 'reports:export',
        'settings:read',
        'audit_logs:read', 'audit_logs:export',
        'crm:read', 'crm:export',
      ])
    );

    // Viewer: Read-only on everything except settings and crm
    this.rolePermissionMatrix.set(
      'viewer',
      new Set([
        'frameworks:read',
        'assessments:read',
        'risks:read',
        'agents:read',
        'reports:read',
        'audit_logs:read',
      ])
    );
  }

  /**
   * Check if a role has permission to perform an action on an entity
   */
  hasPermission(role: Role, entity: Entity, action: Action): boolean {
    const permissionKey = `${entity}:${action}`;
    const rolePermissions = this.rolePermissionMatrix.get(role);
    return rolePermissions ? rolePermissions.has(permissionKey) : false;
  }

  /**
   * Get all permissions for a specific role
   */
  getRolePermissions(role: Role): Permission[] {
    const permissionSet = this.rolePermissionMatrix.get(role);
    if (!permissionSet) return [];

    const permissions: Permission[] = [];
    permissionSet.forEach((perm) => {
      const [entity, action] = perm.split(':');
      if (entity && action) {
        permissions.push({
          entity: entity as Entity,
          action: action as Action,
        });
      }
    });

    return permissions;
  }

  /**
   * Get all roles with their permissions
   */
  getAllRoleDefinitions(): RolePermissions[] {
    const roles: Role[] = ['admin', 'compliance_officer', 'risk_analyst', 'auditor', 'viewer'];
    const descriptions: Record<Role, string> = {
      admin: 'Full access to all resources and actions',
      compliance_officer: 'Manage compliance frameworks, assessments, and approvals',
      risk_analyst: 'Analyze and manage risks and assessments',
      auditor: 'Read and export access to all resources',
      viewer: 'Read-only access to core resources',
    };

    return roles.map((role) => ({
      role,
      permissions: this.getRolePermissions(role),
      description: descriptions[role],
    }));
  }

  /**
   * Validate access for a user
   */
  validateAccess(userId: string, role: Role, entity: Entity, action: Action): AccessValidationResult {
    if (!userId || !role) {
      return {
        allowed: false,
        reason: 'Invalid user ID or role',
      };
    }

    const allowed = this.hasPermission(role, entity, action);

    return {
      allowed,
      reason: allowed
        ? `User ${userId} with role ${role} has permission to ${action} on ${entity}`
        : `User ${userId} with role ${role} does not have permission to ${action} on ${entity}`,
    };
  }

  /**
   * Get the permission matrix for debugging/display
   */
  getPermissionMatrix(): Record<Role, string[]> {
    const matrix: Record<Role, string[]> = {} as Record<Role, string[]>;

    this.rolePermissionMatrix.forEach((permissions, role) => {
      matrix[role] = Array.from(permissions).sort();
    });

    return matrix;
  }
}

export default RBACEngine;
