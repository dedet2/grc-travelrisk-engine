'use client';

import { useState, useMemo } from 'react';

interface Foundation {
  id: string;
  name: string;
  type: 'Foundation' | 'Nonprofit' | 'Think Tank';
  boardSeatsAvailable: number;
  annualBudget: number;
  relationshipStatus: 'Active' | 'Prospect' | 'Applied';
}

interface FoundationsMetrics {
  totalFoundations: number;
  boardOpportunities: number;
  activeRelationships: number;
}

const mockFoundationsData: Foundation[] = [
  {
    id: '1',
    name: 'Ford Foundation',
    type: 'Foundation',
    boardSeatsAvailable: 2,
    annualBudget: 600000000,
    relationshipStatus: 'Active',
  },
  {
    id: '2',
    name: 'Gates Foundation',
    type: 'Foundation',
    boardSeatsAvailable: 0,
    annualBudget: 7000000000,
    relationshipStatus: 'Prospect',
  },
  {
    id: '3',
    name: 'Rockefeller Foundation',
    type: 'Foundation',
    boardSeatsAvailable: 1,
    annualBudget: 400000000,
    relationshipStatus: 'Active',
  },
  {
    id: '4',
    name: 'Aspen Institute',
    type: 'Think Tank',
    boardSeatsAvailable: 3,
    annualBudget: 80000000,
    relationshipStatus: 'Applied',
  },
  {
    id: '5',
    name: 'Brookings Institution',
    type: 'Think Tank',
    boardSeatsAvailable: 1,
    annualBudget: 150000000,
    relationshipStatus: 'Active',
  },
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'Prospect':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Applied':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    default:
      return 'bg-violet-100 text-violet-700 border-violet-300';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'Foundation':
      return 'bg-purple-50 text-purple-700';
    case 'Think Tank':
      return 'bg-blue-50 text-blue-700';
    case 'Nonprofit':
      return 'bg-green-50 text-green-700';
    default:
      return 'bg-violet-50/30 text-violet-700';
  }
}

export default function FoundationsPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFoundations = useMemo(() => {
    if (!searchQuery.trim()) {
      return mockFoundationsData;
    }
    return mockFoundationsData.filter(
      (f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const metrics: FoundationsMetrics = {
    totalFoundations: mockFoundationsData.length,
    boardOpportunities: mockFoundationsData.reduce((sum, f) => sum + f.boardSeatsAvailable, 0),
    activeRelationships: mockFoundationsData.filter((f) => f.relationshipStatus === 'Active')
      .length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-violet-950">Foundation Network</h1>
        <p className="text-violet-600 mt-2">
          Board opportunities and philanthropic connections
        </p>
      </div>

      {/* Metric Cards - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Foundations */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Total Foundations</p>
          <p className="text-4xl font-bold text-violet-600">{metrics.totalFoundations}</p>
          <p className="text-xs text-violet-600 mt-2">In your network</p>
        </div>

        {/* Board Opportunities */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Board Opportunities</p>
          <p className="text-4xl font-bold text-blue-600">{metrics.boardOpportunities}</p>
          <p className="text-xs text-violet-600 mt-2">Seats available</p>
        </div>

        {/* Active Relationships */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Active Relationships</p>
          <p className="text-4xl font-bold text-emerald-600">{metrics.activeRelationships}</p>
          <p className="text-xs text-violet-600 mt-2">Engaged networks</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-violet-950 mb-4">Search Foundations & Contacts</h2>
        <input
          type="text"
          placeholder="Search by foundation name, type, or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
        />
      </div>

      {/* Foundations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-violet-200 p-6">
          <h2 className="text-xl font-bold text-violet-950">Foundation Network</h2>
          <p className="text-sm text-violet-600 mt-1">
            {filteredFoundations.length} foundations found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-violet-50/30 border-b border-violet-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Foundation Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Board Seats Available
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Annual Budget
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Relationship Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFoundations.length > 0 ? (
                filteredFoundations.map((foundation) => (
                  <tr
                    key={foundation.id}
                    className="border-b border-violet-200 hover:bg-violet-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-violet-950">
                      {foundation.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(foundation.type)}`}>
                        {foundation.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {foundation.boardSeatsAvailable}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-violet-950">
                      ${(foundation.annualBudget / 1000000).toFixed(0)}M
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(foundation.relationshipStatus)}`}>
                        {foundation.relationshipStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-violet-500">
                    No foundations found matching your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Relationships Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-violet-950 mb-6">Active Relationships</h2>
        <div className="space-y-4">
          {mockFoundationsData
            .filter((f) => f.relationshipStatus === 'Active')
            .map((foundation) => (
              <div
                key={foundation.id}
                className="border border-violet-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-violet-950">{foundation.name}</h3>
                    <p className="text-sm text-violet-600 mt-1">
                      {foundation.type} • ${(foundation.annualBudget / 1000000).toFixed(0)}M annual budget
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">
                      {foundation.boardSeatsAvailable} seat{foundation.boardSeatsAvailable !== 1 ? 's' : ''} available
                    </p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-300 mt-2 inline-block">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
