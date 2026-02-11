/**
 * Revenue Forecasting Agent (F-02)
 * Predicts revenue trends, analyzes pipeline, models scenarios
 * Builds revenue projections with confidence intervals
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface SalesMetric {
  month: string;
  revenue: number;
  deals: number;
  avgDealSize: number;
  winRate: number;
  pipelineValue: number;
}

export interface PipelineStage {
  stageName: string;
  stageOrder: number;
  prospectCount: number;
  totalValue: number;
  conversionRate: number;
  avgCycleDays: number;
}

export interface RevenueForecast {
  forecastId: string;
  scenarioName: 'conservative' | 'moderate' | 'aggressive';
  quarterLabel: string;
  projectedRevenue: number;
  confidenceInterval: {
    low: number;
    mid: number;
    high: number;
  };
  confidenceLevel: number; // 0-100
  assumptions: string[];
  riskFactors: string[];
}

export interface RevenueForecastingRawData {
  historicalMetrics: SalesMetric[];
  currentPipeline: PipelineStage[];
  marketGrowthRate: number;
  seasonalityFactor: number;
  competitiveIntensity: number;
  timestamp: Date;
}

export interface RevenueRiskFactor {
  riskId: string;
  factorName: string;
  description: string;
  impactOnRevenue: number; // percentage, can be negative
  probability: number; // 0-1
  expectedImpact: number; // probability * impact
  mitigationStrategy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RevenueScenarioModel {
  modelId: string;
  baselineRevenue: number;
  conservative: RevenueForecast;
  moderate: RevenueForecast;
  aggressive: RevenueForecast;
  recommendations: string[];
}

export interface RevenueForecastingReport {
  reportId: string;
  timestamp: Date;
  analysisDate: Date;
  historicalPerformance: SalesMetric[];
  pipelineAnalysis: PipelineStage[];
  lastMonthRevenue: number;
  lastQuarterRevenue: number;
  lastYearRevenue: number;
  ytyGrowthRate: number;
  qoqGrowthRate: number;
  momGrowthRate: number;
  currentPipelineValue: number;
  pipelineConversionRate: number;
  forecastModels: RevenueScenarioModel;
  riskFactors: RevenueRiskFactor[];
  topRisks: RevenueRiskFactor[];
  topOpportunities: string[];
  recommendedActions: string[];
  nextReviewDate: Date;
}

/**
 * Revenue Forecasting Agent
 * Predicts revenue trends and scenarios
 */
export class RevenueForecastingAgent extends BaseAgent<RevenueForecastingRawData, RevenueForecastingReport> {
  private baselineMonthlyRevenue = 250000;
  private growthRate = 0.08; // 8% monthly growth

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Revenue Forecasting (F-02)',
      description: 'Predicts revenue trends, analyzes pipeline, models scenarios for financial planning',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });
  }

  /**
   * Collect sales data, pipeline metrics, and market conditions
   */
  async collectData(): Promise<RevenueForecastingRawData> {
    // Generate historical metrics (last 12 months)
    const historicalMetrics: SalesMetric[] = [];
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - 11);

    for (let i = 0; i < 12; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setMonth(currentDate.getMonth() + i);
      const monthLabel = currentDate.toLocaleString('default', { month: 'short', year: '2d' });

      const monthlyRevenue = Math.round(this.baselineMonthlyRevenue * Math.pow(1 + this.growthRate, i));
      const deals = Math.floor(8 + Math.random() * 8); // 8-16 deals per month
      const avgDealSize = Math.round(monthlyRevenue / deals);

      historicalMetrics.push({
        month: monthLabel,
        revenue: monthlyRevenue,
        deals,
        avgDealSize,
        winRate: 0.25 + Math.random() * 0.1, // 25-35%
        pipelineValue: monthlyRevenue * 4, // Pipeline ~4x monthly revenue
      });
    }

    // Current pipeline analysis
    const totalPipelineValue = historicalMetrics[11].pipelineValue;
    const currentPipeline: PipelineStage[] = [
      {
        stageName: 'Discovery',
        stageOrder: 1,
        prospectCount: Math.floor(totalPipelineValue / 15000),
        totalValue: Math.round(totalPipelineValue * 0.15),
        conversionRate: 0.3,
        avgCycleDays: 14,
      },
      {
        stageName: 'Proposal',
        stageOrder: 2,
        prospectCount: Math.floor(totalPipelineValue / 25000),
        totalValue: Math.round(totalPipelineValue * 0.35),
        conversionRate: 0.4,
        avgCycleDays: 21,
      },
      {
        stageName: 'Negotiation',
        stageOrder: 3,
        prospectCount: Math.floor(totalPipelineValue / 40000),
        totalValue: Math.round(totalPipelineValue * 0.35),
        conversionRate: 0.6,
        avgCycleDays: 14,
      },
      {
        stageName: 'Close',
        stageOrder: 4,
        prospectCount: Math.floor(totalPipelineValue / 50000),
        totalValue: Math.round(totalPipelineValue * 0.15),
        conversionRate: 0.85,
        avgCycleDays: 7,
      },
    ];

    return {
      historicalMetrics,
      currentPipeline,
      marketGrowthRate: 0.12, // Industry growth 12% YoY
      seasonalityFactor: 1.0 + Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 30)) * 0.1,
      competitiveIntensity: 0.6, // Moderate competitive intensity (0-1)
      timestamp: new Date(),
    };
  }

  /**
   * Process data to build revenue projections and scenarios
   */
  async processData(rawData: RevenueForecastingRawData): Promise<RevenueForecastingReport> {
    const historicalMetrics = rawData.historicalMetrics;
    const currentPipeline = rawData.currentPipeline;

    // Calculate historical metrics
    const lastMonth = historicalMetrics[11];
    const lastQuarter = historicalMetrics.slice(9).reduce((sum, m) => sum + m.revenue, 0);
    const lastYear = historicalMetrics.reduce((sum, m) => sum + m.revenue, 0);

    const prevYear = Math.round(lastYear / 1.08); // Estimate prior year with reverse growth
    const ytyGrowthRate = ((lastYear - prevYear) / prevYear) * 100;
    const qoqGrowthRate = ((lastQuarter - historicalMetrics.slice(6, 9).reduce((sum, m) => sum + m.revenue, 0)) /
                          historicalMetrics.slice(6, 9).reduce((sum, m) => sum + m.revenue, 0)) * 100;
    const momGrowthRate = ((lastMonth.revenue - historicalMetrics[10].revenue) / historicalMetrics[10].revenue) * 100;

    // Calculate pipeline metrics
    const currentPipelineValue = currentPipeline.reduce((sum, stage) => sum + stage.totalValue, 0);
    const weightedConversionRate = currentPipeline.reduce((sum, stage) => {
      const stageRevenue = stage.totalValue;
      return sum + (stageRevenue / currentPipelineValue) * stage.conversionRate;
    }, 0);

    // Build revenue forecast models
    const nextQuarterBaseRevenue = lastMonth.revenue * Math.pow(1 + this.growthRate / 3, 3);

    const createForecast = (
      scenario: 'conservative' | 'moderate' | 'aggressive',
      multiplier: number
    ): RevenueForecast => {
      const baselineRevenue = nextQuarterBaseRevenue * 3 * multiplier;
      const variance = baselineRevenue * (scenario === 'conservative' ? 0.15 : scenario === 'moderate' ? 0.1 : 0.2);

      return {
        forecastId: `forecast-${Date.now()}-${scenario}`,
        scenarioName: scenario,
        quarterLabel: 'Q2 2025',
        projectedRevenue: Math.round(baselineRevenue),
        confidenceInterval: {
          low: Math.round(baselineRevenue - variance),
          mid: Math.round(baselineRevenue),
          high: Math.round(baselineRevenue + variance),
        },
        confidenceLevel: scenario === 'conservative' ? 85 : scenario === 'moderate' ? 75 : 65,
        assumptions: this.getAssumptions(scenario),
        riskFactors: this.getRiskFactors(scenario),
      };
    };

    const forecastModels: RevenueScenarioModel = {
      modelId: `model-${Date.now()}`,
      baselineRevenue: nextQuarterBaseRevenue * 3,
      conservative: createForecast('conservative', 0.85),
      moderate: createForecast('moderate', 1.0),
      aggressive: createForecast('aggressive', 1.2),
      recommendations: [
        'Focus on improving win rate in Proposal stage',
        'Accelerate pipeline development in high-value segments',
        'Optimize sales cycle time in Negotiation stage',
        'Implement upsell/cross-sell program for existing customers',
      ],
    };

    // Identify risk factors
    const riskFactors: RevenueRiskFactor[] = [
      {
        riskId: `risk-${Date.now()}-1`,
        factorName: 'Competitive Pressure',
        description: 'Market competition could impact win rates and deal sizes',
        impactOnRevenue: -15,
        probability: 0.6,
        expectedImpact: -9,
        mitigationStrategy: 'Strengthen product differentiation and customer success',
        priority: 'high',
      },
      {
        riskId: `risk-${Date.now()}-2`,
        factorName: 'Market Slowdown',
        description: 'Economic downturn could reduce deal flow and deal sizes',
        impactOnRevenue: -25,
        probability: 0.3,
        expectedImpact: -7.5,
        mitigationStrategy: 'Develop value-based pricing and reduce-friction offerings',
        priority: 'medium',
      },
      {
        riskId: `risk-${Date.now()}-3`,
        factorName: 'Sales Team Turnover',
        description: 'Loss of key sales personnel could disrupt pipeline',
        impactOnRevenue: -20,
        probability: 0.2,
        expectedImpact: -4,
        mitigationStrategy: 'Implement sales process documentation and succession planning',
        priority: 'medium',
      },
      {
        riskId: `risk-${Date.now()}-4`,
        factorName: 'Longer Sales Cycles',
        description: 'Extended deal cycles reduce quarterly revenue recognition',
        impactOnRevenue: -12,
        probability: 0.5,
        expectedImpact: -6,
        mitigationStrategy: 'Improve sales methodology and qualification processes',
        priority: 'high',
      },
    ];

    const topRisks = riskFactors.sort((a, b) => Math.abs(b.expectedImpact) - Math.abs(a.expectedImpact)).slice(0, 3);

    const topOpportunities = [
      'Expand into mid-market segment with scaled pricing model',
      'Develop vertical-specific solutions for regulated industries',
      'Build strategic partnerships to expand sales channels',
      'Launch self-serve/freemium offering to increase top-of-funnel',
      'Implement customer expansion program for 20% ARR growth',
    ];

    return {
      reportId: `revenue-report-${Date.now()}`,
      timestamp: new Date(),
      analysisDate: rawData.timestamp,
      historicalPerformance: historicalMetrics,
      pipelineAnalysis: currentPipeline,
      lastMonthRevenue: lastMonth.revenue,
      lastQuarterRevenue: Math.round(lastQuarter),
      lastYearRevenue: Math.round(lastYear),
      ytyGrowthRate: Math.round(ytyGrowthRate * 100) / 100,
      qoqGrowthRate: Math.round(qoqGrowthRate * 100) / 100,
      momGrowthRate: Math.round(momGrowthRate * 100) / 100,
      currentPipelineValue: Math.round(currentPipelineValue),
      pipelineConversionRate: Math.round(weightedConversionRate * 10000) / 100,
      forecastModels,
      riskFactors,
      topRisks,
      topOpportunities,
      recommendedActions: [
        'Increase sales headcount to support pipeline growth',
        'Implement CRM best practices and pipeline management',
        'Develop account-based marketing for strategic accounts',
        'Create revenue retention program to reduce churn',
      ],
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }

  /**
   * Store revenue forecast report
   */
  async updateDashboard(processedData: RevenueForecastingReport): Promise<void> {
    inMemoryStore.storeRevenueForecastingReport(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[RevenueForecastingAgent] Dashboard updated with revenue forecasting report');
  }

  /**
   * Get revenue forecast report
   */
  getRevenueReport(): RevenueForecastingReport | undefined {
    return inMemoryStore.getRevenueForecastingReport();
  }

  /**
   * Get revenue forecast scenarios
   */
  getScenarios(): RevenueScenarioModel | undefined {
    const report = inMemoryStore.getRevenueForecastingReport();
    return report ? report.forecastModels : undefined;
  }

  private getAssumptions(scenario: string): string[] {
    switch (scenario) {
      case 'conservative':
        return [
          'Win rate remains at current 25% level',
          'Average deal size decreases 5% due to pricing pressure',
          'Sales cycle extends by 1-2 weeks',
          'No significant new product launches',
        ];
      case 'aggressive':
        return [
          'Win rate improves to 35% with better messaging',
          'Average deal size increases 15% from upselling',
          'Sales cycle compresses by 1-2 weeks',
          'New product launches drive 20% additional pipeline',
        ];
      default:
        return [
          'Win rate improves to 30% with current initiatives',
          'Average deal size remains stable',
          'Sales cycle remains consistent',
          'Moderate market growth of 8% assumed',
        ];
    }
  }

  private getRiskFactors(scenario: string): string[] {
    switch (scenario) {
      case 'conservative':
        return [
          'Competitive pricing pressure',
          'Extended deal cycles',
          'Market slowdown',
          'Sales team changes',
        ];
      case 'aggressive':
        return [
          'Over-reliance on successful product launch',
          'Execution risk on new initiatives',
          'Market saturation in core segment',
        ];
      default:
        return [
          'Moderate competitive pressure',
          'Potential market headwinds',
          'Sales execution risks',
        ];
    }
  }
}

/**
 * Factory function to create a RevenueForecastingAgent instance
 */
export function createRevenueForecastingAgent(config?: Partial<AgentConfig>): RevenueForecastingAgent {
  return new RevenueForecastingAgent(config);
}
