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

interface ApprovalItem {
  id: string;
  agentName: string;
  action: string;
  proposedOutput: Record<string, unknown>;
  autonomyLevel: 'L1' | 'L2' | 'L3';
  timestamp: Date;
}

interface ActivityLog {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  status: 'success' | 'failed';
  latency: number;
  humanReviewed: boolean;
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

function AgentCard({
  agent,
  onRun,
  isRunning,
}: {
  agent: Agent;
  onRun: () => void;
  isRunning: boolean;
}) {
  const successRate =
    agent.successCount + agent.failureCount > 0
      ? Math.round(
          (agent.successCount / (agent.successCount + agent.failureCount)) * 100
        )
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{agent.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Success Rate</span>
          <span className="font-medium text-gray-900">{successRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-600">Last Run</p>
          <p className="font-medium text-gray-900">
            {agent.lastRunAt
              ? new Date(agent.lastRunAt).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-600">Avg Latency</p>
          <p className="font-medium text-gray-900">{agent.averageLatencyMs}ms</p>
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={!agent.enabled || isRunning}
        className={`w-full px-4 py-2 rounded font-medium transition-colors text-sm ${
          !agent.enabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : isRunning
              ? 'bg-blue-100 text-blue-700'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isRunning ? 'Running...' : 'Run Agent'}
      </button>
    </div>
  );
}

export default function AgentsPage() {
  const [data, setData] = useState<AgentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [approvalQueue, setApprovalQueue] = useState<ApprovalItem[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchAgents();
    initializeMockData();
  }, []);

  function initializeMockData() {
    // Initialize with mock approval queue and activity log
    setApprovalQueue([
      {
        id: '1',
        agentName: 'GRC-Ingestion-Agent',
        action: 'Update ISO 27001:2022 framework with 341 controls',
        proposedOutput: {
          frameworkId: 'iso-27001-2022-latest',
          controlCount: 341,
          status: 'published',
        },
        autonomyLevel: 'L2',
        timestamp: new Date(Date.now() - 5 * 60000),
      },
    ]);

    setActivityLog([
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60000),
        agent: 'Risk Scoring Agent (A-02)',
        action: 'Score assessment-001',
        status: 'success',
        latency: 523,
        humanReviewed: false,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 10 * 60000),
        agent: 'GRC-Ingestion-Agent',
        action: 'Ingest ISO 27001:2022',
        status: 'success',
        latency: 1240,
        humanReviewed: true,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 25 * 60000),
        agent: 'Risk Scoring Agent (A-02)',
        action: 'Score assessment-002',
        status: 'success',
        latency: 445,
        humanReviewed: false,
      },
    ]);
  }

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
      const response = await fetch(`/api/agents/${agentName}/run`, {
        method: 'POST',
      });
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
      setTimeout(fetchAgents, 1000);
    } catch (err) {
      console.error('Error running all agents:', err);
      setError(err instanceof Error ? err.message : 'Failed to run all agents');
    }
  }

  function approveAction(id: string) {
    setApprovalQueue(approvalQueue.filter((item) => item.id !== id));
    setActivityLog([
      ...activityLog,
      {
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
        agent: approvalQueue.find((item) => item.id === id)?.agentName || 'Unknown',
        action:
          approvalQueue.find((item) => item.id === id)?.action ||
          'Unknown action',
        status: 'success',
        latency: 200,
        humanReviewed: true,
      },
    ]);
  }

  function rejectAction(id: string) {
    setApprovalQueue(approvalQueue.filter((item) => item.id !== id));
    setActivityLog([
      ...activityLog,
      {
        id: `activity-${Date.now()}`,
        timestamp: new Date(),
        agent: approvalQueue.find((item) => item.id === id)?.agentName || 'Unknown',
        action: 'Action rejected by human reviewer',
        status: 'failed',
        latency: 0,
        humanReviewed: true,
      },
    ]);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow h-20 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">
          Failed to load agents
        </h2>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Agents & Automation
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor autonomous agents performing GRC analysis and risk assessment
          </p>
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
          <p className="text-3xl font-bold text-indigo-600">
            {data.summary.totalAgents}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm text-gray-600 mb-1">Running</p>
          <p className="text-3xl font-bold text-blue-600">
            {data.summary.runningCount}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-emerald-600">
            {data.summary.completedCount}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">
            {data.summary.failedCount}
          </p>
        </div>
      </div>

      {/* Agent Status Cards Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Sprint 1 Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.agents.map((agent) => (
            <AgentCard
              key={agent.name}
              agent={agent}
              onRun={() => runAgent(agent.name)}
              isRunning={runningAgents.has(agent.name)}
            />
          ))}
        </div>
      </div>

      {/* Human Approval Queue */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center text-amber-600">!</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Human Approval Queue
            </h2>
            {approvalQueue.length > 0 && (
              <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {approvalQueue.length} pending
              </span>
            )}
          </div>
        </div>

        {approvalQueue.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-gray-600">No pending approvals</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {approvalQueue.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.agentName}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.action}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Autonomy Level: {item.autonomyLevel}
                  </span>
                </div>

                <div className="bg-gray-50 rounded p-3 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Proposed Output</p>
                  <pre className="text-xs text-gray-900 overflow-auto max-h-32">
                    {JSON.stringify(item.proposedOutput, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => rejectAction(item.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveAction(item.id)}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors font-medium text-sm"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agent Activity Log */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Agent Activity Log</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Latency
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Human Reviewed
                </th>
              </tr>
            </thead>
            <tbody>
              {activityLog.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {log.agent}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <>
                          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xs">✓</div>
                          <span className="text-emerald-700 font-medium">
                            Success
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-xs">✕</div>
                          <span className="text-red-700 font-medium">Failed</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.latency}ms
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {log.humanReviewed ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        Yes
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        No
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
