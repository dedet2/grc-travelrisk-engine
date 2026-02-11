/**
 * Analytics Dashboard Agent (E-05)
 * Aggregates cross-platform analytics and generates insights
 * Calculates KPIs and identifies trends
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface ChannelMetrics {
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
  ctr: number; // Click-through rate
  conversionRate: number;
}

export interface KPI {
  name: string;
  value: number;
  target: number;
  status: 'on-track' | 'at-risk' | 'exceeded';
  percentageOfTarget: number;
  trend: number; // percentage change
}

export interface TrendData {
  date: Date;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface DashboardMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  overallCTR: number;
  overallConversionRate: number;
  averageROI: number;
  channelMetrics: ChannelMetrics[];
  topKPIs: KPI[];
  trends: TrendData[];
  topPerformingContent: { contentId: string; title: string; conversions: number }[];
  insights: string[];
  dashboardHealthScore: number; // 0-100
  timestamp: Date;
}

export interface AnalyticsDashboardRawData {
  channelMetrics: ChannelMetrics[];
  historicalData: TrendData[];
}

/**
 * Analytics Dashboard Agent
 * Aggregates cross-platform analytics and generates insights
 */
export class AnalyticsDashboardAgent extends BaseAgent<AnalyticsDashboardRawData, DashboardMetrics> {
  private channelMetrics: Map<string, ChannelMetrics> = new Map();
  private historicalData: TrendData[] = [];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Analytics Dashboard Agent (E-05)',
      description: 'Aggregates cross-platform analytics and generates actionable insights',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();

    const mockChannelMetrics: ChannelMetrics[] = [
      {
        channel: 'Blog',
        impressions: 45000,
        clicks: 2250,
        conversions: 225,
        revenue: 22500,
        roi: 450,
        ctr: 5.0,
        conversionRate: 10.0,
      },
      {
        channel: 'Social Media',
        impressions: 120000,
        clicks: 4800,
        conversions: 288,
        revenue: 28800,
        roi: 360,
        ctr: 4.0,
        conversionRate: 6.0,
      },
      {
        channel: 'Email',
        impressions: 15000,
        clicks: 2250,
        conversions: 450,
        revenue: 45000,
        roi: 900,
        ctr: 15.0,
        conversionRate: 20.0,
      },
      {
        channel: 'Organic Search',
        impressions: 85000,
        clicks: 5100,
        conversions: 510,
        revenue: 51000,
        roi: 600,
        ctr: 6.0,
        conversionRate: 10.0,
      },
      {
        channel: 'Paid Ads',
        impressions: 200000,
        clicks: 8000,
        conversions: 400,
        revenue: 40000,
        roi: 200,
        ctr: 4.0,
        conversionRate: 5.0,
      },
    ];

    // Generate 30 days of historical data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      this.historicalData.push({
        date,
        impressions: Math.floor(50000 + Math.random() * 30000),
        clicks: Math.floor(2500 + Math.random() * 1500),
        conversions: Math.floor(200 + Math.random() * 150),
        revenue: Math.floor(20000 + Math.random() * 15000),
      });
    }

    for (const metrics of mockChannelMetrics) {
      this.channelMetrics.set(metrics.channel, metrics);
    }
  }

  /**
   * Collect analytics data from all channels
   */
  async collectData(): Promise<AnalyticsDashboardRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      channelMetrics: Array.from(this.channelMetrics.values()),
      historicalData: this.historicalData,
    };
  }

  /**
   * Process data to calculate dashboard metrics
   */
  async processData(rawData: AnalyticsDashboardRawData): Promise<DashboardMetrics> {
    const channels = rawData.channelMetrics;
    const history = rawData.historicalData;

    // Calculate totals
    const totalImpressions = channels.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = channels.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = channels.reduce((sum, c) => sum + c.conversions, 0);
    const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);

    // Calculate overall rates
    const overallCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
    const overallConversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100) : 0;
    const averageROI = channels.length > 0 ? channels.reduce((sum, c) => sum + c.roi, 0) / channels.length : 0;

    // Calculate top KPIs
    const topKPIs: KPI[] = [
      {
        name: 'Total Revenue',
        value: Math.round(totalRevenue),
        target: 150000,
        status: totalRevenue >= 150000 ? 'exceeded' : totalRevenue >= 120000 ? 'on-track' : 'at-risk',
        percentageOfTarget: Math.round((totalRevenue / 150000) * 100),
        trend: Math.round((Math.random() * 20 - 5) * 10) / 10,
      },
      {
        name: 'Conversion Rate',
        value: Math.round(overallConversionRate * 10) / 10,
        target: 8,
        status: overallConversionRate >= 8 ? 'exceeded' : overallConversionRate >= 6 ? 'on-track' : 'at-risk',
        percentageOfTarget: Math.round((overallConversionRate / 8) * 100),
        trend: Math.round((Math.random() * 10 - 2) * 10) / 10,
      },
      {
        name: 'Click-Through Rate',
        value: Math.round(overallCTR * 10) / 10,
        target: 5,
        status: overallCTR >= 5 ? 'exceeded' : overallCTR >= 4 ? 'on-track' : 'at-risk',
        percentageOfTarget: Math.round((overallCTR / 5) * 100),
        trend: Math.round((Math.random() * 15 - 5) * 10) / 10,
      },
      {
        name: 'Average ROI',
        value: Math.round(averageROI),
        target: 400,
        status: averageROI >= 400 ? 'exceeded' : averageROI >= 300 ? 'on-track' : 'at-risk',
        percentageOfTarget: Math.round((averageROI / 400) * 100),
        trend: Math.round((Math.random() * 25 - 5) * 10) / 10,
      },
    ];

    // Top performing content (simulated)
    const topPerformingContent = [
      { contentId: 'content-001', title: 'ISO 27001 Compliance Guide', conversions: 85 },
      { contentId: 'content-002', title: 'Travel Risk Assessment', conversions: 72 },
      { contentId: 'content-003', title: 'SOC 2 Best Practices', conversions: 68 },
    ];

    // Generate insights
    const insights: string[] = [];

    const emailChannel = channels.find((c) => c.channel === 'Email');
    if (emailChannel && emailChannel.roi > averageROI * 1.5) {
      insights.push('Email campaigns significantly outperform other channels - consider increasing investment');
    }

    const paidAds = channels.find((c) => c.channel === 'Paid Ads');
    if (paidAds && paidAds.conversionRate < 5) {
      insights.push('Paid ads conversion rate is below target - consider optimization');
    }

    if (overallConversionRate > 8) {
      insights.push('Overall conversion rate exceeds target - maintain current strategies');
    }

    const organicSearch = channels.find((c) => c.channel === 'Organic Search');
    if (organicSearch) {
      insights.push(`Organic search is a strong performer with ${organicSearch.conversions} conversions`);
    }

    insights.push('Social media reach is high but conversion rate needs improvement');

    // Dashboard health score
    const healthScore =
      (Math.min(topKPIs[0].percentageOfTarget, 100) +
        Math.min(topKPIs[1].percentageOfTarget, 100) +
        Math.min(topKPIs[2].percentageOfTarget, 100) +
        Math.min(topKPIs[3].percentageOfTarget, 100)) /
      4;

    return {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalRevenue,
      overallCTR: Math.round(overallCTR * 100) / 100,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      averageROI: Math.round(averageROI),
      channelMetrics: channels,
      topKPIs,
      trends: history.slice(-30), // Last 30 days
      topPerformingContent,
      insights,
      dashboardHealthScore: Math.round(healthScore),
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: DashboardMetrics): Promise<void> {
    inMemoryStore.storeChannelMetrics(processedData.channelMetrics);
    inMemoryStore.storeDashboardMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[AnalyticsDashboardAgent] Dashboard updated with analytics metrics');
  }

  /**
   * Update channel metrics
   */
  async updateChannelMetrics(
    channel: string,
    impressions: number,
    clicks: number,
    conversions: number,
    revenue: number
  ): Promise<ChannelMetrics> {
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const roi = (revenue / (revenue > 0 ? revenue / 2 : 1)) * 100; // Simplified ROI calculation

    const metrics: ChannelMetrics = {
      channel,
      impressions,
      clicks,
      conversions,
      revenue,
      roi,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };

    this.channelMetrics.set(channel, metrics);
    return metrics;
  }

  /**
   * Add historical data point
   */
  async addTrendDataPoint(
    impressions: number,
    clicks: number,
    conversions: number,
    revenue: number
  ): Promise<TrendData> {
    const dataPoint: TrendData = {
      date: new Date(),
      impressions,
      clicks,
      conversions,
      revenue,
    };

    this.historicalData.push(dataPoint);

    // Keep only last 90 days
    if (this.historicalData.length > 90) {
      this.historicalData.shift();
    }

    return dataPoint;
  }

  /**
   * Get channel metrics
   */
  getChannelMetrics(): ChannelMetrics[] {
    return Array.from(this.channelMetrics.values());
  }

  /**
   * Get historical trends
   */
  getHistoricalTrends(days: number = 30): TrendData[] {
    return this.historicalData.slice(-days);
  }

  /**
   * Get top performing channels
   */
  getTopPerformingChannels(metric: 'revenue' | 'conversions' | 'roi' = 'revenue'): ChannelMetrics[] {
    const channels = Array.from(this.channelMetrics.values());
    return channels.sort((a, b) => {
      if (metric === 'revenue') return b.revenue - a.revenue;
      if (metric === 'conversions') return b.conversions - a.conversions;
      return b.roi - a.roi;
    });
  }
}

/**
 * Factory function to create an AnalyticsDashboardAgent instance
 */
export function createAnalyticsDashboardAgent(config?: Partial<AgentConfig>): AnalyticsDashboardAgent {
  return new AnalyticsDashboardAgent(config);
}
