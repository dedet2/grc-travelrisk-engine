# A-02 Risk Scoring Agent - Quick Start Guide

## Overview

The A-02 Risk Scoring Agent computes GRC risk scores (0-100) based on control assessment responses. **0 = perfect compliance, 100 = critical risk**.

## Score Ranges

| Score | Risk Level | Color  | Action            |
|-------|-----------|--------|-------------------|
| 0-25  | Low       | Green  | Acceptable        |
| 26-50 | Medium    | Amber  | Monitor closely   |
| 51-75 | High      | Red    | Remediate soon    |
| 76-100| Critical  | DarkRed| Urgent remediation|

## Files Created

| File | Purpose |
|------|---------|
| `src/types/assessment.ts` | Type definitions (ComplianceStatus, AssessmentResult, etc.) |
| `src/lib/scoring/risk-engine.ts` | Core scoring algorithm |
| `src/lib/scoring/recommendations.ts` | Remediation recommendations library |
| `src/app/api/assessments/route.ts` | Create & list assessments |
| `src/app/api/assessments/[id]/route.ts` | Get full assessment details |
| `src/app/api/assessments/[id]/score/route.ts` | Get score only (cached) |
| `tests/scoring/risk-engine.test.ts` | Comprehensive unit tests |
| `RISK_SCORING_AGENT.md` | Full documentation |

## API Endpoints

### 1. Submit Assessment & Get Score
```bash
POST /api/assessments
```

```json
{
  "frameworkId": "iso-27001",
  "name": "Q4 Assessment",
  "responses": [
    {
      "controlId": "ctrl-001",
      "status": "compliant",
      "notes": "MFA enabled",
      "evidence": "policy-doc.pdf"
    }
  ]
}
```

Response: `201 Created`
```json
{
  "assessmentId": "assess-123",
  "overallScore": 35,
  "riskLevel": "medium",
  "categoryScores": [...],
  "keyFindings": [...],
  "recommendations": [...],
  "confidence": 0.92
}
```

### 2. List User Assessments
```bash
GET /api/assessments?limit=50&offset=0&frameworkId=iso-27001&status=completed
```

Response: `200 OK` with paginated list

### 3. Get Full Assessment Details
```bash
GET /api/assessments/{id}
```

Response: `200 OK`
```json
{
  "assessment": {...},
  "scoreBreakdown": {
    "overallScore": 35,
    "categoryScores": [...],
    "keyFindings": [...],
    "recommendations": [...],
    "metrics": {
      "averageScore": 38,
      "criticalFindingsCount": 2,
      "highFindingsCount": 5
    }
  }
}
```

### 4. Get Score Only (Dashboard Polling)
```bash
GET /api/assessments/{id}/score
```

Response: `200 OK` (cached 60 seconds)
```json
{
  "assessmentId": "assess-123",
  "overallScore": 35,
  "riskLevel": "medium",
  "completionPercentage": 80,
  "lastUpdated": "2024-02-10T10:30:00Z"
}
```

## Compliance Statuses

```typescript
enum ComplianceStatus {
  COMPLIANT = 'compliant',              // ✓ Fully implemented
  PARTIAL = 'partial',                  // ◐ Partially implemented
  NON_COMPLIANT = 'non_compliant',      // ✗ Not implemented
  NOT_ASSESSED = 'not_assessed',        // ? Pending assessment
}
```

## Scoring Algorithm (Simplified)

```
For each control:
  weight = 3 (critical) | 2 (high) | 1.5 (medium) | 1 (low)
  status_score = 0 (compliant) | 0.5 (partial) | 1 (non-compliant) | 0.7 (not-assessed)
  weighted_score = status_score × weight

category_score = sum(weighted_scores) / sum(max_weights) × 100

overall_score = weighted_average(category_scores)
```

## Key Features

### Scoring
- ✓ Weighted by control criticality (technical>operational>management)
- ✓ Category-level breakdown
- ✓ Risk level classification
- ✓ Confidence metric (0-1)

### Findings
- ✓ Top 5 non-compliant controls extracted
- ✓ Priority-based sorting
- ✓ Impact assessment
- ✓ Criticality classification

### Recommendations
- ✓ 16 hard-coded ISO 27001 recommendations
- ✓ Priority levels (P0/P1/P2/P3)
- ✓ Effort estimation (days/cost)
- ✓ Specific action items

### Security
- ✓ Clerk authentication required
- ✓ User-scoped data isolation
- ✓ Input validation
- ✓ Database integrity checks

## Example Usage

### JavaScript/TypeScript

```typescript
// Submit assessment
const response = await fetch('/api/assessments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    frameworkId: 'iso-27001',
    name: 'Q4 2024',
    responses: [
      { controlId: 'ctrl-001', status: 'compliant' },
      { controlId: 'ctrl-002', status: 'non_compliant', notes: 'In progress' },
    ]
  })
});

const result = await response.json();
console.log(`Risk Score: ${result.data.overallScore}/100`);
console.log(`Risk Level: ${result.data.riskLevel}`);
console.log(`Top Findings: ${result.data.keyFindings.length}`);
```

### React Hook

```typescript
import { useEffect, useState } from 'react';

function RiskDashboard({ assessmentId }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    // Poll score every 60 seconds
    const interval = setInterval(async () => {
      const res = await fetch(`/api/assessments/${assessmentId}/score`);
      const { data } = await res.json();
      setScore(data);
    }, 60000);

    return () => clearInterval(interval);
  }, [assessmentId]);

  if (!score) return <div>Loading...</div>;

  const color = {
    'low': 'green',
    'medium': 'yellow',
    'high': 'red',
    'critical': 'darkred'
  }[score.riskLevel];

  return (
    <div className="scorecard" style={{ borderColor: color }}>
      <h3>Risk Assessment</h3>
      <div className="score">{score.overallScore}/100</div>
      <p>{score.riskLevel.toUpperCase()}</p>
      <p>{score.completionPercentage}% Complete</p>
    </div>
  );
}
```

## Testing

Run unit tests:
```bash
npm test tests/scoring/risk-engine.test.ts
```

Test coverage:
- ✓ Full compliance scenarios
- ✓ Non-compliant scenarios
- ✓ Partial compliance
- ✓ Category calculations
- ✓ Finding extraction
- ✓ Recommendation generation
- ✓ Input validation
- ✓ Edge cases

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (new assessment) |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (auth required) |
| 404 | Not found (resource doesn't exist) |
| 500 | Server error |

## Performance Notes

- Algorithm: O(n) where n = number of controls
- Typical time: <100ms for 50 controls, <500ms for 1000
- Score endpoint cached for 60 seconds
- Supports pagination for large datasets
- Database indexes recommended on:
  - `assessments(userId, frameworkId)`
  - `assessment_responses(assessmentId)`
  - `controls(frameworkId, category)`

## Remediation Recommendations

Top priority controls (P0 - Urgent):
- Access Control Policy
- User Authentication
- Cryptography
- Patch Management
- Network Segmentation
- Incident Management
- Backup & Recovery

Common remediation timelines:
- Critical: 30 days
- High: 30-45 days
- Medium: 45-60 days
- Low: 60+ days

## Troubleshooting

**Score seems high for mostly compliant assessment**
- Check if controls are weighted by criticality
- Critical technical controls weighted 3x
- Mixed control types average differently

**Missing recommendations**
- Custom controls use generic fallback
- Known ISO 27001 controls have specific recommendations
- Check finding category matches recommendation library

**Confidence low despite full assessment**
- Many "not_assessed" controls reduce confidence
- Confidence = completeness × (1 - not_assessed_ratio × 0.3)
- Assessed controls boost confidence significantly

**API returns 401 Unauthorized**
- Ensure Clerk authentication is configured
- Check auth token in request headers
- Verify user is logged in

## Integration Checklist

Before production deployment:

- [ ] Database tables created with proper schema
- [ ] Clerk authentication configured
- [ ] Supabase credentials set in environment
- [ ] Tests passing locally
- [ ] API endpoints responding correctly
- [ ] Auth enforcement verified
- [ ] Pagination tested
- [ ] Cache headers validated
- [ ] Error handling tested
- [ ] Database indexes created
- [ ] Performance baseline established

## Additional Resources

- **Full Documentation**: See `RISK_SCORING_AGENT.md`
- **Tests**: See `tests/scoring/risk-engine.test.ts`
- **Type Definitions**: See `src/types/assessment.ts`
- **Algorithm Details**: See `src/lib/scoring/risk-engine.ts`
- **Recommendations Library**: See `src/lib/scoring/recommendations.ts`

## Support & Questions

For detailed documentation:
1. Read `RISK_SCORING_AGENT.md` for complete architectural overview
2. Review test cases for usage examples
3. Check API documentation in this file
4. Examine type definitions for data structures

For issues:
1. Enable debug logging
2. Check database connectivity
3. Verify authentication
4. Review error responses in API logs
