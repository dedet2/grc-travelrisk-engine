'use client';

import { useState, useEffect } from 'react';

interface Assessment {
  id: string;
  name: string;
  framework: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  dueDate: string;
  assessor: string;
}

interface AssessmentsData {
  kpis: {
    totalAssessments: number;
    completed: number;
    inProgress: number;
    criticalFindings: number;
  };
  assessments: Assessment[];
}

function getRiskColor(riskLevel: string): { bg: string; text: string; indicator: string } {
  switch (riskLevel) {
    case 'Low':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', indicator: 'bg-emerald-600' };
    case 'Medium':
      return { bg: 'bg-amber-100', text: 'text-amber-700', indicator: 'bg-amber-600' };
    case 'High':
      return { bg: 'bg-orange-100', text: 'text-orange-700', indicator: 'bg-orange-600' };
    case 'Critical':
      return { bg: 'bg-red-100', text: 'text-red-700', indicator: 'bg-red-600' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', indicator: 'bg-gray-600' };
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-700';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Scheduled':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-600';
  if (score >= 60) return 'bg-amber-600';
  if (score >= 40) return 'bg-orange-600';
  return 'bg-red-600';
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-2.828 2.829a1 1 0 101.414 1.414L9 11.414V6z" clipRule="evenodd" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

const mockData: AssessmentsData = {
  kpis: {
    totalAssessments: 47,
    completed: 38,
    inProgress: 6,
    criticalFindings: 3,
  },
  assessments: [
    {
      id: '1',
      name: 'ISO 27001 Gap Analysis',
      framework: 'ISO 27001',
      status: 'Completed',
      riskLevel: 'Medium',
      score: 78,
      dueDate: '2024-01-15',
      assessor: 'Sarah Johnson',
    },
    {
      id: '2',
      name: 'SOC 2 Type II Readiness',
      framework: 'SOC 2 Type II',
      status: 'In Progress',
      riskLevel: 'High',
      score: 62,
      dueDate: '2024-02-28',
      assessor: 'Michael Chen',
    },
    {
      id: '3',
      name: 'GDPR Compliance Review',
      framework: 'GDPR',
      status: 'Completed',
      riskLevel: 'Low',
      score: 92,
      dueDate: '2024-01-20',
      assessor: 'Emma Davis',
    },
    {
      id: '4',
      name: 'PCI DSS Assessment',
      framework: 'PCI DSS',
      status: 'Completed',
      riskLevel: 'Critical',
      score: 45,
      dueDate: '2024-01-10',
      assessor: 'Robert Martinez',
    },
    {
      id: '5',
      name: 'NIST CSF Evaluation',
      framework: 'NIST CSF',
      status: 'In Progress',
      riskLevel: 'Medium',
      score: 71,
      dueDate: '2024-02-15',
      assessor: 'Lisa Anderson',
    },
    {
      id: '6',
      name: 'HIPAA Security Audit',
      framework: 'HIPAA',
      status: 'Scheduled',
      riskLevel: 'High',
      score: 0,
      dueDate: '2024-03-10',
      assessor: 'James Wilson',
    },
    {
      id: '7',
      name: 'Cloud Security Assessment',
      framework: 'Cloud Security',
      status: 'Completed',
      riskLevel: 'Medium',
      score: 75,
      dueDate: '2024-01-25',
      assessor: 'Patricia Brown',
    },
    {
      id: '8',
      name: 'Third-Party Risk Review',
      framework: 'Third-Party Risk',
      status: 'In Progress',
      riskLevel: 'Low',
      score: 85,
      dueDate: '2024-02-20',
      assessor: 'David Taylor',
    },
  ],
};

export default function AssessmentsPage() {
  const [data, setData] = useState<AssessmentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'inProgress' | 'scheduled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAssessmentData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/assessments');
      if (response.ok) {
        const result = await response.json();
        const apiData = result.data || result;
        if (
          apiData &&
          apiData.kpis &&
          typeof apiData.kpis.totalAssessments === 'number' &&
          Array.isArray(apiData.assessments)
        ) {
          setData(apiData);
          setLastUpdated(new Date());
        } else {
          setData(mockData);
        }
      } else {
        setData(mockData);
      }
    } catch (err) {
      console.error('Error fetching assessment data:', err);
      setError('Failed to load assessments');
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentData();
    const interval = setInterval(fetchAssessmentData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredAssessments = data?.assessments.filter((assessment) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'completed' && assessment.status === 'Completed') ||
      (activeTab === 'inProgress' && assessment.status === 'In Progress') ||
      (activeTab === 'scheduled' && assessment.status === 'Scheduled');

    const matchesSearch =
      searchQuery === '' ||
      assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.assessor.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

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
        <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">Failed to load assessments</h2>
        <p className="text-red-700 dark:text-red-300">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Risk Assessments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage risk assessments against various GRC frameworks. Track implementation status of controls.
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchAssessmentData}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assessments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Assessments</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{data.kpis.totalAssessments}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">All frameworks</p>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{data.kpis.completed}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            {((data.kpis.completed / data.kpis.totalAssessments) * 100).toFixed(0)}% completion
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-amber-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{data.kpis.inProgress}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Active assessments</p>
        </div>

        {/* Critical Findings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-red-600">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Critical Findings</p>
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">{data.kpis.criticalFindings}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Require immediate action</p>
        </div>
      </div>

      {/* Assessments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Assessments</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredAssessments?.length || 0} assessment{filteredAssessments?.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-3 py-2 w-64 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'inProgress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'scheduled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Scheduled
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Assessment Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Framework
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Assessor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAssessments && filteredAssessments.length > 0 ? (
                filteredAssessments.map((assessment) => {
                  const riskColor = getRiskColor(assessment.riskLevel);
                  const scoreColor = getScoreColor(assessment.score);

                  return (
                    <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Assessment Name */}
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {assessment.name}
                      </td>

                      {/* Framework */}
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs font-medium">
                          {assessment.framework}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {assessment.status === 'Completed' && (
                            <div className="text-emerald-600 dark:text-emerald-400">
                              <CheckIcon />
                            </div>
                          )}
                          {assessment.status === 'In Progress' && (
                            <div className="text-blue-600 dark:text-blue-400">
                              <ClockIcon />
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assessment.status)}`}>
                            {assessment.status}
                          </span>
                        </div>
                      </td>

                      {/* Risk Level */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${riskColor.indicator}`} />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor.bg} ${riskColor.text}`}>
                            {assessment.riskLevel}
                          </span>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 text-sm">
                        {assessment.score > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${scoreColor}`}
                                style={{ width: `${assessment.score}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-900 dark:text-gray-100 w-10 text-right">
                              {assessment.score}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(assessment.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Assessor */}
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {assessment.assessor}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No assessments match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
