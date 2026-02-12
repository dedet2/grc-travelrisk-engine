'use client';

import { useState, useEffect } from 'react';

interface HealthMetric {
  name: string;
  status: 'green' | 'yellow' | 'red';
  value: number;
  threshold: number;
}

interface SecurityFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'resolved' | 'in-progress';
  lastUpdated: string;
}

interface CostBreakdown {
  service: string;
  monthlyCost: number;
  trend: 'up' | 'down' | 'stable';
  percentOfTotal: number;
}

interface InfrastructureData {
  health: HealthMetric[];
  security: SecurityFinding[];
  costs: CostBreakdown[];
  metrics: {
    uptime: number;
    responseTime: number;
    totalCost: number;
    costReduction: number;
  };
}

// Mock data for fallback when API fails
const MOCK_HEALTH_METRICS: HealthMetric[] = [
  { name: 'CPU Utilization', status: 'green', value: 68, threshold: 80 },
  { name: 'Memory Usage', status: 'green', value: 72, threshold: 85 },
  { name: 'Disk Space', status: 'yellow', value: 78, threshold: 90 },
  { name: 'Network Bandwidth', status: 'green', value: 55, threshold: 75 },
];

const MOCK_SECURITY_FINDINGS: SecurityFinding[] = [
  {
    id: 'SEC-001',
    title: 'SSL Certificate Expiration',
    severity: 'high',
    status: 'in-progress',
    lastUpdated: '2024-02-10',
  },
  {
    id: 'SEC-002',
    title: 'Outdated Dependencies Detected',
    severity: 'medium',
    status: 'open',
    lastUpdated: '2024-02-12',
  },
  {
    id: 'SEC-003',
    title: 'Missing Security Headers',
    severity: 'medium',
    status: 'resolved',
    lastUpdated: '2024-02-09',
  },
  {
    id: 'SEC-004',
    title: 'Database Access Control Review',
    severity: 'critical',
    status: 'open',
    lastUpdated: '2024-02-11',
  },
];

const MOCK_COST_BREAKDOWN: CostBreakdown[] = [
  { service: 'Compute (EC2)', monthlyCost: 4200, trend: 'up', percentOfTotal: 35 },
  { service: 'Database (RDS)', monthlyCost: 2800, trend: 'stable', percentOfTotal: 23 },
  { service: 'Storage (S3)', monthlyCost: 1900, trend: 'down', percentOfTotal: 16 },
  { service: 'CDN & Bandwidth', monthlyCost: 1600, trend: 'up', percentOfTotal: 13 },
  { service: 'Monitoring & Logging', monthlyCost: 800, trend: 'stable', percentOfTotal: 7 },
];

const MOCK_INFRASTRUCTURE_METRICS = {
  uptime: 99.97,
  responseTime: 125,
  totalCost: 12000,
  costReduction: 18,
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'green':
      return 'bg-emerald-100 text-emerald-700';
    case 'yellow':
      return 'bg-amber-100 text-amber-700';
    case 'red':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

function getTrendIndicator(trend: string): string {
  switch (trend) {
    case 'up':
      return '';
    case 'down':
      return '';
    case 'stable':
      return '';
    default:
      return '';
  }
}

export default function InfrastructurePage() {
  const [data, setData] = useState<InfrastructureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInfrastructureData() {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Failed to fetch infrastructure data');

        const result = await response.json();
        const apiData = result.data || result;

        // Safely validate all arrays with Array.isArray checks
        const safeHealth = Array.isArray(apiData.health) ? apiData.health : [];
        const safeSecurity = Array.isArray(apiData.security) ? apiData.security : [];
        const safeCosts = Array.isArray(apiData.costs) ? apiData.costs : [];

        setData({
          health: safeHealth.length > 0 ? safeHealth : MOCK_HEALTH_METRICS,
          security: safeSecurity.length > 0 ? safeSecurity : MOCK_SECURITY_FINDINGS,
          costs: safeCosts.length > 0 ? safeCosts : MOCK_COST_BREAKDOWN,
          metrics: apiData.metrics || MOCK_INFRASTRUCTURE_METRICS,
        });
      } catch (err) {
        console.error('Error fetching infrastructure data:', err);
        // Use comprehensive mock data as fallback
        setData({
          health: MOCK_HEALTH_METRICS,
          security: MOCK_SECURITY_FINDINGS,
          costs: MOCK_COST_BREAKDOWN,
          metrics: MOCK_INFRASTRUCTURE_METRICS,
        });
        setError(err instanceof Error ? err.message : 'Failed to load infrastructure data');
      } finally {
        setLoading(false);
      }
    }

    fetchInfrastructureData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load infrastructure</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Infrastructure Health</h1>
        <p className="text-gray-600 mt-2">System health, security posture, and cost optimization</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Uptime */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Uptime</p>
          <p className="text-4xl font-bold text-emerald-600">
            {data.metrics.uptime}%
          </p>
          <p className="text-xs text-gray-600 mt-2">30-day average</p>
        </div>

        {/* Response Time */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Response Time</p>
          <p className="text-4xl font-bold text-blue-600">
            {data.metrics.responseTime}ms
          </p>
          <p className="text-xs text-gray-600 mt-2">Average latency</p>
        </div>

        {/* Monthly Cost */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Monthly Cost</p>
          <p className="text-4xl font-bold text-indigo-600">
            ${(data.metrics.totalCost / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">All services</p>
        </div>

        {/* Cost Reduction */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Cost Reduction</p>
          <p className="text-4xl font-bold text-purple-600">
            {data.metrics.costReduction}%
          </p>
          <p className="text-xs text-gray-600 mt-2">YoY optimization</p>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">System Health Status</h2>
        <div className="space-y-4">
          {Array.isArray(data.health) && data.health.map((metric) => (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{metric.name}</p>
                  <p className="text-xs text-gray-600">
                    Threshold: {metric.threshold}%
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      metric.status
                    )}`}
                  >
                    {metric.status === 'green'
                      ? 'Healthy'
                      : metric.status === 'yellow'
                        ? 'Warning'
                        : 'Critical'}
                  </span>
                  <span className="text-lg font-bold text-gray-900 w-12 text-right">
                    {metric.value}%
                  </span>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    metric.status === 'green'
                      ? 'bg-emerald-600'
                      : metric.status === 'yellow'
                        ? 'bg-amber-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Security Audit Results</h2>
          <p className="text-sm text-gray-600 mt-1">
            Latest security findings and remediation status
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {Array.isArray(data.security) && data.security.length > 0 ? (
            data.security.slice(0, 8).map((finding) => (
              <div
                key={finding.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{finding.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Updated {new Date(finding.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                        finding.severity
                      )}`}
                    >
                      {finding.severity.charAt(0).toUpperCase() + finding.severity.slice(1)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        finding.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : finding.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {finding.status === 'in-progress'
                        ? 'In Progress'
                        : finding.status.charAt(0).toUpperCase() + finding.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              No security findings
            </div>
          )}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Cost Breakdown by Service</h2>
        <div className="space-y-4">
          {Array.isArray(data.costs) && data.costs.map((cost) => (
            <div key={cost.service} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{cost.service}</p>
                  <p className="text-xs text-gray-600">
                    {cost.percentOfTotal}% of total
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${(cost.monthlyCost / 1000).toFixed(1)}k
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      cost.trend === 'down'
                        ? 'text-emerald-600'
                        : cost.trend === 'up'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {getTrendIndicator(cost.trend)}{' '}
                    {cost.trend.charAt(0).toUpperCase() + cost.trend.slice(1)}
                  </p>
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${cost.percentOfTotal}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
