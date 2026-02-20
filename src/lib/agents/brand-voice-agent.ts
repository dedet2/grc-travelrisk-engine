/**
 * Brand Voice Agent (E-04)
 * Ensures brand consistency across content
 * Analyzes tone and messaging alignment
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface BrandGuidelineMetric {
  metricName: string;
  targetValue: string;
  currentValue: string;
  complianceScore: number; // 0-100
  status: 'compliant' | 'warning' | 'non-compliant';
}

export interface ContentAnalysis {
  contentId: string;
  title: string;
  channel: string;
  toneAnalysis: {
    professional: number;
    friendly: number;
    authoritative: number;
    conversational: number;
  };
  messagingAlignment: {
    coreValues: number;
    keyMessages: number;
    audienceVoice: number;
  };
  consistencyScore: number; // 0-100
  issues: string[];
  recommendations: string[];
  analyzedAt: Date;
}

export interface BrandVoiceMetrics {
  totalAnalyzed: number;
  averageConsistencyScore: number;
  compliantContent: number;
  contentNeedingReview: number;
  contentNonCompliant: number;
  commonIssues: { issue: string; frequency: number }[];
  topRecommendations: string[];
  recentAnalyses: ContentAnalysis[];
  brandHealthScore: number; // 0-100
  consistencyTrend: number; // percentage change
  timestamp: Date;
}

export interface BrandVoiceRawData {
  analyses: ContentAnalysis[];
}

/**
 * Brand Voice Agent
 * Ensures brand consistency across content
 */
export class BrandVoiceAgent extends BaseAgent<BrandVoiceRawData, BrandVoiceMetrics> {
  private analyses: Map<string, ContentAnalysis> = new Map();
  private brandGuidelines = {
    tone: ['professional', 'authoritative', 'accessible'],
    coreValues: ['Trust', 'Innovation', 'Excellence', 'Customer Focus'],
    keyMessages: ['Simplify GRC', 'Reduce Risk', 'Enable Compliance', 'Drive Growth'],
    avoidWords: ['jargon-heavy', 'overly technical', 'sales-y'],
  };

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Brand Voice Agent (E-04)',
      description: 'Ensures brand consistency across content, analyzes tone and messaging',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();

    const mockAnalyses: ContentAnalysis[] = [
      {
        contentId: 'content-001',
        title: 'Getting Started with GRC',
        channel: 'blog',
        toneAnalysis: {
          professional: 0.85,
          friendly: 0.75,
          authoritative: 0.88,
          conversational: 0.6,
        },
        messagingAlignment: {
          coreValues: 0.9,
          keyMessages: 0.85,
          audienceVoice: 0.8,
        },
        consistencyScore: 87,
        issues: [],
        recommendations: ['Consider adding more customer examples'],
        analyzedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        contentId: 'content-002',
        title: 'Travel Risk Assessment Guide',
        channel: 'whitepaper',
        toneAnalysis: {
          professional: 0.92,
          friendly: 0.55,
          authoritative: 0.95,
          conversational: 0.4,
        },
        messagingAlignment: {
          coreValues: 0.88,
          keyMessages: 0.8,
          audienceVoice: 0.75,
        },
        consistencyScore: 85,
        issues: ['Tone slightly too formal for audience', 'Could be more conversational'],
        recommendations: [
          'Add relatable examples',
          'Simplify technical explanations',
          'Include customer success stories',
        ],
        analyzedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        contentId: 'content-003',
        title: 'Q1 Compliance Update',
        channel: 'email',
        toneAnalysis: {
          professional: 0.75,
          friendly: 0.82,
          authoritative: 0.7,
          conversational: 0.78,
        },
        messagingAlignment: {
          coreValues: 0.92,
          keyMessages: 0.88,
          audienceVoice: 0.85,
        },
        consistencyScore: 89,
        issues: [],
        recommendations: [],
        analyzedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        contentId: 'content-004',
        title: 'Risk Management Best Practices',
        channel: 'blog',
        toneAnalysis: {
          professional: 0.88,
          friendly: 0.68,
          authoritative: 0.92,
          conversational: 0.55,
        },
        messagingAlignment: {
          coreValues: 0.85,
          keyMessages: 0.82,
          audienceVoice: 0.72,
        },
        consistencyScore: 82,
        issues: ['Some sections lack audience connection', 'Technical jargon in one section'],
        recommendations: ['Add more context for non-technical readers', 'Include real-world examples'],
        analyzedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        contentId: 'content-005',
        title: 'SOC 2 Compliance Tips',
        channel: 'social',
        toneAnalysis: {
          professional: 0.82,
          friendly: 0.88,
          authoritative: 0.8,
          conversational: 0.85,
        },
        messagingAlignment: {
          coreValues: 0.87,
          keyMessages: 0.9,
          audienceVoice: 0.88,
        },
        consistencyScore: 88,
        issues: [],
        recommendations: [],
        analyzedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const analysis of mockAnalyses) {
      this.analyses.set(analysis.contentId, analysis);
    }
  }

  /**
   * Collect brand voice analysis data
   */
  async collectData(): Promise<BrandVoiceRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      analyses: Array.from(this.analyses.values()),
    };
  }

  /**
   * Process data to calculate brand voice metrics
   */
  async processData(rawData: BrandVoiceRawData): Promise<BrandVoiceMetrics> {
    const analyses = rawData.analyses;

    // Calculate averages
    const averageConsistencyScore =
      analyses.length > 0
        ? Math.round((analyses.reduce((sum, a) => sum + a.consistencyScore, 0) / analyses.length) * 10) / 10
        : 0;

    // Categorize by compliance
    const compliantContent = analyses.filter((a) => a.consistencyScore >= 85).length;
    const contentNeedingReview = analyses.filter((a) => a.consistencyScore >= 75 && a.consistencyScore < 85).length;
    const contentNonCompliant = analyses.filter((a) => a.consistencyScore < 75).length;

    // Common issues
    const issueFrequency: { [issue: string]: number } = {};
    for (const analysis of analyses) {
      for (const issue of analysis.issues) {
        issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
      }
    }

    const commonIssues = Object.entries(issueFrequency)
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Top recommendations
    const recommendationMap: { [rec: string]: number } = {};
    for (const analysis of analyses) {
      for (const rec of analysis.recommendations) {
        recommendationMap[rec] = (recommendationMap[rec] || 0) + 1;
      }
    }

    const topRecommendations = Object.entries(recommendationMap)
      .map(([rec]) => rec)
      .slice(0, 5);

    // Recent analyses
    const recentAnalyses = analyses
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime())
      .slice(0, 5);

    // Brand health score
    const brandHealthScore = Math.round(averageConsistencyScore * 1.1); // Slightly boost for overall health

    // Consistency trend (simulated)
    const consistencyTrend = Math.round((Math.random() * 15 - 2) * 10) / 10;

    return {
      totalAnalyzed: analyses.length,
      averageConsistencyScore,
      compliantContent,
      contentNeedingReview,
      contentNonCompliant,
      commonIssues,
      topRecommendations,
      recentAnalyses,
      brandHealthScore: Math.min(100, brandHealthScore),
      consistencyTrend,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: BrandVoiceMetrics): Promise<void> {
    supabaseStore.storeContentAnalyses(Array.from(this.analyses.values()));
    supabaseStore.storeBrandVoiceMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[BrandVoiceAgent] Dashboard updated with brand voice metrics');
  }

  /**
   * Analyze content for brand consistency
   */
  async analyzeContent(
    contentId: string,
    title: string,
    content: string,
    channel: string
  ): Promise<ContentAnalysis> {
    // Simulate tone and messaging analysis
    const toneAnalysis = {
      professional: 0.75 + Math.random() * 0.2,
      friendly: 0.6 + Math.random() * 0.3,
      authoritative: 0.7 + Math.random() * 0.25,
      conversational: 0.5 + Math.random() * 0.3,
    };

    const messagingAlignment = {
      coreValues: 0.75 + Math.random() * 0.2,
      keyMessages: 0.7 + Math.random() * 0.25,
      audienceVoice: 0.65 + Math.random() * 0.3,
    };

    const avgAlignment = (messagingAlignment.coreValues + messagingAlignment.keyMessages + messagingAlignment.audienceVoice) / 3;
    const consistencyScore = Math.round(avgAlignment * 100);

    // Generate issues and recommendations based on scores
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (toneAnalysis.professional < 0.7) {
      issues.push('Tone could be more professional');
      recommendations.push('Review formal language and structure');
    }

    if (messagingAlignment.coreValues < 0.75) {
      issues.push('Core values not clearly reflected');
      recommendations.push('Emphasize trust and innovation messaging');
    }

    if (messagingAlignment.audienceVoice < 0.7) {
      issues.push('Content not well-aligned with audience voice');
      recommendations.push('Add more relatable examples');
    }

    const analysis: ContentAnalysis = {
      contentId,
      title,
      channel,
      toneAnalysis,
      messagingAlignment,
      consistencyScore,
      issues,
      recommendations,
      analyzedAt: new Date(),
    };

    this.analyses.set(contentId, analysis);
    supabaseStore.storeContentAnalyses(Array.from(this.analyses.values()));

    return analysis;
  }

  /**
   * Get all analyses
   */
  getAnalyses(): ContentAnalysis[] {
    return Array.from(this.analyses.values());
  }

  /**
   * Get analysis by content ID
   */
  getAnalysis(contentId: string): ContentAnalysis | null {
    return this.analyses.get(contentId) || null;
  }

  /**
   * Get analyses by compliance status
   */
  getAnalysesByStatus(status: 'compliant' | 'warning' | 'non-compliant'): ContentAnalysis[] {
    return Array.from(this.analyses.values()).filter((a) => {
      if (status === 'compliant' && a.consistencyScore >= 85) return true;
      if (status === 'warning' && a.consistencyScore >= 75 && a.consistencyScore < 85) return true;
      if (status === 'non-compliant' && a.consistencyScore < 75) return true;
      return false;
    });
  }

  /**
   * Get brand guidelines
   */
  getBrandGuidelines() {
    return this.brandGuidelines;
  }
}

/**
 * Factory function to create a BrandVoiceAgent instance
 */
export function createBrandVoiceAgent(config?: Partial<AgentConfig>): BrandVoiceAgent {
  return new BrandVoiceAgent(config);
}
