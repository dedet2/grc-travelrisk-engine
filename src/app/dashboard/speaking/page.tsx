'use client';

import { useState, useMemo } from 'react';

interface SpeakingOpportunity {
  id: string;
  eventName: string;
  type: 'Keynote' | 'Panel' | 'Podcast' | 'Media Interview' | 'Conference';
  date: string;
  audienceSize: number;
  fee: number;
  status: 'Confirmed' | 'Pending' | 'Proposed';
}

interface SpeakingMetrics {
  totalOpportunities: number;
  confirmedEvents: number;
  totalRevenue: number;
  avgSpeakingFee: number;
}

const mockSpeakingData: SpeakingOpportunity[] = [
  {
    id: '1',
    eventName: 'AI Governance Summit',
    type: 'Keynote',
    date: '2024-04-15',
    audienceSize: 2500,
    fee: 15000,
    status: 'Confirmed',
  },
  {
    id: '2',
    eventName: 'TechCrunch Disrupt Panel',
    type: 'Panel',
    date: '2024-05-20',
    audienceSize: 3000,
    fee: 5000,
    status: 'Confirmed',
  },
  {
    id: '3',
    eventName: 'AI Policy Podcast',
    type: 'Podcast',
    date: '2024-06-10',
    audienceSize: 150000,
    fee: 2000,
    status: 'Pending',
  },
  {
    id: '4',
    eventName: 'CNBC Morning Interview',
    type: 'Media Interview',
    date: '2024-07-05',
    audienceSize: 2000000,
    fee: 0,
    status: 'Proposed',
  },
  {
    id: '5',
    eventName: 'BoardReady Annual Conference',
    type: 'Conference',
    date: '2024-08-22',
    audienceSize: 800,
    fee: 8000,
    status: 'Confirmed',
  },
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'Confirmed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'Pending':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Proposed':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}

function getStatusLabel(status: string): string {
  return status || 'Unknown';
}

export default function SpeakingPage() {
  const [selectedType, setSelectedType] = useState<string>('All Types');

  const typeOptions = [
    'All Types',
    'Keynote',
    'Panel',
    'Podcast',
    'Media Interview',
    'Conference',
  ];

  const filteredOpportunities = useMemo(() => {
    if (selectedType === 'All Types') {
      return mockSpeakingData;
    }
    return mockSpeakingData.filter((opp) => opp.type === selectedType);
  }, [selectedType]);

  const metrics: SpeakingMetrics = {
    totalOpportunities: mockSpeakingData.length,
    confirmedEvents: mockSpeakingData.filter((o) => o.status === 'Confirmed').length,
    totalRevenue: mockSpeakingData.reduce((sum, o) => sum + o.fee, 0),
    avgSpeakingFee:
      mockSpeakingData.reduce((sum, o) => sum + o.fee, 0) / mockSpeakingData.length,
  };

  const upcomingConfirmed = filteredOpportunities
    .filter((o) => o.status === 'Confirmed')
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Speaking & Media Opportunities</h1>
        <p className="text-gray-600 mt-2">
          Build authority and generate revenue through speaking engagements
        </p>
      </div>

      {/* Metric Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Opportunities */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Opportunities</p>
          <p className="text-4xl font-bold text-indigo-600">{metrics.totalOpportunities}</p>
          <p className="text-xs text-gray-600 mt-2">Active engagements</p>
        </div>

        {/* Confirmed Events */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Confirmed Events</p>
          <p className="text-4xl font-bold text-emerald-600">{metrics.confirmedEvents}</p>
          <p className="text-xs text-gray-600 mt-2">Locked in schedule</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
          <p className="text-4xl font-bold text-blue-600">
            ${(metrics.totalRevenue / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">All opportunities</p>
        </div>

        {/* Avg Speaking Fee */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 mb-1">Avg Speaking Fee</p>
          <p className="text-4xl font-bold text-purple-600">
            ${(metrics.avgSpeakingFee / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-600 mt-2">Per engagement</p>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Filter by Type</h2>
        <div className="flex flex-wrap gap-3">
          {typeOptions.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Speaking Opportunities List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Speaking Opportunities</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredOpportunities.length} opportunities found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Event Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Audience Size
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                  Fee
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.length > 0 ? (
                filteredOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {opp.eventName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{opp.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(opp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {opp.audienceSize.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      ${opp.fee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          opp.status
                        )}`}
                      >
                        {getStatusLabel(opp.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No opportunities found for this type
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Confirmed Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Upcoming Confirmed Events</h2>
        <div className="space-y-4">
          {upcomingConfirmed.length > 0 ? (
            upcomingConfirmed.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{event.eventName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.type} • {new Date(event.date).toLocaleDateString()} •{' '}
                      {event.audienceSize.toLocaleString()} attendees
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      ${event.fee.toLocaleString()}
                    </p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-300 mt-2 inline-block">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No confirmed events scheduled</p>
          )}
        </div>
      </div>
    </div>
  );
}
