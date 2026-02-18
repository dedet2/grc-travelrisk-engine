'use client';

import { useState, useEffect } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'lead' | 'prospect' | 'customer';
  createdAt: string;
}

interface Deal {
  id: string;
  title: string;
  stage: 'negotiation' | 'proposal' | 'qualified' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  contact: string;
}

interface CRMMetrics {
  totalContacts: number;
  activePipeline: number;
  closureRate: number;
  averageDealValue: number;
}

interface CRMData {
  metrics: CRMMetrics;
  contacts: Contact[];
  deals: Deal[];
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'lead':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    case 'prospect':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
    case 'customer':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
  }
}

function getStageColor(stage: string): string {
  switch (stage) {
    case 'qualified':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'proposal':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    case 'negotiation':
      return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300';
    case 'closed-won':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
    case 'closed-lost':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
}

const stageOrder = ['qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

const mockData: CRMData = {
  metrics: {
    totalContacts: 156,
    activePipeline: 847000,
    closureRate: 34,
    averageDealValue: 42000,
  },
  contacts: [
    { id: 'c1', name: 'Scott Kennedy', email: 'skennedy@appviewx.com', company: 'AppViewX', status: 'prospect', createdAt: '2026-02-01' },
    { id: 'c2', name: 'John Wilson', email: 'jwilson@haystackid.com', company: 'HaystackID', status: 'lead', createdAt: '2026-02-02' },
    { id: 'c3', name: 'Radhika Bajpai', email: 'rbajpai@russell.com', company: 'Russell Investments', status: 'prospect', createdAt: '2026-02-03' },
    { id: 'c4', name: 'Rodrigo Jorge', email: 'rjorge@cerc.com', company: 'CERC', status: 'lead', createdAt: '2026-02-04' },
    { id: 'c5', name: 'David Ulloa', email: 'dulloa@imclogistics.com', company: 'IMC Logistics', status: 'prospect', createdAt: '2026-02-05' },
    { id: 'c6', name: 'Michael Block', email: 'mblock@lereta.com', company: 'LERETA LLC', status: 'customer', createdAt: '2026-01-15' },
    { id: 'c7', name: 'Ray Taft', email: 'rtaft@metadata.io', company: 'Metadata', status: 'lead', createdAt: '2026-02-06' },
    { id: 'c8', name: 'Nilanjan Ghatak', email: 'nghatak@tatasteel.com', company: 'Tata Steel Utilities', status: 'lead', createdAt: '2026-02-07' },
    { id: 'c9', name: 'Donna Ross', email: 'dross@radian.com', company: 'Radian', status: 'prospect', createdAt: '2026-02-08' },
    { id: 'c10', name: 'Sarah Chen', email: 'schen@fintech.io', company: 'FinTech Solutions', status: 'customer', createdAt: '2026-01-10' },
  ],
  deals: [
    { id: 'd1', title: 'AppViewX - Enterprise GRC Suite', stage: 'qualified', value: 75000, probability: 25, contact: 'Scott Kennedy' },
    { id: 'd2', title: 'Russell Investments - AI Risk Engine', stage: 'proposal', value: 120000, probability: 50, contact: 'Radhika Bajpai' },
    { id: 'd3', title: 'LERETA - Compliance Automation', stage: 'negotiation', value: 95000, probability: 70, contact: 'Michael Block' },
    { id: 'd4', title: 'FinTech Solutions - Full Platform', stage: 'closed-won', value: 150000, probability: 100, contact: 'Sarah Chen' },
    { id: 'd5', title: 'Radian - ISO 27001 Assessment', stage: 'proposal', value: 45000, probability: 40, contact: 'Donna Ross' },
    { id: 'd6', title: 'HaystackID - SOC 2 Readiness', stage: 'qualified', value: 60000, probability: 20, contact: 'John Wilson' },
    { id: 'd7', title: 'IMC Logistics - Travel Risk Module', stage: 'negotiation', value: 82000, probability: 65, contact: 'David Ulloa' },
    { id: 'd8', title: 'Metadata - GDPR Compliance Pack', stage: 'proposal', value: 55000, probability: 45, contact: 'Ray Taft' },
    { id: 'd9', title: 'CERC - Risk Assessment Pilot', stage: 'qualified', value: 35000, probability: 15, contact: 'Rodrigo Jorge' },
    { id: 'd10', title: 'Tata Steel - Enterprise Bundle', stage: 'closed-lost', value: 200000, probability: 0, contact: 'Nilanjan Ghatak' },
  ],
};

export default function CRMPage() {
  const [data, setData] = useState<CRMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'pipeline' | 'contacts'>('pipeline');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCRMData = async () => {
      try {
        // Fetch contacts and deals in parallel
        const [contactsRes, dealsRes] = await Promise.allSettled([
          fetch('/api/crm?type=contacts'),
          fetch('/api/crm?type=deals'),
        ]);

        let contacts: Contact[] = [];
        let deals: Deal[] = [];
        let metrics: CRMMetrics | null = null;

        // Parse contacts
        if (contactsRes.status === 'fulfilled' && contactsRes.value.ok) {
          const cResult = await contactsRes.value.json();
          const cData = cResult.data || cResult;
          if (Array.isArray(cData.contacts)) {
            contacts = cData.contacts.map((c: any) => ({
              id: c.id || c.contactId || String(Math.random()),
              name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim(),
              email: c.email || '',
              company: c.company || c.companyName || '',
              status: c.status || 'lead',
              createdAt: c.createdAt || c.created_at || new Date().toISOString(),
            }));
          }
          if (cData.metrics) metrics = cData.metrics;
        }

        // Parse deals
        if (dealsRes.status === 'fulfilled' && dealsRes.value.ok) {
          const dResult = await dealsRes.value.json();
          const dData = dResult.data || dResult;
          if (Array.isArray(dData.deals)) {
            deals = dData.deals.map((d: any) => ({
              id: d.id || d.dealId || String(Math.random()),
              title: d.title || d.dealName || 'Untitled Deal',
              stage: d.stage || 'qualified',
              value: d.value || 0,
              probability: d.probability || 0,
              contact: d.contact || d.contactName || '',
            }));
          }
          if (!metrics && dData.metrics) metrics = dData.metrics;
        }

        // If we got real data, use it
        if (contacts.length > 0 || deals.length > 0) {
          const totalPipeline = deals
            .filter((d) => !['closed-won', 'closed-lost'].includes(d.stage))
            .reduce((sum, d) => sum + d.value, 0);
          const wonDeals = deals.filter((d) => d.stage === 'closed-won').length;
          const totalDeals = deals.length || 1;

          setData({
            metrics: metrics || {
              totalContacts: contacts.length,
              activePipeline: totalPipeline,
              closureRate: Math.round((wonDeals / totalDeals) * 100),
              averageDealValue: deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.value, 0) / deals.length) : 0,
            },
            contacts,
            deals,
          });
          setLastUpdated(new Date());
        } else {
          setData(mockData);
        }
      } catch (err) {
        console.error('Error fetching CRM data, using mock data:', err);
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchCRMData();
    const interval = setInterval(fetchCRMData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">Failed to load CRM</h2>
        <p className="text-red-700 dark:text-red-300">Could not load CRM data. Please try again.</p>
      </div>
    );
  }

  // Group deals by stage safely
  const dealsByStage = stageOrder.reduce(
    (acc, stage) => {
      acc[stage] = Array.isArray(data.deals) ? data.deals.filter((deal) => deal.stage === stage) : [];
      return acc;
    },
    {} as Record<string, Deal[]>
  );

  const stageLabels: Record<string, string> = {
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Closed Won',
    'closed-lost': 'Closed Lost',
  };

  const stageEmojis: Record<string, string> = {
    qualified: '🎯',
    proposal: '📋',
    negotiation: '🤝',
    'closed-won': '✅',
    'closed-lost': '❌',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">CRM & Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage contacts, deals, and sales pipeline</p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCRMData}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50 text-sm"
          >
            Refresh
          </button>
          <button
            onClick={() => setActiveView('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'pipeline'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setActiveView('contacts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'contacts'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Contacts
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Contacts</p>
          <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {data.metrics.totalContacts}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Active relationships</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Pipeline</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            ${data.metrics.activePipeline >= 1000 ? `${(data.metrics.activePipeline / 1000).toFixed(0)}k` : data.metrics.activePipeline}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">In-progress deals</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Closure Rate</p>
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
            {data.metrics.closureRate}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Won vs total</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avg Deal Value</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
            ${data.metrics.averageDealValue >= 1000 ? `${(data.metrics.averageDealValue / 1000).toFixed(0)}k` : data.metrics.averageDealValue}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Per opportunity</p>
        </div>
      </div>

      {activeView === 'pipeline' ? (
        <>
          {/* Pipeline Stages Kanban */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Deal Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stageOrder.map((stage) => {
                const stageDeals = dealsByStage[stage] || [];
                const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

                return (
                  <div
                    key={stage}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {stageEmojis[stage]} {stageLabels[stage]}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(stage)}`}>
                        {stageDeals.length}
                      </span>
                    </div>

                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      ${stageValue >= 1000 ? `${(stageValue / 1000).toFixed(0)}k` : stageValue}
                    </p>

                    <div className="space-y-2">
                      {stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{deal.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">${deal.value.toLocaleString()}</p>
                          <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {deal.probability}% • {deal.contact}
                          </p>
                        </div>
                      ))}
                      {stageDeals.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                          No deals
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline Summary Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Pipeline Distribution</h3>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {stageOrder.map((stage) => {
                const stageDeals = dealsByStage[stage] || [];
                const totalDeals = data.deals.length || 1;
                const widthPercent = (stageDeals.length / totalDeals) * 100;
                const colors: Record<string, string> = {
                  qualified: 'bg-blue-500',
                  proposal: 'bg-purple-500',
                  negotiation: 'bg-amber-500',
                  'closed-won': 'bg-emerald-500',
                  'closed-lost': 'bg-red-400',
                };
                if (widthPercent === 0) return null;
                return (
                  <div
                    key={stage}
                    className={`${colors[stage]} flex items-center justify-center text-white text-xs font-medium`}
                    style={{ width: `${widthPercent}%` }}
                    title={`${stageLabels[stage]}: ${stageDeals.length} deals`}
                  >
                    {widthPercent > 10 ? `${stageDeals.length}` : ''}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {stageOrder.map((stage) => {
                const colors: Record<string, string> = {
                  qualified: 'bg-blue-500',
                  proposal: 'bg-purple-500',
                  negotiation: 'bg-amber-500',
                  'closed-won': 'bg-emerald-500',
                  'closed-lost': 'bg-red-400',
                };
                return (
                  <div key={stage} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${colors[stage]}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{stageLabels[stage]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Contacts List */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Contacts</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {data.contacts.length} contacts in database
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-gray-100">Added</th>
                </tr>
              </thead>
              <tbody>
                {data.contacts.length > 0 ? (
                  data.contacts.slice(0, 20).map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {contact.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {contact.company}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(contact.status)}`}
                        >
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No contacts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
