/**
 * Tenant Middleware Helpers
 * Utility functions for resolving and validating tenants in API routes
 */

import { auth } from '@clerk/nextjs/server';
import { tenantManager, Tenant } from '@/lib/tenancy/tenant-manager';

/**
 * Resolve tenant from user ID
 * Looks up tenant from Clerk user ID
 */
export async function resolveTenant(userId: string): Promise<Tenant | null> {
  try {
    const tenant = await tenantManager.getTenantFromClerkUser(userId);
    if (!tenant) {
      // Try to auto-create tenant if it doesn't exist
      const { user } = await auth();
      if (user?.emailAddresses && user.emailAddresses.length > 0) {
        const email = user.emailAddresses[0].emailAddress;
        return await tenantManager.ensureTenantForUser(userId, email);
      }
      return null;
    }
    return tenant;
  } catch (error) {
    console.error('Error resolving tenant:', error);
    return null;
  }
}

/**
 * Require tenant in request
 * Extracts and validates tenant from request headers or auth context
 * Returns tenant or throws 401/403 error
 */
export async function requireTenant(
  req: Request
): Promise<{ tenant: Tenant; userId: string }> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error('Unauthorized: No user ID');
    }

    const tenant = await resolveTenant(userId);

    if (!tenant) {
      throw new Error('Forbidden: No tenant found for user');
    }

    return { tenant, userId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Tenant validation error:', message);
    throw error;
  }
}

/**
 * Validate tenant access
 * Checks if user has access to requested tenant
 */
export function validateTenantAccess(tenantId: string, userId: string): boolean {
  return tenantManager.validateTenantAccess(tenantId, userId);
}

/**
 * Extract tenant ID from request
 * Tries to get tenant ID from:
 * 1. x-tenant-id header
 * 2. tenant query parameter
 * 3. User's default tenant
 */
export async function extractTenantId(req: Request): Promise<string | null> {
  const url = new URL(req.url);

  // Try header
  const headerTenantId = req.headers.get('x-tenant-id');
  if (headerTenantId) {
    return headerTenantId;
  }

  // Try query param
  const paramTenantId = url.searchParams.get('tenantId');
  if (paramTenantId) {
    return paramTenantId;
  }

  // Try to get user's default tenant
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const tenant = await resolveTenant(userId);
  return tenant?.id || null;
}

/**
 * Create tenant-scoped query context
 * Returns helper for adding tenantId to database queries
 */
export function createTenantScope(tenantId: string) {
  return {
    /**
     * Add tenantId filter to Supabase query
     */
    eq: (filterValue: any) => ({ tenant_id: tenantId, ...filterValue }),

    /**
     * Create scoped filter object
     */
    filter: (additionalFilters: Record<string, any> = {}) => ({
      tenant_id: tenantId,
      ...additionalFilters,
    }),

    /**
     * Wrap data with tenant context
     */
    wrap: (data: any) => ({
      ...data,
      tenant_id: tenantId,
    }),
  };
}

/**
 * Middleware helper for API routes
 * Usage in route handler:
 * export async function GET(request: Request) {
 *   const { tenant, userId } = await requireTenant(request);
 *   // Now you have tenant context
 * }
 */
export const tenantMiddleware = {
  resolveTenant,
  requireTenant,
  validateTenantAccess,
  extractTenantId,
  createTenantScope,
};

export default tenantMiddleware;
