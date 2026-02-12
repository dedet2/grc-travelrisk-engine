'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  riskScoreTrend: Array<{ date: string; score: number }>;
  complianceByFramework: Array<{ framework: string; implemented: number; total: number }>;
  agentActivity: Array<{
    agent: string;
    status: string;
    latencyMs: number;
    timestamp: string;
  }>;
  travelRiskByCountry: Array<{ country: string; code: string; score: number }>;
}

interface DashboardStats {
  riskScore: { overall: number; level: string };
  compliance: { rate: number };
  assessments: { active: number };
}

// Mock report data
const MOCK_REPORT_DATA: ReportData = {
  riskScoreTrend: [
    { date: '7 days ago', score: 45 },
    { date: '6 days ago', score: 42 },
    { date: '5 days ago', score: 48 },
    { date: '4 days ago', score: 44 },
    { date: '3 days ago', score: 40 },
    { date: '2 days ago', score: 42 },
    { date: 'Today', score: 38 },
  ],
  complianceByFramework: [
    { framework: 'ISO 27001', implemented: 28, total: 35 },
    { framework: 'NIST CSF', implemented: 45, total: 60 },
    { framework: 'SOC 2', implemented: 22, total: 25 },
    { framework: 'GDPR', implemented: 38, total: 45 },
    { framework: 'HIPAA', implemented: 35, total: 40 },
  ],
  agentActivity: [
    { agent: 'Risk Assessment Agent', status: 'success', latencyMs: 234, timestamp: new Date().toISOString() },
    { agent: 'Compliance Checker', status: 'success', latencyMs: 156, timestamp: new Date().toISOString() },
    { agent: 'Audit Logger', status: 'running', latencyMs: 512, timestamp: new Date().toISOString() },
    { agent: 'Policy Validator', status: 'success', latencyMs: 289, timestamp: new Date().toISOString() },
    { agent: 'Travel Risk Scanner', status: 'success', latencyMs: 445, timestamp: new Date().toISOString() },
  ],
  travelRiskByCountry: [
    { country: 'United States', code: 'US', score: 25 },
    { country: 'Canada', code: 'CA', score: 22 },
    { country: 'Germany', code: 'DE', score: 28 },
    { country: 'France', code: 'FR', score: 30 },
    { country: 'United Kingdom', code: 'GB', score: 26 },
    { country: 'China', code: 'CN', score: 72 },
    { country: 'Russia', code: 'RU', score: 85 },
    { country: 'India', code: 'IN', score: 55 },
  ],
};

// Mock stats
const MOCK_STATS: DashboardStats = {
  riskScore: { overall: 38, level: 'Low' },
  compliance: { rate: 82 },
  assessments: { active: 5 },
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch stats from dashboard endpoint
        const statsRes = await fetch('/api/dashboard/stats');

        if (!statsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const statsJson = await statsRes.json();
        const dashboardStats = statsJson.data;

        // Add Array.isArray validation for all arrays
        const safeComplianceScores = Array.isArray(dashboardStats.categoryScores) ? dashboardStats.categoryScores : [];
        const safeRecentActivity = Array.isArray(dashboardStats.recentActivity) ? dashboardStats.recentActivity : [];
        const safeRiskDestinations = Array.isArray(dashboardStats.topRiskDestinations) ? dashboardStats.topRiskDestinations : [];

        // Transform dashboard stats into the expected format for this page
        const reportData: ReportData = {
          riskScoreTrend: Array.isArray(safeComplianceScores) ? [
            { date: '7 days ago', score: 45 },
            { date: '6 days ago', score: 42 },
            { date: '5 days ago', score: 48 },
            { date: '4 days ago', score: 44 },
            { date: '3 days ago', score: 40 },
            { date: '2 days ago', score: 42 },
            { date: 'Today', score: dashboardStats.riskScore?.overall || 38 },
          ] : MOCK_REPORT_DATA.riskScoreTrend,
          complianceByFramework: safeComplianceScores.length > 0 ? safeComplianceScores.map((cat: any) => ({
            framework: cat.category,
            implemented: Math.round((cat.score / 100) * cat.controlCount),
            total: cat.controlCount,
          })) : MOCK_REPORT_DATA.complianceByFramework,
          agentActivity: safeRecentActivity.length > 0 ? safeRecentActivity.map((activity: any) => ({
            agent: activity.agent,
            status: activity.status,
            latencyMs: activity.latencyMs,
            timestamp: activity.timestamp,
          })) : MOCK_REPORT_DATA.agentActivity,
          travelRiskByCountry: safeRiskDestinations.length > 0 ? safeRiskDestinations.map((dest: any) => ({
            country: dest.country,
            code: dest.code,
            score: dest.score,
          })) : MOCK_REPORT_DATA.travelRiskByCountry,
        };

        const pageStats: DashboardStats = {
          riskScore: {
            overall: dashboardStats.riskScore?.overall || MOCK_STATS.riskScore.overall,
            level: dashboardStats.riskScore?.level || MOCK_STATS.riskScore.level,
          },
          compliance: {
            rate: dashboardStats.compliance?.rate || MOCK_STATS.compliance.rate,
          },
          assessments: {
            active: dashboardStats.assessments?.active || MOCK_STATS.assessments.active,
          },
        };

        setReportData(reportData);
        setStats(pageStats);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reports');
        // Fallback to mock data on error
        setReportData(MOCK_REPORT_DATA);
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: displayStats || MOCK_STATS,
      reportData: displayReportData || MOCK_REPORT_DATA,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grc-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Use mock data if API fails
  const displayReportData = reportData || MOCK_REPORT_DATA;
  const displayStats = stats || MOCK_STATS;

  if (error && !reportData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load reports (using mock data)</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  // Ensure all arrays are valid before calculating max values
  const safeTrendScores = Array.isArray(displayReportData.riskScoreTrend) ? displayReportData.riskScoreTrend : [];
  const safeAgentActivity = Array.isArray(displayReportData.agentActivity) ? displayReportData.agentActivity : [];
  const safeTravelRisks = Array.isArray(displayReportData.travelRiskByCountry) ? displayReportData.travelRiskByCountry : [];
  const safeCompliance = Array.isArray(displayReportData.complianceByFramework) ? displayReportData.complianceByFramework : [];

  // Calculate max values for bar charts
  const maxTrendScore = safeTrendScores.length > 0 ? Math.max(...safeTrendScores.map((d) => d.score), 100) : 100;
  const maxComplianceRate = 100;
  const maxLatency = safeAgentActivity.length > 0 ? Math.max(...safeAgentActivity.map((a) => a.latencyMs), 1000) : 1000;
  const maxTravelScore = safeTravelRisks.length > 0 ? Math.max(...safeTravelRisks.map((c) => c.score), 100) : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Advanced Reports</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive GRC assessment and risk analysis dashboard
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export as JSON
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600">
          <p className="text-sm font-medium text-gray-600 mb-2">Overall Risk Score</p>
          <p className="text-4xl font-bold text-indigo-600">{displayStats.riskScore.overall}</p>
          <p className="text-xs text-gray-600 mt-2">Level: {displayStats.riskScore.level}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-gray-600 mb-2">Compliance Rate</p>
          <p className="text-4xl font-bold text-emerald-600">{displayStats.compliance.rate}%</p>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${displayStats.compliance.rate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-600 mb-2">Active Assessments</p>
          <p className="text-4xl font-bold text-blue-600">{displayStats.assessments.active}</p>
          <p className="text-xs text-gray-600 mt-2">In Progress</p>
        </div>
      </div>

      {/* Risk Score Trend Chart */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Score Trend (Last 7 Days)</h2>

        <div className="space-y-4">
          {safeTrendScores.map((item, idx) => {
            const percentage = (item.score / maxTrendScore) * 100;
            const riskColor =
              item.score >= 75
                ? 'bg-red-500'
                : item.score >= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.date}</span>
                  <span className="text-sm font-bold text-gray-900">{item.score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${riskColor} h-3 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance by Framework */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance by Framework</h2>

        <div className="space-y-6">
          {safeCompliance.map((framework, idx) => {
            const percentage = (framework.implemented / framework.total) * 100;

            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{framework.framework}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {framework.implemented} of {framework.total} controls implemented
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      percentage >= 75
                        ? 'bg-emerald-600'
                        : percentage >= 50
                          ? 'bg-amber-600'
                          : 'bg-red-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Activity Feed */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Agent Activity Timeline</h2>

        <div className="space-y-4">
          {safeAgentActivity.map((activity, idx) => {
            const statusColor =
              activity.status === 'success'
                ? 'bg-emerald-100 text-emerald-800'
                : activity.status === 'running'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800';

            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-gray-900">{activity.agent}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                        {activity.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">Latency:</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${(activity.latencyMs / maxLatency) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs">{activity.latencyMs}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel Risk Heatmap */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Risk Heatmap</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {safeTravelRisks.map((country, idx) => {
            const percentage = (country.score / maxTravelScore) * 100;
            const bgColor =
              country.score >= 75
                ? 'bg-red-100 border-red-300'
                : country.score >= 50
                  ? 'bg-amber-100 border-amber-300'
                  : 'bg-emerald-100 border-emerald-300';

            const textColor =
              country.score >= 75
                ? 'text-red-700'
                : country.score >= 50
                  ? 'text-amber-700'
                  : 'text-emerald-700';

            return (
              <div key={idx} className={`rounded-lg border-2 ${bgColor} p-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{country.country}</p>
                    <p className="text-xs text-gray-600">{country.code}</p>
                  </div>
                  <span className={`text-2xl font-bold ${textColor}`}>{country.score}</span>
                </div>

                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className={`${
                      country.score >= 75
                        ? 'bg-red-600'
                        : country.score >= 50
                          ? 'bg-amber-600'
                          : 'bg-emerald-600'
                    } h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Info */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-900 mb-2">Export Data</h3>
        <p className="text-sm text-indigo-800 mb-4">
          Click the export button at the top to download all report data as JSON for further
          analysis or integration with other tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
          <div>
            <p className="font-medium mb-2">Risk Score Trend: {safeTrendScores.length} data points</p>
            <p className="font-medium">Frameworks: {safeCompliance.length} frameworks</p>
          </div>
          <div>
            <p className="font-medium mb-2">Agent Activity: {safeAgentActivity.length} activities</p>
            <p className="font-medium">Countries: {safeTravelRisks.length} destinations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
