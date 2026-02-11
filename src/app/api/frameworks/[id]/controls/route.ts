import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';
import type { ControlsResponse, DetailedControl } from '@/types/grc';

export const dynamic = 'force-dynamic';

/**
 * GET /api/frameworks/[id]/controls
 * Get controls for a specific framework with optional filtering by category
 * Query params:
 *   - category: Filter by category (e.g., "A.5")
 *   - controlType: Filter by control type (technical, operational, management)
 *   - limit: Limit results (default: 100)
 *   - offset: Pagination offset (default: 0)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const url = new URL(request.url);

    // Get query parameters
    const category = url.searchParams.get('category');
    const controlType = url.searchParams.get('controlType');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 1000);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    let supabase;
    let useInMemory = false;

    // Try to create Supabase client, fall back to in-memory store if not configured
    try {
      supabase = await createServerSideClient();
    } catch (e) {
      console.warn('Supabase not configured, using in-memory store:', e instanceof Error ? e.message : String(e));
      useInMemory = true;
    }

    let controls: DetailedControl[] = [];
    let total: number = 0;

    if (useInMemory) {
      // Verify framework exists in in-memory store
      const framework = inMemoryStore.getFramework(id);
      if (!framework) {
        return Response.json(
          {
            success: false,
            error: 'Framework not found',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      // Get controls from in-memory store
      let allControls = inMemoryStore.getControls(id);

      // Apply filters
      if (category) {
        allControls = allControls.filter((c) => c.category === category);
      }

      if (controlType) {
        if (!['technical', 'operational', 'management'].includes(controlType)) {
          return Response.json(
            {
              success: false,
              error: 'Invalid controlType. Must be one of: technical, operational, management',
              timestamp: new Date(),
            } as ApiResponse<null>,
            { status: 400 }
          );
        }
        allControls = allControls.filter((c) => c.controlType === controlType);
      }

      total = allControls.length;

      // Apply pagination
      const paginatedControls = allControls.slice(offset, offset + limit);

      controls = paginatedControls.map((control) => ({
        id: control.id,
        frameworkId: control.frameworkId,
        controlIdStr: control.controlIdStr,
        category: control.category,
        title: control.title,
        description: control.description,
        controlType: control.controlType,
        createdAt: control.createdAt,
      }));
    } else {
      // Verify framework exists
      const { data: frameworkData, error: frameworkError } = await supabase!
        .from('frameworks')
        .select('id, name, version')
        .eq('id', id)
        .single();

      if (frameworkError || !frameworkData) {
        return Response.json(
          {
            success: false,
            error: 'Framework not found',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      // Build query
      let query = supabase!
        .from('controls')
        .select('*', { count: 'exact' })
        .eq('framework_id', id);

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }

      if (controlType) {
        if (!['technical', 'operational', 'management'].includes(controlType)) {
          return Response.json(
            {
              success: false,
              error: 'Invalid controlType. Must be one of: technical, operational, management',
              timestamp: new Date(),
            } as ApiResponse<null>,
            { status: 400 }
          );
        }
        query = query.eq('control_type', controlType);
      }

      // Apply pagination
      query = query.order('control_id_str', { ascending: true }).range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Controls query error:', error);
        throw error;
      }

      total = count || 0;

      // Transform controls to detailed format
      controls = (data || []).map((control: any) => ({
        id: control.id,
        frameworkId: control.framework_id,
        controlIdStr: control.control_id_str,
        category: control.category,
        title: control.title,
        description: control.description,
        controlType: control.control_type as 'technical' | 'operational' | 'management',
        createdAt: new Date(control.created_at),
      }));
    }

    const response: ControlsResponse = {
      controls,
      total,
      category: category || undefined,
      frameworkId: id,
    };

    return Response.json(
      {
        success: true,
        data: response,
        timestamp: new Date(),
      } as ApiResponse<ControlsResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching controls:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch controls',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/frameworks/[id]/controls
 * Add controls to an existing framework
 * Requires authentication
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
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

    const { id } = await params;

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

    const { controls } = body;

    // Validate controls array
    if (!Array.isArray(controls) || controls.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'Controls must be a non-empty array',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate each control
    const validationErrors: string[] = [];
    for (let i = 0; i < controls.length; i++) {
      const control = controls[i];
      if (!control.id) validationErrors.push(`Control ${i}: Missing id`);
      if (!control.title) validationErrors.push(`Control ${i}: Missing title`);
      if (!control.category) validationErrors.push(`Control ${i}: Missing category`);
      if (!['technical', 'operational', 'management'].includes(control.controlType)) {
        validationErrors.push(`Control ${i}: Invalid controlType`);
      }
    }

    if (validationErrors.length > 0) {
      return Response.json(
        {
          success: false,
          error: `Validation errors: ${validationErrors.join('; ')}`,
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    let supabase;
    let useInMemory = false;

    // Try to create Supabase client, fall back to in-memory store if not configured
    try {
      supabase = await createServerSideClient();
    } catch (e) {
      console.warn('Supabase not configured, using in-memory store:', e instanceof Error ? e.message : String(e));
      useInMemory = true;
    }

    if (useInMemory) {
      // Verify framework exists
      const framework = inMemoryStore.getFramework(id);
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

      // Add controls to in-memory store
      const controlsToAdd = controls.map((control: any) => ({
        id: `ctrl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        frameworkId: id,
        controlIdStr: control.id.toString().trim().toUpperCase(),
        title: control.title.toString(),
        description: control.description?.toString() || '',
        category: control.category.toString(),
        controlType: control.controlType.toString() as 'technical' | 'operational' | 'management',
        createdAt: new Date(),
      }));

      inMemoryStore.addControls(id, controlsToAdd);

      return Response.json(
        {
          success: true,
          data: {
            frameworkId: id,
            insertedCount: controlsToAdd.length,
            controls: controlsToAdd,
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 201 }
      );
    } else {
      // Verify framework exists
      const { data: frameworkData, error: frameworkError } = await supabase!
        .from('frameworks')
        .select('id')
        .eq('id', id)
        .single();

      if (frameworkError || !frameworkData) {
        return Response.json(
          {
            success: false,
            error: 'Framework not found',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      // Prepare controls for insertion
      const controlsToInsert = controls.map((control: any) => ({
        framework_id: id,
        control_id_str: control.id.toString().trim().toUpperCase(),
        title: control.title.toString(),
        description: control.description?.toString() || '',
        category: control.category.toString(),
        control_type: control.controlType.toString(),
      }));

      // Insert controls
      const { data: insertedControls, error: insertError } = await supabase!
        .from('controls')
        .insert(controlsToInsert)
        .select();

      if (insertError) {
        console.error('Controls insertion error:', insertError);
        throw insertError;
      }

      const insertedCount = insertedControls?.length || 0;

      return Response.json(
        {
          success: true,
          data: {
            frameworkId: id,
            insertedCount,
            controls: insertedControls || [],
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error adding controls:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to add controls to framework',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
