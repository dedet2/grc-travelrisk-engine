import type { TestResult } from './uat-runner';

interface ApiEndpointConfig {
  path: string;
  method: 'GET' | 'POST';
  description: string;
  expectedFields?: string[];
}

const API_ENDPOINTS: ApiEndpointConfig[] = [
  { path: '/api/dashboard/kpis', method: 'GET', description: 'Dashboard KPIs' },
  { path: '/api/dashboard/widgets', method: 'GET', description: 'Dashboard Widgets' },
  { path: '/api/dashboard/stats', method: 'GET', description: 'Dashboard Stats' },
  { path: '/api/agents', method: 'GET', description: 'List Agents' },
  { path: '/api/agents/communicate', method: 'POST', description: 'Agent Communication' },
  { path: '/api/agents/handoffs', method: 'POST', description: 'Agent Handoffs' },
  { path: '/api/agents/status', method: 'GET', description: 'Agent Status' },
  { path: '/api/agents/run-all', method: 'POST', description: 'Run All Agents' },
  { path: '/api/rbac', method: 'GET', description: 'RBAC Configuration' },
  { path: '/api/risk-scoring', method: 'POST', description: 'Risk Scoring' },
  { path: '/api/controls', method: 'GET', description: 'Controls Management' },
  { path: '/api/vendors', method: 'GET', description: 'Vendor Management' },
  { path: '/api/incidents', method: 'GET', description: 'Incident Management' },
  { path: '/api/compliance-gaps', method: 'GET', description: 'Compliance Gaps' },
  { path: '/api/assessments', method: 'GET', description: 'Assessments' },
  { path: '/api/policies', method: 'GET', description: 'Policies' },
  { path: '/api/reports/generate', method: 'POST', description: 'Report Generation' },
  { path: '/api/reports', method: 'GET', description: 'List Reports' },
  { path: '/api/sla', method: 'GET', description: 'SLA Tracking' },
  { path: '/api/training', method: 'GET', description: 'Training Modules' },
  { path: '/api/search', method: 'GET', description: 'Search' },
  { path: '/api/notifications/preferences', method: 'GET', description: 'Notification Preferences' },
  { path: '/api/billing/subscriptions', method: 'GET', description: 'Billing Subscriptions' },
  { path: '/api/billing/pricing', method: 'GET', description: 'Billing Pricing' },
  { path: '/api/billing', method: 'GET', description: 'Billing Data' },
  { path: '/api/integrations/status', method: 'GET', description: 'Integration Status' },
  { path: '/api/integrations', method: 'GET', description: 'Integrations List' },
  { path: '/api/integrations/airtable', method: 'GET', description: 'Airtable Integration' },
  { path: '/api/integrations/make', method: 'GET', description: 'Make Integration' },
  { path: '/api/integrations/slack', method: 'GET', description: 'Slack Integration' },
  { path: '/api/integrations/vibekanban', method: 'GET', description: 'VibeKanban Integration' },
  { path: '/api/integrations/podia', method: 'GET', description: 'Podia Integration' },
  { path: '/api/integrations/perplexity', method: 'GET', description: 'Perplexity Integration' },
  { path: '/api/integrations/calendly', method: 'GET', description: 'Calendly Integration' },
  { path: '/api/integrations/klenty', method: 'GET', description: 'Klenty Integration' },
  { path: '/api/metrics', method: 'GET', description: 'Metrics' },
  { path: '/api/data-export', method: 'GET', description: 'Data Export' },
  { path: '/api/health/check', method: 'GET', description: 'Health Check' },
  { path: '/api/health', method: 'GET', description: 'Health Status' },
  { path: '/api/docs', method: 'GET', description: 'API Documentation' },
  { path: '/api/events', method: 'GET', description: 'Events' },
  { path: '/api/frameworks', method: 'GET', description: 'GRC Frameworks' },
  { path: '/api/frameworks/ingest', method: 'POST', description: 'Framework Ingestion' },
  { path: '/api/travel-risk', method: 'GET', description: 'Travel Risk Assessment' },
  { path: '/api/notifications', method: 'GET', description: 'Notifications' },
  { path: '/api/admin/audit-log', method: 'GET', description: 'Audit Log' },
];

function isValidApiResponse(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const response = data as Record<string, unknown>;

  return (
    typeof response.success === 'boolean' &&
    (response.data !== undefined || response.error !== undefined)
  );
}

export async function testApiEndpoints(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const baseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

  for (const endpoint of API_ENDPOINTS) {
    const testName = `${endpoint.method} ${endpoint.path} - ${endpoint.description}`;

    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.TEST_AUTH_TOKEN && {
            Authorization: `Bearer ${process.env.TEST_AUTH_TOKEN}`,
          }),
        },
      };

      if (endpoint.method === 'POST') {
        options.body = JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        });
      }

      const response = await fetch(`${baseUrl}${endpoint.path}`, options);

      const isSuccessStatus = response.status >= 200 && response.status < 300;

      let responseData: unknown = null;
      try {
        responseData = await response.json();
      } catch {
        responseData = { success: false, error: 'Invalid JSON response' };
      }

      if (!isSuccessStatus) {
        results.push({
          pass: false,
          name: testName,
          details: `HTTP ${response.status} - Expected 2xx status code`,
        });
        continue;
      }

      if (!isValidApiResponse(responseData)) {
        results.push({
          pass: false,
          name: testName,
          details: `Invalid response format - missing success or data/error fields`,
        });
        continue;
      }

      const responseObj = responseData as Record<string, unknown>;

      if (!responseObj.success) {
        results.push({
          pass: false,
          name: testName,
          details: `Response success flag is false: ${responseObj.error || 'Unknown error'}`,
        });
        continue;
      }

      results.push({
        pass: true,
        name: testName,
        details: 'Valid response structure and HTTP status',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        pass: false,
        name: testName,
        details: `Network error: ${errorMessage}`,
      });
    }
  }

  return results;
}
