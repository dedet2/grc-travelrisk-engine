import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import { validateFramework, normalizeControlId } from '@/lib/grc/parser';
import { getFramework } from '@/lib/grc/frameworks';
import { supabaseStore } from '@/lib/store/supabase-store';
import { dataService } from '@/lib/supabase/data-service';
import type { ApiResponse } from '@/types';
import type { Framework } from '@/types';
import type { FrameworkResponse, FrameworkCategory } from '@/types/grc';

export const dynamic = 'force-dynamic';

/**
 * GET /api/frameworks
 * List all frameworks with control counts
 * Public endpoint (no auth required for reading published frameworks)
 * Uses DataService with Supabase-first, in-memory fallback pattern
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'published';

    // Use DataService to fetch frameworks (Supabase first, fallback to in-memory)
    const frameworks = await dataService.getFrameworks();
    const frameworksWithCounts: FrameworkResponse[] = frameworks
      .filter((f) => f.status === status || status === 'all')
      .map((f) => {
        // Get controls for category/type breakdowns
        const controls = supabaseStore.getControls(f.id);
        const categoryCounts: Record<string, number> = {};
        const typeCounts: Record<string, number> = {};
        controls.forEach((c) => {
          categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
          typeCounts[c.controlType] = (typeCounts[c.controlType] || 0) + 1;
        });

        return {
          id: f.id,
          name: f.name,
          version: f.version,
          description: f.description,
          controlCount: controls.length || f.controlCount,
          status: f.status,
          categories: f.categories || [],
          categoryCounts,
          typeCounts,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
        };
      });

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
        error: error instanceof Error ? error.message : 'Failed to fetch frameworks',
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

    // Log the data source being used
    const dataSourceMode = dataService.getMode();
    console.log(`Creating framework with DataService (mode: ${dataSourceMode})`);

    let supabase;
    let useInMemory = false;

    // Try to create Supabase client, fall back to in-memory store if not configured
    try {
      supabase = await createServerSideClient();
    } catch (e) {
      console.warn('Supabase not configured, using in-memory store:', e instanceof Error ? e.message : String(e));
      useInMemory = true;
    }

    let response: FrameworkResponse;

    if (useInMemory) {
      // Store in in-memory store
      const frameworkId = `fw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const framework = supabaseStore.addFramework({
        id: frameworkId,
        name,
        version,
        description: description || '',
        sourceUrl,
        status: status as 'draft' | 'published' | 'archived',
        createdAt: new Date(),
        updatedAt: new Date(),
        controlCount: controls?.length || 0,
        categories: [],
      });

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
          createdAt: new Date(),
        }));
        supabaseStore.addControls(frameworkId, controlsToStore);
      }

      response = {
        id: framework.id,
        name: framework.name,
        version: framework.version,
        description: framework.description,
        controlCount: controls?.length || 0,
        status: framework.status,
        categories: [],
        createdAt: framework.createdAt,
        updatedAt: framework.updatedAt,
      };
    } else {
      // Create framework in database
      const { data: frameworkData, error: frameworkError } = await supabase!
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

        const { error: controlsError, data: controlsData } = await supabase!
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

      response = {
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
    }

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
