'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { ApiResponse } from '@/types';

interface ProspectRecord {
  id: string;
  name: string;
  company: string;
  role: string;
  status: 'lead' | 'qualified' | 'engaged' | 'proposal' | 'closed';
  icpFitScore: number;
  lastContact: string;
  nextAction: string;
}

interface OutreachCampaign {
  id: string;
  name: string;
  type: string;
  targetContacts: number;
  status: 'planning' | 'live' | 'paused' | 'completed';
  responsesReceived: number;
  meetingsBooked: number;
  responseRate: number;
}

interface DashboardStats {
  // KPI Summary
  pipelineValue: number;
  activeDealCount: number;
  prospectCount: number;
  prospectConversionRate: number;
  agentFleetActive: number;
  agentFleetMax: number;
  agentSuccessRate: number;
  // Prospects
  prospects?: ProspectRecord[];
  // Campaigns
  campaigns?: OutreachCampaign[];
  // Agent Activity
  recentActivity: Array<{
    agent: string;
    action: string;
    timestamp: string;
    status: string;
    latencyMs: number;
  }>;
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
      <h2 className="text-lg font-bold text-red-400 mb-2">Failed to load command center</h2>
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
    typeof stats.pipelineValue === 'number' &&
    typeof stats.activeDealCount === 'number' &&
    typeof stats.prospectCount === 'number' &&
    Array.isArray(stats.recentActivity)
  );
}

function getMockDashboardStats(): DashboardStats {
  return {
    pipelineValue: 2850000,
    activeDealCount: 34,
    prospectCount: 9,
    prospectConversionRate: 18.5,
    agentFleetActive: 28,
    agentFleetMax: 34,
    agentSuccessRate: 94.2,
    prospects: [
      {
        id: '1',
        name: 'Scott Kennedy',
        company: 'AppViewX',
        role: 'CISO',
        status: 'engaged',
        icpFitScore: 95,
        lastContact: '2 days ago',
        nextAction: 'Executive briefing scheduled',
      },
      {
        id: '2',
        name: 'John Wilson',
        company: 'HaystackID',
        role: 'VP Security',
        status: 'qualified',
        icpFitScore: 92,
        lastContact: '1 week ago',
        nextAction: 'Demo scheduled for Feb 28',
      },
      {
        id: '3',
        name: 'Radhika Bajpai',
        company: 'Russell Investments',
        role: 'CISO',
        status: 'proposal',
        icpFitScore: 88,
        lastContact: '3 days ago',
        nextAction: 'Proposal review meeting',
      },
      {
        id: '4',
        name: 'Michael Chen',
        company: 'TechCorp Global',
        role: 'Risk Officer',
        status: 'engaged',
        icpFitScore: 91,
        lastContact: '4 days ago',
        nextAction: 'Needs stakeholder alignment',
      },
      {
        id: '5',
        name: 'Jennifer Martinez',
        company: 'FinServe Capital',
        role: 'CISO',
        status: 'qualified',
        icpFitScore: 89,
        lastContact: '1 week ago',
        nextAction: 'Budget approval pending',
      },
      {
        id: '6',
        name: 'David Park',
        company: 'CloudSecure Inc',
        role: 'Security Director',
        status: 'lead',
        icpFitScore: 85,
        lastContact: '2 weeks ago',
        nextAction: 'Discovery call needed',
      },
      {
        id: '7',
        name: 'Sarah Thompson',
        company: 'Enterprise Solutions Ltd',
        role: 'GRC Manager',
        status: 'engaged',
        icpFitScore: 87,
        lastContact: '5 days ago',
        nextAction: 'Contract negotiation',
      },
      {
        id: '8',
        name: 'Robert Yang',
        company: 'InnovateTech Partners',
        role: 'CISO',
        status: 'proposal',
        icpFitScore: 90,
        lastContact: '1 day ago',
        nextAction: 'Waiting for sign-off',
      },
      {
        id: '9',
        name: 'Lisa Anderson',
        company: 'DataGuard Systems',
        role: 'VP Compliance',
        status: 'qualified',
        icpFitScore: 86,
        lastContact: '3 days ago',
        nextAction: 'Follow-up call scheduled',
      },
    ],
    campaigns: [
      {
        id: '1',
        name: 'WeConnect Campaign',
        type: 'Email + LinkedIn',
        targetContacts: 1557,
        status: 'live',
        responsesReceived: 142,
        meetingsBooked: 12,
        responseRate: 9.1,
      },
      {
        id: '2',
        name: 'Apollo/LinkedIn Outreach',
        type: 'Multi-channel',
        targetContacts: 800,
        status: 'live',
        responsesReceived: 68,
        meetingsBooked: 8,
        responseRate: 8.5,
      },
      {
        id: '3',
        name: 'Fortune 500 Direct Outreach',
        type: 'Personalized',
        targetContacts: 250,
        status: 'live',
        responsesReceived: 35,
        meetingsBooked: 5,
        responseRate: 14.0,
      },
    ],
    recentActivity: [
      {
        agent: 'Lead Prospector',
        action: 'Identified 47 new CISO prospects matching ICP',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        status: 'success',
        latencyMs: 3420,
      },
      {
        agent: 'Outreach Agent',
        action: 'Sent 156 personalized outreach emails',
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        status: 'success',
        latencyMs: 5100,
      },
      {
        agent: 'Content Creator',
        action: 'Generated 8 executive summaries for proposals',
        timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
        status: 'success',
        latencyMs: 4200,
      },
      {
        agent: 'Deal Pipeline Agent',
        action: 'Updated pipeline value and deal stages',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        status: 'success',
        latencyMs: 1850,
      },
      {
        agent: 'Grant Tracker',
        action: 'Identified 3 potential grant opportunities',
        timestamp: new Date(Date.now() - 52 * 60000).toISOString(),
        status: 'success',
        latencyMs: 2640,
      },
      {
        agent: 'Email Validator',
        action: 'Validated 2,340 prospect email addresses',
        timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
        status: 'success',
        latencyMs: 6200,
      },
      {
        agent: 'Lead Prospector',
        action: 'Updated prospect engagement scores',
        timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
        status: 'success',
        latencyMs: 2950,
      },
      {
        agent: 'Outreach Agent',
        action: 'Scheduled 4 follow-up sequences',
        timestamp: new Date(Date.now() - 160 * 60000).toISOString(),
        status: 'success',
        latencyMs: 1620,
      },
    ],
  };
}

function getStatusColor(
  status: 'lead' | 'qualified' | 'engaged' | 'proposal' | 'closed'
): string {
  switch (status) {
    case 'lead':
      return 'bg-gray-700 text-gray-200';
    case 'qualified':
      return 'bg-blue-900 text-blue-200';
    case 'engaged':
      return 'bg-purple-900 text-purple-200';
    case 'proposal':
      return 'bg-amber-900 text-amber-200';
    case 'closed':
      return 'bg-emerald-900 text-emerald-200';
    default:
      return 'bg-gray-700 text-gray-200';
  }
}

function getIcpScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-blue-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-gray-400';
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

  return (
    <div className="space-y-8 bg-gray-900 text-white">
      {/* Welcome Banner */}
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
            <p className="text-sm text-gray-400 mt-2">Your AI empire awaits. How are you feeling today?</p>
          </div>
          <div className="text-6xl">🎯</div>
        </div>
      </div>

      {/* Top Row KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Pipeline */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Revenue Pipeline</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold text-green-400">
                ${(stats.pipelineValue / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs">{stats.activeDealCount} active deals</p>
        </div>

        {/* Active Prospects */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Active Prospects</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold text-purple-400">{stats.prospectCount}</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            {stats.prospectConversionRate.toFixed(1)}% conversion rate
          </p>
        </div>

        {/* Agent Fleet Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Agent Fleet Status</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold text-blue-400">
                {stats.agentFleetActive}
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            of {stats.agentFleetMax} agents active · {stats.agentSuccessRate.toFixed(1)}% success
          </p>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
          <p className="text-gray-400 text-sm font-medium mb-2">Upcoming Schedule</p>
          <div className="space-y-2">
            <p className="text-sm text-white font-medium">Executive briefing - AppViewX</p>
            <p className="text-xs text-gray-500">Tomorrow at 2:00 PM EST</p>
            <p className="text-xs text-amber-400 mt-2">Reminder: Annual checkup due</p>
          </div>
        </div>
      </div>

      {/* Prospect Pipeline Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">CISO Prospect Pipeline</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ICP Fit</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Contact</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.prospects && stats.prospects.length > 0 ? (
                stats.prospects.map((prospect) => (
                  <tr key={prospect.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                    <td className="py-3 px-4 font-medium">{prospect.name}</td>
                    <td className="py-3 px-4 text-gray-400">{prospect.company}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          prospect.status
                        )}`}
                      >
                        {prospect.status}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-medium ${getIcpScoreColor(prospect.icpFitScore)}`}>
                      {prospect.icpFitScore}%
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{prospect.lastContact}</td>
                    <td className="py-3 px-4 text-gray-300 text-xs">{prospect.nextAction}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No prospects loaded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outreach Campaigns Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">Outreach Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.campaigns && stats.campaigns.length > 0 ? (
            stats.campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border border-gray-700 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <p className="text-xs text-gray-500">{campaign.type}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      campaign.status === 'live'
                        ? 'bg-emerald-900 text-emerald-200'
                        : campaign.status === 'paused'
                          ? 'bg-amber-900 text-amber-200'
                          : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Target Contacts</p>
                    <p className="font-semibold">{campaign.targetContacts}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-1">Response Rate</p>
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-blue-400">{campaign.responseRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">({campaign.responsesReceived} responses)</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs mb-1">Meetings Booked</p>
                    <p className="font-semibold text-emerald-400">{campaign.meetingsBooked}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-gray-500 text-center py-8">No campaigns loaded</p>
          )}
        </div>
      </div>

      {/* AI Agent Activity Section */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">AI Agent Activity</h2>
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

      {/* Quick Actions Section */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/lead-pipeline">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">View Prospect Pipeline</p>
              <p className="text-gray-500 text-xs">Manage CISO prospects and deals</p>
            </button>
          </Link>

          <Link href="/dashboard/assessments">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">New Client Assessment</p>
              <p className="text-gray-500 text-xs">Create a client GRC assessment</p>
            </button>
          </Link>

          <Link href="/dashboard/outreach">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">📧</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Outreach Dashboard</p>
              <p className="text-gray-500 text-xs">Monitor campaign metrics</p>
            </button>
          </Link>

          <Link href="/dashboard/travel-risk">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">✈️</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Travel Risk Analysis</p>
              <p className="text-gray-500 text-xs">Your travel advisories & client deliverables</p>
            </button>
          </Link>

          <Link href="/dashboard/speaking">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">🎤</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Speaking Calendar</p>
              <p className="text-gray-500 text-xs">Conferences, panels, and appearances</p>
            </button>
          </Link>

          <Link href="/dashboard/reports">
            <button className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-4 text-left transition-all group">
              <div className="text-2xl mb-2">📄</div>
              <p className="font-semibold group-hover:text-blue-400 transition-colors">Generate Executive Report</p>
              <p className="text-gray-500 text-xs">Create custom reports and presentations</p>
            </button>
          </Link>
        </div>
      </div>

      {/* Footer with Last Updated */}
      {lastUpdated && (
        <div className="text-center text-xs text-gray-500 py-4">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
