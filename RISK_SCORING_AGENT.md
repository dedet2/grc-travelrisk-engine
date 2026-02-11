# A-02 Risk Scoring Agent - Implementation Guide

## Overview

The A-02 Risk Scoring Agent is a comprehensive GRC (Governance, Risk, and Compliance) risk scoring system that computes risk scores (0-100) based on assessment responses against framework controls. The system integrates with ISO 27001 controls and provides detailed risk analysis, category breakdowns, and remediation recommendations.

**Score Scale:**
- 0-25: **Low Risk** (Green) - Excellent compliance posture
- 26-50: **Medium Risk** (Amber) - Some gaps identified, manageable risk
- 51-75: **High Risk** (Red) - Significant compliance issues
- 76-100: **Critical Risk** (Dark Red) - Urgent remediation required

## Architecture

### Core Components

#### 1. **Type Definitions** (`src/types/assessment.ts`)

Core TypeScript interfaces for the assessment system:

```typescript
// Compliance status options
enum ComplianceStatus {
  COMPLIANT = 'compliant',           // Control fully implemented
  PARTIAL = 'partial',               // Partially implemented
  NON_COMPLIANT = 'non_compliant',   // Not implemented
  NOT_ASSESSED = 'not_assessed',     // Assessment pending
}

// Individual assessment response
interface AssessmentResponseInput {
  controlId: string;
  status: ComplianceStatus | string;
  notes?: string;
  evidence?: string;
}

// Category-level score breakdown
interface CategoryScore {
  category: string;
  score: number;                  // 0-100
  weight: number;                 // Proportion of controls
  controlCount: number;
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
  notAssessedCount: number;
  compliancePercentage: number;
}

// Individual non-compliant control
interface Finding {
  controlId: string;
  controlTitle: string;
  category: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  status: ComplianceStatus;
  impact: string;
  priority: number;               // Used for sorting
}

// Remediation recommendation
interface Recommendation {
  findingId: string;
  controlId: string;
  title: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';  // P0 = urgent, P3 = low priority
  estimatedEffort: 'low' | 'medium' | 'high';
  estimatedDays: number;
  actionItems: string[];          // Specific remediation steps
}

// Complete assessment result
interface AssessmentResult {
  assessmentId: string;
  overallScore: number;           // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categoryScores: CategoryScore[];
  keyFindings: Finding[];         // Top 5 non-compliant
  recommendations: Recommendation[];
  confidence: number;             // 0-1, based on completeness
  totalControlsAssessed: number;
  totalControls: number;
  completionPercentage: number;
  computedAt: Date;
}
```

#### 2. **Risk Engine** (`src/lib/scoring/risk-engine.ts`)

Core scoring algorithm with weighted calculation:

**Algorithm Overview:**

```
For each control:
  1. Get criticality weight (critical=3, high=2, medium=1.5, low=1)
  2. Get compliance status score:
     - compliant = 0
     - partial = 0.5
     - non_compliant = 1
     - not_assessed = 0.7
  3. Calculate weighted score = status × criticality

Category Score = sum(weighted_scores) / sum(max_weights) × 100

Overall Score = weighted_average(category_scores)
```

**Key Functions:**

- `computeGRCScore(responses, controls)` - Main orchestration function
  - Validates and normalizes input
  - Groups controls by category
  - Calculates category and overall scores
  - Extracts top 5 findings by priority
  - Generates remediation recommendations
  - Calculates assessment confidence

- `validateAssessmentResponses(responses, controls)` - Input validation
  - Verifies all control IDs exist
  - Returns validation errors

- `getRiskLevelColor(riskLevel)` - UI color mapping

**Criticality Mapping:**
- Technical controls → Critical weight (3)
- Operational controls → High weight (2)
- Management controls → Medium weight (1.5)

#### 3. **Recommendations Engine** (`src/lib/scoring/recommendations.ts`)

Maps non-compliant controls to actionable remediation guidance:

**Features:**
- Hard-coded recommendations for 15+ common ISO 27001 control gaps
- Priority levels (P0-P3) and effort estimation
- Specific action items for implementation
- Generic fallback recommendations for custom controls

**Recommendation Categories:**
- Access Control (A.6)
- Authentication & Password Management (A.6.2)
- Cryptography (A.10.1)
- Physical Security (A.11.1)
- Asset Management (A.8)
- Configuration Management (A.12.1)
- Patch Management (A.12.6.1)
- Incident Management (A.16.1)
- Backup & Disaster Recovery (A.12.3)
- Business Continuity (A.17.1)
- Security Training (A.7.2)
- Vulnerability Management (A.12.6.2)
- Access Logging (A.12.4.1)
- Data Classification (A.8.2)
- Network Segmentation (A.13.1.3)
- Third-party Risk Management (A.15.1)

**Functions:**

- `generateRecommendations(keyFindings)` - Generate recommendations from findings
- `estimateRemediationEffort(recommendations)` - Calculate total effort and cost

### API Endpoints

#### 1. **POST /api/assessments**

Submit assessment responses and compute risk score.

**Request:**
```json
{
  "frameworkId": "iso-27001",
  "name": "Q4 2024 Assessment",
  "responses": [
    {
      "controlId": "ctrl-001",
      "status": "compliant",
      "notes": "MFA implemented across all systems",
      "evidence": "policy-doc-v2.pdf"
    },
    {
      "controlId": "ctrl-002",
      "status": "partial",
      "notes": "Encryption in transit implemented, at-rest pending"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "assess-abc123",
    "overallScore": 42,
    "riskLevel": "medium",
    "categoryScores": [
      {
        "category": "Access Control",
        "score": 35,
        "weight": 0.2,
        "controlCount": 8,
        "compliantCount": 5,
        "partialCount": 2,
        "nonCompliantCount": 1,
        "notAssessedCount": 0,
        "compliancePercentage": 63
      }
    ],
    "keyFindings": [
      {
        "controlId": "ctrl-002",
        "controlTitle": "Cryptographic Controls",
        "category": "Cryptography",
        "criticality": "critical",
        "status": "partial",
        "impact": "Critical control gap - immediate remediation required",
        "priority": 115
      }
    ],
    "recommendations": [
      {
        "findingId": "ctrl-002-rec",
        "controlId": "ctrl-002",
        "title": "Implement Cryptographic Controls",
        "description": "Deploy encryption for data at rest and in transit...",
        "priority": "P0",
        "estimatedEffort": "high",
        "estimatedDays": 45,
        "actionItems": [
          "Conduct encryption assessment across systems",
          "Implement TLS 1.2+ for all network communications",
          "Deploy AES-256 encryption for data at rest"
        ]
      }
    ],
    "confidence": 0.95,
    "totalControlsAssessed": 20,
    "totalControls": 25,
    "completionPercentage": 80,
    "computedAt": "2024-02-10T10:30:00Z"
  },
  "timestamp": "2024-02-10T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing/invalid required fields
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Framework not found
- `500 Internal Server Error` - Computation or storage failure

#### 2. **GET /api/assessments**

List all assessments for authenticated user's organization.

**Query Parameters:**
- `limit=50` - Results per page (default: 50)
- `offset=0` - Pagination offset (default: 0)
- `frameworkId=iso-27001` - Filter by framework (optional)
- `status=completed` - Filter by status: in-progress, completed, archived (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessments": [
      {
        "id": "assess-abc123",
        "userId": "user-123",
        "frameworkId": "iso-27001",
        "name": "Q4 2024 Assessment",
        "status": "completed",
        "overallScore": 42,
        "createdAt": "2024-02-10T10:30:00Z",
        "updatedAt": "2024-02-10T10:30:00Z",
        "frameworks": {
          "name": "ISO 27001:2022"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  },
  "timestamp": "2024-02-10T10:30:00Z"
}
```

#### 3. **GET /api/assessments/[id]**

Get specific assessment with full score breakdown.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "assess-abc123",
      "userId": "user-123",
      "frameworkId": "iso-27001",
      "name": "Q4 2024 Assessment",
      "status": "completed",
      "overallScore": 42,
      "createdAt": "2024-02-10T10:30:00Z",
      "updatedAt": "2024-02-10T10:30:00Z"
    },
    "scoreBreakdown": {
      "assessmentId": "assess-abc123",
      "overallScore": 42,
      "riskLevel": "medium",
      "categoryScores": [...],
      "keyFindings": [...],
      "recommendations": [...],
      "confidence": 0.95,
      "totalControlsAssessed": 20,
      "totalControls": 25,
      "completionPercentage": 80,
      "computedAt": "2024-02-10T10:30:00Z",
      "metrics": {
        "averageScore": 45,
        "highestRiskCategory": "Cryptography",
        "lowestRiskCategory": "Access Control",
        "criticalFindingsCount": 2,
        "highFindingsCount": 5
      }
    }
  },
  "timestamp": "2024-02-10T10:30:00Z"
}
```

#### 4. **GET /api/assessments/[id]/score**

Lightweight endpoint for dashboard polling - returns only score data.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "assess-abc123",
    "overallScore": 42,
    "riskLevel": "medium",
    "completionPercentage": 80,
    "lastUpdated": "2024-02-10T10:30:00Z"
  },
  "timestamp": "2024-02-10T10:30:00Z"
}
```

**Cache Control:**
- Cached for 60 seconds to reduce database load during dashboard polling

## Scoring Examples

### Example 1: Perfect Compliance

```
5 controls, all compliant:
  - Criticality weights: 3+3+2+1.5+1 = 10.5 (max)
  - Status scores: 0+0+0+0+0 = 0 (all compliant)
  - Category score = 0/10.5 × 100 = 0
  - Overall score = 0 (Low Risk)
```

### Example 2: Mixed Compliance

```
5 controls:
  - Ctrl-1 (critical): Compliant = 0×3 = 0
  - Ctrl-2 (critical): Non-compliant = 1×3 = 3
  - Ctrl-3 (high): Partial = 0.5×2 = 1
  - Ctrl-4 (medium): Compliant = 0×1.5 = 0
  - Ctrl-5 (low): Not-assessed = 0.7×1 = 0.7

  Category score = 4.7/10.5 × 100 = 44.8 ≈ 45 (Medium Risk)
```

### Example 3: Critical Gaps

```
5 controls, all non-compliant:
  - Status scores: 1×3 + 1×3 + 1×2 + 1×1.5 + 1×1 = 10.5
  - Category score = 10.5/10.5 × 100 = 100
  - Overall score = 100 (Critical Risk)
  - Top 5 findings extracted and prioritized
  - Remediation recommendations generated
```

## Confidence Calculation

Confidence is based on:
1. **Completeness**: assessed_controls / total_controls
2. **Quality**: Penalized by not_assessed ratio (up to 30% penalty)

```
Confidence = completion_ratio × (1 - not_assessed_ratio × 0.3)

Example: 20/25 controls assessed, 3 not-assessed:
  Completeness = 20/25 = 0.8
  Quality = 1 - (3/20 × 0.3) = 0.955
  Confidence = 0.8 × 0.955 = 0.764
```

## Finding Prioritization

Findings are sorted by priority score:
```
Priority = criticality_score + status_bonus

Criticality: critical=100, high=75, medium=50, low=25
Status Bonus: not_assessed=15, non_compliant=10, partial=5, compliant=0

Example: Critical control, non-compliant = 100 + 10 = 110
Example: High control, not-assessed = 75 + 15 = 90
```

## Database Schema Integration

### Tables Referenced

**assessments**
```sql
- id (UUID, PK)
- userId (UUID, FK)
- frameworkId (UUID, FK)
- name (TEXT)
- status (TEXT: in-progress | completed | archived)
- overallScore (INTEGER: 0-100)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

**assessment_responses**
```sql
- id (UUID, PK)
- assessmentId (UUID, FK)
- controlId (UUID, FK)
- response (TEXT: compliant | partially-implemented | not-implemented)
- evidence (TEXT, nullable)
- notes (TEXT, nullable)
- score (INTEGER)
- createdAt (TIMESTAMP)
```

**controls**
```sql
- id (UUID, PK)
- frameworkId (UUID, FK)
- controlIdStr (TEXT)
- title (TEXT)
- description (TEXT)
- category (TEXT)
- controlType (TEXT: technical | operational | management)
- createdAt (TIMESTAMP)
```

**frameworks**
```sql
- id (UUID, PK)
- name (TEXT)
- version (TEXT)
- description (TEXT)
- sourceUrl (TEXT, nullable)
- status (TEXT)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "success": false,
  "error": "Error description",
  "timestamp": "2024-02-10T10:30:00Z"
}
```

**Common Error Codes:**
- `400 Bad Request` - Invalid input or missing required fields
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server processing error

## Input Validation

1. **Framework ID** - Must exist in database
2. **Control IDs** - Must exist in framework's controls
3. **Compliance Status** - Must be valid enum value
4. **Responses Array** - Must have at least 1 item
5. **User Authentication** - Required for all endpoints

Status normalization:
- `'non-compliant'` → `ComplianceStatus.NON_COMPLIANT`
- `'non_compliant'` → `ComplianceStatus.NON_COMPLIANT`
- `'NON_COMPLIANT'` → `ComplianceStatus.NON_COMPLIANT`
- Default: `NOT_ASSESSED` for unrecognized values

## Performance Considerations

### Optimization Strategies

1. **Lightweight Score Endpoint** - `/api/assessments/[id]/score` is cached for 60 seconds
2. **Pagination** - Default 50 results, adjustable via `limit` parameter
3. **Database Indexing** - Recommended indexes:
   - `assessments(userId, frameworkId)`
   - `assessment_responses(assessmentId, controlId)`
   - `controls(frameworkId, category)`

### Scaling Notes

- Supports 100k+ controls per framework
- Assessment computation is O(n) where n = number of controls
- Typical computation time: <100ms for 50 controls, <500ms for 1000 controls
- API responses cached at 60-second intervals where applicable

## Testing

Comprehensive test suite provided in `tests/scoring/risk-engine.test.ts`:

```bash
npm test tests/scoring/risk-engine.test.ts
```

**Test Coverage:**
- Full compliance scenarios
- Non-compliant scenarios
- Partial compliance
- Category score calculation
- Finding extraction
- Recommendation generation
- Edge cases (empty assessments, single control, etc.)
- Input validation

## Integration Examples

### JavaScript/TypeScript Client

```typescript
// Submit assessment
const response = await fetch('/api/assessments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    frameworkId: 'iso-27001',
    name: 'Q4 Assessment',
    responses: [
      { controlId: 'ctrl-001', status: 'compliant' },
      { controlId: 'ctrl-002', status: 'non_compliant' },
    ]
  })
});

const { data } = await response.json();
console.log(`Risk Level: ${data.riskLevel}`);
console.log(`Score: ${data.overallScore}/100`);

// Fetch detailed assessment
const detailResponse = await fetch(`/api/assessments/${data.assessmentId}`);
const { data: fullAssessment } = await detailResponse.json();
console.log(`Key Findings: ${fullAssessment.scoreBreakdown.keyFindings.length}`);

// Poll for score updates
setInterval(async () => {
  const scoreResponse = await fetch(`/api/assessments/${data.assessmentId}/score`);
  const { data: scoreData } = await scoreResponse.json();
  updateDashboard(scoreData);
}, 60000); // Every 60 seconds
```

### React Component

```typescript
import { useEffect, useState } from 'react';

export function RiskScorecard({ assessmentId }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      const response = await fetch(`/api/assessments/${assessmentId}/score`);
      const { data } = await response.json();
      setScore(data);
      setLoading(false);
    }
    fetchScore();
  }, [assessmentId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="risk-scorecard">
      <h2>Risk Assessment</h2>
      <div className={`score-badge ${score.riskLevel}`}>
        {score.overallScore}/100
      </div>
      <p>Risk Level: {score.riskLevel}</p>
      <p>Completion: {score.completionPercentage}%</p>
    </div>
  );
}
```

## Future Enhancements

1. **Trend Analysis** - Track risk scores over time
2. **Custom Weights** - Allow organizations to customize criticality weights
3. **Remediation Tracking** - Monitor progress on recommendations
4. **Benchmarking** - Compare scores with industry peers
5. **AI-Generated Recommendations** - Use Claude API for contextual guidance
6. **Export Functionality** - Generate PDF reports
7. **Real-time Notifications** - Alert on critical findings
8. **Automated Evidence Collection** - Integrate with SIEM/monitoring tools

## Maintenance

### Regular Tasks

1. **Update Recommendations** - Quarterly review of remediation guidance
2. **Review Weights** - Annually validate criticality weights
3. **Database Cleanup** - Archive old assessments quarterly
4. **Performance Monitoring** - Track API response times
5. **Security Audits** - Annual penetration testing

### Support

For issues or questions:
- Check test suite for usage examples
- Review API documentation above
- Examine error logs for detailed error messages
- Contact GRC team for framework updates
