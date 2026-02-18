'use client';

import { useState, useEffect } from 'react';

interface Destination {
  code: string;
  name: string;
  emoji: string;
  riskLevel: 1 | 2 | 3 | 4;
  healthAdvisory: string;
  securityScore: number;
  lastUpdated: string;
}

interface TravelRiskData {
  stats: {
    countriesMonitored: number;
    activeAdvisories: number;
    highRiskZones: number;
    travelerAlerts: number;
  };
  destinations: Destination[];
}

function getRiskLevelColor(level: 1 | 2 | 3 | 4): { bg: string; text: string; label: string } {
  switch (level) {
    case 1:
      return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Level 1: Exercise Normal' };
    case 2:
      return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', label: 'Level 2: Exercise Caution' };
    case 3:
      return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'Level 3: Reconsider Travel' };
    case 4:
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Level 4: Do Not Travel' };
  }
}

function getSecurityScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

const mockData: TravelRiskData = {
  stats: {
    countriesMonitored: 195,
    activeAdvisories: 34,
    highRiskZones: 12,
    travelerAlerts: 8,
  },
  destinations: [
    {
      code: 'JP',
      name: 'Japan',
      emoji: '🇯🇵',
      riskLevel: 1,
      healthAdvisory: 'Standard precautions',
      securityScore: 92,
      lastUpdated: '2 hours ago',
    },
    {
      code: 'GB',
      name: 'United Kingdom',
      emoji: '🇬🇧',
      riskLevel: 1,
      healthAdvisory: 'Standard precautions',
      securityScore: 89,
      lastUpdated: '3 hours ago',
    },
    {
      code: 'MX',
      name: 'Mexico',
      emoji: '🇲🇽',
      riskLevel: 2,
      healthAdvisory: 'Exercise increased caution',
      securityScore: 68,
      lastUpdated: '1 hour ago',
    },
    {
      code: 'TR',
      name: 'Turkey',
      emoji: '🇹🇷',
      riskLevel: 2,
      healthAdvisory: 'Exercise increased caution',
      securityScore: 62,
      lastUpdated: '30 minutes ago',
    },
    {
      code: 'UA',
      name: 'Ukraine',
      emoji: '🇺🇦',
      riskLevel: 4,
      healthAdvisory: 'Avoid all travel',
      securityScore: 15,
      lastUpdated: 'Now',
    },
  ],
};

export default function TravelRiskPage() {
  const [data, setData] = useState<TravelRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    destination: '',
    departureDate: '',
    returnDate: '',
    purpose: 'business',
  });

  const fetchTravelRiskData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/risk-scoring');
      if (response.ok) {
        const result = await response.json();
        const apiData = result.data || result;
        if (apiData) {
          setData(apiData);
          setLastUpdated(new Date());
        } else {
          setData(mockData);
        }
      } else {
        setData(mockData);
      }
    } catch (err) {
      console.error('Error fetching travel risk data:', err);
      setError('Failed to load travel risk data');
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelRiskData();
    const interval = setInterval(fetchTravelRiskData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/travel-risk/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Assessment created successfully');
        setFormData({ destination: '', departureDate: '', returnDate: '', purpose: 'business' });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error creating assessment:', err);
    }
  };

  const filteredDestinations = data?.destinations.filter((dest) =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-violet-200 dark:bg-violet-700 rounded animate-pulse w-1/3" />
        <div className="h-64 bg-violet-200 dark:bg-violet-700 rounded animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">Failed to load travel risk data</h2>
        <p className="text-red-700 dark:text-red-300">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-violet-950 dark:text-violet-50">Travel Risk Assessment</h1>
          <p className="text-violet-600 dark:text-violet-300 mt-2">
            Real-time global travel advisories and risk assessment for 195 destinations
          </p>
          {lastUpdated && (
            <p className="text-xs text-violet-500 dark:text-violet-300 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchTravelRiskData}
            disabled={loading}
            className="px-4 py-2 bg-violet-200 dark:bg-violet-700 text-violet-950 dark:text-violet-50 rounded-lg hover:bg-violet-300 dark:hover:bg-violet-600 font-medium transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-violet-600 dark:bg-violet-700 text-white rounded-lg hover:bg-violet-700 dark:hover:bg-violet-800 font-medium transition-colors"
          >
            + Create Trip Assessment
          </button>
        </div>
      </div>

      {/* Risk Level Legend */}
      <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-violet-950 dark:text-violet-50 mb-4">Risk Level Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700">
            <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">Level 1: Exercise Normal</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Safe for general travel</p>
          </div>
          <div className="p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700">
            <p className="font-bold text-amber-700 dark:text-amber-300 text-sm">Level 2: Exercise Caution</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Some security concerns</p>
          </div>
          <div className="p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
            <p className="font-bold text-orange-700 dark:text-orange-300 text-sm">Level 3: Reconsider Travel</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Significant risks present</p>
          </div>
          <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
            <p className="font-bold text-red-700 dark:text-red-300 text-sm">Level 4: Do Not Travel</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Extreme danger</p>
          </div>
        </div>
      </div>

      {/* Hero Section with World Map Placeholder */}
      <div className="relative overflow-hidden rounded-lg shadow-lg h-64 bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 dark:from-violet-900 dark:via-purple-900 dark:to-pink-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-white text-2xl font-bold">Global Travel Risk Intelligence</h3>
            <p className="text-violet-100 mt-2">Monitor real-time advisories and safety scores</p>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -tranviolet-x-1/2 -tranviolet-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full tranviolet-x-1/2 tranviolet-y-1/2" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-300 mb-1">Countries Monitored</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{data.stats.countriesMonitored}</p>
          <p className="text-xs text-violet-600 dark:text-violet-300 mt-2">Worldwide coverage</p>
        </div>

        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6 border-l-4 border-amber-600">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-300 mb-1">Active Advisories</p>
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{data.stats.activeAdvisories}</p>
          <p className="text-xs text-violet-600 dark:text-violet-300 mt-2">Current advisories</p>
        </div>

        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6 border-l-4 border-orange-600">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-300 mb-1">High-Risk Zones</p>
          <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{data.stats.highRiskZones}</p>
          <p className="text-xs text-violet-600 dark:text-violet-300 mt-2">Level 3 & 4 areas</p>
        </div>

        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6 border-l-4 border-red-600">
          <p className="text-sm font-medium text-violet-600 dark:text-violet-300 mb-1">Traveler Alerts</p>
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">{data.stats.travelerAlerts}</p>
          <p className="text-xs text-violet-600 dark:text-violet-300 mt-2">Unresolved alerts</p>
        </div>
      </div>

      {/* Trip Assessment Form Modal */}
      {showForm && (
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6 border border-violet-200 dark:border-violet-700">
          <h2 className="text-xl font-bold text-violet-950 dark:text-violet-50 mb-4">Create New Trip Assessment</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">
                  Destination
                </label>
                <select
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50"
                  required
                >
                  <option value="">Select destination...</option>
                  {data.destinations.map((dest) => (
                    <option key={dest.code} value={dest.code}>
                      {dest.name} ({dest.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">
                  Purpose
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50"
                >
                  <option value="business">Business</option>
                  <option value="leisure">Leisure</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-violet-200 dark:border-violet-700">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-violet-200 dark:bg-violet-700 text-violet-950 dark:text-violet-50 rounded-lg hover:bg-violet-300 dark:hover:bg-violet-600 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-violet-600 dark:bg-violet-700 text-white rounded-lg hover:bg-violet-700 dark:hover:bg-violet-800 font-medium transition-colors"
              >
                Create Assessment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search destinations by name or country code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-800 text-violet-950 dark:text-violet-50 placeholder-violet-500 dark:placeholder-violet-400"
          />
        </div>
      </div>

      {/* Destination Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-violet-950 dark:text-violet-50">Sample Destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((dest) => {
              const riskColor = getRiskLevelColor(dest.riskLevel);
              const scoreColor = getSecurityScoreColor(dest.securityScore);
              return (
                <div
                  key={dest.code}
                  className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6 border border-violet-200 dark:border-violet-700 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-violet-700/50 transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{dest.emoji}</span>
                      <div>
                        <h3 className="font-bold text-violet-950 dark:text-violet-50">{dest.name}</h3>
                        <p className="text-xs text-violet-500 dark:text-violet-300">{dest.code}</p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Level Badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${riskColor.bg} ${riskColor.text}`}>
                    {riskColor.label}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-violet-200 dark:border-violet-700 my-4" />

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-violet-600 dark:text-violet-300">Health Advisory</p>
                      <p className="text-violet-950 dark:text-violet-50 font-medium">{dest.healthAdvisory}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-violet-600 dark:text-violet-300">Security Score</p>
                      <p className={`font-bold ${scoreColor}`}>{dest.securityScore}/100</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-violet-600 dark:text-violet-300">Last Updated</p>
                      <p className="text-violet-950 dark:text-violet-50 font-medium">{dest.lastUpdated}</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full mt-4 px-3 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 font-medium text-sm transition-colors">
                    View Full Assessment
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-violet-500 dark:text-violet-300 col-span-full text-center py-8">
              No destinations match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
