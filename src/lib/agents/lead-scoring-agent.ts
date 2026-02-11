/**
 * Lead Scoring Agent (C-01)
 * Scores inbound leads based on ICP fit, company size, industry
 * Tracks lead pipeline stages
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig, type AgentRunResult } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface LeadData {
  leadId: string;
  companyName: string;
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'enterprise';
  contactEmail: string;
  contactName: string;
  revenue?: number;
  employees?: number;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoredLead extends LeadData {
  score: number;
  icpFit: number;
  industrySuitability: number;
  sizeMatch: number;
  stage: 'cold' | 'warm' | 'hot' | 'qualified' | 'nurture';
  scoredAt: Date;
}

export interface LeadPipelineMetrics {
  totalLeads: number;
  coldLeads: number;
  warmLeads: number;
  hotLeads: number;
  qualifiedLeads: number;
  nurtureCampaignLeads: number;
  averageScore: number;
  conversionRate: number;
  topIndustries: { industry: string; count: number }[];
  topCompanySizes: { size: string; count: number }[];
  timestamp: Date;
}

export interface LeadScoringRawData {
  leads: LeadData[];
}

/**
 * Lead Scoring Agent
 * Scores leads based on ICP fit and tracks pipeline stages
 */
export class LeadScoringAgent extends BaseAgent<LeadScoringRawData, LeadPipelineMetrics> {
  private leads: Map<string, ScoredLead> = new Map();
  private icpIndustries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];
  private icpCompanySizes: ('small' | 'medium' | 'enterprise')[] = ['small', 'medium', 'enterprise'];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Lead Scoring Agent (C-01)',
      description: 'Scores inbound leads based on ICP fit, company size, and industry',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockLeads: LeadData[] = [
      {
        leadId: 'lead-001',
        companyName: 'CloudTech Solutions',
        industry: 'Technology',
        companySize: 'medium',
        contactEmail: 'sales@cloudtech.io',
        contactName: 'John Smith',
        revenue: 5000000,
        employees: 150,
        website: 'https://cloudtech.io',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        leadId: 'lead-002',
        companyName: 'FinServ Corp',
        industry: 'Finance',
        companySize: 'enterprise',
        contactEmail: 'contact@finserv.com',
        contactName: 'Sarah Johnson',
        revenue: 500000000,
        employees: 5000,
        website: 'https://finserv.com',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        leadId: 'lead-003',
        companyName: 'RetailHub Inc',
        industry: 'Retail',
        companySize: 'small',
        contactEmail: 'info@retailhub.com',
        contactName: 'Mike Davis',
        revenue: 2000000,
        employees: 45,
        website: 'https://retailhub.com',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        leadId: 'lead-004',
        companyName: 'HealthCare Innovations',
        industry: 'Healthcare',
        companySize: 'medium',
        contactEmail: 'partnerships@healthcare-inv.com',
        contactName: 'Emily Chen',
        revenue: 8000000,
        employees: 200,
        website: 'https://healthcare-inv.com',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        leadId: 'lead-005',
        companyName: 'ManuPro Solutions',
        industry: 'Manufacturing',
        companySize: 'enterprise',
        contactEmail: 'sales@manupro.com',
        contactName: 'Robert Wilson',
        revenue: 300000000,
        employees: 2000,
        website: 'https://manupro.com',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const lead of mockLeads) {
      const scoredLead = this.scoreLeadInternal(lead);
      this.leads.set(lead.leadId, scoredLead);
    }
  }

  /**
   * Internal helper to score a lead
   */
  private scoreLeadInternal(lead: LeadData): ScoredLead {
    const icpFit = this.calculateICPFit(lead);
    const industrySuitability = this.calculateIndustrySuitability(lead.industry);
    const sizeMatch = this.calculateSizeMatch(lead.companySize);

    const score = Math.round((icpFit * 0.5 + industrySuitability * 0.3 + sizeMatch * 0.2) * 100);
    const stage = this.determineStage(score);

    return {
      ...lead,
      score,
      icpFit,
      industrySuitability,
      sizeMatch,
      stage,
      scoredAt: new Date(),
    };
  }

  /**
   * Calculate ICP fit (0-1) based on revenue and employee count
   */
  private calculateICPFit(lead: LeadData): number {
    const revenueWeight = (lead.revenue || 0) / 500000000; // Normalize to $500M
    const employeeWeight = (lead.employees || 0) / 5000; // Normalize to 5000 employees

    const fit = Math.min(1, (revenueWeight * 0.6 + employeeWeight * 0.4) * 1.2);
    return Math.min(1, Math.round(fit * 100) / 100);
  }

  /**
   * Calculate industry suitability (0-1)
   */
  private calculateIndustrySuitability(industry: string): number {
    if (this.icpIndustries.includes(industry)) {
      return 1;
    }
    return 0.5;
  }

  /**
   * Calculate company size match (0-1)
   */
  private calculateSizeMatch(size: 'startup' | 'small' | 'medium' | 'enterprise'): number {
    if (this.icpCompanySizes.includes(size as any)) {
      return 1;
    }
    return 0.3;
  }

  /**
   * Determine lead stage based on score
   */
  private determineStage(score: number): 'cold' | 'warm' | 'hot' | 'qualified' | 'nurture' {
    if (score >= 80) return 'qualified';
    if (score >= 60) return 'hot';
    if (score >= 40) return 'warm';
    if (score >= 20) return 'nurture';
    return 'cold';
  }

  /**
   * Collect lead data
   */
  async collectData(): Promise<LeadScoringRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      leads: Array.from(this.leads.values()),
    };
  }

  /**
   * Process data to calculate pipeline metrics
   */
  async processData(rawData: LeadScoringRawData): Promise<LeadPipelineMetrics> {
    const leads = rawData.leads;

    const coldLeads = leads.filter((l) => l.stage === 'cold').length;
    const warmLeads = leads.filter((l) => l.stage === 'warm').length;
    const hotLeads = leads.filter((l) => l.stage === 'hot').length;
    const qualifiedLeads = leads.filter((l) => l.stage === 'qualified').length;
    const nurtureCampaignLeads = leads.filter((l) => l.stage === 'nurture').length;

    const averageScore =
      leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0;

    // Calculate conversion rate (qualified leads / total leads)
    const conversionRate = leads.length > 0 ? Math.round((qualifiedLeads / leads.length) * 100) : 0;

    // Calculate top industries
    const industryMap = new Map<string, number>();
    leads.forEach((lead) => {
      industryMap.set(lead.industry, (industryMap.get(lead.industry) || 0) + 1);
    });
    const topIndustries = Array.from(industryMap.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top company sizes
    const sizeMap = new Map<string, number>();
    leads.forEach((lead) => {
      sizeMap.set(lead.companySize, (sizeMap.get(lead.companySize) || 0) + 1);
    });
    const topCompanySizes = Array.from(sizeMap.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalLeads: leads.length,
      coldLeads,
      warmLeads,
      hotLeads,
      qualifiedLeads,
      nurtureCampaignLeads,
      averageScore,
      conversionRate,
      topIndustries,
      topCompanySizes,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: LeadPipelineMetrics): Promise<void> {
    inMemoryStore.storeLeads(Array.from(this.leads.values()));
    inMemoryStore.storeLeadPipelineMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[LeadScoringAgent] Dashboard updated with lead pipeline metrics');
  }

  /**
   * Create a new lead
   */
  async createLead(leadData: Omit<LeadData, 'leadId' | 'createdAt' | 'updatedAt'>): Promise<ScoredLead> {
    const now = new Date();
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const lead: LeadData = {
      ...leadData,
      leadId,
      createdAt: now,
      updatedAt: now,
    };

    const scoredLead = this.scoreLeadInternal(lead);
    this.leads.set(leadId, scoredLead);
    inMemoryStore.storeLeads(Array.from(this.leads.values()));

    return scoredLead;
  }

  /**
   * Update lead stage
   */
  async updateLeadStage(
    leadId: string,
    stage: 'cold' | 'warm' | 'hot' | 'qualified' | 'nurture'
  ): Promise<ScoredLead | null> {
    const lead = this.leads.get(leadId);
    if (!lead) {
      return null;
    }

    lead.stage = stage;
    lead.updatedAt = new Date();
    this.leads.set(leadId, lead);
    inMemoryStore.storeLeads(Array.from(this.leads.values()));

    return lead;
  }

  /**
   * Get all leads
   */
  getLeads(): ScoredLead[] {
    return Array.from(this.leads.values());
  }

  /**
   * Get leads by stage
   */
  getLeadsByStage(stage: 'cold' | 'warm' | 'hot' | 'qualified' | 'nurture'): ScoredLead[] {
    return Array.from(this.leads.values()).filter((lead) => lead.stage === stage);
  }

  /**
   * Get leads by industry
   */
  getLeadsByIndustry(industry: string): ScoredLead[] {
    return Array.from(this.leads.values()).filter((lead) => lead.industry === industry);
  }

  /**
   * Get a single lead
   */
  getLead(leadId: string): ScoredLead | null {
    return this.leads.get(leadId) || null;
  }

  /**
   * Get leads above score threshold
   */
  getLeadsAboveScore(minScore: number): ScoredLead[] {
    return Array.from(this.leads.values()).filter((lead) => lead.score >= minScore);
  }
}

/**
 * Factory function to create a LeadScoringAgent instance
 */
export function createLeadScoringAgent(config?: Partial<AgentConfig>): LeadScoringAgent {
  return new LeadScoringAgent(config);
}
