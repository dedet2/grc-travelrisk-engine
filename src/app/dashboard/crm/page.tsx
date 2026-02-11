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
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'prospect':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'customer':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

function getStageColor(stage: string): string {
  switch (stage) {
    case 'qualified':
      return 'bg-blue-100 text-blue-700';
    case 'proposal':
      return 'bg-purple-100 text-purple-700';
    case 'negotiation':
      return 'bg-amber-100 text-amber-700';
    case 'closed-won':
      return 'bg-emerald-100 text-emerald-700';
    case 'closed-lost':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

const stageOrder = ['qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

export default function CRMPage() {
  const [data, setData] = useState<CRMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCRMData() {
      try {
        const response = await fetch('/api/crm');
        if (!response.ok) throw new Error('Failed to fetch CRM data');

        const result = await response.json();
        setData(result.data || result);
      } catch (err) {
        console.error('Error fetching CRM data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load CRM data');
      } finally {
        setLoading(false);
      }
    }

    fetchCRMData();
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
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load CRM</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  // Group deals by stage
  const dealsByStage = stageOrder.reduce(
    (acc, stage) => {
      acc[stage] = data.deals.filter((deal) => deal.stage === stage);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">CRM & Pipeline</h1>
        <p className="text-gray-600 mt-2">Manage contacts, deals, and sales pipeline</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Contacts */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Contacts</p>
          <p className="text-4xl font-bold text-indigo-600">
            {data.metrics.totalContacts}
          </p>
          <p className="text-xs text-gray-600 mt-2">Active relationships</p>
        </div>

        {/* Active Pipeline */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Active Pipeline</p>
          <p className="text-4xl font-bold text-blue-600">
            ${(data.metrics.activePipeline / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">In-progress deals</p>
        </div>

        {/* Closure Rate */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Closure Rate</p>
          <p className="text-4xl font-bold text-emerald-600">
            {data.metrics.closureRate}%
          </p>
          <p className="text-xs text-gray-600 mt-2">Won vs total</p>
        </div>

        {/* Average Deal Value */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Avg Deal Value</p>
          <p className="text-4xl font-bold text-purple-600">
            ${(data.metrics.averageDealValue / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">Per opportunity</p>
        </div>
      </div>

      {/* Pipeline Stages Kanban */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Deal Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stageOrder.map((stage) => {
            const stageDealCount = dealsByStage[stage]?.length || 0;
            const stageValue = dealsByStage[stage]?.reduce(
              (sum, deal) => sum + deal.value,
              0
            ) || 0;

            return (
              <div
                key={stage}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">{stageLabels[stage]}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(stage)}`}>
                    {stageDealCount}
                  </span>
                </div>

                <p className="text-2xl font-bold text-gray-900 mb-4">
                  ${(stageValue / 1000).toFixed(0)}k
                </p>

                <div className="space-y-2">
                  {dealsByStage[stage]?.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white rounded p-3 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                      <p className="text-xs text-gray-600 mt-1">${deal.value.toLocaleString()}</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${deal.probability}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {deal.probability}% probability
                      </p>
                    </div>
                  ))}
                  {stageDealCount === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No deals
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Contacts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {data.contacts.length} contacts in database
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Added
                </th>
              </tr>
            </thead>
            <tbody>
              {data.contacts.length > 0 ? (
                data.contacts.slice(0, 10).map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {contact.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contact.company}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          contact.status
                        )}`}
                      >
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No contacts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
