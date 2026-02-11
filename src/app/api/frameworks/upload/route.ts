/**
 * POST /api/frameworks/upload
 * Handle PDF/framework file uploads with text extraction and parsing
 * Accepts multipart form data with file or raw text content
 */

import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import { parseFrameworkText, validateParsedFramework } from '@/lib/pdf/parser';
import { normalizeControlId } from '@/lib/grc/parser';
import type { ApiResponse } from '@/types';
import type { FrameworkResponse } from '@/types/grc';

export const dynamic = 'force-dynamic';

/**
 * POST /api/frameworks/upload
 * Upload and parse a PDF or text file
 *
 * Request body (multipart/form-data):
 * - file: File object (optional, for multipart upload)
 * - content: string (optional, for pre-extracted text)
 * - frameworkName: string (optional, override parsed name)
 * - version: string (optional, override parsed version)
 *
 * Or JSON body:
 * {
 *   "content": "raw framework text (pre-extracted from PDF)",
 *   "frameworkName": "optional override",
 *   "version": "optional override",
 *   "publish": false
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

    // Determine request type (multipart or JSON)
    const contentType = request.headers.get('content-type') || '';
    let frameworkText = '';
    let overrideName = '';
    let overrideVersion = '';
    let publish = false;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const contentField = formData.get('content') as string | null;

      overrideName = (formData.get('frameworkName') as string) || '';
      overrideVersion = (formData.get('version') as string) || '';
      publish = (formData.get('publish') as string) === 'true';

      if (file) {
        // Read file content as text
        frameworkText = await file.text();
      } else if (contentField) {
        frameworkText = contentField;
      } else {
        return Response.json(
          {
            success: false,
            error: 'Must provide either file or content field',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }
    } else {
      // Handle JSON body
      try {
        const body = await request.json();
        frameworkText = body.content || '';
        overrideName = body.frameworkName || '';
        overrideVersion = body.version || '';
        publish = body.publish || false;
      } catch {
        return Response.json(
          {
            success: false,
            error: 'Invalid request format. Use multipart/form-data or application/json with content field',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }
    }

    // Validate content
    if (!frameworkText || frameworkText.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'Content is empty. Please provide PDF text or content',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (frameworkText.length > 10 * 1024 * 1024) {
      return Response.json(
        {
          success: false,
          error: 'Content exceeds maximum size of 10MB',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 413 }
      );
    }

    // Parse framework text
    let parsedFramework;
    try {
      parsedFramework = parseFrameworkText(frameworkText);
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : 'Failed to parse framework';
      return Response.json(
        {
          success: false,
          error: `Parsing error: ${errorMsg}`,
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Apply overrides if provided
    if (overrideName) parsedFramework.frameworkName = overrideName;
    if (overrideVersion) parsedFramework.version = overrideVersion;

    // Validate parsed framework
    if (!validateParsedFramework(parsedFramework)) {
      return Response.json(
        {
          success: false,
          error: 'Parsed framework is missing required fields (name, version, controls)',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Store in in-memory store (always available)
    const frameworkId = `fw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const framework = inMemoryStore.addFramework({
      id: frameworkId,
      name: parsedFramework.frameworkName,
      version: parsedFramework.version,
      description: `Framework imported from PDF on ${new Date().toLocaleDateString()}`,
      sourceUrl: 'pdf_upload',
      status: publish ? 'published' : 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      controlCount: parsedFramework.controls.length,
      categories: [],
    });

    // Add controls
    const controlsToStore = parsedFramework.controls.map((control) => ({
      id: `ctrl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      frameworkId,
      controlIdStr: normalizeControlId(control.id),
      title: control.title,
      description: control.description,
      category: control.category,
      controlType: 'technical' as const,
      createdAt: new Date(),
    }));

    inMemoryStore.addControls(frameworkId, controlsToStore);

    // Try to also save to Supabase if available
    try {
      const supabase = await createServerSideClient();
      const { data: frameworkData, error: frameworkError } = await supabase
        .from('frameworks')
        .insert([
          {
            name: parsedFramework.frameworkName,
            version: parsedFramework.version,
            description: `Framework imported from PDF on ${new Date().toLocaleDateString()}`,
            source_url: 'pdf_upload',
            status: publish ? 'published' : 'draft',
          },
        ])
        .select()
        .single();

      if (!frameworkError && frameworkData) {
        const dbFrameworkId = (frameworkData as any).id;

        // Insert controls to database
        const controlsToInsert = parsedFramework.controls.map((control) => ({
          framework_id: dbFrameworkId,
          control_id_str: normalizeControlId(control.id),
          title: control.title,
          description: control.description,
          category: control.category,
          control_type: 'technical',
        }));

        await supabase.from('controls').insert(controlsToInsert).select();
      }
    } catch (dbError) {
      // Supabase not available, continue with in-memory store
      console.warn('Supabase not available, using in-memory store only');
    }

    // Build response
    const categories = Array.from(
      new Map(
        parsedFramework.controls.map((c) => [
          c.category,
          {
            id: c.category,
            name: c.category,
            description: '',
            controlCount: parsedFramework.controls.filter((ctrl) => ctrl.category === c.category)
              .length,
          },
        ])
      ).values()
    );

    const response: FrameworkResponse = {
      id: frameworkId,
      name: parsedFramework.frameworkName,
      version: parsedFramework.version,
      description: `Framework imported from PDF on ${new Date().toLocaleDateString()}`,
      controlCount: parsedFramework.controls.length,
      status: publish ? 'published' : 'draft',
      categories,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return Response.json(
      {
        success: true,
        data: {
          framework: response,
          controlsImported: parsedFramework.controls.length,
          categoriesDetected: categories.length,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading framework:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload framework',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
