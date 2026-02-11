'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  riskScore: { overall: number; level: string; trend: 'up' | 'down' | 'stable' };
  compliance: { rate: number; total: number; implemented: number };
  assessments: { active: number; completed: number; total: number };
  travelRisks: { destinations: number; highRisk: number; alerts: number };
  agentRuns: { last24h: number; successRate: number; totalRuns: number };
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load dashboard</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">GRC & Travel Risk assessment overview</p>
      </div>

      {/* Metric Cards - 6 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overall GRC Risk Score */}
        <div className={`rounded-lg shadow p-6 border-l-4 border-indigo-600 ${getRiskBgColor(stats.riskScore.overall)}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Overall GRC Risk Score</p>
              <p className={`text-4xl font-bold ${getRiskColor(stats.riskScore.overall)}`}>
                {stats.riskScore.overall}
              </p>
              <p className="text-xs text-gray-600 mt-2">{getRiskLevel(stats.riskScore.overall)}</p>
            </div>
            <div className="text-sm">
              <span className={`inline-block px-2 py-1 rounded ${stats.riskScore.trend === 'up' ? 'bg-red-200 text-red-700' : stats.riskScore.trend === 'down' ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                {stats.riskScore.trend === 'up' ? '↑' : stats.riskScore.trend === 'down' ? '↓' : '→'}{' '}
                {stats.riskScore.trend}
              </span>
            </div>
          </div>
        </div>

        {/* Compliance Rate */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Compliance Rate</p>
          <p className="text-4xl font-bold text-emerald-600">{stats.compliance.rate}%</p>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full"
              style={{ width: `${stats.compliance.rate}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {stats.compliance.implemented} of {stats.compliance.total} implemented
          </p>
        </div>

        {/* Active Assessments */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Active Assessments</p>
          <p className="text-4xl font-bold text-indigo-600">{stats.assessments.active}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.assessments.completed} completed of {stats.assessments.total} total
          </p>
        </div>

        {/* Travel Destinations Monitored */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Travel Destinations</p>
          <p className="text-4xl font-bold text-blue-600">{stats.travelRisks.destinations}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.travelRisks.highRisk} high-risk destinations
          </p>
        </div>

        {/* Agent Runs */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Agent Runs (24h)</p>
          <p className="text-4xl font-bold text-purple-600">{stats.agentRuns.last24h}</p>
          <p className="text-xs text-gray-600 mt-2">
            {Math.round(stats.agentRuns.successRate)}% success rate
          </p>
        </div>

        {/* Critical Findings */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Critical Findings</p>
          <p className="text-4xl font-bold text-red-600">{stats.criticalFindings.count}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.criticalFindings.pending} pending, {stats.criticalFindings.resolved} resolved
          </p>
        </div>
      </div>

      {/* GRC Compliance by Category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">ISO 27001 Compliance by Category</h2>
        <div className="space-y-4">
          {stats.categoryScores.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{cat.category}</p>
                  <p className="text-xs text-gray-500">{cat.controlCount} controls</p>
                </div>
                <span className="text-sm font-bold text-gray-900">{cat.score}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    cat.score >= 75
                      ? 'bg-emerald-600'
                      : cat.score >= 50
                        ? 'bg-amber-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">
              + New Assessment
            </button>
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
              + Travel Risk Report
            </button>
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors">
              + Run All Agents
            </button>
            <button className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors">
              + Import Framework
            </button>
          </div>
        </div>

        {/* Recent Agent Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Agent Activity</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <StatusIndicator status={activity.status} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.agent}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()} · {activity.latencyMs}ms
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        activity.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : activity.status === 'running'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
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
      </div>

      {/* Travel Risk Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top 5 Highest-Risk Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.topRiskDestinations.map((dest, idx) => (
            <Link key={idx} href="/dashboard/travel-risk">
              <div className="cursor-pointer p-4 rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">🌍</div>
                <p className="font-bold text-gray-900">{dest.country}</p>
                <p className="text-xs text-gray-600 mb-2">{dest.code}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-red-600">{dest.score}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">
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
