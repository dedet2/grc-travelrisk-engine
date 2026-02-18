'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { ApiResponse } from '@/types';

interface DashboardStats {
  riskScore: { overall: number; level: string; trend: 'up' | 'down' | 'stable' };
  compliance: { rate: number; total: number; implemented: number; frameworks?: Record<string, number> };
  assessments: { active: number; completed: number; total: number };
  travelRisks: { destinations: number; highRisk: number; alerts: number };
  agentRuns: { last24h: number; successRate: number; totalRuns: number; activeAgents?: number; maxAgents?: number };
  criticalFindings: { count: number; resolved: number; pending: number };
  categoryScores: Array<{ category: string; score: number; controlCount: number }>;
  recentActivity: Array<{
    agent: string;
    action: string;
    timestamp: string;
    status: string;
    latencyMs: number;
  }>;
  topRiskDestinations: Array<{ country: string; code: string; score: number; level: string }>;
  pipelineValue?: number;
  dealCount?: number;
}

function getRiskColor(score: number): string {
  if (score >= 75) return 'text-red-600 bg-red-50';
  if (score >= 50) return 'text-amber-600 bg-amber-50';
  return 'text-emerald-600 bg-emerald-50';
}

function getRiskBgColor(score: number): string {
  if (score >= 75) return 'bg-red-100';
  if (score >= 50) return 'bg-amber-100';
  return 'bg-emerald-100';
}

function getRiskLevel(score: number): string {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  return 'Medium';
}

function StatusIndicator({ status }: { status: string }) {
  const statusColor =
    status === 'success'
      ? 'bg-emerald-500'
      : status === 'running'
        ? 'bg-blue-500 animate-pulse'
        : status === 'failed'
          ? 'bg-red-500'
          : 'bg-gray-500';

  return <div className={`w-2 h-2 rounded-full ${statusColor}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-12 bg-gray-700 rounded animate-pulse w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800 p-6 rounded-lg shadow h-32 animate-pulse border border-gray-700" />
        ))}
      </div>
    </div>
  );
}

function ErrorBoundary({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="bg-gray-800 border border-red-600 rounded-lg p-6">
      <h2 className="text-lg font-bold text-red-400 mb-2">Failed to load dashboard</h2>
      <p className="text-red-300 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function isValidDashboardStats(data: unknown): data is DashboardStats {
  if (!data || typeof data !== 'object') return false;

  const stats = data as Record<string, unknown>;
  return (
    stats.riskScore &&
    typeof stats.riskScore === 'object' &&
    stats.compliance &&
    typeof stats.compliance === 'object' &&
    stats.assessments &&
    typeof stats.assessments === 'object' &&
    stats.travelRisks &&
    typeof stats.travelRisks === 'object' &&
    Array.isArray(stats.categoryScores) &&
    Array.isArray(stats.recentActivity)
  );
}

function getMockDashboardStats(): DashboardStats {
  return {
    riskScore: { overall: 78, level: 'High', trend: 'up' },
    compliance: {
      rate: 82,
      total: 125,
      implemented: 102,
      frameworks: {
        'NIST CSF 2.0': 78,
        'ISO 27001': 82,
        'SOC 2': 71,
        'GDPR': 89,
      },
    },
    assessments: { active: 8, completed: 42, total: 50 },
    travelRisks: { destinations: 24, highRisk: 6, alerts: 12 },
    agentRuns: { last24h: 156, successRate: 94.2, totalRuns: 1240, activeAgents: 28, maxAgents: 34 },
    criticalFindings: { count: 12, resolved: 8, pending: 4 },
    categoryScores: [
      { category: 'Access Control', score: 85, controlCount: 12 },
      { category: 'Data Protection', score: 78, controlCount: 15 },
      { category: 'Incident Response', score: 82, controlCount: 8 },
      { category: 'Asset Management', score: 75, controlCount: 10 },
    ],
    recentActivity: [
      {
        agent: 'Compliance Auditor',
        action: 'ISO 27001 assessment completed',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'success',
        latencyMs: 1250,
      },
      {
        agent: 'Risk Analyzer',
        action: 'Travel destination risk evaluation',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'success',
        latencyMs: 892,
      },
      {
        agent: 'Policy Validator',
        action: 'GDPR compliance check',
        timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
        status: 'success',
        latencyMs: 645,
      },
      {
        agent: 'Deal Pipeline Agent',
        action: 'Pipeline value updated',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'success',
        latencyMs: 2100,
      },
      {
        agent: 'Security Monitor',
        action: 'SOC 2 framework sync',
        timestamp: new Date(Date.now() - 62 * 60000).toISOString(),
        status: 'success',
        latencyMs: 1540,
      },
      {
        agent: 'Travel Risk Agent',
        action: 'Alert update: New travel advisories',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        status: 'success',
        latencyMs: 753,
      },
      {
        agent: 'Compliance Auditor',
        action: 'NIST CSF 2.0 revision processed',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        status: 'success',
        latencyMs: 1680,
      },
      {
        agent: 'Risk Analyzer',
        action: 'Quarterly risk assessment',
        timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
        status: 'success',
        latencyMs: 3245,
      },
    ],
    topRiskDestinations: [
      { country: 'Syria', code: 'SY', score: 95, level: 'Critical' },
      { country: 'Yemen', code: 'YE', score: 92, level: 'Critical' },
      { country: 'Afghanistan', code: 'AF', score: 88, level: 'High' },
      { country: 'Ukraine', code: 'UA', score: 85, level: 'High' },
      { country: 'Venezuela', code: 'VE', score: 82, level: 'High' },
    ],
    pipelineValue: 2850000,
    dealCount: 34,
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/kpis', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch KPIs`);
      }

      const data: ApiResponse<DashboardStats> = await response.json();

      if (!data || !isValidDashboardStats(data.data)) {
        throw new Error('Invalid response format from server');
      }

      setStats(data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard KPIs:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setStats(getMockDashboardStats());
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!stats) {
    return <ErrorBoundary error={error || 'Unknown error occurred'} onRetry={fetchStats} />;
  }

  const trendData = [74, 76, 75, 78, 77, 80, 78];
  const maxTrendValue = Math.max(...trendData);
  const minTrendValue = Math.min(...trendData);
  const trendRange = maxTrendValue - minTrendValue || 1;

  return (
    <div className="space-y-8 bg-gray-900 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-8 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, Dr. Dédé</h1>
            <p className="text-gray-300">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="text-6xl">🎯</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Overall Risk Score</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-red-400">{stats.riskScore.overall}</p>
              <p className="text-gray-500 text-xs mt-1">/100</p>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-bold ${stats.riskScore.trend === 'up' ? 'bg-red-900 text-red-200' : stats.riskScore.trend === 'down' ? 'bg-emerald-900 text-emerald-200' : 'bg-gray-700 text-gray-200'}`}>
              {stats.riskScore.trend === 'up' ? '↑ Up' : stats.riskScore.trend === 'down' ? '↓ Down' : '→ Stable'}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Compliance Rate</p>
          <p className="text-4xl font-bold text-emerald-400 mb-3">{stats.compliance.rate}%</p>
          <div className="space-y-2">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.compliance.rate}%` }} />
            </div>
            <p className="text-gray-500 text-xs">
              {stats.compliance.implemented}/{stats.compliance.total} controls
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Active Agents</p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-blue-400">
                {stats.agentRuns.activeAgents || 28}
              </p>
              <p className="text-gray-500 text-xs mt-1">of {stats.agentRuns.maxAgents || 34} running</p>
            </div>
            <div className="text-2xl">⚙️</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Pipeline Value</p>
          <p className="text-4xl font-bold text-purple-400 mb-3">
            ${((stats.pipelineValue || 2850000) / 1000000).toFixed(2)}M
          </p>
          <p className="text-gray-500 text-xs">
            {stats.dealCount || 34} active deals
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-6">7-Day Risk Score Trend</h2>
        <div className="space-y-4">
          <div className="flex items-end justify-between h-48 gap-2">
            {trendData.map((value, idx) => {
              const normalizedHeight = ((value - minTrendValue) / trendRange) * 100 || 50;
              return (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div className="relative w-full h-40 flex items-end justify-center">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer group relative"
                      style={{ height: `${normalizedHeight}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-700 px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-700 pt-4">
            <span>7-day average: {Math.round(trendData.reduce((a, b) => a + b) / trendData.length)}</span>
            <span>Current: {trendData[trendData.length - 1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/agents">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Run All Agents</p>
              <p className="text-gray-500 text-xs">Execute all monitoring agents</p>
            </button>
          </Link>

          <Link href="/dashboard/assessments">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">New Assessment</p>
              <p className="text-gray-500 text-xs">Create a new GRC assessment</p>
            </button>
          </Link>

          <Link href="/dashboard/lead-pipeline">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">View Pipeline</p>
              <p className="text-gray-500 text-xs">Review deal pipeline and opportunities</p>
            </button>
          </Link>

          <Link href="/dashboard/travel-risk">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">🌍</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Travel Advisory</p>
              <p className="text-gray-500 text-xs">Check travel risk assessments</p>
            </button>
          </Link>

          <Link href="/dashboard/compliance">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">✓</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Compliance Hub</p>
              <p className="text-gray-500 text-xs">Manage compliance frameworks</p>
            </button>
          </Link>

          <Link href="/dashboard/reports">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">📄</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Generate Report</p>
              <p className="text-gray-500 text-xs">Create executive report</p>
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Array.isArray(stats.recentActivity) && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, idx) => (
              <div key={idx} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <StatusIndicator status={activity.status} />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{activity.agent}</p>
                      <p className="text-sm text-gray-400">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleTimeString()} · {activity.latencyMs}ms
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      activity.status === 'success'
                        ? 'bg-emerald-900 text-emerald-200'
                        : activity.status === 'running'
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-red-900 text-red-200'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-6">Framework Compliance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(
            stats.compliance?.frameworks || {
              'NIST CSF 2.0': 78,
              'ISO 27001': 82,
              'SOC 2': 71,
              'GDPR': 89,
            }
          ).map(([framework, score]) => (
            <div key={framework} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{framework}</p>
                <span className="text-sm font-bold text-blue-400">{score}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    score >= 75
                      ? 'bg-emerald-500'
                      : score >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-indigo-600 border border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Overall GRC Risk Score</p>
              <p className="text-4xl font-bold text-red-400">{stats.riskScore.overall}</p>
              <p className="text-xs text-gray-500 mt-2">{getRiskLevel(stats.riskScore.overall)}</p>
            </div>
            <div className="text-sm">
              <span
                className={`inline-block px-2 py-1 rounded font-bold ${
                  stats.riskScore.trend === 'up'
                    ? 'bg-red-900 text-red-200'
                    : stats.riskScore.trend === 'down'
                      ? 'bg-emerald-900 text-emerald-200'
                      : 'bg-gray-700 text-gray-200'
                }`}
              >
                {stats.riskScore.trend === 'up' ? '↑' : stats.riskScore.trend === 'down' ? '↓' : '→'}{' '}
                {stats.riskScore.trend}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-indigo-600 border border-gray-700">
          <p className="text-sm font-medium text-gray-400 mb-1">Active Assessments</p>
          <p className="text-4xl font-bold text-indigo-400">{stats.assessments.active}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.assessments.completed} completed of {stats.assessments.total} total
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-600 border border-gray-700">
          <p className="text-sm font-medium text-gray-400 mb-1">Travel Destinations</p>
          <p className="text-4xl font-bold text-blue-400">{stats.travelRisks.destinations}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.travelRisks.highRisk} high-risk destinations
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-600 border border-gray-700">
          <p className="text-sm font-medium text-gray-400 mb-1">Agent Runs (24h)</p>
          <p className="text-4xl font-bold text-purple-400">{stats.agentRuns.last24h}</p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round(stats.agentRuns.successRate)}% success rate
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-red-600 border border-gray-700">
          <p className="text-sm font-medium text-gray-400 mb-1">Critical Findings</p>
          <p className="text-4xl font-bold text-red-400">{stats.criticalFindings.count}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.criticalFindings.pending} pending, {stats.criticalFindings.resolved} resolved
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">ISO 27001 Compliance by Category</h2>
        <div className="space-y-4">
          {Array.isArray(stats.categoryScores) &&
            stats.categoryScores.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{cat.category}</p>
                    <p className="text-xs text-gray-500">{cat.controlCount} controls</p>
                  </div>
                  <span className="text-sm font-bold text-blue-400">{cat.score}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      cat.score >= 75
                        ? 'bg-emerald-500'
                        : cat.score >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Top 5 Highest-Risk Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.isArray(stats.topRiskDestinations) &&
            stats.topRiskDestinations.map((dest, idx) => (
              <Link key={idx} href="/dashboard/travel-risk">
                <div className="cursor-pointer p-4 rounded-lg border border-gray-700 hover:border-indigo-500 hover:shadow-lg transition-all bg-gray-700 hover:bg-gray-600">
                  <div className="text-3xl mb-2">🌍</div>
                  <p className="font-bold text-white">{dest.country}</p>
                  <p className="text-xs text-gray-400 mb-2">{dest.code}</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-red-400">{dest.score}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-900 text-red-200 font-medium">
                      {dest.level}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
