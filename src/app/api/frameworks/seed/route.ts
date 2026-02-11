import { GrcIngestionAgent } from '@/lib/agents/grc-ingestion-agent';
import { store } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/frameworks/seed
 * Seed the database with ISO 27001:2022 controls using the GRC Ingestion Agent
 * This is an admin endpoint that can be called to populate built-in frameworks
 *
 * Uses in-memory store by default (no Supabase required)
 * Falls back to Supabase if SUPABASE_URL is configured
 *
 * Protected by environment variable check
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Verify this is a valid seed request (check for a seed key or admin context)
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.SEED_API_KEY || 'development-seed-key';

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${expectedKey}`) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized - seed endpoint requires valid API key in production',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    // Check if ISO 27001:2022 framework already exists in store
    const existingFramework = store.getFrameworkByName('ISO 27001:2022');
    if (existingFramework) {
      return Response.json(
        {
          success: false,
          error: 'ISO 27001:2022 framework already exists in the store',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 409 }
      );
    }

    // Create and run the GRC Ingestion Agent
    const agent = new GrcIngestionAgent({
      name: 'GRC-Ingestion-Seed',
      description: 'Seeds the framework store with ISO 27001:2022',
    });

    const agentResult = await agent.run();

    if (agentResult.status !== 'completed') {
      return Response.json(
        {
          success: false,
          error: agentResult.error || 'Agent failed to complete',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Get the seeded framework from the store
    const seededFramework = store.getFrameworkByName('ISO 27001:2022');
    if (!seededFramework) {
      return Response.json(
        {
          success: false,
          error: 'Framework was created but could not be retrieved from store',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    // Get controls for this framework
    const controls = store.getControls(seededFramework.id);
    const controlCount = controls.length;

    // Build category breakdown
    const categoryCounts = new Map<string, number>();
    controls.forEach((control) => {
      categoryCounts.set(control.category, (categoryCounts.get(control.category) || 0) + 1);
    });

    const categoryBreakdown = Array.from(categoryCounts.entries()).map(([category, count]) => ({
      category,
      count,
    }));

    // Build control type breakdown
    const typeCounts = new Map<string, number>();
    controls.forEach((control) => {
      typeCounts.set(control.controlType, (typeCounts.get(control.controlType) || 0) + 1);
    });

    const controlTypeBreakdown = Array.from(typeCounts.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    return Response.json(
      {
        success: true,
        data: {
          framework: {
            id: seededFramework.id,
            name: seededFramework.name,
            version: seededFramework.version,
            description: seededFramework.description,
            controlCount,
            status: seededFramework.status,
            createdAt: seededFramework.createdAt,
          },
          insertedControlCount: controlCount,
          categoryBreakdown,
          controlTypeBreakdown,
          agentMetrics: {
            agentName: agentResult.agentName,
            status: agentResult.status,
            latencyMs: agentResult.latencyMs,
            startedAt: agentResult.startedAt,
            completedAt: agentResult.completedAt,
          },
          message: 'ISO 27001:2022 framework successfully seeded via GRC Ingestion Agent',
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error seeding framework:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed framework',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/frameworks/seed
 * Check the status of seeded frameworks in the in-memory store
 */
export async function GET(request: Request): Promise<Response> {
  try {
    // Check for ISO 27001:2022 in the store
    const iso27001 = store.getFrameworkByName('ISO 27001:2022');

    if (iso27001) {
      // Get controls for this framework
      const controls = store.getControls(iso27001.id);
      const controlCount = controls.length;

      // Count by category
      const categoryCounts = new Map<string, number>();
      controls.forEach((control) => {
        categoryCounts.set(control.category, (categoryCounts.get(control.category) || 0) + 1);
      });

      // Count by control type
      const typeCounts = new Map<string, number>();
      controls.forEach((control) => {
        typeCounts.set(control.controlType, (typeCounts.get(control.controlType) || 0) + 1);
      });

      return Response.json(
        {
          success: true,
          data: {
            iso27001: {
              exists: true,
              id: iso27001.id,
              name: iso27001.name,
              version: iso27001.version,
              status: iso27001.status,
              controlCount,
              sourceUrl: iso27001.sourceUrl,
              createdAt: iso27001.createdAt,
              updatedAt: iso27001.updatedAt,
              categoryCounts: Object.fromEntries(categoryCounts),
              controlTypeCounts: Object.fromEntries(typeCounts),
            },
            storeStats: store.getStats(),
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    } else {
      return Response.json(
        {
          success: true,
          data: {
            iso27001: {
              exists: false,
              message: 'ISO 27001:2022 framework not found in store. Call POST to seed it.',
            },
            storeStats: store.getStats(),
          },
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error checking seed status:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to check seed status',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
