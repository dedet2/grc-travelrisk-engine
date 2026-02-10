import { auth } from '@clerk/nextjs/server';
import { createServerSideClient } from '@/lib/supabase/server';
import type { ApiResponse } from '@/types';
import type { Framework } from '@/types';

export async function GET(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const supabase = await createServerSideClient();
    const { data, error } = await supabase
      .from('frameworks')
      .select('*')
      .eq('status', 'published');

    if (error) {
      throw error;
    }

    const frameworks = (data || []).map((f) => ({
      id: f.id,
      name: f.name,
      version: f.version,
      description: f.description,
      sourceUrl: f.source_url,
      status: f.status as 'draft' | 'published' | 'archived',
      createdAt: new Date(f.created_at),
      updatedAt: new Date(f.updated_at),
    })) as Framework[];

    return Response.json({
      success: true,
      data: frameworks,
      timestamp: new Date(),
    } as ApiResponse<Framework[]>);
  } catch (error) {
    console.error('Error fetching frameworks:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch frameworks' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { success: false, error: 'Unauthorized' } as ApiResponse<null>,
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, version, description, sourceUrl, status } = body;

    const supabase = await createServerSideClient();
    const { data, error } = await supabase
      .from('frameworks')
      .insert([
        {
          name,
          version,
          description,
          source_url: sourceUrl,
          status: status || 'draft',
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const framework: Framework = {
      id: data.id,
      name: data.name,
      version: data.version,
      description: data.description,
      sourceUrl: data.source_url,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    return Response.json(
      {
        success: true,
        data: framework,
        timestamp: new Date(),
      } as ApiResponse<Framework>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating framework:', error);
    return Response.json(
      { success: false, error: 'Failed to create framework' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
