/**
 * Tenant Management API
 * GET: Return current user's tenant info
 * POST: Create new tenant (during onboarding)
 * PATCH: Update tenant settings
 */

import { auth } from '@clerk/nextjs/server';
import { tenantManager, Tenant } from '@/lib/tenancy/tenant-manager';
import { requireTenant } from '@/lib/tenancy/middleware-helpers';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tenants
 * Get current user's tenant information
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

    const tenant = await tenantManager.getTenantFromClerkUser(userId);

    if (!tenant) {
      return Response.json(
        {
          success: false,
          error: 'No tenant found for user',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: tenant,
        timestamp: new Date(),
      } as ApiResponse<Tenant>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tenant',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants
 * Create new tenant during onboarding
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const { userId, user } = await auth();

    if (!userId || !user) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

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

    const { name, slug, plan = 'starter' } = body;

    // Validate required fields
    if (!name || !slug) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: name, slug',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate plan
    if (!['starter', 'professional', 'enterprise'].includes(plan)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid plan. Must be one of: starter, professional, enterprise',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Check if tenant with slug already exists
    const existingTenant = tenantManager.getTenantBySlug(slug);
    if (existingTenant) {
      return Response.json(
        {
          success: false,
          error: 'Tenant slug already exists',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 409 }
      );
    }

    // Create tenant
    const tenant = tenantManager.createTenant(name, slug, userId, plan);

    return Response.json(
      {
        success: true,
        data: tenant,
        timestamp: new Date(),
      } as ApiResponse<Tenant>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tenant:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tenant',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tenants
 * Update tenant settings
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const { tenant, userId } = await requireTenant(request);

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

    const { name, plan, settings } = body;

    // Only allow owner to update
    if (tenant.ownerId !== userId) {
      return Response.json(
        {
          success: false,
          error: 'Only tenant owner can update settings',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Prepare updates
    const updates: Partial<Tenant> = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (plan !== undefined) {
      if (!['starter', 'professional', 'enterprise'].includes(plan)) {
        return Response.json(
          {
            success: false,
            error: 'Invalid plan',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }
      updates.plan = plan;
    }

    if (settings !== undefined && typeof settings === 'object') {
      updates.settings = {
        ...tenant.settings,
        ...settings,
      };
    }

    // Update tenant
    const updatedTenant = tenantManager.updateTenant(tenant.id, updates);

    if (!updatedTenant) {
      return Response.json(
        {
          success: false,
          error: 'Failed to update tenant',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        data: updatedTenant,
        timestamp: new Date(),
      } as ApiResponse<Tenant>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tenant:', error);

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

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return Response.json(
        {
          success: false,
          error: 'Forbidden',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 403 }
      );
    }

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update tenant',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
