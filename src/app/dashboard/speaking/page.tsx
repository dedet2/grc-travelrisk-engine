'use client';

import { useState, useMemo, useEffect } from 'react';

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

function mapEventType(type: string): 'Keynote' | 'Panel' | 'Podcast' | 'Media Interview' | 'Conference' {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('keynote')) return 'Keynote';
  if (lowerType.includes('panel')) return 'Panel';
  if (lowerType.includes('podcast')) return 'Podcast';
  if (lowerType.includes('media') || lowerType.includes('interview')) return 'Media Interview';
  if (lowerType.includes('conference')) return 'Conference';
  return 'Conference';
}

function mapStatus(status: string): 'Confirmed' | 'Pending' | 'Proposed' {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('confirmed')) return 'Confirmed';
  if (lowerStatus.includes('pending')) return 'Pending';
  return 'Proposed';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Confirmed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'Pending':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Proposed':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    default:
      return 'bg-violet-100 text-violet-700 border-violet-300';
  }
}

function getStatusLabel(status: string): string {
  return status || 'Unknown';
}

export default function SpeakingPage() {
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [opportunities, setOpportunities] = useState<SpeakingOpportunity[]>(mockSpeakingData);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const typeOptions = [
    'All Types',
    'Keynote',
    'Panel',
    'Podcast',
    'Media Interview',
    'Conference',
  ];

  // Fetch speaking opportunities from API on mount
  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      setHasError(false);
      setIsEmpty(false);
      try {
        const response = await fetch('/api/speaking');
        if (!response.ok) {
          throw new Error('Failed to fetch speaking opportunities');
        }
        const data = await response.json();

        // Handle both direct array and wrapped response
        const opportunities = Array.isArray(data) ? data : data.data || [];

        if (opportunities.length === 0) {
          setIsEmpty(true);
          setOpportunities(mockSpeakingData);
        } else {
          // Transform API response to match our interface
          const transformed: SpeakingOpportunity[] = opportunities.map((opp: any) => ({
            id: opp.id,
            eventName: opp.eventName,
            type: mapEventType(opp.eventType || opp.type || 'Conference'),
            date: opp.date,
            audienceSize: opp.audienceSize || 0,
            fee: opp.fee || 0,
            status: mapStatus(opp.status || 'Proposed'),
          }));
          setOpportunities(transformed);
        }
      } catch (error) {
        console.error('Error fetching speaking opportunities:', error);
        setHasError(true);
        // Fall back to mock data on error
        setOpportunities(mockSpeakingData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const filteredOpportunities = useMemo(() => {
    if (selectedType === 'All Types') {
      return opportunities;
    }
    return opportunities.filter((opp) => opp.type === selectedType);
  }, [selectedType, opportunities]);

  const metrics: SpeakingMetrics = {
    totalOpportunities: opportunities.length,
    confirmedEvents: opportunities.filter((o) => o.status === 'Confirmed').length,
    totalRevenue: opportunities.reduce((sum, o) => sum + o.fee, 0),
    avgSpeakingFee:
      opportunities.length > 0 ? opportunities.reduce((sum, o) => sum + o.fee, 0) / opportunities.length : 0,
  };

  const upcomingConfirmed = filteredOpportunities
    .filter((o) => o.status === 'Confirmed')
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-violet-950">Speaking & Media Opportunities</h1>
        <p className="text-violet-600 mt-2">
          Build authority and generate revenue through speaking engagements
        </p>
        {isLoading && <p className="text-violet-500 text-sm mt-2">Loading opportunities...</p>}
        {hasError && <p className="text-cyan-500 text-sm mt-2">Note: Using fallback data. Check network connection.</p>}
        {isEmpty && <p className="text-fuchsia-500 text-sm mt-2">No opportunities found.</p>}
      </div>

      {/* Metric Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Opportunities */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Total Opportunities</p>
          <p className="text-4xl font-bold text-violet-600">{metrics.totalOpportunities}</p>
          <p className="text-xs text-violet-600 mt-2">Active engagements</p>
        </div>

        {/* Confirmed Events */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Confirmed Events</p>
          <p className="text-4xl font-bold text-emerald-600">{metrics.confirmedEvents}</p>
          <p className="text-xs text-violet-600 mt-2">Locked in schedule</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Total Revenue</p>
          <p className="text-4xl font-bold text-blue-600">
            ${(metrics.totalRevenue / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-violet-600 mt-2">All opportunities</p>
        </div>

        {/* Avg Speaking Fee */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Avg Speaking Fee</p>
          <p className="text-4xl font-bold text-purple-600">
            ${(metrics.avgSpeakingFee / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-violet-600 mt-2">Per engagement</p>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-violet-950 mb-4">Filter by Type</h2>
        <div className="flex flex-wrap gap-3">
          {typeOptions.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Speaking Opportunities List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-violet-200 p-6">
          <h2 className="text-xl font-bold text-violet-950">Speaking Opportunities</h2>
          <p className="text-sm text-violet-600 mt-1">
            {filteredOpportunities.length} opportunities found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-violet-50/30 border-b border-violet-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Event Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Audience Size
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-violet-950">
                  Fee
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.length > 0 ? (
                filteredOpportunities.map((opp) => (
                  <tr
                    key={opp.id}
                    className="border-b border-violet-200 hover:bg-violet-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-violet-950">
                      {opp.eventName}
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">{opp.type}</td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {new Date(opp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {opp.audienceSize.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-violet-950 text-right">
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
                  <td colSpan={6} className="px-6 py-12 text-center text-violet-500">
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
        <h2 className="text-lg font-bold text-violet-950 mb-6">Upcoming Confirmed Events</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
            <p className="text-violet-500 mt-2">Loading events...</p>
          </div>
        ) : isEmpty ? (
          <p className="text-violet-500 text-center py-8">No events available.</p>
        ) : (
          <div className="space-y-4">
            {upcomingConfirmed.length > 0 ? (
              upcomingConfirmed.map((event) => (
                <div
                  key={event.id}
                  className="border border-violet-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-violet-950">{event.eventName}</h3>
                      <p className="text-sm text-violet-600 mt-1">
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
              <p className="text-violet-500 text-center py-8">No confirmed events scheduled</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
