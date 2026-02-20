/**
 * Cost Optimization Agent (D-05)
 * Analyzes infrastructure costs, identifies savings opportunities, tracks budget
 * Calculates cost per service, identifies underutilized resources
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface ServiceCost {
  serviceId: string;
  serviceName: string;
  serviceType: 'compute' | 'storage' | 'database' | 'networking' | 'monitoring' | 'licensing';
  currentMonthlyCost: number;
  previousMonthlyCost?: number;
  costTrend: 'increasing' | 'stable' | 'decreasing';
  usage: number; // percentage utilization
  unit: string;
}

export interface CostSavingsOpportunity {
  opportunityId: string;
  title: string;
  description: string;
  affectedService: string;
  currentAnnualCost: number;
  potentialSavingsAmount: number;
  savingsPercentage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimationConfidence: number; // 0-100
  category: 'rightsizing' | 'unused_resources' | 'reserved_instances' | 'optimization' | 'consolidation';
  implementationEffort: 'low' | 'medium' | 'high';
  discoveredAt: Date;
}

export interface BudgetTracking {
  period: string;
  budgetLimit: number;
  actualSpending: number;
  forecasted: number;
  variance: number;
  variancePercentage: number;
  status: 'on_track' | 'warning' | 'exceeded';
}

export interface CostOptimizationReport {
  reportId: string;
  timestamp: Date;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  previousMonthCost?: number;
  costChangePercentage?: number;
  serviceBreakdown: ServiceCost[];
  totalSavingsIdentified: number;
  savingsOpportunities: CostSavingsOpportunity[];
  budgetTracking: BudgetTracking;
  topExpensiveServices: ServiceCost[];
  underutilizedServices: ServiceCost[];
  monthlyTrend: Array<{
    month: string;
    cost: number;
  }>;
}

export interface CostOptimizationRawData {
  services: ServiceCost[];
  opportunities: CostSavingsOpportunity[];
  budgetTracking: BudgetTracking;
  timestamp: Date;
}

/**
 * Cost Optimization Agent
 * Analyzes infrastructure costs and identifies savings opportunities
 */
export class CostOptimizationAgent extends BaseAgent<CostOptimizationRawData, CostOptimizationReport> {
  private services = [
    { name: 'EC2 Instances', type: 'compute' as const, baseCost: 2500 },
    { name: 'RDS Database', type: 'database' as const, baseCost: 1800 },
    { name: 'S3 Storage', type: 'storage' as const, baseCost: 600 },
    { name: 'CloudFront CDN', type: 'networking' as const, baseCost: 400 },
    { name: 'Lambda Functions', type: 'compute' as const, baseCost: 150 },
    { name: 'CloudWatch Monitoring', type: 'monitoring' as const, baseCost: 300 },
    { name: 'Software Licenses', type: 'licensing' as const, baseCost: 2000 },
  ];

  private monthlyCosts: number[] = [];
  private costHistory: Map<string, ServiceCost[]> = new Map();
  private budgetLimit: number = 20000;

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Cost Optimization (D-05)',
      description: 'Analyzes infrastructure costs, identifies savings opportunities, and tracks budget',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Generate cost history
    for (let i = 0; i < 12; i++) {
      const month = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
      const monthStr = month.toLocaleString('default', { month: 'long', year: 'numeric' });

      const serviceCosts: ServiceCost[] = this.services.map((service) => {
        const variation = 0.8 + Math.random() * 0.4; // 80-120% of base cost
        return {
          serviceId: service.name.replace(/\s/g, '-').toLowerCase(),
          serviceName: service.name,
          serviceType: service.type,
          currentMonthlyCost: Math.round(service.baseCost * variation),
          usage: Math.floor(Math.random() * 100),
          unit: service.type === 'storage' ? 'GB' : 'hours',
          costTrend: 'stable' as const,
        };
      });

      this.costHistory.set(monthStr, serviceCosts);
    }
  }

  /**
   * Collect usage metrics and billing data
   */
  async collectData(): Promise<CostOptimizationRawData> {
    const services: ServiceCost[] = [];
    const opportunities: CostSavingsOpportunity[] = [];

    // Collect current service costs
    for (const service of this.services) {
      const variation = 0.8 + Math.random() * 0.4; // 80-120% of base cost
      const currentCost = Math.round(service.baseCost * variation);
      const previousCost = service.baseCost;
      const usage = Math.floor(Math.random() * 100);

      const costTrend =
        currentCost > previousCost * 1.1 ? 'increasing' : currentCost < previousCost * 0.9 ? 'decreasing' : 'stable';

      services.push({
        serviceId: service.name.replace(/\s/g, '-').toLowerCase(),
        serviceName: service.name,
        serviceType: service.type,
        currentMonthlyCost: currentCost,
        previousMonthlyCost: previousCost,
        costTrend,
        usage,
        unit: service.type === 'storage' ? 'GB' : 'hours',
      });

      // Generate savings opportunities
      if (usage < 30) {
        // Underutilized
        opportunities.push({
          opportunityId: `opp-${service.name}-${Date.now()}`,
          title: `Optimize ${service.name} usage`,
          description: `Current utilization is only ${usage}%. Consider downsizing or consolidating.`,
          affectedService: service.name,
          currentAnnualCost: currentCost * 12,
          potentialSavingsAmount: Math.round((currentCost * 12 * 0.3)), // 30% savings
          savingsPercentage: 30,
          priority: usage < 10 ? 'critical' : 'high',
          estimationConfidence: 85,
          category: 'rightsizing',
          implementationEffort: 'low',
          discoveredAt: new Date(),
        });
      }

      // Reserved instances opportunity
      if (service.type === 'compute' || service.type === 'database') {
        opportunities.push({
          opportunityId: `opp-ri-${service.name}-${Date.now()}`,
          title: `Purchase reserved instances for ${service.name}`,
          description: `Switch to 3-year reserved instances for 40% discount.`,
          affectedService: service.name,
          currentAnnualCost: currentCost * 12,
          potentialSavingsAmount: Math.round((currentCost * 12 * 0.4)),
          savingsPercentage: 40,
          priority: 'high',
          estimationConfidence: 90,
          category: 'reserved_instances',
          implementationEffort: 'medium',
          discoveredAt: new Date(),
        });
      }
    }

    // Calculate budget tracking
    const totalMonthlyCost = services.reduce((sum, s) => sum + s.currentMonthlyCost, 0);
    const variance = totalMonthlyCost - this.budgetLimit;
    const status = totalMonthlyCost > this.budgetLimit ? 'exceeded' : totalMonthlyCost > this.budgetLimit * 0.9 ? 'warning' : 'on_track';

    const budgetTracking: BudgetTracking = {
      period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      budgetLimit: this.budgetLimit,
      actualSpending: totalMonthlyCost,
      forecasted: Math.round(totalMonthlyCost * 1.05),
      variance,
      variancePercentage: (variance / this.budgetLimit) * 100,
      status,
    };

    return {
      services,
      opportunities,
      budgetTracking,
      timestamp: new Date(),
    };
  }

  /**
   * Process cost data to identify savings and calculate projections
   */
  async processData(rawData: CostOptimizationRawData): Promise<CostOptimizationReport> {
    const services = rawData.services;
    const opportunities = rawData.opportunities;
    const budgetTracking = rawData.budgetTracking;

    // Calculate totals
    const totalMonthlyCost = services.reduce((sum, s) => sum + s.currentMonthlyCost, 0);
    const totalAnnualCost = totalMonthlyCost * 12;

    const previousMonthCost = services.length > 0 ? services.reduce((sum, s) => sum + (s.previousMonthlyCost || s.currentMonthlyCost), 0) : totalMonthlyCost;
    const costChangePercentage = previousMonthCost > 0 ? ((totalMonthlyCost - previousMonthCost) / previousMonthCost) * 100 : 0;

    // Calculate total savings identified
    const totalSavingsIdentified = opportunities.reduce((sum, o) => sum + o.potentialSavingsAmount, 0);

    // Get top expensive services
    const topExpensiveServices = [...services].sort((a, b) => b.currentMonthlyCost - a.currentMonthlyCost).slice(0, 5);

    // Get underutilized services
    const underutilizedServices = services.filter((s) => s.usage < 40).sort((a, b) => a.usage - b.usage);

    // Build monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 11; i >= 0; i--) {
      const month = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
      const monthStr = month.toLocaleString('default', { month: 'short' });
      const baseCost = this.services.reduce((sum, s) => sum + s.baseCost, 0);
      const variation = 0.95 + (Math.random() * 0.1);
      monthlyTrend.push({
        month: monthStr,
        cost: Math.round(baseCost * variation),
      });
    }

    const reportId = `cost-report-${Date.now()}`;
    return {
      reportId,
      timestamp: new Date(),
      totalMonthlyCost: Math.round(totalMonthlyCost),
      totalAnnualCost: Math.round(totalAnnualCost),
      previousMonthCost: Math.round(previousMonthCost),
      costChangePercentage: Math.round(costChangePercentage * 100) / 100,
      serviceBreakdown: services,
      totalSavingsIdentified,
      savingsOpportunities: opportunities.sort((a, b) => b.potentialSavingsAmount - a.potentialSavingsAmount),
      budgetTracking,
      topExpensiveServices,
      underutilizedServices,
      monthlyTrend,
    };
  }

  /**
   * Store cost analysis in the data store
   */
  async updateDashboard(processedData: CostOptimizationReport): Promise<void> {
    supabaseStore.storeCostOptimizationReport(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[CostOptimizationAgent] Dashboard updated with cost optimization report');
  }

  /**
   * Get cost optimization report
   */
  getCostReport(): CostOptimizationReport | undefined {
    return supabaseStore.getCostOptimizationReport();
  }

  /**
   * Get savings opportunities by priority
   */
  getSavingsByPriority(priority: 'low' | 'medium' | 'high' | 'critical'): CostSavingsOpportunity[] {
    const report = supabaseStore.getCostOptimizationReport();
    return report ? report.savingsOpportunities.filter((o) => o.priority === priority) : [];
  }

  /**
   * Get top savings opportunities
   */
  getTopSavingsOpportunities(limit: number = 10): CostSavingsOpportunity[] {
    const report = supabaseStore.getCostOptimizationReport();
    return report ? report.savingsOpportunities.slice(0, limit) : [];
  }
}

/**
 * Factory function to create a CostOptimizationAgent instance
 */
export function createCostOptimizationAgent(config?: Partial<AgentConfig>): CostOptimizationAgent {
  return new CostOptimizationAgent(config);
}
