'use client';

import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'idle' | 'offline';
  lastRun: string;
  tasksCompleted: number;
}

interface AgentsData {
  stats: {
    totalAgents: number;
    activeNow: number;
    tasksCompletedToday: number;
    avgResponseTime: number;
  };
  agents: Agent[];
}

function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case 'active':
      return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' };
    case 'idle':
      return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' };
    case 'offline':
      return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' };
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Compliance':
      return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    case 'Risk':
      return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
    case 'Security':
      return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    case 'Operations':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
    case 'Intelligence':
      return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30';
    case 'Executive':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
    case 'Health':
      return 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30';
    case 'Finance':
      return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    case 'Calendar':
      return 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30';
    case 'Productivity':
      return 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30';
    case 'Learning':
      return 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-100 dark:bg-fuchsia-900/30';
    case 'Wellness':
      return 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
  }
}

const mockData: AgentsData = {
  stats: {
    totalAgents: 34,
    activeNow: 12,
    tasksCompletedToday: 247,
    avgResponseTime: 342,
  },
  agents: [
    // GRC Agents - Compliance (A1-A5)
    { id: 'A1', name: 'Policy Manager', category: 'Compliance', status: 'active', lastRun: '2 minutes ago', tasksCompleted: 48 },
    { id: 'A2', name: 'Control Auditor', category: 'Compliance', status: 'active', lastRun: '5 minutes ago', tasksCompleted: 32 },
    { id: 'A3', name: 'Compliance Reporter', category: 'Compliance', status: 'idle', lastRun: '1 hour ago', tasksCompleted: 156 },
    { id: 'A4', name: 'Framework Mapper', category: 'Compliance', status: 'idle', lastRun: '3 hours ago', tasksCompleted: 24 },
    { id: 'A5', name: 'Requirement Tracker', category: 'Compliance', status: 'offline', lastRun: '12 hours ago', tasksCompleted: 89 },

    // GRC Agents - Risk (A6-A10)
    { id: 'A6', name: 'Risk Assessor', category: 'Risk', status: 'active', lastRun: '1 minute ago', tasksCompleted: 67 },
    { id: 'A7', name: 'Threat Intelligence', category: 'Risk', status: 'active', lastRun: '3 minutes ago', tasksCompleted: 45 },
    { id: 'A8', name: 'Vulnerability Scanner', category: 'Risk', status: 'active', lastRun: '4 minutes ago', tasksCompleted: 123 },
    { id: 'A9', name: 'Impact Analyzer', category: 'Risk', status: 'idle', lastRun: '2 hours ago', tasksCompleted: 34 },
    { id: 'A10', name: 'Risk Mitigation Planner', category: 'Risk', status: 'idle', lastRun: '5 hours ago', tasksCompleted: 56 },

    // GRC Agents - Security (A11-A15)
    { id: 'A11', name: 'Security Monitor', category: 'Security', status: 'active', lastRun: 'Now', tasksCompleted: 204 },
    { id: 'A12', name: 'Access Control Manager', category: 'Security', status: 'active', lastRun: '1 minute ago', tasksCompleted: 78 },
    { id: 'A13', name: 'Incident Responder', category: 'Security', status: 'active', lastRun: '2 minutes ago', tasksCompleted: 12 },
    { id: 'A14', name: 'Identity Verifier', category: 'Security', status: 'idle', lastRun: '30 minutes ago', tasksCompleted: 93 },
    { id: 'A15', name: 'Encryption Manager', category: 'Security', status: 'offline', lastRun: '8 hours ago', tasksCompleted: 41 },

    // GRC Agents - Operations (A16-A20)
    { id: 'A16', name: 'Asset Manager', category: 'Operations', status: 'active', lastRun: '3 minutes ago', tasksCompleted: 156 },
    { id: 'A17', name: 'Change Manager', category: 'Operations', status: 'active', lastRun: '5 minutes ago', tasksCompleted: 67 },
    { id: 'A18', name: 'Maintenance Scheduler', category: 'Operations', status: 'idle', lastRun: '1 hour ago', tasksCompleted: 34 },
    { id: 'A19', name: 'Incident Logger', category: 'Operations', status: 'idle', lastRun: '2 hours ago', tasksCompleted: 89 },
    { id: 'A20', name: 'Performance Monitor', category: 'Operations', status: 'offline', lastRun: '6 hours ago', tasksCompleted: 102 },

    // GRC Agents - Intelligence (A21-A25)
    { id: 'A21', name: 'Data Collector', category: 'Intelligence', status: 'active', lastRun: '1 minute ago', tasksCompleted: 178 },
    { id: 'A22', name: 'Analytics Engine', category: 'Intelligence', status: 'active', lastRun: '2 minutes ago', tasksCompleted: 134 },
    { id: 'A23', name: 'Report Generator', category: 'Intelligence', status: 'active', lastRun: '4 minutes ago', tasksCompleted: 89 },
    { id: 'A24', name: 'Trend Analyzer', category: 'Intelligence', status: 'idle', lastRun: '30 minutes ago', tasksCompleted: 45 },
    { id: 'A25', name: 'Insight Provider', category: 'Intelligence', status: 'idle', lastRun: '1 hour ago', tasksCompleted: 67 },

    // GRC Agents - Executive (A26-A28)
    { id: 'A26', name: 'Dashboard Curator', category: 'Executive', status: 'active', lastRun: '2 minutes ago', tasksCompleted: 56 },
    { id: 'A27', name: 'Executive Briefer', category: 'Executive', status: 'active', lastRun: '3 minutes ago', tasksCompleted: 23 },
    { id: 'A28', name: 'Strategic Planner', category: 'Executive', status: 'idle', lastRun: '1 hour ago', tasksCompleted: 34 },

    // Life Agents
    { id: 'B1', name: 'Health Tracker', category: 'Health', status: 'active', lastRun: '1 minute ago', tasksCompleted: 89 },
    { id: 'B2', name: 'Budget Analyzer', category: 'Finance', status: 'idle', lastRun: '2 hours ago', tasksCompleted: 45 },
    { id: 'B3', name: 'Schedule Manager', category: 'Calendar', status: 'active', lastRun: '5 minutes ago', tasksCompleted: 76 },
    { id: 'B4', name: 'Task Optimizer', category: 'Productivity', status: 'active', lastRun: '3 minutes ago', tasksCompleted: 112 },
    { id: 'B5', name: 'Learning Path Guide', category: 'Learning', status: 'idle', lastRun: '4 hours ago', tasksCompleted: 28 },
    { id: 'B6', name: 'Wellness Coach', category: 'Wellness', status: 'active', lastRun: '1 minute ago', tasksCompleted: 34 },
  ],
};

export default function AgentsPage() {
  const [data, setData] = useState<AgentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    async function fetchAgentsData() {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const result = await response.json();
          setData(result.data || result);
        } else {
          setData(mockData);
        }
      } catch (err) {
        console.error('Error fetching agents data, using mock data:', err);
        setData(mockData);
      } finally {
        setLoading(false);
      }
    }

    fetchAgentsData();
  }, []);

  const handleRunAllAgents = async () => {
    try {
      setRunning(true);
      const response = await fetch('/api/agents/run-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('All agents triggered successfully');
        // Optionally refetch data
        const fetchResponse = await fetch('/api/agents');
        if (fetchResponse.ok) {
          const result = await fetchResponse.json();
          setData(result.data || result);
        }
      }
    } catch (err) {
      console.error('Error running all agents:', err);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">Failed to load agents</h2>
        <p className="text-red-700 dark:text-red-300">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  // Group agents by category
  const agentsByCategory = data.agents.reduce((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = [];
    }
    acc[agent.category].push(agent);
    return acc;
  }, {} as Record<string, Agent[]>);

  const categoryOrder = [
    'Compliance', 'Risk', 'Security', 'Operations', 'Intelligence', 'Executive',
    'Health', 'Finance', 'Calendar', 'Productivity', 'Learning', 'Wellness'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">AI Agent Command Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage all 34 GRC and Life Agents across your organization
          </p>
        </div>
        <button
          onClick={handleRunAllAgents}
          disabled={running}
          className="px-6 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? 'Running...' : '▶ Run All Agents'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Agents</p>
          <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{data.stats.totalAgents}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">GRC + Life Agents</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Now</p>
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{data.stats.activeNow}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Processing tasks</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tasks Completed Today</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{data.stats.tasksCompletedToday}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">All agents combined</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Avg Response Time</p>
          <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{data.stats.avgResponseTime}<span className="text-lg">ms</span></p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">System average</p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="space-y-8">
        {categoryOrder.map((category) => {
          const categoryAgents = agentsByCategory[category];
          if (!categoryAgents || categoryAgents.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{category} Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryAgents.map((agent) => {
                  const statusColor = getStatusColor(agent.status);
                  return (
                    <div
                      key={agent.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-700/50 transition-shadow"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{agent.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{agent.id}</p>
                        </div>
                        <div className={`flex-shrink-0 w-3 h-3 rounded-full ${statusColor.dot} animate-pulse`} />
                      </div>

                      {/* Category Badge */}
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-3 ${getCategoryColor(agent.category)}`}>
                        {agent.category}
                      </div>

                      {/* Status */}
                      <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text} inline-block mb-4`}>
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

                      {/* Details */}
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Last Run</p>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{agent.lastRun}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">Tasks Completed</p>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{agent.tasksCompleted}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
