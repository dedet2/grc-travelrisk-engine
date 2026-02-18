import { NextRequest, NextResponse } from 'next/server';
import { usageTracker } from '@/lib/usage/usage-tracker';
import { tenantManager } from '@/lib/tenants/tenant-manager';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tenantId = request.headers.get('x-tenant-id') || 'org_1';
  const type = searchParams.get('type') || 'overview';
  const period = searchParams.get('period') || 'daily';

  if (type === 'overview') {
    const stats = usageTracker.getUsageStats(tenantId, period as 'daily' | 'weekly' | 'monthly');
    const rateLimit = usageTracker.getRateLimitStatus(tenantId);
    const topEndpoints = usageTracker.getTopEndpoints(tenantId, 5);

    return NextResponse.json(
      {
        success: true,
        type: 'overview',
        stats,
        rateLimit,
        topEndpoints
      },
      { status: 200 }
    );
  }

  if (type === 'endpoints') {
    const topEndpoints = usageTracker.getTopEndpoints(tenantId, 20);

    return NextResponse.json(
      {
        success: true,
        type: 'endpoints',
        endpoints: topEndpoints
      },
      { status: 200 }
    );
  }

  if (type === 'trends') {
    const days = parseInt(searchParams.get('days') || '7', 10);
    const trends = usageTracker.getUsageTrends(tenantId, days);

    return NextResponse.json(
      {
        success: true,
        type: 'trends',
        period: `${days}d`,
        trends
      },
      { status: 200 }
    );
  }

  if (type === 'rate-limits') {
    const limit = parseInt(searchParams.get('limit') || '50000', 10);
    const rateLimit = usageTracker.getRateLimitStatus(tenantId, limit);

    return NextResponse.json(
      {
        success: true,
        type: 'rate-limits',
        rateLimit
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { success: false, error: 'Invalid type parameter' },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id') || 'org_1';

  try {
    const body = await request.json();
    const { endpoint, method, responseTime, statusCode } = body;

    if (!endpoint || !method || responseTime === undefined || !statusCode) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const record = usageTracker.trackAPICall(
      tenantId,
      endpoint,
      method,
      responseTime,
      statusCode
    );

    return NextResponse.json(
      {
        success: true,
        message: 'API call tracked',
        record
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to track API call' },
      { status: 400 }
    );
  }
}
