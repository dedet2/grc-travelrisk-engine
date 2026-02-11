# API Endpoints Reference

## Quick Start

All endpoints return JSON and use `Content-Type: application/json`.

```bash
# Start the development server
npm run dev

# Then access endpoints at http://localhost:3000/api/*
```

---

## 1. Pricing Tiers API

### GET - List All Pricing Tiers
```bash
curl http://localhost:3000/api/pricing-tiers
```

**Response:** Array of 3 pricing tiers (Lite $297, Standard $997, Premium $2,497)

### GET - Get Specific Tier
```bash
curl "http://localhost:3000/api/pricing-tiers?tier=standard"
```

### POST - Initialize Checkout
```bash
curl -X POST http://localhost:3000/api/pricing-tiers \
  -H "Content-Type: application/json" \
  -d '{"tierId":"standard"}'
```

---

## 2. KPI Metrics API

### GET - List All Metrics
```bash
curl http://localhost:3000/api/kpi-metrics
```

Returns 12 metrics across 4 categories: Revenue, Operations, Engagement, Compliance

### GET - Filter by Category
```bash
curl "http://localhost:3000/api/kpi-metrics?category=Revenue"
```

---

## 3. Roadmap API

### GET - List All Quarters
```bash
curl http://localhost:3000/api/roadmap
```

Returns Q3 and Q4 roadmaps with monthly milestones and OKRs

### GET - Filter by Quarter
```bash
curl "http://localhost:3000/api/roadmap?quarter=Q3"
```

### PATCH - Update Milestone
```bash
curl -X PATCH http://localhost:3000/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{"month":"Month 7","field":"status","value":"completed"}'
```

---

## 4. Execution Plan API

### GET - Summary View
```bash
curl http://localhost:3000/api/execution-plan
```

Returns 12-week execution plan summary

### GET - Specific Week
```bash
curl "http://localhost:3000/api/execution-plan?week=0"
```

### GET - Detailed View
```bash
curl "http://localhost:3000/api/execution-plan?view=detailed"
```

Returns daily tasks breakdown

### PUT - Update Task
```bash
curl -X PUT http://localhost:3000/api/execution-plan \
  -H "Content-Type: application/json" \
  -d '{"week":0,"day":"Monday","field":"leadsTarget","value":10}'
```

---

## 5. Life Agents (Programmatic)

### Usage in TypeScript
```typescript
import { executeLifeAgentTask } from '@/lib/agents/life-agents';

// Health Agent - Find doctors
const result = executeLifeAgentTask('health', {
  name: 'health_search',
  payload: { speciality: 'Cardiologist' }
});

// Legal Agent - Find lawyers
executeLifeAgentTask('legal', {
  name: 'legal_search',
  payload: { speciality: 'Corporate' }
});

// Jobs Agent - Search jobs
executeLifeAgentTask('jobs', {
  name: 'job_search',
  payload: { query: 'Software Engineer', count: 5 }
});

// Revenue Agent - Analyze/project income
executeLifeAgentTask('revenue', {
  name: 'income_projection',
  payload: { current_income: 50000, growth_rate: 0.1 }
});

// Speaking Agent - List engagements
executeLifeAgentTask('speaking', {
  name: 'list_engagements',
  payload: {}
});

// LinkedIn Agent - Profile analysis
executeLifeAgentTask('linkedin', {
  name: 'engagement_analysis',
  payload: {}
});
```

---

## Dashboard

### URL
```
http://localhost:3000/dashboard/roadmap
```

### Features
- **Roadmap Tab:** Quarterly view with OKRs and monthly progress
- **Execution Tab:** 12-week breakdown with weekly targets
- **Metrics Tab:** KPI tracking organized by category

---

## Response Format

All successful responses include:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "timestamp": "2026-02-11T21:26:00.000Z"
}
```

Error responses:
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

---

## HTTP Status Codes

- `200` - Success (GET, PATCH, PUT)
- `201` - Created (POST)
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

---

## Caching

| Endpoint | Duration |
|----------|----------|
| Pricing | 1 hour |
| Metrics | 5 minutes |
| Roadmap | 1 hour |
| Execution | 30 minutes |

---

## Production Notes

- All routes use `export const dynamic = 'force-dynamic'`
- No authentication in beta (add Clerk auth later)
- In-memory data stores (migrate to Supabase PostgreSQL for production)
- Full error handling and logging included
