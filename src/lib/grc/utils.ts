import { createServerSideClient } from '@/lib/supabase/server';
import type { DetailedControl, FrameworkCategory } from '@/types/grc';

/**
 * Get framework by ID from database
 */
export async function getFrameworkById(frameworkId: string) {
  const supabase = await createServerSideClient();

  const { data, error } = await supabase
    .from('frameworks')
    .select('*')
    .eq('id', frameworkId)
    .single();

  if (error) {
    console.error('Error fetching framework:', error);
    return null;
  }

  return data;
}

/**
 * Get controls for a framework from database
 */
export async function getFrameworkControls(
  frameworkId: string,
  filters?: {
    category?: string;
    controlType?: 'technical' | 'operational' | 'management';
  }
): Promise<DetailedControl[]> {
  const supabase = await createServerSideClient();

  let query = supabase.from('controls').select('*').eq('framework_id', frameworkId);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.controlType) {
    query = query.eq('control_type', filters.controlType);
  }

  const { data, error } = await query.order('control_id_str', { ascending: true });

  if (error) {
    console.error('Error fetching controls:', error);
    return [];
  }

  return (data as any[] || []).map((control: any) => ({
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

/**
 * Get category breakdown for a framework
 */
export async function getFrameworkCategories(frameworkId: string): Promise<FrameworkCategory[]> {
  const supabase = await createServerSideClient();

  const { data, error } = await supabase
    .from('controls')
    .select('category')
    .eq('framework_id', frameworkId);

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  const categoryMap = new Map<string, FrameworkCategory>();

  ((data as any) || []).forEach((control: any) => {
    if (!categoryMap.has(control.category)) {
      categoryMap.set(control.category, {
        id: control.category,
        name: control.category,
        description: '',
        controlCount: 0,
      });
    }

    const category = categoryMap.get(control.category)!;
    category.controlCount += 1;
  });

  return Array.from(categoryMap.values()).sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Search controls within a framework
 */
export async function searchFrameworkControls(
  frameworkId: string,
  searchTerm: string
): Promise<DetailedControl[]> {
  const supabase = await createServerSideClient();

  const searchPattern = `%${searchTerm}%`;

  const { data, error } = await supabase
    .from('controls')
    .select('*')
    .eq('framework_id', frameworkId)
    .or(
      `control_id_str.ilike.${searchPattern},title.ilike.${searchPattern},description.ilike.${searchPattern}`
    )
    .order('control_id_str', { ascending: true });

  if (error) {
    console.error('Error searching controls:', error);
    return [];
  }

  return (data as any[] || []).map((control: any) => ({
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

/**
 * Get control statistics for a framework
 */
export async function getFrameworkStats(frameworkId: string) {
  const supabase = await createServerSideClient();

  const { data, error } = await supabase
    .from('controls')
    .select('category, control_type')
    .eq('framework_id', frameworkId);

  if (error) {
    console.error('Error fetching stats:', error);
    return null;
  }

  const stats = {
    totalControls: (data || []).length,
    byCategory: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  };

  ((data as any) || []).forEach((control: any) => {
    stats.byCategory[control.category] = (stats.byCategory[control.category] || 0) + 1;
    stats.byType[control.control_type] = (stats.byType[control.control_type] || 0) + 1;
  });

  return stats;
}

/**
 * Bulk insert controls (for framework ingestion)
 */
export async function bulkInsertControls(
  frameworkId: string,
  controls: Array<{
    controlIdStr: string;
    title: string;
    description: string;
    category: string;
    controlType: 'technical' | 'operational' | 'management';
  }>
) {
  const supabase = await createServerSideClient();

  const controlsToInsert: any[] = controls.map((control) => ({
    framework_id: frameworkId,
    control_id_str: control.controlIdStr,
    title: control.title,
    description: control.description,
    category: control.category,
    control_type: control.controlType,
  }));

  const { data, error } = await (supabase.from('controls') as any)
    .insert(controlsToInsert)
    .select() as any;

  if (error) {
    console.error('Error inserting controls:', error);
    throw error;
  }

  return data;
}

/**
 * Get controls for assessment (used by assessment module)
 */
export async function getControlsForAssessment(frameworkId: string) {
  const supabase = await createServerSideClient();

  const { data, error } = await supabase
    .from('controls')
    .select('id, control_id_str, title, description, category, control_type')
    .eq('framework_id', frameworkId)
    .order('control_id_str', { ascending: true });

  if (error) {
    console.error('Error fetching assessment controls:', error);
    return [];
  }

  return data || [];
}

/**
 * Calculate framework coverage based on assessments
 */
export async function calculateFrameworkCoverage(
  frameworkId: string,
  assessmentId: string
): Promise<{
  total: number;
  implemented: number;
  partiallyImplemented: number;
  notImplemented: number;
  notApplicable: number;
  coverage: number;
}> {
  const supabase = await createServerSideClient();

  // Get total controls
  const { count: totalControls } = await supabase
    .from('controls')
    .select('*', { count: 'exact', head: true })
    .eq('framework_id', frameworkId);

  // Get assessment responses
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('response')
    .eq('assessment_id', assessmentId);

  const stats = {
    total: totalControls || 0,
    implemented: 0,
    partiallyImplemented: 0,
    notImplemented: 0,
    notApplicable: 0,
    coverage: 0,
  };

  ((responses as any) || []).forEach((response: any) => {
    switch (response.response) {
      case 'implemented':
        stats.implemented += 1;
        break;
      case 'partially-implemented':
        stats.partiallyImplemented += 1;
        break;
      case 'not-implemented':
        stats.notImplemented += 1;
        break;
      case 'not-applicable':
        stats.notApplicable += 1;
        break;
    }
  });

  const assessedControls = stats.implemented + stats.partiallyImplemented + stats.notImplemented;
  stats.coverage = stats.total > 0 ? (assessedControls / stats.total) * 100 : 0;

  return stats;
}
