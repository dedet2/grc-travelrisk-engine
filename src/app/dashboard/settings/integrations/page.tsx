'use client';

import { useState, useEffect } from 'react';

interface SIEMConnectorConfig {
  name: string;
  type: 'splunk' | 'qradar' | 'sentinel';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastSync?: string;
  eventsSent: number;
  config: Record<string, any>;
  errorMessage?: string;
}

export default function IntegrationsPage() {
  const [connectors, setConnectors] = useState<SIEMConnectorConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState<'splunk' | 'qradar' | 'sentinel'>('splunk');
  const [testing, setTesting] = useState<string | null>(null);

  const siemTypes = [
    {
      id: 'splunk',
      name: 'Splunk',
      description: 'Send security events to Splunk via HTTP Event Collector',
      fields: ['hecUrl', 'hecToken'],
    },
    {
      id: 'qradar',
      name: 'QRadar',
      description: 'Stream events to IBM QRadar in LEEF format',
      fields: ['qradarHost', 'qradarPort'],
    },
    {
      id: 'sentinel',
      name: 'Azure Sentinel',
      description: 'Integrate with Azure Sentinel for advanced threat detection',
      fields: ['workspaceId', 'sharedKey'],
    },
  ];

  useEffect(() => {
    fetchConnectors();
  }, []);

  async function fetchConnectors() {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/siem');
      if (!response.ok) throw new Error('Failed to fetch integrations');
      const result = await response.json();
      setConnectors(result.data || []);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddConnector() {
    try {
      const config = siemTypes.find((t) => t.id === selectedType);
      if (!config) return;

      const response = await fetch('/api/integrations/siem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          name: configForm.name || `${config.name} Connector`,
          config: {
            ...Object.fromEntries(
              config.fields.map((field) => [field, configForm[field] || ''])
            ),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to add connector');
      const result = await response.json();
      setConnectors([...connectors, result.data]);
      setShowConfig(null);
      setConfigForm({});
    } catch (err) {
      console.error('Error adding connector:', err);
      setError(err instanceof Error ? err.message : 'Failed to add connector');
    }
  }

  async function handleTestConnection(connectorId: string) {
    try {
      setTesting(connectorId);
      const response = await fetch('/api/integrations/siem', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectorId }),
      });

      if (!response.ok) throw new Error('Connection test failed');
      const result = await response.json();

      setConnectors((prev) =>
        prev.map((c) =>
          c.name === connectorId ? result.data : c
        )
      );
    } catch (err) {
      console.error('Error testing connection:', err);
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setTesting(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-100 text-emerald-700';
      case 'disconnected':
        return 'bg-violet-100 text-violet-700';
      case 'testing':
        return 'bg-blue-100 text-blue-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-violet-100 text-violet-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-violet-200 rounded animate-pulse w-1/2" />
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
      <div>
        <h1 className="text-4xl font-bold text-violet-950">SIEM Integrations</h1>
        <p className="text-violet-600 mt-2">Connect your SIEM platforms for centralized event collection and monitoring</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Add New Integration Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-violet-950">Available SIEM Platforms</h2>
        </div>
        <button
          onClick={() => setShowConfig('new')}
          className="px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          + Add Integration
        </button>
      </div>

      {/* Configuration Modal */}
      {showConfig === 'new' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-xl font-bold text-violet-950 mb-4">Add SIEM Integration</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-violet-700 mb-2">SIEM Platform</label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value as any);
                      setConfigForm({});
                    }}
                    className="w-full px-3 py-2 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    {siemTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-violet-700 mb-2">Integration Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Production Splunk"
                    value={configForm.name || ''}
                    onChange={(e) =>
                      setConfigForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {siemTypes
                  .find((t) => t.id === selectedType)
                  ?.fields.map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-violet-700 mb-2">
                        {field === 'hecUrl' && 'HEC URL'}
                        {field === 'hecToken' && 'HEC Token'}
                        {field === 'qradarHost' && 'QRadar Host'}
                        {field === 'qradarPort' && 'QRadar Port'}
                        {field === 'workspaceId' && 'Workspace ID'}
                        {field === 'sharedKey' && 'Shared Key'}
                      </label>
                      <input
                        type={field.includes('Token') || field.includes('Key') ? 'password' : 'text'}
                        placeholder={`Enter ${field}`}
                        value={configForm[field] || ''}
                        onChange={(e) =>
                          setConfigForm((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfig(null);
                    setConfigForm({});
                  }}
                  className="flex-1 px-4 py-2 border border-violet-300 text-violet-700 font-medium rounded-lg hover:bg-violet-50/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddConnector}
                  className="flex-1 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition-colors"
                >
                  Add Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connectors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {siemTypes.map((type) => {
          const connector = connectors.find((c) => c.type === type.id);

          return (
            <div
              key={type.id}
              className="border border-violet-200 rounded-lg p-6 hover:border-violet-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-violet-950">{type.name}</h3>
                  <p className="text-sm text-violet-600 mt-1">{type.description}</p>
                </div>
              </div>

              {connector ? (
                <div className="space-y-3 mt-4 pt-4 border-t border-violet-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-violet-600">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(connector.status)}`}>
                      {connector.status.charAt(0).toUpperCase() + connector.status.slice(1)}
                    </span>
                  </div>

                  {connector.lastSync && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-violet-600">Last Sync</span>
                      <span className="text-sm font-medium text-violet-950">
                        {new Date(connector.lastSync).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-violet-600">Events Sent</span>
                    <span className="text-sm font-bold text-violet-950">{connector.eventsSent}</span>
                  </div>

                  {connector.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-700">{connector.errorMessage}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-3">
                    <button
                      onClick={() => handleTestConnection(connector.name)}
                      disabled={testing === connector.name}
                      className="flex-1 px-3 py-2 border border-violet-300 text-violet-700 text-sm font-medium rounded hover:bg-violet-50/30 transition-colors disabled:opacity-50"
                    >
                      {testing === connector.name ? 'Testing...' : 'Test Connection'}
                    </button>
                    <button className="flex-1 px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded hover:bg-red-100 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-violet-200">
                  <button
                    onClick={() => {
                      setSelectedType(type.id as any);
                      setShowConfig('new');
                    }}
                    className="w-full px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
                  >
                    Configure Integration
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delivery Metrics */}
      {connectors.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-violet-950 mb-4">Event Delivery Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-violet-50/30 rounded-lg p-4">
              <p className="text-sm text-violet-600 mb-1">Total Connectors</p>
              <p className="text-2xl font-bold text-violet-950">{connectors.length}</p>
            </div>
            <div className="bg-violet-50/30 rounded-lg p-4">
              <p className="text-sm text-violet-600 mb-1">Connected</p>
              <p className="text-2xl font-bold text-emerald-600">
                {connectors.filter((c) => c.status === 'connected').length}
              </p>
            </div>
            <div className="bg-violet-50/30 rounded-lg p-4">
              <p className="text-sm text-violet-600 mb-1">Total Events Sent</p>
              <p className="text-2xl font-bold text-violet-600">
                {connectors.reduce((sum, c) => sum + c.eventsSent, 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
