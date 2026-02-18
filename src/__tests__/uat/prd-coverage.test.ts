import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  pass: boolean;
  name: string;
  details: string;
  category?: string;
}

interface PrdRequirement {
  feature: string;
  requirement: string;
  files: string[];
  apiEndpoints: string[];
  notes?: string;
}

const PRD_REQUIREMENTS: PrdRequirement[] = [
  {
    feature: 'Core GRC Framework Management',
    requirement: 'Support NIST, ISO 27001, SOC 2, GDPR frameworks',
    files: [
      'src/app/api/frameworks/route.ts',
      'src/app/api/frameworks/[id]/route.ts',
      'src/app/api/frameworks/ingest/route.ts',
      'src/lib/frameworks/framework-engine.ts',
    ],
    apiEndpoints: ['/api/frameworks', '/api/frameworks/[id]', '/api/frameworks/ingest'],
    notes: 'Support ingestion and management of compliance frameworks',
  },
  {
    feature: 'Travel Risk Assessment Engine',
    requirement: 'Real-time travel risk scoring and destination analysis',
    files: [
      'src/app/api/travel-risk/route.ts',
      'src/app/api/travel/destinations/route.ts',
      'src/app/api/travel/destinations/[code]/route.ts',
      'src/app/api/travel/trips/route.ts',
      'src/lib/agents/travel-risk-agent.ts',
    ],
    apiEndpoints: [
      '/api/travel-risk',
      '/api/travel/destinations',
      '/api/travel/destinations/[code]',
      '/api/travel/trips',
    ],
  },
  {
    feature: '34 AI Agents',
    requirement: 'Support 34 AI agents across 7 categories',
    files: [
      'src/app/api/agents/route.ts',
      'src/app/api/agents/communicate/route.ts',
      'src/app/api/agents/handoffs/route.ts',
      'src/lib/agents/agent-registry.ts',
      'src/lib/agent-communication/bus.ts',
    ],
    apiEndpoints: ['/api/agents', '/api/agents/communicate', '/api/agents/handoffs'],
    notes: '34 agents across Risk, Compliance, Travel, Operations, Finance, Security, and Strategy',
  },
  {
    feature: 'CRM Integration with Airtable',
    requirement: 'Sync contacts, leads, and opportunities with Airtable',
    files: [
      'src/app/api/integrations/airtable/route.ts',
      'src/lib/integrations/airtable-connector.ts',
    ],
    apiEndpoints: ['/api/integrations/airtable'],
  },
  {
    feature: 'Automation via Make.com',
    requirement: 'Connect workflows and automate processes',
    files: [
      'src/app/api/integrations/make/route.ts',
      'src/lib/integrations/make-connector.ts',
      'src/app/api/webhooks/make/route.ts',
    ],
    apiEndpoints: ['/api/integrations/make', '/api/webhooks/make'],
  },
  {
    feature: 'Slack Notifications',
    requirement: 'Send real-time notifications to Slack channels',
    files: [
      'src/app/api/integrations/slack/route.ts',
      'src/lib/integrations/slack-connector.ts',
    ],
    apiEndpoints: ['/api/integrations/slack'],
  },
  {
    feature: 'VibeKanban Project Management',
    requirement: 'Manage projects and tasks in VibeKanban',
    files: [
      'src/app/api/integrations/vibekanban/route.ts',
      'src/lib/integrations/vibekanban-connector.ts',
    ],
    apiEndpoints: ['/api/integrations/vibekanban'],
  },
  {
    feature: 'Podia Client Portal',
    requirement: 'Client self-service portal and course delivery',
    files: [
      'src/app/api/integrations/podia/route.ts',
      'src/lib/integrations/podia-connector.ts',
      'src/app/api/webhooks/podia/route.ts',
    ],
    apiEndpoints: ['/api/integrations/podia', '/api/webhooks/podia'],
  },
  {
    feature: 'Perplexity Pro AI Research',
    requirement: 'AI-powered research and analysis capabilities',
    files: [
      'src/app/api/integrations/perplexity/route.ts',
      'src/lib/integrations/perplexity-connector.ts',
    ],
    apiEndpoints: ['/api/integrations/perplexity'],
  },
  {
    feature: 'Calendly Scheduling',
    requirement: 'Integrate calendar scheduling and availability',
    files: [
      'src/app/api/integrations/calendly/route.ts',
      'src/lib/integrations/calendly-connector.ts',
      'src/app/api/calendar/route.ts',
    ],
    apiEndpoints: ['/api/integrations/calendly', '/api/calendar'],
  },
  {
    feature: 'Klenty SDRx Sales Automation',
    requirement: 'Sales development and automation platform',
    files: [
      'src/app/api/integrations/klenty/route.ts',
      'src/lib/integrations/klenty-connector.ts',
    ],
    apiEndpoints: ['/api/integrations/klenty'],
  },
  {
    feature: 'Replit Agent Deployment',
    requirement: 'Deploy and manage agents on Replit',
    files: [
      'src/lib/integrations/replit-connector.ts',
      'src/lib/deployment/replit-deployer.ts',
    ],
    apiEndpoints: [],
    notes: 'Deployment support for agents',
  },
  {
    feature: 'RBAC (5 Roles)',
    requirement: 'Role-Based Access Control with Admin, Manager, Analyst, Operator, Viewer roles',
    files: [
      'src/app/api/rbac/route.ts',
      'src/lib/rbac/role-manager.ts',
      'src/middleware.ts',
    ],
    apiEndpoints: ['/api/rbac'],
  },
  {
    feature: 'Billing - Starter Tier',
    requirement: 'Starter plan at $299/month',
    files: [
      'src/app/api/billing/pricing/route.ts',
      'src/app/api/billing/subscriptions/route.ts',
      'src/lib/billing/pricing-engine.ts',
    ],
    apiEndpoints: ['/api/billing/pricing', '/api/billing/subscriptions'],
  },
  {
    feature: 'Billing - Professional Tier',
    requirement: 'Professional plan at $799/month',
    files: [
      'src/app/api/billing/pricing/route.ts',
      'src/app/api/billing/subscriptions/route.ts',
    ],
    apiEndpoints: ['/api/billing/pricing', '/api/billing/subscriptions'],
  },
  {
    feature: 'Billing - Enterprise Tier',
    requirement: 'Enterprise plan at $2,499+/month',
    files: [
      'src/app/api/billing/pricing/route.ts',
      'src/app/api/billing/subscriptions/route.ts',
    ],
    apiEndpoints: ['/api/billing/pricing', '/api/billing/subscriptions'],
  },
  {
    feature: 'Executive Dashboard with Live KPIs',
    requirement: 'Real-time KPIs and executive metrics',
    files: [
      'src/app/api/dashboard/kpis/route.ts',
      'src/app/api/dashboard/widgets/route.ts',
      'src/app/dashboard/page.tsx',
    ],
    apiEndpoints: ['/api/dashboard/kpis', '/api/dashboard/widgets'],
  },
  {
    feature: 'Report Generation',
    requirement: 'Generate compliance, risk, executive, and travel-risk reports',
    files: [
      'src/app/api/reports/generate/route.ts',
      'src/app/api/reports/route.ts',
      'src/lib/reports/report-generator.ts',
    ],
    apiEndpoints: ['/api/reports/generate', '/api/reports'],
  },
  {
    feature: 'Vendor Risk Management',
    requirement: 'Track and assess vendor risk profiles',
    files: [
      'src/app/api/vendors/route.ts',
      'src/lib/vendors/vendor-risk-engine.ts',
    ],
    apiEndpoints: ['/api/vendors'],
  },
  {
    feature: 'Incident Management',
    requirement: 'Report, track, and resolve security incidents',
    files: [
      'src/app/api/incidents/route.ts',
      'src/lib/incidents/incident-manager.ts',
    ],
    apiEndpoints: ['/api/incidents'],
  },
  {
    feature: 'SLA Tracking',
    requirement: 'Monitor and report on SLA compliance',
    files: [
      'src/app/api/sla/route.ts',
      'src/lib/sla/sla-tracker.ts',
    ],
    apiEndpoints: ['/api/sla'],
  },
  {
    feature: 'Training Modules',
    requirement: 'Deliver compliance and security training',
    files: [
      'src/app/api/training/route.ts',
      'src/lib/training/training-engine.ts',
    ],
    apiEndpoints: ['/api/training'],
  },
  {
    feature: 'Control Management',
    requirement: 'Manage compliance controls and their status',
    files: [
      'src/app/api/controls/route.ts',
      'src/lib/controls/control-manager.ts',
    ],
    apiEndpoints: ['/api/controls'],
  },
  {
    feature: 'Risk Scoring Engine',
    requirement: 'Calculate overall risk scores based on multiple factors',
    files: [
      'src/app/api/risk-scoring/route.ts',
      'src/lib/scoring/risk-scorer.ts',
    ],
    apiEndpoints: ['/api/risk-scoring'],
  },
  {
    feature: 'Compliance Gaps Analysis',
    requirement: 'Identify and report compliance gaps',
    files: [
      'src/app/api/compliance-gaps/route.ts',
      'src/lib/compliance/gap-analyzer.ts',
    ],
    apiEndpoints: ['/api/compliance-gaps'],
  },
  {
    feature: 'Assessment Management',
    requirement: 'Conduct security and compliance assessments',
    files: [
      'src/app/api/assessments/route.ts',
      'src/app/api/assessments/[id]/route.ts',
      'src/lib/assessments/assessment-engine.ts',
    ],
    apiEndpoints: ['/api/assessments', '/api/assessments/[id]'],
  },
  {
    feature: 'Policy Management',
    requirement: 'Create, update, and manage compliance policies',
    files: [
      'src/app/api/policies/route.ts',
      'src/lib/policies/policy-manager.ts',
    ],
    apiEndpoints: ['/api/policies'],
  },
  {
    feature: 'Search Functionality',
    requirement: 'Full-text search across all entities',
    files: [
      'src/app/api/search/route.ts',
      'src/lib/search/search-engine.ts',
    ],
    apiEndpoints: ['/api/search'],
  },
  {
    feature: 'Notification System',
    requirement: 'User notification preferences and delivery',
    files: [
      'src/app/api/notifications/preferences/route.ts',
      'src/app/api/notifications/route.ts',
      'src/lib/notifications/notification-engine.ts',
    ],
    apiEndpoints: ['/api/notifications/preferences', '/api/notifications'],
  },
  {
    feature: 'Integration Health Monitoring',
    requirement: 'Monitor health and status of all integrations',
    files: [
      'src/app/api/integrations/status/route.ts',
      'src/app/api/admin/integrations/health/route.ts',
    ],
    apiEndpoints: ['/api/integrations/status', '/api/admin/integrations/health'],
  },
  {
    feature: 'Health Check & Monitoring',
    requirement: 'System health checks and metrics',
    files: [
      'src/app/api/health/check/route.ts',
      'src/app/api/health/route.ts',
      'src/app/api/monitoring/route.ts',
    ],
    apiEndpoints: ['/api/health/check', '/api/health', '/api/monitoring'],
  },
  {
    feature: 'Metrics and Analytics',
    requirement: 'Collect and report on system metrics',
    files: [
      'src/app/api/metrics/route.ts',
      'src/app/api/analytics/route.ts',
    ],
    apiEndpoints: ['/api/metrics', '/api/analytics'],
  },
  {
    feature: 'Data Export',
    requirement: 'Export data in multiple formats',
    files: [
      'src/app/api/data-export/route.ts',
      'src/lib/export/export-engine.ts',
    ],
    apiEndpoints: ['/api/data-export'],
  },
];

function fileExists(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

export async function testPrdCoverage(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const requirement of PRD_REQUIREMENTS) {
    const requirementName = `${requirement.feature}: ${requirement.requirement}`;

    const filesExist = requirement.files.every((file) => fileExists(file));
    const missingFiles = requirement.files.filter((file) => !fileExists(file));

    if (!filesExist) {
      results.push({
        pass: false,
        name: requirementName,
        details: `Missing implementation files: ${missingFiles.join(', ')}`,
        category: 'PRD Coverage',
      });
      continue;
    }

    results.push({
      pass: true,
      name: requirementName,
      details: `All required files present. Endpoints: ${requirement.apiEndpoints.join(', ') || 'N/A'}`,
      category: 'PRD Coverage',
    });
  }

  return results;
}
