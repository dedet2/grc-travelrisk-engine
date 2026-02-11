/**
 * Role-Based Access Control (RBAC) System
 * Provides permission management for admin, analyst, and viewer roles
 */

import { auth } from '@clerk/nextjs/server';

export type UserRole = 'admin' | 'analyst' | 'viewer';

export interface RolePermissions {
  canManageUsers: boolean;
  canManageIntegrations: boolean;
  canAccessAuditLogs: boolean;
  canCreateFrameworks: boolean;
  canEditFrameworks: boolean;
  canDeleteFrameworks: boolean;
  canRunAssessments: boolean;
  canEditAssessments: boolean;
  canExportReports: boolean;
  canAccessWebhooks: boolean;
  canConfigureWebhooks: boolean;
  canViewAnalytics: boolean;
  canExecuteAutomations: boolean;
  canModifyAirtable: boolean;
}

const rolePermissionMap: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageIntegrations: true,
    canAccessAuditLogs: true,
    canCreateFrameworks: true,
    canEditFrameworks: true,
    canDeleteFrameworks: true,
    canRunAssessments: true,
    canEditAssessments: true,
    canExportReports: true,
    canAccessWebhooks: true,
    canConfigureWebhooks: true,
    canViewAnalytics: true,
    canExecuteAutomations: true,
    canModifyAirtable: true,
  },
  analyst: {
    canManageUsers: false,
    canManageIntegrations: false,
    canAccessAuditLogs: false,
    canCreateFrameworks: true,
    canEditFrameworks: true,
    canDeleteFrameworks: false,
    canRunAssessments: true,
    canEditAssessments: true,
    canExportReports: true,
    canAccessWebhooks: false,
    canConfigureWebhooks: false,
    canViewAnalytics: true,
    canExecuteAutomations: false,
    canModifyAirtable: false,
  },
  viewer: {
    canManageUsers: false,
    canManageIntegrations: false,
    canAccessAuditLogs: false,
    canCreateFrameworks: false,
    canEditFrameworks: false,
    canDeleteFrameworks: false,
    canRunAssessments: false,
    canEditAssessments: false,
    canExportReports: true,
    canAccessWebhooks: false,
    canConfigureWebhooks: false,
    canViewAnalytics: true,
    canExecuteAutomations: false,
    canModifyAirtable: false,
  },
};

/**
 * In-memory store for user roles (keyed by Clerk userId)
 * In production, this would be backed by a database
 */
const userRoles = new Map<string, UserRole>();

/**
 * Get the role for a user
 * Falls back to 'viewer' if not explicitly assigned
 */
export function getUserRole(userId: string): UserRole {
  return userRoles.get(userId) || 'viewer';
}

/**
 * Set the role for a user (admin only)
 */
export function setUserRole(userId: string, role: UserRole): void {
  userRoles.set(userId, role);
}

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return rolePermissionMap[role];
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userId: string, permission: keyof RolePermissions): boolean {
  const role = getUserRole(userId);
  const permissions = getRolePermissions(role);
  return permissions[permission];
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userId: string, permissions: (keyof RolePermissions)[]): boolean {
  return permissions.some((perm) => hasPermission(userId, perm));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userId: string, permissions: (keyof RolePermissions)[]): boolean {
  return permissions.every((perm) => hasPermission(userId, perm));
}

/**
 * Require a specific role or throw 401
 */
export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: No user session');
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const userRole = getUserRole(userId);

  if (!roles.includes(userRole)) {
    throw new Error(`Forbidden: User role '${userRole}' does not have access`);
  }

  return userId;
}

/**
 * Require a specific permission or throw 403
 */
export async function requirePermission(permission: keyof RolePermissions): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized: No user session');
  }

  if (!hasPermission(userId, permission)) {
    throw new Error(`Forbidden: User does not have '${permission}' permission`);
  }

  return userId;
}

/**
 * Get current user's role from Clerk session
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const { userId } = await auth();

  if (!userId) {
    return 'viewer';
  }

  return getUserRole(userId);
}

/**
 * Middleware helper to check Clerk auth and return userId
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

/**
 * Get all assigned roles (for admin dashboard)
 */
export function getAllUserRoles(): Array<{ userId: string; role: UserRole }> {
  return Array.from(userRoles.entries()).map(([userId, role]) => ({
    userId,
    role,
  }));
}
