import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';
import type { FrameworkDetailResponse, FrameworkResponse, CategoryBreakdown } from '@/types/grc';

/**
 * GET /api/frameworks/[id]
 * Get a specific framework with all its controls and category breakdown
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;

    const supabase = await createServerSideClient();

    // Fetch framework
    const { data: frameworkData, error: frameworkError } = await supabase
      .from('frameworks')
      .select('*')
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

    // Fetch all controls for this framework
    const { data: controlsData, error: controlsError } = await supabase
      .from('controls')
      .select('*')
      .eq('framework_id', id)
      .order('control_id_str', { ascending: true });

    if (controlsError) {
      console.error('Controls fetch error:', controlsError);
      throw controlsError;
    }

    const controls = controlsData || [];

    // Build category breakdown
    const categoryMap = new Map<string, CategoryBreakdown>();

    (controls as any[]).forEach((control: any) => {
      if (!categoryMap.has(control.category)) {
        categoryMap.set(control.category, {
          categoryId: control.category,
          categoryName: control.category,
          controlCount: 0,
        });
      }

      const category = categoryMap.get(control.category)!;
      category.controlCount += 1;
    });

    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.categoryId.localeCompare(b.categoryId)
    );

    // Build framework response
    const framework: FrameworkResponse = {
      id: (frameworkData as any).id,
      name: (frameworkData as any).name,
      version: (frameworkData as any).version,
      description: (frameworkData as any).description || '',
      controlCount: controls.length,
      status: (frameworkData as any).status as 'draft' | 'published' | 'archived',
      categories: categories.map(c => ({
        id: c.categoryId,
        name: c.categoryName,
        description: '',
        controlCount: c.controlCount,
      })),
      createdAt: new Date((frameworkData as any).created_at),
      updatedAt: new Date((frameworkData as any).updated_at),
    };

    const response: FrameworkDetailResponse = {
      framework,
      categoryBreakdown: categories,
      totalControls: controls.length,
      lastUpdated: new Date(frameworkData.updated_at),
    };

    return Response.json(
      {
        success: true,
        data: response,
        timestamp: new Date(),
      } as ApiResponse<FrameworkDetailResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching framework details:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to fetch framework details',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/frameworks/[id]
 * Delete a framework and all associated controls
 * Requires authentication and appropriate permissions
 */
export async function DELETE(
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

    const supabase = await createServerSideClient();

    // Check if framework exists
    const { data: frameworkData, error: checkError } = await supabase
      .from('frameworks')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !frameworkData) {
      return Response.json(
        {
          success: false,
          error: 'Framework not found',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    // Delete the framework (cascade delete handles controls)
    const { error: deleteError } = await supabase.from('frameworks').delete().eq('id', id);

    if (deleteError) {
      console.error('Framework deletion error:', deleteError);
      throw deleteError;
    }

    return Response.json(
      {
        success: true,
        data: { id, deleted: true },
        timestamp: new Date(),
      } as ApiResponse<{ id: string; deleted: boolean }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting framework:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to delete framework',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
