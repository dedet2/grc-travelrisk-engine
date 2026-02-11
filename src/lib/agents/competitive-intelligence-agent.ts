/**
 * Competitive Intelligence Agent (F-01)
 * Tracks competitor movements, pricing changes, feature launches, market positioning
 * Analyzes competitive landscape and identifies threats/opportunities
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface Competitor {
  competitorId: string;
  name: string;
  industry: string;
  marketShare: number;
  pricingStrategy: 'premium' | 'competitive' | 'value' | 'penetration';
  basePrice: number;
  currentPrice?: number;
  priceChangePercent?: number;
  lastPriceUpdate?: Date;
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  strengthAreas: string[];
  weaknessAreas: string[];
}

export interface FeatureLaunch {
  launchId: string;
  competitorId: string;
  competitorName: string;
  featureName: string;
  description: string;
  launchDate: Date;
  targetAudience: string;
  estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
  ourcapabilityGap?: boolean;
  requiredResponseTime?: string;
}

export interface CompetitiveThreat {
  threatId: string;
  competitorId: string;
  competitorName: string;
  threatType: 'price_reduction' | 'feature_parity' | 'market_expansion' | 'partnership' | 'acquisition';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  recommendedAction: string;
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
}

export interface CompetitiveOpportunity {
  opportunityId: string;
  competitorId: string;
  competitorName: string;
  opportunityType: 'market_gap' | 'weakness_exploitation' | 'partnership' | 'acquisition_target' | 'feature_differentiation';
  description: string;
  potential: 'low' | 'medium' | 'high' | 'critical';
  estimatedValue?: number;
  actionItems: string[];
  implementationComplexity: 'low' | 'medium' | 'high';
  identifiedAt: Date;
}

export interface MarketPositionScore {
  dimensionName: string;
  ourScore: number; // 0-100
  competitorAverageScore: number; // 0-100
  competitiveGap: number; // positive = we're ahead, negative = we're behind
  trend: 'improving' | 'stable' | 'declining';
}

export interface CompetitiveIntelligenceReport {
  reportId: string;
  timestamp: Date;
  analysisDate: Date;
  competitorsMonitored: Competitor[];
  marketLeader: Competitor | null;
  marketChallengeCount: number;
  featureLaunchesDetected: FeatureLaunch[];
  priceChangesDetected: Competitor[];
  identifiedThreats: CompetitiveThreat[];
  identifiedOpportunities: CompetitiveOpportunity[];
  overallMarketTrend: 'consolidating' | 'fragmenting' | 'stable' | 'emerging';
  ourMarketShare: number;
  recommendedStrategies: string[];
  positionScores: MarketPositionScore[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  opportunityWindow?: string;
}

export interface CompetitiveIntelligenceRawData {
  competitors: Competitor[];
  featureLaunches: FeatureLaunch[];
  priceChanges: Competitor[];
  threats: CompetitiveThreat[];
  timestamp: Date;
}

/**
 * Competitive Intelligence Agent
 * Tracks and analyzes competitive landscape
 */
export class CompetitiveIntelligenceAgent extends BaseAgent<
  CompetitiveIntelligenceRawData,
  CompetitiveIntelligenceReport
> {
  private competitors: Competitor[] = [
    {
      competitorId: 'comp-001',
      name: 'TravelShield Pro',
      industry: 'Travel Risk Management',
      marketShare: 28,
      pricingStrategy: 'premium',
      basePrice: 8999,
      marketPosition: 'leader',
      strengthAreas: ['Real-time alerts', 'Mobile app', 'AI-powered insights'],
      weaknessAreas: ['Limited compliance frameworks', 'Poor API documentation', 'High pricing'],
    },
    {
      competitorId: 'comp-002',
      name: 'RiskGuard Global',
      industry: 'Travel Risk Management',
      marketShare: 22,
      pricingStrategy: 'competitive',
      basePrice: 5999,
      marketPosition: 'challenger',
      strengthAreas: ['Cost-effective', 'Strong GRC features', 'Good support'],
      weaknessAreas: ['Outdated UI', 'Limited AI capabilities', 'Slow feature releases'],
    },
    {
      competitorId: 'comp-003',
      name: 'SafeTravel Analytics',
      industry: 'Travel Risk Management',
      marketShare: 18,
      pricingStrategy: 'value',
      basePrice: 4499,
      marketPosition: 'challenger',
      strengthAreas: ['Affordable pricing', 'Easy onboarding', 'Basic reporting'],
      weaknessAreas: ['Limited integrations', 'No advanced analytics', 'Poor scalability'],
    },
    {
      competitorId: 'comp-004',
      name: 'Compliance Connect',
      industry: 'GRC Platform',
      marketShare: 15,
      pricingStrategy: 'premium',
      basePrice: 12999,
      marketPosition: 'leader',
      strengthAreas: ['Comprehensive compliance', 'Enterprise features', 'Strong brand'],
      weaknessAreas: ['Travel risk is secondary', 'Complex setup', 'Expensive'],
    },
    {
      competitorId: 'comp-005',
      name: 'TravelTech Startup',
      industry: 'Travel Risk Management',
      marketShare: 8,
      pricingStrategy: 'penetration',
      basePrice: 2999,
      marketPosition: 'niche',
      strengthAreas: ['Low cost', 'Modern stack', 'Innovative features'],
      weaknessAreas: ['Unproven', 'Small team', 'Limited support'],
    },
  ];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Competitive Intelligence (F-01)',
      description: 'Tracks competitor movements, pricing changes, feature launches, and market positioning',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });
  }

  /**
   * Collect competitive intelligence data
   */
  async collectData(): Promise<CompetitiveIntelligenceRawData> {
    const competitors: Competitor[] = this.competitors.map((comp) => {
      const hasUpdate = Math.random() > 0.7; // 30% chance of update
      const priceVariation = 0.95 + Math.random() * 0.1; // 95-105% of base price

      return {
        ...comp,
        currentPrice: hasUpdate ? Math.round(comp.basePrice * priceVariation) : comp.basePrice,
        priceChangePercent: hasUpdate
          ? Math.round(((priceVariation - 1) * 100 * 10) / 10)
          : 0,
        lastPriceUpdate: hasUpdate ? new Date() : undefined,
      };
    });

    // Simulate feature launches
    const featureLaunches: FeatureLaunch[] = [];
    if (Math.random() > 0.6) {
      const launchingCompetitor = competitors[Math.floor(Math.random() * competitors.length)];
      const features = ['AI Risk Prediction', 'Real-time Alerts', 'Advanced Analytics', 'Mobile App Upgrade'];
      featureLaunches.push({
        launchId: `launch-${Date.now()}`,
        competitorId: launchingCompetitor.competitorId,
        competitorName: launchingCompetitor.name,
        featureName: features[Math.floor(Math.random() * features.length)],
        description: 'New feature launched by competitor',
        launchDate: new Date(),
        targetAudience: 'Enterprise customers',
        estimatedImpact: Math.random() > 0.5 ? 'high' : 'medium',
        ourcapabilityGap: Math.random() > 0.6,
      });
    }

    // Detect price changes
    const priceChanges = competitors.filter((c) => c.priceChangePercent !== undefined && c.priceChangePercent !== 0);

    // Generate threats
    const threats: CompetitiveThreat[] = [];
    if (priceChanges.length > 0) {
      const discountingCompetitor = priceChanges[0];
      threats.push({
        threatId: `threat-${Date.now()}`,
        competitorId: discountingCompetitor.competitorId,
        competitorName: discountingCompetitor.name,
        threatType: 'price_reduction',
        description: `${discountingCompetitor.name} reduced prices by ${Math.abs(discountingCompetitor.priceChangePercent || 0)}%`,
        severity: 'high',
        detectedAt: new Date(),
        recommendedAction: 'Review pricing strategy and value proposition',
        timeframe: 'immediate',
      });
    }

    return {
      competitors,
      featureLaunches,
      priceChanges,
      threats,
      timestamp: new Date(),
    };
  }

  /**
   * Process competitive intelligence to identify threats and opportunities
   */
  async processData(rawData: CompetitiveIntelligenceRawData): Promise<CompetitiveIntelligenceReport> {
    const competitors = rawData.competitors;
    const featureLaunches = rawData.featureLaunches;
    const threats = rawData.threats;

    // Calculate market share
    const totalMarketShare = competitors.reduce((sum, c) => sum + c.marketShare, 0);
    const ourMarketShare = Math.max(0, 100 - totalMarketShare);

    // Identify market leader
    const marketLeader = competitors.reduce((prev, current) =>
      prev.marketShare > current.marketShare ? prev : current
    );

    // Identify market challenges
    const marketChallengeCount = competitors.filter((c) => c.marketPosition === 'challenger').length;

    // Identify opportunities
    const opportunities: CompetitiveOpportunity[] = [];

    // Opportunity 1: Price leader gap
    if (competitors.some((c) => c.pricingStrategy === 'penetration')) {
      opportunities.push({
        opportunityId: `opp-${Date.now()}-1`,
        competitorId: 'us',
        competitorName: 'Our Company',
        opportunityType: 'feature_differentiation',
        description: 'Penetration pricing competitors offer basic features. Opportunity to differentiate with premium capabilities.',
        potential: 'high',
        estimatedValue: 5000000,
        actionItems: [
          'Develop premium feature tier',
          'Create value comparison matrix',
          'Launch targeted marketing campaign',
        ],
        implementationComplexity: 'medium',
        identifiedAt: new Date(),
      });
    }

    // Opportunity 2: Market gap
    opportunities.push({
      opportunityId: `opp-${Date.now()}-2`,
      competitorId: 'us',
      competitorName: 'Our Company',
      opportunityType: 'market_gap',
      description: 'Mid-market segment (50-500 employees) underserved. Premium solutions too expensive, budget solutions too basic.',
      potential: 'high',
      estimatedValue: 8000000,
      actionItems: [
        'Create mid-market product tier',
        'Develop SMB-focused marketing',
        'Build partner ecosystem',
      ],
      implementationComplexity: 'high',
      identifiedAt: new Date(),
    });

    // Calculate position scores
    const positionScores: MarketPositionScore[] = [
      {
        dimensionName: 'Feature Completeness',
        ourScore: 78,
        competitorAverageScore: 72,
        competitiveGap: 6,
        trend: 'improving',
      },
      {
        dimensionName: 'Pricing Competitiveness',
        ourScore: 72,
        competitorAverageScore: 68,
        competitiveGap: 4,
        trend: 'stable',
      },
      {
        dimensionName: 'Customer Support',
        ourScore: 85,
        competitorAverageScore: 70,
        competitiveGap: 15,
        trend: 'stable',
      },
      {
        dimensionName: 'Innovation Velocity',
        ourScore: 68,
        competitorAverageScore: 72,
        competitiveGap: -4,
        trend: 'improving',
      },
      {
        dimensionName: 'Market Brand Recognition',
        ourScore: 55,
        competitorAverageScore: 65,
        competitiveGap: -10,
        trend: 'improving',
      },
    ];

    // Determine threat level
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (featureLaunches.length > 2 || threats.length > 1) {
      threatLevel = 'high';
    } else if (featureLaunches.length > 0 || threats.length > 0) {
      threatLevel = 'medium';
    }

    // Recommended strategies
    const strategies = [
      'Focus on product differentiation in underserved market segments',
      'Maintain pricing competitiveness while emphasizing superior support',
      'Accelerate feature development, especially AI-powered capabilities',
      'Strengthen brand awareness through targeted marketing campaigns',
      'Build strategic partnerships to expand market reach',
    ];

    return {
      reportId: `comp-report-${Date.now()}`,
      timestamp: new Date(),
      analysisDate: rawData.timestamp,
      competitorsMonitored: competitors,
      marketLeader,
      marketChallengeCount,
      featureLaunchesDetected: featureLaunches,
      priceChangesDetected: rawData.priceChanges,
      identifiedThreats: threats,
      identifiedOpportunities: opportunities,
      overallMarketTrend: 'consolidating',
      ourMarketShare,
      recommendedStrategies: strategies,
      positionScores,
      threatLevel,
      opportunityWindow: '12 months',
    };
  }

  /**
   * Store competitive intelligence report
   */
  async updateDashboard(processedData: CompetitiveIntelligenceReport): Promise<void> {
    inMemoryStore.storeCompetitiveIntelligenceReport(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[CompetitiveIntelligenceAgent] Dashboard updated with competitive intelligence report');
  }

  /**
   * Get competitive intelligence report
   */
  getCompetitiveReport(): CompetitiveIntelligenceReport | undefined {
    return inMemoryStore.getCompetitiveIntelligenceReport();
  }

  /**
   * Get identified threats
   */
  getThreats(): CompetitiveThreat[] {
    const report = inMemoryStore.getCompetitiveIntelligenceReport();
    return report ? report.identifiedThreats : [];
  }

  /**
   * Get identified opportunities
   */
  getOpportunities(): CompetitiveOpportunity[] {
    const report = inMemoryStore.getCompetitiveIntelligenceReport();
    return report ? report.identifiedOpportunities : [];
  }
}

/**
 * Factory function to create a CompetitiveIntelligenceAgent instance
 */
export function createCompetitiveIntelligenceAgent(config?: Partial<AgentConfig>): CompetitiveIntelligenceAgent {
  return new CompetitiveIntelligenceAgent(config);
}
