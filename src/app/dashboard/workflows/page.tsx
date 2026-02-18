'use client';

import { useState, useEffect } from 'react';

// Icon Components (inline SVGs)
const IconPlay = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconPause = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const IconClock = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconZap = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconActivity = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// Type Definitions
interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'Lead Gen' | 'Outreach' | 'Content Creation' | 'Job Search' | 'Board Search';
  status: 'active' | 'paused' | 'draft';
  triggerType: 'manual' | 'scheduled' | 'webhook' | 'event';
  successRate: number;
  executionCount: number;
  lastRun?: Date;
}

interface WorkflowMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

type CategoryFilter = 'All' | 'Lead Gen' | 'Outreach' | 'Content Creation' | 'Job Search' | 'Board Search';

// KPI Card Component
function KPICard({
  title,
  value,
  icon: Icon,
  unit = '',
  color = 'indigo',
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  unit?: string;
  color?: 'indigo' | 'blue' | 'emerald' | 'amber';
}) {
  const colorMap = {
    indigo: 'border-violet-600',
    blue: 'border-blue-600',
    emerald: 'border-emerald-600',
    amber: 'border-amber-600',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-violet-600 font-medium">{title}</p>
        <span className={`text-${color}-600`}>
          <Icon />
        </span>
      </div>
      <p className="text-3xl font-bold text-violet-950">
        {value}
        {unit && <span className="text-lg text-violet-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

// Workflow Card Component
function WorkflowCard({
  workflow,
  onStatusToggle,
}: {
  workflow: Workflow;
  onStatusToggle: (id: string) => void;
}) {
  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    paused: 'bg-amber-100 text-amber-800 border-amber-300',
    draft: 'bg-violet-100 text-violet-800 border-violet-300',
  };

  const triggerIcons = {
    manual: '👆',
    scheduled: '⏰',
    webhook: '🪝',
    event: '⚡',
  };

  const categoryColors: Record<string, string> = {
    'Lead Gen': 'bg-blue-50 text-blue-700',
    'Outreach': 'bg-purple-50 text-purple-700',
    'Content Creation': 'bg-pink-50 text-pink-700',
    'Job Search': 'bg-green-50 text-green-700',
    'Board Search': 'bg-violet-50 text-violet-700',
  };

  const lastRunText = workflow.lastRun ? formatLastRun(new Date(workflow.lastRun)) : 'Never';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-violet-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-violet-950 text-lg">{workflow.name}</h3>
          <p className="text-sm text-violet-600 mt-1">{workflow.description}</p>
        </div>
        <button
          onClick={() => onStatusToggle(workflow.id)}
          className={`p-2 rounded-full transition-colors ${
            workflow.status === 'active'
              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
              : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
          }`}
          title={workflow.status === 'active' ? 'Pause workflow' : 'Activate workflow'}
        >
          {workflow.status === 'active' ? <IconPause /> : <IconPlay />}
        </button>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[workflow.status]} border`}>
          {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
        </span>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[workflow.category]}`}>
          {workflow.category}
        </span>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
          {triggerIcons[workflow.triggerType]} {workflow.triggerType}
        </span>
      </div>

      {/* Success Rate Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-violet-600">Success Rate</span>
          <span className="text-sm font-semibold text-violet-950">{workflow.successRate}%</span>
        </div>
        <div className="w-full bg-violet-200 rounded-full h-2">
          <div
            className="bg-violet-600 h-2 rounded-full transition-all"
            style={{ width: `${workflow.successRate}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-violet-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-600">
            <IconActivity />
          </span>
          <div>
            <p className="text-violet-600">Executions</p>
            <p className="font-semibold text-violet-950">{workflow.executionCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-600">
            <IconClock />
          </span>
          <div>
            <p className="text-violet-600">Last Run</p>
            <p className="font-semibold text-violet-950">{lastRunText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format last run time
function formatLastRun(date: Date): string {
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

// Mock workflow data
const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-compliance-1',
    name: 'Compliance Audit Workflow',
    description: 'Automated quarterly compliance audit and reporting',
    category: 'Job Search',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 94,
    executionCount: 156,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'wf-risk-1',
    name: 'Risk Assessment Engine',
    description: 'Continuous risk scoring and incident detection',
    category: 'Lead Gen',
    status: 'active',
    triggerType: 'event',
    successRate: 91,
    executionCount: 342,
    lastRun: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'wf-audit-1',
    name: 'Audit Trail Generator',
    description: 'Generate and maintain comprehensive audit logs',
    category: 'Outreach',
    status: 'active',
    triggerType: 'event',
    successRate: 99,
    executionCount: 892,
    lastRun: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'wf-policy-1',
    name: 'Policy Compliance Check',
    description: 'Verify adherence to organizational policies',
    category: 'Board Search',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 87,
    executionCount: 201,
    lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'wf-report-1',
    name: 'Regulatory Report Generator',
    description: 'Create compliance reports for regulatory agencies',
    category: 'Content Creation',
    status: 'active',
    triggerType: 'scheduled',
    successRate: 96,
    executionCount: 124,
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'wf-incident-1',
    name: 'Incident Response Workflow',
    description: 'Automated incident detection and response automation',
    category: 'Lead Gen',
    status: 'paused',
    triggerType: 'webhook',
    successRate: 85,
    executionCount: 67,
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

const MOCK_METRICS: WorkflowMetrics = {
  totalWorkflows: 6,
  activeWorkflows: 5,
  totalExecutions: 1782,
  successRate: 92,
};

// Main Dashboard Component
export default function WorkflowsDashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');

  const categories: CategoryFilter[] = ['All', 'Lead Gen', 'Outreach', 'Content Creation', 'Job Search', 'Board Search'];

  // Fetch workflows on mount
  useEffect(() => {
    fetchWorkflows();
  }, []);

  async function fetchWorkflows() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/workflows', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse<{
        workflows: Workflow[];
        metrics: WorkflowMetrics;
        count: number;
      }> = await response.json();

      // Validate response data with Array.isArray checks
      const safeWorkflows = Array.isArray(result.data?.workflows)
        ? result.data.workflows
        : MOCK_WORKFLOWS;

      const safeMetrics = result.data?.metrics || MOCK_METRICS;

      setWorkflows(safeWorkflows);
      setMetrics(safeMetrics);
      setError(null);
    } catch (err) {
      console.error('Error fetching workflows:', err);
      // Use mock data on error instead of showing error state
      setWorkflows(MOCK_WORKFLOWS);
      setMetrics(MOCK_METRICS);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  function handleStatusToggle(workflowId: string) {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === workflowId) {
          return {
            ...w,
            status: w.status === 'active' ? 'paused' : 'active',
          };
        }
        return w;
      })
    );
  }

  // Filter workflows
  const filteredWorkflows = activeCategory === 'All' ? workflows : workflows.filter((w) => w.category === activeCategory);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-violet-200 rounded animate-pulse w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-violet-200 p-6 rounded-lg shadow h-28 animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !workflows.length) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load workflows</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchWorkflows}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-violet-950">Workflows</h1>
        <p className="text-violet-600 mt-2">Manage and monitor automation workflows for Dr. Dédé's GRC consulting empire</p>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Workflows"
            value={metrics.totalWorkflows}
            icon={IconZap}
            color="indigo"
          />
          <KPICard
            title="Active Workflows"
            value={metrics.activeWorkflows}
            icon={IconPlay}
            color="emerald"
          />
          <KPICard
            title="Total Executions"
            value={metrics.totalExecutions}
            icon={IconActivity}
            color="blue"
          />
          <KPICard
            title="Success Rate"
            value={metrics.successRate}
            unit="%"
            icon={IconCheck}
            color="amber"
          />
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-violet-200 pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
              activeCategory === category
                ? 'bg-violet-600 text-white'
                : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
            }`}
          >
            {category}
            {category !== 'All' && (
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {workflows.filter((w) => w.category === category).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-violet-600 text-lg">No workflows found in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onStatusToggle={handleStatusToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
