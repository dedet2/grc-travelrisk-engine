'use client';

import { useState, useEffect } from 'react';

interface FrameworkCategory {
  id: string;
  name: string;
  description?: string;
  controlCount: number;
}

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  controlCount: number;
  status: 'draft' | 'published' | 'archived';
  categories: FrameworkCategory[];
  createdAt: string;
  updatedAt: string;
}

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFrameworks();
  }, []);

  async function fetchFrameworks() {
    try {
      setLoading(true);
      const response = await fetch('/api/frameworks');
      if (!response.ok) throw new Error('Failed to fetch frameworks');
      const result = await response.json();
      setFrameworks(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error('Error fetching frameworks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load frameworks');
    } finally {
      setLoading(false);
    }
  }

  async function seedISO27001() {
    try {
      setSeeding(true);
      const response = await fetch('/api/frameworks/seed', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to seed framework');
      // Refresh the list
      await fetchFrameworks();
    } catch (err) {
      console.error('Error seeding framework:', err);
      setError(err instanceof Error ? err.message : 'Failed to seed framework');
    } finally {
      setSeeding(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-100 text-emerald-700';
      case 'draft':
        return 'bg-amber-100 text-amber-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">GRC Frameworks</h1>
          <p className="text-gray-600 mt-2">Manage security and compliance frameworks</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Seed Button */}
      {frameworks.length === 0 && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">Get Started</h2>
          <p className="text-blue-700 mb-4">
            No frameworks loaded yet. Seed the database with ISO 27001:2022 to get started.
          </p>
          <button
            onClick={seedISO27001}
            disabled={seeding}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {seeding ? 'Seeding...' : '+ Seed ISO 27001:2022'}
          </button>
        </div>
      )}

      {/* Frameworks List */}
      {frameworks.length > 0 && (
        <div className="space-y-4">
          {frameworks.map((framework) => (
            <div key={framework.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Main Framework Card */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === framework.id ? null : framework.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-gray-900">{framework.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(framework.status)}`}>
                        {framework.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm">
                      <span className="text-gray-600">
                        <span className="font-bold text-gray-900">{framework.controlCount}</span> controls
                      </span>
                      <span className="text-gray-600">
                        v<span className="font-bold text-gray-900">{framework.version}</span>
                      </span>
                      <span className="text-gray-500">
                        Created {new Date(framework.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-block text-2xl transition-transform ${expandedId === framework.id ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Categories */}
              {expandedId === framework.id && framework.categories.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {framework.categories.map((category) => (
                      <div key={category.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="font-medium text-gray-900 text-sm">{category.name}</h5>
                        <p className="text-xs text-gray-600 mt-1">{category.description || 'No description'}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          <span className="font-bold text-gray-700">{category.controlCount}</span> controls
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Categories Message */}
              {expandedId === framework.id && framework.categories.length === 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
                  <p>No categories defined for this framework</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {frameworks.length === 0 && !error && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">No frameworks</h2>
          <p className="text-gray-600 mb-6">Import a framework or use the seed button above to get started</p>
          <div className="space-x-3">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              + Import Framework
            </button>
            <button
              onClick={seedISO27001}
              disabled={seeding}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {seeding ? 'Seeding...' : '+ Seed ISO 27001'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {frameworks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
            <p className="text-sm text-gray-600 mb-1">Total Frameworks</p>
            <p className="text-3xl font-bold text-indigo-600">{frameworks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
            <p className="text-sm text-gray-600 mb-1">Total Controls</p>
            <p className="text-3xl font-bold text-emerald-600">
              {frameworks.reduce((sum, f) => sum + f.controlCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-sm text-gray-600 mb-1">Total Categories</p>
            <p className="text-3xl font-bold text-blue-600">
              {frameworks.reduce((sum, f) => sum + f.categories.length, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
