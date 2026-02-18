#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/src/__tests__/uat"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   GRC TravelRisk Engine - UAT Test Suite Execution v1.0       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Project Root: $PROJECT_ROOT"
echo "Report Directory: $REPORT_DIR"
echo "Timestamp: $TIMESTAMP"
echo ""

export TEST_API_URL="${TEST_API_URL:-http://localhost:3000}"
export NODE_ENV="${NODE_ENV:-test}"

if [ ! -f "$PROJECT_ROOT/package.json" ]; then
  echo "ERROR: package.json not found at $PROJECT_ROOT"
  exit 1
fi

echo "📦 Installing dependencies..."
cd "$PROJECT_ROOT"
npm install > /dev/null 2>&1 || true

echo "🧪 Running UAT Test Suites..."
echo ""

if command -v npx &> /dev/null; then
  npx tsx "$REPORT_DIR/index.ts" 2>&1 | tee "$REPORT_DIR/UAT-RESULTS-${TIMESTAMP}.log"
  TEST_EXIT_CODE=${PIPESTATUS[0]}
else
  echo "ERROR: npx not found. Please ensure Node.js is installed."
  exit 1
fi

if [ -f "$REPORT_DIR/UAT-TEST-RESULTS.json" ]; then
  echo ""
  echo "📊 Test results saved to: $REPORT_DIR/UAT-TEST-RESULTS.json"

  SUMMARY=$(npx tsx -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('$REPORT_DIR/UAT-TEST-RESULTS.json', 'utf8'));
    console.log('Total: ' + data.summary.total);
    console.log('Passed: ' + data.summary.passed);
    console.log('Failed: ' + data.summary.failed);
    console.log('Pass Rate: ' + data.summary.passRate + '%');
    console.log('PRD Coverage: ' + data.summary.prdCoverage + '%');
  " 2>/dev/null || true)

  if [ ! -z "$SUMMARY" ]; then
    echo ""
    echo "Quick Summary:"
    echo "$SUMMARY"
  fi
fi

echo ""
echo "✓ UAT test execution completed"
echo ""

if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✓ All tests passed!"
  exit 0
else
  echo "✗ Some tests failed. Check the log for details."
  exit 1
fi
