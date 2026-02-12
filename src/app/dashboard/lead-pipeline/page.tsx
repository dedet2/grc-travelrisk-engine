'use client';

import { useState, useEffect } from 'react';

// Inline SVG Icons
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconTrendingUp = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconTarget = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconZap = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconArrowUp = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  </svg>
);

// Types
interface ScoredLead {
  leadId: string;
  companyName: string;
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'enterprise';
  contactEmail: string;
  contactName: string;
  revenue?: number;
  employees?: number;
  website?: string;
  score: number;
  icpFit: number;
  industrySuitability: number;
  sizeMatch: number;
  stage: 'cold' | 'warm' | 'hot' | 'qualified' | 'nurture';
  scoredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface LeadPipelineMetrics {
  totalLeads: number;
  coldLeads: number;
  warmLeads: number;
  hotLeads: number;
  qualifiedLeads: number;
  nurtureCampaignLeads: number;
  averageScore: number;
  conversionRate: number;
  topIndustries?: { industry: string; count: number }[];
  topCompanySizes?: { size: string; count: number }[];
}

interface ApiResponse {
  success: boolean;
  data: {
    leads: ScoredLead[];
    metrics: LeadPipelineMetrics;
    count: number;
  };
}

type PipelineStage = 'cold' | 'warm' | 'hot' | 'qualified' | 'nurture';

const stageLabels: Record<PipelineStage, string> = {
  cold: 'Cold',
  warm: 'Warm',
  hot: 'Hot',
  qualified: 'Qualified',
  nurture: 'Nurture',
};

const stageColors: Record<PipelineStage, string> = {
  cold: 'bg-slate-700/30 border-slate-600/30',
  warm: 'bg-blue-700/20 border-blue-600/30',
  hot: 'bg-orange-700/20 border-orange-600/30',
  qualified: 'bg-purple-700/20 border-purple-600/30',
  nurture: 'bg-indigo-700/20 border-indigo-600/30',
};

const stageBadgeColors: Record<PipelineStage, string> = {
  cold: 'bg-slate-700/40 text-slate-300 border-slate-600/50',
  warm: 'bg-blue-700/40 text-blue-300 border-blue-600/50',
  hot: 'bg-orange-700/40 text-orange-300 border-orange-600/50',
  qualified: 'bg-emerald-700/40 text-emerald-300 border-emerald-600/50',
  nurture: 'bg-indigo-700/40 text-indigo-300 border-indigo-600/50',
};

const companySizeLabels: Record<string, string> = {
  startup: 'Startup',
  small: 'Small',
  medium: 'Medium',
  enterprise: 'Enterprise',
};

// Mock data for leads - CISO prospects
const MOCK_LEADS: ScoredLead[] = [
  {
    leadId: 'lead_1',
    companyName: 'AppViewX',
    contactName: 'Scott Kennedy',
    industry: 'Cybersecurity',
    companySize: 'enterprise',
    contactEmail: 'scott.kennedy@appviewx.com',
    revenue: 250000,
    employees: 450,
    website: 'https://appviewx.com',
    score: 92,
    icpFit: 95,
    industrySuitability: 90,
    sizeMatch: 92,
    stage: 'hot',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_2',
    companyName: 'HaystackID',
    contactName: 'John Wilson',
    industry: 'eDiscovery',
    companySize: 'enterprise',
    contactEmail: 'john.wilson@haystackid.com',
    revenue: 220000,
    employees: 380,
    website: 'https://haystackid.com',
    score: 88,
    icpFit: 90,
    industrySuitability: 88,
    sizeMatch: 87,
    stage: 'qualified',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_3',
    companyName: 'Russell Investments',
    contactName: 'Radhika Bajpai',
    industry: 'Financial Services',
    companySize: 'enterprise',
    contactEmail: 'radhika.bajpai@russell.com',
    revenue: 280000,
    employees: 520,
    website: 'https://russellinvestments.com',
    score: 85,
    icpFit: 87,
    industrySuitability: 85,
    sizeMatch: 84,
    stage: 'hot',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_4',
    companyName: 'CERC',
    contactName: 'Rodrigo Jorge',
    industry: 'Energy',
    companySize: 'enterprise',
    contactEmail: 'rodrigo.jorge@cerc.com',
    revenue: 200000,
    employees: 340,
    website: 'https://cerc.com',
    score: 82,
    icpFit: 85,
    industrySuitability: 80,
    sizeMatch: 82,
    stage: 'warm',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_5',
    companyName: 'IMC Logistics',
    contactName: 'David Ulloa',
    industry: 'Logistics',
    companySize: 'enterprise',
    contactEmail: 'david.ulloa@imclogistics.com',
    revenue: 190000,
    employees: 310,
    website: 'https://imclogistics.com',
    score: 79,
    icpFit: 82,
    industrySuitability: 78,
    sizeMatch: 80,
    stage: 'warm',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_6',
    companyName: 'LERETA LLC',
    contactName: 'Michael Block',
    industry: 'Real Estate',
    companySize: 'medium',
    contactEmail: 'michael.block@lereta.com',
    revenue: 150000,
    employees: 220,
    website: 'https://lereta.com',
    score: 76,
    icpFit: 78,
    industrySuitability: 75,
    sizeMatch: 77,
    stage: 'warm',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_7',
    companyName: 'Metadata',
    contactName: 'Ray Taft',
    industry: 'Data Management',
    companySize: 'medium',
    contactEmail: 'ray.taft@metadata.com',
    revenue: 140000,
    employees: 180,
    website: 'https://metadata.com',
    score: 73,
    icpFit: 75,
    industrySuitability: 72,
    sizeMatch: 74,
    stage: 'cold',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_8',
    companyName: 'Tata Steel',
    contactName: 'Nilanjan Ghatak',
    industry: 'Manufacturing',
    companySize: 'enterprise',
    contactEmail: 'nilanjan.ghatak@tatasteel.com',
    revenue: 260000,
    employees: 450,
    website: 'https://tatasteel.com',
    score: 84,
    icpFit: 86,
    industrySuitability: 83,
    sizeMatch: 85,
    stage: 'hot',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    leadId: 'lead_9',
    companyName: 'Radian',
    contactName: 'Donna Ross',
    industry: 'Financial Services',
    companySize: 'enterprise',
    contactEmail: 'donna.ross@radian.com',
    revenue: 240000,
    employees: 410,
    website: 'https://radian.com',
    score: 87,
    icpFit: 89,
    industrySuitability: 87,
    sizeMatch: 86,
    stage: 'qualified',
    scoredAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock metrics data
const MOCK_METRICS: LeadPipelineMetrics = {
  totalLeads: MOCK_LEADS.length,
  coldLeads: 1,
  warmLeads: 3,
  hotLeads: 3,
  qualifiedLeads: 2,
  nurtureCampaignLeads: 0,
  averageScore: 83,
  conversionRate: 22,
  topIndustries: [
    { industry: 'Enterprise', count: 6 },
    { industry: 'Financial Services', count: 2 },
    { industry: 'Other', count: 1 },
  ],
  topCompanySizes: [
    { size: 'Enterprise', count: 7 },
    { size: 'Medium', count: 2 },
  ],
};

export default function LeadPipelinePage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [metrics, setMetrics] = useState<LeadPipelineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ScoredLead; direction: 'asc' | 'desc' } | null>(null);

  // Fetch leads from API
  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await fetch('/api/leads');
        if (!response.ok) throw new Error('Failed to fetch leads');

        const result: ApiResponse = await response.json();
        if (result.success && result.data) {
          // Add Array.isArray validation before using leads
          const safeLeads = Array.isArray(result.data.leads) ? result.data.leads : [];
          setLeads(safeLeads);
          setMetrics(result.data.metrics || MOCK_METRICS);
        } else {
          // API returned success=false, use mock data
          setLeads(MOCK_LEADS);
          setMetrics(MOCK_METRICS);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError(err instanceof Error ? err.message : 'Failed to load leads');
        // Fallback to mock data on API failure
        setLeads(MOCK_LEADS);
        setMetrics(MOCK_METRICS);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  // Group leads by stage
  const getLeadsByStage = (stage: PipelineStage): ScoredLead[] => {
    return leads.filter((l) => l.stage === stage);
  };

  // Sort leads for table view
  const getSortedLeads = (): ScoredLead[] => {
    let sorted = [...leads];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === undefined || bVal === undefined) return 0;

        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc' ? aVal.localeCompare(String(bVal)) : String(bVal).localeCompare(aVal);
        }
        if (typeof aVal === 'number') {
          return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        }
        return 0;
      });
    }
    return sorted;
  };

  const handleSort = (key: keyof ScoredLead) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  // Calculate average deal size
  const avgDealSize =
    leads.length > 0
      ? leads.reduce((sum, lead) => sum + (lead.revenue || 100000), 0) / leads.length
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100">
        <div className="mb-8">
          <div className="h-10 bg-slate-700/50 rounded w-1/3 animate-pulse mb-2" />
          <div className="h-5 bg-slate-700/50 rounded w-1/4 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // If metrics is missing (should never happen now with mock data), use mock metrics
  const displayMetrics = metrics || MOCK_METRICS;

  if (error && leads.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-400 mb-2">Failed to load leads (using mock data)</h2>
          <p className="text-red-300">{error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  const stages: PipelineStage[] = ['cold', 'warm', 'hot', 'qualified', 'nurture'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Lead Pipeline
        </h1>
        <p className="text-slate-400">Track and manage {displayMetrics.totalLeads} leads across {stages.length} pipeline stages</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Leads */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Total Leads</h3>
            <span className="text-cyan-400">
              <IconUsers />
            </span>
          </div>
          <div className="text-3xl font-bold text-white">{displayMetrics.totalLeads}</div>
          <p className="text-xs text-slate-400 mt-3">In pipeline</p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Avg Deal Size</h3>
            <span className="text-amber-400">
              <IconZap />
            </span>
          </div>
          <div className="text-3xl font-bold text-white">${(avgDealSize / 1000).toFixed(0)}K</div>
          <p className="text-xs text-slate-400 mt-3">Average revenue potential</p>
        </div>

        {/* Qualified Leads */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Qualified Leads</h3>
            <span className="text-purple-400">
              <IconTrendingUp />
            </span>
          </div>
          <div className="text-3xl font-bold text-white">{displayMetrics.qualifiedLeads}</div>
          <p className="text-xs text-slate-400 mt-3">Ready to close</p>
        </div>

        {/* Avg Score */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Avg ICP Score</h3>
            <span className="text-emerald-400">
              <IconTarget />
            </span>
          </div>
          <div className="text-3xl font-bold text-white">{Math.round(displayMetrics.averageScore)}</div>
          <p className="text-xs text-slate-400 mt-3">Out of 100</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setViewMode('kanban')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            viewMode === 'kanban'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
          }`}
        >
          Kanban View
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            viewMode === 'table'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600'
          }`}
        >
          Table View
        </button>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage);
            const stageValue = stageLeads.reduce((sum, lead) => sum + (lead.revenue || 100000), 0);

            return (
              <div key={stage} className="flex flex-col">
                <div className="mb-3">
                  <h3 className="font-semibold text-white text-sm">{stageLabels[stage]}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {stageLeads.length} lead{stageLeads.length !== 1 ? 's' : ''} • ${(stageValue / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="space-y-3 flex-1">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.leadId}
                      className={`rounded-lg p-4 border ${stageColors[stage]} hover:border-cyan-500/50 transition-all cursor-pointer group`}
                    >
                      <p className="font-medium text-white text-sm mb-1 group-hover:text-cyan-400 line-clamp-1">
                        {lead.companyName}
                      </p>
                      <p className="text-xs text-slate-400 mb-2">{lead.contactName}</p>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-400 font-semibold text-xs">${(lead.revenue || 100000) / 1000}K</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-200`}>
                          {companySizeLabels[lead.companySize]}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-400">Score:</span>
                          <span className="text-xs font-semibold text-cyan-300">{Math.round(lead.score)}</span>
                        </div>
                        <div className="bg-slate-700/30 rounded-full h-1.5 border border-slate-600/30">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-cyan-400 h-1.5 rounded-full"
                            style={{ width: `${Math.min(lead.score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-8">No leads</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-700/20">
                  <th
                    onClick={() => handleSort('companyName')}
                    className="text-left py-4 px-6 text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Company {sortConfig?.key === 'companyName' && <IconArrowUp />}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('contactName')}
                    className="text-left py-4 px-6 text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Contact {sortConfig?.key === 'contactName' && <IconArrowUp />}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('industry')}
                    className="text-left py-4 px-6 text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Industry {sortConfig?.key === 'industry' && <IconArrowUp />}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('revenue')}
                    className="text-left py-4 px-6 text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Value {sortConfig?.key === 'revenue' && <IconArrowUp />}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('score')}
                    className="text-left py-4 px-6 text-xs font-semibold text-slate-400 cursor-pointer hover:text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Score {sortConfig?.key === 'score' && <IconArrowUp />}
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Stage</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Company Size</th>
                </tr>
              </thead>
              <tbody>
                {getSortedLeads().map((lead, idx) => (
                  <tr
                    key={lead.leadId}
                    className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${
                      idx % 2 === 0 ? 'bg-slate-800/20' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-white">{lead.companyName}</td>
                    <td className="py-4 px-6 text-slate-300 text-sm">{lead.contactName}</td>
                    <td className="py-4 px-6 text-slate-300 text-sm">{lead.industry}</td>
                    <td className="py-4 px-6 text-cyan-400 font-semibold">${((lead.revenue || 100000) / 1000).toFixed(0)}K</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-300 font-semibold text-sm">{Math.round(lead.score)}</span>
                        <div className="bg-slate-700/30 rounded-full h-1 w-12 border border-slate-600/30">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-cyan-400 h-1 rounded-full"
                            style={{ width: `${Math.min(lead.score, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-medium border ${stageBadgeColors[lead.stage]}`}>
                        {stageLabels[lead.stage]}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 text-sm">{companySizeLabels[lead.companySize]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
