'use client';

import { useState, useEffect } from 'react';

interface TravelDestination {
  countryName: string;
  countryCode: string;
  advisoryLevel: 1 | 2 | 3 | 4;
  riskScore?: number;
  threatAssessment?: string;
  lastUpdated?: string;
}

function getAdvisoryColor(level: number): string {
  switch (level) {
    case 1:
      return 'bg-green-100 text-green-900 border-green-300';
    case 2:
      return 'bg-yellow-100 text-yellow-900 border-yellow-300';
    case 3:
      return 'bg-orange-100 text-orange-900 border-orange-300';
    case 4:
      return 'bg-red-100 text-red-900 border-red-300';
    default:
      return 'bg-gray-100 text-gray-900 border-gray-300';
  }
}

function getAdvisoryLabel(level: number): string {
  switch (level) {
    case 1:
      return 'Exercise Normal Precautions';
    case 2:
      return 'Exercise Increased Caution';
    case 3:
      return 'Reconsider Travel';
    case 4:
      return 'Do Not Travel';
    default:
      return 'Unknown';
  }
}

function getRiskBadge(level: number): string {
  switch (level) {
    case 1:
      return 'LOW';
    case 2:
      return 'MODERATE';
    case 3:
      return 'HIGH';
    case 4:
      return 'CRITICAL';
    default:
      return 'UNKNOWN';
  }
}

export default function TravelRiskPage() {
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<TravelDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const response = await fetch('/api/travel/destinations');
        if (!response.ok) throw new Error('Failed to fetch destinations');
        const result = await response.json();

        // Extract data from the API response
        const dests = Array.isArray(result.data) ? result.data : result.data?.destinations || [];
        setDestinations(dests);
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError(err instanceof Error ? err.message : 'Failed to load destinations');
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, []);

  // Filter destinations based on search and level
  useEffect(() => {
    let filtered = destinations;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (dest) =>
          dest.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply level filter
    if (selectedLevel !== null) {
      filtered = filtered.filter((dest) => dest.advisoryLevel === selectedLevel);
    }

    setFilteredDestinations(filtered);
  }, [destinations, searchTerm, selectedLevel]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load destinations</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Travel Risk Assessment</h1>
        <p className="text-gray-600 mt-2">Monitor travel advisories for {destinations.length} destinations</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search destinations
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by country name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Filter by advisory level</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLevel(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${getAdvisoryColor(level)} ${
                  selectedLevel === level ? 'ring-2 ring-offset-2 ring-indigo-600' : ''
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredDestinations.length} of {destinations.length} destinations
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.countryCode}
              className={`rounded-lg shadow overflow-hidden transition-all cursor-pointer hover:shadow-lg ${getAdvisoryColor(dest.advisoryLevel)} border`}
              onClick={() =>
                setExpandedCountry(expandedCountry === dest.countryCode ? null : dest.countryCode)
              }
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{dest.countryName}</h3>
                    <p className="text-sm opacity-75">{dest.countryCode}</p>
                  </div>
                  <div className="text-4xl">🌍</div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs opacity-75 mb-1">Advisory Level</p>
                    <span className="inline-block px-3 py-1 bg-black bg-opacity-20 rounded-full text-sm font-bold">
                      {getAdvisoryLabel(dest.advisoryLevel)}
                    </span>
                  </div>

                  {dest.riskScore !== undefined && (
                    <div>
                      <p className="text-xs opacity-75 mb-1">Risk Score</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-black bg-opacity-20 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              dest.advisoryLevel === 4
                                ? 'bg-red-600'
                                : dest.advisoryLevel === 3
                                  ? 'bg-orange-600'
                                  : dest.advisoryLevel === 2
                                    ? 'bg-yellow-600'
                                    : 'bg-green-600'
                            }`}
                            style={{ width: `${(dest.riskScore / 100) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">{dest.riskScore}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs opacity-75">
                      {dest.lastUpdated ? `Updated ${new Date(dest.lastUpdated).toLocaleDateString()}` : 'Status information available'}
                    </p>
                  </div>
                </div>

                {/* Expandable Details */}
                {expandedCountry === dest.countryCode && (
                  <div className="mt-4 pt-4 border-t border-black border-opacity-20 space-y-3">
                    <div>
                      <p className="text-xs font-bold mb-2 opacity-75">Threat Assessment</p>
                      <p className="text-sm">
                        {dest.threatAssessment ||
                          `Level ${dest.advisoryLevel} advisory: ${getAdvisoryLabel(dest.advisoryLevel)}`}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="opacity-75">Travel Restrictions</p>
                        <p className="font-medium">
                          {dest.advisoryLevel === 4 ? 'Not Recommended' : 'Check Requirements'}
                        </p>
                      </div>
                      <div>
                        <p className="opacity-75">Insurance Required</p>
                        <p className="font-medium">{dest.advisoryLevel >= 3 ? 'Yes' : 'Optional'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">No destinations match your search criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLevel(null);
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Advisory Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Travel Advisory Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className={`p-4 rounded-lg border ${getAdvisoryColor(level)}`}>
              <p className="font-bold mb-1">Level {level}</p>
              <p className="text-sm">{getAdvisoryLabel(level)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
