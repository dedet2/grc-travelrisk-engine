'use client';

import { useState, useEffect } from 'react';

interface Framework {
  name: string;
  version: string;
  totalControls: number;
  complianceScore: number;
  lastAssessmentDate: string;
}

interface AuditFinding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  framework: string;
  description: string;
  dueDate: string;
}

interface ComplianceData {
  frameworks: Framework[];
  auditFindings: AuditFinding[];
}

function getSeverityColor(severity: string): { bg: string; text: string; dot: string } {
  switch (severity) {
    case 'Critical':
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-600' };
    case 'High':
      return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-600' };
    case 'Medium':
      return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-600' };
    case 'Low':
      return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-600' };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-600' };
  }
}

function getComplianceScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-600';
  if (score >= 60) return 'bg-amber-600';
  if (score >= 40) return 'bg-orange-600';
  return 'bg-red-600';
}

const mockData: ComplianceData = {
  frameworks: [
    { name: 'NIST CSF 2.0', version: '2.0', totalControls: 232, complianceScore: 78, lastAssessmentDate: '2024-01-15' },
    { name: 'ISO 27001:2022', version: '2022', totalControls: 114, complianceScore: 82, lastAssessmentDate: '2024-01-10' },
    { name: 'SOC 2 Type II', version: 'Type II', totalControls: 80, complianceScore: 71, lastAssessmentDate: '2024-01-20' },
    { name: 'GDPR', version: '2016', totalControls: 99, complianceScore: 89, lastAssessmentDate: '2024-01-12' },
  ],
  auditFindings: [
    {
      id: '1',
      title: 'Inadequate Access Control Documentation',
      severity: 'Critical',
      framework: 'ISO 27001',
      description: 'Several critical systems lack proper access control documentation and user role definitions.',
      dueDate: '2024-02-15',
    },
    {
      id: '2',
      title: 'Missing Encryption Key Rotation Policy',
      severity: 'High',
      framework: 'NIST CSF',
      description: 'Encryption keys are not being rotated according to industry standards.',
      dueDate: '2024-02-28',
    },
    {
      id: '3',
      title: 'Incident Response Plan Outdated',
      severity: 'High',
      framework: 'SOC 2 Type II',
      description: 'Current incident response procedures have not been updated in 18 months.',
      dueDate: '2024-03-10',
    },
    {
      id: '4',
      title: 'GDPR Data Processing Agreement Gaps',
      severity: 'Medium',
      framework: 'GDPR',
      description: 'Some third-party processors lack proper data processing agreements.',
      dueDate: '2024-03-05',
    },
    {
      id: '5',
      title: 'Incomplete Vulnerability Management',
      severity: 'Medium',
      framework: 'NIST CSF',
      description: 'Vulnerability scanning coverage is incomplete for legacy systems.',
      dueDate: '2024-03-20',
    },
  ],
};

export default function CompliancePage() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComplianceData() {
      try {
        const response = await fetch('/api/compliance');
        if (response.ok) {
          const result = await response.json();
          setData(result.data || result);
        } else {
          setData(mockData);
        }
      } catch (err) {
        console.error('Error fetching compliance data, using mock data:', err);
        setData(mockData);
      } finally {
        setLoading(false);
      }
    }

    fetchComplianceData();
  }, []);

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
        <h2 className="text-lg font-bold text-red-900 dark:text-red-200 mb-2">Failed to load compliance data</h2>
        <p className="text-red-700 dark:text-red-300">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  // Calculate control gap analysis
  const controlGaps = data.frameworks.map((fw) => ({
    name: fw.name,
    implemented: Math.round((fw.complianceScore / 100) * fw.totalControls),
    remaining: fw.totalControls - Math.round((fw.complianceScore / 100) * fw.totalControls),
  }));

  const criticalCount = data.auditFindings.filter((f) => f.severity === 'Critical').length;
  const highCount = data.auditFindings.filter((f) => f.severity === 'High').length;
  const mediumCount = data.auditFindings.filter((f) => f.severity === 'Medium').length;
  const lowCount = data.auditFindings.filter((f) => f.severity === 'Low').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Compliance Hub</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor and manage compliance across multiple regulatory frameworks
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 font-medium text-sm transition-colors">
          + Start New Assessment
        </button>
        <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 font-medium text-sm transition-colors">
          📊 Generate Report
        </button>
        <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 font-medium text-sm transition-colors">
          📅 Schedule Audit
        </button>
        <button className="px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-800 font-medium text-sm transition-colors">
          💾 Export Evidence
        </button>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.frameworks.map((fw) => (
          <div key={fw.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{fw.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Version {fw.version}</p>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{fw.complianceScore}%</p>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${getComplianceScoreColor(fw.complianceScore)}`}
                    style={{ width: `${fw.complianceScore}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Controls</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{fw.totalControls}</p>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400">Last Assessment</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(fw.lastAssessmentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Gap Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Control Gap Analysis</h2>
        <div className="space-y-6">
          {controlGaps.map((gap) => (
            <div key={gap.name}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{gap.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {gap.implemented} / {gap.implemented + gap.remaining} controls
                </p>
              </div>
              <div className="flex gap-2 h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <div
                  className="bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${(gap.implemented / (gap.implemented + gap.remaining)) * 100}%` }}
                  title={`${gap.implemented} implemented`}
                />
                <div
                  className="bg-red-400 rounded-full transition-all"
                  style={{ width: `${(gap.remaining / (gap.implemented + gap.remaining)) * 100}%` }}
                  title={`${gap.remaining} remaining`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Findings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg shadow-sm p-6 border border-red-300 dark:border-red-700">
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Critical Findings</p>
          <p className="text-4xl font-bold text-red-600 dark:text-red-400">{criticalCount}</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">Require immediate action</p>
        </div>

        <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg shadow-sm p-6 border border-orange-300 dark:border-orange-700">
          <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">High Priority</p>
          <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{highCount}</p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">Urgent remediation needed</p>
        </div>

        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg shadow-sm p-6 border border-amber-300 dark:border-amber-700">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Medium Priority</p>
          <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{mediumCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Schedule remediation</p>
        </div>

        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow-sm p-6 border border-blue-300 dark:border-blue-700">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Low Priority</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{lowCount}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Monitor for trends</p>
        </div>
      </div>

      {/* Recent Audit Findings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Audit Findings</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.auditFindings.map((finding) => {
            const severityColor = getSeverityColor(finding.severity);
            return (
              <div key={finding.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Severity Indicator */}
                  <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-1 ${severityColor.dot}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{finding.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{finding.description}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${severityColor.bg} ${severityColor.text}`}>
                            {finding.severity}
                          </span>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {finding.framework}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Due: {new Date(finding.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 font-medium text-sm transition-colors whitespace-nowrap">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-lg shadow-sm p-8 text-white">
        <h2 className="text-2xl font-bold mb-6">Compliance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Average Compliance Score</p>
            <p className="text-4xl font-bold">
              {Math.round(data.frameworks.reduce((acc, fw) => acc + fw.complianceScore, 0) / data.frameworks.length)}%
            </p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total Controls Assessed</p>
            <p className="text-4xl font-bold">
              {data.frameworks.reduce((acc, fw) => acc + fw.totalControls, 0)}
            </p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Active Frameworks</p>
            <p className="text-4xl font-bold">{data.frameworks.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
