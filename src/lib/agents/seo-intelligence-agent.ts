/**
 * SEO Intelligence Agent (E-02)
 * Monitors SEO performance and keyword rankings
 * Analyzes competitor data and identifies opportunities
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface KeywordRanking {
  keyword: string;
  currentRank: number;
  previousRank?: number;
  searchVolume: number;
  difficulty: number;
  estimatedTraffic: number;
  url: string;
  lastUpdated: Date;
}

export interface CompetitorAnalysis {
  competitorId: string;
  competitorName: string;
  domain: string;
  topKeywords: string[];
  estimatedTraffic: number;
  backlinks: number;
  strengths: string[];
  weaknesses: string[];
  analyzedAt: Date;
}

export interface SEOMetrics {
  totalKeywords: number;
  keywordsInTopTen: number;
  keywordsInTopThree: number;
  averageRankingPosition: number;
  estimatedMonthlyTraffic: number;
  topPerformingKeywords: KeywordRanking[];
  underperformingKeywords: KeywordRanking[];
  competitorAnalyses: CompetitorAnalysis[];
  opportunityKeywords: KeywordRanking[];
  trafficTrend: number; // percentage change
  timestamp: Date;
}

export interface SEORawData {
  keywords: KeywordRanking[];
  competitors: CompetitorAnalysis[];
}

/**
 * SEO Intelligence Agent
 * Monitors SEO performance and competitor analysis
 */
export class SEOIntelligenceAgent extends BaseAgent<SEORawData, SEOMetrics> {
  private keywords: Map<string, KeywordRanking> = new Map();
  private competitors: Map<string, CompetitorAnalysis> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'SEO Intelligence Agent (E-02)',
      description: 'Monitors SEO performance, keyword rankings, and competitor analysis',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();

    const mockKeywords: KeywordRanking[] = [
      {
        keyword: 'GRC software',
        currentRank: 3,
        previousRank: 5,
        searchVolume: 2900,
        difficulty: 68,
        estimatedTraffic: 450,
        url: 'https://example.com/products/grc',
        lastUpdated: now,
      },
      {
        keyword: 'travel risk assessment',
        currentRank: 7,
        previousRank: 8,
        searchVolume: 1200,
        difficulty: 45,
        estimatedTraffic: 120,
        url: 'https://example.com/travel-risk',
        lastUpdated: now,
      },
      {
        keyword: 'compliance management platform',
        currentRank: 12,
        previousRank: 10,
        searchVolume: 1600,
        difficulty: 72,
        estimatedTraffic: 80,
        url: 'https://example.com/compliance',
        lastUpdated: now,
      },
      {
        keyword: 'ISO 27001 compliance',
        currentRank: 2,
        previousRank: 2,
        searchVolume: 5400,
        difficulty: 85,
        estimatedTraffic: 800,
        url: 'https://example.com/iso-27001',
        lastUpdated: now,
      },
      {
        keyword: 'risk management software',
        currentRank: 18,
        previousRank: 15,
        searchVolume: 2100,
        difficulty: 75,
        estimatedTraffic: 50,
        url: 'https://example.com/risk-management',
        lastUpdated: now,
      },
      {
        keyword: 'SOC 2 compliance checklist',
        currentRank: 1,
        previousRank: 1,
        searchVolume: 800,
        difficulty: 35,
        estimatedTraffic: 320,
        url: 'https://example.com/soc2-checklist',
        lastUpdated: now,
      },
    ];

    const mockCompetitors: CompetitorAnalysis[] = [
      {
        competitorId: 'comp-001',
        competitorName: 'Competitor A',
        domain: 'competitor-a.com',
        topKeywords: ['GRC software', 'risk management', 'compliance platform'],
        estimatedTraffic: 15000,
        backlinks: 2400,
        strengths: ['Established brand', 'Large content library', 'Strong backlink profile'],
        weaknesses: ['Outdated UI', 'Limited mobile optimization', 'Poor SEO for travel risk'],
        analyzedAt: now,
      },
      {
        competitorId: 'comp-002',
        competitorName: 'Competitor B',
        domain: 'competitor-b.com',
        topKeywords: ['compliance software', 'audit management', 'risk assessment'],
        estimatedTraffic: 8500,
        backlinks: 1200,
        strengths: ['Strong in audit keywords', 'Mobile optimized', 'Fast site speed'],
        weaknesses: ['Limited travel risk content', 'Weak brand presence', 'High bounce rate'],
        analyzedAt: now,
      },
    ];

    for (const kw of mockKeywords) {
      this.keywords.set(kw.keyword, kw);
    }

    for (const comp of mockCompetitors) {
      this.competitors.set(comp.competitorId, comp);
    }
  }

  /**
   * Collect SEO data
   */
  async collectData(): Promise<SEORawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      keywords: Array.from(this.keywords.values()),
      competitors: Array.from(this.competitors.values()),
    };
  }

  /**
   * Process data to calculate SEO metrics
   */
  async processData(rawData: SEORawData): Promise<SEOMetrics> {
    const keywords = rawData.keywords;
    const competitors = rawData.competitors;

    // Calculate metrics
    const keywordsInTopTen = keywords.filter((k) => k.currentRank <= 10).length;
    const keywordsInTopThree = keywords.filter((k) => k.currentRank <= 3).length;

    const ranks = keywords.map((k) => k.currentRank);
    const averageRankingPosition =
      ranks.length > 0 ? Math.round((ranks.reduce((a, b) => a + b, 0) / ranks.length) * 100) / 100 : 0;

    const estimatedMonthlyTraffic = keywords.reduce((sum, k) => sum + k.estimatedTraffic, 0);

    // Top performing (rank <= 5)
    const topPerforming = keywords
      .filter((k) => k.currentRank <= 5)
      .sort((a, b) => a.currentRank - b.currentRank)
      .slice(0, 5);

    // Underperforming (rank > 20)
    const underperforming = keywords
      .filter((k) => k.currentRank > 20)
      .sort((a, b) => a.currentRank - b.currentRank)
      .slice(0, 3);

    // Opportunity keywords (rank 11-20 with good traffic potential)
    const opportunityKeywords = keywords
      .filter((k) => k.currentRank > 10 && k.currentRank <= 20 && k.searchVolume >= 1000)
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 3);

    // Traffic trend (simulated)
    const trafficTrend = Math.round((Math.random() * 20 - 5) * 10) / 10;

    return {
      totalKeywords: keywords.length,
      keywordsInTopTen,
      keywordsInTopThree,
      averageRankingPosition,
      estimatedMonthlyTraffic,
      topPerformingKeywords: topPerforming,
      underperformingKeywords: underperforming,
      competitorAnalyses: competitors,
      opportunityKeywords,
      trafficTrend,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: SEOMetrics): Promise<void> {
    inMemoryStore.storeKeywordRankings(Array.from(this.keywords.values()));
    inMemoryStore.storeSEOMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[SEOIntelligenceAgent] Dashboard updated with SEO metrics');
  }

  /**
   * Update keyword ranking
   */
  async updateKeywordRanking(keyword: string, newRank: number): Promise<KeywordRanking | null> {
    const existing = this.keywords.get(keyword);
    if (!existing) return null;

    const updated: KeywordRanking = {
      ...existing,
      previousRank: existing.currentRank,
      currentRank: newRank,
      lastUpdated: new Date(),
    };

    this.keywords.set(keyword, updated);
    inMemoryStore.storeKeywordRankings(Array.from(this.keywords.values()));

    return updated;
  }

  /**
   * Add new keyword to track
   */
  async addKeyword(
    keyword: string,
    searchVolume: number,
    difficulty: number,
    url: string
  ): Promise<KeywordRanking> {
    const now = new Date();

    const newKeyword: KeywordRanking = {
      keyword,
      currentRank: 0, // Unknown initially
      searchVolume,
      difficulty,
      estimatedTraffic: 0,
      url,
      lastUpdated: now,
    };

    this.keywords.set(keyword, newKeyword);
    inMemoryStore.storeKeywordRankings(Array.from(this.keywords.values()));

    return newKeyword;
  }

  /**
   * Get all keywords
   */
  getKeywords(): KeywordRanking[] {
    return Array.from(this.keywords.values());
  }

  /**
   * Get top ranking keywords
   */
  getTopRankingKeywords(limit: number = 10): KeywordRanking[] {
    return Array.from(this.keywords.values())
      .sort((a, b) => a.currentRank - b.currentRank)
      .slice(0, limit);
  }

  /**
   * Update competitor analysis
   */
  async updateCompetitorAnalysis(
    competitorId: string,
    analysis: Partial<CompetitorAnalysis>
  ): Promise<CompetitorAnalysis | null> {
    const existing = this.competitors.get(competitorId);
    if (!existing) return null;

    const updated: CompetitorAnalysis = {
      ...existing,
      ...analysis,
      competitorId: existing.competitorId,
      analyzedAt: new Date(),
    };

    this.competitors.set(competitorId, updated);
    inMemoryStore.storeCompetitorAnalyses(Array.from(this.competitors.values()));

    return updated;
  }

  /**
   * Get competitor analyses
   */
  getCompetitorAnalyses(): CompetitorAnalysis[] {
    return Array.from(this.competitors.values());
  }
}

/**
 * Factory function to create an SEOIntelligenceAgent instance
 */
export function createSEOIntelligenceAgent(config?: Partial<AgentConfig>): SEOIntelligenceAgent {
  return new SEOIntelligenceAgent(config);
}
