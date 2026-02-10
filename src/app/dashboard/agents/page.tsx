'use client';

import { useState, useEffect } from 'react';

interface Agent {
  name: string;
  description: string;
  enabled: boolean;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRunAt?: Date;
  latencyMs?: number;
  successCount: number;
  failureCount: number;
  averageLatencyMs: number;
  schedule?: string;
}

interface AgentListResponse {
  summary: {
    totalAgents: number;
    runningCount: number;
    completedCount: number;
    failedCount: number;
  };
  agents: Agent[];
  timestamp: Date;
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    idle: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
    running: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500 animate-pulse' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    </div>
  );
}

export default function AgentsPage() {
  const [data, setData] = useState<AgentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  }

  async function runAgent(agentName: string) {
    try {
      setRunningAgents((prev) => new Set([...prev, agentName]));
      const response = await fetch(`/api/agents/${agentName}/run`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to run agent');
      // Refresh agent list after a delay
      setTimeout(fetchAgents, 1000);
    } catch (err) {
      console.error('Error running agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to run agent');
    } finally {
      setRunningAgents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(agentName);
        return newSet;
      });
    }
  }

  async function runAllAgents() {
    try {
      const response = await fetch('/api/agents/run-all', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to run all agents');
      // Refresh after a delay
      setTimeout(fetchAgents, 1000);
    } catch (err) {
      console.error('Error running all agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to run all agents');
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load agents</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600">No agents available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Agents & Automation</h1>
          <p className="text-gray-600 mt-2">Monitor autonomous agents performing GRC analysis and risk assessment</p>
        </div>
        <button
          onClick={runAllAgents}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Run All Agents
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm text-gray-600 mb-1">Total Agents</p>
          <p className="text-3xl font-bold text-indigo-600">{data.summary.totalAgents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600 mb-1">Running</p>
          <p className="text-3xl font-bold text-blue-600">{data.summary.runningCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-emerald-600">{data.summary.completedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">{data.summary.failedCount}</p>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Agent Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Last Run</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Latency</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Success Rate</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.agents.map((agent, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{agent.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={agent.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {agent.lastRunAt
                    ? new Date(agent.lastRunAt).toLocaleString()
                    : 'Never'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {agent.latencyMs ? `${agent.latencyMs}ms` : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{
                          width: `${
                            agent.successCount + agent.failureCount > 0
                              ? (agent.successCount /
                                  (agent.successCount + agent.failureCount)) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {agent.successCount + agent.failureCount > 0
                        ? `${Math.round((agent.successCount / (agent.successCount + agent.failureCount)) * 100)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => runAgent(agent.name)}
                    disabled={!agent.enabled || runningAgents.has(agent.name)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      !agent.enabled
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : runningAgents.has(agent.name)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {runningAgents.has(agent.name) ? 'Running...' : 'Run'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Agent Details Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Agent Details</h2>
        <div className="space-y-4">
          {data.agents.map((agent, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
                {agent.schedule && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {agent.schedule}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 text-xs mb-1">Total Runs</p>
                  <p className="font-bold text-gray-900">
                    {agent.successCount + agent.failureCount}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Successes</p>
                  <p className="font-bold text-emerald-600">{agent.successCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Failures</p>
                  <p className="font-bold text-red-600">{agent.failureCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-1">Avg Latency</p>
                  <p className="font-bold text-gray-900">{agent.averageLatencyMs}ms</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
