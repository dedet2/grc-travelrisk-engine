/**
 * CRM Sync Agent (C-03)
 * Syncs contact and deal data across platforms
 * Tracks deal pipeline and win rates
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface CrmContact {
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  linkedinUrl?: string;
  lastInteractionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmDeal {
  dealId: string;
  dealName: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  currency: string;
  expectedCloseDate: Date;
  closedDate?: Date;
  probability: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmPipelineMetrics {
  totalContacts: number;
  totalDeals: number;
  activeDeals: number;
  closedWonDeals: number;
  closedLostDeals: number;
  totalPipelineValue: number;
  winRate: number;
  lossRate: number;
  avgDealValue: number;
  avgSalesCycle: number;
  pipelineByStage: {
    stage: string;
    count: number;
    value: number;
  }[];
  topCompanies: {
    company: string;
    dealCount: number;
    totalValue: number;
  }[];
  timestamp: Date;
}

export interface CrmSyncRawData {
  contacts: CrmContact[];
  deals: CrmDeal[];
}

/**
 * CRM Sync Agent
 * Syncs contact and deal data, tracks pipeline metrics
 */
export class CrmSyncAgent extends BaseAgent<CrmSyncRawData, CrmPipelineMetrics> {
  private contacts: Map<string, CrmContact> = new Map();
  private deals: Map<string, CrmDeal> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'CRM Sync Agent (C-03)',
      description: 'Syncs contact and deal data, tracks deal pipeline and win rates',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();

    // Initialize mock contacts
    const mockContacts: CrmContact[] = [
      {
        contactId: 'contact-001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@cloudtech.io',
        phone: '(555) 123-4567',
        jobTitle: 'CTO',
        companyId: 'company-001',
        companyName: 'CloudTech Solutions',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        lastInteractionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: 'contact-002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@finserv.com',
        phone: '(555) 234-5678',
        jobTitle: 'Chief Compliance Officer',
        companyId: 'company-002',
        companyName: 'FinServ Corp',
        linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
        lastInteractionDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: 'contact-003',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@healthcare-inv.com',
        phone: '(555) 345-6789',
        jobTitle: 'Risk Manager',
        companyId: 'company-003',
        companyName: 'HealthCare Innovations',
        lastInteractionDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        contactId: 'contact-004',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@manupro.com',
        phone: '(555) 456-7890',
        jobTitle: 'Operations Director',
        companyId: 'company-004',
        companyName: 'ManuPro Solutions',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const contact of mockContacts) {
      this.contacts.set(contact.contactId, contact);
    }

    // Initialize mock deals
    const mockDeals: CrmDeal[] = [
      {
        dealId: 'deal-001',
        dealName: 'CloudTech - GRC Platform',
        companyId: 'company-001',
        companyName: 'CloudTech Solutions',
        contactId: 'contact-001',
        contactName: 'John Smith',
        stage: 'proposal',
        value: 150000,
        currency: 'USD',
        expectedCloseDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        probability: 75,
        notes: 'High priority, strong champion at CTO level',
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        dealId: 'deal-002',
        dealName: 'FinServ - Compliance Suite',
        companyId: 'company-002',
        companyName: 'FinServ Corp',
        contactId: 'contact-002',
        contactName: 'Sarah Johnson',
        stage: 'negotiation',
        value: 500000,
        currency: 'USD',
        expectedCloseDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        probability: 85,
        notes: 'Enterprise deal, budget approved',
        createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        dealId: 'deal-003',
        dealName: 'HealthCare Innovations - Risk Module',
        companyId: 'company-003',
        companyName: 'HealthCare Innovations',
        contactId: 'contact-003',
        contactName: 'Michael Chen',
        stage: 'qualification',
        value: 200000,
        currency: 'USD',
        expectedCloseDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        probability: 50,
        notes: 'Initial discovery call scheduled',
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        dealId: 'deal-004',
        dealName: 'TechVenture - Assessment License',
        companyId: 'company-005',
        companyName: 'TechVenture Inc',
        contactId: 'contact-005',
        contactName: 'Robert Park',
        stage: 'closed_won',
        value: 75000,
        currency: 'USD',
        expectedCloseDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        closedDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        probability: 100,
        notes: 'Successfully closed',
        createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        dealId: 'deal-005',
        dealName: 'GlobalRetail - Compliance Audit',
        companyId: 'company-006',
        companyName: 'GlobalRetail Group',
        contactId: 'contact-006',
        contactName: 'Jessica Martinez',
        stage: 'closed_lost',
        value: 100000,
        currency: 'USD',
        expectedCloseDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        closedDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        probability: 0,
        notes: 'Lost to competitor',
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const deal of mockDeals) {
      this.deals.set(deal.dealId, deal);
    }
  }

  /**
   * Collect contact and deal data
   */
  async collectData(): Promise<CrmSyncRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      contacts: Array.from(this.contacts.values()),
      deals: Array.from(this.deals.values()),
    };
  }

  /**
   * Process data to calculate pipeline metrics
   */
  async processData(rawData: CrmSyncRawData): Promise<CrmPipelineMetrics> {
    const { contacts, deals } = rawData;

    const activeDeals = deals.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length;
    const closedWonDeals = deals.filter((d) => d.stage === 'closed_won').length;
    const closedLostDeals = deals.filter((d) => d.stage === 'closed_lost').length;

    const totalPipelineValue = deals.reduce((sum, d) => {
      if (d.stage !== 'closed_lost') {
        return sum + d.value;
      }
      return sum;
    }, 0);

    const winRate = deals.length > 0 ? Math.round((closedWonDeals / (closedWonDeals + closedLostDeals)) * 100) : 0;
    const lossRate = deals.length > 0 ? Math.round((closedLostDeals / (closedWonDeals + closedLostDeals)) * 100) : 0;
    const avgDealValue = deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + d.value, 0) / deals.length) : 0;

    // Calculate average sales cycle in days
    let avgSalesCycle = 0;
    const closedDeals = deals.filter((d) => d.closedDate);
    if (closedDeals.length > 0) {
      const cycles = closedDeals.map((d) =>
        Math.floor((d.closedDate!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      );
      avgSalesCycle = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
    }

    // Pipeline by stage
    const stageMap = new Map<string, { count: number; value: number }>();
    deals.forEach((deal) => {
      const stageData = stageMap.get(deal.stage) || { count: 0, value: 0 };
      stageData.count++;
      if (deal.stage !== 'closed_lost') {
        stageData.value += deal.value;
      }
      stageMap.set(deal.stage, stageData);
    });

    const pipelineByStage = Array.from(stageMap.entries()).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value,
    }));

    // Top companies
    const companyMap = new Map<string, { count: number; value: number }>();
    deals.forEach((deal) => {
      const companyData = companyMap.get(deal.companyName) || { count: 0, value: 0 };
      companyData.count++;
      companyData.value += deal.value;
      companyMap.set(deal.companyName, companyData);
    });

    const topCompanies = Array.from(companyMap.entries())
      .map(([company, data]) => ({
        company,
        dealCount: data.count,
        totalValue: data.value,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

    return {
      totalContacts: contacts.length,
      totalDeals: deals.length,
      activeDeals,
      closedWonDeals,
      closedLostDeals,
      totalPipelineValue,
      winRate,
      lossRate,
      avgDealValue,
      avgSalesCycle,
      pipelineByStage,
      topCompanies,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: CrmPipelineMetrics): Promise<void> {
    inMemoryStore.storeCrmContacts(Array.from(this.contacts.values()));
    inMemoryStore.storeCrmDeals(Array.from(this.deals.values()));
    inMemoryStore.storeCrmPipelineMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[CrmSyncAgent] Dashboard updated with CRM pipeline metrics');
  }

  /**
   * Create a new contact
   */
  async createContact(
    firstName: string,
    lastName: string,
    email: string,
    jobTitle: string,
    companyId: string,
    companyName: string
  ): Promise<CrmContact> {
    const now = new Date();
    const contactId = `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const contact: CrmContact = {
      contactId,
      firstName,
      lastName,
      email,
      jobTitle,
      companyId,
      companyName,
      createdAt: now,
      updatedAt: now,
    };

    this.contacts.set(contactId, contact);
    inMemoryStore.storeCrmContacts(Array.from(this.contacts.values()));

    return contact;
  }

  /**
   * Create a new deal
   */
  async createDeal(
    dealName: string,
    companyId: string,
    companyName: string,
    contactId: string,
    contactName: string,
    value: number,
    expectedCloseDate: Date
  ): Promise<CrmDeal> {
    const now = new Date();
    const dealId = `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const deal: CrmDeal = {
      dealId,
      dealName,
      companyId,
      companyName,
      contactId,
      contactName,
      stage: 'prospecting',
      value,
      currency: 'USD',
      expectedCloseDate,
      probability: 20,
      createdAt: now,
      updatedAt: now,
    };

    this.deals.set(dealId, deal);
    inMemoryStore.storeCrmDeals(Array.from(this.deals.values()));

    return deal;
  }

  /**
   * Update deal stage
   */
  async updateDealStage(
    dealId: string,
    stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  ): Promise<CrmDeal | null> {
    const deal = this.deals.get(dealId);
    if (!deal) {
      return null;
    }

    deal.stage = stage;

    // Update probability based on stage
    const stageProbabilities: Record<string, number> = {
      prospecting: 20,
      qualification: 40,
      proposal: 60,
      negotiation: 80,
      closed_won: 100,
      closed_lost: 0,
    };
    deal.probability = stageProbabilities[stage];

    // Set closed date if deal is closed
    if ((stage === 'closed_won' || stage === 'closed_lost') && !deal.closedDate) {
      deal.closedDate = new Date();
    }

    deal.updatedAt = new Date();
    this.deals.set(dealId, deal);
    inMemoryStore.storeCrmDeals(Array.from(this.deals.values()));

    return deal;
  }

  /**
   * Get all contacts
   */
  getContacts(): CrmContact[] {
    return Array.from(this.contacts.values());
  }

  /**
   * Get a single contact
   */
  getContact(contactId: string): CrmContact | null {
    return this.contacts.get(contactId) || null;
  }

  /**
   * Get all deals
   */
  getDeals(): CrmDeal[] {
    return Array.from(this.deals.values());
  }

  /**
   * Get deals by stage
   */
  getDealsByStage(
    stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  ): CrmDeal[] {
    return Array.from(this.deals.values()).filter((deal) => deal.stage === stage);
  }

  /**
   * Get a single deal
   */
  getDeal(dealId: string): CrmDeal | null {
    return this.deals.get(dealId) || null;
  }

  /**
   * Get deals by company
   */
  getDealsByCompany(companyId: string): CrmDeal[] {
    return Array.from(this.deals.values()).filter((deal) => deal.companyId === companyId);
  }

  /**
   * Get deals by contact
   */
  getDealsByContact(contactId: string): CrmDeal[] {
    return Array.from(this.deals.values()).filter((deal) => deal.contactId === contactId);
  }
}

/**
 * Factory function to create a CrmSyncAgent instance
 */
export function createCrmSyncAgent(config?: Partial<AgentConfig>): CrmSyncAgent {
  return new CrmSyncAgent(config);
}
