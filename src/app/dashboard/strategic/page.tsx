'use client';

import { useState, useEffect } from 'react';

interface CompetitiveInsight {
  competitor: string;
  marketShare: number;
  trend: 'up' | 'down' | 'stable';
  keyStrengths: string[];
  keyWeaknesses: string[];
}

interface RevenueProjection {
  month: string;
  projected: number;
  conservative: number;
  optimistic: number;
}

interface StrategicInitiative {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress: number;
  targetDate: string;
  owner: string;
}

interface StrategicData {
  competitors: CompetitiveInsight[];
  projections: RevenueProjection[];
  initiatives: StrategicInitiative[];
  metrics: {
    marketShare: number;
    growthRate: number;
    yoyGrowth: number;
    strategicScore: number;
  };
}

function getPriorityColor(priority: string): string {
  switch (priority) {
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

export default function StrategicPage() {
  const [data, setData] = useState<StrategicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStrategicData() {
      try {
        const response = await fetch('/api/strategic-plan');
        if (!response.ok) throw new Error('Failed to fetch strategic data');

        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        console.error('Error fetching strategic data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load strategic data');
      } finally {
        setLoading(false);
      }
    }

    fetchStrategicData();
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

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load strategic data</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Strategic Intelligence</h1>
        <p className="text-gray-600 mt-2">Competitive landscape, forecasts, and strategic initiatives</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Market Share */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Market Share</p>
          <p className="text-4xl font-bold text-indigo-600">
            {data.metrics.marketShare}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Current position</p>
        </div>

        {/* Growth Rate */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Growth Rate</p>
          <p className="text-4xl font-bold text-emerald-600">
            {data.metrics.growthRate}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Quarterly momentum</p>
        </div>

        {/* YoY Growth */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-1">YoY Growth</p>
          <p className="text-4xl font-bold text-blue-600">
            {data.metrics.yoyGrowth}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Year-over-year</p>
        </div>

        {/* Strategic Score */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Strategic Score</p>
          <p className="text-4xl font-bold text-purple-600">
            {data.metrics.strategicScore}/100
          </p>
          <p className="text-xs text-gray-600 mt-2">Plan execution</p>
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Forecast</h2>
        <div className="space-y-6">
          {data.projections.slice(0, 6).map((projection, idx) => {
            const maxValue = Math.max(
              ...data.projections.map((p) =>
                Math.max(p.projected, p.conservative, p.optimistic)
              )
            );

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{projection.month}</p>
                  <span className="text-sm font-bold text-gray-900">
                    ${(projection.projected / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="space-y-1">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Projected</p>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${(projection.projected / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-600">Conservative</p>
                      <p className="font-medium text-gray-900">
                        ${(projection.conservative / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Optimistic</p>
                      <p className="font-medium text-gray-900">
                        ${(projection.optimistic / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competitive Landscape */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Competitive Landscape</h2>
          <p className="text-sm text-gray-600 mt-1">
            Market position and competitor analysis
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {data.competitors.map((competitor, idx) => (
            <div
              key={idx}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{competitor.competitor}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-bold text-gray-900">
                      {competitor.marketShare}%
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        competitor.trend === 'up'
                          ? 'text-red-600'
                          : competitor.trend === 'down'
                            ? 'text-emerald-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {getTrendIndicator(competitor.trend)}{' '}
                      {competitor.trend.charAt(0).toUpperCase() + competitor.trend.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-600 mb-2">Key Strengths</p>
                  <ul className="space-y-1">
                    {competitor.keyStrengths.map((strength, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-emerald-600 mt-0.5">+</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-2">Key Weaknesses</p>
                  <ul className="space-y-1">
                    {competitor.keyWeaknesses.map((weakness, i) => (
                      <li
                        key={i}
                        className="text-xs text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-red-600 mt-0.5">-</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Initiatives */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Strategic Initiatives</h2>
          <p className="text-sm text-gray-600 mt-1">
            Key projects driving strategic goals
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {data.initiatives.map((initiative) => (
            <div
              key={initiative.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{initiative.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{initiative.description}</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Owner: {initiative.owner} | Target: {new Date(initiative.targetDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                    initiative.priority
                  )}`}
                >
                  {initiative.priority.charAt(0).toUpperCase() + initiative.priority.slice(1)}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-600">Progress</p>
                  <p className="text-sm font-bold text-gray-900">{initiative.progress}%</p>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      initiative.progress >= 75
                        ? 'bg-emerald-600'
                        : initiative.progress >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-600'
                    }`}
                    style={{ width: `${initiative.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
