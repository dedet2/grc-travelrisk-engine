/**
 * Content Calendar Agent (E-01)
 * Plans and schedules content across channels
 * Tracks content pipeline and identifies gaps
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface ContentIdea {
  ideaId: string;
  title: string;
  description: string;
  topic: string;
  targetAudience: string;
  suggestedChannels: string[];
  estimatedReach?: number;
  createdAt: Date;
}

export interface ScheduledContent {
  contentId: string;
  title: string;
  description: string;
  topic: string;
  channels: string[];
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  contentType: 'blog' | 'video' | 'infographic' | 'whitepaper' | 'case-study' | 'social';
  contentLength?: string;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentCalendarMetrics {
  totalScheduledContent: number;
  contentByChannel: { [channel: string]: number };
  contentByStatus: { [status: string]: number };
  contentByType: { [type: string]: number };
  trendingTopics: { topic: string; frequency: number }[];
  contentGaps: string[];
  averagePostingFrequencyPerDay: number;
  upcomingContentCount: number;
  publishedContentCount: number;
  timestamp: Date;
}

export interface ContentCalendarRawData {
  scheduledContent: ScheduledContent[];
  contentIdeas: ContentIdea[];
}

/**
 * Content Calendar Agent
 * Plans and schedules content across channels
 */
export class ContentCalendarAgent extends BaseAgent<ContentCalendarRawData, ContentCalendarMetrics> {
  private scheduledContent: Map<string, ScheduledContent> = new Map();
  private contentIdeas: Map<string, ContentIdea> = new Map();
  private trendingTopics = [
    'GRC Compliance',
    'Risk Management',
    'Travel Safety',
    'Regulatory Updates',
    'Best Practices',
    'Case Studies',
    'Webinars',
    'Industry Insights',
  ];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Content Calendar Agent (E-01)',
      description: 'Plans and schedules content across channels, tracks content pipeline',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();

    const mockContent: ScheduledContent[] = [
      {
        contentId: 'content-001',
        title: 'ISO 27001 Compliance Guide',
        description: 'Comprehensive guide to implementing ISO 27001 standards',
        topic: 'GRC Compliance',
        channels: ['blog', 'linkedin', 'email'],
        scheduledDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        contentType: 'whitepaper',
        assignee: 'Content Team',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        contentId: 'content-002',
        title: 'Travel Risk Assessment Best Practices',
        description: 'Video guide on assessing travel risks',
        topic: 'Travel Safety',
        channels: ['youtube', 'linkedin', 'twitter'],
        scheduledDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'draft',
        contentType: 'video',
        createdAt: now,
        updatedAt: now,
      },
      {
        contentId: 'content-003',
        title: 'Q1 Compliance Update',
        description: 'Monthly compliance update newsletter',
        topic: 'Regulatory Updates',
        channels: ['email', 'blog'],
        scheduledDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        contentType: 'blog',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        contentId: 'content-004',
        title: 'Risk Management Case Study',
        description: 'How Enterprise Co reduced risk by 40%',
        topic: 'Case Studies',
        channels: ['blog', 'linkedin', 'twitter'],
        scheduledDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'published',
        contentType: 'case-study',
        createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        contentId: 'content-005',
        title: 'SOC 2 Implementation Tips',
        description: 'Practical tips for SOC 2 compliance',
        topic: 'Best Practices',
        channels: ['twitter', 'linkedin'],
        scheduledDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        status: 'draft',
        contentType: 'infographic',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const mockIdeas: ContentIdea[] = [
      {
        ideaId: 'idea-001',
        title: 'AI in Risk Management',
        description: 'Exploring how AI impacts GRC',
        topic: 'Industry Insights',
        targetAudience: 'Enterprise IT Managers',
        suggestedChannels: ['blog', 'webinar', 'youtube'],
        createdAt: now,
      },
      {
        ideaId: 'idea-002',
        title: 'Travel Risk Webinar Series',
        description: 'Monthly webinars on travel safety',
        topic: 'Travel Safety',
        targetAudience: 'HR and Travel Managers',
        suggestedChannels: ['webinar', 'email', 'linkedin'],
        createdAt: now,
      },
    ];

    for (const content of mockContent) {
      this.scheduledContent.set(content.contentId, content);
    }

    for (const idea of mockIdeas) {
      this.contentIdeas.set(idea.ideaId, idea);
    }
  }

  /**
   * Collect content calendar data
   */
  async collectData(): Promise<ContentCalendarRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      scheduledContent: Array.from(this.scheduledContent.values()),
      contentIdeas: Array.from(this.contentIdeas.values()),
    };
  }

  /**
   * Process data to calculate content calendar metrics
   */
  async processData(rawData: ContentCalendarRawData): Promise<ContentCalendarMetrics> {
    const content = rawData.scheduledContent;
    const now = new Date();

    // Count by channel
    const contentByChannel: { [channel: string]: number } = {};
    const contentByStatus: { [status: string]: number } = {};
    const contentByType: { [type: string]: number } = {};

    for (const item of content) {
      // By status
      contentByStatus[item.status] = (contentByStatus[item.status] || 0) + 1;

      // By type
      contentByType[item.contentType] = (contentByType[item.contentType] || 0) + 1;

      // By channel
      for (const channel of item.channels) {
        contentByChannel[channel] = (contentByChannel[channel] || 0) + 1;
      }
    }

    // Calculate trending topics
    const topicFrequency: { [topic: string]: number } = {};
    for (const item of content) {
      topicFrequency[item.topic] = (topicFrequency[item.topic] || 0) + 1;
    }

    const trendingTopics = Object.entries(topicFrequency)
      .map(([topic, frequency]) => ({ topic, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Identify content gaps
    const contentGaps: string[] = [];
    const coveredTopics = new Set(content.map((c) => c.topic));
    for (const topic of this.trendingTopics) {
      if (!coveredTopics.has(topic)) {
        contentGaps.push(topic);
      }
    }

    // Count upcoming vs published
    const upcomingContent = content.filter(
      (c) => c.scheduledDate > now && (c.status === 'draft' || c.status === 'scheduled')
    );
    const publishedContent = content.filter((c) => c.status === 'published');

    // Calculate posting frequency
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentContent = content.filter((c) => c.scheduledDate >= thirtyDaysAgo);
    const averagePostingFrequencyPerDay = recentContent.length / 30;

    return {
      totalScheduledContent: content.length,
      contentByChannel,
      contentByStatus,
      contentByType,
      trendingTopics,
      contentGaps,
      averagePostingFrequencyPerDay: Math.round(averagePostingFrequencyPerDay * 100) / 100,
      upcomingContentCount: upcomingContent.length,
      publishedContentCount: publishedContent.length,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: ContentCalendarMetrics): Promise<void> {
    supabaseStore.storeContentCalendar(Array.from(this.scheduledContent.values()));
    supabaseStore.storeContentCalendarMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[ContentCalendarAgent] Dashboard updated with content calendar metrics');
  }

  /**
   * Create a new scheduled content item
   */
  async createContent(
    title: string,
    description: string,
    topic: string,
    channels: string[],
    scheduledDate: Date,
    contentType: string
  ): Promise<ScheduledContent> {
    const now = new Date();
    const contentId = `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newContent: ScheduledContent = {
      contentId,
      title,
      description,
      topic,
      channels,
      scheduledDate,
      status: 'draft',
      contentType: contentType as any,
      createdAt: now,
      updatedAt: now,
    };

    this.scheduledContent.set(contentId, newContent);
    supabaseStore.storeContentCalendar(Array.from(this.scheduledContent.values()));

    return newContent;
  }

  /**
   * Update scheduled content
   */
  async updateContent(
    contentId: string,
    updates: Partial<ScheduledContent>
  ): Promise<ScheduledContent | null> {
    const content = this.scheduledContent.get(contentId);
    if (!content) return null;

    const updated: ScheduledContent = {
      ...content,
      ...updates,
      contentId: content.contentId,
      createdAt: content.createdAt,
      updatedAt: new Date(),
    };

    this.scheduledContent.set(contentId, updated);
    supabaseStore.storeContentCalendar(Array.from(this.scheduledContent.values()));

    return updated;
  }

  /**
   * Publish content
   */
  async publishContent(contentId: string): Promise<ScheduledContent | null> {
    return this.updateContent(contentId, { status: 'published' });
  }

  /**
   * Get all scheduled content
   */
  getScheduledContent(): ScheduledContent[] {
    return Array.from(this.scheduledContent.values());
  }

  /**
   * Get content by status
   */
  getContentByStatus(status: string): ScheduledContent[] {
    return Array.from(this.scheduledContent.values()).filter((c) => c.status === status);
  }

  /**
   * Get upcoming content
   */
  getUpcomingContent(): ScheduledContent[] {
    const now = new Date();
    return Array.from(this.scheduledContent.values())
      .filter((c) => c.scheduledDate > now)
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  /**
   * Add content idea
   */
  async addContentIdea(
    title: string,
    description: string,
    topic: string,
    targetAudience: string,
    suggestedChannels: string[]
  ): Promise<ContentIdea> {
    const ideaId = `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const idea: ContentIdea = {
      ideaId,
      title,
      description,
      topic,
      targetAudience,
      suggestedChannels,
      createdAt: new Date(),
    };

    this.contentIdeas.set(ideaId, idea);
    return idea;
  }

  /**
   * Get all content ideas
   */
  getContentIdeas(): ContentIdea[] {
    return Array.from(this.contentIdeas.values());
  }
}

/**
 * Factory function to create a ContentCalendarAgent instance
 */
export function createContentCalendarAgent(config?: Partial<AgentConfig>): ContentCalendarAgent {
  return new ContentCalendarAgent(config);
}
