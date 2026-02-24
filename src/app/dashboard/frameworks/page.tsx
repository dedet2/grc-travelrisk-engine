'use client';

import { useState, useEffect } from 'react';

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  controlCount: number;
  status: 'draft' | 'published' | 'archived';
  categories: any[];
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
      setError(null);

      const response = await fetch('/api/frameworks?status=all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch frameworks`);
      }

      const result = await response.json();

      if (!Array.isArray(result.data)) {
        throw new Error('Invalid response format: expected array of frameworks');
      }

      setFrameworks(result.data);
    } catch (err) {
      console.error('Error fetching frameworks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load frameworks';
      setError(errorMessage);
      setFrameworks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedFrameworks() {
    try {
      setSeeding(true);
      setError(null);

      const response = await fetch('/api/frameworks/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to seed frameworks`);
      }

      // Refresh the list
      await fetchFrameworks();
    } catch (err) {
      console.error('Error seeding frameworks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to seed frameworks';
      setError(errorMessage);
    } finally {
      setSeeding(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
      case 'draft':
        return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
      case 'archived':
        return 'bg-red-500/20 text-red-400 border border-red-500/40';
      default:
        return 'bg-violet-500/20 text-violet-400 border border-violet-500/40';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-400';
      case 'draft':
        return 'bg-amber-400';
      case 'archived':
        return 'bg-red-400';
      default:
        return 'bg-violet-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <div className="h-10 bg-gradient-to-r from-violet-600/30 to-cyan-500/30 rounded-lg animate-pulse w-2/3" />
          <div className="h-4 bg-violet-600/20 rounded animate-pulse w-1/2 mt-3" />
        </div>
        {/* Cards skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-violet-500/20 rounded-lg p-6 h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
            GRC Frameworks
          </h1>
          <p className="text-cyan-400/70 mt-2">
            Manage security and compliance frameworks across your organization
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/30 border border-red-500/40 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Seed Prompt - Empty State */}
      {frameworks.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-violet-950/40 via-violet-900/20 to-cyan-950/30 border border-violet-500/30 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-violet-200 mb-2">No Frameworks Yet</h2>
            <p className="text-cyan-400/70 mb-6">
              Get started by seeding the database with industry-standard compliance frameworks including ISO 27001:2022,
              NIST CSF 2.0, and SOC 2 Type II.
            </p>
            <button
              onClick={handleSeedFrameworks}
              disabled={seeding}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium rounded-lg hover:from-violet-500 hover:to-cyan-400 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-violet-500/50"
            >
              {seeding ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Seeding Frameworks...
                </span>
              ) : (
                '+ Seed Frameworks'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Frameworks Grid */}
      {frameworks.length > 0 && (
        <div className="space-y-4">
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              className="bg-white/5 border border-violet-500/20 rounded-lg overflow-hidden hover:border-cyan-500/40 transition-colors"
            >
              {/* Main Framework Card */}
              <div
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === framework.id ? null : framework.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-cyan-300">{framework.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          framework.status
                        )}`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getStatusDot(framework.status)}`} />
                        {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-cyan-400/60 mb-4">{framework.description}</p>
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <span className="text-cyan-400/70">
                        <span className="font-bold text-fuchsia-300">{framework.controlCount}</span> controls
                      </span>
                      <span className="text-cyan-400/70">
                        v<span className="font-bold text-fuchsia-300">{framework.version}</span>
                      </span>
                      <span className="text-violet-400/60">
                        Created {new Date(framework.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <span
                      className={`inline-block text-2xl text-cyan-400 transition-transform ${
                        expandedId === framework.id ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Categories */}
              {expandedId === framework.id && framework.categories && framework.categories.length > 0 && (
                <div className="border-t border-violet-500/20 bg-white/3 p-6">
                  <h4 className="font-bold text-violet-200 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Control Categories
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {framework.categories.map((category, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-violet-950/40 to-cyan-950/30 p-4 rounded-lg border border-violet-500/20 hover:border-cyan-500/40 transition-colors"
                      >
                        <h5 className="font-medium text-cyan-300 text-sm mb-1">
                          {category.name}
                        </h5>
                        <p className="text-xs text-cyan-400/50">{category.description || 'No description'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Categories Message */}
              {expandedId === framework.id && (!framework.categories || framework.categories.length === 0) && (
                <div className="border-t border-violet-500/20 bg-white/3 p-6 text-center">
                  <p className="text-cyan-400/60">No categories defined for this framework</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {frameworks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Frameworks */}
          <div className="bg-gradient-to-br from-violet-950/40 to-violet-900/20 border border-violet-500/20 rounded-lg p-6 hover:border-violet-500/40 transition-colors">
            <p className="text-cyan-400/70 text-sm font-medium mb-2">Total Frameworks</p>
            <p className="text-4xl font-bold text-violet-300">{frameworks.length}</p>
          </div>

          {/* Total Controls */}
          <div className="bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-colors">
            <p className="text-cyan-400/70 text-sm font-medium mb-2">Total Controls</p>
            <p className="text-4xl font-bold text-cyan-300">
              {frameworks.reduce((sum, f) => sum + f.controlCount, 0)}
            </p>
          </div>

          {/* Compliance Status */}
          <div className="bg-gradient-to-br from-fuchsia-950/40 to-fuchsia-900/20 border border-fuchsia-500/20 rounded-lg p-6 hover:border-fuchsia-500/40 transition-colors">
            <p className="text-cyan-400/70 text-sm font-medium mb-2">Published Frameworks</p>
            <p className="text-4xl font-bold text-fuchsia-300">
              {frameworks.filter((f) => f.status === 'published').length}
            </p>
          </div>
        </div>
      )}

      {/* Seed Frameworks Button - Bottom */}
      {frameworks.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSeedFrameworks}
            disabled={seeding}
            className="px-6 py-2 text-sm text-cyan-400 border border-cyan-500/40 rounded-lg hover:border-cyan-500/60 hover:text-cyan-300 disabled:opacity-50 transition-all"
          >
            {seeding ? 'Seeding...' : '+ Add More Frameworks'}
          </button>
        </div>
      )}
    </div>
  );
}
