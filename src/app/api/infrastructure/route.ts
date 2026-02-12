import type { ApiResponse } from '@/types';

export interface HealthMetric {
  name: string;
  status: 'green' | 'yellow' | 'red';
  value: number;
  threshold: number;
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'resolved' | 'in-progress';
  lastUpdated: string;
}

export interface CostBreakdown {
  service: string;
  monthlyCost: number;
  trend: 'up' | 'down' | 'stable';
  percentOfTotal: number;
}

export interface InfrastructureResponse {
  health: HealthMetric[];
  security: SecurityFinding[];
  costs: CostBreakdown[];
  metrics: {
    uptime: number;
    responseTime: number;
    totalCost: number;
    costReduction: number;
  };
}

/**
 * GET /api/infrastructure
 * Returns infrastructure health, security posture, and cost data
 */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const infrastructureData: InfrastructureResponse = {
      health: [
        {
          name: 'Database Uptime',
          status: 'green',
          value: 99.8,
          threshold: 99.0,
        },
        {
          name: 'API Gateway Health',
          status: 'green',
          value: 99.95,
          threshold: 99.0,
        },
        {
          name: 'Cache Availability',
          status: 'yellow',
          value: 98.5,
          threshold: 99.5,
        },
        {
          name: 'Load Balancer Status',
          status: 'green',
          value: 100,
          threshold: 95.0,
        },
        {
          name: 'Storage I/O Performance',
          status: 'green',
          value: 94.2,
          threshold: 85.0,
        },
        {
          name: 'Memory Utilization',
          status: 'yellow',
          value: 87.3,
          threshold: 80.0,
        },
      ],
      security: [
        {
          id: 'SEC-001',
          title: 'SSL/TLS Certificate Expiration',
          severity: 'high',
          status: 'in-progress',
          lastUpdated: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
        },
        {
          id: 'SEC-002',
          title: 'Outdated Dependency: Log4j',
          severity: 'critical',
          status: 'resolved',
          lastUpdated: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
        },
        {
          id: 'SEC-003',
          title: 'Database Access Control Review',
          severity: 'medium',
          status: 'open',
          lastUpdated: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
        },
        {
          id: 'SEC-004',
          title: 'WAF Rules Update Required',
          severity: 'medium',
          status: 'in-progress',
          lastUpdated: new Date(Date.now() - 12 * 3600000).toISOString(),
        },
        {
          id: 'SEC-005',
          title: 'VPN Configuration Hardening',
          severity: 'low',
          status: 'resolved',
          lastUpdated: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
        },
        {
          id: 'SEC-006',
          title: 'API Rate Limiting Optimization',
          severity: 'low',
          status: 'open',
          lastUpdated: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
        },
        {
          id: 'SEC-007',
          title: 'Encryption Key Rotation Schedule',
          severity: 'high',
          status: 'in-progress',
          lastUpdated: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
        },
        {
          id: 'SEC-008',
          title: 'Intrusion Detection System Update',
          severity: 'medium',
          status: 'resolved',
          lastUpdated: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
        },
      ],
      costs: [
        {
          service: 'Compute (EC2/App Engine)',
          monthlyCost: 3200,
          trend: 'down',
          percentOfTotal: 32,
        },
        {
          service: 'Database (RDS/Firestore)',
          monthlyCost: 1850,
          trend: 'stable',
          percentOfTotal: 18.5,
        },
        {
          service: 'CDN & Storage (S3/Cloud Storage)',
          monthlyCost: 1200,
          trend: 'down',
          percentOfTotal: 12,
        },
        {
          service: 'Networking & Load Balancing',
          monthlyCost: 950,
          trend: 'stable',
          percentOfTotal: 9.5,
        },
        {
          service: 'Monitoring & Logging',
          monthlyCost: 650,
          trend: 'up',
          percentOfTotal: 6.5,
        },
        {
          service: 'Security & Compliance',
          monthlyCost: 800,
          trend: 'up',
          percentOfTotal: 8,
        },
        {
          service: 'Backup & Disaster Recovery',
          monthlyCost: 450,
          trend: 'stable',
          percentOfTotal: 4.5,
        },
        {
          service: 'Development Tools & APIs',
          monthlyCost: 550,
          trend: 'stable',
          percentOfTotal: 5.5,
        },
        {
          service: 'Support Plans',
          monthlyCost: 350,
          trend: 'stable',
          percentOfTotal: 3.5,
        },
      ],
      metrics: {
        uptime: 99.78,
        responseTime: 145,
        totalCost: 10000,
        costReduction: 18,
      },
    };

    return Response.json(
      {
        success: true,
        data: infrastructureData,
        timestamp: new Date(),
      } as ApiResponse<InfrastructureResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching infrastructure data:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch infrastructure data',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
