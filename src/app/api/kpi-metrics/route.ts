/**
 * KPI Metrics API
 *
 * Returns dashboard KPI metrics template
 * Includes revenue, efficiency, user engagement, and system health metrics
 */

export const dynamic = 'force-dynamic';

export interface KPIMetric {
  id: string;
  name: string;
  category: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  lastUpdated: string;
  description: string;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface KPIDashboard {
  metrics: KPIMetric[];
  categories: string[];
  lastRefresh: string;
}

const kpiMetrics: KPIMetric[] = [
  // Revenue Metrics
  {
    id: 'monthly-revenue',
    name: 'Monthly Revenue',
    category: 'Revenue',
    current: 145000,
    target: 150000,
    unit: 'USD',
    trend: 'up',
    trendPercent: 8.2,
    lastUpdated: new Date().toISOString(),
    description: 'Total monthly recurring revenue',
  },
  {
    id: 'customer-acquisition-cost',
    name: 'Customer Acquisition Cost',
    category: 'Revenue',
    current: 450,
    target: 400,
    unit: 'USD',
    trend: 'down',
    trendPercent: -12.5,
    lastUpdated: new Date().toISOString(),
    description: 'Average cost to acquire a new customer',
  },
  {
    id: 'customer-lifetime-value',
    name: 'Customer Lifetime Value',
    category: 'Revenue',
    current: 12500,
    target: 15000,
    unit: 'USD',
    trend: 'up',
    trendPercent: 18.3,
    lastUpdated: new Date().toISOString(),
    description: 'Average total revenue from a customer',
  },
  {
    id: 'churn-rate',
    name: 'Churn Rate',
    category: 'Revenue',
    current: 3.2,
    target: 2.5,
    unit: 'Percent',
    trend: 'down',
    trendPercent: -5.1,
    lastUpdated: new Date().toISOString(),
    description: 'Percentage of customers who stop using the service',
    threshold: {
      warning: 5,
      critical: 7,
    },
  },

  // Operational Metrics
  {
    id: 'system-uptime',
    name: 'System Uptime',
    category: 'Operations',
    current: 99.98,
    target: 99.95,
    unit: 'Percent',
    trend: 'up',
    trendPercent: 0.03,
    lastUpdated: new Date().toISOString(),
    description: 'Percentage of time the system is available',
    threshold: {
      warning: 99.5,
      critical: 99.0,
    },
  },
  {
    id: 'average-response-time',
    name: 'Average Response Time',
    category: 'Operations',
    current: 245,
    target: 200,
    unit: 'ms',
    trend: 'down',
    trendPercent: -15.2,
    lastUpdated: new Date().toISOString(),
    description: 'Average API response time',
    threshold: {
      warning: 500,
      critical: 1000,
    },
  },
  {
    id: 'error-rate',
    name: 'Error Rate',
    category: 'Operations',
    current: 0.15,
    target: 0.1,
    unit: 'Percent',
    trend: 'down',
    trendPercent: -8.3,
    lastUpdated: new Date().toISOString(),
    description: 'Percentage of failed requests',
    threshold: {
      warning: 1.0,
      critical: 5.0,
    },
  },
  {
    id: 'active-agents',
    name: 'Active Agents',
    category: 'Operations',
    current: 28,
    target: 25,
    unit: 'Count',
    trend: 'up',
    trendPercent: 12,
    lastUpdated: new Date().toISOString(),
    description: 'Number of active AI agents processing tasks',
  },

  // User Engagement Metrics
  {
    id: 'active-users',
    name: 'Daily Active Users',
    category: 'Engagement',
    current: 3245,
    target: 3500,
    unit: 'Count',
    trend: 'up',
    trendPercent: 22.4,
    lastUpdated: new Date().toISOString(),
    description: 'Number of unique daily active users',
  },
  {
    id: 'session-duration',
    name: 'Average Session Duration',
    category: 'Engagement',
    current: 14.5,
    target: 15,
    unit: 'Minutes',
    trend: 'stable',
    trendPercent: 0.5,
    lastUpdated: new Date().toISOString(),
    description: 'Average time users spend per session',
  },
  {
    id: 'feature-adoption',
    name: 'Feature Adoption Rate',
    category: 'Engagement',
    current: 67.8,
    target: 75,
    unit: 'Percent',
    trend: 'up',
    trendPercent: 6.2,
    lastUpdated: new Date().toISOString(),
    description: 'Percentage of users using new features',
  },
  {
    id: 'user-satisfaction',
    name: 'User Satisfaction Score',
    category: 'Engagement',
    current: 8.4,
    target: 8.5,
    unit: 'Score',
    trend: 'up',
    trendPercent: 2.1,
    lastUpdated: new Date().toISOString(),
    description: 'Average NPS or CSAT score',
  },

  // Compliance & Risk Metrics
  {
    id: 'compliance-score',
    name: 'Compliance Score',
    category: 'Compliance',
    current: 94.5,
    target: 95,
    unit: 'Percent',
    trend: 'up',
    trendPercent: 1.8,
    lastUpdated: new Date().toISOString(),
    description: 'Overall compliance and governance score',
    threshold: {
      warning: 85,
      critical: 75,
    },
  },
  {
    id: 'security-incidents',
    name: 'Security Incidents',
    category: 'Compliance',
    current: 1,
    target: 0,
    unit: 'Count',
    trend: 'down',
    trendPercent: -50,
    lastUpdated: new Date().toISOString(),
    description: 'Number of security incidents this month',
    threshold: {
      warning: 2,
      critical: 5,
    },
  },
  {
    id: 'data-backup-status',
    name: 'Data Backup Success Rate',
    category: 'Compliance',
    current: 99.9,
    target: 99.9,
    unit: 'Percent',
    trend: 'stable',
    trendPercent: 0,
    lastUpdated: new Date().toISOString(),
    description: 'Percentage of successful backup operations',
    threshold: {
      warning: 99.0,
      critical: 95.0,
    },
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    // Filter by category if specified
    let metrics = kpiMetrics;
    if (category) {
      metrics = kpiMetrics.filter(
        m => m.category.toLowerCase() === category.toLowerCase()
      );
    }

    const uniqueCategories = Array.from(
      new Set(kpiMetrics.map(m => m.category))
    );

    return Response.json(
      {
        success: true,
        data: {
          metrics,
          categories: uniqueCategories,
          lastRefresh: new Date().toISOString(),
          summary: {
            totalMetrics: kpiMetrics.length,
            healthyMetrics: kpiMetrics.filter(
              m => m.current >= m.target * 0.95
            ).length,
            warningMetrics: kpiMetrics.filter(
              m =>
                m.threshold &&
                m.current <= m.threshold.warning &&
                m.current > m.threshold.critical
            ).length,
            criticalMetrics: kpiMetrics.filter(
              m => m.threshold && m.current <= m.threshold.critical
            ).length,
          },
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('KPI metrics API error:', error);
    return Response.json(
      {
        error: 'Failed to fetch KPI metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
