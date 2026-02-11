'use client';

import { useState } from 'react';
const IconUsers = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IconTrendingUp = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const IconTarget = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>);
const IconZap = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);

type PipelineStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won';

interface Lead {
  id: string;
  company: string;
  contact: string;
  value: number;
  source: 'LinkedIn' | 'Referral' | 'Inbound' | 'Conference';
  stage: PipelineStage;
  daysInStage: number;
}

const LeadPipelineDashboard = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  const leads: Lead[] = [
    {
      id: '1',
      company: 'SecureNet Corp',
      contact: 'James Mitchell',
      value: 150000,
      source: 'LinkedIn',
      stage: 'Proposal',
      daysInStage: 12,
    },
    {
      id: '2',
      company: 'Risk Dynamics LLC',
      contact: 'Patricia Anderson',
      value: 200000,
      source: 'Referral',
      stage: 'Negotiation',
      daysInStage: 8,
    },
    {
      id: '3',
      company: 'CloudGuard Systems',
      contact: 'Robert Zhang',
      value: 120000,
      source: 'Inbound',
      stage: 'Qualified',
      daysInStage: 5,
    },
    {
      id: '4',
      company: 'Enterprise Risk Solutions',
      contact: 'Lisa Chen',
      value: 180000,
      source: 'Conference',
      stage: 'Contacted',
      daysInStage: 3,
    },
    {
      id: '5',
      company: 'Nexus Technologies',
      contact: 'Marcus Brown',
      value: 95000,
      source: 'LinkedIn',
      stage: 'New',
      daysInStage: 1,
    },
    {
      id: '6',
      company: 'Global Compliance Corp',
      contact: 'Angela White',
      value: 250000,
      source: 'Referral',
      stage: 'Closed Won',
      daysInStage: 45,
    },
    {
      id: '7',
      company: 'DataSecure International',
      contact: 'Kevin Moore',
      value: 130000,
      source: 'Inbound',
      stage: 'Proposal',
      daysInStage: 18,
    },
    {
      id: '8',
      company: 'Governance Leaders LLC',
      contact: 'Rachel Thompson',
      value: 175000,
      source: 'Conference',
      stage: 'Qualified',
      daysInStage: 7,
    },
  ];

  const stages: PipelineStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => ['Qualified', 'Proposal', 'Negotiation', 'Closed Won'].includes(l.stage)).length;
  const conversionRate = ((leads.filter((l) => l.stage === 'Closed Won').length / totalLeads) * 100).toFixed(1);
  const pipelineValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  const sourceColors: Record<Lead['source'], string> = {
    LinkedIn: 'bg-blue-100 text-blue-800',
    Referral: 'bg-purple-100 text-purple-800',
    Inbound: 'bg-emerald-100 text-emerald-800',
    Conference: 'bg-amber-100 text-amber-800',
  };

  const stageColors: Record<PipelineStage, string> = {
    'New': 'bg-slate-700/30 border-slate-600/30',
    'Contacted': 'bg-blue-700/20 border-blue-600/30',
    'Qualified': 'bg-purple-700/20 border-purple-600/30',
    'Proposal': 'bg-amber-700/20 border-amber-600/30',
    'Negotiation': 'bg-pink-700/20 border-pink-600/30',
    'Closed Won': 'bg-emerald-700/20 border-emerald-600/30',
  };

  const getLeadsByStage = (stage: PipelineStage) => leads.filter((l) => l.stage === stage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Lead Pipeline
        </h1>
        <p className="text-slate-400">Manage and track your sales pipeline</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Leads */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Total Leads</h3>
            <span className="text-cyan-400"><IconUsers /></span>
          </div>
          <div className="text-3xl font-bold text-white">{totalLeads}</div>
          <p className="text-xs text-slate-400 mt-3">In pipeline</p>
        </div>

        {/* Qualified Leads */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Qualified Leads</h3>
            <span className="text-blue-400"><IconTrendingUp /></span>
          </div>
          <div className="text-3xl font-bold text-white">{qualifiedLeads}</div>
          <p className="text-xs text-slate-400 mt-3">Ready to advance</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Conversion Rate</h3>
            <span className="text-purple-400"><IconTarget /></span>
          </div>
          <div className="text-3xl font-bold text-white">{conversionRate}%</div>
          <p className="text-xs text-slate-400 mt-3">Win rate</p>
        </div>

        {/* Pipeline Value */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400">Pipeline Value</h3>
            <span className="text-amber-400"><IconZap /></span>
          </div>
          <div className="text-3xl font-bold text-white">${(pipelineValue / 1000).toFixed(0)}K</div>
          <p className="text-xs text-slate-400 mt-3">Total opportunity</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div key={stage} className="flex flex-col">
              <h3 className="font-semibold text-white mb-3 text-sm">{stage}</h3>
              <div className="space-y-3 flex-1">
                {getLeadsByStage(stage).map((lead) => (
                  <div
                    key={lead.id}
                    className={`rounded-lg p-4 border ${stageColors[stage]} hover:border-cyan-500/50 transition-all cursor-pointer group`}
                  >
                    <p className="font-medium text-white text-sm mb-1 group-hover:text-cyan-400">{lead.company}</p>
                    <p className="text-xs text-slate-400 mb-2">{lead.contact}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-400 font-semibold text-xs">${(lead.value / 1000).toFixed(0)}K</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${sourceColors[lead.source]}`}>
                        {lead.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{lead.daysInStage}d in stage</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-700/20">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Company</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Contact</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Value</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Source</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Stage</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-400">Days in Stage</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${
                      idx % 2 === 0 ? 'bg-slate-800/20' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-medium text-white">{lead.company}</td>
                    <td className="py-4 px-6 text-slate-300">{lead.contact}</td>
                    <td className="py-4 px-6 text-cyan-400 font-semibold">${(lead.value / 1000).toFixed(0)}K</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${sourceColors[lead.source]}`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {lead.stage}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{lead.daysInStage}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadPipelineDashboard;
