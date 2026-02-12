'use client';

import { useState, useEffect } from 'react';

interface RoadmapMonth {
  month: string;
  focus: string;
  keyActions: string;
  metricTargets: string;
  status: 'planned' | 'in-progress' | 'completed';
  completionPercent?: number;
  notes?: string;
}

interface OKR {
  objective: string;
  keyResults: string[];
  owner?: string;
  status: 'not-started' | 'in-progress' | 'at-risk' | 'complete';
}

interface RoadmapQuarter {
  quarter: string;
  months: RoadmapMonth[];
  okrs: OKR[];
}

interface ExecutionWeek {
  week: string;
  weekNumber: number;
  theme: string;
  objectives: string[];
  completionStatus: 'not-started' | 'in-progress' | 'complete';
  weeklyTargets: {
    leadsTarget: number;
    callsTarget: number;
    contentPieces: number;
  };
}

interface KPIMetric {
  id: string;
  name: string;
  category: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles = {
    'planned': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'not-started': 'bg-gray-100 text-gray-600',
    'at-risk': 'bg-orange-100 text-orange-800',
    'complete': 'bg-green-100 text-green-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status as keyof typeof statusStyles] || statusStyles.planned
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return (
      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        <path d="M9 3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 10.586V3z" />
      </svg>
    );
  }
  if (trend === 'down') {
    return (
      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
        <path d="M11 17a1 1 0 11-2 0v-7.586l-1.293 1.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 9.414V17z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" />
    </svg>
  );
}

// Mock data for roadmap
const MOCK_ROADMAP_DATA: RoadmapQuarter[] = [
  {
    quarter: 'Q1 2024 - Foundation',
    months: [
      {
        month: 'January',
        focus: 'Platform Architecture Setup',
        keyActions: 'Build core GRC framework and infrastructure',
        metricTargets: '3 infrastructure components',
        status: 'completed',
        completionPercent: 100,
        notes: 'Infrastructure established successfully',
      },
      {
        month: 'February',
        focus: 'API Development',
        keyActions: 'Create REST APIs for compliance workflows',
        metricTargets: '15 API endpoints',
        status: 'completed',
        completionPercent: 100,
      },
      {
        month: 'March',
        focus: 'Dashboard MVP',
        keyActions: 'Build initial dashboard components',
        metricTargets: '5 main dashboard pages',
        status: 'in-progress',
        completionPercent: 85,
      },
    ],
    okrs: [
      {
        objective: 'Establish scalable GRC platform foundation',
        keyResults: [
          'Deploy cloud infrastructure supporting 100+ users',
          'Create 15+ API endpoints for core functionality',
          'Achieve 99.5% system uptime',
        ],
        owner: 'Platform Team',
        status: 'in-progress',
      },
      {
        objective: 'Implement compliance tracking systems',
        keyResults: [
          'Build 5 compliance workflow templates',
          'Create real-time audit logging',
          'Enable automated compliance reporting',
        ],
        owner: 'Compliance Team',
        status: 'in-progress',
      },
    ],
  },
  {
    quarter: 'Q2 2024 - Expansion',
    months: [
      {
        month: 'April',
        focus: 'Risk Assessment Module',
        keyActions: 'Develop risk scoring and assessment tools',
        metricTargets: '2 risk frameworks',
        status: 'planned',
        completionPercent: 0,
      },
      {
        month: 'May',
        focus: 'Audit Workflow Automation',
        keyActions: 'Create automated audit scheduling and workflows',
        metricTargets: '10 automation rules',
        status: 'planned',
        completionPercent: 0,
      },
      {
        month: 'June',
        focus: 'Integration Layer',
        keyActions: 'Build connectors for third-party risk management tools',
        metricTargets: '5 integrations',
        status: 'planned',
        completionPercent: 0,
      },
    ],
    okrs: [
      {
        objective: 'Expand platform capabilities with risk management',
        keyResults: [
          'Build risk assessment module with 80% accuracy',
          'Integrate 5 external risk data sources',
          'Create automated risk reporting dashboards',
        ],
        owner: 'Risk Team',
        status: 'not-started',
      },
    ],
  },
];

const MOCK_EXECUTION_WEEKS: ExecutionWeek[] = [
  {
    week: 'Week 1-2',
    weekNumber: 1,
    theme: 'Foundation & Setup',
    objectives: ['Initialize project repository', 'Set up development environment', 'Create deployment pipeline'],
    completionStatus: 'complete',
    weeklyTargets: { leadsTarget: 0, callsTarget: 0, contentPieces: 2 },
  },
  {
    week: 'Week 3-4',
    weekNumber: 2,
    theme: 'Core API Development',
    objectives: ['Build authentication API', 'Create compliance endpoints', 'Implement database models'],
    completionStatus: 'complete',
    weeklyTargets: { leadsTarget: 0, callsTarget: 0, contentPieces: 3 },
  },
  {
    week: 'Week 5-6',
    weekNumber: 3,
    theme: 'Dashboard Pages',
    objectives: ['Develop roadmap dashboard', 'Build strategic dashboard', 'Create workflows dashboard'],
    completionStatus: 'in-progress',
    weeklyTargets: { leadsTarget: 0, callsTarget: 0, contentPieces: 4 },
  },
  {
    week: 'Week 7-8',
    weekNumber: 4,
    theme: 'Testing & QA',
    objectives: ['Unit testing', 'Integration testing', 'Performance optimization'],
    completionStatus: 'not-started',
    weeklyTargets: { leadsTarget: 0, callsTarget: 0, contentPieces: 2 },
  },
  {
    week: 'Week 9-10',
    weekNumber: 5,
    theme: 'Documentation',
    objectives: ['API documentation', 'User guides', 'System architecture docs'],
    completionStatus: 'not-started',
    weeklyTargets: { leadsTarget: 0, callsTarget: 0, contentPieces: 5 },
  },
  {
    week: 'Week 11-12',
    weekNumber: 6,
    theme: 'Deployment Prep',
    objectives: ['Security audit', 'Load testing', 'Deployment checklist'],
    completionStatus: 'not-started',
    weeklyTargets: { leadsTarget: 0, callsTarget: 0, contentPieces: 3 },
  },
];

const MOCK_KPI_METRICS: KPIMetric[] = [
  {
    id: 'api-uptime',
    name: 'API Uptime',
    category: 'Infrastructure',
    current: 99.8,
    target: 99.5,
    unit: '%',
    trend: 'up',
    trendPercent: 0.3,
  },
  {
    id: 'compliance-score',
    name: 'Compliance Score',
    category: 'Compliance',
    current: 92,
    target: 95,
    unit: 'points',
    trend: 'up',
    trendPercent: 5,
  },
  {
    id: 'audit-completion',
    name: 'Audit Completion Rate',
    category: 'Compliance',
    current: 88,
    target: 100,
    unit: '%',
    trend: 'up',
    trendPercent: 8,
  },
  {
    id: 'risk-incidents',
    name: 'Risk Incidents Detected',
    category: 'Risk Management',
    current: 12,
    target: 5,
    unit: 'count',
    trend: 'down',
    trendPercent: -35,
  },
  {
    id: 'response-time',
    name: 'API Response Time',
    category: 'Infrastructure',
    current: 245,
    target: 300,
    unit: 'ms',
    trend: 'down',
    trendPercent: -12,
  },
];

export default function RoadmapPage() {
  const [roadmapQuarters, setRoadmapQuarters] = useState<RoadmapQuarter[]>([]);
  const [executionWeeks, setExecutionWeeks] = useState<ExecutionWeek[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'execution' | 'metrics'>('roadmap');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch roadmap data
        const roadmapRes = await fetch('/api/roadmap');
        const roadmapData = await roadmapRes.json();
        const safeRoadmapQuarters = Array.isArray(roadmapData.data?.quarters)
          ? roadmapData.data.quarters
          : MOCK_ROADMAP_DATA;
        setRoadmapQuarters(safeRoadmapQuarters);

        // Fetch execution plan
        const executionRes = await fetch('/api/execution-plan?view=summary');
        const executionData = await executionRes.json();
        const safeExecutionWeeks = Array.isArray(executionData.data)
          ? executionData.data
          : MOCK_EXECUTION_WEEKS;
        setExecutionWeeks(safeExecutionWeeks);

        // Fetch KPI metrics
        const kpiRes = await fetch('/api/kpi-metrics');
        const kpiData = await kpiRes.json();
        const safeKpiMetrics = Array.isArray(kpiData.data?.metrics)
          ? kpiData.data.metrics
          : MOCK_KPI_METRICS;
        setKpiMetrics(safeKpiMetrics);

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Use mock data on any error
        setRoadmapQuarters(MOCK_ROADMAP_DATA);
        setExecutionWeeks(MOCK_EXECUTION_WEEKS);
        setKpiMetrics(MOCK_KPI_METRICS);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading roadmap data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Roadmap & Execution Dashboard</h1>
        <p className="text-blue-100">
          Track quarterly OKRs, 12-week execution milestones, and KPI performance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {(['roadmap', 'execution', 'metrics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {roadmapQuarters.map(quarter => (
            <div key={quarter.quarter} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{quarter.quarter}</h2>

              {/* Months Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {quarter.months.map(month => (
                  <div
                    key={month.month}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{month.month}</h3>
                      <StatusBadge status={month.status} />
                    </div>

                    {month.completionPercent !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progress</span>
                          <span className="text-xs font-medium text-gray-900">
                            {month.completionPercent}%
                          </span>
                        </div>
                        <ProgressBar value={month.completionPercent} />
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">Focus</p>
                        <p className="text-gray-900 font-medium">{month.focus}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">Key Actions</p>
                        <p className="text-gray-900">{month.keyActions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs uppercase tracking-wide">Targets</p>
                        <p className="text-gray-900 font-medium">{month.metricTargets}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* OKRs */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Objectives & Key Results</h3>
                <div className="space-y-4">
                  {quarter.okrs.map((okr, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{okr.objective}</h4>
                          {okr.owner && (
                            <p className="text-xs text-gray-600">Owner: {okr.owner}</p>
                          )}
                        </div>
                        <StatusBadge status={okr.status} />
                      </div>
                      <ul className="space-y-2">
                        {okr.keyResults.map((kr, krIdx) => (
                          <li key={krIdx} className="flex items-start text-sm text-gray-700">
                            <span className="mr-2">•</span>
                            <span>{kr}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Tab */}
      {activeTab === 'execution' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">12-Week Execution Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {executionWeeks.map(week => (
                <div
                  key={week.week}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{week.week}</h3>
                      <p className="text-sm text-gray-600">{week.theme}</p>
                    </div>
                    <StatusBadge status={week.completionStatus} />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Targets</p>
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-gray-900">
                            {week.weeklyTargets.leadsTarget}
                          </p>
                          <p className="text-xs text-gray-600">Leads</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-gray-900">
                            {week.weeklyTargets.callsTarget}
                          </p>
                          <p className="text-xs text-gray-600">Calls</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-gray-900">
                            {week.weeklyTargets.contentPieces}
                          </p>
                          <p className="text-xs text-gray-600">Content</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                        Objectives
                      </p>
                      <ul className="space-y-1">
                        {week.objectives.slice(0, 2).map((obj, idx) => (
                          <li key={idx} className="text-xs text-gray-700 truncate">
                            • {obj}
                          </li>
                        ))}
                        {week.objectives.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{week.objectives.length - 2} more
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Group metrics by category */}
          {Array.from(new Set(kpiMetrics.map(m => m.category))).map(category => (
            <div key={category} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpiMetrics
                  .filter(m => m.category === category)
                  .map(metric => (
                    <div key={metric.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{metric.name}</h3>
                          <p className="text-xs text-gray-600 mt-1">{metric.unit}</p>
                        </div>
                        <TrendIcon trend={metric.trend} />
                      </div>

                      <div className="flex items-baseline space-x-2 mb-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.current.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            metric.trend === 'up'
                              ? 'text-green-600'
                              : metric.trend === 'down'
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {metric.trend === 'up' ? '+' : ''}
                          {metric.trendPercent}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Target: {metric.target.toLocaleString()}</span>
                        <span>
                          {Math.round((metric.current / metric.target) * 100)}%
                        </span>
                      </div>

                      <ProgressBar value={metric.current} max={metric.target * 1.2} />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
