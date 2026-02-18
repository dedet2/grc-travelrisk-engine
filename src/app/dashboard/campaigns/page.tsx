'use client';

import { useState } from 'react';
const IconZap = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
const IconUsers = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IconTrendingUp = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const IconMegaphone = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>);

type CampaignType = 'Email' | 'LinkedIn' | 'Content' | 'Events';
type CampaignStatus = 'Active' | 'Paused' | 'Completed';

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  reach: number;
  responses: number;
  conversionRate: number;
  startDate: string;
}

const CampaignsDashboard = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | CampaignType>('All');

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'AI GRC Decision Makers Email',
      type: 'Email',
      status: 'Active',
      reach: 2500,
      responses: 180,
      conversionRate: 7.2,
      startDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'LinkedIn CISO Outreach',
      type: 'LinkedIn',
      status: 'Active',
      reach: 3200,
      responses: 285,
      conversionRate: 8.9,
      startDate: '2024-01-08',
    },
    {
      id: '3',
      name: 'Thought Leadership Content',
      type: 'Content',
      status: 'Active',
      reach: 5600,
      responses: 420,
      conversionRate: 7.5,
      startDate: '2023-12-20',
    },
    {
      id: '4',
      name: 'Conference Follow-up',
      type: 'Events',
      status: 'Paused',
      reach: 450,
      responses: 65,
      conversionRate: 14.4,
      startDate: '2024-01-10',
    },
    {
      id: '5',
      name: 'Board Director Networking',
      type: 'LinkedIn',
      status: 'Completed',
      reach: 1200,
      responses: 156,
      conversionRate: 13.0,
      startDate: '2023-11-01',
    },
  ];

  const activeCampaigns = campaigns.filter((c) => c.status === 'Active').length;
  const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);
  const totalResponses = campaigns.reduce((sum, c) => sum + c.responses, 0);
  const avgResponseRate = (totalResponses / totalReach * 100).toFixed(1);
  const meetingsBooked = Math.round(totalResponses * 0.35);

  const filteredCampaigns =
    activeFilter === 'All' ? campaigns : campaigns.filter((c) => c.type === activeFilter);

  const typeColors: Record<CampaignType, string> = {
    'Email': 'bg-blue-100 text-blue-800',
    'LinkedIn': 'bg-cyan-100 text-cyan-800',
    'Content': 'bg-purple-100 text-purple-800',
    'Events': 'bg-amber-100 text-amber-800',
  };

  const statusColors: Record<CampaignStatus, string> = {
    'Active': 'bg-emerald-100 text-emerald-800',
    'Paused': 'bg-amber-100 text-amber-800',
    'Completed': 'bg-violet-100 text-violet-800',
  };

  const statusDot: Record<CampaignStatus, string> = {
    'Active': 'bg-emerald-500',
    'Paused': 'bg-amber-500',
    'Completed': 'bg-violet-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-violet-900 to-violet-950 p-6 text-violet-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Campaigns
        </h1>
        <p className="text-violet-300">Automated outreach and marketing campaigns</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Active Campaigns */}
        <div className="bg-violet-800/50 border border-violet-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-cyan-400/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-violet-300">Active Campaigns</h3>
            <span className="text-cyan-400"><IconZap /></span>
          </div>
          <div className="text-3xl font-bold text-white">{activeCampaigns}</div>
          <p className="text-xs text-violet-300 mt-3">Currently running</p>
        </div>

        {/* Total Reach */}
        <div className="bg-violet-800/50 border border-violet-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-violet-300">Total Reach</h3>
            <span className="text-blue-400"><IconUsers /></span>
          </div>
          <div className="text-3xl font-bold text-white">{(totalReach / 1000).toFixed(1)}K</div>
          <p className="text-xs text-violet-300 mt-3">Total impressions</p>
        </div>

        {/* Response Rate */}
        <div className="bg-violet-800/50 border border-violet-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-violet-300">Response Rate</h3>
            <span className="text-purple-400"><IconTrendingUp /></span>
          </div>
          <div className="text-3xl font-bold text-white">{avgResponseRate}%</div>
          <p className="text-xs text-violet-300 mt-3">Average across all</p>
        </div>

        {/* Meetings Booked */}
        <div className="bg-violet-800/50 border border-violet-700/50 rounded-lg p-6 backdrop-blur-sm hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-violet-300">Meetings Booked</h3>
            <span className="text-amber-400"><IconMegaphone /></span>
          </div>
          <div className="text-3xl font-bold text-white">{meetingsBooked}</div>
          <p className="text-xs text-violet-300 mt-3">From campaign responses</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Email', 'LinkedIn', 'Content', 'Events'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                : 'bg-violet-800/50 border border-violet-700/50 text-violet-200 hover:border-violet-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Create Campaign Button */}
      <div className="mb-6">
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-white flex items-center gap-2">
          <span>+</span>
          Create Campaign
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-violet-800/50 border border-violet-700/50 rounded-lg backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-violet-700/50 bg-violet-700/20">
                <th className="text-left py-4 px-6 text-xs font-semibold text-violet-300">Name</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-violet-300">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-violet-300">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-violet-300">Reach</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-violet-300">Responses</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-violet-300">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign, idx) => (
                <tr
                  key={campaign.id}
                  className={`border-b border-violet-700/30 hover:bg-violet-700/20 transition-colors ${
                    idx % 2 === 0 ? 'bg-violet-800/20' : ''
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-white">{campaign.name}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${typeColors[campaign.type]}`}>
                      {campaign.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusDot[campaign.status]}`}></div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-violet-200">{campaign.reach.toLocaleString()}</td>
                  <td className="py-4 px-6 text-cyan-400 font-semibold">{campaign.responses}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-violet-700/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full"
                          style={{ width: `${Math.min(campaign.conversionRate * 10, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-violet-200 text-xs font-medium">{campaign.conversionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Details Cards (Optional Overview) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-6">Campaign Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.slice(0, 3).map((campaign) => {
            const engagementRate = ((campaign.responses / campaign.reach) * 100).toFixed(1);
            return (
              <div
                key={campaign.id}
                className="bg-violet-800/50 border border-violet-700/50 rounded-lg p-5 backdrop-blur-sm hover:border-cyan-400/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-white text-sm">{campaign.name}</h3>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColors[campaign.status]}`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-violet-300">Reach</span>
                    <span className="text-white font-medium">{campaign.reach.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-violet-300">Engagement</span>
                    <span className="text-cyan-400 font-medium">{engagementRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-violet-300">Conversion</span>
                    <span className="text-blue-400 font-medium">{campaign.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CampaignsDashboard;
