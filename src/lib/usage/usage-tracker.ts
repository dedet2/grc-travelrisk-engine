export interface APICallRecord {
  id: string;
  tenantId: string;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
}

export interface UsageStats {
  date: Date;
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface EndpointStats {
  endpoint: string;
  method: string;
  callCount: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
}

export interface RateLimitStatus {
  tenantId: string;
  callsUsedToday: number;
  callsLimit: number;
  remaining: number;
  resetAt: Date;
  percentUsed: number;
}

export interface UsageTrend {
  date: string;
  calls: number;
  avgResponseTime: number;
  errorRate: number;
}

class UsageTracker {
  private records: APICallRecord[] = [];
  private nextId: number = 1;

  constructor() {
    this.seedUsageData();
  }

  private seedUsageData(): void {
    const now = new Date();
    const endpointsDemo = [
      { endpoint: '/api/assessments', method: 'GET' },
      { endpoint: '/api/assessments', method: 'POST' },
      { endpoint: '/api/controls', method: 'GET' },
      { endpoint: '/api/grc/frameworks', method: 'GET' },
      { endpoint: '/api/travel-risk', method: 'POST' },
      { endpoint: '/api/agents/run', method: 'POST' },
      { endpoint: '/api/compliance', method: 'GET' },
      { endpoint: '/api/incidents', method: 'GET' },
      { endpoint: '/api/vendors', method: 'GET' },
      { endpoint: '/api/reports/export', method: 'GET' }
    ];

    for (let i = 0; i < 150; i++) {
      const endpoint = endpointsDemo[Math.floor(Math.random() * endpointsDemo.length)];
      const responseTime = 50 + Math.random() * 450;
      const statusCode = Math.random() > 0.08 ? 200 : (Math.random() > 0.5 ? 400 : 500);

      const id = `api_call_${this.nextId}`;
      this.nextId++;

      this.records.push({
        id,
        tenantId: 'org_1',
        endpoint: endpoint.endpoint,
        method: endpoint.method,
        responseTime,
        statusCode,
        timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000)
      });
    }
  }

  trackAPICall(tenantId: string, endpoint: string, method: string, responseTime: number, statusCode: number): APICallRecord {
    const id = `api_call_${this.nextId}`;
    this.nextId++;

    const record: APICallRecord = {
      id,
      tenantId,
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: new Date()
    };

    this.records.push(record);
    return record;
  }

  getUsageStats(tenantId: string, period: 'daily' | 'weekly' | 'monthly'): UsageStats {
    const now = new Date();
    let startDate: Date;

    if (period === 'daily') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filtered = this.records.filter((r) => r.tenantId === tenantId && r.timestamp >= startDate);

    const totalCalls = filtered.length;
    const successCalls = filtered.filter((r) => r.statusCode >= 200 && r.statusCode < 300).length;
    const errorCalls = filtered.filter((r) => r.statusCode >= 400).length;

    const responseTimes = filtered.map((r) => r.responseTime).sort((a, b) => a - b);
    const avgResponseTime = filtered.length > 0 ? filtered.reduce((a, b) => a + b.responseTime, 0) / filtered.length : 0;
    const p95Index = Math.ceil(responseTimes.length * 0.95) - 1;
    const p99Index = Math.ceil(responseTimes.length * 0.99) - 1;
    const p95ResponseTime = responseTimes[Math.max(0, p95Index)] || 0;
    const p99ResponseTime = responseTimes[Math.max(0, p99Index)] || 0;

    return {
      date: new Date(),
      totalCalls,
      successCalls,
      errorCalls,
      avgResponseTime: Math.round(avgResponseTime),
      p95ResponseTime: Math.round(p95ResponseTime),
      p99ResponseTime: Math.round(p99ResponseTime)
    };
  }

  getTopEndpoints(tenantId: string, limit: number = 10): EndpointStats[] {
    const endpointMap = new Map<string, EndpointStats>();

    this.records
      .filter((r) => r.tenantId === tenantId)
      .forEach((record) => {
        const key = `${record.endpoint}|${record.method}`;
        const stats = endpointMap.get(key) || {
          endpoint: record.endpoint,
          method: record.method,
          callCount: 0,
          successCount: 0,
          errorCount: 0,
          avgResponseTime: 0
        };

        stats.callCount++;
        if (record.statusCode >= 200 && record.statusCode < 300) {
          stats.successCount++;
        } else if (record.statusCode >= 400) {
          stats.errorCount++;
        }

        stats.avgResponseTime = (stats.avgResponseTime * (stats.callCount - 1) + record.responseTime) / stats.callCount;

        endpointMap.set(key, stats);
      });

    return Array.from(endpointMap.values())
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, limit);
  }

  getRateLimitStatus(tenantId: string, dailyLimit: number = 50000): RateLimitStatus {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const callsUsedToday = this.records.filter((r) => r.tenantId === tenantId && r.timestamp >= startOfDay).length;

    const remaining = Math.max(0, dailyLimit - callsUsedToday);
    const percentUsed = (callsUsedToday / dailyLimit) * 100;

    const resetAt = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    return {
      tenantId,
      callsUsedToday,
      callsLimit: dailyLimit,
      remaining,
      resetAt,
      percentUsed: Math.round(percentUsed)
    };
  }

  getUsageTrends(tenantId: string, days: number = 7): UsageTrend[] {
    const trends: UsageTrend[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const dayRecords = this.records.filter(
        (r) => r.tenantId === tenantId && r.timestamp >= startOfDay && r.timestamp < endOfDay
      );

      const calls = dayRecords.length;
      const avgResponseTime = calls > 0 ? dayRecords.reduce((a, b) => a + b.responseTime, 0) / calls : 0;
      const errorCount = dayRecords.filter((r) => r.statusCode >= 400).length;
      const errorRate = calls > 0 ? (errorCount / calls) * 100 : 0;

      trends.push({
        date: startOfDay.toISOString().split('T')[0],
        calls,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate)
      });
    }

    return trends;
  }

  getDetailedEndpointStats(tenantId: string, endpoint: string, method: string): EndpointStats {
    const matching = this.records.filter(
      (r) => r.tenantId === tenantId && r.endpoint === endpoint && r.method === method
    );

    const callCount = matching.length;
    const successCount = matching.filter((r) => r.statusCode >= 200 && r.statusCode < 300).length;
    const errorCount = matching.filter((r) => r.statusCode >= 400).length;
    const avgResponseTime = callCount > 0 ? matching.reduce((a, b) => a + b.responseTime, 0) / callCount : 0;

    return {
      endpoint,
      method,
      callCount,
      successCount,
      errorCount,
      avgResponseTime: Math.round(avgResponseTime)
    };
  }
}

export const usageTracker = new UsageTracker();
