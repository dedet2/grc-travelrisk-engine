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
    color: 'bg-violet-100 text-violet-700 border-violet-300',
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
      return 'bg-violet-100 text-violet-700';
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

// Mock opportunities data
const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_1',
    title: 'AppViewX - Security Assessment',
    category: 'consulting',
    status: 'in-progress',
    revenuePotential: 150000,
    probability: 92,
    source: 'Direct Outreach',
    contact: 'Scott Kennedy',
    dateAdded: new Date().toISOString(),
    nextAction: 'Schedule security workshop',
  },
  {
    id: 'opp_2',
    title: 'HaystackID - GRC Consulting',
    category: 'consulting',
    status: 'won',
    revenuePotential: 180000,
    probability: 88,
    source: 'Referral',
    contact: 'John Wilson',
    dateAdded: new Date().toISOString(),
    nextAction: 'Contract negotiation in progress',
  },
  {
    id: 'opp_3',
    title: 'Russell Investments - Compliance Review',
    category: 'consulting',
    status: 'in-progress',
    revenuePotential: 120000,
    probability: 85,
    source: 'Inbound',
    contact: 'Radhika Bajpai',
    dateAdded: new Date().toISOString(),
    nextAction: 'Review compliance framework',
  },
  {
    id: 'opp_4',
    title: 'CERC - Risk Assessment',
    category: 'consulting',
    status: 'new',
    revenuePotential: 95000,
    probability: 65,
    source: 'Cold Outreach',
    contact: 'Rodrigo Jorge',
    dateAdded: new Date().toISOString(),
    nextAction: 'Initial discovery call',
  },
  {
    id: 'opp_5',
    title: 'IMC Logistics - Supply Chain Risk',
    category: 'consulting',
    status: 'new',
    revenuePotential: 110000,
    probability: 72,
    source: 'Event',
    contact: 'David Ulloa',
    dateAdded: new Date().toISOString(),
    nextAction: 'Send proposal',
  },
  {
    id: 'opp_6',
    title: 'Tata Steel - Governance Framework',
    category: 'governance',
    status: 'in-progress',
    revenuePotential: 160000,
    probability: 84,
    source: 'Referral',
    contact: 'Nilanjan Ghatak',
    dateAdded: new Date().toISOString(),
    nextAction: 'Board presentation',
  },
  {
    id: 'opp_7',
    title: 'Radian - Advisory Services',
    category: 'advisorship',
    status: 'won',
    revenuePotential: 125000,
    probability: 87,
    source: 'Direct Outreach',
    contact: 'Donna Ross',
    dateAdded: new Date().toISOString(),
    nextAction: 'Annual advisory review',
  },
];

// Mock metrics
const MOCK_OPPORTUNITIES_METRICS: OpportunitiesMetrics = {
  totalPipeline: 1135000,
  activeOpportunities: 4,
  closedWon: 2,
  closureRate: 29,
};

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
        const leadsData = result.data;

        // Add Array.isArray validation for leads
        const safeLeads = Array.isArray(leadsData.leads) ? leadsData.leads : [];

        // Transform leads data to opportunities format
        const opportunities: Opportunity[] = safeLeads.map((lead: any) => ({
          id: lead.leadId,
          title: lead.companyName,
          category: 'consulting' as const,
          status:
            lead.stage === 'qualified' ? 'won' :
            lead.stage === 'hot' ? 'in-progress' :
            lead.stage === 'cold' ? 'new' :
            'new' as any,
          revenuePotential: lead.revenue || 100000,
          probability: Math.round(lead.score || 50),
          source: 'Lead Pipeline',
          contact: lead.contactName,
          dateAdded: lead.createdAt,
          nextAction: `Follow up with ${lead.contactName} at ${lead.companyName}`,
        }));

        // Use API metrics if available, otherwise calculate from opportunities
        const hasOpportunities = opportunities.length > 0;
        const metrics = (leadsData.metrics && hasOpportunities) ? leadsData.metrics : {
          totalPipeline: opportunities.reduce((sum, opp) => sum + opp.revenuePotential, 0) || MOCK_OPPORTUNITIES_METRICS.totalPipeline,
          activeOpportunities: opportunities.filter(opp => opp.status === 'new' || opp.status === 'in-progress').length || MOCK_OPPORTUNITIES_METRICS.activeOpportunities,
          closedWon: opportunities.filter(opp => opp.status === 'won').length || MOCK_OPPORTUNITIES_METRICS.closedWon,
          closureRate: Math.round((opportunities.filter(opp => opp.status === 'won').length / Math.max(opportunities.length, 1)) * 100) || MOCK_OPPORTUNITIES_METRICS.closureRate,
        };

        // Use opportunities if we have them, otherwise use mock data
        const displayOpportunities = opportunities.length > 0 ? opportunities : MOCK_OPPORTUNITIES;

        setData({
          metrics,
          opportunities: displayOpportunities,
        });
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to load opportunities');
        // Fallback to mock data on error
        setData({
          metrics: MOCK_OPPORTUNITIES_METRICS,
          opportunities: MOCK_OPPORTUNITIES,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunitiesData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-violet-200 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // If data fetch failed, use mock data
  const displayData = data || {
    metrics: MOCK_OPPORTUNITIES_METRICS,
    opportunities: MOCK_OPPORTUNITIES,
  };

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load opportunities (using mock data)</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  // Ensure opportunities is an array
  const safeOpportunities = Array.isArray(displayData.opportunities) ? displayData.opportunities : [];

  // Filter opportunities
  let filtered = safeOpportunities;
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
        <h1 className="text-4xl font-bold text-violet-950">Business Opportunities</h1>
        <p className="text-violet-600 mt-2">
          Track consulting, speaking, funding, advisorships, philanthropy, and AI governance opportunities
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pipeline */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Total Pipeline</p>
          <p className="text-4xl font-bold text-violet-600">
            ${(displayData.metrics.totalPipeline / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-violet-600 mt-2">Revenue potential</p>
        </div>

        {/* Active Opportunities */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Active Opportunities</p>
          <p className="text-4xl font-bold text-blue-600">
            {displayData.metrics.activeOpportunities}
          </p>
          <p className="text-xs text-violet-600 mt-2">New and in-progress</p>
        </div>

        {/* Closed Won */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Closed Won</p>
          <p className="text-4xl font-bold text-emerald-600">
            {displayData.metrics.closedWon}
          </p>
          <p className="text-xs text-violet-600 mt-2">Completed deals</p>
        </div>

        {/* Closure Rate */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Closure Rate</p>
          <p className="text-4xl font-bold text-purple-600">
            {displayData.metrics.closureRate}%
          </p>
          <p className="text-xs text-violet-600 mt-2">Win rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-violet-700 mb-3">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
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
                    : 'bg-white border-violet-300 text-violet-700 hover:bg-violet-50/30'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-violet-700 mb-3">
            Filter by Status
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === null
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
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

        <p className="text-sm text-violet-600">
          Showing {filtered.length} of {safeOpportunities.length} opportunities
        </p>
      </div>

      {/* Pipeline Kanban */}
      <div>
        <h2 className="text-xl font-bold text-violet-950 mb-6">Opportunity Pipeline</h2>
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
                className="bg-violet-50/30 rounded-lg p-4 border border-violet-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-violet-950">{getStatusLabel(status)}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                    {statusOpps.length}
                  </span>
                </div>

                <p className="text-2xl font-bold text-violet-950 mb-4">
                  ${(totalValue / 1000).toFixed(0)}k
                </p>

                <div className="space-y-2">
                  {statusOpps.slice(0, 5).map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded p-3 border border-violet-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${
                            categoryConfig[opp.category as keyof typeof categoryConfig]
                              ?.color || 'bg-violet-100 text-violet-700'
                          }`}
                        >
                          {categoryConfig[opp.category as keyof typeof categoryConfig]
                            ?.label || 'Other'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-violet-950 line-clamp-2">
                        {opp.title}
                      </p>
                      <p className="text-xs text-violet-600 mt-1">
                        {opp.contact}
                      </p>
                      <div className="mt-2 pt-2 border-t border-violet-100">
                        <div className="flex items-baseline justify-between mb-1">
                          <p className="text-xs text-violet-600">
                            ${(opp.revenuePotential / 1000).toFixed(0)}k
                          </p>
                          <p className="text-xs font-bold text-violet-950">
                            {opp.probability}%
                          </p>
                        </div>
                        <div className="bg-violet-200 rounded-full h-1.5">
                          <div
                            className="bg-violet-600 h-1.5 rounded-full"
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {statusOpps.length > 5 && (
                    <p className="text-xs text-violet-500 text-center py-2">
                      +{statusOpps.length - 5} more
                    </p>
                  )}
                  {statusOpps.length === 0 && (
                    <p className="text-xs text-violet-500 text-center py-4">
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
        <div className="border-b border-violet-200 p-6">
          <h2 className="text-xl font-bold text-violet-950">All Opportunities</h2>
          <p className="text-sm text-violet-600 mt-1">
            Sorted by priority (probability x revenue)
          </p>
        </div>

        <div className="divide-y divide-violet-200 max-h-96 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opportunity) => (
              <div
                key={opportunity.id}
                className="p-6 hover:bg-violet-50/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-violet-950">{opportunity.title}</h3>
                    <p className="text-sm text-violet-600 mt-1">
                      {opportunity.source} | {opportunity.contact} | Added{' '}
                      {new Date(opportunity.dateAdded).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        categoryConfig[opportunity.category as keyof typeof categoryConfig]
                          ?.color || 'bg-violet-100 text-violet-700'
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
                    <p className="text-xs text-violet-600">Revenue Potential</p>
                    <p className="font-bold text-violet-950">
                      ${(opportunity.revenuePotential / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-violet-600">Probability</p>
                    <p className="font-bold text-violet-950">
                      {opportunity.probability}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-violet-600">Expected Value</p>
                    <p className="font-bold text-violet-600">
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
            <div className="p-12 text-center text-violet-500">
              No opportunities match the selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
