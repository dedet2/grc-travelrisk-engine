'use client';

import { useState, useEffect } from 'react';

interface Opportunity {
  id: string;
  title: string;
  category: 'consulting' | 'speaking' | 'funding' | 'advisorship' | 'philanthropy' | 'governance';
  status: 'new' | 'in-progress' | 'won' | 'lost';
  revenuePotential: number;
  probability: number;
  source: string;
  contact: string;
  dateAdded: string;
  nextAction?: string;
}

interface OpportunitiesMetrics {
  totalPipeline: number;
  activeOpportunities: number;
  closedWon: number;
  closureRate: number;
}

interface OpportunitiesData {
  metrics: OpportunitiesMetrics;
  opportunities: Opportunity[];
}

const categoryConfig = {
  consulting: {
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    label: 'Consulting',
  },
  speaking: {
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    label: 'Paid Speaking',
  },
  funding: {
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    label: 'Funding',
  },
  advisorship: {
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    label: 'Advisorship',
  },
  philanthropy: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    label: 'Philanthropy',
  },
  governance: {
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    label: 'AI Governance',
  },
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-700';
    case 'in-progress':
      return 'bg-amber-100 text-amber-700';
    case 'won':
      return 'bg-emerald-100 text-emerald-700';
    case 'lost':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export default function OpportunitiesPage() {
  const [data, setData] = useState<OpportunitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOpportunitiesData() {
      try {
        const response = await fetch('/api/leads');
        if (!response.ok) throw new Error('Failed to fetch opportunities');

        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunitiesData();
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
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load opportunities</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  // Filter opportunities
  let filtered = data.opportunities;
  if (selectedCategory) {
    filtered = filtered.filter((opp) => opp.category === selectedCategory);
  }
  if (selectedStatus) {
    filtered = filtered.filter((opp) => opp.status === selectedStatus);
  }

  // Sort by probability and revenue
  filtered = filtered.sort((a, b) => {
    const aScore = a.probability * a.revenuePotential;
    const bScore = b.probability * b.revenuePotential;
    return bScore - aScore;
  });

  // Group by status
  const statuses = ['new', 'in-progress', 'won', 'lost'];
  const opportunitiesByStatus = statuses.reduce(
    (acc, status) => {
      acc[status] = filtered.filter((opp) => opp.status === status);
      return acc;
    },
    {} as Record<string, Opportunity[]>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Business Opportunities</h1>
        <p className="text-gray-600 mt-2">
          Track consulting, speaking, funding, advisorships, philanthropy, and AI governance opportunities
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pipeline */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Pipeline</p>
          <p className="text-4xl font-bold text-indigo-600">
            ${(data.metrics.totalPipeline / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">Revenue potential</p>
        </div>

        {/* Active Opportunities */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Active Opportunities</p>
          <p className="text-4xl font-bold text-blue-600">
            {data.metrics.activeOpportunities}
          </p>
          <p className="text-xs text-gray-600 mt-2">New and in-progress</p>
        </div>

        {/* Closed Won */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Closed Won</p>
          <p className="text-4xl font-bold text-emerald-600">
            {data.metrics.closedWon}
          </p>
          <p className="text-xs text-gray-600 mt-2">Completed deals</p>
        </div>

        {/* Closure Rate */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Closure Rate</p>
          <p className="text-4xl font-bold text-purple-600">
            {data.metrics.closureRate}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Win rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() =>
                  setSelectedCategory(selectedCategory === key ? null : key)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  selectedCategory === key
                    ? config.color
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filter by Status
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Statuses
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() =>
                  setSelectedStatus(selectedStatus === status ? null : status)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getStatusColor(
                  status
                )} hover:shadow-md`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filtered.length} of {data.opportunities.length} opportunities
        </p>
      </div>

      {/* Pipeline Kanban */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Opportunity Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.map((status) => {
            const statusOpps = opportunitiesByStatus[status];
            const totalValue = statusOpps.reduce(
              (sum, opp) => sum + opp.revenuePotential,
              0
            );

            return (
              <div
                key={status}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">{getStatusLabel(status)}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                    {statusOpps.length}
                  </span>
                </div>

                <p className="text-2xl font-bold text-gray-900 mb-4">
                  ${(totalValue / 1000).toFixed(0)}k
                </p>

                <div className="space-y-2">
                  {statusOpps.slice(0, 5).map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded p-3 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${
                            categoryConfig[opp.category as keyof typeof categoryConfig]
                              ?.color || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {categoryConfig[opp.category as keyof typeof categoryConfig]
                            ?.label || 'Other'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {opp.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {opp.contact}
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-baseline justify-between mb-1">
                          <p className="text-xs text-gray-600">
                            ${(opp.revenuePotential / 1000).toFixed(0)}k
                          </p>
                          <p className="text-xs font-bold text-gray-900">
                            {opp.probability}%
                          </p>
                        </div>
                        <div className="bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {statusOpps.length > 5 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      +{statusOpps.length - 5} more
                    </p>
                  )}
                  {statusOpps.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No opportunities
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">All Opportunities</h2>
          <p className="text-sm text-gray-600 mt-1">
            Sorted by priority (probability x revenue)
          </p>
        </div>

        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opportunity) => (
              <div
                key={opportunity.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{opportunity.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {opportunity.source} | {opportunity.contact} | Added{' '}
                      {new Date(opportunity.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        categoryConfig[opportunity.category as keyof typeof categoryConfig]
                          ?.color || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {categoryConfig[opportunity.category as keyof typeof categoryConfig]
                        ?.label || 'Other'}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        opportunity.status
                      )}`}
                    >
                      {getStatusLabel(opportunity.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-600">Revenue Potential</p>
                    <p className="font-bold text-gray-900">
                      ${(opportunity.revenuePotential / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Probability</p>
                    <p className="font-bold text-gray-900">
                      {opportunity.probability}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Expected Value</p>
                    <p className="font-bold text-indigo-600">
                      ${(
                        (opportunity.revenuePotential *
                          opportunity.probability) /
                        100 /
                        1000
                      ).toFixed(0)}k
                    </p>
                  </div>
                </div>

                {opportunity.nextAction && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-700">
                      Next Action: {opportunity.nextAction}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              No opportunities match the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
