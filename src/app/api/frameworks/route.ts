import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import { validateFramework, normalizeControlId } from '@/lib/grc/parser';
import { getFramework } from '@/lib/grc/frameworks';
import type { ApiResponse } from '@/types';
import type { Framework } from '@/types';
import type { FrameworkResponse, FrameworkCategory } from '@/types/grc';

/**
 * GET /api/frameworks
 * List all frameworks with control counts
 * Public endpoint (no auth required for reading published frameworks)
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const supabase = await createServerSideClient();
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'published';

    // Fetch frameworks from database
    const { data, error } = await supabase
      .from('frameworks')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // For each framework, get the control count
    const frameworksWithCounts: FrameworkResponse[] = [];

    for (const f of (data as any[]) || []) {
      const { count, error: countError } = await supabase
        .from('controls')
        .select('*', { count: 'exact', head: true })
        .eq('framework_id', f.id);

      if (countError) {
        console.error('Error counting controls:', countError);
      }

      // Get categories
      const { data: controlsData } = await supabase
        .from('controls')
        .select('category')
        .eq('framework_id', f.id) as any;

      const categories = Array.from(
        new Map(
          (controlsData || []).map((c: any) => [
            c.category,
            {
              id: c.category,
              name: c.category,
              description: '',
              controlCount: (controlsData || []).filter((ctrl: any) => ctrl.category === c.category)
                .length,
            } as FrameworkCategory,
          ])
        ).values()
      );

      frameworksWithCounts.push({
        id: f.id,
        name: f.name,
        version: f.version,
        description: f.description || '',
        controlCount: count || 0,
        status: f.status as 'draft' | 'published' | 'archived',
        categories,
        createdAt: new Date(f.created_at),
        updatedAt: new Date(f.updated_at),
      });
    }

    return Response.json(
      {
        success: true,
        data: frameworksWithCounts,
        timestamp: new Date(),
      } as ApiResponse<FrameworkResponse[]>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch frameworks',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/frameworks
 * Create a new framework with controls
 * Requires authentication
 */
export async function POST(request: Request): Promise<Response> {
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

    const { name, version, description, sourceUrl, status = 'draft', controls } = body;

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
        source: sourceUrl || 'manual_upload',
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

    // Ensure status is valid
    if (!['draft', 'published', 'archived'].includes(status)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid status. Must be one of: draft, published, archived',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const supabase = await createServerSideClient();

    // Create framework
    const { data: frameworkData, error: frameworkError } = await supabase
      .from('frameworks')
      .insert([
        {
          name,
          version,
          description: description || '',
          source_url: sourceUrl,
          status,
        },
      ])
      .select()
      .single() as any;

    if (frameworkError || !frameworkData) {
      console.error('Framework creation error:', frameworkError);
      throw frameworkError || new Error('Failed to create framework');
    }

    const frameworkId = (frameworkData as any).id;

    // Insert controls if provided
    let controlCount = 0;
    if (controls && controls.length > 0) {
      const controlsToInsert = controls.map((control: any) => ({
        framework_id: frameworkId,
        control_id_str: normalizeControlId(control.id),
        title: control.title,
        description: control.description,
        category: control.category,
        control_type: control.controlType,
      }));

      const { error: controlsError, data: controlsData } = await supabase
        .from('controls')
        .insert(controlsToInsert)
        .select() as any;

      if (controlsError) {
        console.error('Controls insertion error:', controlsError);
        // Don't fail the entire request if controls insertion fails
        console.warn('Some controls could not be inserted');
      } else {
        controlCount = controlsData?.length || 0;
      }
    }

    const response: FrameworkResponse = {
      id: (frameworkData as any).id,
      name: (frameworkData as any).name,
      version: (frameworkData as any).version,
      description: (frameworkData as any).description || '',
      controlCount,
      status: (frameworkData as any).status as 'draft' | 'published' | 'archived',
      categories: [],
      createdAt: new Date((frameworkData as any).created_at),
      updatedAt: new Date((frameworkData as any).updated_at),
    };

    return Response.json(
      {
        success: true,
        data: response,
        timestamp: new Date(),
      } as ApiResponse<FrameworkResponse>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating framework:', error);
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
