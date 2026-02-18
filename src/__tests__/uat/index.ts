import { registerCategory, runAllTests } from './uat-runner';
import { testApiEndpoints } from './api-endpoints.test';
import { testPrdCoverage } from './prd-coverage.test';
import { testIntegrations } from './integration-tests.test';
import { testDashboard } from './dashboard-tests.test';

registerCategory('API Endpoints (50+)', testApiEndpoints);
registerCategory('PRD Coverage (34+ requirements)', testPrdCoverage);
registerCategory('Integration Connectors (9+)', testIntegrations);
registerCategory('Dashboard Pages (10+)', testDashboard);

export async function runUAT() {
  return runAllTests();
}

if (require.main === module) {
  runUAT().catch((error) => {
    console.error('UAT execution failed:', error);
    process.exit(1);
  });
}
