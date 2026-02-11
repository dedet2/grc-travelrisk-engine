/**
 * Proposal Generator Agent (C-04)
 * Generates compliance assessment proposals from templates
 * Tracks proposal status and conversion
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface ProposalTemplate {
  templateId: string;
  name: string;
  description: string;
  sections: string[];
  estimatedHours: number;
  basePrice: number;
}

export interface ProposalSection {
  sectionId: string;
  title: string;
  content: string;
  order: number;
}

export interface ProposalDocument {
  proposalId: string;
  dealId: string;
  companyName: string;
  companyId: string;
  contactName: string;
  contactEmail: string;
  templateUsed: string;
  title: string;
  sections: ProposalSection[];
  estimatedValue: number;
  scope: string;
  timeline: string;
  deliverables: string[];
  status: 'draft' | 'sent' | 'reviewed' | 'accepted' | 'rejected';
  sentDate?: Date;
  reviewedDate?: Date;
  acceptedDate?: Date;
  rejectedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalMetrics {
  totalProposals: number;
  sentProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  draftProposals: number;
  reviewedProposals: number;
  acceptanceRate: number;
  rejectionRate: number;
  averageProposalValue: number;
  totalProposalValue: number;
  avgTimeToAcceptance: number;
  topTemplates: {
    template: string;
    count: number;
  }[];
  timestamp: Date;
}

export interface ProposalRawData {
  proposals: ProposalDocument[];
}

/**
 * Proposal Generator Agent
 * Generates proposals from templates and tracks conversion
 */
export class ProposalGeneratorAgent extends BaseAgent<ProposalRawData, ProposalMetrics> {
  private proposals: Map<string, ProposalDocument> = new Map();
  private templates: ProposalTemplate[] = [
    {
      templateId: 'template-001',
      name: 'GRC Assessment',
      description: 'Comprehensive GRC framework assessment',
      sections: ['Executive Summary', 'Scope & Objectives', 'Methodology', 'Deliverables', 'Timeline', 'Investment'],
      estimatedHours: 40,
      basePrice: 15000,
    },
    {
      templateId: 'template-002',
      name: 'Compliance Audit',
      description: 'Detailed compliance audit against industry standards',
      sections: ['Introduction', 'Audit Scope', 'Procedures', 'Findings', 'Recommendations', 'Investment'],
      estimatedHours: 60,
      basePrice: 25000,
    },
    {
      templateId: 'template-003',
      name: 'Risk Assessment',
      description: 'Risk identification and assessment',
      sections: ['Overview', 'Risk Identification', 'Analysis', 'Mitigation Strategies', 'Implementation Plan', 'Investment'],
      estimatedHours: 30,
      basePrice: 12000,
    },
  ];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Proposal Generator Agent (C-04)',
      description: 'Generates compliance assessment proposals from templates and tracks conversion',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();

    const mockProposals: ProposalDocument[] = [
      {
        proposalId: 'prop-001',
        dealId: 'deal-001',
        companyName: 'CloudTech Solutions',
        companyId: 'company-001',
        contactName: 'John Smith',
        contactEmail: 'john.smith@cloudtech.io',
        templateUsed: 'GRC Assessment',
        title: 'GRC Assessment Proposal - CloudTech Solutions',
        sections: [
          {
            sectionId: 'sec-001-1',
            title: 'Executive Summary',
            content: 'This proposal outlines our GRC assessment services for CloudTech Solutions.',
            order: 1,
          },
          {
            sectionId: 'sec-001-2',
            title: 'Scope & Objectives',
            content: 'Assessment of current GRC maturity and compliance posture.',
            order: 2,
          },
          {
            sectionId: 'sec-001-3',
            title: 'Methodology',
            content: 'Using industry-standard assessment frameworks and tools.',
            order: 3,
          },
          {
            sectionId: 'sec-001-4',
            title: 'Deliverables',
            content: 'Comprehensive assessment report with recommendations.',
            order: 4,
          },
          {
            sectionId: 'sec-001-5',
            title: 'Timeline',
            content: '8 weeks to complete assessment and report.',
            order: 5,
          },
          {
            sectionId: 'sec-001-6',
            title: 'Investment',
            content: '$15,000 for complete assessment.',
            order: 6,
          },
        ],
        estimatedValue: 15000,
        scope: 'Complete GRC framework assessment',
        timeline: '8 weeks',
        deliverables: ['Assessment Report', 'Risk Register', 'Action Plan'],
        status: 'sent',
        sentDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        proposalId: 'prop-002',
        dealId: 'deal-002',
        companyName: 'FinServ Corp',
        companyId: 'company-002',
        contactName: 'Sarah Johnson',
        contactEmail: 'sarah.johnson@finserv.com',
        templateUsed: 'Compliance Audit',
        title: 'Compliance Audit Proposal - FinServ Corp',
        sections: [
          {
            sectionId: 'sec-002-1',
            title: 'Introduction',
            content: 'We are pleased to propose our comprehensive compliance audit services.',
            order: 1,
          },
          {
            sectionId: 'sec-002-2',
            title: 'Audit Scope',
            content: 'Assessment against SOC 2, ISO 27001, and regulatory standards.',
            order: 2,
          },
          {
            sectionId: 'sec-002-3',
            title: 'Procedures',
            content: 'Review of policies, procedures, and control implementations.',
            order: 3,
          },
          {
            sectionId: 'sec-002-4',
            title: 'Findings',
            content: 'Detailed findings and gap analysis.',
            order: 4,
          },
          {
            sectionId: 'sec-002-5',
            title: 'Recommendations',
            content: 'Remediation recommendations with implementation guidance.',
            order: 5,
          },
          {
            sectionId: 'sec-002-6',
            title: 'Investment',
            content: '$25,000 for complete compliance audit.',
            order: 6,
          },
        ],
        estimatedValue: 25000,
        scope: 'Comprehensive compliance audit',
        timeline: '12 weeks',
        deliverables: ['Audit Report', 'Findings Summary', 'Remediation Plan'],
        status: 'reviewed',
        sentDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        reviewedDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        proposalId: 'prop-003',
        dealId: 'deal-003',
        companyName: 'HealthCare Innovations',
        companyId: 'company-003',
        contactName: 'Michael Chen',
        contactEmail: 'michael.chen@healthcare-inv.com',
        templateUsed: 'Risk Assessment',
        title: 'Risk Assessment Proposal - HealthCare Innovations',
        sections: [
          {
            sectionId: 'sec-003-1',
            title: 'Overview',
            content: 'Risk assessment for healthcare compliance and operational resilience.',
            order: 1,
          },
          {
            sectionId: 'sec-003-2',
            title: 'Risk Identification',
            content: 'Comprehensive risk identification across all business processes.',
            order: 2,
          },
          {
            sectionId: 'sec-003-3',
            title: 'Analysis',
            content: 'Quantitative and qualitative risk analysis.',
            order: 3,
          },
          {
            sectionId: 'sec-003-4',
            title: 'Mitigation Strategies',
            content: 'Risk mitigation strategies tailored to healthcare requirements.',
            order: 4,
          },
          {
            sectionId: 'sec-003-5',
            title: 'Implementation Plan',
            content: 'Phased implementation roadmap.',
            order: 5,
          },
          {
            sectionId: 'sec-003-6',
            title: 'Investment',
            content: '$12,000 for complete risk assessment.',
            order: 6,
          },
        ],
        estimatedValue: 12000,
        scope: 'Risk identification and assessment',
        timeline: '6 weeks',
        deliverables: ['Risk Register', 'Risk Heat Map', 'Mitigation Plans'],
        status: 'draft',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        proposalId: 'prop-004',
        dealId: 'deal-004',
        companyName: 'TechVenture Inc',
        companyId: 'company-005',
        contactName: 'Robert Park',
        contactEmail: 'robert.park@techventure.com',
        templateUsed: 'GRC Assessment',
        title: 'GRC Assessment Proposal - TechVenture Inc',
        sections: [
          {
            sectionId: 'sec-004-1',
            title: 'Executive Summary',
            content: 'GRC assessment for TechVenture startup operations.',
            order: 1,
          },
          {
            sectionId: 'sec-004-2',
            title: 'Scope & Objectives',
            content: 'Assessment of governance, risk, and compliance maturity.',
            order: 2,
          },
          {
            sectionId: 'sec-004-3',
            title: 'Methodology',
            content: 'Agile assessment framework suitable for startups.',
            order: 3,
          },
          {
            sectionId: 'sec-004-4',
            title: 'Deliverables',
            content: 'Quick-start GRC framework and action plan.',
            order: 4,
          },
          {
            sectionId: 'sec-004-5',
            title: 'Timeline',
            content: '4 weeks to complete assessment.',
            order: 5,
          },
          {
            sectionId: 'sec-004-6',
            title: 'Investment',
            content: '$15,000 for complete assessment.',
            order: 6,
          },
        ],
        estimatedValue: 15000,
        scope: 'Startup GRC assessment',
        timeline: '4 weeks',
        deliverables: ['Assessment Report', 'GRC Roadmap', 'Implementation Guide'],
        status: 'accepted',
        sentDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        reviewedDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
        acceptedDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        proposalId: 'prop-005',
        dealId: 'deal-005',
        companyName: 'GlobalRetail Group',
        companyId: 'company-006',
        contactName: 'Jessica Martinez',
        contactEmail: 'jessica.martinez@globalretail.com',
        templateUsed: 'Compliance Audit',
        title: 'Compliance Audit Proposal - GlobalRetail Group',
        sections: [
          {
            sectionId: 'sec-005-1',
            title: 'Introduction',
            content: 'Compliance audit proposal for retail operations.',
            order: 1,
          },
          {
            sectionId: 'sec-005-2',
            title: 'Audit Scope',
            content: 'Assessment of PCI-DSS, GDPR, and retail-specific regulations.',
            order: 2,
          },
          {
            sectionId: 'sec-005-3',
            title: 'Procedures',
            content: 'Comprehensive controls review and testing.',
            order: 3,
          },
          {
            sectionId: 'sec-005-4',
            title: 'Findings',
            content: 'Detailed findings report.',
            order: 4,
          },
          {
            sectionId: 'sec-005-5',
            title: 'Recommendations',
            content: 'Remediation guidance.',
            order: 5,
          },
          {
            sectionId: 'sec-005-6',
            title: 'Investment',
            content: '$20,000 for compliance audit.',
            order: 6,
          },
        ],
        estimatedValue: 20000,
        scope: 'Retail compliance audit',
        timeline: '10 weeks',
        deliverables: ['Audit Report', 'Findings', 'Remediation Plan'],
        status: 'rejected',
        sentDate: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
        reviewedDate: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
        rejectedDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 52 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const proposal of mockProposals) {
      this.proposals.set(proposal.proposalId, proposal);
    }
  }

  /**
   * Collect proposal data
   */
  async collectData(): Promise<ProposalRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      proposals: Array.from(this.proposals.values()),
    };
  }

  /**
   * Process data to calculate proposal metrics
   */
  async processData(rawData: ProposalRawData): Promise<ProposalMetrics> {
    const proposals = rawData.proposals;

    const sentProposals = proposals.filter((p) => p.status !== 'draft').length;
    const acceptedProposals = proposals.filter((p) => p.status === 'accepted').length;
    const rejectedProposals = proposals.filter((p) => p.status === 'rejected').length;
    const draftProposals = proposals.filter((p) => p.status === 'draft').length;
    const reviewedProposals = proposals.filter((p) => p.status === 'reviewed').length;

    const acceptanceRate =
      sentProposals > 0 ? Math.round((acceptedProposals / sentProposals) * 100) : 0;
    const rejectionRate =
      sentProposals > 0 ? Math.round((rejectedProposals / sentProposals) * 100) : 0;

    const totalProposalValue = proposals.reduce((sum, p) => sum + p.estimatedValue, 0);
    const averageProposalValue =
      proposals.length > 0 ? Math.round(totalProposalValue / proposals.length) : 0;

    // Calculate average time to acceptance
    let avgTimeToAcceptance = 0;
    const acceptedWithDates = proposals.filter(
      (p) => p.status === 'accepted' && p.sentDate && p.acceptedDate
    );
    if (acceptedWithDates.length > 0) {
      const times = acceptedWithDates.map((p) =>
        Math.floor((p.acceptedDate!.getTime() - p.sentDate!.getTime()) / (1000 * 60 * 60 * 24))
      );
      avgTimeToAcceptance = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }

    // Top templates
    const templateMap = new Map<string, number>();
    proposals.forEach((p) => {
      templateMap.set(p.templateUsed, (templateMap.get(p.templateUsed) || 0) + 1);
    });

    const topTemplates = Array.from(templateMap.entries())
      .map(([template, count]) => ({ template, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalProposals: proposals.length,
      sentProposals,
      acceptedProposals,
      rejectedProposals,
      draftProposals,
      reviewedProposals,
      acceptanceRate,
      rejectionRate,
      averageProposalValue,
      totalProposalValue,
      avgTimeToAcceptance,
      topTemplates,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: ProposalMetrics): Promise<void> {
    inMemoryStore.storeProposals(Array.from(this.proposals.values()));
    inMemoryStore.storeProposalMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[ProposalGeneratorAgent] Dashboard updated with proposal metrics');
  }

  /**
   * Generate a new proposal from template
   */
  async generateProposal(
    dealId: string,
    companyName: string,
    companyId: string,
    contactName: string,
    contactEmail: string,
    templateName: string
  ): Promise<ProposalDocument> {
    const template = this.templates.find((t) => t.name === templateName) || this.templates[0];

    const now = new Date();
    const proposalId = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const sections: ProposalSection[] = template.sections.map((section, index) => ({
      sectionId: `sec-${proposalId}-${index + 1}`,
      title: section,
      content: `Content for ${section} section will be customized based on company requirements.`,
      order: index + 1,
    }));

    const proposal: ProposalDocument = {
      proposalId,
      dealId,
      companyName,
      companyId,
      contactName,
      contactEmail,
      templateUsed: templateName,
      title: `${templateName} Proposal - ${companyName}`,
      sections,
      estimatedValue: template.basePrice,
      scope: `${templateName} for ${companyName}`,
      timeline: `${template.estimatedHours / 40} weeks`,
      deliverables: ['Assessment Report', 'Recommendations', 'Implementation Guide'],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    this.proposals.set(proposalId, proposal);
    inMemoryStore.storeProposals(Array.from(this.proposals.values()));

    return proposal;
  }

  /**
   * Update proposal status
   */
  async updateProposalStatus(
    proposalId: string,
    status: 'draft' | 'sent' | 'reviewed' | 'accepted' | 'rejected'
  ): Promise<ProposalDocument | null> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      return null;
    }

    proposal.status = status;

    const now = new Date();
    if (status === 'sent' && !proposal.sentDate) {
      proposal.sentDate = now;
    } else if (status === 'reviewed' && !proposal.reviewedDate) {
      proposal.reviewedDate = now;
    } else if (status === 'accepted' && !proposal.acceptedDate) {
      proposal.acceptedDate = now;
    } else if (status === 'rejected' && !proposal.rejectedDate) {
      proposal.rejectedDate = now;
    }

    proposal.updatedAt = now;
    this.proposals.set(proposalId, proposal);
    inMemoryStore.storeProposals(Array.from(this.proposals.values()));

    return proposal;
  }

  /**
   * Update proposal section content
   */
  async updateProposalSection(
    proposalId: string,
    sectionId: string,
    content: string
  ): Promise<ProposalDocument | null> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      return null;
    }

    const section = proposal.sections.find((s) => s.sectionId === sectionId);
    if (!section) {
      return null;
    }

    section.content = content;
    proposal.updatedAt = new Date();

    this.proposals.set(proposalId, proposal);
    inMemoryStore.storeProposals(Array.from(this.proposals.values()));

    return proposal;
  }

  /**
   * Get all proposals
   */
  getProposals(): ProposalDocument[] {
    return Array.from(this.proposals.values());
  }

  /**
   * Get proposals by status
   */
  getProposalsByStatus(
    status: 'draft' | 'sent' | 'reviewed' | 'accepted' | 'rejected'
  ): ProposalDocument[] {
    return Array.from(this.proposals.values()).filter((p) => p.status === status);
  }

  /**
   * Get a single proposal
   */
  getProposal(proposalId: string): ProposalDocument | null {
    return this.proposals.get(proposalId) || null;
  }

  /**
   * Get proposals by deal
   */
  getProposalsByDeal(dealId: string): ProposalDocument[] {
    return Array.from(this.proposals.values()).filter((p) => p.dealId === dealId);
  }

  /**
   * Get proposal templates
   */
  getTemplates(): ProposalTemplate[] {
    return [...this.templates];
  }

  /**
   * Get a single template
   */
  getTemplate(templateId: string): ProposalTemplate | undefined {
    return this.templates.find((t) => t.templateId === templateId);
  }
}

/**
 * Factory function to create a ProposalGeneratorAgent instance
 */
export function createProposalGeneratorAgent(config?: Partial<AgentConfig>): ProposalGeneratorAgent {
  return new ProposalGeneratorAgent(config);
}
