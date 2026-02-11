/**
 * Custom Framework API
 * POST: Save custom framework
 * GET: List user's custom frameworks
 * PUT: Update draft framework
 */

import { auth } from '@clerk/nextjs/server';
import { requireTenant } from '@/lib/tenancy/middleware-helpers';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import { validateFramework, normalizeControlId } from '@/lib/grc/parser';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// In-memory storage for custom frameworks (would be database in production)
const customFrameworks = new Map<string, any>();

/**
 * GET /api/frameworks/custom
 * List user's custom frameworks
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { tenant, userId } = await requireTenant(request);

    // Get custom frameworks for this tenant
    const frameworks = Array.from(customFrameworks.values()).filter(
      (f) => f.tenantId === tenant.id
    );

    return Response.json(
      {
        success: true,
        data: frameworks,
        timestamp: new Date(),
      } as ApiResponse<any[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching custom frameworks:', error);

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
        error: error instanceof Error ? error.message : 'Failed to fetch frameworks',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/frameworks/custom
 * Save custom framework
 */
export async function POST(request: Request): Promise<Response> {
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

    const { name, version, description, controls, status = 'draft' } = body;

    // Validate required fields
    if (!name || !version) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: name, version',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate status
    if (!['draft', 'published'].includes(status)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid status. Must be one of: draft, published',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate controls array if provided
    if (controls && !Array.isArray(controls)) {
      return Response.json(
        {
          success: false,
          error: 'Controls must be an array',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate control structure
    if (controls && controls.length > 0) {
      const controlValidation = validateFramework({
        name,
        version,
        description,
        source: 'custom_framework',
        controls,
        metadata: {},
      });

      if (!controlValidation.isValid) {
        return Response.json(
          {
            success: false,
            error: `Invalid controls: ${controlValidation.errors.join('; ')}`,
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }
    }

    // Create framework in in-memory store
    const frameworkId = `custom-fw-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const customFramework = {
      id: frameworkId,
      name,
      version,
      description: description || '',
      status: status as 'draft' | 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      controlCount: controls?.length || 0,
      categories: [],
      tenantId: tenant.id,
      ownerId: userId,
      isCustom: true,
    };

    // Store in in-memory store for consistency
    inMemoryStore.addFramework(customFramework);

    // Add controls if provided
    if (controls && controls.length > 0) {
      const controlsToStore = controls.map((control: any) => ({
        id: `ctrl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        frameworkId,
        controlIdStr: normalizeControlId(control.id),
        title: control.title,
        description: control.description,
        category: control.category,
        controlType: control.controlType as 'technical' | 'operational' | 'management',
        criticality: control.criticality,
        weight: control.weight,
        createdAt: new Date(),
      }));
      inMemoryStore.addControls(frameworkId, controlsToStore);
    }

    // Store in custom frameworks map
    customFrameworks.set(frameworkId, customFramework);

    return Response.json(
      {
        success: true,
        data: customFramework,
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating custom framework:', error);

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
        error: error instanceof Error ? error.message : 'Failed to create framework',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/frameworks/custom
 * Update draft custom framework
 */
export async function PUT(request: Request): Promise<Response> {
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

    const { frameworkId, name, version, description, controls, status } = body;

    if (!frameworkId) {
      return Response.json(
        {
          success: false,
          error: 'Missing required field: frameworkId',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get framework
    const framework = customFrameworks.get(frameworkId);
    if (!framework) {
      return Response.json(
        {
          success: false,
          error: 'Framework not found',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Verify ownership
    if (framework.ownerId !== userId || framework.tenantId !== tenant.id) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 403 }
      );
    }

    // Only allow updates to draft frameworks
    if (framework.status !== 'draft') {
      return Response.json(
        {
          success: false,
          error: 'Can only update draft frameworks',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['draft', 'published'].includes(status)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid status',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Prepare updates
    const updatedFramework = {
      ...framework,
      name: name || framework.name,
      version: version || framework.version,
      description: description !== undefined ? description : framework.description,
      status: status || framework.status,
      updatedAt: new Date(),
    };

    // Update in store
    customFrameworks.set(frameworkId, updatedFramework);
    inMemoryStore.updateFramework(frameworkId, updatedFramework);

    // Update controls if provided
    if (controls && Array.isArray(controls)) {
      // Clear old controls
      const oldControls = inMemoryStore.getControls(frameworkId);
      oldControls.forEach((ctrl) => {
        inMemoryStore.deleteControl(frameworkId, ctrl.controlIdStr);
      });

      // Add new controls
      const newControls = controls.map((control: any) => ({
        id: `ctrl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        frameworkId,
        controlIdStr: normalizeControlId(control.id),
        title: control.title,
        description: control.description,
        category: control.category,
        controlType: control.controlType,
        criticality: control.criticality,
        weight: control.weight,
        createdAt: new Date(),
      }));
      inMemoryStore.addControls(frameworkId, newControls);

      updatedFramework.controlCount = newControls.length;
      customFrameworks.set(frameworkId, updatedFramework);
    }

    return Response.json(
      {
        success: true,
        data: updatedFramework,
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating custom framework:', error);

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
        error: error instanceof Error ? error.message : 'Failed to update framework',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
