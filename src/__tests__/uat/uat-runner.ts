import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  pass: boolean;
  name: string;
  details: string;
  category?: string;
  duration?: number;
}

interface TestCategory {
  name: string;
  tests: () => Promise<TestResult[]>;
}

const categories: TestCategory[] = [];

export function registerCategory(name: string, tests: () => Promise<TestResult[]>) {
  categories.push({ name, tests });
}

export function createTestResult(
  pass: boolean,
  name: string,
  details: string,
  category?: string
): TestResult {
  return { pass, name, details, category };
}

export async function runAllTests(): Promise<{
  results: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    prdCoverage: number;
    byCategory: Record<string, { total: number; passed: number; percentage: number }>;
    duration: number;
  };
}> {
  const startTime = Date.now();
  const allResults: TestResult[] = [];
  const categoryStats: Record<string, { total: number; passed: number }> = {};

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║     GRC TravelRisk Engine - UAT Test Suite Runner v1.0        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  for (const category of categories) {
    console.log(`\n📋 Running ${category.name}...`);
    const startCategoryTime = Date.now();

    try {
      const results = await category.tests();
      allResults.push(...results);

      const passed = results.filter((r) => r.pass).length;
      const total = results.length;
      categoryStats[category.name] = { total, passed };

      const percentage = ((passed / total) * 100).toFixed(1);
      const status = passed === total ? '✓' : '✗';
      console.log(`  ${status} ${category.name}: ${passed}/${total} tests passed (${percentage}%)`);

      results.forEach((result) => {
        if (!result.pass) {
          console.log(`    ✗ ${result.name}: ${result.details}`);
        }
      });
    } catch (error) {
      console.error(`  ✗ Error running ${category.name}:`, error);
      categoryStats[category.name] = { total: 0, passed: 0 };
    }
  }

  const duration = Date.now() - startTime;
  const total = allResults.length;
  const passed = allResults.filter((r) => r.pass).length;
  const failed = total - passed;
  const passRate = total > 0 ? (passed / total) * 100 : 0;

  const prdCoverage = calculatePrdCoverage(allResults);

  const summary = {
    total,
    passed,
    failed,
    passRate: parseFloat(passRate.toFixed(2)),
    prdCoverage: parseFloat(prdCoverage.toFixed(2)),
    byCategory: Object.entries(categoryStats).reduce(
      (acc, [name, stats]) => ({
        ...acc,
        [name]: {
          total: stats.total,
          passed: stats.passed,
          percentage: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0,
        },
      }),
      {}
    ),
    duration,
  };

  printSummary(summary);
  generateReport(allResults, summary);

  return { results: allResults, summary };
}

function calculatePrdCoverage(results: TestResult[]): number {
  const prdResults = results.filter((r) => r.category === 'PRD Coverage');
  if (prdResults.length === 0) return 0;
  return (prdResults.filter((r) => r.pass).length / prdResults.length) * 100;
}

function printSummary(summary: {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  prdCoverage: number;
  byCategory: Record<string, { total: number; passed: number; percentage: number }>;
  duration: number;
}): void {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY REPORT                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`Total Tests:          ${summary.total}`);
  console.log(`Passed:               ${summary.passed} ✓`);
  console.log(`Failed:               ${summary.failed} ✗`);
  console.log(`Pass Rate:            ${summary.passRate.toFixed(2)}%`);
  console.log(`PRD Coverage:         ${summary.prdCoverage.toFixed(2)}%`);
  console.log(`Duration:             ${(summary.duration / 1000).toFixed(2)}s\n`);

  console.log('By Category:');
  Object.entries(summary.byCategory).forEach(([name, stats]) => {
    const percentage = stats.total > 0 ? stats.percentage : 0;
    const status = stats.passed === stats.total ? '✓' : '✗';
    console.log(`  ${status} ${name}: ${stats.passed}/${stats.total} (${percentage.toFixed(1)}%)`);
  });

  console.log('\n');
}

function generateReport(
  results: TestResult[],
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    prdCoverage: number;
    byCategory: Record<string, { total: number; passed: number; percentage: number }>;
    duration: number;
  }
): void {
  const reportPath = path.join(process.cwd(), 'src/__tests__/uat/UAT-TEST-RESULTS.json');

  const report = {
    timestamp: new Date().toISOString(),
    summary,
    results: results.map((r) => ({
      pass: r.pass,
      name: r.name,
      details: r.details,
      category: r.category || 'general',
    })),
  };

  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    console.error('Failed to write report:', error);
  }
}

export async function main() {
  const result = await runAllTests();
  process.exit(result.summary.failed > 0 ? 1 : 0);
}
