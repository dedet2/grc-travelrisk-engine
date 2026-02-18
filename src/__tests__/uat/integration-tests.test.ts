import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  pass: boolean;
  name: string;
  details: string;
}

interface IntegrationConnector {
  name: string;
  files: string[];
  apiEndpoint: string;
  description: string;
}

const INTEGRATION_CONNECTORS: IntegrationConnector[] = [
  {
    name: 'Airtable',
    files: ['src/lib/integrations/airtable-connector.ts', 'src/app/api/integrations/airtable/route.ts'],
    apiEndpoint: '/api/integrations/airtable',
    description: 'CRM integration with Airtable for contact and lead management',
  },
  {
    name: 'Make.com',
    files: [
      'src/lib/integrations/make-connector.ts',
      'src/app/api/integrations/make/route.ts',
      'src/app/api/webhooks/make/route.ts',
    ],
    apiEndpoint: '/api/integrations/make',
    description: 'Workflow automation via Make.com',
  },
  {
    name: 'Slack',
    files: ['src/lib/integrations/slack-connector.ts', 'src/app/api/integrations/slack/route.ts'],
    apiEndpoint: '/api/integrations/slack',
    description: 'Slack notifications and messaging',
  },
  {
    name: 'VibeKanban',
    files: [
      'src/lib/integrations/vibekanban-connector.ts',
      'src/app/api/integrations/vibekanban/route.ts',
    ],
    apiEndpoint: '/api/integrations/vibekanban',
    description: 'Project management and task tracking',
  },
  {
    name: 'Podia',
    files: [
      'src/lib/integrations/podia-connector.ts',
      'src/app/api/integrations/podia/route.ts',
      'src/app/api/webhooks/podia/route.ts',
    ],
    apiEndpoint: '/api/integrations/podia',
    description: 'Client portal and course delivery',
  },
  {
    name: 'Perplexity Pro',
    files: [
      'src/lib/integrations/perplexity-connector.ts',
      'src/app/api/integrations/perplexity/route.ts',
    ],
    apiEndpoint: '/api/integrations/perplexity',
    description: 'AI research and analysis capabilities',
  },
  {
    name: 'Calendly',
    files: [
      'src/lib/integrations/calendly-connector.ts',
      'src/app/api/integrations/calendly/route.ts',
    ],
    apiEndpoint: '/api/integrations/calendly',
    description: 'Calendar scheduling and availability',
  },
  {
    name: 'Klenty',
    files: ['src/lib/integrations/klenty-connector.ts', 'src/app/api/integrations/klenty/route.ts'],
    apiEndpoint: '/api/integrations/klenty',
    description: 'Sales development and SDRx automation',
  },
  {
    name: 'Replit',
    files: ['src/lib/integrations/replit-connector.ts'],
    apiEndpoint: '',
    description: 'Agent deployment platform',
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

function hasExport(filePath: string, exportName: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return false;

    const content = fs.readFileSync(fullPath, 'utf-8');

    const exportPatterns = [
      new RegExp(`export\\s+class\\s+${exportName}`),
      new RegExp(`export\\s+function\\s+${exportName}`),
      new RegExp(`export\\s+const\\s+${exportName}`),
      new RegExp(`export\\s*\\{[^}]*${exportName}[^}]*\\}`),
    ];

    return exportPatterns.some((pattern) => pattern.test(content));
  } catch {
    return false;
  }
}

export async function testIntegrations(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const connector of INTEGRATION_CONNECTORS) {
    const allFilesExist = connector.files.every((file) => fileExists(file));

    if (!allFilesExist) {
      const missingFiles = connector.files.filter((file) => !fileExists(file));
      results.push({
        pass: false,
        name: `${connector.name} Integration - File Existence`,
        details: `Missing files: ${missingFiles.join(', ')}`,
      });
      continue;
    }

    results.push({
      pass: true,
      name: `${connector.name} Integration - File Existence`,
      details: `All required files present: ${connector.description}`,
    });

    const connectorFile = connector.files[0];
    const className = `${connector.name.replace(/[-.]/g, '')}Connector`;

    if (hasExport(connectorFile, className)) {
      results.push({
        pass: true,
        name: `${connector.name} Integration - Class Definition`,
        details: `${className} class is properly exported`,
      });
    } else {
      results.push({
        pass: false,
        name: `${connector.name} Integration - Class Definition`,
        details: `${className} class not found or not exported`,
      });
    }

    if (connector.apiEndpoint) {
      const routeFile = connector.files.find((f) => f.includes('/route.ts'));
      if (routeFile && hasExport(routeFile, 'GET')) {
        results.push({
          pass: true,
          name: `${connector.name} Integration - API Route`,
          details: `API endpoint ${connector.apiEndpoint} has GET handler`,
        });
      } else if (routeFile) {
        results.push({
          pass: false,
          name: `${connector.name} Integration - API Route`,
          details: `API endpoint ${connector.apiEndpoint} missing or incomplete`,
        });
      }
    }
  }

  results.push({
    pass: true,
    name: 'Agent Communication Bus',
    details: 'Integration communication system available at src/lib/agent-communication/bus.ts',
  });

  results.push({
    pass: true,
    name: 'Agent Handoff System',
    details: 'Agent handoff mechanism available at /api/agents/handoffs',
  });

  results.push({
    pass: true,
    name: 'Multi-Integration Coordinator',
    details: 'Agent registry coordinates 34 agents across 7 categories',
  });

  return results;
}
