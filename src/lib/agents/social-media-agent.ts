/**
 * Social Media Agent (E-03)
 * Manages social media presence and engagement
 * Tracks sentiment and analyzes performance
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface SocialPost {
  postId: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  content: string;
  postedAt: Date;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  contentType: string;
}

export interface SocialMention {
  mentionId: string;
  platform: string;
  author: string;
  content: string;
  mentionedAt: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  isReply: boolean;
}

export interface SocialMetrics {
  totalPosts: number;
  totalEngagement: number;
  averageLikesPerPost: number;
  averageCommentsPerPost: number;
  averageSharesPerPost: number;
  totalMentions: number;
  positiveMentions: number;
  negativeMentions: number;
  sentimentScore: number; // -1 to 1
  topPerformingPosts: SocialPost[];
  engagementByPlatform: { platform: string; engagement: number }[];
  contentTypePerformance: { type: string; avgEngagement: number }[];
  recentMentions: SocialMention[];
  engagementTrend: number; // percentage change
  timestamp: Date;
}

export interface SocialMediaRawData {
  posts: SocialPost[];
  mentions: SocialMention[];
}

/**
 * Social Media Agent
 * Manages social media presence and tracks engagement
 */
export class SocialMediaAgent extends BaseAgent<SocialMediaRawData, SocialMetrics> {
  private posts: Map<string, SocialPost> = new Map();
  private mentions: Map<string, SocialMention> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Social Media Agent (E-03)',
      description: 'Manages social media presence, tracks engagement and sentiment',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();

    const mockPosts: SocialPost[] = [
      {
        postId: 'post-001',
        platform: 'linkedin',
        content: '80% of companies struggle with GRC compliance. Our platform makes it simple.',
        postedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        likes: 245,
        comments: 32,
        shares: 18,
        views: 3200,
        sentiment: 'positive',
        contentType: 'educational',
      },
      {
        postId: 'post-002',
        platform: 'twitter',
        content: 'New blog post: How to reduce travel risk exposure in 5 steps. Check it out!',
        postedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        likes: 89,
        comments: 12,
        shares: 24,
        views: 1200,
        sentiment: 'positive',
        contentType: 'blog-promotion',
      },
      {
        postId: 'post-003',
        platform: 'linkedin',
        content: 'Excited to announce our partnership with TravelCorp. Together we make travel safer.',
        postedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        likes: 512,
        comments: 68,
        shares: 42,
        views: 6800,
        sentiment: 'positive',
        contentType: 'news',
      },
      {
        postId: 'post-004',
        platform: 'twitter',
        content: 'ISO 27001 compliance requirements explained. Perfect for your security team.',
        postedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        likes: 156,
        comments: 21,
        shares: 35,
        views: 2100,
        sentiment: 'positive',
        contentType: 'educational',
      },
      {
        postId: 'post-005',
        platform: 'facebook',
        content: 'Case study: How MegaCorp reduced compliance costs by 50%',
        postedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
        likes: 78,
        comments: 5,
        shares: 8,
        views: 450,
        sentiment: 'positive',
        contentType: 'case-study',
      },
    ];

    const mockMentions: SocialMention[] = [
      {
        mentionId: 'mention-001',
        platform: 'twitter',
        author: '@compliance_expert',
        content: '@ourcompany Thanks for the helpful GRC tips!',
        mentionedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        sentiment: 'positive',
        isReply: true,
      },
      {
        mentionId: 'mention-002',
        platform: 'linkedin',
        author: 'Sarah Johnson',
        content: 'Your travel risk platform is exactly what our company needed.',
        mentionedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        sentiment: 'positive',
        isReply: false,
      },
      {
        mentionId: 'mention-003',
        platform: 'twitter',
        author: '@skeptical_user',
        content: 'Is this really better than the alternatives? Questions.',
        mentionedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000),
        sentiment: 'neutral',
        isReply: false,
      },
    ];

    for (const post of mockPosts) {
      this.posts.set(post.postId, post);
    }

    for (const mention of mockMentions) {
      this.mentions.set(mention.mentionId, mention);
    }
  }

  /**
   * Collect social media data
   */
  async collectData(): Promise<SocialMediaRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      posts: Array.from(this.posts.values()),
      mentions: Array.from(this.mentions.values()),
    };
  }

  /**
   * Process data to calculate social media metrics
   */
  async processData(rawData: SocialMediaRawData): Promise<SocialMetrics> {
    const posts = rawData.posts;
    const mentions = rawData.mentions;

    // Calculate engagement
    const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0);
    const averageLikesPerPost = posts.length > 0 ? Math.round(posts.reduce((sum, p) => sum + p.likes, 0) / posts.length) : 0;
    const averageCommentsPerPost = posts.length > 0 ? Math.round(posts.reduce((sum, p) => sum + p.comments, 0) / posts.length) : 0;
    const averageSharesPerPost = posts.length > 0 ? Math.round(posts.reduce((sum, p) => sum + p.shares, 0) / posts.length) : 0;

    // Top performing posts
    const topPerforming = posts
      .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
      .slice(0, 3);

    // Engagement by platform
    const engagementByPlatform: { platform: string; engagement: number }[] = [];
    const platformMap: { [key: string]: number } = {};

    for (const post of posts) {
      const engagement = post.likes + post.comments + post.shares;
      platformMap[post.platform] = (platformMap[post.platform] || 0) + engagement;
    }

    for (const [platform, engagement] of Object.entries(platformMap)) {
      engagementByPlatform.push({ platform, engagement });
    }

    // Content type performance
    const contentTypeMap: { [key: string]: { total: number; count: number } } = {};
    for (const post of posts) {
      const engagement = post.likes + post.comments + post.shares;
      if (!contentTypeMap[post.contentType]) {
        contentTypeMap[post.contentType] = { total: 0, count: 0 };
      }
      contentTypeMap[post.contentType].total += engagement;
      contentTypeMap[post.contentType].count += 1;
    }

    const contentTypePerformance = Object.entries(contentTypeMap).map(([type, data]) => ({
      type,
      avgEngagement: Math.round((data.total / data.count) * 10) / 10,
    }));

    // Sentiment analysis
    const positiveMentions = mentions.filter((m) => m.sentiment === 'positive').length;
    const negativeMentions = mentions.filter((m) => m.sentiment === 'negative').length;
    const sentimentScore = mentions.length > 0
      ? (positiveMentions - negativeMentions) / mentions.length
      : 0;

    // Recent mentions
    const recentMentions = mentions
      .sort((a, b) => b.mentionedAt.getTime() - a.mentionedAt.getTime())
      .slice(0, 5);

    // Trend (simulated)
    const engagementTrend = Math.round((Math.random() * 30 - 5) * 10) / 10;

    return {
      totalPosts: posts.length,
      totalEngagement,
      averageLikesPerPost,
      averageCommentsPerPost,
      averageSharesPerPost,
      totalMentions: mentions.length,
      positiveMentions,
      negativeMentions,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      topPerformingPosts: topPerforming,
      engagementByPlatform,
      contentTypePerformance,
      recentMentions,
      engagementTrend,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: SocialMetrics): Promise<void> {
    supabaseStore.storeSocialPosts(Array.from(this.posts.values()));
    supabaseStore.storeSocialMediaMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[SocialMediaAgent] Dashboard updated with social media metrics');
  }

  /**
   * Create a new social post
   */
  async createPost(
    platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram',
    content: string,
    contentType: string
  ): Promise<SocialPost> {
    const now = new Date();
    const postId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newPost: SocialPost = {
      postId,
      platform,
      content,
      postedAt: now,
      likes: 0,
      comments: 0,
      shares: 0,
      sentiment: 'neutral',
      contentType,
    };

    this.posts.set(postId, newPost);
    supabaseStore.storeSocialPosts(Array.from(this.posts.values()));

    return newPost;
  }

  /**
   * Update post engagement metrics
   */
  async updatePostEngagement(
    postId: string,
    likes: number,
    comments: number,
    shares: number
  ): Promise<SocialPost | null> {
    const post = this.posts.get(postId);
    if (!post) return null;

    const updated: SocialPost = {
      ...post,
      likes,
      comments,
      shares,
    };

    this.posts.set(postId, updated);
    supabaseStore.storeSocialPosts(Array.from(this.posts.values()));

    return updated;
  }

  /**
   * Add mention
   */
  async addMention(
    platform: string,
    author: string,
    content: string,
    sentiment: 'positive' | 'neutral' | 'negative'
  ): Promise<SocialMention> {
    const mentionId = `mention-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const mention: SocialMention = {
      mentionId,
      platform,
      author,
      content,
      mentionedAt: new Date(),
      sentiment,
      isReply: content.startsWith('@'),
    };

    this.mentions.set(mentionId, mention);
    return mention;
  }

  /**
   * Get all posts
   */
  getPosts(): SocialPost[] {
    return Array.from(this.posts.values());
  }

  /**
   * Get posts by platform
   */
  getPostsByPlatform(platform: string): SocialPost[] {
    return Array.from(this.posts.values()).filter((p) => p.platform === platform);
  }

  /**
   * Get all mentions
   */
  getMentions(): SocialMention[] {
    return Array.from(this.mentions.values());
  }
}

/**
 * Factory function to create a SocialMediaAgent instance
 */
export function createSocialMediaAgent(config?: Partial<AgentConfig>): SocialMediaAgent {
  return new SocialMediaAgent(config);
}
