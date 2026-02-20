/**
 * Supabase REST API Client
 * Direct REST API calls without @supabase/supabase-js dependency
 * Uses service role key for server operations, anon key for client
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ruiphgtxyazqlasbchiv.supabase.co';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBoZ3R4eWF6cWxhc2JjaGl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM3OTQ4MywiZXhwIjoyMDg2OTU1NDgzfQ.8lkVo2g2POIPyJ1CcfMn6CJyCceAis6jyph0Mz2z3Pc';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aXBoZ3R4eWF6cWxhc2JjaGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzk0ODMsImV4cCI6MjA4Njk1NTQ4M30.yVHlpQQTFZ515DC7a7dktnxmDVwr9GDPDra4QDpXM-o';

export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

export interface RestResponse<T = any> {
  data: T | null;
  error: { message: string; details?: string } | null;
  status: number;
}

/**
 * Make a raw REST API request to Supabase
 */
async function makeRestRequest<T = any>(
  method: RequestMethod,
  endpoint: string,
  body?: Record<string, any>,
  useServiceRole: boolean = true
): Promise<RestResponse<T>> {
  try {
    const apiKey = useServiceRole ? SERVICE_ROLE_KEY : ANON_KEY;
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        apikey: apiKey,
        Prefer: 'return=representation',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          message: data.message || `HTTP ${response.status}`,
          details: data.details || data.error_description,
        },
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      status: 0,
    };
  }
}

/**
 * Get records from a table
 */
export async function supabaseGet<T = any>(
  table: string,
  query?: string,
  useServiceRole: boolean = true
): Promise<RestResponse<T[]>> {
  const endpoint = query ? `/rest/v1/${table}?${query}` : `/rest/v1/${table}`;
  return makeRestRequest<T[]>('GET', endpoint, undefined, useServiceRole);
}

/**
 * Insert records into a table
 */
export async function supabaseInsert<T = any>(
  table: string,
  data: Record<string, any> | Record<string, any>[],
  useServiceRole: boolean = true
): Promise<RestResponse<T[]>> {
  const endpoint = `/${table}`;
  const body = Array.isArray(data) ? data : [data];
  return makeRestRequest<T[]>('POST', endpoint, { records: body }, useServiceRole);
}

/**
 * Update records in a table
 */
export async function supabaseUpdate<T = any>(
  table: string,
  data: Record<string, any>,
  filters?: Record<string, any>,
  useServiceRole: boolean = true
): Promise<RestResponse<T[]>> {
  let query = '';
  if (filters) {
    const filterParts = Object.entries(filters).map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}=eq.${encodeURIComponent(value)}`;
      }
      return `${key}=eq.${value}`;
    });
    query = filterParts.join('&');
  }

  const endpoint = `/${table}${query ? '?' + query : ''}`;
  return makeRestRequest<T[]>('PATCH', endpoint, data, useServiceRole);
}

/**
 * Delete records from a table
 */
export async function supabaseDelete<T = any>(
  table: string,
  filters: Record<string, any>,
  useServiceRole: boolean = true
): Promise<RestResponse<T[]>> {
  const filterParts = Object.entries(filters).map(([key, value]) => {
    if (typeof value === 'string') {
      return `${key}=eq.${encodeURIComponent(value)}`;
    }
    return `${key}=eq.${value}`;
  });
  const query = filterParts.join('&');
  const endpoint = `/${table}?${query}`;
  return makeRestRequest<T[]>('DELETE', endpoint, undefined, useServiceRole);
}

/**
 * Execute a custom SQL query through Supabase RPC
 */
export async function supabaseRpc<T = any>(
  functionName: string,
  params?: Record<string, any>,
  useServiceRole: boolean = true
): Promise<RestResponse<T>> {
  const endpoint = `/rpc/${functionName}`;
  return makeRestRequest<T>('POST', endpoint, params, useServiceRole);
}

/**
 * Check if Supabase is reachable
 */
export async function isSupabaseReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SERVICE_ROLE_KEY,
      },
    });
    return response.ok || response.status === 405; // 405 means endpoint exists
  } catch {
    return false;
  }
}
