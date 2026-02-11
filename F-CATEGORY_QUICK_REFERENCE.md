# Sprint 6 F-Category Agents - Quick Reference Guide

## Overview

Sprint 6 introduces 3 Strategic Planning agents that synthesize insights across all agent categories to support executive decision-making:

| Agent | Code | Purpose | Endpoint |
|-------|------|---------|----------|
| **Competitive Intelligence** | F-01 | Track competitors, pricing, features, threats | `/api/competitive-intel` |
| **Revenue Forecasting** | F-02 | Predict revenue trends, model scenarios | `/api/revenue-forecast` |
| **Strategic Planning** | F-03 | Synthesize insights into strategic plan | `/api/strategic-plan` |

---

## API Usage

### 1. Competitive Intelligence Agent (F-01)

#### Trigger Analysis
```bash
curl -X POST http://localhost:3000/api/competitive-intel \
  -H "Content-Type: application/json"
```

#### Retrieve Report
```bash
curl -X GET http://localhost:3000/api/competitive-intel
```

#### Response Structure
```typescript
{
  success: true,
  message: "Competitive intelligence report retrieved successfully",
  data: {
    reportId: "comp-report-1707555600000",
    timestamp: "2025-02-11T06:30:00.000Z",
    competitorsMonitored: [
      {
        competitorId: "comp-001",
        name: "TravelShield Pro",
        marketShare: 28,
        currentPrice: 9200,
        priceChangePercent: 2,
        marketPosition: "leader",
        strengthAreas: ["Real-time alerts", "Mobile app"],
        weaknessAreas: ["Limited compliance frameworks"]
      }
      // ... more competitors
    ],
    identifiedThreats: [
      {
        threatId: "threat-...",
        competitorName: "TravelShield Pro",
        threatType: "price_reduction",
        severity: "high",
        recommendedAction: "Review pricing strategy..."
      }
    ],
    identifiedOpportunities: [
      {
        opportunityId: "opp-...",
        opportunityType: "market_gap",
        potential: "high",
        actionItems: ["Create mid-market product tier"]
      }
    ],
    ourMarketShare: 17,
    threatLevel: "medium",
    recommendedStrategies: [...]
  }
}
```

#### Key Data Points
- **competitorsMonitored**: List of 5 tracked competitors
- **identifiedThreats**: Threats ranked by severity
- **identifiedOpportunities**: Market opportunities with action items
- **positionScores**: 5-dimensional competitive positioning
- **recommendedStrategies**: Executive-level strategic recommendations

---

### 2. Revenue Forecasting Agent (F-02)

#### Trigger Forecast
```bash
curl -X POST http://localhost:3000/api/revenue-forecast \
  -H "Content-Type: application/json"
```

#### Retrieve Forecast
```bash
curl -X GET http://localhost:3000/api/revenue-forecast
```

#### Response Structure
```typescript
{
  success: true,
  message: "Revenue forecast report retrieved successfully",
  data: {
    reportId: "revenue-report-1707555600000",
    lastMonthRevenue: 287500,
    lastQuarterRevenue: 825000,
    lastYearRevenue: 3000000,
    ytyGrowthRate: 8.00,
    qoqGrowthRate: 5.50,
    momGrowthRate: 3.20,
    currentPipelineValue: 1150000,
    pipelineConversionRate: 38.50,
    forecastModels: {
      conservative: {
        scenarioName: "conservative",
        quarterLabel: "Q2 2025",
        projectedRevenue: 850000,
        confidenceInterval: {
          low: 722500,
          mid: 850000,
          high: 977500
        },
        confidenceLevel: 85
      },
      moderate: {
        scenarioName: "moderate",
        quarterLabel: "Q2 2025",
        projectedRevenue: 1000000,
        confidenceInterval: {
          low: 900000,
          mid: 1000000,
          high: 1100000
        },
        confidenceLevel: 75
      },
      aggressive: {
        scenarioName: "aggressive",
        quarterLabel: "Q2 2025",
        projectedRevenue: 1200000,
        confidenceInterval: {
          low: 960000,
          mid: 1200000,
          high: 1440000
        },
        confidenceLevel: 65
      }
    },
    riskFactors: [
      {
        factorName: "Competitive Pressure",
        impactOnRevenue: -15,
        probability: 0.60,
        expectedImpact: -9.00,
        priority: "high"
      }
      // ... more risks
    ],
    topOpportunities: [
      "Expand into mid-market segment",
      "Develop vertical-specific solutions",
      "Build strategic partnerships"
    ]
  }
}
```

#### Key Data Points
- **forecastModels**: 3 scenarios (conservative, moderate, aggressive)
- **confidenceInterval**: Range with low/mid/high estimates
- **riskFactors**: Identified risks with probability and impact
- **topOpportunities**: Growth opportunities ranked by potential
- **pipelineAnalysis**: Sales stage breakdown with conversion rates

---

### 3. Strategic Planning Agent (F-03)

#### Trigger Strategic Planning
```bash
curl -X POST http://localhost:3000/api/strategic-plan \
  -H "Content-Type: application/json"
```

#### Retrieve Strategic Plan
```bash
curl -X GET http://localhost:3000/api/strategic-plan
```

#### Response Structure
```typescript
{
  success: true,
  message: "Strategic plan retrieved successfully",
  data: {
    planId: "strategic-plan-1707555600000",
    fiscalYear: "2025",
    executiveSummary: "Strategic plan for FY 2025 focused on three critical priorities...",
    strategicThemes: [
      {
        themeId: "theme-001",
        themeName: "Market Expansion",
        description: "Capitalize on competitive gaps and market opportunities",
        relatedAgents: ["Competitive Intelligence", "Revenue Forecasting"],
        crossCuttingInsights: [
          "Mid-market segment underserved by competitors",
          "Penetration pricing competitors lack premium features"
        ],
        recommendedActions: [
          "Develop mid-market product tier",
          "Create industry-specific solutions",
          "Build partner ecosystem"
        ],
        expectedImpact: "critical"
      }
      // ... more themes
    ],
    quarterlyObjectives: [
      {
        objectiveId: "q2-001",
        quarter: "Q2 2025",
        theme: "Market Expansion",
        objectives: [
          "Finalize mid-market product specifications",
          "Establish design partner advisory board"
        ],
        keyResults: [
          "Complete product scoping by end of Q2",
          "Onboard 5 design partners with signed agreements"
        ],
        successCriteria: [
          "Design partners actively using beta product",
          "NPS score above 50"
        ]
      }
      // ... more quarters
    ],
    strategicInitiatives: [
      {
        initiativeId: "init-001",
        title: "Mid-Market Product Tier",
        priority: "p0",
        expectedROI: 800,
        requiredResources: {
          engineers: 3,
          budget: 150000,
          timeline: "6 months"
        }
      }
      // ... more initiatives
    ],
    resourceAllocationPlan: {
      totalBudget: 1250000,
      allocations: [
        {
          area: "Product & Engineering",
          percentage: 45,
          amount: 562500,
          justification: "Core product development"
        }
        // ... more allocations
      ],
      headcountPlan: [
        {
          role: "Software Engineers",
          current: 8,
          planned: 12,
          timeline: "Hire 2 in Q2, 2 in Q3"
        }
        // ... more roles
      ]
    },
    successMetrics: [
      {
        metric: "Annual Recurring Revenue",
        target: "$2.4M",
        currentValue: "$1.8M",
        unit: "USD"
      }
      // ... more metrics
    ]
  }
}
```

#### Key Data Points
- **executiveSummary**: High-level strategy overview
- **strategicThemes**: 5 cross-cutting strategic priorities
- **quarterlyObjectives**: OKR-style quarterly goals
- **strategicInitiatives**: 5+ major initiatives with P0/P1 priorities
- **resourceAllocationPlan**: $1.25M budget distribution
- **successMetrics**: 8 tracked KPIs with targets
- **reviewCheckpoints**: Monthly review dates throughout year

---

## TypeScript Integration

### Import Agent Classes
```typescript
import {
  CompetitiveIntelligenceAgent,
  RevenueForecastingAgent,
  StrategicPlanningAgent,
  createCompetitiveIntelligenceAgent,
  createRevenueForecastingAgent,
  createStrategicPlanningAgent,
} from '@/lib/agents';
```

### Import Data Types
```typescript
import type {
  CompetitiveIntelligenceReport,
  Competitor,
  CompetitiveThreat,
  CompetitiveOpportunity,
  RevenueForecastingReport,
  RevenueForecast,
  RevenueRiskFactor,
  StrategicPlan,
  StrategicInitiative,
  QuarterlyObjective,
} from '@/lib/agents';
```

### Usage in Components
```typescript
import { useEffect, useState } from 'react';

export default function StrategicDashboard() {
  const [plan, setPlan] = useState<StrategicPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch strategic plan
    fetch('/api/strategic-plan')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setPlan(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading strategic plan...</div>;
  if (!plan) return <div>No strategic plan available</div>;

  return (
    <div>
      <h1>{plan.executiveSummary}</h1>
      <div>
        <h2>Key Initiatives</h2>
        {plan.strategicInitiatives.map(init => (
          <div key={init.initiativeId}>
            <h3>{init.title}</h3>
            <p>Priority: {init.priority}</p>
            <p>Expected ROI: {init.expectedROI}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Agent Lifecycle

All F-category agents follow the standard BaseAgent lifecycle:

### 1. Initialization
```typescript
const agent = createCompetitiveIntelligenceAgent();
```

### 2. Execution
```typescript
const result = await agent.run();
// Internally calls:
// - collectData() → CompetitiveIntelligenceRawData
// - processData() → CompetitiveIntelligenceReport
// - updateDashboard() → stores in in-memory-store
```

### 3. Result
```typescript
{
  agentName: "Competitive Intelligence (F-01)",
  status: "completed",
  startedAt: Date,
  completedAt: Date,
  latencyMs: number,
  tasksCompleted: 1,
  totalTasks: 1,
  data: CompetitiveIntelligenceReport
}
```

### 4. Data Retrieval
```typescript
import { inMemoryStore } from '@/lib/store/in-memory-store';

// Get latest report
const report = inMemoryStore.getCompetitiveIntelligenceReport();
```

---

## Mock Data Generation

All F-category agents generate realistic mock data:

### Competitive Intelligence Mock Data
- **5 Competitors**: TravelShield Pro, RiskGuard Global, SafeTravel Analytics, Compliance Connect, TravelTech Startup
- **Market Shares**: 28%, 22%, 18%, 15%, 8% (with 9% for us)
- **Pricing Ranges**: $2,999 - $12,999 annually
- **Dynamic Updates**: 30% chance of pricing changes, feature launches, threats
- **Opportunities**: Market gaps, penetration pricing, partnerships

### Revenue Forecasting Mock Data
- **Historical Data**: 12-month revenue history with 8% growth
- **Sales Pipeline**: 4 stages with conversion rates (Discovery → Close)
- **Current Metrics**: $287K monthly revenue, $1.15M pipeline, 38.5% conversion
- **3 Scenarios**: Conservative (-15%), Moderate (baseline), Aggressive (+20%)
- **Risk Factors**: 4 identified risks with probability/impact modeling

### Strategic Planning Mock Data
- **5 Strategic Themes**: Market Expansion, Operational Excellence, Product Innovation, Revenue Optimization, Brand Positioning
- **4 Quarterly Objectives**: Q2 & Q3 2025 with OKRs and key results
- **5 Strategic Initiatives**: Including mid-market product tier ($5M+ potential), AI prediction engine, cost optimization (30% savings)
- **Resource Plan**: $1.25M budget, headcount 28→38 employees
- **Success Metrics**: 8 KPIs tracking progress

---

## Performance Characteristics

| Agent | Timeout | Retries | Avg Response |
|-------|---------|---------|--------------|
| F-01 Competitive Intelligence | 30s | 2 | ~100ms |
| F-02 Revenue Forecasting | 30s | 2 | ~120ms |
| F-03 Strategic Planning | 30s | 2 | ~150ms |

---

## Error Handling

All API routes include proper error handling:

```typescript
// Not found error
{
  success: false,
  message: "No competitive intelligence report available. Run POST to generate.",
  data: null
}
// HTTP 404

// Execution error
{
  success: false,
  message: "Error message",
  error: Error object
}
// HTTP 500
```

---

## Integration with Other Agents

F-category agents aggregate insights from all previous categories:

```
A-Category (Risk & Monitoring)
├─ A-01: GRC Framework Ingestion
├─ A-02: Risk Scoring Engine
├─ A-03: Travel Risk Assessment
├─ A-04: Unified Risk Combiner
├─ A-05: Executive Dashboard
└─ A-06: Continuous Monitoring
    ↓
B-Category (Operations & Admin)
├─ B-01: Invoice & Billing
├─ B-02: Calendar Scheduling
├─ B-03: Email Triage
├─ B-04: Document Management
└─ B-05: Task Management
    ↓
C-Category (Sales & Outreach)
├─ C-01: Lead Scoring
├─ C-02: Outreach Automation
├─ C-03: CRM Sync
└─ C-04: Proposal Generation
    ↓
D-Category (Infrastructure)
├─ D-01: Uptime & Health
├─ D-02: Database Optimization
├─ D-03: Security Audit
├─ D-04: Backup & Recovery
└─ D-05: Cost Optimization
    ↓
E-Category (Content & Marketing)
├─ E-01: Content Calendar
├─ E-02: SEO Intelligence
├─ E-03: Social Media
├─ E-04: Brand Voice
└─ E-05: Analytics Dashboard
    ↓
F-Category (Strategic Planning) ← Uses insights from all above
├─ F-01: Competitive Intelligence
├─ F-02: Revenue Forecasting
└─ F-03: Strategic Planning
```

---

## Deployment Checklist

- [x] All agents compile without TypeScript errors
- [x] Agents register in bootstrap during initialization
- [x] API routes recognized by Next.js
- [x] In-memory store methods implemented
- [x] Mock data generation working
- [x] Error handling in place
- [x] Production build successful
- [x] Type safety verified

---

## Troubleshooting

### Agent not found error
**Solution**: Ensure `initializeAgents()` is called before accessing agents. The bootstrap is automatically called in API routes.

### No data in report
**Solution**: Reports are only generated when `/api/[endpoint]` POST route is called. GET returns 404 if no report exists yet.

### Type errors in imports
**Solution**: Ensure you're importing from `/lib/agents` barrel export, not individual files.

### Timeout errors
**Solution**: Agents have 30s timeout. Mock data generation is fast; check server performance if timeouts occur.

---

## Production Considerations

### Data Persistence
Currently using in-memory storage. For production:
- [ ] Implement Supabase integration
- [ ] Add database persistence for reports
- [ ] Implement caching strategy
- [ ] Add report archiving

### Real Data Integration
Replace mock data with:
- [ ] Real competitor monitoring APIs
- [ ] Salesforce pipeline integration
- [ ] Real revenue data from billing system
- [ ] Real market data feeds

### Monitoring & Alerting
- [ ] Add execution monitoring to dashboard
- [ ] Alert on anomalies in forecasts
- [ ] Track agent performance metrics
- [ ] Log all strategic decisions

---

## Support & Documentation

For detailed documentation on each agent, see:
- `/src/lib/agents/competitive-intelligence-agent.ts`
- `/src/lib/agents/revenue-forecasting-agent.ts`
- `/src/lib/agents/strategic-planning-agent.ts`

For API documentation, see:
- `/src/app/api/competitive-intel/route.ts`
- `/src/app/api/revenue-forecast/route.ts`
- `/src/app/api/strategic-plan/route.ts`

For complete completion report, see:
- `SPRINT6_COMPLETION_REPORT.md`
