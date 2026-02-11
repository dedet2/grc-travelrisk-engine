import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import { parseFrameworkDocument, validateFramework, normalizeControlId } from '@/lib/grc/parser';
import type { ApiResponse } from '@/types';
import type { FrameworkResponse } from '@/types/grc';

export const dynamic = 'force-dynamic';

/**
 * POST /api/frameworks/ingest
 * Parse and ingest a GRC framework document
 * Supports: CSV, JSON, plain text (with Claude API)
 *
 * Request body:
 * {
 *   "format": "csv" | "json" | "text",
 *   "content": "raw file content as string",
 *   "frameworkName": "optional framework name override",
 *   "version": "optional version override",
 *   "description": "optional description override",
 *   "publish": boolean (default: false)
 * }
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

    const { format, content, frameworkName, version, description, publish = false } = body;

    // Validate required fields
    if (!format || !content) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: format, content',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate format
    if (!['csv', 'json', 'text'].includes(format)) {
      return Response.json(
        {
          success: false,
          error: 'Invalid format. Must be one of: csv, json, text',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Validate content length
    if (typeof content !== 'string' || content.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'Content must be a non-empty string',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (content.length > 10 * 1024 * 1024) {
      // 10MB limit
      return Response.json(
        {
          success: false,
          error: 'Content exceeds maximum size of 10MB',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 413 }
      );
    }

    // Parse framework document
    let parsedFramework;
    try {
      parsedFramework = await parseFrameworkDocument(content, format as any);
    } catch (parseError) {
      console.error('Framework parsing error:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Failed to parse framework';
      return Response.json(
        {
          success: false,
          error: `Parsing error: ${errorMessage}`,
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Override framework metadata if provided
    if (frameworkName) parsedFramework.name = frameworkName;
    if (version) parsedFramework.version = version;
    if (description) parsedFramework.description = description;

    // Validate parsed framework
    const validation = validateFramework(parsedFramework);
    if (!validation.isValid) {
      return Response.json(
        {
          success: false,
          error: `Validation errors: ${validation.errors.join('; ')}`,
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
          name: parsedFramework.name,
          version: parsedFramework.version,
          description: parsedFramework.description,
          source_url: parsedFramework.source,
          status: publish ? 'published' : 'draft',
        },
      ])
      .select()
      .single();

    if (frameworkError || !frameworkData) {
      console.error('Framework creation error:', frameworkError);
      throw frameworkError || new Error('Failed to create framework');
    }

    const frameworkId = frameworkData.id;

    // Insert controls
    let controlCount = 0;
    if (parsedFramework.controls.length > 0) {
      const controlsToInsert = parsedFramework.controls.map((control) => ({
        framework_id: frameworkId,
        control_id_str: normalizeControlId(control.id),
        title: control.title,
        description: control.description,
        category: control.category,
        control_type: control.controlType,
      }));

      const { data: controlsData, error: controlsError } = await supabase
        .from('controls')
        .insert(controlsToInsert)
        .select() as any;

      if (controlsError) {
        console.error('Controls insertion error:', controlsError);
        throw controlsError;
      }

      controlCount = controlsData?.length || 0;
    }

    // Get categories
    const { data: categoriesQueryData } = await supabase
      .from('controls')
      .select('category')
      .eq('framework_id', frameworkId) as any;

    const categories = Array.from(
      new Map(
        (categoriesQueryData || []).map((c: any) => [
          c.category,
          {
            id: c.category,
            name: c.category,
            description: '',
            controlCount: (categoriesQueryData || []).filter((ctrl: any) => ctrl.category === c.category)
              .length,
          },
        ])
      ).values()
    );

    const response: FrameworkResponse = {
      id: (frameworkData as any).id,
      name: (frameworkData as any).name,
      version: (frameworkData as any).version,
      description: (frameworkData as any).description || '',
      controlCount,
      status: (frameworkData as any).status as 'draft' | 'published' | 'archived',
      categories,
      createdAt: new Date((frameworkData as any).created_at),
      updatedAt: new Date((frameworkData as any).updated_at),
    };

    return Response.json(
      {
        success: true,
        data: {
          framework: response,
          parseMetadata: parsedFramework.metadata,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error ingesting framework:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to ingest framework',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
