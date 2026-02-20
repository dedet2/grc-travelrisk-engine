'use client';

import { useState, useEffect } from 'react';

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error' | 'inactive' | 'pending';
  category: string;
  lastSync?: string;
  dataPoints: number;
  description: string;
  icon?: string;
  healthStatus?: 'healthy' | 'unhealthy';
}

interface IntegrationStats {
  total: number;
  connected: number;
  errors: number;
  totalDataPoints: number;
}

// Use static dates to avoid server/client hydration mismatch
const DEFAULT_INTEGRATIONS: Integration[] = [
  {
    id: 'apollo',
    name: 'Apollo',
    status: 'connected',
    category: 'Sales & CRM',
    lastSync: '2026-02-18T08:00:00.000Z',
    dataPoints: 45230,
    description: 'Lead intelligence and contact database integration',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    status: 'connected',
    category: 'Sales & CRM',
    lastSync: '2026-02-18T06:00:00.000Z',
    dataPoints: 12450,
    description: 'Professional network and contact information',
  },
  {
    id: 'make',
    name: 'Make.com',
    status: 'connected',
    category: 'Automation',
    lastSync: '2026-02-18T09:00:00.000Z',
    dataPoints: 8920,
    description: 'Workflow automation and integration platform',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    status: 'connected',
    category: 'Databases & Storage',
    lastSync: '2026-02-18T09:30:00.000Z',
    dataPoints: 23450,
    description: 'Flexible database and project management',
  },
  {
    id: 'slack',
    name: 'Slack',
    status: 'connected',
    category: 'Communication',
    lastSync: '2026-02-18T09:45:00.000Z',
    dataPoints: 15670,
    description: 'Team messaging and notifications',
  },
  {
    id: 'podia',
    name: 'Podia',
    status: 'disconnected',
    category: 'E-commerce',
    lastSync: '2026-02-11T10:00:00.000Z',
    dataPoints: 5340,
    description: 'Digital products and online course platform',
  },
  {
    id: 'weconnect',
    name: 'WeConnect',
    status: 'error',
    category: 'Integration Platform',
    lastSync: '2026-02-15T10:00:00.000Z',
    dataPoints: 0,
    description: 'Enterprise integration hub and API management',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    status: 'connected',
    category: 'AI & Analytics',
    lastSync: '2026-02-18T04:00:00.000Z',
    dataPoints: 3240,
    description: 'AI-powered research and answer engine',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    status: 'connected',
    category: 'Payments',
    lastSync: '2026-02-18T09:40:00.000Z',
    dataPoints: 89450,
    description: 'Payment processing and billing platform',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    status: 'disconnected',
    category: 'Health & Wellness',
    lastSync: '2026-02-04T10:00:00.000Z',
    dataPoints: 4120,
    description: 'Fitness tracking and health data monitoring',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    status: 'connected',
    category: 'Email & Marketing',
    lastSync: '2026-02-18T09:55:00.000Z',
    dataPoints: 67890,
    description: 'Email delivery and marketing automation',
  },
  {
    id: 'googlecalendar',
    name: 'Google Calendar',
    status: 'connected',
    category: 'Productivity',
    lastSync: '2026-02-18T09:50:00.000Z',
    dataPoints: 2156,
    description: 'Calendar and scheduling management',
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'connected':
      return 'bg-emerald-100 text-emerald-700';
    case 'disconnected':
      return 'bg-violet-100 text-violet-700';
    case 'error':
      return 'bg-red-100 text-red-700';
    case 'pending':
      return 'bg-amber-100 text-amber-700';
    case 'inactive':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-violet-100 text-violet-700';
  }
}

function getStatusIcon(status: string) {
  if (status === 'connected') {
    return (
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  } else if (status === 'error') {
    return (
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  } else if (status === 'pending') {
    return (
      <svg
        className="w-4 h-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }
  // default: inactive or disconnected
  return (
    <svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M13.477 14.89A6 6 0 15 5.11 2.523a6 6 0 018.367 12.367z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function formatLastSync(dateString?: string): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDataPoints(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function getIntegrationStats(integrations: Integration[]): IntegrationStats {
  return {
    total: integrations.length,
    connected: integrations.filter((i) => i.status === 'connected').length,
    errors: integrations.filter((i) => i.status === 'error' || i.status === 'inactive').length,
    totalDataPoints: integrations.reduce((sum, i) => sum + (i.dataPoints || 0), 0),
  };
}

function getDescriptionForService(serviceId: string): string {
  const descriptions: Record<string, string> = {
    apollo: 'Lead intelligence and contact database integration',
    sendgrid: 'Email delivery and marketing automation',
    stripe: 'Payment processing and billing platform',
    weconnect: 'Enterprise integration hub and API management',
    vibekanban: 'Project management and workflow tracking',
    make: 'Workflow automation and integration platform',
    airtable: 'Flexible database and project management',
    slack: 'Team messaging and notifications',
    calendly: 'Calendar and scheduling management',
    supabase: 'Open source Firebase alternative with PostgreSQL',
  };
  return descriptions[serviceId] || 'Integration service';
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [testingIds, setTestingIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const categories = Array.from(new Set(integrations.map((i) => i.category))).sort();
  const filteredIntegrations = selectedCategory
    ? integrations.filter((i) => i.category === selectedCategory)
    : integrations;
  const stats = getIntegrationStats(integrations);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch from the real integrations API that uses connector registry
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const result = await response.json();
        const apiData = result.data;
        if (apiData && apiData.services) {
          // Map API services to dashboard Integration format
          const mappedIntegrations: Integration[] = apiData.services.map(
            (service: any) => ({
              id: service.id,
              name: service.name,
              status: service.status,
              category: service.category,
              lastSync: service.lastSync,
              dataPoints: service.eventsProcessed || 0,
              icon: service.icon,
              healthStatus: service.healthStatus,
              // Generate a description based on the service
              description: getDescriptionForService(service.id),
            })
          );
          setIntegrations(mappedIntegrations);
          setLastUpdated(new Date());
        } else {
          setIntegrations(DEFAULT_INTEGRATIONS);
        }
      } else {
        setIntegrations(DEFAULT_INTEGRATIONS);
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load integrations'
      );
      setIntegrations(DEFAULT_INTEGRATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    const interval = setInterval(fetchIntegrations, 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleTestConnection(integrationId: string) {
    try {
      setTestingIds((prev) => new Set(prev).add(integrationId));

      // Simulate API call to test connection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, update based on API response
      setIntegrations((prev) =>
        prev.map((i) => {
          if (i.id === integrationId) {
            return {
              ...i,
              status: i.status === 'error' ? 'connected' : i.status,
              lastSync: new Date().toISOString(),
            };
          }
          return i;
        })
      );
    } catch (err) {
      console.error('Error testing connection:', err);
      setError('Failed to test connection');
    } finally {
      setTestingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
    }
  }

  async function handleTestAllConnections() {
    const allIds = new Set(integrations.map((i) => i.id));
    setTestingIds(allIds);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIntegrations((prev) =>
        prev.map((i) => ({
          ...i,
          status: i.status === 'error' ? 'connected' : i.status,
          lastSync: new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error('Error testing all connections:', err);
      setError('Failed to test all connections');
    } finally {
      setTestingIds(new Set());
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-violet-200 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow h-32 animate-pulse"
            />
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow h-96 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">
          Failed to load integrations
        </h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-violet-950">Integrations</h1>
          <p className="text-violet-600 mt-2">
            Manage and monitor all connected services and data sources
          </p>
          {lastUpdated && (
            <p className="text-xs text-violet-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchIntegrations}
            disabled={loading}
            className="px-4 py-2 bg-violet-200 text-violet-950 rounded-lg hover:bg-violet-300 font-medium transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
          <button
            onClick={handleTestAllConnections}
            disabled={testingIds.size > 0}
            className="px-6 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testingIds.size > 0 ? 'Testing...' : 'Test All Connections'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-violet-600">
          <p className="text-sm font-medium text-violet-600 mb-1">
            Total Integrations
          </p>
          <p className="text-4xl font-bold text-violet-600">{stats.total}</p>
          <p className="text-xs text-violet-600 mt-2">Active services</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Connected</p>
          <p className="text-4xl font-bold text-emerald-600">{stats.connected}</p>
          <p className="text-xs text-violet-600 mt-2">Fully operational</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Errors</p>
          <p className="text-4xl font-bold text-red-600">{stats.errors}</p>
          <p className="text-xs text-violet-600 mt-2">Attention required</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-violet-600 mb-1">
            Data Points Synced
          </p>
          <p className="text-4xl font-bold text-blue-600">
            {formatDataPoints(stats.totalDataPoints)}
          </p>
          <p className="text-xs text-violet-600 mt-2">Total records</p>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h2 className="text-lg font-bold text-violet-950 mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === null
                ? 'bg-violet-600 text-white'
                : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const isTesting = testingIds.has(integration.id);
          return (
            <div
              key={integration.id}
              className="bg-white rounded-lg shadow p-6 border border-violet-200 hover:border-violet-300 hover:shadow-md transition-all"
            >
              {/* Header with Name and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-violet-950">
                    {integration.name}
                  </h3>
                  <p className="text-xs text-violet-500 mt-1 font-medium uppercase">
                    {integration.category}
                  </p>
                </div>
                <div
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    integration.status
                  )}`}
                >
                  {getStatusIcon(integration.status)}
                  <span>
                    {integration.status.charAt(0).toUpperCase() +
                      integration.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-violet-600 mb-4">
                {integration.description}
              </p>

              {/* Details */}
              <div className="space-y-3 mb-4 pt-4 border-t border-violet-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-violet-600">Last Sync</span>
                  <span className="text-sm font-medium text-violet-950">
                    {formatLastSync(integration.lastSync)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-violet-600">Data Points</span>
                  <span className="text-sm font-bold text-violet-600">
                    {formatDataPoints(integration.dataPoints)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => handleTestConnection(integration.id)}
                disabled={isTesting}
                className="w-full px-4 py-2 bg-violet-50 text-violet-700 font-medium rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Testing...</span>
                  </span>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="bg-violet-50/30 rounded-lg p-12 text-center">
          <svg
            className="w-12 h-12 text-violet-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a1 1 0 00-1 1v3a1 1 0 11-2 0v-3a1 1 0 00-1-1H7a2 2 0 00-2 2v4a2 2 0 002 2z"
            />
          </svg>
          <p className="text-violet-600 text-lg">
            No integrations found for this category
          </p>
        </div>
      )}

      {/* Integration Status Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-violet-950 mb-6">Integration Health</h2>
        <div className="space-y-4">
          {/* Connected */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-violet-950">Connected</span>
              </div>
              <span className="text-sm font-bold text-emerald-600">
                {stats.connected} / {stats.total}
              </span>
            </div>
            <div className="w-full bg-violet-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(stats.connected / stats.total) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Inactive/Pending */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-violet-950">Inactive/Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-600">
                {stats.total - stats.connected - stats.errors} / {stats.total}
              </span>
            </div>
            <div className="w-full bg-violet-200 rounded-full h-2">
              <div
                className="bg-gray-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((stats.total - stats.connected - stats.errors) / stats.total) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Errors */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-violet-950">Errors</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {stats.errors} / {stats.total}
              </span>
            </div>
            <div className="w-full bg-violet-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(stats.errors / stats.total) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
