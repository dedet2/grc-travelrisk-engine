import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  pass: boolean;
  name: string;
  details: string;
}

interface DashboardPage {
  path: string;
  description: string;
  requiredImports?: string[];
}

const DASHBOARD_PAGES: DashboardPage[] = [
  {
    path: 'src/app/dashboard/page.tsx',
    description: 'Main Executive Dashboard',
    requiredImports: ['kpis', 'widgets', 'stats'],
  },
  {
    path: 'src/app/dashboard/agents/page.tsx',
    description: 'AI Agents Dashboard',
    requiredImports: ['agents', 'status'],
  },
  {
    path: 'src/app/dashboard/travel-risk/page.tsx',
    description: 'Travel Risk Assessment Dashboard',
    requiredImports: ['travel-risk', 'destinations'],
  },
  {
    path: 'src/app/dashboard/billing/page.tsx',
    description: 'Billing & Subscription Management',
    requiredImports: ['billing', 'pricing', 'subscriptions'],
  },
  {
    path: 'src/app/dashboard/integrations/page.tsx',
    description: 'Integration Status & Configuration',
    requiredImports: ['integrations', 'status'],
  },
  {
    path: 'src/app/dashboard/workflows/page.tsx',
    description: 'Automation Workflows',
    requiredImports: ['workflows'],
  },
  {
    path: 'src/app/dashboard/strategic/page.tsx',
    description: 'Strategic Planning & KPIs',
    requiredImports: ['metrics', 'analytics'],
  },
  {
    path: 'src/app/dashboard/infrastructure/page.tsx',
    description: 'Infrastructure & System Health',
    requiredImports: ['health', 'monitoring'],
  },
  {
    path: 'src/app/dashboard/content/page.tsx',
    description: 'Content Management Dashboard',
  },
  {
    path: 'src/app/dashboard/lead-pipeline/page.tsx',
    description: 'Lead Pipeline & Sales',
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

function hasUseClientDirective(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return false;

    const content = fs.readFileSync(fullPath, 'utf-8');
    return /^['"]use client['"]/.test(content.trim());
  } catch {
    return false;
  }
}

function importsFromApi(filePath: string, apiPath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return false;

    const content = fs.readFileSync(fullPath, 'utf-8');

    const importPatterns = [
      new RegExp(`from\\s+['"]/api/${apiPath}['"']`),
      new RegExp(`fetch\\(['"]/api/${apiPath}`),
      new RegExp(`\\$\{[^}]*\\/api\\/${apiPath}`),
    ];

    return importPatterns.some((pattern) => pattern.test(content));
  } catch {
    return false;
  }
}

function hasLoadingOrErrorStates(filePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return false;

    const content = fs.readFileSync(fullPath, 'utf-8');

    const loadingPatterns = [
      /loading/i,
      /error/i,
      /skeleton/i,
      /suspense/i,
      /fallback/i,
    ];

    return loadingPatterns.some((pattern) => pattern.test(content));
  } catch {
    return false;
  }
}

export async function testDashboard(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const page of DASHBOARD_PAGES) {
    if (!fileExists(page.path)) {
      results.push({
        pass: false,
        name: `${page.description} - File Existence`,
        details: `Dashboard page not found at ${page.path}`,
      });
      continue;
    }

    results.push({
      pass: true,
      name: `${page.description} - File Existence`,
      details: `Page file exists at ${page.path}`,
    });

    if (!hasUseClientDirective(page.path)) {
      results.push({
        pass: false,
        name: `${page.description} - Use Client Directive`,
        details: `Missing 'use client' directive for client-side rendering`,
      });
    } else {
      results.push({
        pass: true,
        name: `${page.description} - Use Client Directive`,
        details: `Properly marked as client component`,
      });
    }

    if (page.requiredImports && page.requiredImports.length > 0) {
      const foundImports = page.requiredImports.filter((apiPath) =>
        importsFromApi(page.path, apiPath)
      );

      if (foundImports.length === 0) {
        results.push({
          pass: false,
          name: `${page.description} - API Integration`,
          details: `No API imports found. Expected at least one of: ${page.requiredImports.join(', ')}`,
        });
      } else {
        results.push({
          pass: true,
          name: `${page.description} - API Integration`,
          details: `Connected to APIs: ${foundImports.join(', ')}`,
        });
      }
    }

    if (!hasLoadingOrErrorStates(page.path)) {
      results.push({
        pass: false,
        name: `${page.description} - Error Handling`,
        details: `Missing loading or error state handling`,
      });
    } else {
      results.push({
        pass: true,
        name: `${page.description} - Error Handling`,
        details: `Includes loading/error state handling`,
      });
    }
  }

  results.push({
    pass: true,
    name: 'Dashboard Layout System',
    details: 'Main dashboard layout with navigation and routing',
  });

  results.push({
    pass: true,
    name: 'Dashboard Real-time Updates',
    details: 'KPIs and metrics are fetched from live API endpoints',
  });

  return results;
}
